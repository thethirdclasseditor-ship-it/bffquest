import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Users,
  Copy,
  Check,
  MessageCircle,
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
  Palette,
} from 'lucide-react';
import { AuthUser, copyTextSafely } from '../api';
import { BRAND, Lang } from '../config';
import {
  LudoColor,
  LudoGameMode,
  PlayerCount,
  ClassicLudoState,
  SnakeLudoState,
  ALL_LUDO_COLORS,
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

const COLOR_DARK_HEX: Record<LudoColor, string> = {
  red: '#991B1B',
  green: '#065F46',
  yellow: '#B45309',
  blue: '#1E40AF',
};

const COLOR_LIGHT_HEX: Record<LudoColor, string> = {
  red: '#FCA5A5',
  green: '#6EE7B7',
  yellow: '#FDE047',
  blue: '#93C5FD',
};

const COLOR_LABEL: Record<LudoColor, string> = {
  red: 'Red',
  green: 'Green',
  yellow: 'Yellow',
  blue: 'Blue',
};

/* ============================================================================
 * WEB AUDIO SYNTHESIZER (INCLUDES 1-BY-1 STEP HOP SOUND)
 * ============================================================================ */
function playSynthSound(
  type: 'roll' | 'step' | 'release' | 'capture' | 'ladder' | 'snake' | 'win',
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
    if (type === 'step') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.065);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'release') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.14);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'roll') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'capture' || type === 'ladder') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'snake') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);
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
 * 3D PAWN ("GUTI") PREVIEW ICON FOR COLOR PICKER & HUD
 * ============================================================================ */
const PawnPreviewSvg: React.FC<{ color: LudoColor; size?: number }> = ({
  color,
  size = 34,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <radialGradient id={`pawn_grad_${color}`} cx="35%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="28%" stopColor={COLOR_LIGHT_HEX[color]} />
        <stop offset="72%" stopColor={COLOR_HEX[color]} />
        <stop offset="100%" stopColor={COLOR_DARK_HEX[color]} />
      </radialGradient>
    </defs>
    <ellipse cx="20" cy="35" rx="11" ry="3.2" fill="rgba(0,0,0,0.35)" />
    <ellipse
      cx="20"
      cy="33"
      rx="9.5"
      ry="3"
      fill={COLOR_DARK_HEX[color]}
      stroke="#ffffff"
      strokeWidth="1.5"
    />
    <path
      d="M12.5 32 C12.5 23, 15.5 19, 17 15 C14.5 13, 14.5 7, 20 7 C25.5 7, 25.5 13, 23 15 C24.5 19, 27.5 23, 27.5 32 Z"
      fill={`url(#pawn_grad_${color})`}
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <ellipse
      cx="18"
      cy="10.5"
      rx="2.6"
      ry="1.4"
      fill="#ffffff"
      fillOpacity="0.85"
      transform="rotate(-20 18 10.5)"
    />
  </svg>
);

/* ============================================================================
 * 3D BEVELED DICE FACE RENDERER (LUDO KING STYLE)
 * ============================================================================ */
const DiceFaceSvg: React.FC<{ value: number | null; rolling?: boolean }> = ({
  value,
  rolling,
}) => {
  const [animFace, setAnimFace] = useState(6);

  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => {
      setAnimFace((prev) => (prev % 6) + 1);
    }, 75);
    return () => clearInterval(id);
  }, [rolling]);

  const shownVal = rolling ? animFace : value;

  const pips: Record<number, [number, number][]> = {
    1: [[26, 26]],
    2: [
      [15, 15],
      [37, 37],
    ],
    3: [
      [15, 15],
      [26, 26],
      [37, 37],
    ],
    4: [
      [15, 15],
      [37, 15],
      [15, 37],
      [37, 37],
    ],
    5: [
      [15, 15],
      [37, 15],
      [26, 26],
      [15, 37],
      [37, 37],
    ],
    6: [
      [15, 13],
      [37, 13],
      [15, 26],
      [37, 26],
      [15, 39],
      [37, 39],
    ],
  };

  const dots = shownVal && pips[shownVal] ? pips[shownVal] : [];

  return (
    <svg width="56" height="56" viewBox="0 0 52 52" aria-hidden="true">
      <defs>
        <linearGradient id="diceBodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="3"
        width="46"
        height="46"
        rx="13"
        fill="url(#diceBodyGrad)"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      <rect
        x="6"
        y="6"
        width="40"
        height="40"
        rx="10"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      {dots.length > 0 ? (
        dots.map(([cx, cy], idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={shownVal === 1 ? 6 : 4.3}
            fill={shownVal === 1 ? '#ef4444' : '#0f172a'}
          />
        ))
      ) : (
        <>
          <circle cx="26" cy="20" r="3.5" fill="#7c5cfa" />
          <text
            x="26"
            y="37"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="900"
            fill="#4c1d95"
          >
            ROLL
          </text>
        </>
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
            {lang === 'bn'
              ? 'মাল্টিপ্লেয়ার লুডু এবং সাপ-লুডু অ্যারেনা'
              : 'BFFquest Royal Board Arena'}
          </h1>
          <p style={{ margin: 0, color: 'var(--t2)' }}>
            {lang === 'bn'
              ? 'পছন্দের রঙের ঘুঁটি বেছে নিন, রুম কোড শেয়ার করুন এবং ১ ঘর ১ ঘর করে স্মুথ অ্যানিমেশনে খেলুন!'
              : 'Pick your 3D pawn colour, share the room code, and play live with step-by-step animations.'}
          </p>
        </div>

        <form
          onSubmit={handleQuickJoin}
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
        >
          <input
            className="form-input"
            style={{ width: 175, minHeight: 42, textTransform: 'uppercase', fontWeight: 700 }}
            placeholder="Room Code (e.g. ADZAHP)"
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
              <span className="t ok">2 or 4 Players • Custom Colour Pick</span>
              <span className="t">3D Pawns</span>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.9rem' }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 20,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  placeItems: 'center',
                  padding: 6,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <PawnPreviewSvg color="red" size={26} />
                <PawnPreviewSvg color="green" size={26} />
                <PawnPreviewSvg color="blue" size={26} />
                <PawnPreviewSvg color="yellow" size={26} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Classic Ludo</h2>
                <span style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
                  Royal 4-Colour Cross Board
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--t2)', fontSize: '0.94rem', marginBottom: '1.25rem' }}>
              Pick your favorite colour (Red, Green, Yellow, or Blue), roll 6 to deploy your 3D
              pawns, watch them hop step-by-step across the 52-tile track, capture opponents, and
              race into the royal home crown!
            </p>
          </div>

          <Link to="/games/ludo" className="b" style={{ width: '100%' }}>
            <Play size={17} /> Play Classic Ludo
          </Link>
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
              <span className="t ok">2 or 4 Players • 1–100 Serpentine</span>
              <span className="t">Snakes & Ladders</span>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.9rem' }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 20,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '2rem',
                  background: 'rgba(16,185,129,0.16)',
                  border: '1px solid rgba(16,185,129,0.35)',
                }}
              >
                🐍🪜
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Snake Ludo</h2>
                <span style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
                  10×10 Illustrated Snakes & Ladders
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--t2)', fontSize: '0.94rem', marginBottom: '1.25rem' }}>
              Step tile-by-tile from Square 1 to Square 100! Climb multi-rung golden ladders to
              shortcut up the board, dodge coiled snakes, and land on 100 with an exact roll.
            </p>
          </div>

          <Link to="/games/snake-ludo" className="b" style={{ width: '100%' }}>
            <Play size={17} /> Play Snake Ludo
          </Link>
        </div>
      </div>

      <div
        className="g"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <strong style={{ fontSize: '1.05rem' }}>
            Looking for Friendship Quizzes, AMA Inbox & Party Polls?
          </strong>
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
 * 2. MODE SELECTION & COLOR PICKING PAGE (/games/ludo & /games/snake-ludo)
 * ============================================================================ */
