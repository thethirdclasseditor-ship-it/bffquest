import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BRAND,
  TEMPLATES,
  GAME_PRESETS,
  DAILY_QUESTS,
  QuizQuestion,
  QuizOption,
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

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

export interface SubmissionDetailItem {
  questionId: string;
  position: number;
  questionText: string;
  options: QuizOption[];
  selectedOptionId: string;
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
  gameType: GameType;
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
  details?: SubmissionDetailItem[];
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
  answeredAt?: string | null;
}

export interface AmaInboxCreatorData {
  id: string;
  slug: string;
  creatorDisplayName: string;
  promptText: string;
  isOpen: boolean;
  questions: AmaQuestionItem[];
}

export interface AmaInboxPublicData {
  id: string;
  slug: string;
  creatorDisplayName: string;
  promptText: string;
  isOpen: boolean;
  publishedQuestions: {
    id: string;
    questionText: string;
    answerText: string;
    answeredAt?: string | null;
  }[];
}

export interface PlayHistoryItem {
  id: string;
  slug: string;
  title: string;
  creatorName: string;
  gameType: GameType;
  score: number;
  total: number;
  scorePercentage: number;
  playedAt: string;
  dateKey: string;
}

export interface DailyQuestState {
  todayKey: string;
  quest: DailyQuestItem;
  completedToday: boolean;
  progressCount: number;
  currentStreak: number;
  bestStreak: number;
  completedDates: string[];
  weekDays: { label: string; dateKey: string; done: boolean; isToday: boolean }[];
  monthDays: { dayNum: number; dateKey: string; done: boolean; isToday: boolean }[];
  unlockedBadgeIds: string[];
}

export interface WrappedSummary {
  hasEnoughData: boolean;
  totalPlayed: number;
  totalCreated: number;
  bestScorePercentage: number;
  averageScorePercentage: number;
  topQuizTitle: string;
  topGameType: GameType;
  uniqueFriendsCount: number;
  currentStreak: number;
  unlockedBadgeIds: string[];
  recentPlays: PlayHistoryItem[];
}

export interface AdminQuizItem {
  id: string;
  slug: string;
  title: string;
  gameType: GameType;
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

const LANG_KEY = `${BRAND.storagePrefix}lang`;
const QUIZZES_KEY = `${BRAND.storagePrefix}quizzes`;
const SUBS_KEY = `${BRAND.storagePrefix}subs`;
const CREATOR_TOKEN_KEY = `${BRAND.storagePrefix}creator_token`;
const ADMIN_KEY_STORAGE = `${BRAND.storagePrefix}admin_key`;
const FP_KEY = `${BRAND.storagePrefix}fp`;
const PLAY_HISTORY_KEY = `${BRAND.storagePrefix}play_history`;
const CREATE_DATES_KEY = `${BRAND.storagePrefix}create_dates`;
const QUEST_DATES_KEY = `${BRAND.storagePrefix}quest_dates`;
const LOCAL_AMA_KEY = `${BRAND.storagePrefix}local_ama`;

const SAMPLE_SLUGS = new Set([
  'sample-best-friend-quiz',
  'sample-guess-side',
  'sample-two-truths',
  'sample-blind-ranking',
  'sample-would-you-rather',
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

export async function copyTextSafely(
  text: string
): Promise<{ ok: boolean; method: 'clipboard' | 'fallback' | 'manual' }> {
  if (!text) return { ok: false, method: 'manual' };

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: 'clipboard' };
    } catch {
      // Fall through to legacy textarea copy
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      return { ok: true, method: 'fallback' };
    }
  } catch {
    // Fall through to manual prompt
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

export function getClientFingerprint(): string {
  let fp = localStorage.getItem(FP_KEY);
  if (!fp) {
    fp = generateRandomHex(12);
    localStorage.setItem(FP_KEY, fp);
  }
  return fp;
}

function generateSlug(title: string, creatorName: string, prefixFallback = 'bff'): string {
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

  const prefix = cleanTitle || cleanCreator || prefixFallback;
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  return `${prefix}-${suffix}`;
}

/* ============================================================================
 * REAL GAMEPLAY, DAILY QUEST & WRAPPED TRACKING ENGINE
 * ============================================================================ */
export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, offset: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + offset);
  return next;
}

