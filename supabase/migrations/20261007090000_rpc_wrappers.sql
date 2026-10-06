-- Funciones de la API sin SECURITY DEFINER en el esquema público (Security Advisor de Supabase).
--
-- Las funciones que la web llama por RPC necesitan permisos elevados (p. ej. apuntarse a un partido
-- bloquea la fila y escribe en tablas protegidas). Cada una ya comprueba quién la llama, pero el
-- linter recomienda no exponer funciones SECURITY DEFINER: la implementación pasa al esquema
-- "private" (que la API no publica) y en "public" queda un envoltorio SECURITY INVOKER con el mismo
-- nombre y argumentos. Para la web no cambia nada.

alter function public.admin_list_users(text) set schema private;
alter function public.admin_stats() set schema private;
alter function public.get_match(uuid) set schema private;
alter function public.get_match_counts(uuid) set schema private;
alter function public.get_match_players(uuid) set schema private;
alter function public.join_match(uuid) set schema private;
alter function public.leave_match(uuid) set schema private;
alter function public.player_stats(uuid) set schema private;
alter function public.rate_player(uuid, uuid, integer) set schema private;
alter function public.record_result(uuid, integer, integer, uuid[]) set schema private;
alter function public.save_teams(uuid, uuid[], uuid[]) set schema private;
alter function public.set_user_role(uuid, public.user_role) set schema private;

create function public.admin_list_users(p_search text default null)
returns table (
    id uuid,
    full_name text,
    email text,
    role public.user_role,
    created_at timestamptz,
    last_sign_in_at timestamptz
)
language sql stable security invoker set search_path = ''
as $$ select * from private.admin_list_users(p_search); $$;

create function public.admin_stats()
returns jsonb
language sql stable security invoker set search_path = ''
as $$ select private.admin_stats(); $$;

create function public.get_match(p_match_id uuid)
returns setof public.matches
language sql stable security invoker set search_path = ''
as $$ select * from private.get_match(p_match_id); $$;

create function public.get_match_counts(p_match_id uuid)
returns table (confirmed integer, waitlisted integer)
language sql stable security invoker set search_path = ''
as $$ select * from private.get_match_counts(p_match_id); $$;

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
language sql stable security invoker set search_path = ''
as $$ select * from private.get_match_players(p_match_id); $$;

create function public.join_match(p_match_id uuid)
returns public.participant_status
language sql security invoker set search_path = ''
as $$ select private.join_match(p_match_id); $$;

create function public.leave_match(p_match_id uuid)
returns void
language sql security invoker set search_path = ''
as $$ select private.leave_match(p_match_id); $$;

create function public.player_stats(p_user_id uuid)
returns table (
    matches_played integer,
    no_shows integer,
    attendance_rate numeric,
    avg_rating numeric,
    ratings_count integer,
    matches_hosted integer
)
language sql stable security invoker set search_path = ''
as $$ select * from private.player_stats(p_user_id); $$;

create function public.rate_player(p_match_id uuid, p_rated_id uuid, p_score integer)
returns void
language sql security invoker set search_path = ''
as $$ select private.rate_player(p_match_id, p_rated_id, p_score); $$;

create function public.record_result(p_match_id uuid, p_score_a integer, p_score_b integer, p_attended uuid[])
returns void
language sql security invoker set search_path = ''
as $$ select private.record_result(p_match_id, p_score_a, p_score_b, p_attended); $$;

create function public.save_teams(p_match_id uuid, p_team_a uuid[], p_team_b uuid[])
returns void
language sql security invoker set search_path = ''
as $$ select private.save_teams(p_match_id, p_team_a, p_team_b); $$;

create function public.set_user_role(p_user_id uuid, p_role public.user_role)
returns void
language sql security invoker set search_path = ''
as $$ select private.set_user_role(p_user_id, p_role); $$;

-- Permisos: los mismos que tenían las funciones originales (que conservan los suyos en "private").
revoke execute on function public.admin_list_users(text) from public, anon;
revoke execute on function public.admin_stats() from public, anon;
revoke execute on function public.get_match(uuid) from public;
revoke execute on function public.get_match_counts(uuid) from public;
revoke execute on function public.get_match_players(uuid) from public, anon;
revoke execute on function public.join_match(uuid) from public, anon;
revoke execute on function public.leave_match(uuid) from public, anon;
revoke execute on function public.player_stats(uuid) from public, anon;
revoke execute on function public.rate_player(uuid, uuid, integer) from public, anon;
revoke execute on function public.record_result(uuid, integer, integer, uuid[]) from public, anon;
revoke execute on function public.save_teams(uuid, uuid[], uuid[]) from public, anon;
revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;

grant execute on function public.get_match(uuid) to anon, authenticated;
grant execute on function public.get_match_counts(uuid) to anon, authenticated;
grant execute on function public.admin_list_users(text) to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.get_match_players(uuid) to authenticated;
grant execute on function public.join_match(uuid) to authenticated;
grant execute on function public.leave_match(uuid) to authenticated;
grant execute on function public.player_stats(uuid) to authenticated;
grant execute on function public.rate_player(uuid, uuid, integer) to authenticated;
grant execute on function public.record_result(uuid, integer, integer, uuid[]) to authenticated;
grant execute on function public.save_teams(uuid, uuid[], uuid[]) to authenticated;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;
