-- ============================================================================
-- BFFquest Multiplayer Classic Ludo & Snake Ludo — Authoritative Backend Schema
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.ludo_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  mode text not null check (mode in ('classic', 'snake')),
  max_players int not null check (max_players in (2, 4)),
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished', 'abandoned')),
  host_player_key text not null,
  players jsonb not null default '[]'::jsonb,
  board_state jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists idx_ludo_rooms_code on public.ludo_rooms (room_code);
create index if not exists idx_ludo_rooms_status on public.ludo_rooms (status);

alter table public.ludo_rooms enable row level security;

drop policy if exists "ludo_rooms_select_public" on public.ludo_rooms;
create policy "ludo_rooms_select_public"
  on public.ludo_rooms
  for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.ludo_rooms from anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ludo_rooms'
  ) then
    alter publication supabase_realtime add table public.ludo_rooms;
  end if;
exception when others then
  null;
end;
$$;

-- Helper: Generate a unique 6-character room code
create or replace function public.ludo_generate_room_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text := '';
  v_i int;
begin
  loop
    v_code := '';
    for v_i in 1..6 loop
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    end loop;
    exit when not exists (select 1 from public.ludo_rooms where room_code = v_code);
  end loop;
  return v_code;
end;
$$;

-- Helper: Initialize authoritative board state for Classic or Snake Ludo
create or replace function public.ludo_init_board_state(
  p_mode text,
  p_max_players int
)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_colors text[];
begin
  if p_max_players = 2 then
    v_colors := array['red', 'yellow'];
  else
    v_colors := array['red', 'green', 'yellow', 'blue'];
  end if;

  if p_mode = 'classic' then
    return jsonb_build_object(
      'mode', 'classic',
      'maxPlayers', p_max_players,
      'activeColors', to_jsonb(v_colors),
      'turnIndex', 0,
      'turnColor', v_colors[1],
      'phase', 'WAITING_FOR_ROLL',
      'diceValue', null,
      'consecutiveSixes', 0,
      'lastAction', 'Match ready to start.',
      'moveHistory', '[]'::jsonb,
      'finishOrder', '[]'::jsonb,
      'winnerColor', null,
      'tokens', jsonb_build_object(
        'red', jsonb_build_array(-1, -1, -1, -1),
        'green', jsonb_build_array(-1, -1, -1, -1),
        'yellow', jsonb_build_array(-1, -1, -1, -1),
        'blue', jsonb_build_array(-1, -1, -1, -1)
      )
    );
  else
    return jsonb_build_object(
      'mode', 'snake',
      'maxPlayers', p_max_players,
      'activeColors', to_jsonb(v_colors),
      'turnIndex', 0,
      'turnColor', v_colors[1],
      'phase', 'WAITING_FOR_ROLL',
      'diceValue', null,
      'consecutiveSixes', 0,
      'lastAction', 'Snake Ludo match ready to start.',
      'moveHistory', '[]'::jsonb,
      'finishOrder', '[]'::jsonb,
      'winnerColor', null,
      'positions', jsonb_build_object(
        'red', 1,
        'green', 1,
        'yellow', 1,
        'blue', 1
      )
    );
  end if;
end;
$$;

-- 1. Create a Multiplayer Ludo / Snake Ludo Room
create or replace function public.ludo_create_room(
  p_mode text,
  p_max_players int,
  p_player_key text,
  p_display_name text,
  p_avatar_url text default ''
)
returns public.ludo_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.ludo_rooms;
  v_code text;
  v_clean_name text;
  v_clean_key text;
  v_player jsonb;
