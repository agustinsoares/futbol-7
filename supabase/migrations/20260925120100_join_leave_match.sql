-- Sumarse y bajarse de un partido de forma atómica.
-- Bloquea la fila del partido (FOR UPDATE) para que dos personas no ocupen la última plaza a la vez.

create function public.join_match(p_match_id uuid)
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

    if not found or not public.can_view_match(p_match_id) then
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

comment on function public.join_match is 'Apunta al usuario actual: confirmado si hay plaza, si no a la lista de espera.';

create function public.leave_match(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := (select auth.uid());
    v_match public.matches%rowtype;
    v_next_id uuid;
begin
    if v_user_id is null then
        raise exception 'You must be signed in to leave a match' using errcode = '28000';
    end if;

    select * into v_match from public.matches where id = p_match_id for update;
    if not found then
        raise exception 'Match not found' using errcode = 'P0002';
    end if;

    update public.match_participants
    set status = 'cancelled', updated_at = now()
    where match_id = p_match_id and user_id = v_user_id and status in ('confirmed', 'waitlisted');

    if not found then
        return; -- no estaba apuntado
    end if;

    -- Si se liberó una plaza confirmada, sube el primero de la lista de espera.
    select id into v_next_id
    from public.match_participants
    where match_id = p_match_id and status = 'waitlisted'
    order by joined_at
    limit 1
    for update;

    if (
        select count(*) from public.match_participants
        where match_id = p_match_id and status = 'confirmed'
    ) < v_match.max_players then
        if v_next_id is not null then
            update public.match_participants
            set status = 'confirmed', updated_at = now()
            where id = v_next_id;
        end if;

        if v_match.status = 'full' and v_next_id is null then
            update public.matches set status = 'open', updated_at = now() where id = p_match_id;
        end if;
    end if;
end;
$$;

comment on function public.leave_match is 'Da de baja al usuario actual y promueve al primero de la lista de espera.';

-- Solo usuarios logueados pueden llamar a estas funciones.
revoke execute on function public.join_match(uuid) from public, anon;
revoke execute on function public.leave_match(uuid) from public, anon;
grant execute on function public.join_match(uuid) to authenticated;
grant execute on function public.leave_match(uuid) to authenticated;

-- Las funciones auxiliares no deben ser invocables vía API por anónimos más allá de lo necesario.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;
