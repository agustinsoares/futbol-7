-- Equipos, resultados, asistencia, valoraciones, chat, partidos recurrentes y recordatorios.

-- ─── Columnas nuevas ──────────────────────────────────────────────────────────

alter table public.match_participants
    add column team text check (team in ('A', 'B')),
    add column attended boolean,
    add column reminder_sent_at timestamptz;

alter table public.matches
    add column score_a smallint check (score_a between 0 and 99),
    add column score_b smallint check (score_b between 0 and 99),
    add column series_id uuid;

create index matches_series_id_idx on public.matches (series_id) where series_id is not null;

-- La vista de listados suma el resultado y la serie (columnas nuevas al final).
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
    (
        select count(*)::integer from public.match_participants mp
        where mp.match_id = m.id and mp.status = 'confirmed'
    ) as confirmed_count,
    (
        select count(*)::integer from public.match_participants mp
        where mp.match_id = m.id and mp.status = 'waitlisted'
    ) as waitlist_count,
    m.score_a,
    m.score_b,
    m.series_id
from public.matches m
join public.venues v on v.id = m.venue_id;

-- ─── Helpers ──────────────────────────────────────────────────────────────────

-- ¿El usuario actual puede gestionar el partido? (host o admin)
create function private.can_manage_match(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.matches m
        where m.id = p_match_id and (m.host_id = (select auth.uid()) or private.is_admin())
    );
$$;

