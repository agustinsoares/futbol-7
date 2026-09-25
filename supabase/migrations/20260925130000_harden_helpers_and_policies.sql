-- Endurecimiento según el asesor de seguridad y rendimiento de Supabase.
--
-- 1. is_admin() y can_view_match() las usan las políticas RLS, pero no deben poder
--    llamarse desde la API (/rest/v1/rpc). Se mueven al esquema "private", que PostgREST no expone.
-- 2. Las políticas "for all" de admin se solapaban con las de lectura (dos políticas
--    permisivas para SELECT). Se separan en insert/update/delete.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;
alter function public.can_view_match(uuid) set schema private;

-- Las políticas apuntan a las funciones por OID y siguen funcionando;
-- los cuerpos que las llaman por nombre hay que actualizarlos.

create or replace function private.can_view_match(p_match_id uuid)
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
              or private.is_admin()
              or exists (
                  select 1 from public.match_participants mp
                  where mp.match_id = m.id and mp.user_id = (select auth.uid())
              )
          )
    );
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.role is distinct from old.role
       and (select auth.uid()) is not null
       and not private.is_admin() then
        raise exception 'Only admins can change roles' using errcode = '42501';
    end if;
    new.updated_at := now();
    return new;
end;
$$;

create or replace function public.join_match(p_match_id uuid)
returns public.participant_status
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := (select auth.uid());
    v_match public.matches%rowtype;
    v_confirmed integer;
    v_current public.participant_status;
    v_new_status public.participant_status;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to join a match' using errcode = '28000';
    end if;

    select * into v_match from public.matches where id = p_match_id for update;

    if not found or not private.can_view_match(p_match_id) then
        raise exception 'Match not found' using errcode = 'P0002';
    end if;
    if v_match.status in ('cancelled', 'completed') or v_match.starts_at <= now() then
        raise exception 'This match is no longer accepting players' using errcode = 'P0001';
    end if;

    select status into v_current
    from public.match_participants
    where match_id = p_match_id and user_id = v_user_id;

    if v_current in ('confirmed', 'waitlisted') then
        return v_current; -- ya estaba apuntado: idempotente
    end if;

    select count(*) into v_confirmed
    from public.match_participants
    where match_id = p_match_id and status = 'confirmed';

    v_new_status := case when v_confirmed < v_match.max_players then 'confirmed' else 'waitlisted' end;

    insert into public.match_participants (match_id, user_id, status, joined_at)
    values (p_match_id, v_user_id, v_new_status, now())
    on conflict (match_id, user_id)
    do update set status = excluded.status, joined_at = excluded.joined_at, updated_at = now();

    if v_new_status = 'confirmed' and v_confirmed + 1 >= v_match.max_players then
        update public.matches set status = 'full', updated_at = now() where id = p_match_id;
    end if;

    return v_new_status;
end;
$$;

-- Solo las políticas (evaluadas como anon/authenticated) necesitan ejecutar estas funciones.
revoke execute on function private.is_admin() from public;
revoke execute on function private.can_view_match(uuid) from public;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.can_view_match(uuid) to anon, authenticated;

-- ─── Políticas de admin sin solapamiento con las de lectura ───────────────────

drop policy "Admins manage venues" on public.venues;

create policy "Admins create venues"
    on public.venues for insert
    to authenticated
    with check ((select private.is_admin()));

create policy "Admins update venues"
    on public.venues for update
    to authenticated
    using ((select private.is_admin()))
    with check ((select private.is_admin()));

create policy "Admins delete venues"
    on public.venues for delete
    to authenticated
    using ((select private.is_admin()));

drop policy "Admins manage participants" on public.match_participants;

create policy "Admins add participants"
    on public.match_participants for insert
    to authenticated
    with check ((select private.is_admin()));

create policy "Admins update participants"
    on public.match_participants for update
    to authenticated
    using ((select private.is_admin()))
    with check ((select private.is_admin()));

create policy "Admins remove participants"
    on public.match_participants for delete
    to authenticated
    using ((select private.is_admin()));
