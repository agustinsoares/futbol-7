-- Pruebas de equipos, resultados, valoraciones, estadísticas y chat.
-- Uso: psql -d <db> -f supabase/tests/features_test.sql (tras migraciones y seed). Algunos pasos fallan a propósito.
\set QUIET on
\pset footer off
select id as admin from auth.users where email = 'admin@aaltofootball.test' \gset
select id as player from auth.users where email = 'player@aaltofootball.test' \gset
select id as m_past, host_id as past_host from public.matches where title = 'Last week''s 7s' \gset
select id as m_up, host_id as up_host from public.matches where title = 'Indoor 5-a-side for beginners' \gset

-- Helper para actuar como un usuario.
create or replace function pg_temp.act_as(uid uuid) returns void language sql as $$
    select set_config('request.jwt.claim.sub', uid::text, false),
           set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, false);
$$;

\echo '--- 1. non-host cannot save teams (expect error)'
set role authenticated; select pg_temp.act_as(:'player');
select public.save_teams(:'m_up', '{}', '{}');
reset role;

\echo '--- 2. host saves teams (2 in A, rest in B)'
select array_agg(user_id order by joined_at) filter (where rn <= 2) as team_a,
       array_agg(user_id order by joined_at) filter (where rn > 2) as team_b
from (select user_id, joined_at, row_number() over (order by joined_at) rn
      from public.match_participants where match_id = :'m_up' and status = 'confirmed') x \gset
set role authenticated; select pg_temp.act_as(:'up_host');
select public.save_teams(:'m_up', :'team_a', :'team_b');
reset role;
select team, count(*) from public.match_participants where match_id = :'m_up' and status = 'confirmed' group by team order by team;

\echo '--- 3. host cannot record result before kick-off (expect error)'
set role authenticated; select pg_temp.act_as(:'up_host');
select public.record_result(:'m_up', 1, 0, '{}');

\echo '--- 4. host records result of past match; one player is a no-show'
select pg_temp.act_as(:'past_host');
select array_agg(user_id) filter (where rn > 1) as attended, (array_agg(user_id) filter (where rn = 1 and user_id <> :'past_host'))[1] as noshow
from (select user_id, row_number() over (order by joined_at desc) rn
      from public.match_participants where match_id = :'m_past' and status = 'confirmed') x \gset
select public.record_result(:'m_past', 5, 3, :'attended');
reset role;
select score_a, score_b, status from public.matches where id = :'m_past';
select count(*) filter (where attended) as attended, count(*) filter (where not attended) as no_shows
from public.match_participants where match_id = :'m_past';

\echo '--- 5. ratings: host rates a player; self-rating and outsiders fail'
set role authenticated; select pg_temp.act_as(:'past_host');
select public.rate_player(:'m_past', :'noshow', 2);
select public.rate_player(:'m_past', :'past_host', 5);
select pg_temp.act_as(:'player');
select public.rate_player(:'m_past', :'noshow', 5);
reset role;
\echo '--- 6. stats of the no-show player'
select * from public.player_stats(:'noshow');

\echo '--- 7. chat: member writes, outsider cannot read or write'
select u.id as outsider from auth.users u
where u.id not in (select user_id from public.match_participants where match_id = :'m_up') and u.id <> :'up_host' and u.email not like 'admin%' limit 1 \gset
set role authenticated; select pg_temp.act_as(:'up_host');
insert into public.match_messages (match_id, user_id, body) values (:'m_up', :'up_host', 'Bring bibs!') returning body;
select pg_temp.act_as(:'admin');
select count(*) as admin_sees from public.match_messages where match_id = :'m_up';
select pg_temp.act_as(:'outsider');
select count(*) as outsider_sees from public.match_messages where match_id = :'m_up';
insert into public.match_messages (match_id, user_id, body) values (:'m_up', :'outsider', 'spam');
reset role;

\echo '--- 8. cron functions are not callable by users (expect permission denied)'
set role authenticated;
select public.due_reminders();
reset role;