begin
  if p_mode not in ('classic', 'snake') then
    raise exception 'Invalid game mode.';
  end if;
  if p_max_players not in (2, 4) then
    raise exception 'Player count must be 2 or 4.';
  end if;

  v_clean_key := left(trim(coalesce(p_player_key, '')), 80);
  if length(v_clean_key) < 6 then
    raise exception 'Invalid player session key.';
  end if;

  v_clean_name := left(coalesce(nullif(trim(p_display_name), ''), 'Player 1'), 32);
  v_code := public.ludo_generate_room_code();

  v_player := jsonb_build_object(
    'slot', 0,
    'color', 'red',
    'playerKey', v_clean_key,
    'userId', auth.uid(),
    'displayName', v_clean_name,
    'avatarUrl', left(coalesce(p_avatar_url, ''), 300),
    'ready', true,
    'connected', true,
    'joinedAt', now()
  );

  insert into public.ludo_rooms (
    room_code,
    mode,
    max_players,
    status,
    host_player_key,
    players,
    board_state
  )
  values (
    v_code,
    p_mode,
    p_max_players,
    'waiting',
    v_clean_key,
    jsonb_build_array(v_player),
    public.ludo_init_board_state(p_mode, p_max_players)
  )
  returning * into v_room;

  return v_room;
end;
$$;

grant execute on function public.ludo_create_room(text, int, text, text, text) to anon, authenticated;

-- 2. Join or Rejoin an Existing Room by Room ID or 6-Digit Room Code
create or replace function public.ludo_join_room(
  p_room_identifier text,
  p_player_key text,
  p_display_name text,
  p_avatar_url text default ''
)
returns public.ludo_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.ludo_rooms;
  v_clean_id text := trim(coalesce(p_room_identifier, ''));
  v_clean_key text := left(trim(coalesce(p_player_key, '')), 80);
  v_clean_name text := left(coalesce(nullif(trim(p_display_name), ''), 'Player'), 32);
  v_allowed_colors text[];
  v_taken_colors text[];
  v_assigned_color text := null;
  v_assigned_slot int := 0;
  v_idx int;
  v_existing_idx int := -1;
  v_elem jsonb;
  v_updated_players jsonb := '[]'::jsonb;
begin
  if length(v_clean_key) < 6 then
    raise exception 'Invalid player session key.';
  end if;

  if v_clean_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select * into v_room
    from public.ludo_rooms
    where id = v_clean_id::uuid
    for update;
  else
    select * into v_room
    from public.ludo_rooms
    where room_code = upper(v_clean_id)
    for update;
  end if;

  if not found then
    raise exception 'Room not found. Check the room code or invite link.';
  end if;

  for v_idx in 0 .. jsonb_array_length(v_room.players) - 1 loop
    v_elem := v_room.players -> v_idx;
    if (v_elem ->> 'playerKey') = v_clean_key then
      v_existing_idx := v_idx;
      v_elem := jsonb_set(v_elem, '{connected}', 'true'::jsonb);
      v_elem := jsonb_set(v_elem, '{displayName}', to_jsonb(v_clean_name));
    end if;
    v_updated_players := v_updated_players || jsonb_build_array(v_elem);
  end loop;

  if v_existing_idx >= 0 then
    update public.ludo_rooms
    set players = v_updated_players,
        updated_at = now()
    where id = v_room.id
    returning * into v_room;
    return v_room;
  end if;

  if v_room.status <> 'waiting' then
    raise exception 'This match has already started or finished.';
  end if;

  if jsonb_array_length(v_room.players) >= v_room.max_players then
    raise exception 'This room is already full.';
  end if;

  if v_room.max_players = 2 then
    v_allowed_colors := array['red', 'yellow'];
  else
    v_allowed_colors := array['red', 'green', 'yellow', 'blue'];
  end if;

  select coalesce(array_agg(p ->> 'color'), array[]::text[])
  into v_taken_colors
  from jsonb_array_elements(v_room.players) p;

  for v_idx in 1 .. array_length(v_allowed_colors, 1) loop
    if not (v_allowed_colors[v_idx] = any(v_taken_colors)) then
      v_assigned_color := v_allowed_colors[v_idx];
      v_assigned_slot := v_idx - 1;
      exit;
    end if;
  end loop;

  if v_assigned_color is null then
    raise exception 'No available colour slot in this room.';
  end if;

  v_updated_players := v_room.players || jsonb_build_array(
    jsonb_build_object(
      'slot', v_assigned_slot,
      'color', v_assigned_color,
      'playerKey', v_clean_key,
      'userId', auth.uid(),
      'displayName', v_clean_name,
      'avatarUrl', left(coalesce(p_avatar_url, ''), 300),
      'ready', true,
      'connected', true,
      'joinedAt', now()
    )
  );

  update public.ludo_rooms
  set players = v_updated_players,
      version = version + 1,
      updated_at = now()
  where id = v_room.id
  returning * into v_room;

  return v_room;
