-- Pruebas de privacidad y límites (migración privacy_and_hardening). Algunos pasos fallan a propósito.
-- Uso: psql -d <db> -f supabase/tests/privacy_test.sql (tras el stub, las migraciones y el seed).
\set QUIET on
\pset footer off
select id as player from auth.users where email = 'player@aaltofootball.test' \gset
select id as m_priv, host_id as priv_host from public.matches where title like 'Friends only%' \gset
select id as m_pub from public.matches where visibility = 'public' and status = 'open' limit 1 \gset
select id as venue from public.venues limit 1 \gset
select u.id as outsider from auth.users u
where u.id not in (select user_id from public.match_participants where match_id = :'m_priv')
  and u.id <> :'priv_host' and u.email not like 'admin%' limit 1 \gset

\echo '--- 1. anon: only public matches, no players, no profiles, but spot counts work'
set role anon;
select count(*) filter (where visibility = 'private') as private_rows from public.matches;
select count(*) as participant_rows from public.match_participants;
select count(*) as profile_rows from public.profiles;
select confirmed_count > 0 as counts_visible from public.match_listings where id = :'m_pub';
select count(*) as private_by_link from public.get_match(:'m_priv');
select confirmed >= 0 as counts_by_link from public.get_match_counts(:'m_priv');
\echo '--- 2. anon cannot read player lists or stats (expect permission denied x2)'
select * from public.get_match_players(:'m_priv');
select * from public.player_stats(:'player');
\echo '--- 3. anon cannot write anything (expect permission denied)'
insert into public.match_messages (match_id, user_id, body) values (:'m_pub', :'player', 'x');
reset role;

\echo '--- 4. signed-in outsider: private match not listable, but reachable by link'
set role authenticated;
select set_config('request.jwt.claim.sub', :'outsider', false);
select count(*) as private_listed from public.matches where id = :'m_priv';
select count(*) as private_participants from public.match_participants where match_id = :'m_priv';
select count(*) as by_link from public.get_match(:'m_priv');
select count(*) > 0 as players_by_link from public.get_match_players(:'m_priv');
select count(*) > 0 as public_players from public.match_participants where match_id = :'m_pub';

\echo '--- 5. host sees their private match in listings'
select set_config('request.jwt.claim.sub', :'priv_host', false);
select count(*) as host_sees from public.match_listings where id = :'m_priv';

\echo '--- 6. matches in the past or with a fake result are rejected / reset'
select set_config('request.jwt.claim.sub', :'player', false);
insert into public.matches (host_id, venue_id, title, format, skill_level, starts_at, max_players)
values (:'player', :'venue', 'Past match', '7v7', 'beginner', now() - interval '1 day', 14);
insert into public.matches (host_id, venue_id, title, format, skill_level, starts_at, max_players, status, score_a)
values (:'player', :'venue', 'Sneaky', '7v7', 'beginner', now() + interval '2 days', 14, 'completed', 9)
returning status, score_a;

\echo '--- 7. spam: the 11th chat message in a minute fails (expect 1 error)'
select set_config('request.jwt.claim.sub', :'priv_host', false);
do $$
declare i int;
begin
    for i in 1..10 loop
        insert into public.match_messages (match_id, user_id, body)
        values ((select id from public.matches where title like 'Friends only%'), auth.uid(), 'msg ' || i);
    end loop;
end $$;
insert into public.match_messages (match_id, user_id, body) values (:'m_priv', :'priv_host', 'one too many');

\echo '--- 8. avatar_url must be a short https URL (expect check violation)'
update public.profiles set avatar_url = 'javascript:alert(1)' where id = :'priv_host';
reset role;
