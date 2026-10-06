-- Privacidad y endurecimiento tras la revisión de seguridad (ver docs/seguridad.md).
--
-- 1. Los partidos privados ya no se pueden listar desde la API: solo se ven en listados si eres
--    host, jugador o admin. Quien tiene el enlace los abre con get_match() (el id es un UUID).
-- 2. Los nombres de los jugadores (profiles) y quién juega cada partido (match_participants)
--    solo los ven usuarios registrados. Los visitantes ven el partido y las plazas libres.
-- 3. Límites contra spam (partidos y mensajes) y validaciones que antes solo hacía la web.
-- 4. Los visitantes (anon) no tienen ningún permiso de escritura sobre las tablas.

-- ─── Helpers ──────────────────────────────────────────────────────────────────

create function private.match_is_public(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (select 1 from public.matches where id = p_match_id and visibility = 'public');
$$;

-- Plazas ocupadas de un partido, sin exponer quién las ocupa.
create function private.match_counts(p_match_id uuid)
returns table (confirmed integer, waitlisted integer)
language sql
stable
security definer
set search_path = ''
as $$
    select
        (count(*) filter (where status = 'confirmed'))::integer,
        (count(*) filter (where status = 'waitlisted'))::integer
    from public.match_participants
    where match_id = p_match_id;
$$;

revoke execute on function private.match_is_public(uuid) from public;
revoke execute on function private.match_counts(uuid) from public;
grant execute on function private.match_is_public(uuid) to anon, authenticated;
grant execute on function private.match_counts(uuid) to anon, authenticated;

-- ─── Lectura (RLS) ────────────────────────────────────────────────────────────

drop policy "Matches are visible to everyone with the id" on public.matches;
create policy "Public matches, and private ones you are part of"
    on public.matches for select
    using (visibility = 'public' or (select private.is_match_member(id)));

drop policy "Participants are visible to everyone" on public.match_participants;
create policy "Signed-in users see who plays public matches and their own"
    on public.match_participants for select
    to authenticated
    using (
        user_id = (select auth.uid())
        or (select private.match_is_public(match_id))
        or (select private.is_match_member(match_id))
    );

drop policy "Profiles are visible to everyone" on public.profiles;
create policy "Signed-in users see profiles"
    on public.profiles for select
    to authenticated
    using (true);

-- Los contadores salen de match_counts(): así los visitantes ven las plazas libres sin ver nombres.
create or replace view public.match_listings
with (security_invoker = true)
as
select
    m.id,
    m.title,
    m.format,
    m.skill_level,
    m.gender,
    m.visibility,
    m.starts_at,
    m.duration_minutes,
    m.max_players,
    m.price_per_player,
    m.status,
    m.host_id,
    v.id as venue_id,
    v.name as venue_name,
    v.area as venue_area,
    v.surface as venue_surface,
    v.lat as venue_lat,
    v.lng as venue_lng,
    c.confirmed as confirmed_count,
    c.waitlisted as waitlist_count,
    m.score_a,
    m.score_b,
    m.series_id
from public.matches m
join public.venues v on v.id = m.venue_id
cross join lateral private.match_counts(m.id) c;

-- ─── Acceso con el enlace ─────────────────────────────────────────────────────

-- Un partido por su id (también los privados: tener el enlace es el permiso).
create function public.get_match(p_match_id uuid)
returns setof public.matches
language sql
stable
security definer
set search_path = ''
as $$
    select * from public.matches where id = p_match_id;
$$;

create function public.get_match_counts(p_match_id uuid)
returns table (confirmed integer, waitlisted integer)
language sql
stable
security definer
set search_path = ''
as $$
    select * from private.match_counts(p_match_id);
$$;

-- Jugadores de un partido (con el enlace), solo para usuarios registrados.
create function public.get_match_players(p_match_id uuid)
returns table (
    user_id uuid,
    status public.participant_status,
    joined_at timestamptz,
    team text,
    attended boolean,
    full_name text,
    skill_level public.skill_level,
    preferred_position public.player_position
)
language sql
stable
security definer
set search_path = ''
as $$
    select mp.user_id, mp.status, mp.joined_at, mp.team, mp.attended,
           p.full_name, p.skill_level, p.preferred_position
    from public.match_participants mp
    join public.profiles p on p.id = mp.user_id
    where mp.match_id = p_match_id
      and mp.status in ('confirmed', 'waitlisted')
      and (select auth.uid()) is not null
    order by mp.joined_at;
$$;

revoke execute on function public.get_match(uuid) from public;
revoke execute on function public.get_match_counts(uuid) from public;
revoke execute on function public.get_match_players(uuid) from public, anon;
grant execute on function public.get_match(uuid) to anon, authenticated;
grant execute on function public.get_match_counts(uuid) to anon, authenticated;
grant execute on function public.get_match_players(uuid) to authenticated;

-- Las estadísticas de un jugador, como su perfil, solo para usuarios registrados.
revoke execute on function public.player_stats(uuid) from public, anon;

-- ─── Validación y límites contra spam ─────────────────────────────────────────

-- Partidos creados por usuarios (no por el seed ni el service role): fecha razonable,
-- estado inicial "open" y como máximo 30 al día por persona.
create function private.before_match_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select auth.uid()) is null or private.is_admin() then
        return new;
    end if;
    if new.starts_at < now() or new.starts_at > now() + interval '400 days' then
        raise exception 'The match must start in the future (within a year)' using errcode = '23514';
    end if;
    if (
        select count(*) from public.matches
        where host_id = new.host_id and created_at > now() - interval '1 day'
    ) >= 30 then
        raise exception 'Too many matches created today' using errcode = 'P0001';
    end if;
    new.status := 'open';
    new.score_a := null;
    new.score_b := null;
    return new;
end;
$$;

create trigger before_match_insert
    before insert on public.matches
    for each row execute function private.before_match_insert();

-- Chat: como máximo 10 mensajes por minuto por persona.
create function private.before_message_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (
        select count(*) from public.match_messages
        where user_id = new.user_id and created_at > now() - interval '1 minute'
    ) >= 10 then
        raise exception 'Too many messages, wait a moment' using errcode = 'P0001';
    end if;
    return new;
end;
$$;

create trigger before_message_insert
    before insert on public.match_messages
    for each row execute function private.before_message_insert();

revoke execute on function private.before_match_insert() from public, anon, authenticated;
revoke execute on function private.before_message_insert() from public, anon, authenticated;

alter table public.profiles
    add constraint profiles_avatar_url_check
    check (avatar_url is null or (char_length(avatar_url) <= 500 and avatar_url ~ '^https://'));

alter table public.matches
    add constraint matches_price_per_player_max check (price_per_player <= 10000);

-- ─── Permisos de las tablas ───────────────────────────────────────────────────

-- RLS ya bloquea estas escrituras, pero los visitantes no deberían tener ni el permiso.
revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;
