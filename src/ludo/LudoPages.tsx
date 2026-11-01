import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Users,
  Copy,
  Check,
  MessageCircle,
  Trophy,
  Volume2,
  VolumeX,
  LogOut,
  Sparkles,
  Download,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AuthUser, copyTextSafely } from '../api';
import { BRAND, Lang } from '../config';
import {
  LudoColor,
  LudoGameMode,
  PlayerCount,
  ClassicLudoState,
  SnakeLudoState,
  OUTER_TRACK_COORDS,
  HOME_LANE_COORDS,
  BASE_TOKEN_COORDS,
  STAR_TRACK_INDICES,
  START_TRACK_INDEX,
  SNAKE_BOARD_DEFAULT_CONFIG,
  getClassicTokenGridCoord,
  getLegalTokenIndicesForClassic,
  getSnakeSquareCoord,
  getSquareNumberAtGrid,
} from './ludoEngine';
import { ludoApi, LudoRoomRecord, getPlayerSessionKey } from './ludoApi';
import './ludo.css';

const COLOR_HEX: Record<LudoColor, string> = {
  red: '#EF4444',
  green: '#10B981',
  yellow: '#F59E0B',
  blue: '#3B82F6',
};

const COLOR_LABEL: Record<LudoColor, string> = {
  red: 'Red',
  green: 'Green',
  yellow: 'Yellow',
  blue: 'Blue',
};

/* ============================================================================
 * LIGHTWEIGHT WEB AUDIO SYNTHESIZER (NO EXTERNAL ASSETS REQUIRED)
 * ============================================================================ */
function playSynthSound(
  type: 'roll' | 'move' | 'capture' | 'ladder' | 'snake' | 'win',
  enabled: boolean
) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'roll') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.09);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'capture' || type === 'ladder') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.24);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'snake') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.28);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(783.99, now + 0.24);
      osc.frequency.setValueAtTime(1046.5, now + 0.36);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    }
  } catch {
    // Ignore audio context restrictions
  }
}

/* ============================================================================
 * SVG DICE FACE RENDERER (1..6 PIPS)
 * ============================================================================ */
const DiceFaceSvg: React.FC<{ value: number | null }> = ({ value }) => {
  const pips: Record<number, [number, number][]> = {
    1: [[24, 24]],
    2: [
      [14, 14],
      [34, 34],
    ],
    3: [
      [14, 14],
      [24, 24],
      [34, 34],
    ],
    4: [
      [14, 14],
      [34, 14],
      [14, 34],
      [34, 34],
    ],
    5: [
      [14, 14],
      [34, 14],
      [24, 24],
      [14, 34],
      [34, 34],
    ],
    6: [
      [14, 12],
      [34, 12],
      [14, 24],
      [34, 24],
      [14, 36],
      [34, 36],
    ],
  };

  const dots = value && pips[value] ? pips[value] : [];

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        fill="rgba(255,255,255,0.94)"
        stroke="#7c5cfa"
        strokeWidth="2"
      />
      {dots.length > 0 ? (
        dots.map(([cx, cy], idx) => <circle key={idx} cx={cx} cy={cy} r="4.2" fill="#1e1b4b" />)
      ) : (
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#6d28d9"
        >
          ROLL
        </text>
      )}
    </svg>
  );
};

/* ============================================================================
 * 1. GAME LIBRARY PAGE (/games)
 * ============================================================================ */
