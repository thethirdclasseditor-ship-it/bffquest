import { supabase, isSupabaseConfigured, getCreatorToken, AuthUser } from '../api';
import {
  LudoColor,
  LudoGameMode,
  PlayerCount,
  ClassicLudoState,
  SnakeLudoState,
} from './ludoEngine';

export interface LudoRoomPlayer {
  slot: number;
  color: LudoColor;
  playerKey: string;
  userId?: string | null;
  displayName: string;
  avatarUrl?: string;
  ready: boolean;
  connected: boolean;
  joinedAt?: string;
}

export interface LudoRoomRecord {
  id: string;
  room_code: string;
  mode: LudoGameMode;
  max_players: PlayerCount;
  status: 'waiting' | 'playing' | 'finished' | 'abandoned';
  host_player_key: string;
  players: LudoRoomPlayer[];
  board_state: ClassicLudoState | SnakeLudoState;
  version: number;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  finished_at?: string | null;
}

export function getPlayerSessionKey(user: AuthUser | null): string {
  if (user?.id) return `uid_${user.id}`;
  return getCreatorToken();
}

function ensureSupabaseMultiplayer() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Online Multiplayer requires an active Supabase connection (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).'
    );
  }
  return supabase;
}

export const ludoApi = {
  isOnlineReady: isSupabaseConfigured,

  async createRoom(params: {
    mode: LudoGameMode;
    maxPlayers: PlayerCount;
    playerKey: string;
    displayName: string;
    avatarUrl?: string;
  }): Promise<LudoRoomRecord> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client.rpc('ludo_create_room', {
      p_mode: params.mode,
      p_max_players: params.maxPlayers,
      p_player_key: params.playerKey,
      p_display_name: params.displayName.trim() || 'Player 1',
      p_avatar_url: params.avatarUrl || '',
    });

    if (error || !data) {
      throw new Error(error?.message || 'Could not create multiplayer room.');
    }
    return data as LudoRoomRecord;
  },

  async joinRoom(params: {
    roomIdentifier: string;
    playerKey: string;
    displayName: string;
    avatarUrl?: string;
  }): Promise<LudoRoomRecord> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client.rpc('ludo_join_room', {
      p_room_identifier: params.roomIdentifier.trim(),
      p_player_key: params.playerKey,
      p_display_name: params.displayName.trim() || 'Player',
      p_avatar_url: params.avatarUrl || '',
    });

    if (error || !data) {
      throw new Error(error?.message || 'Could not join multiplayer room.');
    }
    return data as LudoRoomRecord;
  },

  async getRoomById(roomId: string): Promise<LudoRoomRecord | null> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client
      .from('ludo_rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as LudoRoomRecord) || null;
  },

  async toggleReady(roomId: string, playerKey: string, ready: boolean): Promise<LudoRoomRecord> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client.rpc('ludo_lobby_action', {
      p_room_id: roomId,
      p_player_key: playerKey,
      p_action: 'toggle_ready',
      p_ready: ready,
    });
    if (error || !data) throw new Error(error?.message || 'Could not update ready state.');
    return data as LudoRoomRecord;
  },

  async startGame(roomId: string, playerKey: string): Promise<LudoRoomRecord> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client.rpc('ludo_lobby_action', {
      p_room_id: roomId,
      p_player_key: playerKey,
      p_action: 'start',
      p_ready: true,
    });
    if (error || !data) throw new Error(error?.message || 'Could not start match.');
    return data as LudoRoomRecord;
  },

  async leaveRoom(roomId: string, playerKey: string): Promise<LudoRoomRecord> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client.rpc('ludo_lobby_action', {
      p_room_id: roomId,
      p_player_key: playerKey,
      p_action: 'leave',
      p_ready: false,
    });
    if (error || !data) throw new Error(error?.message || 'Could not leave room.');
    return data as LudoRoomRecord;
  },

  async rollDice(roomId: string, playerKey: string): Promise<LudoRoomRecord> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client.rpc('ludo_roll_dice', {
      p_room_id: roomId,
      p_player_key: playerKey,
    });
    if (error || !data) throw new Error(error?.message || 'Failed to roll dice.');
    return data as LudoRoomRecord;
  },

  async moveToken(roomId: string, playerKey: string, tokenIndex = 0): Promise<LudoRoomRecord> {
    const client = ensureSupabaseMultiplayer();
    const { data, error } = await client.rpc('ludo_move_token', {
      p_room_id: roomId,
      p_player_key: playerKey,
      p_token_index: tokenIndex,
    });
    if (error || !data) throw new Error(error?.message || 'Illegal or rejected move.');
    return data as LudoRoomRecord;
  },

  subscribeToRoom(params: {
    roomId: string;
    playerKey: string;
    displayName: string;
    onRoomUpdate: (room: LudoRoomRecord) => void;
    onPresenceChange: (onlinePlayerKeys: Set<string>) => void;
    onRollingBroadcast?: (color: LudoColor) => void;
  }) {
    const client = ensureSupabaseMultiplayer();
    const channel = client.channel(`ludo_room_${params.roomId}`, {
      config: {
        presence: { key: params.playerKey },
      },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ludo_rooms',
          filter: `id=eq.${params.roomId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as LudoRoomRecord).id) {
            params.onRoomUpdate(payload.new as LudoRoomRecord);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineKeys = new Set<string>(Object.keys(state));
        params.onPresenceChange(onlineKeys);
      })
      .on('broadcast', { event: 'rolling' }, (msg) => {
        if (msg.payload?.color && params.onRollingBroadcast) {
          params.onRollingBroadcast(msg.payload.color as LudoColor);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            playerKey: params.playerKey,
            displayName: params.displayName,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return {
      broadcastRolling: (color: LudoColor) => {
        channel.send({
          type: 'broadcast',
          event: 'rolling',
          payload: { color },
        });
      },
      unsubscribe: () => {
        client.removeChannel(channel);
      },
    };
  },
};
