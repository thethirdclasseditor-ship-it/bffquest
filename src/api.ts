import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BRAND,
  TEMPLATES,
  GAME_PRESETS,
  DAILY_QUESTS,
  QuizQuestion,
  Lang,
  GameType,
  DailyQuestItem,
} from './config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('placeholder')
);

const REMEMBER_ME_KEY = `${BRAND.storagePrefix}remember_me`;

export function getRememberMePref(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
}

export function setRememberMePref(remember: boolean) {
  localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false');
}

/**
 * Problem #11 Fix: Real storage routing based on "Remember me" preference.
 * When Remember Me is ON -> persists in localStorage.
 * When Remember Me is OFF -> persists only in sessionStorage for the current browser session.
 */
const customAuthStorage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (getRememberMePref()) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: customAuthStorage,
      },
    })
  : null;

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  provider: string;
}

export interface LeaderboardEntry {
  submissionId: string;
  participantNickname: string;
  score: number;
  totalQuestions: number;
  scorePercentage: number;
  submittedAt: string;
}

export interface CustomAnswerItem {
  questionText: string;
  customAnswer: string;
}

export interface QuestionResultDetail {
  questionId: string;
  position: number;
  questionText: string;
  options: { id: string; text: string; icon?: string; isCustom?: boolean }[];
  selectedOptionId: string;
  customText?: string;
  correctOptionId: string;
  isCorrect: boolean;
}

export interface VoteStatItem {
  opt_1: number;
  opt_2: number;
  total: number;
}

export interface PublicQuiz {
  id: string;
  slug: string;
  creatorDisplayName: string;
  title: string;
  description: string;
  status: 'published' | 'disabled' | 'draft';
  gameType?: GameType;
  settings?: Record<string, any>;
  totalParticipants?: number;
  questions: QuizQuestion[];
  leaderboard?: LeaderboardEntry[];
  voteStats?: Record<string, VoteStatItem>;
}

export interface SubmissionResult {
  submissionId: string;
  resultToken: string;
  quizSlug: string;
  quizTitle: string;
  gameType?: GameType;
  creatorDisplayName: string;
  participantNickname: string;
  score: number;
  totalQuestions: number;
  scorePercentage: number;
  customAnswers?: CustomAnswerItem[];
  details?: QuestionResultDetail[];
  submittedAt: string;
  clientFingerprint?: string;
}

export interface CreatorQuizSummary {
  id: string;
  slug: string;
  title: string;
  gameType: GameType;
  status: 'published' | 'disabled' | 'draft';
  questionCount: number;
  submissionCount: number;
  averageScorePercentage: number;
  submissions: SubmissionResult[];
}

export interface AmaQuestionItem {
  id: string;
  questionText: string;
  answerText: string;
  status: 'private' | 'published' | 'skipped' | 'blocked';
  isReported?: boolean;
  createdAt?: string;
  answeredAt?: string;
}

export interface AmaInboxData {
  id: string;
  slug: string;
  creatorDisplayName: string;
  promptText: string;
  isOpen: boolean;
  questions?: AmaQuestionItem[];
  publishedQuestions?: AmaQuestionItem[];
}

export interface WrappedRecapData {
  hasEnoughData: boolean;
  totalPlayed: number;
  totalCreated: number;
  bestScorePct: number;
  avgScorePct: number;
  topGameTitle: string;
  topGameMode: GameType;
  totalFriendsReached: number;
  currentStreak: number;
  unlockedBadges: string[];
}

export interface DailyQuestStatus {
  todayKey: string;
  quest: DailyQuestItem;
  isCompletedToday: boolean;
  currentStreak: number;
  completedDates: string[];
  unlockedBadges: string[];
}

export interface AdminQuizItem {
  id: string;
  slug: string;
  title: string;
  gameType?: GameType;
  creatorDisplayName: string;
  status: 'published' | 'disabled' | 'draft';
  createdAt: string;
  submissionCount: number;
}

export interface AdminReportItem {
  id: string;
  quizSlug: string | null;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
}

export interface AdminDashboardData {
  totalQuizzes: number;
  totalSubmissions: number;
  openReports: number;
  totalAmaQuestions?: number;
  quizzes: AdminQuizItem[];
  reports: AdminReportItem[];
}

interface LocalActivityRecord {
  playedGames: {
    slug: string;
    title: string;
    gameType: GameType;
    scorePercentage: number;
    playedAt: string;
  }[];
  createdGamesCount: number;
  completedQuestDates: string[];
  unlockedBadges: string[];
}

const LANG_KEY = `${BRAND.storagePrefix}lang`;
const QUIZZES_KEY = `${BRAND.storagePrefix}quizzes`;
const SUBS_KEY = `${BRAND.storagePrefix}subs`;
const AMA_KEY = `${BRAND.storagePrefix}ama_inbox`;
const ACTIVITY_KEY = `${BRAND.storagePrefix}activity`;
const CREATOR_TOKEN_KEY = `${BRAND.storagePrefix}creator_token`;
const ACTIVE_USER_ID_KEY = `${BRAND.storagePrefix}active_uid`;
const ADMIN_KEY_STORAGE = `${BRAND.storagePrefix}admin_key`;
const FP_KEY = `${BRAND.storagePrefix}fp`;

const SAMPLE_SLUGS = new Set([
  'sample-best-friend-quiz',
  'sample-guess-side',
  'sample-two-truths',
  'sample-blind-ranking',
  'sample-would-you-rather',
]);

const DEFAULT_CUSTOM_PLACEHOLDERS = new Set([
  'write your own answer...',
  'নিজের মতো উত্তর লিখুন...',
  'type your custom answer here...',
  'এখানে আপনার উত্তরটি লিখুন...',
]);

export function getSavedLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === 'bn' ? 'bn' : 'en';
}

export function saveLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function getSavedAdminKey(): string {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
}

export function saveAdminKey(key: string) {
  if (!key) {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } else {
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
  }
}

/**
 * Problem #1 Fix: Synchronous user-gesture-first copy helper.
 * Executes synchronous textarea + execCommand('copy') BEFORE any async await
 * so Safari/WebView/popunder scripts never cause user-gesture expiration.
 */