export const GamesLibraryPage: React.FC<{ user: AuthUser | null; lang: Lang }> = ({
  user,
  lang,
}) => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setErr(null);
    setJoining(true);
    try {
      const room = await ludoApi.joinRoom({
        roomIdentifier: joinCode.trim(),
        playerKey: getPlayerSessionKey(user),
        displayName: user?.displayName || 'Player',
        avatarUrl: user?.avatarUrl || '',
      });
      navigate(
        room.mode === 'classic'
          ? `/games/ludo/room/${room.id}`
          : `/games/snake-ludo/room/${room.id}`
      );
    } catch (error: any) {
      setErr(error.message || 'Could not join room.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="container ludo-page-wrap animate-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <span className="t ok">
            <Sparkles size={13} /> Real-Time Online Multiplayer
          </span>
          <h1 style={{ margin: '0.4rem 0 0.2rem', fontSize: '2.1rem' }}>
            {lang === 'bn' ? 'মাল্টিপ্লেয়ার লুডু এবং সাপ-লুডু' : 'BFFquest Multiplayer Board Games'}
          </h1>
          <p style={{ margin: 0, color: 'var(--t2)' }}>
            {lang === 'bn'
              ? 'রুম তৈরি করে বন্ধুদের লিংক বা কোড পাঠান এবং রিয়েল-টাইমে একসাথে খেলুন।'
              : 'Create a private room, share the invite link or 6-digit code, and play live with friends.'}
          </p>
        </div>

        <form
          onSubmit={handleQuickJoin}
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
        >
          <input
            className="form-input"
            style={{ width: 170, minHeight: 42, textTransform: 'uppercase', fontWeight: 700 }}
            placeholder="Room Code (e.g. BFF7X9)"
            maxLength={12}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="submit" disabled={joining} className="b btn-sm" style={{ minHeight: 42 }}>
            {joining ? 'Joining...' : 'Join by Code'}
          </button>
        </form>
      </div>

      {err && <div className="alert-error">{err}</div>}

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Mode A: Classic Ludo Card */}
        <div
          className="g game-stage"
          style={{
            ['--a' as any]: '#7C5CFA',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <span className="t ok">2 or 4 Players • 4 Tokens Each</span>
              <span className="t">Classic Board</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 4,
                  padding: 8,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <span style={{ background: '#EF4444', borderRadius: 6 }} />
                <span style={{ background: '#10B981', borderRadius: 6 }} />
                <span style={{ background: '#3B82F6', borderRadius: 6 }} />
                <span style={{ background: '#F59E0B', borderRadius: 6 }} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.55rem' }}>Classic Ludo</h2>
                <span style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
                  Traditional 4-Colour Cross Board
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--t2)', fontSize: '0.94rem', marginBottom: '1.25rem' }}>
              Roll a 6 to release tokens from your base, race clockwise across 52 track squares,
              capture opponents on unsafe tiles, rest on star safe squares, and bring all 4 tokens
              into your home triangle!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/games/ludo" className="b" style={{ flex: 1 }}>
              <Play size={17} /> Play Classic Ludo
            </Link>
          </div>
        </div>

        {/* Mode B: Snake Ludo Card */}
        <div
          className="g game-stage"
          style={{
            ['--a' as any]: '#10B981',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <span className="t ok">2 or 4 Players • 1–100 Grid</span>
              <span className="t">Snakes & Ladders</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '1.9rem',
                  background: 'rgba(16,185,129,0.16)',
                  border: '1px solid rgba(16,185,129,0.35)',
                }}
              >
                🐍🪜
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.55rem' }}>Snake Ludo</h2>
                <span style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
                  10×10 Serpentine Numbered Board
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--t2)', fontSize: '0.94rem', marginBottom: '1.25rem' }}>
              Race from Square 1 to Square 100 across alternating serpentine rows! Climb tall
              ladders to shortcut ahead, dodge dangerous snake heads, and land on 100 with an exact
              dice roll to claim victory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/games/snake-ludo" className="b" style={{ flex: 1 }}>
              <Play size={17} /> Play Snake Ludo
            </Link>
          </div>
        </div>
      </div>

      <div className="g" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong style={{ fontSize: '1.05rem' }}>Looking for Friendship Quizzes, AMA Inbox & Party Polls?</strong>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--t2)', fontSize: '0.88rem' }}>
            All 8 original BFFquest quiz and social modes remain available in Explore.
          </p>
        </div>
        <Link to="/explore" className="b o btn-sm">
          Open Quiz & Party Modes ›
        </Link>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. MODE SELECTION & ROOM CREATION PAGE (/games/ludo & /games/snake-ludo)
 * ============================================================================ */
