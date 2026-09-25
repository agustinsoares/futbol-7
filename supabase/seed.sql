-- Datos de ejemplo para Bergen: usuarios, canchas, partidos y jugadores apuntados.
-- Idempotente: se puede ejecutar varias veces.
--
-- Los usuarios se crean con una contraseña aleatoria imposible de adivinar.
-- Para poder entrar con admin@aaltofootball.test o player@aaltofootball.test,
-- asígnales una contraseña desde el dashboard de Supabase (Authentication → Users)
-- o con: update auth.users set encrypted_password = extensions.crypt('...', extensions.gen_salt('bf')) where email = '...';
-- Las direcciones .test no reciben correo: son solo para desarrollo.

do $seed$
declare
    v_emails text[] := array[
        'admin@aaltofootball.test',
        'player@aaltofootball.test',
        'ingrid.haugland@aaltofootball.test',
        'lars.johannessen@aaltofootball.test',
        'sofie.berg@aaltofootball.test',
        'magnus.solheim@aaltofootball.test',
        'emma.nygaard@aaltofootball.test',
        'jonas.brekke@aaltofootball.test',
        'nora.fosse@aaltofootball.test',
        'henrik.dale@aaltofootball.test',
        'thea.kvamme@aaltofootball.test',
        'ole.vik@aaltofootball.test',
        'amina.hassan@aaltofootball.test',
        'mateo.garcia@aaltofootball.test',
        'kari.lunde@aaltofootball.test',
        'erik.moe@aaltofootball.test',
        'lucas.silva@aaltofootball.test',
        'maja.rong@aaltofootball.test',
        'sander.tveit@aaltofootball.test',
        'ida.aase@aaltofootball.test',
        'filip.nowak@aaltofootball.test',
        'hanna.eide@aaltofootball.test'
    ];
    v_names text[] := array[
        'Aalto Admin', 'Demo Player', 'Ingrid Haugland', 'Lars Johannessen', 'Sofie Berg', 'Magnus Solheim',
        'Emma Nygaard', 'Jonas Brekke', 'Nora Fosse', 'Henrik Dale', 'Thea Kvamme', 'Ole Vik', 'Amina Hassan',
        'Mateo García', 'Kari Lunde', 'Erik Moe', 'Lucas Silva', 'Maja Rong', 'Sander Tveit', 'Ida Aase',
        'Filip Nowak', 'Hanna Eide'
    ];
    v_levels public.skill_level[] := array['beginner', 'intermediate', 'advanced']::public.skill_level[];
    v_positions public.player_position[] :=
        array['goalkeeper', 'defender', 'midfielder', 'forward', 'any']::public.player_position[];
    v_user_ids uuid[] := '{}';
    v_id uuid;
    v_admin uuid;
    v_player uuid;
    i integer;

    -- Día de hoy en Bergen, para fijar horas locales.
    v_today timestamp := date_trunc('day', now() at time zone 'Europe/Oslo');
    v_match record;
    v_match_id uuid;
    v_take integer;
    v_offset integer;