-- ¿El usuario actual es parte del partido? (host, apuntado o admin)
create function private.is_match_member(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select private.can_manage_match(p_match_id)
        or exists (
            select 1 from public.match_participants mp
            where mp.match_id = p_match_id
              and mp.user_id = (select auth.uid())
              and mp.status in ('confirmed', 'waitlisted')
        );
$$;

grant execute on function private.can_manage_match(uuid) to anon, authenticated;
grant execute on function private.is_match_member(uuid) to anon, authenticated;

-- ─── Equipos ──────────────────────────────────────────────────────────────────

create function public.save_teams(p_match_id uuid, p_team_a uuid[], p_team_b uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select auth.uid()) is null or not private.can_manage_match(p_match_id) then
        raise exception 'Only the host can set teams' using errcode = '42501';
    end if;
    if exists (select unnest(p_team_a) intersect select unnest(p_team_b)) then
        raise exception 'A player cannot be in both teams' using errcode = '22023';
    end if;

    update public.match_participants
    set team = case
            when user_id = any (p_team_a) then 'A'
            when user_id = any (p_team_b) then 'B'
            else null
        end,
        updated_at = now()
    where match_id = p_match_id and status = 'confirmed';

    update public.match_participants set team = null
    where match_id = p_match_id and status <> 'confirmed' and team is not null;
end;
$$;

-- ─── Resultado y asistencia ───────────────────────────────────────────────────

create function public.record_result(
    p_match_id uuid,
    p_score_a integer,
    p_score_b integer,
    p_attended uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_match public.matches%rowtype;
begin
    if (select auth.uid()) is null or not private.can_manage_match(p_match_id) then
        raise exception 'Only the host can record the result' using errcode = '42501';
    end if;

    select * into v_match from public.matches where id = p_match_id for update;
    if v_match.status = 'cancelled' then
        raise exception 'This match was cancelled' using errcode = 'P0001';
    end if;
    if v_match.starts_at > now() then
        raise exception 'The match has not started yet' using errcode = 'P0001';
    end if;

    update public.matches
    set score_a = p_score_a, score_b = p_score_b, status = 'completed'
    where id = p_match_id;

    update public.match_participants
    set attended = (user_id = any (coalesce(p_attended, '{}'))), updated_at = now()
    where match_id = p_match_id and status = 'confirmed';
end;
$$;

-- ─── Valoraciones entre jugadores ─────────────────────────────────────────────

create table public.player_ratings (
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references public.matches (id) on delete cascade,
    rater_id uuid not null references public.profiles (id) on delete cascade,
    rated_id uuid not null references public.profiles (id) on delete cascade,
    score smallint not null check (score between 1 and 5),
    created_at timestamptz not null default now(),
    unique (match_id, rater_id, rated_id),
    check (rater_id <> rated_id)
);

create index player_ratings_rated_id_idx on public.player_ratings (rated_id);
create index player_ratings_rater_id_idx on public.player_ratings (rater_id);

alter table public.player_ratings enable row level security;

-- Las valoraciones individuales son privadas: cada uno ve solo las que dio.
-- En público solo se muestra la media (player_stats).
create policy "Raters see the ratings they gave"
    on public.player_ratings for select
    to authenticated
    using (rater_id = (select auth.uid()));

create function public.rate_player(p_match_id uuid, p_rated_id uuid, p_score integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_rater uuid := (select auth.uid());
begin
    if v_rater is null then
        raise exception 'You must be signed in' using errcode = '28000';
    end if;
    if v_rater = p_rated_id then
        raise exception 'You cannot rate yourself' using errcode = '22023';
    end if;
    if p_score not between 1 and 5 then
        raise exception 'Score must be between 1 and 5' using errcode = '22023';
    end if;
    if not exists (select 1 from public.matches where id = p_match_id and status = 'completed') then
        raise exception 'You can only rate players after the match' using errcode = 'P0001';
    end if;
    if (
        select count(*) from public.match_participants
        where match_id = p_match_id and status = 'confirmed' and user_id in (v_rater, p_rated_id)
    ) < 2 then
        raise exception 'Both players must have played this match' using errcode = '42501';
    end if;

    insert into public.player_ratings (match_id, rater_id, rated_id, score)
    values (p_match_id, v_rater, p_rated_id, p_score)
    on conflict (match_id, rater_id, rated_id) do update set score = excluded.score, created_at = now();
end;
$$;

-- Estadísticas públicas de un jugador.
create function public.player_stats(p_user_id uuid)
returns table (
    matches_played integer,
    no_shows integer,
    attendance_rate numeric,
    avg_rating numeric,
    ratings_count integer,
    matches_hosted integer
)
language sql
stable
security definer
set search_path = ''
as $$
    select
        (select count(*)::integer from public.match_participants mp
         join public.matches m on m.id = mp.match_id
         where mp.user_id = p_user_id and mp.status = 'confirmed' and m.status = 'completed'
           and coalesce(mp.attended, true)),
        (select count(*)::integer from public.match_participants mp
         where mp.user_id = p_user_id and mp.attended = false),
        (select round(100.0 * count(*) filter (where mp.attended) / nullif(count(*), 0), 0)
         from public.match_participants mp
         where mp.user_id = p_user_id and mp.attended is not null),
        (select round(avg(score)::numeric, 1) from public.player_ratings where rated_id = p_user_id),
        (select count(*)::integer from public.player_ratings where rated_id = p_user_id),
        (select count(*)::integer from public.matches
         where host_id = p_user_id and status = 'completed');
$$;

-- ─── Chat del partido ─────────────────────────────────────────────────────────

create table public.match_messages (
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references public.matches (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    body text not null check (char_length(btrim(body)) between 1 and 1000),
    created_at timestamptz not null default now()
);

create index match_messages_match_id_idx on public.match_messages (match_id, created_at);
create index match_messages_user_id_idx on public.match_messages (user_id);

alter table public.match_messages enable row level security;

create policy "Match members read the chat"
    on public.match_messages for select
    to authenticated
    using ((select private.is_match_member(match_id)));

create policy "Match members write in the chat"
    on public.match_messages for insert
    to authenticated
    with check (user_id = (select auth.uid()) and (select private.is_match_member(match_id)));

create policy "Authors, hosts and admins delete messages"
    on public.match_messages for delete
    to authenticated
    using (user_id = (select auth.uid()) or (select private.can_manage_match(match_id)));

-- ─── Tareas programadas (solo service_role) ───────────────────────────────────

-- Marca como jugados los partidos que terminaron hace más de 2 horas sin resultado.
create function public.complete_past_matches()
returns integer
language sql
security definer
set search_path = ''
as $$
    with done as (
        update public.matches
        set status = 'completed'
        where status in ('open', 'full')
          and starts_at + make_interval(mins => duration_minutes) + interval '2 hours' < now()
        returning 1
    )
    select count(*)::integer from done;
$$;

-- Jugadores confirmados de partidos que empiezan en las próximas 26 horas y aún sin recordatorio.
create function public.due_reminders()
returns table (
    participant_id uuid,
    email text,
    full_name text,
    locale public.app_locale,
    match_id uuid,
    title text,
    starts_at timestamptz,
    duration_minutes integer,
    venue_name text,
    venue_address text
)
language sql
stable
security definer
set search_path = ''
as $$
    select mp.id, u.email::text, p.full_name, p.locale, m.id, m.title, m.starts_at, m.duration_minutes,
           v.name, v.address
    from public.match_participants mp
    join public.matches m on m.id = mp.match_id
    join public.venues v on v.id = m.venue_id
    join public.profiles p on p.id = mp.user_id
    join auth.users u on u.id = mp.user_id
    where mp.status = 'confirmed'
      and mp.reminder_sent_at is null
      and m.status in ('open', 'full')
      and m.starts_at > now()
      and m.starts_at <= now() + interval '26 hours'
      and u.email is not null
      and u.email not like '%.test'
    order by m.starts_at;
$$;

create function public.mark_reminders_sent(p_participant_ids uuid[])
returns void
language sql
security definer
set search_path = ''
as $$
    update public.match_participants set reminder_sent_at = now() where id = any (p_participant_ids);
$$;

-- ─── Permisos de las funciones ────────────────────────────────────────────────

revoke execute on function public.save_teams(uuid, uuid[], uuid[]) from public, anon;
revoke execute on function public.record_result(uuid, integer, integer, uuid[]) from public, anon;
revoke execute on function public.rate_player(uuid, uuid, integer) from public, anon;
grant execute on function public.save_teams(uuid, uuid[], uuid[]) to authenticated;
grant execute on function public.record_result(uuid, integer, integer, uuid[]) to authenticated;
grant execute on function public.rate_player(uuid, uuid, integer) to authenticated;

grant execute on function public.player_stats(uuid) to anon, authenticated;

revoke execute on function public.complete_past_matches() from public, anon, authenticated;
revoke execute on function public.due_reminders() from public, anon, authenticated;
revoke execute on function public.mark_reminders_sent(uuid[]) from public, anon, authenticated;
grant execute on function public.complete_past_matches() to service_role;
grant execute on function public.due_reminders() to service_role;
grant execute on function public.mark_reminders_sent(uuid[]) to service_role;