export const LudoModeSelectPage: React.FC<{
  mode: LudoGameMode;
  user: AuthUser | null;
  lang: Lang;
}> = ({ mode, user }) => {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName && !displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const isClassic = mode === 'classic';
  const basePath = isClassic ? '/games/ludo' : '/games/snake-ludo';

  const handleCreateRoom = async () => {
    if (!displayName.trim()) {
      setErr('Please enter your display name first.');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const room = await ludoApi.createRoom({
        mode,
        maxPlayers: playerCount,
        playerKey: getPlayerSessionKey(user),
        displayName: displayName.trim(),
        avatarUrl: user?.avatarUrl || '',
      });
      navigate(`${basePath}/room/${room.id}`);
    } catch (error: any) {
      setErr(error.message || 'Could not create room.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErr('Please enter your display name first.');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErr('Please enter a 6-digit Room Code.');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const room = await ludoApi.joinRoom({
        roomIdentifier: roomCodeInput.trim(),
        playerKey: getPlayerSessionKey(user),
        displayName: displayName.trim(),
        avatarUrl: user?.avatarUrl || '',
      });
      const targetBase = room.mode === 'classic' ? '/games/ludo' : '/games/snake-ludo';
      navigate(`${targetBase}/room/${room.id}`);
    } catch (error: any) {
      setErr(error.message || 'Could not join room.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container ludo-page-wrap animate-in" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/games" className="b o btn-sm">
          <ArrowLeft size={15} /> Back to Game Library
        </Link>
      </div>

      <div
        className="game-stage"
        style={{ ['--a' as any]: isClassic ? '#7C5CFA' : '#10B981' }}
      >
        <span className="t ok">
          {isClassic ? 'Classic 4-Colour Ludo' : 'Snake Ludo (1–100 Snakes & Ladders)'}
        </span>
        <h1 style={{ margin: '0.45rem 0 0.3rem' }}>
          {isClassic ? 'Create or Join a Classic Ludo Room' : 'Create or Join a Snake Ludo Room'}
        </h1>
        <p style={{ color: 'var(--t2)', marginTop: 0, marginBottom: '1.35rem' }}>
          {isClassic
            ? '2-Player mode pits Red vs Yellow on opposite corners. 4-Player mode activates Red, Green, Yellow, and Blue clockwise.'
            : 'Race from Square 1 to Square 100 with 9 ladders and 11 snakes. Authoritative server dice rolls keep every match fair.'}
        </p>

        {!ludoApi.isOnlineReady && (
          <div className="alert-error">
            Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are
            required for real-time online multiplayer.
          </div>
        )}

        {err && <div className="alert-error">{err}</div>}

        <div className="form-group">
          <label className="form-label">Your Player Name *</label>
          <input
            className="form-input"
            placeholder="e.g., Alex"
            maxLength={32}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Select Player Count *</label>
          <div className="seg">
            <button
              type="button"
              className={playerCount === 2 ? 'on' : ''}
              onClick={() => setPlayerCount(2)}
            >
              2 Players (Red vs Yellow)
            </button>
            <button
              type="button"
              className={playerCount === 4 ? 'on' : ''}
              onClick={() => setPlayerCount(4)}
            >
              4 Players (Red · Green · Yellow · Blue)
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={busy || !ludoApi.isOnlineReady}
          onClick={handleCreateRoom}
          className="b"
          style={{ width: '100%', minHeight: 50, marginTop: '0.5rem' }}
        >
          {busy ? 'Creating Room...' : `Create ${playerCount}-Player Room`}
        </button>

        <div
          style={{
            margin: '1.6rem 0 1.2rem',
            paddingTop: '1.2rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <label className="form-label">Have a Room Code from a Friend?</label>
          <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              className="form-input"
              style={{ flex: 1, textTransform: 'uppercase', fontWeight: 700 }}
              placeholder="Enter 6-Digit Room Code"
              maxLength={12}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
            />
            <button type="submit" disabled={busy || !ludoApi.isOnlineReady} className="b o">
              Join Room
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. CLASSIC LUDO 15x15 SVG BOARD COMPONENT
 * ============================================================================ */
const ClassicLudoBoardSvg: React.FC<{
  state: ClassicLudoState;
  myColor: LudoColor | null;
  canMoveToken: boolean;
  onSelectToken: (tokenIndex: number) => void;
}> = ({ state, myColor, canMoveToken, onSelectToken }) => {
  const legalIndices =
    canMoveToken && myColor && state.turnColor === myColor
      ? new Set(getLegalTokenIndicesForClassic(state, myColor, state.diceValue))
      : new Set<number>();

  // Group tokens by their grid coordinate so stacked tokens offset cleanly
  const coordGroups = new Map<
    string,
    { color: LudoColor; tokenIndex: number; step: number; row: number; col: number }[]
  >();

  for (const color of state.activeColors) {
    const tokens = state.tokens[color] || [-1, -1, -1, -1];
    tokens.forEach((step, tIdx) => {
      const [row, col] = getClassicTokenGridCoord(color, step, tIdx);
      const key = `${row.toFixed(1)},${col.toFixed(1)}`;
      const list = coordGroups.get(key) || [];
      list.push({ color, tokenIndex: tIdx, step, row, col });
      coordGroups.set(key, list);
    });
  }

  return (
    <div className="ludo-board-frame">
      <svg viewBox="0 0 15 15" className="ludo-board-svg">
        {/* Background Base */}
        <rect x="0" y="0" width="15" height="15" fill="#0f172a" />

        {/* 4 Colored Home Bases (6x6 corners) */}
        {/* Red Top-Left */}
        <rect x="0" y="0" width="6" height="6" fill="#ef4444" fillOpacity="0.88" />
        <rect x="0.8" y="0.8" width="4.4" height="4.4" rx="0.6" fill="#0f172a" fillOpacity="0.82" />
        {/* Green Top-Right */}
        <rect x="9" y="0" width="6" height="6" fill="#10b981" fillOpacity="0.88" />
        <rect x="9.8" y="0.8" width="4.4" height="4.4" rx="0.6" fill="#0f172a" fillOpacity="0.82" />
        {/* Yellow Bottom-Right */}
        <rect x="9" y="9" width="6" height="6" fill="#f59e0b" fillOpacity="0.88" />
        <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="0.6" fill="#0f172a" fillOpacity="0.82" />
        {/* Blue Bottom-Left */}
        <rect x="0" y="9" width="6" height="6" fill="#3b82f6" fillOpacity="0.88" />
        <rect x="0.8" y="9.8" width="4.4" height="4.4" rx="0.6" fill="#0f172a" fillOpacity="0.82" />

        {/* Base Token Slots */}
        {(['red', 'green', 'yellow', 'blue'] as LudoColor[]).map((c) =>
          BASE_TOKEN_COORDS[c].map(([r, col], idx) => (
            <circle
              key={`${c}_slot_${idx}`}
              cx={col + 0.5}
              cy={r + 0.5}
              r="0.52"
              fill={COLOR_HEX[c]}
              fillOpacity={state.activeColors.includes(c) ? 0.32 : 0.1}
              stroke={COLOR_HEX[c]}
              strokeWidth="0.08"
            />
          ))
        )}

        {/* 52 Outer Track Squares */}
        {OUTER_TRACK_COORDS.map(([r, c], idx) => {
          let fill = 'rgba(255,255,255,0.92)';
          if (idx === START_TRACK_INDEX.red) fill = '#ef4444';
          else if (idx === START_TRACK_INDEX.green) fill = '#10b981';
          else if (idx === START_TRACK_INDEX.yellow) fill = '#f59e0b';
          else if (idx === START_TRACK_INDEX.blue) fill = '#3b82f6';

          const isStar = STAR_TRACK_INDICES.has(idx);
          const isStart =
            idx === 0 || idx === 13 || idx === 26 || idx === 39;

          return (
            <g key={`track_${idx}`}>
              <rect
                x={c}
                y={r}
                width="1"
                height="1"
                fill={fill}
                stroke="#1e293b"
                strokeWidth="0.05"
              />
              {(isStar || isStart) && (
                <text
                  x={c + 0.5}
                  y={r + 0.68}
                  textAnchor="middle"
                  fontSize="0.52"
                  fill={isStart ? '#ffffff' : '#475569'}
                >
                  ★
                </text>
              )}
            </g>
          );
        })}

        {/* 4 Colored Home Corridors (Steps 51..55) */}
        {(['red', 'green', 'yellow', 'blue'] as LudoColor[]).map((color) =>
          HOME_LANE_COORDS[color].slice(0, 5).map(([r, c], i) => (
            <rect
              key={`home_${color}_${i}`}
              x={c}
              y={r}
              width="1"
              height="1"
              fill={COLOR_HEX[color]}
              fillOpacity="0.85"
              stroke="#1e293b"
              strokeWidth="0.05"
            />
          ))
        )}

        {/* Center 3x3 Home Triangles */}
        <polygon points="6,6 6,9 7.5,7.5" fill="#ef4444" stroke="#0f172a" strokeWidth="0.06" />
        <polygon points="6,6 9,6 7.5,7.5" fill="#10b981" stroke="#0f172a" strokeWidth="0.06" />
        <polygon points="9,6 9,9 7.5,7.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.06" />
        <polygon points="6,9 9,9 7.5,7.5" fill="#3b82f6" stroke="#0f172a" strokeWidth="0.06" />

        {/* Render Active Player Tokens */}
        {Array.from(coordGroups.values()).map((group) =>
          group.map((item, stackIdx) => {
            const isSelectable =
              item.color === myColor && legalIndices.has(item.tokenIndex);
            const offsets: [number, number][] =
              group.length === 1
                ? [[0, 0]]
                : [
                    [-0.16, -0.16],
                    [0.16, -0.16],
                    [-0.16, 0.16],
                    [0.16, 0.16],
                  ];
            const [dx, dy] = offsets[stackIdx % 4];
            const cx = item.col + 0.5 + dx;
            const cy = item.row + 0.5 + dy;

            return (
              <g
                key={`tok_${item.color}_${item.tokenIndex}`}
                className={`ludo-token-group ${isSelectable ? '' : 'disabled'}`}
                onClick={() => {
                  if (isSelectable) onSelectToken(item.tokenIndex);
                }}
              >
                {isSelectable && (
                  <circle cx={cx} cy={cy} r="0.45" className="ludo-token-selectable-ring" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={group.length > 1 ? 0.31 : 0.36}
                  fill={COLOR_HEX[item.color]}
                  stroke="#ffffff"
                  strokeWidth="0.1"
                />
                <text
                  x={cx}
                  y={cy + 0.11}
                  textAnchor="middle"
                  fontSize="0.3"
                  fontWeight="800"
                  fill="#ffffff"
                >
                  {item.tokenIndex + 1}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

/* ============================================================================
 * 4. SNAKE LUDO 10x10 SERPENTINE BOARD COMPONENT
 * ============================================================================ */
const SnakeLudoBoardView: React.FC<{
  state: SnakeLudoState;
}> = ({ state }) => {
  const cells: { row: number; col: number; num: number }[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      cells.push({ row: r, col: c, num: getSquareNumberAtGrid(r, c) });
    }
  }

  return (
    <div className="snake-board-frame">
      <div className="snake-grid-10x10">
        {cells.map((cell) => {
          const ladderTop = SNAKE_BOARD_DEFAULT_CONFIG.ladders[cell.num];
          const snakeTail = SNAKE_BOARD_DEFAULT_CONFIG.snakes[cell.num];
          const playersHere = state.activeColors.filter(
            (color) => state.positions[color] === cell.num
          );

          return (
            <div
              key={cell.num}
              className={`snake-cell ${(cell.row + cell.col) % 2 === 1 ? 'alt' : ''} ${
                ladderTop ? 'is-ladder' : ''
              } ${snakeTail ? 'is-snake' : ''} ${cell.num === 100 ? 'is-100' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{cell.num}</span>
                {ladderTop && (
                  <span style={{ fontSize: '0.58rem', color: '#34d399' }}>🪜{ladderTop}</span>
                )}
                {snakeTail && (
                  <span style={{ fontSize: '0.58rem', color: '#f87171' }}>🐍{snakeTail}</span>
                )}
                {cell.num === 100 && <span>👑</span>}
              </div>

              {playersHere.length > 0 && (
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 'auto' }}>
                  {playersHere.map((c) => (
                    <span
                      key={c}
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        background: COLOR_HEX[c],
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.45)',
                        display: 'inline-block',
                      }}
                      title={COLOR_LABEL[c]}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual SVG Overlay for Ladders & Snakes */}
      <svg viewBox="0 0 100 100" className="snake-overlay-svg">
        {Object.entries(SNAKE_BOARD_DEFAULT_CONFIG.ladders).map(([fromStr, to]) => {
          const from = Number(fromStr);
          const a = getSnakeSquareCoord(from);
          const b = getSnakeSquareCoord(to);
          const x1 = a.col * 10 + 5;
          const y1 = a.row * 10 + 5;
          const x2 = b.col * 10 + 5;
          const y2 = b.row * 10 + 5;
          return (
            <line
              key={`ladder_${from}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="2 1.5"
              strokeOpacity="0.65"
            />
          );
        })}
        {Object.entries(SNAKE_BOARD_DEFAULT_CONFIG.snakes).map(([headStr, tail]) => {
          const head = Number(headStr);
          const a = getSnakeSquareCoord(head);
          const b = getSnakeSquareCoord(tail);
          const x1 = a.col * 10 + 5;
          const y1 = a.row * 10 + 5;
          const x2 = b.col * 10 + 5;
          const y2 = b.row * 10 + 5;
          const mx = (x1 + x2) / 2 + 4;
          const my = (y1 + y2) / 2;
          return (
            <path
              key={`snake_${head}`}
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeOpacity="0.65"
            />
          );
        })}
      </svg>
    </div>
  );
};

/* ============================================================================
 * 5. MULTIPLAYER ROOM PAGE (/games/ludo/room/:roomId & /games/snake-ludo/room/:roomId)
 * ============================================================================ */
export const MultiplayerLudoRoomPage: React.FC<{
  expectedMode: LudoGameMode;
  user: AuthUser | null;
  lang: Lang;
}> = ({ expectedMode, user }) => {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const playerKey = getPlayerSessionKey(user);

  const [room, setRoom] = useState<LudoRoomRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [joinName, setJoinName] = useState(user?.displayName || '');
  const [joining, setJoining] = useState(false);
  const [rollingAnim, setRollingAnim] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [onlineKeys, setOnlineKeys] = useState<Set<string>>(new Set());

  const subRef = useRef<{
    broadcastRolling: (color: LudoColor) => void;
    unsubscribe: () => void;
  } | null>(null);

  const loadAndSubscribe = async () => {
    setLoading(true);
    setErr(null);
    try {
      const fetched = await ludoApi.getRoomById(roomId);
      if (!fetched) {
        setErr('Multiplayer room not found.');
        setLoading(false);
        return;
      }
      setRoom(fetched);

      // Auto-rejoin if player is already part of the room
      const alreadyIn = fetched.players.some((p) => p.playerKey === playerKey);
      if (alreadyIn) {
        const rejoined = await ludoApi.joinRoom({
          roomIdentifier: fetched.id,
          playerKey,
          displayName: user?.displayName || fetched.players.find((p) => p.playerKey === playerKey)?.displayName || 'Player',
          avatarUrl: user?.avatarUrl || '',
        });
        setRoom(rejoined);
      }

      if (subRef.current) subRef.current.unsubscribe();
      subRef.current = ludoApi.subscribeToRoom({
        roomId: fetched.id,
        playerKey,
        displayName: user?.displayName || 'Player',
        onRoomUpdate: (nextRoom) => {
          setRoom(nextRoom);
          setRollingAnim(false);
          if (nextRoom.status === 'finished') {
            playSynthSound('win', soundOn);
          }
        },
        onPresenceChange: (keys) => {
          setOnlineKeys(keys);
        },
        onRollingBroadcast: () => {
          setRollingAnim(true);
          playSynthSound('roll', soundOn);
          setTimeout(() => setRollingAnim(false), 600);
        },
      });
    } catch (error: any) {
      setErr(error.message || 'Could not load multiplayer room.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndSubscribe();
    return () => {
      if (subRef.current) subRef.current.unsubscribe();
    };
  }, [roomId, user?.id]);

  if (loading) {
    return (
      <div className="container ludo-page-wrap" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        Connecting to Multiplayer Room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container ludo-page-wrap" style={{ maxWidth: 540 }}>
        <div className="g" style={{ textAlign: 'center' }}>
          <h2>Room Not Found</h2>
          <p style={{ color: 'var(--t2)' }}>{err || 'This room code or invite link is invalid.'}</p>
          <Link to="/games" className="b">
            Return to Games
          </Link>
        </div>
      </div>
    );
  }

  const myPlayer = room.players.find((p) => p.playerKey === playerKey) || null;
  const myColor = myPlayer?.color || null;
  const isHost = room.host_player_key === playerKey;
  const inviteUrl = `${window.location.origin}/games/${
    room.mode === 'classic' ? 'ludo' : 'snake-ludo'
  }/room/${room.id}`;

  const boardState = room.board_state;
  const isMyTurn = Boolean(myColor && boardState.turnColor === myColor && room.status === 'playing');

  const handleJoinSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim()) {
      setErr('Please enter your name to join.');
      return;
    }
    setJoining(true);
    setErr(null);
    try {
      const updated = await ludoApi.joinRoom({
        roomIdentifier: room.id,
        playerKey,
        displayName: joinName.trim(),
        avatarUrl: user?.avatarUrl || '',
      });
      setRoom(updated);
    } catch (error: any) {
      setErr(error.message || 'Failed to join room.');
    } finally {
      setJoining(false);
    }
  };

  const handleRollDice = async () => {
    if (!isMyTurn || boardState.phase !== 'WAITING_FOR_ROLL' || actionBusy) return;
    setActionBusy(true);
    setErr(null);
    setRollingAnim(true);
    playSynthSound('roll', soundOn);
    subRef.current?.broadcastRolling(boardState.turnColor);

    try {
      const updated = await ludoApi.rollDice(room.id, playerKey);
      setRoom(updated);
    } catch (error: any) {
      setErr(error.message || 'Could not roll dice.');
    } finally {
      setRollingAnim(false);
      setActionBusy(false);
    }
  };

  const handleMoveToken = async (tokenIndex = 0) => {
    if (!isMyTurn || boardState.phase !== 'WAITING_FOR_MOVE' || actionBusy) return;
    setActionBusy(true);
    setErr(null);
    try {
      const updated = await ludoApi.moveToken(room.id, playerKey, tokenIndex);
      const lastAct = updated.board_state.lastAction || '';
      if (lastAct.includes('Captured') || lastAct.includes('🪜')) {
        playSynthSound('capture', soundOn);
      } else if (lastAct.includes('🐍')) {
        playSynthSound('snake', soundOn);
      } else {
        playSynthSound('move', soundOn);
      }
      setRoom(updated);
    } catch (error: any) {
      setErr(error.message || 'Move rejected.');
    } finally {
      setActionBusy(false);
    }
  };

  const downloadResultCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, 800, 480);

    const grad = ctx.createLinearGradient(24, 24, 776, 456);
    grad.addColorStop(0, '#7C5CFA');
    grad.addColorStop(0.5, '#4FD1E8');
    grad.addColorStop(1, '#10B981');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 5;
    ctx.strokeRect(24, 24, 752, 432);

    const winnerPlayer = room.players.find((p) => p.color === boardState.winnerColor);
    ctx.fillStyle = '#C9B8FF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(
      `${BRAND.name} • ${room.mode === 'classic' ? 'Classic Ludo' : 'Snake Ludo'} Match Result`,
      60,
      86
    );

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(`🏆 Winner: ${winnerPlayer?.displayName || boardState.winnerColor || 'Player'}`, 60, 175);

    ctx.fillStyle = '#4FD1E8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Room Code: ${room.room_code}  •  ${room.max_players}-Player Match`, 60, 235);

    ctx.fillStyle = '#A7B1C5';
    ctx.font = '22px sans-serif';
    boardState.finishOrder.forEach((c, idx) => {
      const pl = room.players.find((p) => p.color === c);
      ctx.fillText(
        `#${idx + 1}  ${pl?.displayName || COLOR_LABEL[c]} (${COLOR_LABEL[c]})`,
        60,
        290 + idx * 36
      );
    });

    const link = document.createElement('a');
    link.download = `bffquest-${room.mode}-result.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  /* ==========================================================================
   * LOBBY VIEW (WAITING FOR PLAYERS & READY STATUS)
   * ========================================================================== */
  if (room.status === 'waiting') {
    const allJoined = room.players.length === room.max_players;
    const allReady = allJoined && room.players.every((p) => p.ready);

    return (
      <div className="container ludo-page-wrap animate-in" style={{ maxWidth: 720 }}>
        <div className="game-stage" style={{ ['--a' as any]: room.mode === 'classic' ? '#7C5CFA' : '#10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <span className="t ok">
                {room.mode === 'classic' ? 'Classic Ludo Lobby' : 'Snake Ludo Lobby'} • {room.max_players} Players
              </span>
              <h1 style={{ margin: '0.35rem 0 0', fontSize: '1.8rem' }}>
                Room Code: <span className="gr">{room.room_code}</span>
              </h1>
            </div>

            <button
              type="button"
              className="b x btn-sm"
              onClick={async () => {
                if (myPlayer) {
                  await ludoApi.leaveRoom(room.id, playerKey);
                }
                navigate('/games');
              }}
            >
              <LogOut size={15} /> Leave Room
            </button>
          </div>

          {err && <div className="alert-error">{err}</div>}

          {/* Invite Link & Copy Box */}
          <div className="g" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
              Share Room Invite Link with Friends
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                readOnly
                value={inviteUrl}
                style={{ flex: '1 1 220px', fontWeight: 600, color: 'var(--cy)' }}
              />
              <button
                type="button"
                className="b btn-sm"
                onClick={async () => {
                  const res = await copyTextSafely(inviteUrl);
                  if (res.ok) {
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  } else {
                    window.prompt('Copy room invite link:', inviteUrl);
                  }
                }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Join my ${room.mode === 'classic' ? 'Classic Ludo' : 'Snake Ludo'} room (${room.room_code}) on ${BRAND.name}! ${inviteUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="b btn-whatsapp btn-sm"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>

          {/* If visitor hasn't joined a seat yet */}
          {!myPlayer && room.players.length < room.max_players && (
            <form onSubmit={handleJoinSeat} className="g" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ marginTop: 0 }}>Join an Open Seat</h3>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Your Display Name"
                  required
                  maxLength={32}
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                />
                <button type="submit" disabled={joining} className="b">
                  {joining ? 'Joining...' : 'Join Match'}
                </button>
              </div>
            </form>
          )}

          {/* Player Slots List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.4rem' }}>
            {boardState.activeColors.map((color, idx) => {
              const p = room.players.find((pl) => pl.color === color);
              const isOnline = p ? onlineKeys.has(p.playerKey) || p.connected : false;
              return (
                <div key={color} className="ludo-player-pill">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      className="ludo-color-dot"
                      style={{ color: COLOR_HEX[color], background: COLOR_HEX[color] }}
                    />
                    <div>
                      <strong>
                        Seat #{idx + 1} ({COLOR_LABEL[color]}):{' '}
                        {p ? p.displayName : 'Waiting for player...'}
                      </strong>
                      {p && p.playerKey === room.host_player_key && (
                        <span className="t" style={{ marginLeft: '0.45rem', fontSize: '0.68rem' }}>
                          HOST
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {p ? (
                      <span className={`t ${p.ready ? 'ok' : 'w'}`}>
                        {isOnline ? '● ' : ''}
                        {p.ready ? 'Ready ✓' : 'Not Ready'}
                      </span>
                    ) : (
                      <span className="t">Open Slot</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ready & Host Start Controls */}
          {myPlayer && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="b o"
                onClick={async () => {
                  try {
                    const updated = await ludoApi.toggleReady(room.id, playerKey, !myPlayer.ready);
                    setRoom(updated);
                  } catch (e: any) {
                    setErr(e.message);
                  }
                }}
              >
                <ShieldCheck size={17} />
                <span>{myPlayer.ready ? 'Set Not Ready' : 'Mark Ready ✓'}</span>
              </button>

              {isHost ? (
                <button
                  type="button"
                  disabled={!allReady}
                  className="b"
                  onClick={async () => {
                    try {
                      const updated = await ludoApi.startGame(room.id, playerKey);
                      setRoom(updated);
                    } catch (e: any) {
                      setErr(e.message);
                    }
                  }}
                >
                  <Play size={17} />
                  <span>
                    {allReady
                      ? 'Start Match Now!'
                      : `Waiting for ${room.max_players - room.players.length} more player(s)...`}
                  </span>
                </button>
              ) : (
                <span style={{ color: 'var(--t2)', alignSelf: 'center', fontWeight: 600 }}>
                  Waiting for Host to start the match...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================================================
   * IN-GAME & FINISHED MATCH VIEW
   * ========================================================================== */
  const currentTurnPlayer = room.players.find((p) => p.color === boardState.turnColor);
  const matchDurationSec =
    room.started_at && room.finished_at
      ? Math.max(
          1,
          Math.round(
            (new Date(room.finished_at).getTime() - new Date(room.started_at).getTime()) / 1000
          )
        )
      : null;

  return (
    <div className="container ludo-page-wrap animate-in">
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="t ok">Room {room.room_code}</span>
          <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
            {room.mode === 'classic' ? 'Classic Ludo' : 'Snake Ludo (1–100)'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="b o btn-sm"
            onClick={() => setSoundOn((v) => !v)}
            title="Toggle Sound Effects"
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            type="button"
            className="b o btn-sm"
            onClick={loadAndSubscribe}
            title="Resync Board State"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            className="b x btn-sm"
            onClick={async () => {
              if (myPlayer) {
                await ludoApi.leaveRoom(room.id, playerKey);
              }
              navigate('/games');
            }}
          >
            <LogOut size={15} /> Leave
          </button>
        </div>
      </div>

      {err && <div className="alert-error">{err}</div>}

      {/* Finished Result Banner */}
      {room.status === 'finished' && (
        <div
          className="game-stage"
          style={{ ['--a' as any]: '#F59E0B', textAlign: 'center', marginBottom: '1.5rem' }}
        >
          <span className="t ok">Match Completed</span>
          <h1 style={{ margin: '0.4rem 0' }}>
            🏆 Winner:{' '}
            {room.players.find((p) => p.color === boardState.winnerColor)?.displayName ||
              COLOR_LABEL[boardState.winnerColor || 'red']}
          </h1>
          {matchDurationSec && (
            <p style={{ color: 'var(--t2)', marginTop: 0 }}>
              Match Duration: {Math.floor(matchDurationSec / 60)}m {matchDurationSec % 60}s
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap',
              margin: '1rem 0',
            }}
          >
            {boardState.finishOrder.map((c, i) => {
              const pl = room.players.find((p) => p.color === c);
              return (
                <span key={c} className="t ok" style={{ fontSize: '0.88rem', padding: '0.4rem 0.9rem' }}>
                  #{i + 1} {pl?.displayName || COLOR_LABEL[c]} ({COLOR_LABEL[c]})
                </span>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button type="button" className="b" onClick={downloadResultCard}>
              <Download size={16} /> Download Result Card
            </button>
            <Link
              to={room.mode === 'classic' ? '/games/ludo' : '/games/snake-ludo'}
              className="b o"
            >
              Play Again
            </Link>
            <Link to="/games" className="b o">
              Return to Games
            </Link>
          </div>
        </div>
      )}

      <div className="ludo-layout-grid">
        {/* Left Column: Board */}
        <div>
          {room.mode === 'classic' ? (
            <ClassicLudoBoardSvg
              state={boardState as ClassicLudoState}
              myColor={myColor}
              canMoveToken={isMyTurn && boardState.phase === 'WAITING_FOR_MOVE'}
              onSelectToken={handleMoveToken}
            />
          ) : (
            <SnakeLudoBoardView state={boardState as SnakeLudoState} />
          )}
        </div>

        {/* Right Column: Dice Control, Active Turn, Player List & Move Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Turn & Dice Card */}
          <div className="g" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '0.65rem' }}>
              <span
                className="t"
                style={{
                  background: COLOR_HEX[boardState.turnColor],
                  color: '#ffffff',
                  border: 'none',
                }}
              >
                {currentTurnPlayer?.displayName || COLOR_LABEL[boardState.turnColor]}’s Turn (
                {COLOR_LABEL[boardState.turnColor]})
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.1rem',
                margin: '0.8rem 0',
              }}
            >
              <button
                type="button"
                className={`ludo-dice-btn ${rollingAnim ? 'rolling' : ''}`}
                disabled={
                  !isMyTurn ||
                  boardState.phase !== 'WAITING_FOR_ROLL' ||
                  actionBusy ||
                  room.status !== 'playing'
                }
                onClick={handleRollDice}
                title={isMyTurn ? 'Tap to Roll Dice' : 'Wait for your turn'}
              >
                <DiceFaceSvg value={boardState.diceValue} />
              </button>

              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  {boardState.diceValue ? `Rolled: ${boardState.diceValue}` : 'Ready to Roll'}
                </strong>
                <span style={{ fontSize: '0.84rem', color: 'var(--t2)' }}>
                  {isMyTurn
                    ? boardState.phase === 'WAITING_FOR_ROLL'
                      ? 'Tap the dice to roll!'
                      : room.mode === 'classic'
                      ? 'Tap a glowing token on the board!'
                      : 'Tap the Move button below!'
                    : 'Waiting for opponent...'}
                </span>
              </div>
            </div>

            {/* In Snake Ludo, single-token move button when WAITING_FOR_MOVE */}
            {room.mode === 'snake' && isMyTurn && boardState.phase === 'WAITING_FOR_MOVE' && (
              <button
                type="button"
                disabled={actionBusy}
                className="b"
                style={{ width: '100%', marginTop: '0.4rem' }}
                onClick={() => handleMoveToken(0)}
              >
                Move Token +{boardState.diceValue} Squares ›
              </button>
            )}

            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.6rem 0.8rem',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                fontSize: '0.85rem',
                color: 'var(--cy)',
                fontWeight: 600,
              }}
            >
              {boardState.lastAction}
            </div>
          </div>

          {/* Players Status List */}
          <div className="g">
            <span className="lab" style={{ display: 'block', marginBottom: '0.6rem' }}>
              <Users size={13} /> Players & Token Status
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {boardState.activeColors.map((color) => {
                const pl = room.players.find((p) => p.color === color);
                const isOnline = pl ? onlineKeys.has(pl.playerKey) || pl.connected : false;
                const isTurn = boardState.turnColor === color && room.status === 'playing';

                let statusSub = '';
                if (room.mode === 'classic') {
                  const toks = (boardState as ClassicLudoState).tokens[color] || [-1, -1, -1, -1];
                  const homeCount = toks.filter((s) => s === 56).length;
                  const outCount = toks.filter((s) => s >= 0 && s < 56).length;
                  statusSub = `Home: ${homeCount}/4 • Active: ${outCount}`;
                } else {
                  const sq = (boardState as SnakeLudoState).positions[color] || 1;
                  statusSub = `Square: ${sq} / 100`;
                }

                return (
                  <div
                    key={color}
                    className={`ludo-player-pill ${isTurn ? 'active-turn' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        className="ludo-color-dot"
                        style={{ color: COLOR_HEX[color], background: COLOR_HEX[color] }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.92rem' }}>
                          {pl?.displayName || COLOR_LABEL[color]}
                          {pl?.playerKey === playerKey ? ' (You)' : ''}
                        </strong>
                        <div style={{ fontSize: '0.76rem', color: 'var(--t2)' }}>{statusSub}</div>
                      </div>
                    </div>

                    <span
                      className={`t ${isOnline ? 'ok' : 'w'}`}
                      style={{ fontSize: '0.7rem' }}
                      title={isOnline ? 'Connected' : 'Reconnecting / Disconnected'}
                    >
                      {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Move History Log */}
          <div className="g">
            <span className="lab" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Recent Match Log
            </span>
            <div
              style={{
                maxHeight: 150,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--t2)',
              }}
            >
              {(boardState.moveHistory || [])
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <div key={idx} style={{ padding: '0.25rem 0', borderBottom: '1px dashed rgba(255,255,255,0.07)' }}>
                    {entry}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