begin
    -- ── Usuarios ──────────────────────────────────────────────────────────────
    for i in 1 .. array_length(v_emails, 1) loop
        select id into v_id from auth.users where email = v_emails[i];

        if v_id is null then
            v_id := gen_random_uuid();
            insert into auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                confirmation_token, email_change, email_change_token_new, recovery_token
            ) values (
                '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_emails[i],
                extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')), now(),
                '{"provider": "email", "providers": ["email"]}',
                jsonb_build_object('full_name', v_names[i], 'locale', case when i % 3 = 0 then 'nb' else 'en' end),
                now(), now(), '', '', '', ''
            );
            insert into auth.identities (
                id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
            ) values (
                gen_random_uuid(), v_id, v_id::text, 'email',
                jsonb_build_object('sub', v_id::text, 'email', v_emails[i], 'email_verified', true),
                now(), now(), now()
            );
        end if;

        -- El trigger on_auth_user_created ya creó el perfil; completamos datos.
        update public.profiles
        set full_name = v_names[i],
            skill_level = v_levels[1 + (i % 3)],
            preferred_position = v_positions[1 + (i % 5)],
            role = case when i = 1 then 'admin'::public.user_role else 'user'::public.user_role end
        where id = v_id;

        v_user_ids := v_user_ids || v_id;
    end loop;

    v_admin := v_user_ids[1];
    v_player := v_user_ids[2];

    -- ── Canchas ───────────────────────────────────────────────────────────────
    -- Coordenadas aproximadas: revisar antes de usarlas en un mapa en producción.
    insert into public.venues (name, address, area, lat, lng, surface, has_changing_rooms, has_lights, notes, created_by)
    values
        ('Stemmemyren kunstgress', 'Stemmemyren, 5063 Bergen', 'Årstad', 60.3680, 5.3590, 'artificial_turf', true, true,
         'Full-size artificial turf pitch, can be split into 7-a-side.', v_admin),
        ('Slettebakken kunstgress', 'Slettebakken, 5082 Bergen', 'Årstad', 60.3705, 5.3490, 'artificial_turf', false, true,
         null, v_admin),
        ('Frescohallen', 'Fana stadion, 5244 Fana', 'Fana', 60.3180, 5.3350, 'indoor', true, true,
         'Indoor football hall. Great for the rainy months.', v_admin),
        ('Fana stadion', 'Fana stadion, 5244 Fana', 'Fana', 60.3195, 5.3370, 'artificial_turf', true, true,
         null, v_admin),
        ('Åsane Arena', 'Åsane, 5116 Ulset', 'Åsane', 60.4660, 5.3220, 'artificial_turf', true, true,
         null, v_admin),
        ('Sandviken kunstgress', 'Sandviken, 5035 Bergen', 'Sandviken', 60.4100, 5.3250, 'artificial_turf', false, true,
         null, v_admin),
        ('Fyllingsdalen kunstgress', 'Fyllingsdalen, 5146 Fyllingsdalen', 'Fyllingsdalen', 60.3520, 5.2900,
         'artificial_turf', true, true, null, v_admin)
    on conflict (name, city) do nothing;

    -- ── Partidos ──────────────────────────────────────────────────────────────
    -- Solo si todavía no hay partidos, para no duplicarlos al re-ejecutar.
    if exists (select 1 from public.matches) then
        return;
    end if;

    for v_match in
        select * from (values
            -- venue, título, formato, nivel, género, visibilidad, días, hora local, duración, plazas, precio, apuntados, host (índice), estado
            ('Stemmemyren kunstgress', 'After-work 7-a-side', '7v7', 'intermediate', 'mixed', 'public', 1, time '18:30', 60, 14, 80, 12, 1, 'open'),
            ('Frescohallen', 'Indoor 5-a-side for beginners', '5v5', 'beginner', 'mixed', 'public', 2, time '20:00', 60, 10, 100, 5, 3, 'open'),
            ('Åsane Arena', 'Big-pitch 11-a-side', '11v11', 'advanced', 'mixed', 'public', 3, time '11:00', 90, 22, 60, 20, 4, 'open'),
            ('Slettebakken kunstgress', 'Women''s kickabout', '7v7', 'beginner', 'women', 'public', 4, time '19:00', 60, 14, 50, 6, 5, 'open'),
            ('Sandviken kunstgress', 'Morning 7s', '7v7', 'intermediate', 'mixed', 'public', 5, time '10:00', 60, 14, 70, 9, 2, 'open'),
            ('Fana stadion', 'Fana 9-a-side', '9v9', 'intermediate', 'mixed', 'public', 6, time '18:00', 75, 18, 70, 13, 1, 'open'),
            ('Frescohallen', 'Lunchtime futsal-style 5s', '5v5', 'advanced', 'men', 'public', 7, time '12:00', 60, 10, 110, 10, 6, 'full'),
            ('Fyllingsdalen kunstgress', 'Friends only: birthday match', '7v7', 'intermediate', 'mixed', 'private', 8, time '17:00', 90, 14, 0, 8, 2, 'open'),
            ('Stemmemyren kunstgress', 'Late-night 7-a-side', '7v7', 'advanced', 'mixed', 'public', 10, time '20:00', 60, 14, 80, 4, 7, 'open'),
            ('Åsane Arena', 'Beginners welcome 7s', '7v7', 'beginner', 'mixed', 'public', 12, time '18:00', 60, 14, 60, 2, 1, 'open'),
            ('Sandviken kunstgress', 'Rained off', '7v7', 'intermediate', 'mixed', 'public', 2, time '19:00', 60, 14, 70, 7, 8, 'cancelled'),
            ('Slettebakken kunstgress', 'Last week''s 7s', '7v7', 'intermediate', 'mixed', 'public', -5, time '18:30', 60, 14, 70, 14, 1, 'completed')
        ) as t(venue, title, format, level, gender, visibility, days, local_time, duration, max_players, price, taken, host_idx, status)
    loop
        insert into public.matches (
            venue_id, host_id, title, description, format, skill_level, gender, visibility,
            starts_at, duration_minutes, max_players, price_per_player, status
        ) values (
            (select id from public.venues where name = v_match.venue and city = 'Bergen'),
            v_user_ids[v_match.host_idx],
            v_match.title,
            'Bring a light and a dark shirt. Pay the host at the pitch.',
            v_match.format::public.match_format,
            v_match.level::public.skill_level,
            v_match.gender::public.match_gender,
            v_match.visibility::public.match_visibility,
            ((v_today + make_interval(days => v_match.days) + v_match.local_time) at time zone 'Europe/Oslo'),
            v_match.duration,
            v_match.max_players,
            nullif(v_match.price, 0),
            v_match.status::public.match_status
        )
        returning id into v_match_id;

        -- Apunta al host y a otros jugadores hasta completar "taken" confirmados.
        -- Rotamos el punto de partida para que cada partido tenga gente distinta.
        v_offset := (abs(hashtext(v_match.title)) % array_length(v_user_ids, 1));
        v_take := 0;
        insert into public.match_participants (match_id, user_id, status, joined_at)
        values (v_match_id, v_user_ids[v_match.host_idx], 'confirmed', now() - interval '3 days');
        v_take := 1;

        for i in 0 .. array_length(v_user_ids, 1) - 1 loop
            exit when v_take >= least(v_match.taken, array_length(v_user_ids, 1));
            v_id := v_user_ids[1 + ((v_offset + i) % array_length(v_user_ids, 1))];
            continue when v_id = v_user_ids[v_match.host_idx] or v_id = v_player;
            insert into public.match_participants (match_id, user_id, status, joined_at)
            values (v_match_id, v_id, 'confirmed', now() - make_interval(hours => 48 - v_take));
            v_take := v_take + 1;
        end loop;
    end loop;

    -- El jugador demo está en un partido y en la lista de espera de otro (que está lleno).
    insert into public.match_participants (match_id, user_id, status, joined_at)
    select id, v_player, 'confirmed', now() - interval '1 day'
    from public.matches where title = 'Indoor 5-a-side for beginners';

    insert into public.match_participants (match_id, user_id, status, joined_at)
    select id, v_player, 'waitlisted', now() - interval '2 hours'
    from public.matches where title = 'Lunchtime futsal-style 5s';
end;
$seed$;