export async function copyTextSafely(
  text: string
): Promise<{ ok: boolean; method: 'clipboard' | 'fallback' | 'manual' }> {
  if (!text) return { ok: false, method: 'manual' };

  // 1. Run synchronous execCommand('copy') immediately while inside the click gesture
  let syncCopied = false;
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    syncCopied = document.execCommand('copy');
    document.body.removeChild(textArea);
  } catch {
    syncCopied = false;
  }

  // 2. Also attempt modern Clipboard API if available
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: 'clipboard' };
    } catch {
      if (syncCopied) {
        return { ok: true, method: 'fallback' };
      }
    }
  }

  if (syncCopied) {
    return { ok: true, method: 'fallback' };
  }

  return { ok: false, method: 'manual' };
}

function generateRandomHex(byteCount = 12): string {
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getCreatorToken(): string {
  let token = localStorage.getItem(CREATOR_TOKEN_KEY);
  if (!token || token.length < 12) {
    token = `ct_${generateRandomHex(14)}`;
    localStorage.setItem(CREATOR_TOKEN_KEY, token);
  }
  return token;
}

function rotateGuestCreatorToken(): string {
  const next = `ct_${generateRandomHex(14)}`;
  localStorage.setItem(CREATOR_TOKEN_KEY, next);
  return next;
}

function getScopedKey(baseKey: string): string {
  const activeUid = localStorage.getItem(ACTIVE_USER_ID_KEY) || 'guest';
  return `${baseKey}_${activeUid}`;
}

function generateSlug(title: string, creatorName: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 14);

  const cleanCreator = creatorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 10);

  const prefix = cleanTitle || cleanCreator || 'bff';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  return `${prefix}-${suffix}`;
}

function getClientFingerprint(): string {
  let fp = localStorage.getItem(FP_KEY);
  if (!fp) {
    fp = generateRandomHex(12);
    localStorage.setItem(FP_KEY, fp);
  }
  return fp;
}

/* ============================================================================
 * REAL GAMEPLAY ACTIVITY, STREAK & CLOUD WRAPPED ENGINE
 * ============================================================================ */
function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getTodayQuest(): DailyQuestItem {
  const todayStr = getTodayDateString();
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash * 31 + todayStr.charCodeAt(i)) % 1000;
  }
  return DAILY_QUESTS[hash % DAILY_QUESTS.length];
}

function getLocalActivity(): LocalActivityRecord {
  const raw = localStorage.getItem(getScopedKey(ACTIVITY_KEY));
  if (!raw) {
    return {
      playedGames: [],
      createdGamesCount: 0,
      completedQuestDates: [],
      unlockedBadges: [],
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      playedGames: Array.isArray(parsed.playedGames) ? parsed.playedGames : [],
      createdGamesCount: Number(parsed.createdGamesCount || 0),
      completedQuestDates: Array.isArray(parsed.completedQuestDates)
        ? parsed.completedQuestDates
        : [],
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    };
  } catch {
    return {
      playedGames: [],
      createdGamesCount: 0,
      completedQuestDates: [],
      unlockedBadges: [],
    };
  }
}

function saveLocalActivity(act: LocalActivityRecord) {
  localStorage.setItem(getScopedKey(ACTIVITY_KEY), JSON.stringify(act));
}

function calculateConsecutiveStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;
  const uniqueSet = new Set(dates);
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

    if (uniqueSet.has(key)) {
      streak += 1;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

async function recordRealActivity(event: {
  type: 'play' | 'create';
  slug?: string;
  title?: string;
  gameType?: GameType;
  scorePercentage?: number;
}) {
  const act = getLocalActivity();
  const todayKey = getTodayDateString();
  const todayQuest = getTodayQuest();

  if (event.type === 'play') {
    act.playedGames.unshift({
      slug: event.slug || 'game',
      title: event.title || 'BFFquest Game',
      gameType: event.gameType || 'quiz',
      scorePercentage: Number(event.scorePercentage ?? 0),
      playedAt: new Date().toISOString(),
    });
    act.playedGames = act.playedGames.slice(0, 100);
  } else if (event.type === 'create') {
    act.createdGamesCount += 1;
  }

  let questDone = act.completedQuestDates.includes(todayKey);
  if (!questDone) {
    if (todayQuest.taskType === 'play_any' && event.type === 'play') {
      questDone = true;
    } else if (todayQuest.taskType === 'create_any' && event.type === 'create') {
      questDone = true;
    } else if (
      todayQuest.taskType === 'score_70' &&
      event.type === 'play' &&
      Number(event.scorePercentage || 0) >= 70
    ) {
      questDone = true;
    }
    if (questDone) {
      act.completedQuestDates.push(todayKey);
    }
  }

  const badges = new Set(act.unlockedBadges);
  if (act.playedGames.length >= 1) badges.add('first_play');
  if (act.createdGamesCount >= 1) badges.add('creator_star');
  if (act.playedGames.some((p) => p.scorePercentage >= 80)) badges.add('mind_reader');
  if (calculateConsecutiveStreak(act.completedQuestDates) >= 3) badges.add('streak_3');

  act.unlockedBadges = Array.from(badges);
  saveLocalActivity(act);

  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        await supabase.rpc('sync_user_account', {
          p_creator_token: null,
          p_local_quest_dates: act.completedQuestDates,
          p_local_badges: act.unlockedBadges,
        });
      }
    } catch {
      // Non-blocking background sync
    }
  }
}

/* ============================================================================
 * BUILT-IN SAMPLE GAMES FALLBACK (Excluded from Creator Dashboard)
 * ============================================================================ */