function getPlayHistory(): PlayHistoryItem[] {
  const raw = localStorage.getItem(PLAY_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getCreateDates(): string[] {
  const raw = localStorage.getItem(CREATE_DATES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStoredQuestDates(): string[] {
  const raw = localStorage.getItem(QUEST_DATES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQuestDate(dateKey: string) {
  const existing = new Set(getStoredQuestDates());
  existing.add(dateKey);
  localStorage.setItem(QUEST_DATES_KEY, JSON.stringify(Array.from(existing).sort()));
}

function getQuestForDate(date: Date = new Date()): DailyQuestItem {
  const utcDays = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return DAILY_QUESTS[Math.abs(utcDays) % DAILY_QUESTS.length];
}

function evaluateAndSyncTodayQuest() {
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  const quest = getQuestForDate(now);
  const playsToday = getPlayHistory().filter((p) => p.dateKey === todayKey);
  const createsToday = getCreateDates().filter((d) => d === todayKey);

  let done = false;
  if (quest.taskType === 'play_any' && playsToday.length >= 1) {
    done = true;
  } else if (quest.taskType === 'create_any' && createsToday.length >= 1) {
    done = true;
  } else if (quest.taskType === 'score_70' && playsToday.some((p) => p.scorePercentage >= 70)) {
    done = true;
  } else if (quest.taskType === 'ama_setup' && createsToday.length >= 1) {
    done = true;
  }

  if (done) {
    saveQuestDate(todayKey);
  }
}

function recordPlayActivity(item: Omit<PlayHistoryItem, 'dateKey'>) {
  const list = getPlayHistory();
  const entry: PlayHistoryItem = {
    ...item,
    dateKey: getLocalDateKey(new Date(item.playedAt)),
  };
  list.unshift(entry);
  localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(list.slice(0, 200)));
  evaluateAndSyncTodayQuest();
}

function recordCreatorActivity() {
  const todayKey = getLocalDateKey();
  const list = getCreateDates();
  list.push(todayKey);
  localStorage.setItem(CREATE_DATES_KEY, JSON.stringify(list.slice(-200)));
  evaluateAndSyncTodayQuest();
}

function computeStreaks(completedDates: string[]): { currentStreak: number; bestStreak: number } {
  const completedSet = new Set(completedDates);
  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const yesterdayKey = getLocalDateKey(addDays(today, -1));

  let currentStreak = 0;
  if (completedSet.has(todayKey) || completedSet.has(yesterdayKey)) {
    let cursor = completedSet.has(todayKey) ? today : addDays(today, -1);
    while (completedSet.has(getLocalDateKey(cursor))) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  const sorted = Array.from(completedSet).sort();
  let bestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const key of sorted) {
    const [y, m, d] = key.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (prevDate) {
      const diffDays = Math.round((dt.getTime() - prevDate.getTime()) / 86400000);
      running = diffDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }
    if (running > bestStreak) bestStreak = running;
    prevDate = dt;
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
}

export function getDailyQuestState(extraCreatedCount = 0): DailyQuestState {
  evaluateAndSyncTodayQuest();
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  const quest = getQuestForDate(now);
  const completedDates = getStoredQuestDates();
  const completedSet = new Set(completedDates);
  const plays = getPlayHistory();
  const creates = getCreateDates();

  const playsToday = plays.filter((p) => p.dateKey === todayKey);
  const createsToday = creates.filter((d) => d === todayKey);

  let progressCount = 0;
  if (quest.taskType === 'play_any') progressCount = Math.min(1, playsToday.length);
  if (quest.taskType === 'create_any') progressCount = Math.min(1, createsToday.length);
  if (quest.taskType === 'score_70') {
    progressCount = playsToday.some((p) => p.scorePercentage >= 70) ? 1 : 0;
  }

  const { currentStreak, bestStreak } = computeStreaks(completedDates);

  // Build Monday-to-Sunday current week
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday
  const monday = addDays(now, -dayOfWeek);
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDays = labels.map((label, idx) => {
    const dt = addDays(monday, idx);
    const key = getLocalDateKey(dt);
    return {
      label,
      dateKey: key,
      done: completedSet.has(key),
      isToday: key === todayKey,
    };
  });

  // Build 28-day (4-week aligned) calendar history
  const start28 = addDays(monday, -21);
  const monthDays = Array.from({ length: 28 }, (_, idx) => {
    const dt = addDays(start28, idx);
    const key = getLocalDateKey(dt);
    return {
      dayNum: dt.getDate(),
      dateKey: key,
      done: completedSet.has(key),
      isToday: key === todayKey,
    };
  });

  const totalCreated = Math.max(creates.length, extraCreatedCount, getLocalCreatedQuizzes().length);
  const unlockedBadgeIds: string[] = [];
  if (plays.length >= 1) unlockedBadgeIds.push('first_play');
  if (totalCreated >= 1) unlockedBadgeIds.push('creator_star');
  if (plays.some((p) => p.scorePercentage >= 80)) unlockedBadgeIds.push('mind_reader');
  if (bestStreak >= 3 || completedDates.length >= 3) unlockedBadgeIds.push('streak_3');

  return {
    todayKey,
    quest,
    completedToday: completedSet.has(todayKey),
    progressCount,
    currentStreak,
    bestStreak,
    completedDates,
    weekDays,
    monthDays,
    unlockedBadgeIds,
  };
}

export function getWrappedSummary(cloudCreatedCount = 0): WrappedSummary {
  const plays = getPlayHistory();
  const localCreated = getLocalCreatedQuizzes().length;
  const totalCreated = Math.max(cloudCreatedCount, localCreated, getCreateDates().length);
  const dq = getDailyQuestState(totalCreated);

  const hasEnoughData = plays.length > 0 || totalCreated > 0;
  if (!hasEnoughData) {
    return {
      hasEnoughData: false,
      totalPlayed: 0,
      totalCreated: 0,
      bestScorePercentage: 0,
      averageScorePercentage: 0,
      topQuizTitle: '—',
      topGameType: 'quiz',
      uniqueFriendsCount: 0,
      currentStreak: 0,
      unlockedBadgeIds: [],
      recentPlays: [],
    };
  }

  const bestScorePercentage =
    plays.length > 0 ? Math.max(...plays.map((p) => p.scorePercentage)) : 0;
  const averageScorePercentage =
    plays.length > 0
      ? Math.round(plays.reduce((acc, p) => acc + p.scorePercentage, 0) / plays.length)
      : 0;

  const sortedByScore = [...plays].sort((a, b) => b.scorePercentage - a.scorePercentage);
  const topQuizTitle = sortedByScore[0]?.title || getLocalCreatedQuizzes()[0]?.title || BRAND.name;

  const modeCounts: Partial<Record<GameType, number>> = {};
  for (const p of plays) {
    modeCounts[p.gameType] = (modeCounts[p.gameType] || 0) + 1;
  }
  let topGameType: GameType = 'quiz';
  let topModeCount = 0;
  (Object.keys(modeCounts) as GameType[]).forEach((gt) => {
    const cnt = modeCounts[gt] || 0;
    if (cnt > topModeCount) {
      topModeCount = cnt;
      topGameType = gt;
    }
  });

  const uniqueFriendsCount = new Set(
    plays.map((p) => p.creatorName.trim().toLowerCase()).filter(Boolean)
  ).size;

  return {
    hasEnoughData: true,
    totalPlayed: plays.length,
    totalCreated,
    bestScorePercentage,
    averageScorePercentage,
    topQuizTitle,
    topGameType,
    uniqueFriendsCount,
    currentStreak: dq.currentStreak,
    unlockedBadgeIds: dq.unlockedBadgeIds,
    recentPlays: plays.slice(0, 6),
  };
}

/* ============================================================================
 * SAMPLE GAMES & LOCAL STORAGE HELPERS
 * ============================================================================ */
function getBuiltInSampleQuiz(slug: string, lang: Lang = 'en'): PublicQuiz | null {
  const creatorName = lang === 'bn' ? 'আহাদ' : 'Ahad';

  if (slug === 'sample-best-friend-quiz') {
    const tpl = TEMPLATES[lang][0];
    return {
      id: 'sample-quiz-001',
      slug,
      creatorDisplayName: creatorName,
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

  const presetMap: Record<
    string,
    Exclude<GameType, 'quiz' | 'ama' | 'wrapped' | 'daily_quest'>
  > = {
    'sample-guess-side': 'guess_side',
    'sample-two-truths': 'two_truths',
    'sample-blind-ranking': 'blind_ranking',
    'sample-would-you-rather': 'would_you_rather',
  };

  const gameType = presetMap[slug];
  if (!gameType) return null;

  const preset = GAME_PRESETS[gameType][lang];
  return {
    id: `sample-${gameType}`,
    slug,
    creatorDisplayName: creatorName,
    title: preset.defaultTitle,
    description: preset.description,
    status: 'published',
    gameType,
    settings: gameType === 'would_you_rather' ? { groupVoting: true } : {},
    questions: preset.questions.map((q, idx) => ({
      ...q,
      id: `sample_${gameType}_${idx + 1}`,
      position: idx + 1,
      options: q.options.map((o) => ({ ...o })),
    })),
  };
}

function getLocalCreatedQuizzes(): PublicQuiz[] {
  const raw = localStorage.getItem(QUIZZES_KEY);
  if (!raw) return [];
  try {
    const parsed: PublicQuiz[] = JSON.parse(raw);
    return parsed.filter((q) => !SAMPLE_SLUGS.has(q.slug));
  } catch {
    return [];
  }
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

function computeLocalVoteStats(slug: string, questions: QuizQuestion[]): Record<string, VoteStatItem> {
  const subs = getLocalSubmissions().filter((s) => s.quizSlug.toLowerCase() === slug.toLowerCase());
  const stats: Record<string, VoteStatItem> = {};
  for (const q of questions) {
    let opt1 = 0;
    let opt2 = 0;
    for (const s of subs) {
      const det = s.details?.find((d) => d.questionId === q.id);
      if (det?.selectedOptionId === 'opt_1') opt1 += 1;
      if (det?.selectedOptionId === 'opt_2') opt2 += 1;
    }
    stats[q.id] = { opt_1: opt1, opt_2: opt2, total: opt1 + opt2 };
  }
  return stats;
}

/* ============================================================================
 * MAIN API OBJECT
 * ============================================================================ */
export const api = {
  isDemoMode: !isSupabaseConfigured,

  async publishQuiz(params: {
    creatorDisplayName: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    gameType?: GameType;
    settings?: Record<string, any>;
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

    const normalizedQuestions: QuizQuestion[] = params.questions.map((q, idx) => {
      const roundNum = idx + 1;

      if (gameType === 'guess_side' || gameType === 'would_you_rather') {
        const o1 = q.options[0]?.text.trim() || '';
        const o2 = q.options[1]?.text.trim() || '';
        if (!o1 || !o2) {
          throw new Error(`Please fill in both choices for Round ${roundNum}.`);
        }
        const promptText = q.questionText.trim() || `${o1} vs ${o2}`;
        return {
          ...q,
          position: roundNum,
          questionText: promptText,
          correctOptionId: q.correctOptionId === 'opt_2' ? 'opt_2' : 'opt_1',
          options: [
            { id: 'opt_1', text: o1, icon: q.options[0]?.icon || 'sun' },
            { id: 'opt_2', text: o2, icon: q.options[1]?.icon || 'moon' },
          ],
        };
      }

      if (gameType === 'two_truths') {
        const s1 = q.options[0]?.text.trim() || '';
        const s2 = q.options[1]?.text.trim() || '';
        const s3 = q.options[2]?.text.trim() || '';
        if (!s1 || !s2 || !s3) {
          throw new Error(`Please write all 3 statements in Round ${roundNum}.`);
        }
        return {
          ...q,
          position: roundNum,
          questionText: q.questionText.trim() || `Round ${roundNum}: Spot the Lie`,
          correctOptionId: ['opt_1', 'opt_2', 'opt_3'].includes(q.correctOptionId || '')
            ? q.correctOptionId
            : 'opt_2',
          options: [
            { id: 'opt_1', text: s1 },
            { id: 'opt_2', text: s2 },
            { id: 'opt_3', text: s3 },
          ],
        };
      }

      if (gameType === 'blind_ranking') {
        const itemName = q.questionText.trim();
        if (!itemName) {
          throw new Error(`Please enter item name #${roundNum} for Blind Ranking.`);
        }
        const totalSlots = params.questions.length;
        const slotOptions: QuizOption[] = Array.from({ length: totalSlots }, (_, sIdx) => ({
          id: `opt_${sIdx + 1}`,
          text: `Rank #${sIdx + 1}`,
        }));
        return {
          ...q,
          position: roundNum,
          questionText: itemName,
          correctOptionId: q.correctOptionId || `opt_${roundNum}`,
          options: slotOptions,
        };
      }

      // Default: Classic Friendship Quiz (3 fixed + 1 custom write-in slot)
      if (!q.questionText.trim()) {
        throw new Error(`Question ${roundNum} text cannot be empty.`);
      }
      const fixedOptions = q.options.slice(0, 3);
      if (fixedOptions.some((o) => !o.text.trim())) {
        throw new Error(`Please fill in the 3 choices for Question ${roundNum}.`);
      }

      return {
        ...q,
        position: roundNum,
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

    const slug = generateSlug(params.title, params.creatorDisplayName, gameType.slice(0, 4));
    const creatorToken = getCreatorToken();
    const settings = params.settings || (gameType === 'would_you_rather' ? { groupVoting: true } : {});

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
        p_settings: settings,
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
      settings,
      questions: normalizedQuestions,
    };
    existing.unshift(newQuiz);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(existing));

    recordCreatorActivity();
    return { slug: finalSlug, gameType };
  },

  async getPublicQuizBySlug(
    slug: string,
    lang: Lang = 'en'
  ): Promise<{
    status: 'ok' | 'unavailable' | 'not_found' | 'error';
    quiz?: PublicQuiz;
    errorMessage?: string;
  }> {
    const cleanSlug = slug.trim().toLowerCase();

    if (SAMPLE_SLUGS.has(cleanSlug)) {
      const sample = getBuiltInSampleQuiz(cleanSlug, lang);
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
          voteStats: computeLocalVoteStats(cleanSlug, sample.questions),
        },
      };
    }

    if (supabase) {
      const { data, error } = await supabase.rpc('get_public_quiz_by_slug', {
        p_slug: cleanSlug,
      });

      if (error) {
        return {
          status: 'error',
          errorMessage: error.message || 'Could not load game from cloud.',
        };
      }

      if (data) {
        if (data.status === 'ok') {
          return {
            status: 'ok',
            quiz: {
              ...data.quiz,
              gameType: (data.quiz.gameType as GameType) || 'quiz',
            },
          };
        }
        if (data.status === 'not_found') return { status: 'not_found' };
        return { status: 'unavailable' };
      }
      return { status: 'not_found' };
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
        gameType: found.gameType || 'quiz',
        totalParticipants: localSubs.length,
        leaderboard: localSubs,
        voteStats: computeLocalVoteStats(cleanSlug, found.questions),
        questions: found.questions.map((q) => ({
          id: q.id,
          position: q.position,
          questionText: q.questionText,
          options: q.options.map((o) => ({ ...o })),
        })),
      },
    };
  },

  async submitQuizAnswers(params: {
    slug: string;
    participantNickname: string;
    answers: Record<string, string>;
    customTexts?: Record<string, string>;
    lang?: Lang;
  }): Promise<SubmissionResult> {
    const cleanSlug = params.slug.trim().toLowerCase();
    const fingerprint = `${cleanSlug}:${getClientFingerprint()}`;
    const customTexts = params.customTexts || {};

    if (supabase && !SAMPLE_SLUGS.has(cleanSlug)) {
      const { data, error } = await supabase.rpc('submit_quiz_answers', {
        p_slug: cleanSlug,
        p_participant_nickname: params.participantNickname,
        p_answers: params.answers,
        p_client_fingerprint: fingerprint,
        p_custom_texts: customTexts,
      });
      if (error) throw new Error(error.message);

      const res = data as SubmissionResult;
      recordPlayActivity({
        id: res.submissionId,
        slug: res.quizSlug,
        title: res.quizTitle,
        creatorName: res.creatorDisplayName,
        gameType: (res.gameType as GameType) || 'quiz',
        score: Number(res.score),
        total: Number(res.totalQuestions),
        scorePercentage: Number(res.scorePercentage),
        playedAt: res.submittedAt || new Date().toISOString(),
      });
      return res;
    }

    const quiz = SAMPLE_SLUGS.has(cleanSlug)
      ? getBuiltInSampleQuiz(cleanSlug, params.lang || 'en')
      : getLocalCreatedQuizzes().find((q) => q.slug.toLowerCase() === cleanSlug);

    if (!quiz || quiz.status !== 'published') {
      throw new Error('This game is no longer accepting submissions.');
    }

    let correctCount = 0;
    const customAnswersList: CustomAnswerItem[] = [];
    const detailsList: SubmissionDetailItem[] = [];

    for (const q of quiz.questions) {
      const selected = params.answers[q.id];
      if (!selected) throw new Error('Please complete all steps before submitting.');

      let isCorrect = false;
      if (quiz.gameType === 'quiz' && selected === 'opt_4') {
        const written = (customTexts[q.id] || '').trim();
        if (!written) {
          throw new Error('Please write your custom answer or pick one of the choices.');
        }
        customAnswersList.push({
          questionText: q.questionText,
          customAnswer: written,
        });
        isCorrect = q.correctOptionId === 'opt_4';
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
        correctOptionId: q.correctOptionId || 'opt_1',
        isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);
    const resultToken = generateRandomHex(10);

    const result: SubmissionResult = {
      submissionId: crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}`,
      resultToken,
      quizSlug: quiz.slug,
      quizTitle: quiz.title,
      gameType: quiz.gameType,
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

    const subs = getLocalSubmissions();
    subs.unshift(result);
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs));

    recordPlayActivity({
      id: result.submissionId,
      slug: result.quizSlug,
      title: result.quizTitle,
      creatorName: result.creatorDisplayName,
      gameType: quiz.gameType,
      score: result.score,
      total: result.totalQuestions,
      scorePercentage: result.scorePercentage,
      playedAt: result.submittedAt,
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
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(list));
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
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(list));
  },

  async submitAbuseReport(quizSlug: string, reason: string, details: string) {
    if (!details.trim() || details.trim().length < 5) {
      throw new Error('Please write a brief description of the issue.');
    }
    if (!supabase) {
      throw new Error('Abuse reporting requires an active Supabase Cloud connection.');
    }
    const { error } = await supabase.from('abuse_reports').insert({
      quiz_slug: quizSlug.trim() || null,
      reason,
      details: details.trim().slice(0, 1000),
    });
    if (error) throw new Error(error.message);
  },

  /* ==========================================================================
   * 01 · ASK ME ANYTHING (AMA) PRIVATE INBOX API
   * ========================================================================== */
  async upsertAmaInbox(params: {
    creatorDisplayName: string;
    promptText: string;
    isOpen: boolean;
  }): Promise<{ slug: string; isOpen: boolean }> {
    if (!params.creatorDisplayName.trim()) {
      throw new Error('Please enter your display name.');
    }
    const creatorToken = getCreatorToken();
    const generatedSlug = generateSlug(params.creatorDisplayName, 'ama', 'ama');

    if (supabase) {
      const { data, error } = await supabase.rpc('upsert_ama_inbox', {
        p_slug: generatedSlug,
        p_creator_display_name: params.creatorDisplayName.trim(),
        p_creator_token: creatorToken,
        p_prompt_text: params.promptText.trim() || 'Ask me anything anonymously!',
        p_is_open: params.isOpen,
      });
      if (error) throw new Error(error.message || 'Could not save AMA inbox.');
      recordCreatorActivity();
      return { slug: data.slug, isOpen: Boolean(data.isOpen) };
    }

    // Demo fallback
    const raw = localStorage.getItem(LOCAL_AMA_KEY);
    const existing: AmaInboxCreatorData | null = raw ? JSON.parse(raw) : null;
    const saved: AmaInboxCreatorData = {
      id: existing?.id || 'local_ama_1',
      slug: existing?.slug || generatedSlug,
      creatorDisplayName: params.creatorDisplayName.trim(),
      promptText: params.promptText.trim() || 'Ask me anything anonymously!',
      isOpen: params.isOpen,
      questions: existing?.questions || [],
    };
    localStorage.setItem(LOCAL_AMA_KEY, JSON.stringify(saved));
    recordCreatorActivity();
    return { slug: saved.slug, isOpen: saved.isOpen };
  },

  async getCreatorAmaInbox(): Promise<{ hasInbox: boolean; inbox?: AmaInboxCreatorData }> {
    const creatorToken = getCreatorToken();

    if (supabase) {
      const { data, error } = await supabase.rpc('get_creator_ama_inbox', {
        p_creator_token: creatorToken,
      });
      if (error) throw new Error(error.message || 'Could not load AMA inbox.');
      return {
        hasInbox: Boolean(data?.hasInbox),
        inbox: data?.inbox as AmaInboxCreatorData | undefined,
      };
    }

    const raw = localStorage.getItem(LOCAL_AMA_KEY);
    if (!raw) return { hasInbox: false };
    try {
      const parsed: AmaInboxCreatorData = JSON.parse(raw);
      return { hasInbox: true, inbox: parsed };
    } catch {
      return { hasInbox: false };
    }
  },

  async getPublicAmaInbox(
    slug: string
  ): Promise<{ status: 'ok' | 'not_found' | 'error'; inbox?: AmaInboxPublicData }> {
    const cleanSlug = slug.trim().toLowerCase();

    if (supabase) {
      const { data, error } = await supabase.rpc('get_public_ama_inbox', {
        p_slug: cleanSlug,
      });
      if (error) return { status: 'error' };
      if (data?.status === 'ok' && data.inbox) {
        return { status: 'ok', inbox: data.inbox as AmaInboxPublicData };
      }
      return { status: 'not_found' };
    }

    const raw = localStorage.getItem(LOCAL_AMA_KEY);
    if (!raw) return { status: 'not_found' };
    try {
      const parsed: AmaInboxCreatorData = JSON.parse(raw);
      if (parsed.slug.toLowerCase() !== cleanSlug) return { status: 'not_found' };
      return {
        status: 'ok',
        inbox: {
          id: parsed.id,
          slug: parsed.slug,
          creatorDisplayName: parsed.creatorDisplayName,
          promptText: parsed.promptText,
          isOpen: parsed.isOpen,
          publishedQuestions: parsed.questions
            .filter((q) => q.status === 'published')
            .map((q) => ({
              id: q.id,
              questionText: q.questionText,
              answerText: q.answerText,
              answeredAt: q.answeredAt,
            })),
        },
      };
    } catch {
      return { status: 'not_found' };
    }
  },

  async sendAmaQuestion(slug: string, questionText: string): Promise<void> {
    const cleanQ = questionText.trim();
    if (cleanQ.length < 2) {
      throw new Error('Please type a question first.');
    }

    if (supabase) {
      const { error } = await supabase.rpc('send_ama_question', {
        p_slug: slug.trim().toLowerCase(),
        p_question_text: cleanQ,
        p_sender_fingerprint: getClientFingerprint(),
      });
      if (error) throw new Error(error.message || 'Could not send question.');
      return;
    }

    const raw = localStorage.getItem(LOCAL_AMA_KEY);
    if (!raw) throw new Error('AMA Inbox not found.');
    const parsed: AmaInboxCreatorData = JSON.parse(raw);
    if (!parsed.isOpen) throw new Error('This inbox is currently closed.');

    parsed.questions.unshift({
      id: `ama_q_${Date.now()}`,
      questionText: cleanQ,
      answerText: '',
      status: 'private',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_AMA_KEY, JSON.stringify(parsed));
  },

  async manageAmaQuestion(
    questionId: string,
    action: 'answer' | 'skip' | 'delete' | 'unpublish' | 'block_report',
    answerText = '',
    publish = false
  ): Promise<void> {
    const creatorToken = getCreatorToken();

    if (supabase) {
      const { error } = await supabase.rpc('manage_ama_question', {
        p_creator_token: creatorToken,
        p_question_id: questionId,
        p_action: action,
        p_answer_text: answerText,
        p_publish: publish,
      });
      if (error) throw new Error(error.message || 'Could not update AMA question.');
      return;
    }

    const raw = localStorage.getItem(LOCAL_AMA_KEY);
    if (!raw) return;
    const parsed: AmaInboxCreatorData = JSON.parse(raw);
    if (action === 'delete' || action === 'block_report') {
      parsed.questions = parsed.questions.filter((q) => q.id !== questionId);
    } else {
      parsed.questions = parsed.questions.map((q) => {
        if (q.id !== questionId) return q;
        if (action === 'skip') return { ...q, status: 'skipped' };
        if (action === 'unpublish') return { ...q, status: 'private' };
        return {
          ...q,
          answerText: answerText.trim(),
          status: publish ? 'published' : 'private',
          answeredAt: new Date().toISOString(),
        };
      });
    }
    localStorage.setItem(LOCAL_AMA_KEY, JSON.stringify(parsed));
  },

  /* ==========================================================================
   * SITE-OWNER ADMIN PANEL API
   * ========================================================================== */
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