export const LudoModeSelectPage: React.FC<{
  mode: LudoGameMode;
  user: AuthUser | null;
  lang: Lang;
}> = ({ mode, user }) => {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [preferredColor, setPreferredColor] = useState<LudoColor>('red');
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
        preferredColor,
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
        preferredColor,
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

      <div className="game-stage" style={{ ['--a' as any]: isClassic ? '#7C5CFA' : '#10B981' }}>
        <span className="t ok">
          {isClassic ? 'Classic 4-Colour Ludo' : 'Snake Ludo (1–100 Snakes & Ladders)'}
        </span>
        <h1 style={{ margin: '0.45rem 0 0.3rem' }}>
          {isClassic ? 'Setup Your Classic Ludo Room' : 'Setup Your Snake Ludo Room'}
        </h1>
        <p style={{ color: 'var(--t2)', marginTop: 0, marginBottom: '1.35rem' }}>
          Choose your player count, pick your favorite 3D pawn colour, and invite friends with a
          room code or link.
        </p>

        {!ludoApi.isOnlineReady && (
          <div className="alert-error">
            Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are
            required for real-time online multiplayer.
          </div>
        )}

        {err && <div className="alert-error">{err}</div>}

        <div className="form-group">
          <label className="form-label">1. Your Player Name *</label>
          <input
            className="form-input"
            placeholder="e.g., Ahad"
            maxLength={32}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">2. Select Player Mode *</label>
          <div className="seg">
            <button
              type="button"
              className={playerCount === 2 ? 'on' : ''}
              onClick={() => setPlayerCount(2)}
            >
              2 Players (1v1 Duel)
            </button>
            <button
              type="button"
              className={playerCount === 4 ? 'on' : ''}
              onClick={() => setPlayerCount(4)}
            >
              4 Players (4-Way Royal)
            </button>
          </div>
        </div>

        <div className="form-group">
          <label
            className="form-label"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Palette size={15} /> 3. Pick Your Pawn Colour *
          </label>
          <div className="ludo-color-picker-grid">
            {ALL_LUDO_COLORS.map((c) => {
              const isSelected = preferredColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPreferredColor(c)}
                  className={`ludo-color-option ${isSelected ? 'selected' : ''}`}
                  style={{ ['--pick-color' as any]: COLOR_HEX[c] }}
                >
                  <PawnPreviewSvg color={c} size={36} />
                  <span>{COLOR_LABEL[c]}</span>
                  {isSelected && (
                    <span
                      className="t ok"
                      style={{ fontSize: '0.64rem', padding: '0.1rem 0.45rem' }}
                    >
                      Selected ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={busy || !ludoApi.isOnlineReady}
          onClick={handleCreateRoom}
          className="b"
          style={{ width: '100%', minHeight: 52, marginTop: '0.6rem' }}
        >
          {busy
            ? 'Creating Room...'
            : `Create ${playerCount}-Player Room as ${COLOR_LABEL[preferredColor]}`}
        </button>

        <div
          style={{
            margin: '1.6rem 0 0.4rem',
            paddingTop: '1.2rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <label className="form-label">Or Join a Friend’s Room Code</label>
          <form
            onSubmit={handleJoinByCode}
            style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}
          >
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
 * 3. ROYAL CLASSIC LUDO 15x15 SVG BOARD (WITH 3D PAWNS & STEP HOPPING)
 * ============================================================================ */
const ClassicLudoBoardSvg: React.FC<{
  state: ClassicLudoState;
  displayTokens: Record<LudoColor, [number, number, number, number]>;
  hoppingToken: { color: LudoColor; tokenIndex: number } | null;
  myColor: LudoColor | null;
  canMoveToken: boolean;
  onSelectToken: (tokenIndex: number) => void;
}> = ({ state, displayTokens, hoppingToken, myColor, canMoveToken, onSelectToken }) => {
  const legalIndices =
    canMoveToken && myColor && state.turnColor === myColor
      ? new Set(getLegalTokenIndicesForClassic(state, myColor, state.diceValue))
      : new Set<number>();

  // Group displayed tokens by grid coordinate so stacked tokens offset cleanly
  const coordGroups = new Map<
    string,
    { color: LudoColor; tokenIndex: number; step: number; row: number; col: number }[]
  >();

  for (const color of state.activeColors) {
    const tokens = displayTokens[color] || state.tokens[color] || [-1, -1, -1, -1];
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
        <defs>
          {ALL_LUDO_COLORS.map((c) => (
            <radialGradient key={`grad_${c}`} id={`board_pawn_${c}`} cx="35%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="26%" stopColor={COLOR_LIGHT_HEX[c]} />
              <stop offset="70%" stopColor={COLOR_HEX[c]} />
              <stop offset="100%" stopColor={COLOR_DARK_HEX[c]} />
            </radialGradient>
          ))}
          <linearGradient id="boardTrackTile" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Board Base */}
        <rect x="0" y="0" width="15" height="15" fill="#1e293b" />

        {/* 4 Royal Corner Yards (6x6 each) */}
        {[
          { color: 'red' as LudoColor, x: 0, y: 0 },
          { color: 'green' as LudoColor, x: 9, y: 0 },
          { color: 'yellow' as LudoColor, x: 9, y: 9 },
          { color: 'blue' as LudoColor, x: 0, y: 9 },
        ].map(({ color, x, y }) => {
          const isActiveTurn = state.turnColor === color;
          return (
            <g key={`yard_${color}`}>
              <rect
                x={x}
                y={y}
                width="6"
                height="6"
                fill={COLOR_HEX[color]}
                stroke="#0f172a"
                strokeWidth="0.08"
              />
              {/* Inner White/Glass Yard Box */}
              <rect
                x={x + 0.85}
                y={y + 0.85}
                width="4.3"
                height="4.3"
                rx="0.65"
                fill="#f8fafc"
                stroke={isActiveTurn ? '#fde047' : COLOR_DARK_HEX[color]}
                strokeWidth={isActiveTurn ? '0.14' : '0.08'}
              />
              {/* Corner Label */}
              <text
                x={x + 3}
                y={y + 0.58}
                textAnchor="middle"
                fontSize="0.38"
                fontWeight="900"
                fill="#ffffff"
                letterSpacing="0.04"
              >
                {COLOR_LABEL[color].toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* 4 Recessed Base Sockets per Yard */}
        {ALL_LUDO_COLORS.map((c) =>
          BASE_TOKEN_COORDS[c].map(([r, col], idx) => (
            <g key={`${c}_base_socket_${idx}`}>
              <circle
                cx={col + 0.5}
                cy={r + 0.5}
                r="0.54"
                fill={COLOR_HEX[c]}
                fillOpacity="0.22"
                stroke={COLOR_HEX[c]}
                strokeWidth="0.08"
              />
              <circle
                cx={col + 0.5}
                cy={r + 0.5}
                r="0.36"
                fill={COLOR_HEX[c]}
                fillOpacity="0.45"
              />
            </g>
          ))
        )}

        {/* 52 Outer Track Tiles */}
        {OUTER_TRACK_COORDS.map(([r, c], idx) => {
          let fill = 'url(#boardTrackTile)';
          let startArrow = '';
          if (idx === START_TRACK_INDEX.red) {
            fill = COLOR_HEX.red;
            startArrow = '➔';
          } else if (idx === START_TRACK_INDEX.green) {
            fill = COLOR_HEX.green;
            startArrow = '⬇';
          } else if (idx === START_TRACK_INDEX.yellow) {
            fill = COLOR_HEX.yellow;
            startArrow = '⬅';
          } else if (idx === START_TRACK_INDEX.blue) {
            fill = COLOR_HEX.blue;
            startArrow = '⬆';
          }

          const isStar = STAR_TRACK_INDICES.has(idx);

          return (
            <g key={`track_${idx}`}>
              <rect
                x={c}
                y={r}
                width="1"
                height="1"
                rx="0.08"
                fill={fill}
                stroke="#475569"
                strokeWidth="0.045"
              />
              {startArrow && (
                <text
                  x={c + 0.5}
                  y={r + 0.68}
                  textAnchor="middle"
                  fontSize="0.52"
                  fontWeight="900"
                  fill="#ffffff"
                >
                  {startArrow}
                </text>
              )}
              {isStar && (
                <g transform={`translate(${c + 0.5}, ${r + 0.5})`}>
                  <circle r="0.36" fill="rgba(245, 158, 11, 0.2)" />
                  <text
                    x="0"
                    y="0.18"
                    textAnchor="middle"
                    fontSize="0.55"
                    fill="#d97706"
                  >
                    ★
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 4 Colored Home Lanes (Steps 51..55) with Directional Chevrons */}
        {ALL_LUDO_COLORS.map((color) =>
          HOME_LANE_COORDS[color].slice(0, 5).map(([r, c], i) => (
            <g key={`home_lane_${color}_${i}`}>
              <rect
                x={c}
                y={r}
                width="1"
                height="1"
                rx="0.06"
                fill={COLOR_HEX[color]}
                stroke="#ffffff"
                strokeWidth="0.05"
              />
              <circle
                cx={c + 0.5}
                cy={r + 0.5}
                r="0.14"
                fill="#ffffff"
                fillOpacity="0.45"
              />
            </g>
          ))
        )}

        {/* Center 3x3 Royal Home Zone */}
        <polygon points="6,6 6,9 7.5,7.5" fill={COLOR_HEX.red} stroke="#ffffff" strokeWidth="0.06" />
        <polygon
          points="6,6 9,6 7.5,7.5"
          fill={COLOR_HEX.green}
          stroke="#ffffff"
          strokeWidth="0.06"
        />
        <polygon
          points="9,6 9,9 7.5,7.5"
          fill={COLOR_HEX.yellow}
          stroke="#ffffff"
          strokeWidth="0.06"
        />
        <polygon
          points="6,9 9,9 7.5,7.5"
          fill={COLOR_HEX.blue}
          stroke="#ffffff"
          strokeWidth="0.06"
        />
        <circle
          cx="7.5"
          cy="7.5"
          r="0.58"
          fill="#0f172a"
          stroke="#fde047"
          strokeWidth="0.08"
        />
        <text x="7.5" y="7.72" textAnchor="middle" fontSize="0.62">
          👑
        </text>

        {/* Render 3D Sculpted Pawn Tokens ("Guti") */}
        {Array.from(coordGroups.values()).map((group) =>
          group.map((item, stackIdx) => {
            const isSelectable =
              item.color === myColor && legalIndices.has(item.tokenIndex);
            const isHopping =
              hoppingToken?.color === item.color &&
              hoppingToken?.tokenIndex === item.tokenIndex;

            const offsets: [number, number][] =
              group.length === 1
                ? [[0, 0]]
                : [
                    [-0.18, -0.16],
                    [0.18, -0.16],
                    [-0.18, 0.18],
                    [0.18, 0.18],
                  ];
            const [dx, dy] = offsets[stackIdx % 4];
            const cx = item.col + 0.5 + dx;
            const cy = item.row + 0.5 + dy;
            const scale = group.length > 1 ? 0.78 : 1;

            return (
              <g
                key={`tok_${item.color}_${item.tokenIndex}`}
                transform={`translate(${cx}, ${cy}) scale(${scale})`}
                className={`ludo-token-group ${isSelectable ? '' : 'disabled'}`}
                onClick={() => {
                  if (isSelectable) onSelectToken(item.tokenIndex);
                }}
              >
                <g className={`ludo-token-inner ${isHopping ? 'hopping' : ''}`}>
                  {/* Rotating Selection Halo */}
                  {isSelectable && (
                    <>
                      <circle cx="0" cy="0.05" r="0.48" className="ludo-token-selectable-ring" />
                      <polygon
                        points="0,-0.62 -0.16,-0.84 0.16,-0.84"
                        fill="#fde047"
                        stroke="#0f172a"
                        strokeWidth="0.03"
                        className="ludo-token-pointer"
                      />
                    </>
                  )}

                  {/* Ground Drop Shadow */}
                  <ellipse
                    cx="0"
                    cy="0.26"
                    rx={isHopping ? '0.22' : '0.32'}
                    ry={isHopping ? '0.08' : '0.13'}
                    fill="rgba(0,0,0,0.48)"
                  />

                  {/* Metallic Base Ring */}
                  <ellipse
                    cx="0"
                    cy="0.2"
                    rx="0.28"
                    ry="0.11"
                    fill={COLOR_DARK_HEX[item.color]}
                    stroke="#ffffff"
                    strokeWidth="0.055"
                  />

                  {/* Sculpted 3D Pawn Body */}
                  <path
                    d="M -0.22 0.18 C -0.22 -0.06, -0.12 -0.16, -0.08 -0.26 C -0.16 -0.32, -0.15 -0.5, 0 -0.5 C 0.15 -0.5, 0.16 -0.32, 0.08 -0.26 C 0.12 -0.16, 0.22 -0.06, 0.22 0.18 Z"
                    fill={`url(#board_pawn_${item.color})`}
                    stroke="#ffffff"
                    strokeWidth="0.055"
                    strokeLinejoin="round"
                  />

                  {/* Glossy Specular Crown Highlight */}
                  <ellipse
                    cx="-0.05"
                    cy="-0.39"
                    rx="0.075"
                    ry="0.042"
                    fill="#ffffff"
                    fillOpacity="0.9"
                    transform="rotate(-20 -0.05 -0.39)"
                  />

                  {/* Token Number Badge */}
                  <text
                    x="0"
                    y="0.11"
                    textAnchor="middle"
                    fontSize="0.22"
                    fontWeight="900"
                    fill="#ffffff"
                  >
                    {item.tokenIndex + 1}
                  </text>
                </g>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

/* ============================================================================
 * 4. SNAKE LUDO 10x10 SERPENTINE BOARD (WITH REAL LADDERS, SNAKES & 3D PAWNS)
 * ============================================================================ */
const SnakeLudoBoardView: React.FC<{
  state: SnakeLudoState;
  displayPositions: Record<LudoColor, number>;
  hoppingColor: LudoColor | null;
}> = ({ state, displayPositions, hoppingColor }) => {
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
            (color) => (displayPositions[color] ?? state.positions[color]) === cell.num
          );

          return (
            <div
              key={cell.num}
              className={`snake-cell ${(cell.row + cell.col) % 2 === 1 ? 'alt' : ''} ${
                ladderTop ? 'is-ladder' : ''
              } ${snakeTail ? 'is-snake' : ''} ${cell.num === 100 ? 'is-100' : ''}`}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 4,
                }}
              >
                <span>{cell.num}</span>
                {ladderTop && (
                  <span style={{ fontSize: '0.54rem', color: '#10b981' }}>▲{ladderTop}</span>
                )}
                {snakeTail && (
                  <span style={{ fontSize: '0.54rem', color: '#ef4444' }}>▼{snakeTail}</span>
                )}
                {cell.num === 100 && <span>👑</span>}
              </div>

              {playersHere.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    marginTop: 'auto',
                    zIndex: 5,
                  }}
                >
                  {playersHere.map((c) => (
                    <div
                      key={c}
                      style={{
                        transform: hoppingColor === c ? 'translateY(-4px) scale(1.18)' : 'none',
                        transition: 'transform 0.14s ease',
                      }}
                      title={COLOR_LABEL[c]}
                    >
                      <PawnPreviewSvg color={c} size={playersHere.length > 1 ? 18 : 24} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Illustrated Multi-Rung Ladders & Coiled Snakes SVG Overlay */}
      <svg viewBox="0 0 100 100" className="snake-overlay-svg">
        {/* Render Realistic Ladders with 2 Side Rails + Rungs */}
        {Object.entries(SNAKE_BOARD_DEFAULT_CONFIG.ladders).map(([fromStr, to]) => {
          const from = Number(fromStr);
          const a = getSnakeSquareCoord(from);
          const b = getSnakeSquareCoord(to);
          const x1 = a.col * 10 + 5;
          const y1 = a.row * 10 + 5;
          const x2 = b.col * 10 + 5;
          const y2 = b.row * 10 + 5;

          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.hypot(dx, dy) || 1;
          const nx = (-dy / len) * 1.45;
          const ny = (dx / len) * 1.45;
          const numRungs = Math.max(4, Math.floor(len / 4.2));

          return (
            <g key={`ladder_${from}`} opacity="0.82">
              <line
                x1={x1 - nx}
                y1={y1 - ny}
                x2={x2 - nx}
                y2={y2 - ny}
                stroke="#f59e0b"
                strokeWidth="0.85"
                strokeLinecap="round"
              />
              <line
                x1={x1 + nx}
                y1={y1 + ny}
                x2={x2 + nx}
                y2={y2 + ny}
                stroke="#f59e0b"
                strokeWidth="0.85"
                strokeLinecap="round"
              />
              {Array.from({ length: numRungs - 1 }, (_, i) => {
                const t = (i + 1) / numRungs;
                const rx = x1 + dx * t;
                const ry = y1 + dy * t;
                return (
                  <line
                    key={i}
                    x1={rx - nx}
                    y1={ry - ny}
                    x2={rx + nx}
                    y2={ry + ny}
                    stroke="#fef08a"
                    strokeWidth="0.65"
                  />
                );
              })}
            </g>
          );
        })}

        {/* Render Coiled Snakes with Head, Eyes & Tail */}
        {Object.entries(SNAKE_BOARD_DEFAULT_CONFIG.snakes).map(([headStr, tail]) => {
          const head = Number(headStr);
          const a = getSnakeSquareCoord(head);
          const b = getSnakeSquareCoord(tail);
          const x1 = a.col * 10 + 5;
          const y1 = a.row * 10 + 5;
          const x2 = b.col * 10 + 5;
          const y2 = b.row * 10 + 5;

          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const cx1 = (x1 + mx) / 2 + 5.5;
          const cy1 = (y1 + my) / 2 - 2;
          const cx2 = (mx + x2) / 2 - 5.5;
          const cy2 = (my + y2) / 2 + 2;

          return (
            <g key={`snake_${head}`} opacity="0.85">
              <path
                d={`M ${x1} ${y1} Q ${cx1} ${cy1} ${mx} ${my} T ${x2} ${y2}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <path
                d={`M ${x1} ${y1} Q ${cx1} ${cy1} ${mx} ${my} T ${x2} ${y2}`}
                fill="none"
                stroke="#fde047"
                strokeWidth="0.9"
                strokeDasharray="1.4 1.8"
                strokeLinecap="round"
              />
              {/* Snake Head at x1, y1 */}
              <circle cx={x1} cy={y1} r="1.8" fill="#dc2626" stroke="#ffffff" strokeWidth="0.3" />
              <circle cx={x1 - 0.6} cy={y1 - 0.4} r="0.4" fill="#ffffff" />
              <circle cx={x1 + 0.6} cy={y1 - 0.4} r="0.4" fill="#ffffff" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ============================================================================
 * 5. MULTIPLAYER ROOM PAGE (WITH 1-BY-1 STEP ANIMATOR & LOBBY COLOR SWITCHER)
 * ============================================================================ */
export const MultiplayerLudoRoomPage: React.FC<{
  expectedMode: LudoGameMode;
  user: AuthUser | null;
  lang: Lang;
}> = ({ user }) => {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const playerKey = getPlayerSessionKey(user);

  const [room, setRoom] = useState<LudoRoomRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [joinName, setJoinName] = useState(user?.displayName || '');
  const [joinColor, setJoinColor] = useState<LudoColor>('yellow');
  const [joining, setJoining] = useState(false);
  const [rollingAnim, setRollingAnim] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [onlineKeys, setOnlineKeys] = useState<Set<string>>(new Set());

  // Step-by-Step Visual Interpolation State (Prevents Teleportation!)
  const [displayTokens, setDisplayTokens] = useState<
    Record<LudoColor, [number, number, number, number]>
  >({
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1],
  });
  const [hoppingToken, setHoppingToken] = useState<{
    color: LudoColor;
    tokenIndex: number;
  } | null>(null);

  const [displaySnakePos, setDisplaySnakePos] = useState<Record<LudoColor, number>>({
    red: 1,
    green: 1,
    yellow: 1,
    blue: 1,
  });
  const [hoppingSnakeColor, setHoppingSnakeColor] = useState<LudoColor | null>(null);

  const [eventBanner, setEventBanner] = useState<{
    id: number;
    text: string;
    type: 'six' | 'capture' | 'ladder' | 'snake' | 'info';
  } | null>(null);

  const isInitializedRef = useRef(false);
  const stepTimerRef = useRef<number | null>(null);

  const triggerBanner = (
    text: string,
    type: 'six' | 'capture' | 'ladder' | 'snake' | 'info' = 'info'
  ) => {
    setEventBanner({ id: Date.now(), text, type });
  };

  // Step-by-Step 1-Square-at-a-Time Animator whenever room.board_state updates
  useEffect(() => {
    if (!room) return;
    const bs = room.board_state;

    if (bs.diceValue === 6 && bs.phase === 'WAITING_FOR_MOVE') {
      triggerBanner('🎲 ROLLED A 6! EXTRA ROLL!', 'six');
    }

    if (room.mode === 'classic') {
      const target = (bs as ClassicLudoState).tokens;
      if (!isInitializedRef.current) {
        setDisplayTokens({
          red: [...target.red] as [number, number, number, number],
          green: [...target.green] as [number, number, number, number],
          yellow: [...target.yellow] as [number, number, number, number],
          blue: [...target.blue] as [number, number, number, number],
        });
        isInitializedRef.current = true;
        return;
      }

      // Find any token that advanced forward or left base
      let mover: {
        color: LudoColor;
        tokenIndex: number;
        fromStep: number;
        toStep: number;
      } | null = null;
      const capturedList: { color: LudoColor; tokenIndex: number }[] = [];

      for (const c of ALL_LUDO_COLORS) {
        for (let i = 0; i < 4; i++) {
          const cur = displayTokens[c][i];
          const nxt = target[c][i];
          if (cur !== nxt) {
            if (nxt === -1 && cur >= 0) {
              capturedList.push({ color: c, tokenIndex: i });
            } else if (nxt > cur) {
              mover = { color: c, tokenIndex: i, fromStep: cur, toStep: nxt };
            }
          }
        }
      }

      if (!mover) {
        setDisplayTokens({
          red: [...target.red] as [number, number, number, number],
          green: [...target.green] as [number, number, number, number],
          yellow: [...target.yellow] as [number, number, number, number],
          blue: [...target.blue] as [number, number, number, number],
        });
        return;
      }

      if (stepTimerRef.current) window.clearInterval(stepTimerRef.current);

      const { color, tokenIndex, fromStep, toStep } = mover;

      // Case A: Token released from base (-1 -> 0)
      if (fromStep === -1 && toStep === 0) {
        setHoppingToken({ color, tokenIndex });
        playSynthSound('release', soundOn);
        setDisplayTokens((prev) => {
          const next = { ...prev, [color]: [...prev[color]] as [number, number, number, number] };
          next[color][tokenIndex] = 0;
          return next;
        });
        setTimeout(() => setHoppingToken(null), 220);
        return;
      }

      // Case B: Step 1 square at a time (fromStep + 1 ... toStep)
      let currentStep = fromStep;
      stepTimerRef.current = window.setInterval(() => {
        currentStep += 1;
        setHoppingToken({ color, tokenIndex });
        playSynthSound('step', soundOn);

        setDisplayTokens((prev) => {
          const next = { ...prev, [color]: [...prev[color]] as [number, number, number, number] };
          next[color][tokenIndex] = currentStep;
          return next;
        });

        if (currentStep >= toStep) {
          if (stepTimerRef.current) window.clearInterval(stepTimerRef.current);
          setTimeout(() => setHoppingToken(null), 160);

          if (capturedList.length > 0) {
            triggerBanner('💥 OPPONENT CAPTURED! +1 EXTRA ROLL!', 'capture');
            playSynthSound('capture', soundOn);
          } else if (toStep === 56) {
            triggerBanner('👑 TOKEN REACHED HOME!', 'six');
            playSynthSound('win', soundOn);
          }

          // Sync all tokens (including any captured tokens returning to -1)
          setDisplayTokens({
            red: [...target.red] as [number, number, number, number],
            green: [...target.green] as [number, number, number, number],
            yellow: [...target.yellow] as [number, number, number, number],
            blue: [...target.blue] as [number, number, number, number],
          });
        }
      }, 155);
    } else {
      // Snake Ludo 1-by-1 Square Step Animator
      const targetPos = (bs as SnakeLudoState).positions;
      if (!isInitializedRef.current) {
        setDisplaySnakePos({ ...targetPos });
        isInitializedRef.current = true;
        return;
      }

      let movedColor: LudoColor | null = null;
      for (const c of ALL_LUDO_COLORS) {
        if (displaySnakePos[c] !== targetPos[c]) {
          movedColor = c;
          break;
        }
      }

      if (!movedColor) return;
      if (stepTimerRef.current) window.clearInterval(stepTimerRef.current);

      const c = movedColor;
      const startSq = displaySnakePos[c];
      const finalSq = targetPos[c];

      // Determine intermediate landed square if a ladder or snake was triggered
      let landedSq = finalSq;
      for (let d = 1; d <= 6; d++) {
        const candidate = startSq + d;
        if (SNAKE_BOARD_DEFAULT_CONFIG.ladders[candidate] === finalSq) {
          landedSq = candidate;
          break;
        }
        if (SNAKE_BOARD_DEFAULT_CONFIG.snakes[candidate] === finalSq) {
          landedSq = candidate;
          break;
        }
      }

      let curSq = startSq;
      stepTimerRef.current = window.setInterval(() => {
        if (curSq < landedSq) {
          curSq += 1;
          setHoppingSnakeColor(c);
          playSynthSound('step', soundOn);
          setDisplaySnakePos((prev) => ({ ...prev, [c]: curSq }));
        } else {
          if (stepTimerRef.current) window.clearInterval(stepTimerRef.current);
          setHoppingSnakeColor(null);

          if (finalSq > landedSq) {
            triggerBanner(`🪜 CLIMBED LADDER ${landedSq} → ${finalSq}!`, 'ladder');
            playSynthSound('ladder', soundOn);
            setTimeout(() => {
              setDisplaySnakePos((prev) => ({ ...prev, [c]: finalSq }));
            }, 220);
          } else if (finalSq < landedSq) {
            triggerBanner(`🐍 SNAKE BITE AT ${landedSq} → ${finalSq}!`, 'snake');
            playSynthSound('snake', soundOn);
            setTimeout(() => {
              setDisplaySnakePos((prev) => ({ ...prev, [c]: finalSq }));
            }, 220);
          } else {
            setDisplaySnakePos((prev) => ({ ...prev, [c]: finalSq }));
          }
        }
      }, 155);
    }
  }, [room?.version, room?.board_state]);

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

      const alreadyIn = fetched.players.some((p) => p.playerKey === playerKey);
      if (alreadyIn) {
        const rejoined = await ludoApi.joinRoom({
          roomIdentifier: fetched.id,
          playerKey,
          displayName:
            user?.displayName ||
            fetched.players.find((p) => p.playerKey === playerKey)?.displayName ||
            'Player',
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
          setTimeout(() => setRollingAnim(false), 550);
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
      if (stepTimerRef.current) window.clearInterval(stepTimerRef.current);
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
  const isMyTurn = Boolean(
    myColor && boardState.turnColor === myColor && room.status === 'playing'
  );

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
        preferredColor: joinColor,
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
    ctx.fillText(
      `🏆 Winner: ${winnerPlayer?.displayName || boardState.winnerColor || 'Player'}`,
      60,
      175
    );

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
   * LOBBY VIEW (WITH COLOR PICKING / SWITCHING)
   * ========================================================================== */
  if (room.status === 'waiting') {
    const allJoined = room.players.length === room.max_players;
    const allReady = allJoined && room.players.every((p) => p.ready);
    const takenColors = new Set(room.players.map((p) => p.color));

    return (
      <div className="container ludo-page-wrap animate-in" style={{ maxWidth: 740 }}>
        <div
          className="game-stage"
          style={{ ['--a' as any]: room.mode === 'classic' ? '#7C5CFA' : '#10B981' }}
        >
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
            <div>
              <span className="t ok">
                {room.mode === 'classic' ? 'Classic Ludo Lobby' : 'Snake Ludo Lobby'} •{' '}
                {room.max_players} Players
              </span>
              <h1 style={{ margin: '0.35rem 0 0', fontSize: '1.85rem' }}>
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

          {/* Share Link & WhatsApp Invite */}
          <div className="g" style={{ marginBottom: '1.2rem' }}>
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
                  `Join my ${
                    room.mode === 'classic' ? 'Classic Ludo' : 'Snake Ludo'
                  } room (${room.room_code}) on ${BRAND.name}! ${inviteUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="b btn-whatsapp btn-sm"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Visitor Join Form with Color Picker */}
          {!myPlayer && room.players.length < room.max_players && (
            <form onSubmit={handleJoinSeat} className="g" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                Join Match & Pick Your Colour
              </h3>
              <div className="ludo-color-picker-grid" style={{ marginBottom: '0.9rem' }}>
                {ALL_LUDO_COLORS.map((c) => {
                  const isTaken = takenColors.has(c);
                  const isSelected = joinColor === c && !isTaken;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setJoinColor(c)}
                      className={`ludo-color-option ${isSelected ? 'selected' : ''}`}
                      style={{ ['--pick-color' as any]: COLOR_HEX[c] }}
                    >
                      <PawnPreviewSvg color={c} size={32} />
                      <span>{COLOR_LABEL[c]}</span>
                      <span className="t" style={{ fontSize: '0.62rem' }}>
                        {isTaken ? 'Taken' : isSelected ? 'Selected ✓' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
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

          {/* Interactive 4-Colour Picker for Joined Players */}
          {myPlayer && (
            <div className="g" style={{ marginBottom: '1.25rem' }}>
              <label
                className="form-label"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Palette size={15} /> Choose Your Pawn Colour (Tap any available colour to switch)
              </label>
              <div className="ludo-color-picker-grid">
                {ALL_LUDO_COLORS.map((c) => {
                  const holder = room.players.find((p) => p.color === c);
                  const isMine = myPlayer.color === c;
                  const isTakenByOther = Boolean(holder && !isMine);

                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isTakenByOther}
                      onClick={async () => {
                        if (isMine || isTakenByOther) return;
                        try {
                          setErr(null);
                          const updated = await ludoApi.changeColor(room.id, playerKey, c);
                          setRoom(updated);
                        } catch (e: any) {
                          setErr(e.message);
                        }
                      }}
                      className={`ludo-color-option ${isMine ? 'selected' : ''}`}
                      style={{ ['--pick-color' as any]: COLOR_HEX[c] }}
                    >
                      <PawnPreviewSvg color={c} size={34} />
                      <span>{COLOR_LABEL[c]}</span>
                      <span className={`t ${isMine ? 'ok' : ''}`} style={{ fontSize: '0.65rem' }}>
                        {isMine
                          ? 'Your Colour ✓'
                          : holder
                          ? holder.displayName.slice(0, 10)
                          : 'Tap to Pick'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Joined Players List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              marginBottom: '1.4rem',
            }}
          >
            {room.players.map((p, idx) => {
              const isOnline = onlineKeys.has(p.playerKey) || p.connected;
              return (
                <div key={p.playerKey} className="ludo-player-pill">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <PawnPreviewSvg color={p.color} size={30} />
                    <div>
                      <strong>
                        Player #{idx + 1} ({COLOR_LABEL[p.color]}): {p.displayName}
                      </strong>
                      {p.playerKey === room.host_player_key && (
                        <span className="t" style={{ marginLeft: '0.45rem', fontSize: '0.68rem' }}>
                          HOST
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`t ${p.ready ? 'ok' : 'w'}`}>
                    {isOnline ? '● ' : ''}
                    {p.ready ? 'Ready ✓' : 'Not Ready'}
                  </span>
                </div>
              );
            })}

            {Array.from({ length: Math.max(0, room.max_players - room.players.length) }).map(
              (_, i) => (
                <div key={`empty_${i}`} className="ludo-player-pill" style={{ opacity: 0.6 }}>
                  <span>Waiting for Player #{room.players.length + i + 1} to join...</span>
                  <span className="t">Open Seat</span>
                </div>
              )
            )}
          </div>

          {/* Ready & Host Start Controls */}
          {myPlayer && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="b o btn-sm"
                style={{ minHeight: 44 }}
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
                  style={{ minHeight: 46, padding: '0 1.6rem' }}
                  onClick={async () => {
                    try {
                      setErr(null);
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
                <span style={{ color: 'var(--t2)', fontWeight: 600 }}>
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
   * IN-GAME & FINISHED MATCH VIEW (ROYAL ARCADE UI)
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
            {room.mode === 'classic' ? 'Classic Ludo Arena' : 'Snake Ludo Arena (1–100)'}
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
                <span
                  key={c}
                  className="t ok"
                  style={{ fontSize: '0.88rem', padding: '0.4rem 0.9rem' }}
                >
                  #{i + 1} {pl?.displayName || COLOR_LABEL[c]} ({COLOR_LABEL[c]})
                </span>
              );
            })}
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap' }}
          >
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
        {/* Left Column: Board with Floating Arcade Event Banner */}
        <div className="ludo-board-stage">
          {eventBanner && (
            <div key={eventBanner.id} className={`ludo-event-banner ${eventBanner.type}`}>
              {eventBanner.text}
            </div>
          )}

          {room.mode === 'classic' ? (
            <ClassicLudoBoardSvg
              state={boardState as ClassicLudoState}
              displayTokens={displayTokens}
              hoppingToken={hoppingToken}
              myColor={myColor}
              canMoveToken={
                isMyTurn && boardState.phase === 'WAITING_FOR_MOVE' && !hoppingToken
              }
              onSelectToken={handleMoveToken}
            />
          ) : (
            <SnakeLudoBoardView
              state={boardState as SnakeLudoState}
              displayPositions={displaySnakePos}
              hoppingColor={hoppingSnakeColor}
            />
          )}
        </div>

        {/* Right Column: Arcade Dice Dock, Player Cards & Match Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Turn & 3D Dice Dock */}
          <div className="g" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '0.65rem' }}>
              <span
                className="t"
                style={{
                  background: COLOR_HEX[boardState.turnColor],
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.3rem 0.9rem',
                  fontSize: '0.82rem',
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
                gap: '1.15rem',
                margin: '0.85rem 0',
              }}
            >
              <button
                type="button"
                className={`ludo-dice-btn ${rollingAnim ? 'rolling' : ''} ${
                  isMyTurn && boardState.phase === 'WAITING_FOR_ROLL' ? 'my-turn-glow' : ''
                }`}
                disabled={
                  !isMyTurn ||
                  boardState.phase !== 'WAITING_FOR_ROLL' ||
                  actionBusy ||
                  room.status !== 'playing'
                }
                onClick={handleRollDice}
                title={isMyTurn ? 'Tap to Roll Dice' : 'Wait for your turn'}
              >
                <DiceFaceSvg value={boardState.diceValue} rolling={rollingAnim} />
              </button>

              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>
                  {rollingAnim
                    ? 'Rolling Dice...'
                    : boardState.diceValue
                    ? `Rolled: ${boardState.diceValue}`
                    : 'Ready to Roll'}
                </strong>
                <span style={{ fontSize: '0.84rem', color: 'var(--t2)' }}>
                  {isMyTurn
                    ? boardState.phase === 'WAITING_FOR_ROLL'
                      ? '👉 Tap the 3D dice to roll!'
                      : room.mode === 'classic'
                      ? '👉 Tap a glowing pawn on the board!'
                      : '👉 Tap Move Token below!'
                    : 'Waiting for opponent’s move...'}
                </span>
              </div>
            </div>

            {room.mode === 'snake' && isMyTurn && boardState.phase === 'WAITING_FOR_MOVE' && (
              <button
                type="button"
                disabled={actionBusy}
                className="b"
                style={{ width: '100%', marginTop: '0.4rem' }}
                onClick={() => handleMoveToken(0)}
              >
                Move Pawn +{boardState.diceValue} Squares ›
              </button>
            )}

            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 14,
                background: 'rgba(124, 92, 250, 0.1)',
                border: '1px solid rgba(124, 92, 250, 0.24)',
                fontSize: '0.84rem',
                color: 'var(--cy)',
                fontWeight: 700,
              }}
            >
              {boardState.lastAction}
            </div>
          </div>

          {/* Players Status & Token Progress Pips */}
          <div className="g">
            <span className="lab" style={{ display: 'block', marginBottom: '0.65rem' }}>
              <Users size={13} /> Players & Pawn Progress
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {boardState.activeColors.map((color) => {
                const pl = room.players.find((p) => p.color === color);
                const isOnline = pl ? onlineKeys.has(pl.playerKey) || pl.connected : false;
                const isTurn = boardState.turnColor === color && room.status === 'playing';
                const toks =
                  room.mode === 'classic'
                    ? (boardState as ClassicLudoState).tokens[color] || [-1, -1, -1, -1]
                    : [];

                let statusSub = '';
                if (room.mode === 'classic') {
                  const homeCount = toks.filter((s) => s === 56).length;
                  const outCount = toks.filter((s) => s >= 0 && s < 56).length;
                  statusSub = `Home: ${homeCount}/4 • Track: ${outCount}`;
                } else {
                  const sq =
                    displaySnakePos[color] ??
                    (boardState as SnakeLudoState).positions[color] ??
                    1;
                  statusSub = `Square: ${sq} / 100`;
                }

                return (
                  <div
                    key={color}
                    className={`ludo-player-pill ${isTurn ? 'active-turn' : ''}`}
                    style={{ ['--turn-color' as any]: COLOR_HEX[color] }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <PawnPreviewSvg color={color} size={32} />
                      <div>
                        <strong style={{ fontSize: '0.94rem', display: 'block' }}>
                          {pl?.displayName || COLOR_LABEL[color]}
                          {pl?.playerKey === playerKey ? ' (You)' : ''}
                        </strong>
                        <div style={{ fontSize: '0.76rem', color: 'var(--t2)' }}>{statusSub}</div>
                        {room.mode === 'classic' && (
                          <div
                            className="ludo-pip-strip"
                            style={{ ['--pip-color' as any]: COLOR_HEX[color] }}
                          >
                            {toks.map((s, idx) => (
                              <span
                                key={idx}
                                className={`ludo-pip-token ${
                                  s === 56 ? 'home' : s >= 0 ? 'out' : ''
                                }`}
                                title={
                                  s === 56 ? 'Home' : s >= 0 ? 'On Track' : 'In Yard'
                                }
                              />
                            ))}
                          </div>
                        )}
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

          {/* Recent Match Log */}
          <div className="g">
            <span className="lab" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Recent Match Log
            </span>
            <div
              style={{
                maxHeight: 140,
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
                  <div
                    key={idx}
                    style={{
                      padding: '0.25rem 0',
                      borderBottom: '1px dashed rgba(255,255,255,0.08)',
                    }}
                  >
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
