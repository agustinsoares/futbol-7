-- Pruebas manuales de RLS y de join_match/leave_match. Varios pasos deben fallar a propósito (ver los \echo).
-- Uso: psql -d <db> -f supabase/tests/rls_test.sql (después del stub, las migraciones y el seed).
\set QUIET on
\pset footer off
select id as player from auth.users where email='player@aaltofootball.test' \gset
select id as ingrid from auth.users where email='ingrid.haugland@aaltofootball.test' \gset
select id as lars from auth.users where email='lars.johannessen@aaltofootball.test' \gset
select id as m_after from public.matches where title='After-work 7-a-side' \gset
select id as m_full from matches where title='Lunchtime futsal-style 5s' \gset
select id as m_priv from matches where title like 'Friends only%' \gset
select id as m_past from matches where title='Last week''s 7s' \gset

\echo '--- 1. anon: public matches visible, private hidden'
set role anon;
select count(*) filter (where visibility='public') pub, count(*) filter (where visibility='private') priv from match_listings;
reset role;

\echo '--- 2. player cannot make self admin (expect error)'
set role authenticated; select set_config('request.jwt.claim.sub', :'player', false);
update profiles set role='admin' where id = :'player';
\echo '--- 3. player cannot create venue (expect RLS error)'
insert into venues(name,address,area,lat,lng) values ('Hack','x','x',1,1);
\echo '--- 4. player cannot edit someone else''s match (expect 0 rows)'
update matches set title='hacked' where id = :'m_after' returning id;
\echo '--- 5. join last spots: After-work 12/14'
select join_match(:'m_after') as player_join;
select join_match(:'m_after') as player_join_again_idempotent;
select set_config('request.jwt.claim.sub', :'ingrid', false);
select join_match(:'m_after') as ingrid_join;
select set_config('request.jwt.claim.sub', :'lars', false);
select join_match(:'m_after') as lars_join_should_be_waitlisted;
reset role;
select status, confirmed_count, waitlist_count from match_listings where id = :'m_after';
\echo '--- 6. ingrid leaves -> lars promoted, still full'
set role authenticated; select set_config('request.jwt.claim.sub', :'ingrid', false);
select leave_match(:'m_after');
reset role;
select p.full_name, mp.status from match_participants mp join profiles p on p.id=mp.user_id where match_id=:'m_after' and p.id in (:'ingrid', :'lars');
select status, confirmed_count, waitlist_count from match_listings where id = :'m_after';
\echo '--- 7. lars leaves -> no waitlist -> match open again'
set role authenticated; select set_config('request.jwt.claim.sub', :'lars', false);
select leave_match(:'m_after');
reset role;
select status, confirmed_count, waitlist_count from match_listings where id = :'m_after';
\echo '--- 8. join past match (expect error)'
set role authenticated; select set_config('request.jwt.claim.sub', :'player', false);
select join_match(:'m_past');
\echo '--- 9. someone outside a private match cannot see or join it (expect 0 and "Match not found")'
reset role;
select u.id as outsider from auth.users u
where u.id <> (select host_id from public.matches where id = :'m_priv')
  and u.id not in (select user_id from public.match_participants where match_id = :'m_priv')
  and u.email not like 'admin%' limit 1 \gset
set role authenticated; select set_config('request.jwt.claim.sub', :'outsider', false);
select count(*) as priv_visible from public.matches where id = :'m_priv';
select join_match(:'m_priv');
\echo '--- 10. anon cannot call join_match (expect permission denied)'
reset role; set role anon;
select join_match(:'m_after');