end;
$$;

grant execute on function public.ludo_join_room(text, text, text, text) to anon, authenticated;

-- 3. Toggle Ready / Start Match / Leave Room
create or replace function public.ludo_lobby_action(
  p_room_id uuid,
  p_player_key text,
  p_action text,
  p_ready boolean default true
)
returns public.ludo_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.ludo_rooms;
  v_idx int;
  v_elem jsonb;
  v_new_players jsonb := '[]'::jsonb;
  v_ready_count int := 0;
  v_is_member boolean := false;
begin
  select * into v_room
  from public.ludo_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'Room not found.';
  end if;

  if p_action = 'toggle_ready' then
    if v_room.status <> 'waiting' then
      raise exception 'Match already started.';
    end if;

    for v_idx in 0 .. jsonb_array_length(v_room.players) - 1 loop
      v_elem := v_room.players -> v_idx;
      if (v_elem ->> 'playerKey') = p_player_key then
        v_is_member := true;
        v_elem := jsonb_set(v_elem, '{ready}', to_jsonb(p_ready));
      end if;
      v_new_players := v_new_players || jsonb_build_array(v_elem);
    end loop;

    if not v_is_member then
      raise exception 'You are not a player in this room.';
    end if;

    update public.ludo_rooms
    set players = v_new_players,
        version = version + 1,
        updated_at = now()
    where id = v_room.id
    returning * into v_room;
    return v_room;

  elsif p_action = 'start' then
    if v_room.status <> 'waiting' then
      raise exception 'Match already in progress.';
    end if;
    if v_room.host_player_key <> p_player_key then
      raise exception 'Only the room host can start the game.';
    end if;
    if jsonb_array_length(v_room.players) < v_room.max_players then
      raise exception 'Waiting for all required players to join before starting.';
    end if;

    select count(*) into v_ready_count
    from jsonb_array_elements(v_room.players) p
    where coalesce((p ->> 'ready')::boolean, false) = true;

    if v_ready_count < v_room.max_players then
      raise exception 'All players must be Ready before starting.';
    end if;

    update public.ludo_rooms
    set status = 'playing',
        started_at = now(),
        board_state = jsonb_set(
          v_room.board_state,
          '{lastAction}',
          to_jsonb('Match started! Red''s turn to roll.')
        ),
        version = version + 1,
        updated_at = now()
    where id = v_room.id
    returning * into v_room;
    return v_room;

  elsif p_action = 'leave' then
    if v_room.status = 'waiting' then
      for v_idx in 0 .. jsonb_array_length(v_room.players) - 1 loop
        v_elem := v_room.players -> v_idx;
        if (v_elem ->> 'playerKey') <> p_player_key then
          v_new_players := v_new_players || jsonb_build_array(v_elem);
        end if;
      end loop;

      if jsonb_array_length(v_new_players) = 0 then
        update public.ludo_rooms
        set players = '[]'::jsonb,
            status = 'abandoned',
            version = version + 1,
            updated_at = now()
        where id = v_room.id
        returning * into v_room;
      else
        update public.ludo_rooms
        set players = v_new_players,
            host_player_key = coalesce(v_new_players -> 0 ->> 'playerKey', host_player_key),
            version = version + 1,
            updated_at = now()
        where id = v_room.id
        returning * into v_room;
      end if;
    else
      for v_idx in 0 .. jsonb_array_length(v_room.players) - 1 loop
        v_elem := v_room.players -> v_idx;
        if (v_elem ->> 'playerKey') = p_player_key then
          v_elem := jsonb_set(v_elem, '{connected}', 'false'::jsonb);
        end if;
        v_new_players := v_new_players || jsonb_build_array(v_elem);
      end loop;

      update public.ludo_rooms
      set players = v_new_players,
          version = version + 1,
          updated_at = now()
      where id = v_room.id
      returning * into v_room;
    end if;
    return v_room;
  end if;

  raise exception 'Unknown lobby action.';
