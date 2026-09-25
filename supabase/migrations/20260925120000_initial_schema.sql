-- Aalto Football: esquema inicial.
-- Perfiles de usuario, canchas (venues), partidos y jugadores apuntados, con RLS.

-- ─── Tipos ────────────────────────────────────────────────────────────────────

create type public.user_role as enum ('user', 'admin');
create type public.skill_level as enum ('beginner', 'intermediate', 'advanced');
create type public.player_position as enum ('goalkeeper', 'defender', 'midfielder', 'forward', 'any');
create type public.app_locale as enum ('en', 'nb');
create type public.venue_surface as enum ('artificial_turf', 'grass', 'indoor');
create type public.match_format as enum ('5v5', '7v7', '9v9', '11v11');
create type public.match_gender as enum ('mixed', 'men', 'women');
create type public.match_status as enum ('open', 'full', 'cancelled', 'completed');
create type public.match_visibility as enum ('public', 'private');
create type public.participant_status as enum ('confirmed', 'waitlisted', 'cancelled');

-- ─── Perfiles ─────────────────────────────────────────────────────────────────

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text not null default '' check (char_length(full_name) <= 80),
    avatar_url text,
    role public.user_role not null default 'user',
    skill_level public.skill_level,
    preferred_position public.player_position,
    locale public.app_locale not null default 'en',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos públicos de cada usuario (1:1 con auth.users).';

-- ¿El usuario actual es admin? SECURITY DEFINER para no disparar RLS de profiles
-- dentro de las propias políticas de profiles (evita recursión infinita).
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles
        where id = (select auth.uid()) and role = 'admin'
    );
$$;

-- Crea el perfil al registrarse un usuario.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name, avatar_url, locale)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
        new.raw_user_meta_data ->> 'avatar_url',
        case when new.raw_user_meta_data ->> 'locale' = 'nb' then 'nb'::public.app_locale else 'en'::public.app_locale end
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Un usuario logueado no puede cambiarse el rol; solo un admin puede.
-- Sin usuario en la sesión (SQL editor, service role, migraciones) sí se permite.
create function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.role is distinct from old.role
       and (select auth.uid()) is not null
       and not public.is_admin() then
        raise exception 'Only admins can change roles' using errcode = '42501';
    end if;
    new.updated_at := now();
    return new;
end;
$$;

create trigger profiles_before_update
    before update on public.profiles
    for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;

create policy "Profiles are visible to everyone"
    on public.profiles for select
    using (true);

create policy "Users update their own profile"
    on public.profiles for update
    to authenticated
    using (id = (select auth.uid()) or (select public.is_admin()))
    with check (id = (select auth.uid()) or (select public.is_admin()));

-- ─── Canchas ──────────────────────────────────────────────────────────────────

create table public.venues (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 2 and 120),
    address text not null,
    area text not null,
    city text not null default 'Bergen',
    lat double precision not null check (lat between -90 and 90),
    lng double precision not null check (lng between -180 and 180),
    surface public.venue_surface not null default 'artificial_turf',
    has_changing_rooms boolean not null default false,
    has_lights boolean not null default true,
    notes text,
    created_by uuid references public.profiles (id) on delete set null,
    created_at timestamptz not null default now(),
    unique (name, city)
);

create index venues_created_by_idx on public.venues (created_by);

alter table public.venues enable row level security;

create policy "Venues are visible to everyone"
    on public.venues for select
    using (true);

create policy "Admins manage venues"
    on public.venues for all
    to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

-- ─── Partidos ─────────────────────────────────────────────────────────────────

create table public.matches (
    id uuid primary key default gen_random_uuid(),
    venue_id uuid not null references public.venues (id) on delete restrict,
    host_id uuid not null references public.profiles (id) on delete cascade,
    title text not null check (char_length(title) between 3 and 120),
    description text check (char_length(description) <= 2000),
    format public.match_format not null,
    skill_level public.skill_level not null default 'intermediate',
    gender public.match_gender not null default 'mixed',
    visibility public.match_visibility not null default 'public',
    starts_at timestamptz not null,
    duration_minutes integer not null default 60 check (duration_minutes between 30 and 240),
    max_players integer not null check (max_players between 2 and 30),
    -- Informativo: los pagos online están desactivados, se paga en la cancha.
    price_per_player numeric(8, 2) check (price_per_player >= 0),
    status public.match_status not null default 'open',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index matches_starts_at_idx on public.matches (starts_at) where status in ('open', 'full');
create index matches_venue_id_idx on public.matches (venue_id);
create index matches_host_id_idx on public.matches (host_id);

-- ─── Jugadores apuntados ──────────────────────────────────────────────────────

create table public.match_participants (
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references public.matches (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    status public.participant_status not null default 'confirmed',
    joined_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (match_id, user_id)
);

create index match_participants_user_id_idx on public.match_participants (user_id);
create index match_participants_match_status_idx on public.match_participants (match_id, status, joined_at);

-- Un partido es visible si es público, o si eres el host, estás apuntado o eres admin.
-- SECURITY DEFINER para poder consultar match_participants sin recursión de RLS.
create function public.can_view_match(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.matches m
        where m.id = p_match_id
          and (
              m.visibility = 'public'
              or m.host_id = (select auth.uid())
              or public.is_admin()
              or exists (
                  select 1 from public.match_participants mp
                  where mp.match_id = m.id and mp.user_id = (select auth.uid())
              )
          )
    );
$$;

alter table public.matches enable row level security;

create policy "Matches are visible to those allowed"
    on public.matches for select
    using (visibility = 'public' or (select public.can_view_match(id)));

create policy "Signed-in users create matches as host"
    on public.matches for insert
    to authenticated
    with check (host_id = (select auth.uid()));

create policy "Hosts and admins update matches"
    on public.matches for update
    to authenticated
    using (host_id = (select auth.uid()) or (select public.is_admin()))
    with check (host_id = (select auth.uid()) or (select public.is_admin()));

create policy "Hosts and admins delete matches"
    on public.matches for delete
    to authenticated
    using (host_id = (select auth.uid()) or (select public.is_admin()));

alter table public.match_participants enable row level security;

-- Las altas y bajas se hacen solo con join_match / leave_match (ver siguiente migración).
create policy "Participants are visible with their match"
    on public.match_participants for select
    using ((select public.can_view_match(match_id)));

create policy "Admins manage participants"
    on public.match_participants for all
    to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

-- ─── Vista para listados ──────────────────────────────────────────────────────

create view public.match_listings
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
    ) as waitlist_count
from public.matches m
join public.venues v on v.id = m.venue_id;

comment on view public.match_listings is 'Partidos con cancha y plazas ocupadas. Respeta el RLS de las tablas.';
