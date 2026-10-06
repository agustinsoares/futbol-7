-- Panel de administración: estadísticas del sitio y gestión de administradores.
-- Todas las funciones comprueban private.is_admin(); los emails salen de auth.users.

-- ─── Usuarios ─────────────────────────────────────────────────────────────────

create function public.admin_list_users(p_search text default null)
returns table (
    id uuid,
    full_name text,
    email text,
    role public.user_role,
    created_at timestamptz,
    last_sign_in_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    if (select auth.uid()) is null or not private.is_admin() then
        raise exception 'Only admins can list users' using errcode = '42501';
    end if;

    return query
    select p.id, p.full_name, u.email::text, p.role, p.created_at, u.last_sign_in_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(btrim(p_search), '') = ''
       or p.full_name ilike '%' || btrim(p_search) || '%'
       or u.email ilike '%' || btrim(p_search) || '%'
    order by (p.role = 'admin') desc, p.created_at desc
    limit 50;
end;
$$;

create function public.set_user_role(p_user_id uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select auth.uid()) is null or not private.is_admin() then
        raise exception 'Only admins can change roles' using errcode = '42501';
    end if;
    -- Evita quedarse sin administradores por error.
    if p_user_id = (select auth.uid()) and p_role <> 'admin' then
        raise exception 'You cannot remove your own admin role' using errcode = 'P0001';
    end if;

    update public.profiles set role = p_role where id = p_user_id;
    if not found then
        raise exception 'User not found' using errcode = 'P0002';
    end if;
end;
$$;

-- ─── Estadísticas ─────────────────────────────────────────────────────────────

create function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_result jsonb;
begin
    if (select auth.uid()) is null or not private.is_admin() then
        raise exception 'Only admins can see the stats' using errcode = '42501';
    end if;

    select jsonb_build_object(
        'users_total', (select count(*) from public.profiles),
        'users_new_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
        'users_new_30d', (select count(*) from public.profiles where created_at > now() - interval '30 days'),
        'users_active_30d', (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days'),
        'matches_upcoming', (select count(*) from public.matches where status in ('open', 'full') and starts_at > now()),
        'matches_completed', (select count(*) from public.matches where status = 'completed'),
        'matches_cancelled', (select count(*) from public.matches where status = 'cancelled'),
        'matches_created_30d', (select count(*) from public.matches where created_at > now() - interval '30 days'),
        'joins_30d', (
            select count(*) from public.match_participants
            where joined_at > now() - interval '30 days' and status in ('confirmed', 'waitlisted')
        ),
        'messages_30d', (select count(*) from public.match_messages where created_at > now() - interval '30 days'),
        'fill_rate', (
            select round(100.0 * avg(least(c.confirmed, m.max_players)::numeric / m.max_players), 0)
            from public.matches m
            cross join lateral (
                select count(*) as confirmed from public.match_participants mp
                where mp.match_id = m.id and mp.status = 'confirmed'
            ) c
            where m.status = 'completed' and m.starts_at > now() - interval '90 days'
        ),
        'no_show_rate', (
            select round(100.0 * count(*) filter (where attended = false) / nullif(count(*), 0), 0)
            from public.match_participants where attended is not null
        ),
        'top_venues', coalesce((
            select jsonb_agg(jsonb_build_object('name', t.name, 'matches', t.matches) order by t.matches desc)
            from (
                select v.name, count(*) as matches
                from public.matches m join public.venues v on v.id = m.venue_id
                where m.status <> 'cancelled'
                group by v.name
                order by count(*) desc, v.name
                limit 5
            ) t
        ), '[]'::jsonb),
        'weekly', coalesce((
            select jsonb_agg(jsonb_build_object('week', w.week, 'users', w.users, 'matches', w.matches) order by w.week)
            from (
                select
                    gs::date as week,
                    (select count(*) from public.profiles p
                     where p.created_at >= gs and p.created_at < gs + interval '7 days') as users,
                    (select count(*) from public.matches m
                     where m.starts_at >= gs and m.starts_at < gs + interval '7 days' and m.status <> 'cancelled') as matches
                from generate_series(
                    date_trunc('week', now()) - interval '7 weeks',
                    date_trunc('week', now()),
                    interval '1 week'
                ) gs
            ) w
        ), '[]'::jsonb)
    ) into v_result;

    return v_result;
end;
$$;

-- ─── Permisos ─────────────────────────────────────────────────────────────────

revoke execute on function public.admin_list_users(text) from public, anon;
revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;
revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_list_users(text) to authenticated;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;
grant execute on function public.admin_stats() to authenticated;