function getSampleQuizBySlug(slug: string, lang: Lang = 'en'): PublicQuiz | null {
  const clean = slug.trim().toLowerCase();
  const creator = lang === 'bn' ? 'আহাদ' : 'Ahad';

  if (clean === 'sample-best-friend-quiz') {
    const tpl = TEMPLATES[lang][0];
    return {
      id: 'sample-quiz-001',
      slug: 'sample-best-friend-quiz',
      creatorDisplayName: creator,
      title: tpl.defaultTitle,
      description: tpl.description,
      status: 'published',
      gameType: 'quiz',
      questions: tpl.questions.map((q, idx) => ({
        ...q,
        id: `sample_q_${idx + 1}`,
        position: idx + 1,
        options: q.options.map((o) => ({ ...o })),
      })),
    };
  }

  const presetMap: Record<string, Exclude<GameType, 'quiz' | 'ama' | 'wrapped' | 'daily_quest'>> = {
    'sample-guess-side': 'guess_side',
    'sample-two-truths': 'two_truths',
    'sample-blind-ranking': 'blind_ranking',
    'sample-would-you-rather': 'would_you_rather',
  };

  const mode = presetMap[clean];
  if (!mode) return null;

  const preset = GAME_PRESETS[mode][lang];
  return {
    id: `sample-${mode}`,
    slug: clean,
    creatorDisplayName: creator,
    title: preset.defaultTitle,
    description: preset.description,
    status: 'published',
    gameType: mode,
    settings: { groupVoting: true, lockPositions: true },
    questions: preset.questions.map((q, idx) => ({
      ...q,
      id: `sample_${mode}_q_${idx + 1}`,
      position: idx + 1,
      options: q.options.map((o) => ({ ...o })),
    })),
  };
}

function getLocalCreatedQuizzes(): PublicQuiz[] {
  const raw = localStorage.getItem(getScopedKey(QUIZZES_KEY));
  if (!raw) return [];
  try {
    const parsed: PublicQuiz[] = JSON.parse(raw);
    return parsed.filter((q) => !SAMPLE_SLUGS.has(q.slug.toLowerCase()));
  } catch {
    return [];
  }
}

function saveLocalCreatedQuizzes(list: PublicQuiz[]) {
  localStorage.setItem(getScopedKey(QUIZZES_KEY), JSON.stringify(list));
}