end;
$$;

grant execute on function public.ludo_lobby_action(uuid, text, text, boolean) to anon, authenticated;

-- 4. Authoritative Server-Side Dice Roll & Turn / Legal-Move Validation
create or replace function public.ludo_roll_dice(
  p_room_id uuid,
  p_player_key text
)
returns public.ludo_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.ludo_rooms;
  v_state jsonb;
  v_turn_color text;
  v_turn_idx int;
  v_active_colors jsonb;
  v_num_colors int;
  v_player record;
  v_dice int;
  v_consec int;
  v_tokens jsonb;
  v_i int;
  v_step int;
  v_legal_count int := 0;
  v_next_idx int;
  v_next_color text;
  v_finish_order jsonb;
  v_loops int := 0;
  v_msg text;
  v_history jsonb;
begin
  select * into v_room
  from public.ludo_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'Room not found.';
  end if;
  if v_room.status <> 'playing' then
    raise exception 'Match is not active.';
  end if;

  v_state := v_room.board_state;
  if (v_state ->> 'phase') <> 'WAITING_FOR_ROLL' then
    raise exception 'Dice has already been rolled for this turn. Select a token to move.';
  end if;

  v_turn_color := v_state ->> 'turnColor';
  v_turn_idx := coalesce((v_state ->> 'turnIndex')::int, 0);
  v_active_colors := v_state -> 'activeColors';
  v_num_colors := jsonb_array_length(v_active_colors);
  v_finish_order := coalesce(v_state -> 'finishOrder', '[]'::jsonb);

  select * into v_player
  from jsonb_to_recordset(v_room.players) as x(color text, "playerKey" text, "displayName" text)
  where x.color = v_turn_color
  limit 1;

  if not found or v_player."playerKey" <> p_player_key then
    raise exception 'It is not your turn to roll.';
  end if;

  v_dice := floor(random() * 6 + 1)::int;
  v_consec := coalesce((v_state ->> 'consecutiveSixes')::int, 0);

  if v_room.mode = 'classic' then
    if v_dice = 6 then
      v_consec := v_consec + 1;
    else
      v_consec := 0;
    end if;

    if v_consec >= 3 then
      v_next_idx := (v_turn_idx + 1) % v_num_colors;
      v_next_color := v_active_colors ->> v_next_idx;
      v_msg := v_player."displayName" || ' rolled three consecutive 6s! Turn cancelled.';
      v_history := coalesce(v_state -> 'moveHistory', '[]'::jsonb) || jsonb_build_array(v_msg);
      if jsonb_array_length(v_history) > 20 then
        v_history := v_history - 0;
      end if;

      v_state := jsonb_set(v_state, '{diceValue}', to_jsonb(v_dice));
      v_state := jsonb_set(v_state, '{consecutiveSixes}', '0'::jsonb);
      v_state := jsonb_set(v_state, '{turnIndex}', to_jsonb(v_next_idx));
      v_state := jsonb_set(v_state, '{turnColor}', to_jsonb(v_next_color));
      v_state := jsonb_set(v_state, '{phase}', '"WAITING_FOR_ROLL"'::jsonb);
      v_state := jsonb_set(v_state, '{lastAction}', to_jsonb(v_msg));
      v_state := jsonb_set(v_state, '{moveHistory}', v_history);

      update public.ludo_rooms
      set board_state = v_state, version = version + 1, updated_at = now()
      where id = v_room.id
      returning * into v_room;
      return v_room;
    end if;

    v_tokens := v_state -> 'tokens' -> v_turn_color;
    for v_i in 0..3 loop
      v_step := (v_tokens ->> v_i)::int;
      if v_step = -1 and v_dice = 6 then
        v_legal_count := v_legal_count + 1;
      elsif v_step >= 0 and v_step < 56 and (v_step + v_dice) <= 56 then
        v_legal_count := v_legal_count + 1;
      end if;
    end loop;

    if v_legal_count = 0 then
      v_next_idx := (v_turn_idx + 1) % v_num_colors;
      v_next_color := v_active_colors ->> v_next_idx;
      v_msg := v_player."displayName" || ' rolled ' || v_dice || ' (no legal moves).';
      v_history := coalesce(v_state -> 'moveHistory', '[]'::jsonb) || jsonb_build_array(v_msg);
      if jsonb_array_length(v_history) > 20 then
        v_history := v_history - 0;
      end if;

      v_state := jsonb_set(v_state, '{diceValue}', to_jsonb(v_dice));
      v_state := jsonb_set(v_state, '{consecutiveSixes}', '0'::jsonb);
      v_state := jsonb_set(v_state, '{turnIndex}', to_jsonb(v_next_idx));
      v_state := jsonb_set(v_state, '{turnColor}', to_jsonb(v_next_color));
      v_state := jsonb_set(v_state, '{phase}', '"WAITING_FOR_ROLL"'::jsonb);
      v_state := jsonb_set(v_state, '{lastAction}', to_jsonb(v_msg));
      v_state := jsonb_set(v_state, '{moveHistory}', v_history);
    else
      v_msg := v_player."displayName" || ' rolled a ' || v_dice || '! Select a token to move.';
      v_state := jsonb_set(v_state, '{diceValue}', to_jsonb(v_dice));
      v_state := jsonb_set(v_state, '{consecutiveSixes}', to_jsonb(v_consec));
      v_state := jsonb_set(v_state, '{phase}', '"WAITING_FOR_MOVE"'::jsonb);
      v_state := jsonb_set(v_state, '{lastAction}', to_jsonb(v_msg));
    end if;

  else
    v_step := coalesce((v_state -> 'positions' ->> v_turn_color)::int, 1);
    if v_step + v_dice > 100 then
      v_next_idx := v_turn_idx;
      loop
        v_next_idx := (v_next_idx + 1) % v_num_colors;
        v_next_color := v_active_colors ->> v_next_idx;
        v_loops := v_loops + 1;
        exit when not (v_finish_order ? v_next_color) or v_loops >= v_num_colors;
      end loop;

      v_msg := v_player."displayName" || ' rolled ' || v_dice || ' at square ' || v_step || ' (needs exact roll for 100).';
      v_history := coalesce(v_state -> 'moveHistory', '[]'::jsonb) || jsonb_build_array(v_msg);
      if jsonb_array_length(v_history) > 20 then
        v_history := v_history - 0;
      end if;

      v_state := jsonb_set(v_state, '{diceValue}', to_jsonb(v_dice));
      v_state := jsonb_set(v_state, '{turnIndex}', to_jsonb(v_next_idx));
      v_state := jsonb_set(v_state, '{turnColor}', to_jsonb(v_next_color));
      v_state := jsonb_set(v_state, '{phase}', '"WAITING_FOR_ROLL"'::jsonb);
      v_state := jsonb_set(v_state, '{lastAction}', to_jsonb(v_msg));
      v_state := jsonb_set(v_state, '{moveHistory}', v_history);
    else
      v_msg := v_player."displayName" || ' rolled a ' || v_dice || '! Tap your token to move.';
      v_state := jsonb_set(v_state, '{diceValue}', to_jsonb(v_dice));
      v_state := jsonb_set(v_state, '{phase}', '"WAITING_FOR_MOVE"'::jsonb);
      v_state := jsonb_set(v_state, '{lastAction}', to_jsonb(v_msg));
    end if;
  end if;

  update public.ludo_rooms
  set board_state = v_state,
      version = version + 1,
      updated_at = now()
  where id = v_room.id
  returning * into v_room;

  return v_room;
