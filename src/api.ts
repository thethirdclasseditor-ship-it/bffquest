import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BRAND, TEMPLATES, QuizQuestion, Lang } from './config';

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

export interface PublicQuiz {
  id: string;
  slug: string;
  creatorDisplayName: string;
  title: string;
  description: string;
  status: 'published' | 'disabled' | 'draft';
  totalParticipants?: number;
  questions: QuizQuestion[];
  leaderboard?: LeaderboardEntry[];
}

export interface SubmissionResult {
  submissionId: string;
  resultToken: string;
  quizSlug: string;
  quizTitle: string;
  creatorDisplayName: string;
  participantNickname: string;
  score: number;
  totalQuestions: number;
  scorePercentage: number;
  customAnswers?: CustomAnswerItem[];
  submittedAt: string;
  clientFingerprint?: string;
}

export interface CreatorQuizSummary {
  id: string;
  slug: string;
  title: string;
  status: 'published' | 'disabled' | 'draft';
  questionCount: number;
  submissionCount: number;
  averageScorePercentage: number;
  submissions: SubmissionResult[];
}

export interface AdminQuizItem {
  id: string;
  slug: string;
  title: string;
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
  quizzes: AdminQuizItem[];
  reports: AdminReportItem[];
}

const LANG_KEY = `${BRAND.storagePrefix}lang`;
const QUIZZES_KEY = `${BRAND.storagePrefix}quizzes`;
const SUBS_KEY = `${BRAND.storagePrefix}subs`;
const CREATOR_TOKEN_KEY = `${BRAND.storagePrefix}creator_token`;
const ADMIN_KEY_STORAGE = `${BRAND.storagePrefix}admin_key`;
const FP_KEY = `${BRAND.storagePrefix}fp`;

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
 * Reliable multi-layer clipboard helper with legacy fallback
 */
export async function copyTextSafely(
  text: string
): Promise<{ ok: boolean; method: 'clipboard' | 'fallback' | 'manual' }> {
  if (!text) return { ok: false, method: 'manual' };

  // 1. Try modern Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: 'clipboard' };
    } catch {
      // Fall through to legacy textarea method
    }
  }

  // 2. Try legacy document.execCommand('copy') fallback for mobile/WebView browsers
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
    // Fall through to manual selection prompt
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