function getLocalSubmissions(): SubmissionResult[] {
  const raw = localStorage.getItem(SUBS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const api = {
  isDemoMode: !isSupabaseConfigured,

  /* ==========================================================================
   * 0. REAL AUTHENTICATION & PERMANENT USER CLOUD SYNC
   * ========================================================================== */
  async syncAuthenticatedUser(): Promise<AuthUser | null> {
    if (!supabase) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
      return null;
    }

    const previousUid = localStorage.getItem(ACTIVE_USER_ID_KEY);
    const guestTokenToClaim = !previousUid ? localStorage.getItem(CREATOR_TOKEN_KEY) : null;
    const guestActRaw = !previousUid ? localStorage.getItem(`${ACTIVITY_KEY}_guest`) : null;
    let guestDates: string[] = [];
    let guestBadges: string[] = [];

    if (guestActRaw) {
      try {
        const parsed = JSON.parse(guestActRaw);
        guestDates = Array.isArray(parsed.completedQuestDates) ? parsed.completedQuestDates : [];
        guestBadges = Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [];
      } catch {}
    }

    localStorage.setItem(ACTIVE_USER_ID_KEY, user.id);

    const userAct = getLocalActivity();
    const mergedLocalDates = Array.from(new Set([...userAct.completedQuestDates, ...guestDates]));
    const mergedLocalBadges = Array.from(new Set([...userAct.unlockedBadges, ...guestBadges]));

    try {
      const { data: syncData, error } = await supabase.rpc('sync_user_account', {
        p_creator_token: guestTokenToClaim,
        p_local_quest_dates: mergedLocalDates,
        p_local_badges: mergedLocalBadges,
      });

      // Problem #4 Fix: Only rotate guest token if the cloud claim RPC succeeded without error!
      if (!error && syncData) {
        if (guestTokenToClaim) {
          rotateGuestCreatorToken();
          localStorage.removeItem(`${ACTIVITY_KEY}_guest`);
        }

        const cloudDates = Array.isArray(syncData.completedQuestDates)
          ? syncData.completedQuestDates
          : mergedLocalDates;
        const cloudBadges = Array.isArray(syncData.unlockedBadges)
          ? syncData.unlockedBadges
          : mergedLocalBadges;

        saveLocalActivity({
          ...userAct,
          completedQuestDates: cloudDates,
          unlockedBadges: cloudBadges,
        });

        return {
          id: user.id,
          email: syncData.email || user.email || '',
          displayName:
            syncData.displayName ||
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'Player',
          avatarUrl: syncData.avatarUrl || user.user_metadata?.avatar_url || '',
          provider: syncData.provider || user.app_metadata?.provider || 'email',
        };
      }
    } catch {
      // Do not rotate guest token if RPC threw an exception
    }

    return {
      id: user.id,
      email: user.email || '',
      displayName:
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Player',
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      provider: user.app_metadata?.provider || 'email',
    };
  },

  /**
   * Problem #5 Fix: Defer async Supabase calls inside onAuthStateChange using setTimeout(..., 0)
   * to prevent auth lock deadlocks.
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) {
      callback(null);
      return () => {};
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        localStorage.removeItem(ACTIVE_USER_ID_KEY);
        callback(null);
      } else {
        setTimeout(async () => {
          try {
            const synced = await this.syncAuthenticatedUser();
            callback(synced);
          } catch {
            callback(null);
          }
        }, 0);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  },

  async signInWithEmail(
    email: string,
    password: string,
    rememberMe = true
  ): Promise<AuthUser> {
    if (!supabase) {
      throw new Error('Authentication requires Supabase Cloud connection.');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Please enter both your email and password.');
    }

    setRememberMePref(rememberMe);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password.');
    }

    const synced = await this.syncAuthenticatedUser();
    if (!synced) throw new Error('Could not load user profile.');
    return synced;
  },

  async signUpWithEmail(params: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<{ user: AuthUser | null; needsEmailConfirmation: boolean }> {
    if (!supabase) {
      throw new Error('Registration requires Supabase Cloud connection.');
    }
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.displayName.trim();

    if (!cleanName) {
      throw new Error('Please enter your display name.');
    }
    if (!cleanEmail || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    setRememberMePref(true);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          display_name: cleanName,
          full_name: cleanName,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Could not create account.');
    }

    if (data.session && data.user) {
      const synced = await this.syncAuthenticatedUser();
      return { user: synced, needsEmailConfirmation: false };
    }

    return { user: null, needsEmailConfirmation: true };
  },

  async signInWithSocial(provider: 'google' | 'facebook', rememberMe = true): Promise<void> {
    if (!supabase) {
      throw new Error('Social login requires Supabase Cloud connection.');
    }

    setRememberMePref(rememberMe);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw new Error(error.message || `Could not sign in with ${provider}.`);
    }
  },

  async sendPasswordReset(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Password reset requires Supabase Cloud connection.');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your account email address.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/auth?mode=update_password`,
    });

    if (error) {
      throw new Error(error.message || 'Could not send password reset email.');
    }
  },

  async updateNewPassword(newPassword: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured.');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message || 'Could not update password.');
  },

  async updateProfileName(displayName: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured.');
    const clean = displayName.trim();
    if (!clean) throw new Error('Display name cannot be empty.');

    const { error } = await supabase.rpc('update_my_profile_name', {
      p_display_name: clean,
    });
    if (error) throw new Error(error.message);
    await supabase.auth.updateUser({ data: { display_name: clean, full_name: clean } });
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
    rotateGuestCreatorToken();
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  /* ==========================================================================
   * 1. CREATE & PUBLISH ANY GAME MODE
   * ========================================================================== */
  async publishQuiz(params: {
    creatorDisplayName: string;
    title: string;
    description: string;
    gameType?: GameType;
    settings?: Record<string, any>;
    questions: QuizQuestion[];
  }): Promise<{ slug: string; gameType: GameType }> {
    const gameType: GameType = params.gameType || 'quiz';

    if (!params.creatorDisplayName.trim()) {
      throw new Error('Please enter your display name.');
    }
    if (params.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters.');
    }
    if (
      params.questions.length < BRAND.limits.minQuestions ||
      params.questions.length > BRAND.limits.maxQuestions
    ) {
      throw new Error(
        `Please include between ${BRAND.limits.minQuestions} and ${BRAND.limits.maxQuestions} rounds/questions.`
      );
    }

    for (let i = 0; i < params.questions.length; i++) {
      const q = params.questions[i];
      if (!q.questionText.trim()) {
        throw new Error(`Round/Question ${i + 1} text cannot be empty.`);
      }

      if (gameType === 'guess_side' || gameType === 'would_you_rather') {
        if (!q.options[0]?.text.trim() || !q.options[1]?.text.trim()) {
          throw new Error(`Both Option A and Option B are required in Round ${i + 1}.`);
        }
      } else if (gameType === 'two_truths') {
        if (q.options.slice(0, 3).some((o) => !o.text.trim())) {
          throw new Error(`All 3 statements are required in Round ${i + 1}.`);
        }
      } else if (gameType === 'quiz') {
        if (q.options.slice(0, 3).some((o) => !o.text.trim())) {
          throw new Error(`Please fill in the first 3 choices for Question ${i + 1}.`);
        }
        // Problem #13 Fix: Require expected custom answer text if creator selects Option 4 as correct
        if (q.correctOptionId === 'opt_4') {
          const customExpected = (q.options[3]?.text || '').trim();
          if (
            !customExpected ||
            DEFAULT_CUSTOM_PLACEHOLDERS.has(customExpected.toLowerCase())
          ) {
            throw new Error(
              `Question ${i + 1}: Since you marked Option 4 (Write-in) as the correct answer, please type the expected answer word in Option 4.`
            );
          }
        }
      }
    }

    const slug = generateSlug(params.title, params.creatorDisplayName);
    const creatorToken = getCreatorToken();

    const normalizedQuestions: QuizQuestion[] = params.questions.map((q, idx) => {
      if (gameType === 'guess_side' || gameType === 'would_you_rather') {
        return {
          ...q,
          position: idx + 1,
          questionText: q.questionText.trim(),
          correctOptionId: q.correctOptionId || 'opt_1',
          options: [
            {
              id: 'opt_1',
              text: q.options[0]?.text.trim() || 'Option A',
              icon: q.options[0]?.icon || 'sun',
            },
            {
              id: 'opt_2',
              text: q.options[1]?.text.trim() || 'Option B',
              icon: q.options[1]?.icon || 'moon',
            },
          ],
        };
      }

      if (gameType === 'two_truths') {
        return {
          ...q,
          position: idx + 1,
          questionText: q.questionText.trim(),
          correctOptionId: q.correctOptionId || 'opt_2',
          options: [
            { id: 'opt_1', text: q.options[0]?.text.trim() || '' },
            { id: 'opt_2', text: q.options[1]?.text.trim() || '' },
            { id: 'opt_3', text: q.options[2]?.text.trim() || '' },
          ],
        };
      }

      // Problem #3 Fix: Always use `opt_${idx + 1}` for Blind Ranking so deleted items never skew rank keys
      if (gameType === 'blind_ranking') {
        const totalSlots = params.questions.length;
        return {
          ...q,
          position: idx + 1,
          questionText: q.questionText.trim(),
          correctOptionId: `opt_${idx + 1}`,
          options: Array.from({ length: totalSlots }, (_, sIdx) => ({
            id: `opt_${sIdx + 1}`,
            text: `Rank #${sIdx + 1}`,
          })),
        };
      }

      return {
        ...q,
        position: idx + 1,
        questionText: q.questionText.trim(),
        correctOptionId: q.correctOptionId || 'opt_1',
        options: [
          { id: 'opt_1', text: q.options[0]?.text.trim() || '' },
          { id: 'opt_2', text: q.options[1]?.text.trim() || '' },
          { id: 'opt_3', text: q.options[2]?.text.trim() || '' },
          {
            id: 'opt_4',
            text: q.options[3]?.text.trim() || 'Write your own answer...',
            isCustom: true,
          },
        ],
      };
    });

    let finalSlug = slug;
    let finalId = crypto.randomUUID ? crypto.randomUUID() : `quiz_${Date.now()}`;

    if (supabase) {
      const { data, error } = await supabase.rpc('create_public_quiz', {
        p_slug: slug,
        p_creator_display_name: params.creatorDisplayName.trim(),
        p_title: params.title.trim(),
        p_description: params.description.trim(),
        p_questions: normalizedQuestions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctOptionId: q.correctOptionId || 'opt_1',
        })),
        p_creator_token: creatorToken,
        p_game_type: gameType,
        p_settings: params.settings || {},
      });

      if (error) {
        throw new Error(error.message || 'Failed to publish game to cloud.');
      }
      if (data?.slug) finalSlug = data.slug;
      if (data?.id) finalId = data.id;
    }

    const existing = getLocalCreatedQuizzes().filter((q) => q.slug !== finalSlug);
    const newQuiz: PublicQuiz = {
      id: finalId,
      slug: finalSlug,
      creatorDisplayName: params.creatorDisplayName.trim(),
      title: params.title.trim(),
      description: params.description.trim(),
      status: 'published',
      gameType,
      settings: params.settings || {},
      questions: normalizedQuestions,
    };
    existing.unshift(newQuiz);
    saveLocalCreatedQuizzes(existing);

    await recordRealActivity({
      type: 'create',
      slug: finalSlug,
      title: params.title.trim(),
      gameType,
    });

    return { slug: finalSlug, gameType };
  },

  /* ==========================================================================
   * 2. LOAD PUBLIC QUIZ / GAME BY SLUG (Problem #15 Fix: Global Sample Leaderboard)
   * ========================================================================== */
  async getPublicQuizBySlug(
    slug: string,
    lang: Lang = 'en'
  ): Promise<{
    status: 'ok' | 'unavailable' | 'not_found' | 'error';
    quiz?: PublicQuiz;
    errorMessage?: string;
  }> {
    const cleanSlug = slug.trim().toLowerCase();

    // Problem #15 Fix: Query Supabase first even for sample games so everyone sees the global leaderboard!
    if (supabase) {
      const { data, error } = await supabase.rpc('get_public_quiz_by_slug', {
        p_slug: cleanSlug,
      });

      if (!error && data) {
        if (data.status === 'ok') {
          const cloudQuiz = data.quiz as PublicQuiz;
          // Localize sample game text if viewing in Bangla while preserving cloud IDs & global leaderboard
          if (SAMPLE_SLUGS.has(cleanSlug) && lang === 'bn') {
            const localizedSample = getSampleQuizBySlug(cleanSlug, 'bn');
            if (localizedSample) {
              return {
                status: 'ok',
                quiz: {
                  ...cloudQuiz,
                  title: localizedSample.title,
                  description: localizedSample.description,
                  questions: cloudQuiz.questions.map((cq, idx) => ({
                    ...cq,
                    questionText:
                      localizedSample.questions[idx]?.questionText || cq.questionText,
                    options: cq.options.map((co, oIdx) => ({
                      ...co,
                      text:
                        localizedSample.questions[idx]?.options[oIdx]?.text || co.text,
                    })),
                  })),
                },
              };
            }
          }
          return { status: 'ok', quiz: cloudQuiz };
        }
        if (data.status === 'unavailable') return { status: 'unavailable' };
      } else if (error && !SAMPLE_SLUGS.has(cleanSlug)) {
        return {
          status: 'error',
          errorMessage: error.message || 'Could not load game from cloud.',
        };
      }
    }

    // Fallback for sample games when in offline/demo mode
    if (SAMPLE_SLUGS.has(cleanSlug)) {
      const sample = getSampleQuizBySlug(cleanSlug, lang);
      if (!sample) return { status: 'not_found' };

      const localSubs = getLocalSubmissions()
        .filter((s) => s.quizSlug.toLowerCase() === cleanSlug)
        .sort((a, b) => b.scorePercentage - a.scorePercentage)
        .slice(0, 25);

      return {
        status: 'ok',
        quiz: {
          ...sample,
          totalParticipants: localSubs.length,
          leaderboard: localSubs,
        },
      };
    }

    const all = getLocalCreatedQuizzes();
    const found = all.find((q) => q.slug.toLowerCase() === cleanSlug);
    if (!found) return { status: 'not_found' };
    if (found.status !== 'published') return { status: 'unavailable' };

    const localSubs = getLocalSubmissions()
      .filter((s) => s.quizSlug.toLowerCase() === cleanSlug)
      .sort((a, b) => b.scorePercentage - a.scorePercentage)
      .slice(0, 25);

    return {
      status: 'ok',
      quiz: {
        ...found,
        totalParticipants: localSubs.length,
        leaderboard: localSubs,
      },
    };
  },

  /* ==========================================================================
   * 3. SUBMIT GAME ANSWERS (Problem #6, #13 & #15 Fixes)
   * ========================================================================== */
  async submitQuizAnswers(params: {
    slug: string;
    participantNickname: string;
    answers: Record<string, string>;
    customTexts?: Record<string, string>;
    lang?: Lang;
  }): Promise<SubmissionResult> {
    const cleanSlug = params.slug.trim().toLowerCase();
    // Problem #6 Fix: Deterministic fingerprint per quiz + client (no Date.now() suffix!)
    const fingerprint = `${cleanSlug}:${getClientFingerprint()}`;
    const customTexts = params.customTexts || {};

    // Problem #15 Fix: Submit sample games to Supabase too so scores appear on global leaderboard
    if (supabase) {
      const { data, error } = await supabase.rpc('submit_quiz_answers', {
        p_slug: cleanSlug,
        p_participant_nickname: params.participantNickname,
        p_answers: params.answers,
        p_client_fingerprint: fingerprint,
        p_custom_texts: customTexts,
      });
      if (error) throw new Error(error.message);
      const res = data as SubmissionResult;

      await recordRealActivity({
        type: 'play',
        slug: res.quizSlug,
        title: res.quizTitle,
        gameType: res.gameType || 'quiz',
        scorePercentage: res.scorePercentage,
      });

      return res;
    }

    const quiz = SAMPLE_SLUGS.has(cleanSlug)
      ? getSampleQuizBySlug(cleanSlug, params.lang || 'en')
      : getLocalCreatedQuizzes().find((q) => q.slug.toLowerCase() === cleanSlug);

    if (!quiz || quiz.status !== 'published') {
      throw new Error('This game is no longer accepting submissions.');
    }

    const subs = getLocalSubmissions();
    // Problem #6 Fix in local fallback mode
    if (
      !SAMPLE_SLUGS.has(cleanSlug) &&
      subs.some((s) => s.clientFingerprint === fingerprint)
    ) {
      throw new Error('You have already submitted answers for this game.');
    }

    let correctCount = 0;
    const customAnswersList: CustomAnswerItem[] = [];
    const detailsList: QuestionResultDetail[] = [];

    for (const q of quiz.questions) {
      const selected = params.answers[q.id];
      if (!selected) throw new Error('Please complete all steps before submitting.');

      const written = (customTexts[q.id] || '').trim();
      let isCorrect = false;

      if (selected === 'opt_4' && (quiz.gameType || 'quiz') === 'quiz') {
        if (!written) {
          throw new Error('Please write your custom answer or pick a choice.');
        }
        customAnswersList.push({
          questionText: q.questionText,
          customAnswer: written,
        });
        // Problem #13 Fix: Compare written text against creator's expected answer
        const expectedOpt = q.options.find((o) => o.id === (q.correctOptionId || 'opt_1'));
        const expectedText = (expectedOpt?.text || '').trim();
        isCorrect = Boolean(
          expectedText &&
            !DEFAULT_CUSTOM_PLACEHOLDERS.has(expectedText.toLowerCase()) &&
            written.toLowerCase() === expectedText.toLowerCase()
        );
      } else {
        isCorrect = selected === q.correctOptionId;
      }

      if (isCorrect) correctCount += 1;

      detailsList.push({
        questionId: q.id,
        position: q.position,
        questionText: q.questionText,
        options: q.options,
        selectedOptionId: selected,
        customText: written,
        correctOptionId:
          quiz.gameType && quiz.gameType !== 'quiz'
            ? q.correctOptionId || 'opt_1'
            : isCorrect
            ? q.correctOptionId || 'opt_1'
            : '',
        isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const resultToken = generateRandomHex(10);

    const result: SubmissionResult = {
      submissionId: crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}`,
      resultToken,
      quizSlug: quiz.slug,
      quizTitle: quiz.title,
      gameType: quiz.gameType || 'quiz',
      creatorDisplayName: quiz.creatorDisplayName,
      participantNickname: params.participantNickname.trim() || 'Friend',
      score: correctCount,
      totalQuestions,
      scorePercentage,
      customAnswers: customAnswersList,
      details: detailsList,
      submittedAt: new Date().toISOString(),
      clientFingerprint: fingerprint,
    };

    subs.unshift(result);
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs));

    await recordRealActivity({
      type: 'play',
      slug: quiz.slug,
      title: quiz.title,
      gameType: quiz.gameType || 'quiz',
      scorePercentage,
    });

    return result;
  },

  async getSubmissionResult(
    submissionId: string,
    resultToken: string
  ): Promise<SubmissionResult | null> {
    if (!submissionId || !resultToken) return null;

    const subs = getLocalSubmissions();
    const localFound = subs.find(
      (s) => s.submissionId === submissionId && s.resultToken === resultToken
    );
    if (localFound) return localFound;

    if (supabase) {
      const { data, error } = await supabase.rpc('get_submission_result', {
        p_submission_id: submissionId,
        p_result_token: resultToken,
      });
      if (!error && data) return data as SubmissionResult;
    }

    return null;
  },

  /* ==========================================================================
   * 4. CREATOR DASHBOARD
   * ========================================================================== */
  async getCreatorDashboard(): Promise<CreatorQuizSummary[]> {
    const creatorToken = getCreatorToken();

    if (supabase) {
      const { data, error } = await supabase.rpc('get_creator_quizzes_by_token', {
        p_creator_token: creatorToken,
      });

      if (error) {
        throw new Error(error.message || 'Failed to load your games.');
      }

      const cloudList = Array.isArray(data) ? data : [];
      return cloudList.map((q: any) => {
        const subs: SubmissionResult[] = Array.isArray(q.submissions) ? q.submissions : [];
        const avg =
          subs.length > 0
            ? Math.round(
                subs.reduce((acc, item) => acc + Number(item.scorePercentage || 0), 0) /
                  subs.length
              )
            : 0;
        return {
          id: q.id,
          slug: q.slug,
          title: q.title,
          gameType: (q.gameType as GameType) || 'quiz',
          status: q.status,
          questionCount: Number(q.questionCount || 5),
          submissionCount: subs.length,
          averageScorePercentage: avg,
          submissions: subs,
        };
      });
    }

    const allQuizzes = getLocalCreatedQuizzes();
    const allSubs = getLocalSubmissions();

    return allQuizzes.map((q) => {
      const subs = allSubs.filter((s) => s.quizSlug === q.slug);
      const avg =
        subs.length > 0
          ? Math.round(subs.reduce((a, b) => a + b.scorePercentage, 0) / subs.length)
          : 0;
      return {
        id: q.id,
        slug: q.slug,
        title: q.title,
        gameType: q.gameType || 'quiz',
        status: q.status,
        questionCount: q.questions.length,
        submissionCount: subs.length,
        averageScorePercentage: avg,
        submissions: subs,
      };
    });
  },

  async toggleQuizStatus(quizId: string, currentStatus: string) {
    const creatorToken = getCreatorToken();

    if (supabase) {
      const { error } = await supabase.rpc('creator_toggle_quiz_status', {
        p_quiz_id: quizId,
        p_creator_token: creatorToken,
      });
      if (error) throw new Error(error.message || 'Could not update status.');
    }

    const nextStatus = currentStatus === 'published' ? 'disabled' : 'published';
    const list = getLocalCreatedQuizzes().map((q) =>
      q.id === quizId ? { ...q, status: nextStatus as 'published' | 'disabled' } : q
    );
    saveLocalCreatedQuizzes(list);
  },

  async deleteQuiz(quizId: string) {
    const creatorToken = getCreatorToken();

    if (supabase) {
      const { error } = await supabase.rpc('creator_delete_quiz', {
        p_quiz_id: quizId,
        p_creator_token: creatorToken,
      });
      if (error) throw new Error(error.message || 'Could not delete game.');
    }

    const list = getLocalCreatedQuizzes().filter((q) => q.id !== quizId);
    saveLocalCreatedQuizzes(list);
  },

  /* ==========================================================================
   * 5. ASK ME ANYTHING (AMA) PRIVATE INBOX & PUBLIC QUESTION API
   * ========================================================================== */
  async getCreatorAmaInbox(): Promise<{ hasInbox: boolean; inbox?: AmaInboxData }> {
    const creatorToken = getCreatorToken();

    if (supabase) {
      const { data, error } = await supabase.rpc('get_creator_ama_inbox', {
        p_creator_token: creatorToken,
      });
      if (error) throw new Error(error.message);
      if (data?.hasInbox && data.inbox) {
        return { hasInbox: true, inbox: data.inbox as AmaInboxData };
      }
      return { hasInbox: false };
    }

    const raw = localStorage.getItem(getScopedKey(AMA_KEY));
    if (!raw) return { hasInbox: false };
    try {
      return { hasInbox: true, inbox: JSON.parse(raw) };
    } catch {
      return { hasInbox: false };
    }
  },

  async getUnreadAmaCount(): Promise<number> {
    try {
      const res = await this.getCreatorAmaInbox();
      if (!res.hasInbox || !res.inbox?.questions) return 0;
      return res.inbox.questions.filter((q) => q.status === 'private').length;
    } catch {
      return 0;
    }
  },

  async upsertAmaInbox(params: {
    creatorDisplayName: string;
    promptText: string;
    isOpen: boolean;
    existingSlug?: string;
  }): Promise<AmaInboxData> {
    if (!params.creatorDisplayName.trim()) {
      throw new Error('Please enter your display name.');
    }
    const creatorToken = getCreatorToken();
    const slug = params.existingSlug || generateSlug('ama', params.creatorDisplayName.trim());

    if (supabase) {
      const { data, error } = await supabase.rpc('upsert_ama_inbox', {
        p_slug: slug,
        p_creator_display_name: params.creatorDisplayName.trim(),
        p_creator_token: creatorToken,
        p_prompt_text: params.promptText.trim() || 'Ask me anything anonymously!',
        p_is_open: params.isOpen,
      });
      if (error) throw new Error(error.message);
      return data as AmaInboxData;
    }

    const existing = await this.getCreatorAmaInbox();
    const inbox: AmaInboxData = {
      id: existing.inbox?.id || 'local_ama_1',
      slug: existing.inbox?.slug || slug,
      creatorDisplayName: params.creatorDisplayName.trim(),
      promptText: params.promptText.trim() || 'Ask me anything anonymously!',
      isOpen: params.isOpen,
      questions: existing.inbox?.questions || [],
    };
    localStorage.setItem(getScopedKey(AMA_KEY), JSON.stringify(inbox));
    return inbox;
  },

  async getPublicAmaInbox(
    slug: string
  ): Promise<{ status: 'ok' | 'not_found'; inbox?: AmaInboxData }> {
    const cleanSlug = slug.trim().toLowerCase();

    if (supabase) {
      const { data, error } = await supabase.rpc('get_public_ama_inbox', {
        p_slug: cleanSlug,
      });
      if (!error && data?.status === 'ok') {
        return { status: 'ok', inbox: data.inbox as AmaInboxData };
      }
      return { status: 'not_found' };
    }

    const local = await this.getCreatorAmaInbox();
    if (local.hasInbox && local.inbox && local.inbox.slug.toLowerCase() === cleanSlug) {
      const published = (local.inbox.questions || []).filter((q) => q.status === 'published');
      return {
        status: 'ok',
        inbox: { ...local.inbox, publishedQuestions: published },
      };
    }
    return { status: 'not_found' };
  },

  async sendAmaQuestion(slug: string, questionText: string): Promise<void> {
    if (!questionText.trim() || questionText.trim().length < 2) {
      throw new Error('Please type a question first.');
    }
    const fp = getClientFingerprint();

    if (supabase) {
      const { error } = await supabase.rpc('send_ama_question', {
        p_slug: slug.trim().toLowerCase(),
        p_question_text: questionText.trim(),
        p_sender_fingerprint: fp,
      });
      if (error) throw new Error(error.message);
      return;
    }

    const local = await this.getCreatorAmaInbox();
    if (!local.hasInbox || !local.inbox) {
      throw new Error('Inbox not found.');
    }
    if (!local.inbox.isOpen) {
      throw new Error('This inbox is currently closed.');
    }
    const newQ: AmaQuestionItem = {
      id: `ama_q_${Date.now()}`,
      questionText: questionText.trim(),
      answerText: '',
      status: 'private',
      createdAt: new Date().toISOString(),
    };
    local.inbox.questions = [newQ, ...(local.inbox.questions || [])];
    localStorage.setItem(getScopedKey(AMA_KEY), JSON.stringify(local.inbox));
  },

  async manageAmaQuestion(params: {
    questionId: string;
    action: 'answer' | 'skip' | 'delete' | 'unpublish' | 'block_report';
    answerText?: string;
    publish?: boolean;
  }): Promise<void> {
    const creatorToken = getCreatorToken();

    if (supabase) {
      const { error } = await supabase.rpc('manage_ama_question', {
        p_creator_token: creatorToken,
        p_question_id: params.questionId,
        p_action: params.action,
        p_answer_text: params.answerText || '',
        p_publish: Boolean(params.publish),
      });
      if (error) throw new Error(error.message);
      return;
    }

    const local = await this.getCreatorAmaInbox();
    if (!local.hasInbox || !local.inbox) return;
    let list = local.inbox.questions || [];

    if (params.action === 'delete' || params.action === 'block_report') {
      list = list.filter((q) => q.id !== params.questionId);
    } else {
      list = list.map((q) => {
        if (q.id !== params.questionId) return q;
        if (params.action === 'skip') return { ...q, status: 'skipped' };
        if (params.action === 'unpublish') return { ...q, status: 'private' };
        if (params.action === 'answer') {
          return {
            ...q,
            answerText: params.answerText || '',
            status: params.publish ? 'published' : 'private',
            answeredAt: new Date().toISOString(),
          };
        }
        return q;
      });
    }
    local.inbox.questions = list;
    localStorage.setItem(getScopedKey(AMA_KEY), JSON.stringify(local.inbox));
  },

  /* ==========================================================================
   * 6. BFFQUEST WRAPPED & DAILY QUEST STATUS
   * ========================================================================== */
  async hydrateCloudActivity(): Promise<LocalActivityRecord> {
    const localAct = getLocalActivity();
    if (!supabase) return localAct;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) return localAct;

      const { data, error } = await supabase.rpc('get_my_cloud_activity');
      if (error || !data?.authenticated) return localAct;

      const cloudPlayed = Array.isArray(data.playedGames) ? data.playedGames : [];
      const cloudDates = Array.isArray(data.completedQuestDates) ? data.completedQuestDates : [];
      const cloudBadges = Array.isArray(data.unlockedBadges) ? data.unlockedBadges : [];

      const mergedDates = Array.from(new Set([...localAct.completedQuestDates, ...cloudDates]));
      const mergedBadges = Array.from(new Set([...localAct.unlockedBadges, ...cloudBadges]));
      const mergedPlayed = cloudPlayed.length > 0 ? cloudPlayed : localAct.playedGames;

      const updated: LocalActivityRecord = {
        ...localAct,
        playedGames: mergedPlayed,
        completedQuestDates: mergedDates,
        unlockedBadges: mergedBadges,
      };
      saveLocalActivity(updated);
      return updated;
    } catch {
      return localAct;
    }
  },

  async getWrappedRecap(): Promise<WrappedRecapData> {
    const act = await this.hydrateCloudActivity();
    let createdQuizzes: CreatorQuizSummary[] = [];
    try {
      createdQuizzes = await this.getCreatorDashboard();
    } catch {
      createdQuizzes = [];
    }

    const totalPlayed = act.playedGames.length;
    const totalCreated = Math.max(act.createdGamesCount, createdQuizzes.length);
    const totalFriendsReached = createdQuizzes.reduce(
      (sum, q) => sum + q.submissionCount,
      0
    );

    const hasEnoughData = totalPlayed > 0 || totalCreated > 0;

    let bestScorePct = 0;
    let avgScorePct = 0;
    let topGameTitle = 'Friendship Quiz';
    let topGameMode: GameType = 'quiz';

    if (totalPlayed > 0) {
      bestScorePct = Math.max(...act.playedGames.map((p) => Number(p.scorePercentage || 0)));
      avgScorePct = Math.round(
        act.playedGames.reduce((a, b) => a + Number(b.scorePercentage || 0), 0) / totalPlayed
      );
      const bestGame = act.playedGames.reduce((prev, curr) =>
        Number(curr.scorePercentage || 0) >= Number(prev.scorePercentage || 0) ? curr : prev
      );
      topGameTitle = bestGame.title;
      topGameMode = bestGame.gameType;
    } else if (createdQuizzes.length > 0) {
      const topCreated = createdQuizzes[0];
      topGameTitle = topCreated.title;
      topGameMode = topCreated.gameType;
      bestScorePct = topCreated.averageScorePercentage;
      avgScorePct = topCreated.averageScorePercentage;
    }

    const currentStreak = calculateConsecutiveStreak(act.completedQuestDates);

    return {
      hasEnoughData,
      totalPlayed,
      totalCreated,
      bestScorePct,
      avgScorePct,
      topGameTitle,
      topGameMode,
      totalFriendsReached,
      currentStreak,
      unlockedBadges: act.unlockedBadges,
    };
  },

  getDailyQuestStatus(): DailyQuestStatus {
    const act = getLocalActivity();
    const todayKey = getTodayDateString();
    const quest = getTodayQuest();
    const isCompletedToday = act.completedQuestDates.includes(todayKey);
    const currentStreak = calculateConsecutiveStreak(act.completedQuestDates);

    return {
      todayKey,
      quest,
      isCompletedToday,
      currentStreak,
      completedDates: act.completedQuestDates,
      unlockedBadges: act.unlockedBadges,
    };
  },

  async getDailyQuestStatusAsync(): Promise<DailyQuestStatus> {
    await this.hydrateCloudActivity();
    return this.getDailyQuestStatus();
  },

  /* ==========================================================================
   * 7. ABUSE REPORT & SITE-OWNER ADMIN PANEL API
   * ========================================================================== */
  async submitAbuseReport(quizSlug: string, reason: string, details: string) {
    if (!details.trim() || details.trim().length < 5) {
      throw new Error('Please write a brief description of the issue.');
    }
    if (!supabase) {
      throw new Error(
        'Abuse reporting requires an active cloud connection (currently in Local Demo Mode).'
      );
    }
    const { error } = await supabase.from('abuse_reports').insert({
      quiz_slug: quizSlug.trim() || null,
      reason,
      details: details.trim().slice(0, 1000),
    });
    if (error) throw new Error(error.message);
  },

  async adminGetDashboard(passkey: string): Promise<AdminDashboardData> {
    if (!supabase) {
      throw new Error('Admin Panel requires Supabase Cloud connection.');
    }
    const { data, error } = await supabase.rpc('admin_get_dashboard', {
      p_passkey: passkey.trim(),
    });
    if (error) throw new Error(error.message || 'Invalid Admin Passkey.');
    return data as AdminDashboardData;
  },

  async adminManageQuiz(
    passkey: string,
    quizId: string,
    action: 'publish' | 'disable' | 'delete'
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured.');
    const { error } = await supabase.rpc('admin_manage_quiz', {
      p_passkey: passkey.trim(),
      p_quiz_id: quizId,
      p_action: action,
    });
    if (error) throw new Error(error.message || 'Failed to execute admin action.');
  },

  async adminResolveReport(
    passkey: string,
    reportId: string,
    status: 'resolved' | 'reviewing' | 'delete'
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured.');
    const { error } = await supabase.rpc('admin_resolve_report', {
      p_passkey: passkey.trim(),
      p_report_id: reportId,
      p_status: status,
    });
    if (error) throw new Error(error.message || 'Failed to update report status.');
  },
};