end;
$$;

grant execute on function public.ludo_roll_dice(uuid, text) to anon, authenticated;

-- 5. Authoritative Token Movement (Classic Ludo & Snake Ludo Rules Engine)
create or replace function public.ludo_move_token(
  p_room_id uuid,
  p_player_key text,
  p_token_index int default 0
)
returns public.ludo_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.ludo_rooms;
  v_state jsonb;
  v_turn_color text;
  v_turn_idx int;
  v_active_colors jsonb;
  v_num_colors int;
  v_player record;
  v_dice int;
  v_tokens jsonb;
  v_color_tokens jsonb;
  v_cur_step int;
  v_new_step int;
  v_target_global int;
  v_other_color text;
  v_other_tokens jsonb;
  v_other_step int;
  v_other_global int;
  v_captured_count int := 0;
  v_safe_squares int[] := array[0, 8, 13, 21, 26, 34, 39, 47];
  v_home_count int := 0;
  v_i int;
  v_c int;
  v_extra_turn boolean := false;
  v_next_idx int;
  v_next_color text;
  v_finish_order jsonb;
  v_winner_color text;
  v_new_status text := 'playing';
  v_msg text;
  v_history jsonb;
  v_ladders jsonb := '{"3":22,"5":8,"11":26,"20":29,"27":56,"36":44,"51":67,"71":91,"80":100}'::jsonb;
  v_snakes jsonb := '{"17":4,"19":7,"21":9,"43":18,"49":30,"62":41,"64":60,"87":24,"93":73,"95":75,"98":79}'::jsonb;
  v_event_note text := '';
  v_loops int := 0;
