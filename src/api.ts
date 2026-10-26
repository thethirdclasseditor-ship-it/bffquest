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

export interface PublicQuiz {
  id: string;
  slug: string;
  creatorDisplayName: string;
  title: string;
  description: string;
  status: 'published' | 'disabled' | 'draft';
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

const LANG_KEY = `${BRAND.storagePrefix}lang`;
const QUIZZES_KEY = `${BRAND.storagePrefix}quizzes`;
const SUBS_KEY = `${BRAND.storagePrefix}subs`;
const USER_KEY = `${BRAND.storagePrefix}user`;
const FP_KEY = `${BRAND.storagePrefix}fp`;

export function getSavedLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === 'bn' ? 'bn' : 'en';
}

export function saveLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
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
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    fp = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(FP_KEY, fp);
  }
  return fp;
}

function getLocalQuizzes(lang: Lang = 'en'): PublicQuiz[] {
  const raw = localStorage.getItem(QUIZZES_KEY);
  let list: PublicQuiz[] = [];
  if (raw) {
    try {
      list = JSON.parse(raw);
    } catch {
      list = [];
    }
  }

  const sampleTpl = TEMPLATES[lang][0];
  const sampleQuiz: PublicQuiz = {
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
    })),
  };

  const filtered = list.filter((q) => q.slug !== 'sample-best-friend-quiz');
  return [sampleQuiz, ...filtered];
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

  async getCurrentUser(): Promise<{ id: string; email: string; displayName: string } | null> {
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          displayName:
            (data.user.user_metadata?.display_name as string) ||
            data.user.email?.split('@')[0] ||
            'Creator',
        };
      }
    }
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async signInCreator(displayName: string, email: string, password: string) {
    if (supabase) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (signUpErr) throw new Error(signUpErr.message);
        if (signUpData.user) {
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            display_name: displayName.trim(),
          });
        }
      } else if (signInData.user) {
        await supabase.from('profiles').upsert({
          id: signInData.user.id,
          display_name: displayName.trim(),
        });
      }
    }

    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: 'local-creator-001',
        email: email.trim(),
        displayName: displayName.trim() || 'Creator',
      })
    );
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(USER_KEY);
  },

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
      if (q.options.some((o) => !o.text.trim())) {
        throw new Error(`All options in Question ${i + 1} must be filled.`);
      }
    }

    const slug = generateSlug(params.title, params.creatorDisplayName);

    // Save locally so Creator Dashboard on this device always remembers the quiz
    const existing = getLocalQuizzes().filter((q) => q.slug !== 'sample-best-friend-quiz');
    const newQuiz: PublicQuiz = {
      id: crypto.randomUUID ? crypto.randomUUID() : `quiz_${Date.now()}`,
      slug,
      creatorDisplayName: params.creatorDisplayName.trim(),
      title: params.title.trim(),
      description: params.description.trim(),
      status: 'published',
      questions: params.questions.map((q, idx) => ({
        ...q,
        position: idx + 1,
      })),
    };
    existing.unshift(newQuiz);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(existing));

    // Also publish to Supabase Cloud DB (works with or without account login!)
    if (supabase) {
      const { data, error } = await supabase.rpc('create_public_quiz', {
        p_slug: slug,
        p_creator_display_name: params.creatorDisplayName.trim(),
        p_title: params.title.trim(),
        p_description: params.description.trim(),
        p_questions: params.questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options,
          correctOptionId: q.correctOptionId || 'opt_1',
        })),
      });

      if (error) {
        throw new Error(error.message || 'Failed to save quiz to cloud.');
      }
      if (data && data.slug) {
        return { slug: data.slug };
      }
    }

    return { slug };
  },

  async getPublicQuizBySlug(
    slug: string,
    lang: Lang = 'en'
  ): Promise<{ status: 'ok' | 'unavailable' | 'not_found'; quiz?: PublicQuiz }> {
    const cleanSlug = slug.trim().toLowerCase();

    if (supabase && cleanSlug !== 'sample-best-friend-quiz') {
      const { data, error } = await supabase.rpc('get_public_quiz_by_slug', {
        p_slug: cleanSlug,
      });
      if (!error && data) {
        if (data.status === 'ok') return { status: 'ok', quiz: data.quiz };
        if (data.status === 'not_found') return { status: 'not_found' };
        return { status: 'unavailable' };
      }
    }

    const all = getLocalQuizzes(lang);
    const found = all.find((q) => q.slug.toLowerCase() === cleanSlug);
    if (!found) return { status: 'not_found' };
    if (found.status !== 'published') return { status: 'unavailable' };

    const localSubs = getLocalSubmissions()
      .filter((s) => s.quizSlug.toLowerCase() === cleanSlug)
      .sort((a, b) => b.scorePercentage - a.scorePercentage)
      .slice(0, 15);

    return {
      status: 'ok',
      quiz: {
        ...found,
        leaderboard: localSubs,
        questions: found.questions.map((q) => ({
          id: q.id,
          position: q.position,
          questionText: q.questionText,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
        })),
      },
    };
  },

  async submitQuizAnswers(params: {
    slug: string;
    participantNickname: string;
    answers: Record<string, string>;
    lang?: Lang;
  }): Promise<SubmissionResult> {
    const cleanSlug = params.slug.trim().toLowerCase();
    const fingerprint = `${cleanSlug}:${getClientFingerprint()}`;

    if (supabase && cleanSlug !== 'sample-best-friend-quiz') {
      const { data, error } = await supabase.rpc('submit_quiz_answers', {
        p_slug: cleanSlug,
        p_participant_nickname: params.participantNickname,
        p_answers: params.answers,
        p_client_fingerprint: fingerprint,
      });
      if (error) throw new Error(error.message);
      return data as SubmissionResult;
    }

    const all = getLocalQuizzes(params.lang || 'en');
    const quiz = all.find((q) => q.slug.toLowerCase() === cleanSlug);
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
    for (const q of quiz.questions) {
      const selected = params.answers[q.id];
      if (!selected) throw new Error('Please answer all questions before submitting.');
      if (selected === q.correctOptionId) {
        correctCount += 1;
      }
    }

    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    const resultToken = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

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

    if (supabase) {
      const { data, error } = await supabase.rpc('get_submission_result', {
        p_submission_id: submissionId,
        p_result_token: resultToken,
      });
      if (!error && data) return data as SubmissionResult;
    }

    const subs = getLocalSubmissions();
    return (
      subs.find((s) => s.submissionId === submissionId && s.resultToken === resultToken) || null
    );
  },

  async getCreatorDashboard(lang: Lang = 'en'): Promise<CreatorQuizSummary[]> {
    const user = await this.getCurrentUser();

    if (supabase && user && user.id !== 'local-creator-001') {
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select(
          `id, slug, title, status,
           quiz_questions(count),
           quiz_submissions(id, result_token, participant_nickname, score, total_questions, score_percentage, submitted_at)`
        )
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && quizzes && quizzes.length > 0) {
        return quizzes.map((q: any) => {
          const subs: SubmissionResult[] = (q.quiz_submissions || []).map((s: any) => ({
            submissionId: s.id,
            resultToken: s.result_token,
            quizSlug: q.slug,
            quizTitle: q.title,
            creatorDisplayName: user.displayName,
            participantNickname: s.participant_nickname,
            score: s.score,
            totalQuestions: s.total_questions,
            scorePercentage: Number(s.score_percentage),
            submittedAt: s.submitted_at,
          }));
          const avg =
            subs.length > 0
              ? Math.round(subs.reduce((a, b) => a + b.scorePercentage, 0) / subs.length)
              : 0;
          return {
            id: q.id,
            slug: q.slug,
            title: q.title,
            status: q.status,
            questionCount: q.quiz_questions?.[0]?.count || 0,
            submissionCount: subs.length,
            averageScorePercentage: avg,
            submissions: subs,
          };
        });
      }
    }

    const allQuizzes = getLocalQuizzes(lang);
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
    const nextStatus = currentStatus === 'published' ? 'disabled' : 'published';
    if (supabase) {
      await supabase.from('quizzes').update({ status: nextStatus }).eq('id', quizId);
    }
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (raw) {
      const list: PublicQuiz[] = JSON.parse(raw).map((q: PublicQuiz) =>
        q.id === quizId ? { ...q, status: nextStatus } : q
      );
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(list));
    }
  },

  async deleteQuiz(quizId: string) {
    if (supabase) {
      await supabase.from('quizzes').delete().eq('id', quizId);
    }
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (raw) {
      const list: PublicQuiz[] = JSON.parse(raw).filter((q: PublicQuiz) => q.id !== quizId);
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(list));
    }
  },

  async submitAbuseReport(quizSlug: string, reason: string, details: string) {
    if (!details.trim() || details.trim().length < 5) {
      throw new Error('Please write a brief description of the issue.');
    }
    if (supabase) {
      const { error } = await supabase.from('abuse_reports').insert({
        quiz_slug: quizSlug.trim() || null,
        reason,
        details: details.trim().slice(0, 1000),
      });
      if (error) throw new Error(error.message);
    }
  },
};
