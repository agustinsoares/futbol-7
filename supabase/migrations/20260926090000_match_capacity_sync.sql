-- Mantiene coherentes el cupo, el estado y la lista de espera cuando un host edita un partido.
--
-- - No se puede bajar max_players por debajo de los jugadores ya confirmados.
-- - Si se sube el cupo, pasan a confirmados los primeros de la lista de espera.
-- - El estado open/full se recalcula (cancelled y completed no se tocan).
-- - Nadie más que un admin puede cambiar el host de un partido.

create function private.before_match_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_confirmed integer;
begin
    if new.host_id is distinct from old.host_id
       and (select auth.uid()) is not null
       and not private.is_admin() then
        raise exception 'Only admins can change the host of a match' using errcode = '42501';
    end if;

    if new.max_players is distinct from old.max_players then
        select count(*) into v_confirmed
        from public.match_participants
        where match_id = new.id and status = 'confirmed';

        if new.max_players < v_confirmed then
            raise exception 'max_players cannot be lower than the % confirmed players', v_confirmed
                using errcode = '23514';
        end if;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger matches_before_update
    before update on public.matches
    for each row execute function private.before_match_update();

create function private.after_match_capacity_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_confirmed integer;
    v_free integer;
begin
    if new.status in ('cancelled', 'completed') then
        return null;
    end if;

    select count(*) into v_confirmed
    from public.match_participants
    where match_id = new.id and status = 'confirmed';

    v_free := new.max_players - v_confirmed;

    if v_free > 0 then
        update public.match_participants
        set status = 'confirmed', updated_at = now()
        where id in (
            select id from public.match_participants
            where match_id = new.id and status = 'waitlisted'
            order by joined_at
            limit v_free
        );

        select count(*) into v_confirmed
        from public.match_participants
        where match_id = new.id and status = 'confirmed';
    end if;

    update public.matches
    set status = case when v_confirmed >= new.max_players then 'full'::public.match_status
                      else 'open'::public.match_status end
    where id = new.id
      and status is distinct from (case when v_confirmed >= new.max_players then 'full'::public.match_status
                                        else 'open'::public.match_status end);

    return null;
end;
$$;

create trigger matches_after_capacity_change
    after update of max_players on public.matches
    for each row
    when (new.max_players is distinct from old.max_players)
    execute function private.after_match_capacity_change();

revoke execute on function private.before_match_update() from public, anon, authenticated;
revoke execute on function private.after_match_capacity_change() from public, anon, authenticated;