function getSampleQuiz(lang: Lang = 'en'): PublicQuiz {
  const sampleTpl = TEMPLATES[lang][0];
  return {
    id: 'sample-quiz-001',
    slug: 'sample-best-friend-quiz',
    creatorDisplayName: lang === 'bn' ? 'আহাদ' : 'Ahad',
    title: sampleTpl.defaultTitle,
    description: sampleTpl.description,
    status: 'published',
    questions: sampleTpl.questions.map((q, idx) => ({
      ...q,
      id: `sample_q_${idx + 1}`,
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
    return parsed.filter((q) => q.slug !== 'sample-best-friend-quiz');
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

export const api = {
  isDemoMode: !isSupabaseConfigured,

  async publishQuiz(params: {
    creatorDisplayName: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
  }): Promise<{ slug: string }> {
    if (!params.creatorDisplayName.trim()) {
      throw new Error('Please enter your display name.');
    }
    if (params.title.trim().length < 3) {
      throw new Error('Quiz title must be at least 3 characters.');
    }
    if (
      params.questions.length < BRAND.limits.minQuestions ||
      params.questions.length > BRAND.limits.maxQuestions
    ) {
      throw new Error(
        `Quiz must have between ${BRAND.limits.minQuestions} and ${BRAND.limits.maxQuestions} questions.`
      );
    }

    for (let i = 0; i < params.questions.length; i++) {
      const q = params.questions[i];
      if (!q.questionText.trim()) {
        throw new Error(`Question ${i + 1} text cannot be empty.`);
      }
      // Validate the 3 fixed options (opt_1, opt_2, opt_3); opt_4 is the player write-in slot
      const fixedOptions = q.options.slice(0, 3);
      if (fixedOptions.some((o) => !o.text.trim())) {
        throw new Error(`Please fill in the first 3 answer choices for Question ${i + 1}.`);
      }
    }

    const slug = generateSlug(params.title, params.creatorDisplayName);
    const creatorToken = getCreatorToken();

    const normalizedQuestions: QuizQuestion[] = params.questions.map((q, idx) => ({
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
    }));

    let finalSlug = slug;
    let finalId = crypto.randomUUID ? crypto.randomUUID() : `quiz_${Date.now()}`;

    // If Supabase is configured, publish to Cloud FIRST so we never save a broken local copy
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
      });

      if (error) {
        throw new Error(error.message || 'Failed to publish quiz to cloud database.');
      }
      if (data?.slug) finalSlug = data.slug;
      if (data?.id) finalId = data.id;
    }

    // Cache locally after cloud success (or in demo mode)
    const existing = getLocalCreatedQuizzes().filter((q) => q.slug !== finalSlug);
    const newQuiz: PublicQuiz = {
      id: finalId,
      slug: finalSlug,
      creatorDisplayName: params.creatorDisplayName.trim(),
      title: params.title.trim(),
      description: params.description.trim(),
      status: 'published',
      questions: normalizedQuestions,
    };
    existing.unshift(newQuiz);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(existing));

    return { slug: finalSlug };
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

    // Built-in interactive sample quiz
    if (cleanSlug === 'sample-best-friend-quiz') {
      const sample = getSampleQuiz(lang);
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

    // Cloud lookup when Supabase is configured
    if (supabase) {
      const { data, error } = await supabase.rpc('get_public_quiz_by_slug', {
        p_slug: cleanSlug,
      });

      if (error) {
        return {
          status: 'error',
          errorMessage: error.message || 'Could not load quiz from cloud.',
        };
      }

      if (data) {
        if (data.status === 'ok') return { status: 'ok', quiz: data.quiz };
        if (data.status === 'not_found') return { status: 'not_found' };
        return { status: 'unavailable' };
      }
      return { status: 'not_found' };
    }

    // Demo mode local lookup
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

    if (supabase && cleanSlug !== 'sample-best-friend-quiz') {
      const { data, error } = await supabase.rpc('submit_quiz_answers', {
        p_slug: cleanSlug,
        p_participant_nickname: params.participantNickname,
        p_answers: params.answers,
        p_client_fingerprint: fingerprint,
        p_custom_texts: customTexts,
      });
      if (error) throw new Error(error.message);
      return data as SubmissionResult;
    }

    // Sample quiz or Demo mode evaluation
    const quiz =
      cleanSlug === 'sample-best-friend-quiz'
        ? getSampleQuiz(params.lang || 'en')
        : getLocalCreatedQuizzes().find((q) => q.slug.toLowerCase() === cleanSlug);

    if (!quiz || quiz.status !== 'published') {
      throw new Error('This quiz is no longer accepting submissions.');
    }

    const subs = getLocalSubmissions();
    if (
      cleanSlug !== 'sample-best-friend-quiz' &&
      subs.some((s) => s.clientFingerprint === fingerprint)
    ) {
      throw new Error('You have already submitted answers for this quiz.');
    }

    let correctCount = 0;
    const customAnswersList: CustomAnswerItem[] = [];

    for (const q of quiz.questions) {
      const selected = params.answers[q.id];
      if (!selected) throw new Error('Please answer all questions before submitting.');

      if (selected === 'opt_4') {
        const written = (customTexts[q.id] || '').trim();
        if (!written) {
          throw new Error('Please write your custom answer or pick one of the choices.');
        }
        customAnswersList.push({
          questionText: q.questionText,
          customAnswer: written,
        });
        if (q.correctOptionId === 'opt_4') {
          correctCount += 1;
        }
      } else if (selected === q.correctOptionId) {
        correctCount += 1;
      }
    }

    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const resultToken = generateRandomHex(10);

    const result: SubmissionResult = {
      submissionId: crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}`,
      resultToken,
      quizSlug: quiz.slug,
      quizTitle: quiz.title,
      creatorDisplayName: quiz.creatorDisplayName,
      participantNickname: params.participantNickname.trim() || 'Friend',
      score: correctCount,
      totalQuestions,
      scorePercentage,
      customAnswers: customAnswersList,
      submittedAt: new Date().toISOString(),
      clientFingerprint: fingerprint,
    };

    subs.unshift(result);
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
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
        throw new Error(error.message || 'Failed to load your quizzes.');
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
          status: q.status,
          questionCount: Number(q.questionCount || 5),
          submissionCount: subs.length,
          averageScorePercentage: avg,
          submissions: subs,
        };
      });
    }

    // Demo mode local quizzes (excludes sample quiz)
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
      if (error) throw new Error(error.message || 'Could not update quiz status.');
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
      if (error) throw new Error(error.message || 'Could not delete quiz.');
    }

    const list = getLocalCreatedQuizzes().filter((q) => q.id !== quizId);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(list));
  },

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
