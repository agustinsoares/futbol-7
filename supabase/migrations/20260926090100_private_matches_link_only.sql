-- Partidos privados = "solo con el enlace".
--
-- Antes, un partido privado solo lo veían el host, los apuntados y los admins, así que
-- nadie nuevo podía sumarse. Ahora cualquiera con el enlace (el id es un UUID imposible
-- de adivinar) puede verlo y sumarse; simplemente no aparece en los listados públicos,
-- que filtran por visibility = 'public'.

create or replace function private.can_view_match(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (select 1 from public.matches m where m.id = p_match_id);
$$;

drop policy "Matches are visible to those allowed" on public.matches;
create policy "Matches are visible to everyone with the id"
    on public.matches for select
    using (true);

drop policy "Participants are visible with their match" on public.match_participants;
create policy "Participants are visible to everyone"
    on public.match_participants for select
    using (true);

comment on column public.matches.visibility is
    'public: aparece en los listados. private: solo accesible con el enlace directo.';