begin
  select * into v_room
  from public.ludo_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'Room not found.';
  end if;
  if v_room.status <> 'playing' then
    raise exception 'Match is already finished or not active.';
  end if;

  v_state := v_room.board_state;
  if (v_state ->> 'phase') <> 'WAITING_FOR_MOVE' then
    raise exception 'Please roll the dice first.';
  end if;

  v_turn_color := v_state ->> 'turnColor';
  v_turn_idx := coalesce((v_state ->> 'turnIndex')::int, 0);
  v_active_colors := v_state -> 'activeColors';
  v_num_colors := jsonb_array_length(v_active_colors);
  v_dice := coalesce((v_state ->> 'diceValue')::int, 0);
  v_finish_order := coalesce(v_state -> 'finishOrder', '[]'::jsonb);

  select * into v_player
  from jsonb_to_recordset(v_room.players) as x(color text, "playerKey" text, "displayName" text)
  where x.color = v_turn_color
  limit 1;

  if not found or v_player."playerKey" <> p_player_key then
    raise exception 'It is not your turn to move.';
  end if;

  if v_room.mode = 'classic' then
    if p_token_index < 0 or p_token_index > 3 then
      raise exception 'Invalid token index.';
    end if;

    v_tokens := v_state -> 'tokens';
    v_color_tokens := v_tokens -> v_turn_color;
    v_cur_step := (v_color_tokens ->> p_token_index)::int;

    if v_cur_step = -1 then
      if v_dice <> 6 then
        raise exception 'You must roll a 6 to release a token from base.';
      end if;
      v_new_step := 0;
      v_msg := v_player."displayName" || ' released token #' || (p_token_index + 1) || ' onto the starting square.';
    elsif v_cur_step >= 0 and v_cur_step < 56 then
      if v_cur_step + v_dice > 56 then
        raise exception 'Exact dice roll required to reach home.';
      end if;
      v_new_step := v_cur_step + v_dice;
      v_msg := v_player."displayName" || ' moved token #' || (p_token_index + 1) || ' by ' || v_dice || '.';
    else
      raise exception 'This token has already reached home.';
    end if;

    v_color_tokens := jsonb_set(v_color_tokens, array[p_token_index::text], to_jsonb(v_new_step));
    v_tokens := jsonb_set(v_tokens, array[v_turn_color], v_color_tokens);

    if v_new_step >= 0 and v_new_step <= 50 then
      v_target_global := (
        (case v_turn_color
          when 'red' then 0
          when 'green' then 13
          when 'yellow' then 26
          when 'blue' then 39
          else 0
        end) + v_new_step
      ) % 52;

      if not (v_target_global = any(v_safe_squares)) then
        for v_c in 0 .. v_num_colors - 1 loop
          v_other_color := v_active_colors ->> v_c;
          if v_other_color <> v_turn_color then
            v_other_tokens := v_tokens -> v_other_color;
            for v_i in 0..3 loop
              v_other_step := (v_other_tokens ->> v_i)::int;
              if v_other_step >= 0 and v_other_step <= 50 then
                v_other_global := (
                  (case v_other_color
                    when 'red' then 0
                    when 'green' then 13
                    when 'yellow' then 26
                    when 'blue' then 39
                    else 0
                  end) + v_other_step
                ) % 52;

                if v_other_global = v_target_global then
                  v_other_tokens := jsonb_set(v_other_tokens, array[v_i::text], '-1'::jsonb);
                  v_captured_count := v_captured_count + 1;
                end if;
              end if;
            end loop;
            v_tokens := jsonb_set(v_tokens, array[v_other_color], v_other_tokens);
          end if;
        end loop;
      end if;
    end if;

    if v_captured_count > 0 then
      v_msg := v_msg || ' Captured ' || v_captured_count || ' opponent token(s)! Extra roll granted!';
    end if;

    for v_i in 0..3 loop
      if ((v_color_tokens ->> v_i)::int) = 56 then
        v_home_count := v_home_count + 1;
      end if;
    end loop;

    if v_home_count = 4 then
      if not (v_finish_order ? v_turn_color) then
        v_finish_order := v_finish_order || to_jsonb(v_turn_color);
      end if;
      v_winner_color := coalesce(v_state ->> 'winnerColor', v_turn_color);
      v_new_status := 'finished';
      v_msg := '🏆 ' || v_player."displayName" || ' brought all 4 tokens home and won the match!';
    end if;

    v_extra_turn := (v_new_status = 'playing') and (v_dice = 6 or v_captured_count > 0);

    if v_extra_turn then
      v_next_idx := v_turn_idx;
      v_next_color := v_turn_color;
    else
      v_next_idx := (v_turn_idx + 1) % v_num_colors;
      v_next_color := v_active_colors ->> v_next_idx;
      v_state := jsonb_set(v_state, '{consecutiveSixes}', '0'::jsonb);
    end if;

    v_history := coalesce(v_state -> 'moveHistory', '[]'::jsonb) || jsonb_build_array(v_msg);
    if jsonb_array_length(v_history) > 20 then
      v_history := v_history - 0;
    end if;

    v_state := jsonb_set(v_state, '{tokens}', v_tokens);
    v_state := jsonb_set(v_state, '{turnIndex}', to_jsonb(v_next_idx));
    v_state := jsonb_set(v_state, '{turnColor}', to_jsonb(v_next_color));
    v_state := jsonb_set(v_state, '{phase}', '"WAITING_FOR_ROLL"'::jsonb);
    v_state := jsonb_set(v_state, '{diceValue}', 'null'::jsonb);
    v_state := jsonb_set(v_state, '{finishOrder}', v_finish_order);
    if v_winner_color is not null then
      v_state := jsonb_set(v_state, '{winnerColor}', to_jsonb(v_winner_color));
    end if;
    v_state := jsonb_set(v_state, '{lastAction}', to_jsonb(v_msg));
    v_state := jsonb_set(v_state, '{moveHistory}', v_history);

  else
    v_cur_step := coalesce((v_state -> 'positions' ->> v_turn_color)::int, 1);
    if v_cur_step >= 100 then
      raise exception 'Your token has already finished at square 100.';
    end if;

    if v_cur_step + v_dice > 100 then
      v_new_step := v_cur_step;
      v_msg := v_player."displayName" || ' stayed at ' || v_cur_step || ' (overshot 100).';
    else
      v_new_step := v_cur_step + v_dice;
      if v_ladders ? (v_new_step::text) then
        v_event_note := ' 🪜 Climbed ladder from ' || v_new_step || ' to ' || (v_ladders ->> (v_new_step::text)) || '!';
        v_new_step := (v_ladders ->> (v_new_step::text))::int;
      elsif v_snakes ? (v_new_step::text) then
        v_event_note := ' 🐍 Bitten by snake at ' || v_new_step || ' — slid down to ' || (v_snakes ->> (v_new_step::text)) || '!';
        v_new_step := (v_snakes ->> (v_new_step::text))::int;
      end if;
      v_msg := v_player."displayName" || ' rolled ' || v_dice || ' → Square ' || v_new_step || '.' || v_event_note;
    end if;

    v_state := jsonb_set(v_state, array['positions', v_turn_color], to_jsonb(v_new_step));

    if v_new_step = 100 then
      if not (v_finish_order ? v_turn_color) then
        v_finish_order := v_finish_order || to_jsonb(v_turn_color);
      end if;
      v_winner_color := coalesce(v_state ->> 'winnerColor', v_turn_color);
      v_msg := '🏆 ' || v_player."displayName" || ' reached Square 100!' || v_event_note;

      if v_num_colors = 2 or jsonb_array_length(v_finish_order) >= (v_num_colors - 1) then
        for v_c in 0 .. v_num_colors - 1 loop
          v_other_color := v_active_colors ->> v_c;
          if not (v_finish_order ? v_other_color) then
            v_finish_order := v_finish_order || to_jsonb(v_other_color);
          end if;
        end loop;
        v_new_status := 'finished';
      end if;
    end if;

    v_next_idx := v_turn_idx;
    if v_new_status = 'playing' then
      loop
        v_next_idx := (v_next_idx + 1) % v_num_colors;
        v_next_color := v_active_colors ->> v_next_idx;
        v_loops := v_loops + 1;
        exit when not (v_finish_order ? v_next_color) or v_loops >= v_num_colors;
      end loop;
    else
      v_next_color := v_turn_color;
    end if;

    v_history := coalesce(v_state -> 'moveHistory', '[]'::jsonb) || jsonb_build_array(v_msg);
    if jsonb_array_length(v_history) > 20 then
      v_history := v_history - 0;
    end if;

    v_state := jsonb_set(v_state, '{turnIndex}', to_jsonb(v_next_idx));
    v_state := jsonb_set(v_state, '{turnColor}', to_jsonb(v_next_color));
    v_state := jsonb_set(v_state, '{phase}', '"WAITING_FOR_ROLL"'::jsonb);
    v_state := jsonb_set(v_state, '{diceValue}', 'null'::jsonb);
    v_state := jsonb_set(v_state, '{finishOrder}', v_finish_order);
    if v_winner_color is not null then
      v_state := jsonb_set(v_state, '{winnerColor}', to_jsonb(v_winner_color));
    end if;
    v_state := jsonb_set(v_state, '{lastAction}', to_jsonb(v_msg));
    v_state := jsonb_set(v_state, '{moveHistory}', v_history);
  end if;

  update public.ludo_rooms
  set board_state = v_state,
      status = v_new_status,
      finished_at = case when v_new_status = 'finished' then now() else finished_at end,
      version = version + 1,
      updated_at = now()
  where id = v_room.id
  returning * into v_room;

  return v_room;
end;
$$;

grant execute on function public.ludo_move_token(uuid, text, int) to anon, authenticated;
