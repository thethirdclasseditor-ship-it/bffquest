export type Lang = 'en' | 'bn';

export type GameType =
  | 'quiz'
  | 'ama'
  | 'guess_side'
  | 'two_truths'
  | 'wrapped'
  | 'blind_ranking'
  | 'would_you_rather'
  | 'daily_quest';

export const BRAND = {
  name: import.meta.env.VITE_APP_NAME || 'BFFquest',
  storagePrefix: 'bffquest_v4_',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'support@bffquest.com',
  limits: {
    minQuestions: 3,
    maxQuestions: 15,
  },
  ads: {
    enabled: import.meta.env.VITE_ENABLE_ADS === 'true',
    sponsorText: 'Sponsored • Play & Share BFFquest with your squad!',
    sponsorUrl: '',
  },
};

export interface QuizOption {
  id: string;
  text: string;
  icon?: string;
  isCustom?: boolean;
}

export interface QuizQuestion {
  id: string;
  position: number;
  questionText: string;
  options: QuizOption[];
  correctOptionId?: string;
}

export interface QuizTemplate {
  id: string;
  name: string;
  badge: string;
  accent: string;
  icon: string;
  defaultTitle: string;
  description: string;
  questions: Omit<QuizQuestion, 'id' | 'position'>[];
}

export interface GameModeMeta {
  id: GameType;
  category: 'quiz' | 'party' | 'daily';
  accent: string;
  icon: string;
  route: string;
  isCreatable: boolean;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  badge: Record<Lang, string>;
}

export const GAME_MODES: GameModeMeta[] = [
  {
    id: 'quiz',
    category: 'quiz',
    accent: '#7C5CFA',
    icon: 'spark',
    route: '/create?type=quiz',
    isCreatable: true,
    title: { en: 'Friendship Quiz', bn: 'ফ্রেন্ডশিপ কুইজ' },
    subtitle: { en: 'See who knows you best', bn: 'দেখুন কে আপনাকে সবচেয়ে ভালো চেনে' },
    badge: { en: 'Classic', bn: 'জনপ্রিয়' },
  },
  {
    id: 'ama',
    category: 'party',
    accent: '#5B9BFA',
    icon: 'bubble',
    route: '/inbox',
    isCreatable: false,
    title: { en: 'Ask Me Anything', bn: 'আস্ক মি এনিথিং (AMA)' },
    subtitle: { en: 'Your private question inbox', bn: 'আপনার প্রাইভেট অ্যানোনিমাস ইনবক্স' },
    badge: { en: 'Inbox', bn: 'ইনবক্স' },
  },
  {
    id: 'guess_side',
    category: 'quiz',
    accent: '#D58BF5',
    icon: 'coffee',
    route: '/create?type=guess_side',
    isCreatable: true,
    title: { en: 'Guess My Side', bn: 'গেস মাই সাইড' },
    subtitle: { en: 'Which side would I pick?', bn: 'দুটি অপশনের কোনটি আমার পছন্দ?' },
    badge: { en: 'This / That', bn: 'পছন্দ' },
  },
  {
    id: 'two_truths',
    category: 'party',
    accent: '#F2B84B',
    icon: 'mask',
    route: '/create?type=two_truths',
    isCreatable: true,
    title: { en: 'Two Truths & One Lie', bn: 'দুটি সত্য ও একটি মিথ্যা' },
    subtitle: { en: 'Spot the hidden lie', bn: '৩টি কথার মধ্যে মিথ্যাটি খুঁজে বের করুন' },
    badge: { en: 'Spot Lie', bn: 'মিথ্যা ধরুন' },
  },
  {
    id: 'wrapped',
    category: 'daily',
    accent: '#D58BF5',
    icon: 'spark',
    route: '/wrapped',
    isCreatable: false,
    title: { en: 'BFFQuest Wrapped', bn: 'BFFQuest র‍্যাপড' },
    subtitle: { en: 'Your real gameplay recap', bn: 'আপনার কুইজ ও গেমিং রিক্যাপ কার্ড' },
    badge: { en: 'Recap', bn: 'রিক্যাপ' },
  },
  {
    id: 'blind_ranking',
    category: 'party',
    accent: '#4FD1E8',
    icon: 'badge',
    route: '/create?type=blind_ranking',
    isCreatable: true,
    title: { en: 'Blind Ranking', bn: 'ব্লাইন্ড র‍্যাংকিং' },
    subtitle: { en: 'Rank 1–5 before seeing next', bn: 'পরেরটি না দেখে ১–৫ র‍্যাংক করুন' },
    badge: { en: '1 to 5', bn: 'র‍্যাংকিং' },
  },
  {
    id: 'would_you_rather',
    category: 'party',
    accent: '#7C5CFA',
    icon: 'sun',
    route: '/create?type=would_you_rather',
    isCreatable: true,
    title: { en: 'Would You Rather?', bn: 'উড ইউ রাদার?' },
    subtitle: { en: 'Two scenarios, live group vote', bn: 'দুটি কঠিন পরিস্থিতি ও গ্রুপ ভোটিং' },
    badge: { en: 'Vote', bn: 'ভোটিং' },
  },
  {
    id: 'daily_quest',
    category: 'daily',
    accent: '#3FD08A',
    icon: 'flame',
    route: '/daily',
    isCreatable: false,
    title: { en: 'Daily Quest', bn: 'ডেইলি কুয়েস্ট' },
    subtitle: { en: 'One challenge a day & streaks', bn: 'প্রতিদিনের চ্যালেঞ্জ ও স্ট্রিক' },
    badge: { en: 'Daily', bn: 'আজকের' },
  },
];

export interface DailyQuestItem {
  id: string;
  taskType: 'play_any' | 'create_any' | 'score_70' | 'ama_setup';
  targetCount: number;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
}

export const DAILY_QUESTS: DailyQuestItem[] = [
  {
    id: 'dq_play_1',
    taskType: 'play_any',
    targetCount: 1,
    title: {
      en: 'Play Any Friendship Game',
      bn: 'যেকোনো ১টি ফ্রেন্ডশিপ গেম খেলুন',
    },
    description: {
      en: 'Complete at least 1 quiz or game session today to lock in your daily streak.',
      bn: 'আজকের স্ট্রিক চালু রাখতে যেকোনো ১টি কুইজ বা গেম সম্পূর্ণ খেলুন।',
    },
  },
  {
    id: 'dq_create_1',
    taskType: 'create_any',
    targetCount: 1,
    title: {
      en: 'Create & Publish a Game',
      bn: 'নতুন ১টি কুইজ বা গেম তৈরি করুন',
    },
    description: {
      en: 'Build a Quiz, Guess My Side, Two Truths, Blind Ranking, or Would You Rather game today.',
      bn: 'আজ যেকোনো একটি নতুন গেম তৈরি করে লিংক জেনারেট করুন।',
    },
  },
  {
    id: 'dq_score_70',
    taskType: 'score_70',
    targetCount: 1,
    title: {
      en: 'Score 70%+ on Any Game',
      bn: 'যেকোনো গেমে ৭০% বা তার বেশি স্কোর করুন',
    },
    description: {
      en: 'Prove your best-friend intuition by scoring at least 70% on any quiz today.',
      bn: 'যেকোনো কুইজ বা গেমে অন্তত ৭০% স্কোর করে আজকের চ্যালেঞ্জ জিতুন।',
    },
  },
];

export interface BadgeMeta {
  id: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
}

export const BADGES: BadgeMeta[] = [
  {
    id: 'first_play',
    title: { en: 'First Spark', bn: 'প্রথম পদক্ষেপ' },
    desc: { en: 'Played your first game', bn: 'প্রথমবার গেম খেলেছেন' },
  },
  {
    id: 'creator_star',
    title: { en: 'Game Architect', bn: 'গেম নির্মাতা' },
    desc: { en: 'Published a game for friends', bn: 'বন্ধুদের জন্য গেম তৈরি করেছেন' },
  },
  {
    id: 'mind_reader',
    title: { en: 'Mind Reader', bn: 'মাইন্ড রিডার' },
    desc: { en: 'Scored 80%+ on a game', bn: '৮০%+ স্কোর অর্জন করেছেন' },
  },
  {
    id: 'streak_3',
    title: { en: '3-Day Flame', bn: '৩ দিনের স্ট্রিক' },
    desc: { en: 'Completed 3 daily quests', bn: '৩ দিন ডেইলি কুয়েস্ট সম্পন্ন করেছেন' },
  },
];

function makeQ(
  questionText: string,
  opt1: string,
  opt2: string,
  opt3: string,
  customLabel: string,
  correctOptionId = 'opt_1'
): Omit<QuizQuestion, 'id' | 'position'> {
  return {
    questionText,
    options: [
      { id: 'opt_1', text: opt1 },
      { id: 'opt_2', text: opt2 },
      { id: 'opt_3', text: opt3 },
      { id: 'opt_4', text: customLabel, isCustom: true },
    ],
    correctOptionId,
  };
}

const EN_CUSTOM = 'Write your own answer...';
const BN_CUSTOM = 'নিজের মতো উত্তর লিখুন...';

/* ============================================================================
 * PRESETS FOR NEW GAME MODES (Guess My Side, Two Truths, Blind Ranking, WYR)
 * ============================================================================ */
export const GAME_PRESETS: Record<
  Exclude<GameType, 'quiz' | 'ama' | 'wrapped' | 'daily_quest'>,
  Record<Lang, { defaultTitle: string; description: string; questions: Omit<QuizQuestion, 'id' | 'position'>[] }>
> = {
  guess_side: {
    en: {
      defaultTitle: 'Guess My Side: This or That?',
      description: 'Can you guess which side I would pick in every pair?',
      questions: [
        {
          questionText: 'Morning Beverage Vibe',
          options: [
            { id: 'opt_1', text: 'Iced / Hot Coffee', icon: 'coffee' },
            { id: 'opt_2', text: 'Masala Milk Tea', icon: 'tea' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'Ideal Vacation Escape',
          options: [
            { id: 'opt_1', text: 'Misty Mountains', icon: 'mount' },
            { id: 'opt_2', text: 'Sunny Ocean Beach', icon: 'sun' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'Peak Productivity Hours',
          options: [
            { id: 'opt_1', text: 'Early Morning Sun', icon: 'sun' },
            { id: 'opt_2', text: '2 AM Night Owl', icon: 'moon' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'Weekend Hangout Plan',
          options: [
            { id: 'opt_1', text: 'Cozy Home & Movies', icon: 'moon' },
            { id: 'opt_2', text: 'Outing & Street Food', icon: 'flame' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'Texting Style in Chats',
          options: [
            { id: 'opt_1', text: 'Short Instant Texts', icon: 'bubble' },
            { id: 'opt_2', text: 'Long Voice Notes', icon: 'spark' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
    bn: {
      defaultTitle: 'গেস মাই সাইড: আমার পছন্দ কোনটি?',
      description: 'প্রতিটি জোড়ার মধ্যে আমি কোনটি বেছে নেব তা অনুমান করো!',
      questions: [
        {
          questionText: 'চায়ের আড্ডা নাকি কফি?',
          options: [
            { id: 'opt_1', text: 'কড়া কফি / কোল্ড কফি', icon: 'coffee' },
            { id: 'opt_2', text: 'মালাই বা দুধ চা', icon: 'tea' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'ঘুরতে যাওয়ার সেরা জায়গা',
          options: [
            { id: 'opt_1', text: 'শান্ত পাহাড় ও মেঘ', icon: 'mount' },
            { id: 'opt_2', text: 'সমুদ্র সৈকত', icon: 'sun' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'আমার সবচেয়ে প্রিয় সময়',
          options: [
            { id: 'opt_1', text: 'সকালের স্নিগ্ধ রোদ', icon: 'sun' },
            { id: 'opt_2', text: 'রাত ২টার নীরবতা', icon: 'moon' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'ছুটির দিনের প্ল্যান',
          options: [
            { id: 'opt_1', text: 'বাসায় আরাম ও মুভি', icon: 'moon' },
            { id: 'opt_2', text: 'বাইরে আড্ডা ও স্ট্রিট ফুড', icon: 'flame' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'চ্যাটিং করার ধরন',
          options: [
            { id: 'opt_1', text: 'ছোট টেক্সট মেসেজ', icon: 'bubble' },
            { id: 'opt_2', text: 'লম্বা ভয়েস নোট', icon: 'spark' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
  },
  two_truths: {
    en: {
      defaultTitle: 'Two Truths & One Lie — Spot My Lie!',
      description: 'In each round, two statements about me are true and one is a total lie.',
      questions: [
        {
          questionText: 'Round 1: Everyday Habits — Which one is the LIE?',
          options: [
            { id: 'opt_1', text: 'I have pulled an all-nighter before a big day' },
            { id: 'opt_2', text: 'I hate eating biryani and street food' },
            { id: 'opt_3', text: 'I check my phone within 2 minutes of waking up' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'Round 2: Friendship Lore — Spot the LIE!',
          options: [
            { id: 'opt_1', text: 'I can keep a secret for years without telling anyone' },
            { id: 'opt_2', text: 'I sometimes mentally reply to a text and forget to send it' },
            { id: 'opt_3', text: 'I have never arrived late to a hangout in my life' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'Round 3: Hidden Talents & Quirks — Spot the LIE!',
          options: [
            { id: 'opt_1', text: 'I love building or exploring cool tech projects' },
            { id: 'opt_2', text: 'I have gone a whole month without using the internet' },
            { id: 'opt_3', text: 'I overthink small conversations at 2 AM' },
          ],
          correctOptionId: 'opt_2',
        },
      ],
    },
    bn: {
      defaultTitle: 'দুটি সত্য ও একটি মিথ্যা — আমার মিথ্যাটি ধরো!',
      description: 'প্রতিটি রাউন্ডে আমার সম্পর্কে ২টি সত্যি এবং ১টি মিথ্যা কথা আছে। কোনটি মিথ্যা?',
      questions: [
        {
          questionText: 'রাউন্ড ১: প্রতিদিনের অভ্যাস — কোন কথাটি মিথ্যা (Lie)?',
          options: [
            { id: 'opt_1', text: 'আমি মাঝে মাঝে সারারাত না ঘুমিয়ে কাজ বা আড্ডা দিয়েছি' },
            { id: 'opt_2', text: 'আমি বিরিয়ানি এবং স্ট্রিট ফুড একদমই পছন্দ করি না' },
            { id: 'opt_3', text: 'ঘুম থেকে উঠে ২ মিনিটের মধ্যেই আমি ফোন চেক করি' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'রাউন্ড ২: বন্ধুত্বের গল্প — কোন কথাটি মিথ্যা (Lie)?',
          options: [
            { id: 'opt_1', text: 'আমি যেকোনো গোপন কথা বছরের পর বছর নিজের কাছে রাখতে পারি' },
            { id: 'opt_2', text: 'মাঝে মাঝে মনে মনে মেসেজের উত্তর দিয়ে আসল রিপ্লাই দিতে ভুলে যাই' },
            { id: 'opt_3', text: 'আমি জীবনে কখনো আড্ডায় ১ মিনিটও দেরি করে পৌঁছাইনি' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'রাউন্ড ৩: শখ ও অভ্যাস — কোন কথাটি মিথ্যা (Lie)?',
          options: [
            { id: 'opt_1', text: 'নতুন টেকনোলজি বা ক্রিয়েটিভ প্রজেক্ট নিয়ে কাজ করতে আমার দারুণ লাগে' },
            { id: 'opt_2', text: 'আমি টানা ১ মাস ইন্টারনেট ও ফোন ছাড়া কাটিয়েছি' },
            { id: 'opt_3', text: 'রাত ২টায় শুয়ে আমি পুরনো কথা নিয়ে ওভারথিংক করি' },
          ],
          correctOptionId: 'opt_2',
        },
      ],
    },
  },
  blind_ranking: {
    en: {
      defaultTitle: 'Blind Ranking: My Top 5 Comfort Foods',
      description: 'Items appear one by one. Lock each into slots #1 to #5 before seeing the next!',
      questions: [
        {
          questionText: 'Kacchi Biryani',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'Loaded Cheese Pizza',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'Crispy Burger & Fries',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'Spicy Fuchka / Street Food',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
          correctOptionId: 'opt_4',
        },
        {
          questionText: 'Iced Cold Coffee & Cake',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
          correctOptionId: 'opt_5',
        },
      ],
    },
    bn: {
      defaultTitle: 'ব্লাইন্ড র‍্যাংকিং: আমার প্রিয় ৫টি খাবার',
      description: 'খাবারগুলো একে একে আসবে। পরেরটি না দেখেই ১ থেকে ৫ নম্বরে সাজাও!',
      questions: [
        {
          questionText: 'কাচ্চি বিরিয়ানি',
          options: [
            { id: 'opt_1', text: 'র‍্যাংক #১' },
            { id: 'opt_2', text: 'র‍্যাংক #২' },
            { id: 'opt_3', text: 'র‍্যাংক #৩' },
            { id: 'opt_4', text: 'র‍্যাংক #৪' },
            { id: 'opt_5', text: 'র‍্যাংক #৫' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'চিজ পিৎজা বা পাস্তা',
          options: [
            { id: 'opt_1', text: 'র‍্যাংক #১' },
            { id: 'opt_2', text: 'র‍্যাংক #২' },
            { id: 'opt_3', text: 'র‍্যাংক #৩' },
            { id: 'opt_4', text: 'র‍্যাংক #৪' },
            { id: 'opt_5', text: 'র‍্যাংক #৫' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'বার্গার ও ফ্রেঞ্চ ফ্রাই',
          options: [
            { id: 'opt_1', text: 'র‍্যাংক #১' },
            { id: 'opt_2', text: 'র‍্যাংক #২' },
            { id: 'opt_3', text: 'র‍্যাংক #৩' },
            { id: 'opt_4', text: 'র‍্যাংক #৪' },
            { id: 'opt_5', text: 'র‍্যাংক #৫' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'ঝাল ফুচকা ও চটপটি',
          options: [
            { id: 'opt_1', text: 'র‍্যাংক #১' },
            { id: 'opt_2', text: 'র‍্যাংক #২' },
            { id: 'opt_3', text: 'র‍্যাংক #৩' },
            { id: 'opt_4', text: 'র‍্যাংক #৪' },
            { id: 'opt_5', text: 'র‍্যাংক #৫' },
          ],
          correctOptionId: 'opt_4',
        },
        {
          questionText: 'কোল্ড কফি ও পেস্ট্রি',
          options: [
            { id: 'opt_1', text: 'র‍্যাংক #১' },
            { id: 'opt_2', text: 'র‍্যাংক #২' },
            { id: 'opt_3', text: 'র‍্যাংক #৩' },
            { id: 'opt_4', text: 'র‍্যাংক #৪' },
            { id: 'opt_5', text: 'র‍্যাংক #৫' },
          ],
          correctOptionId: 'opt_5',
        },
      ],
    },
  },
  would_you_rather: {
    en: {
      defaultTitle: 'Would You Rather? — Squad Edition',
      description: 'Pick one scenario in each dilemma and see how the group votes!',
      questions: [
        {
          questionText: 'Superpower Dilemma',
          options: [
            { id: 'opt_1', text: 'Travel 10 years into the future', icon: 'sun' },
            { id: 'opt_2', text: 'Rewind 10 years into the past with your current memory', icon: 'moon' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'Tech & Lifestyle Dilemma',
          options: [
            { id: 'opt_1', text: 'Have unlimited free food at any restaurant forever', icon: 'coffee' },
            { id: 'opt_2', text: 'Have free first-class flights to any country forever', icon: 'spark' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'Friendship Dilemma',
          options: [
            { id: 'opt_1', text: 'Have 1 ultra-loyal best friend for life', icon: 'badge' },
            { id: 'opt_2', text: 'Have a huge squad of 20 fun hangout friends', icon: 'bubble' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
    bn: {
      defaultTitle: 'উড ইউ রাদার? — কোনটি বেছে নেবে?',
      description: 'দুটি কঠিন অপশনের মধ্যে ১টি বেছে নাও এবং দেখো কত শতাংশ বন্ধু তোমার দলে!',
      questions: [
        {
          questionText: 'টাইম ট্রাভেল করার সুযোগ পেলে কোনটি নেবে?',
          options: [
            { id: 'opt_1', text: '১০ বছর ভবিষ্যতে গিয়ে নিজেকে দেখা', icon: 'sun' },
            { id: 'opt_2', text: 'এখনকার সব বুদ্ধি নিয়ে ১০ বছর অতীতে ফিরে যাওয়া', icon: 'moon' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'আজীবনের জন্য কোন সুবিধাটি বেছে নেবে?',
          options: [
            { id: 'opt_1', text: 'পৃথিবীর যেকোনো রেস্তোরাঁয় আজীবন ফ্রি খাবার', icon: 'coffee' },
            { id: 'opt_2', text: 'পৃথিবীর যেকোনো দেশে আজীবন ফ্রি বিমান ভ্রমণ', icon: 'spark' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'বন্ধুত্বের ক্ষেত্রে কোনটি বেশি গুরুত্বপূর্ণ?',
          options: [
            { id: 'opt_1', text: 'সারাজীবনের জন্য ১ জন শতভাগ বিশ্বস্ত বেস্ট ফ্রেন্ড থাকা', icon: 'badge' },
            { id: 'opt_2', text: 'আড্ডা দেওয়ার মতো ২০ জন মজার মানুষের বিশাল গ্রুপ থাকা', icon: 'bubble' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
  },
};

export const COPY = {
  en: {
    tagline: 'Friendship quiz games',
    heroTitle1: 'Better Friends.',
    heroTitle2: 'Bigger Moments.',
    heroSub:
      'Create fun quizzes, challenge your friends, and discover how well they really know you.',
    createBtn: 'Create a Quiz',
    exploreBtn: 'Explore Games',
    sampleBtn: 'Try Sample Quiz',
    navHome: 'Home',
    navExplore: 'Explore',
    navCreate: 'Create',
    navInbox: 'Inbox',
    navProfile: 'Profile',
    navGuides: 'Guides',
    navDashboard: 'My Quizzes',
    demoBanner:
      'Local Demo Mode: Connect Supabase for cross-device cloud sharing.',
    qaCreateTitle: 'Create a quiz',
    qaCreateSub: 'Write your own questions',
    qaPlayTitle: 'Play with friends',
    qaPlaySub: 'Challenge them with a link',
    qaShareTitle: 'Share a result',
    qaShareSub: 'Show off your score',
    howItWorksTitle: 'How it works',
    step1Title: 'Create your quiz',
    step1Desc: 'Pick a template or write your own questions across 5 game modes.',
    step2Title: 'Share it with friends',
    step2Desc: 'Send one direct link anywhere your friends hang out.',
    step3Title: 'Discover your results',
    step3Desc: 'See who knows you best, compare sides, and climb the podium.',
    featuredTemplatesTitle: 'Featured templates',
    useTemplateBtn: 'Use template',
    exploreGamesTitle: 'Explore games',
    seeAllGamesBtn: 'See all games ›',
    ctaBannerTitle: 'Ready to see who knows you best?',
    ctaBannerSub: 'Your quizzes, inbox, and play stats stay saved automatically.',
    builderHeading: 'Create Your BFFquest Game',
    builderSub:
      'Choose a game mode & template below, customize your prompts, and publish your shareable link.',
    loadTemplateLabel: 'Choose a Quick-Load Editable Template:',
    templateLoadedMsg: 'Template loaded! You can edit any field below.',
    yourNameLabel: 'Your Display Name *',
    yourNamePlaceholder: 'e.g., Ahad',
    quizTitleLabel: 'Game / Quiz Title *',
    quizDescLabel: 'Short Note for Friends (Optional)',
    questionLabel: 'Question',
    selectTrueAnswer: '3 Fixed Choices + 1 Write-In Slot (Tap circle for true answer) *',
    customSlotHint: 'Option 4 (Player writes their own answer)',
    addQuestionBtn: '+ Add Round / Question',
    publishBtn: 'Publish & Get Link',
    publishingBtn: 'Publishing...',
    publishedBadge: 'Published Live',
    publishedHeading: 'Your Game Link Is Ready!',
    publishedSub:
      'Copy your direct link below or share straight to WhatsApp. Friends on any phone can play immediately.',
    directLinkLabel: 'Direct Shareable Link:',
    copyLinkBtn: 'Copy Direct Link',
    copiedBtn: 'Copied!',
    copyManualHint: 'Link selected! Press Copy on your screen.',
    whatsappShareBtn: 'Share on WhatsApp',
    shareNativeBtn: 'More Share Options',
    openQuizBtn: 'Open Game Page',
    invitedBy: 'Created by',
    questionsCount: 'Rounds',
    noAccountNeeded: 'No Sign-Up Needed',
    startQuizBtn: 'Play Now',
    nicknameLabel: 'Your Name or Nickname *',
    nicknamePlaceholder: 'e.g., Rafi',
    writeOwnLabel: 'Or write your own answer',
    writeOwnPlaceholder: 'Type your custom answer here...',
    backBtn: 'Back',
    nextBtn: 'Next',
    finishBtn: 'Lock In & See Result',
    scoreRevealBadge: 'Official Result',
    shareScoreBtn: 'Copy Link',
    downloadCardBtn: 'Download Card',
    challengeBackTitle: 'Now Turn the Tables!',
    challengeBackSub:
      'Create your own BFFquest game in 60 seconds and challenge your friends back.',
    customAnswersTitle: 'Written Answers',
    leaderboardTitle: 'Leaderboard',
    leaderboardSub: 'Top friends ranked by highest score',
    participantsCount: 'Played',
    leaderboardEmpty: 'No friend has finished this game yet—be #1 on the podium!',
    dashboardTitle: 'My Profile & Created Games',
    dashboardSub:
      'Manage your published games, view friend scores, or open your BFFQuest Wrapped recap.',
    totalQuizzes: 'My Games',
    totalSubmissions: 'Total Plays',
    avgScore: 'Weighted Avg',
    pauseBtn: 'Pause',
    activateBtn: 'Publish',
    deleteBtn: 'Delete',
    confirmDeleteQuiz: 'Permanently delete this game and all its scores?',
    recentSubmissions: 'Friend Scores & Custom Answers:',
    noQuizzesYet: 'You have not created any games yet. Launch your first one in 60 seconds!',
    reportTitle: 'Report Inappropriate Content',
    reportSub: 'Help us keep BFFquest positive and safe.',
    reportSlugLabel: 'Game Link or Slug (Optional)',
    reportReasonLabel: 'Reason *',
    reportDetailsLabel: 'Details *',
    reportSubmitBtn: 'Submit Report',
    reportSuccess: 'Thank you! Your report has been recorded for review.',
    adminTitle: 'Site-Owner Admin Panel',
    footerNote: 'Playful friendship games • Built with Liquid Glass.',
  },
  bn: {
    tagline: 'প্রিমিয়াম ফ্রেন্ডশিপ গেমস',
    heroTitle1: 'বেটার ফ্রেন্ডস।',
    heroTitle2: 'বিগার মোমেন্টস।',
    heroSub:
      'মজার কুইজ ও গেম তৈরি করুন, বন্ধুদের চ্যালেঞ্জ ছুড়ে দিন এবং দেখুন তারা আপনাকে সত্যিই কতটা ভালো চেনে।',
    createBtn: 'কুইজ তৈরি করুন',
    exploreBtn: 'সব গেম দেখুন',
    sampleBtn: 'স্যাম্পল কুইজ খেলুন',
    navHome: 'হোম',
    navExplore: 'গেমস',
    navCreate: 'তৈরি করুন',
    navInbox: 'ইনবক্স',
    navProfile: 'প্রোফাইল',
    navGuides: 'গাইড',
    navDashboard: 'আমার গেমস',
    demoBanner:
      'লোকাল ডেমো মোড: সব ডিভাইসে শেয়ার করার জন্য Supabase কানেক্ট করুন।',
    qaCreateTitle: 'কুইজ তৈরি করুন',
    qaCreateSub: 'নিজের মতো প্রশ্ন সাজান',
    qaPlayTitle: 'বন্ধুদের সাথে খেলুন',
    qaPlaySub: 'এক লিংকেই চ্যালেঞ্জ পাঠান',
    qaShareTitle: 'রেজাল্ট শেয়ার করুন',
    qaShareSub: 'স্কোর কার্ড ডাউনলোড করুন',
    howItWorksTitle: 'কীভাবে কাজ করে',
    step1Title: 'গেম বা কুইজ সাজান',
    step1Desc: 'রেডিমেড টেমপ্লেট বেছে নিন অথবা নিজের মতো প্রশ্ন যোগ করুন।',
    step2Title: 'বন্ধুদের লিংক পাঠান',
    step2Desc: 'হোয়াটসঅ্যাপ বা মেসেঞ্জারে ১ ক্লিকেই লিংক শেয়ার করুন।',
    step3Title: 'ফলাফল ও র‍্যাংকিং দেখুন',
    step3Desc: 'দেখুন কে আপনার সাথে সবচেয়ে বেশি মেলে এবং লিডারবোর্ডে প্রথম হয়।',
    featuredTemplatesTitle: 'জনপ্রিয় টেমপ্লেটসমূহ',
    useTemplateBtn: 'টেমপ্লেট ব্যবহার করুন',
    exploreGamesTitle: 'সবগুলো গেম মোড',
    seeAllGamesBtn: 'সব গেম দেখুন ›',
    ctaBannerTitle: 'দেখতে চান কে আপনাকে সবচেয়ে ভালো চেনে?',
    ctaBannerSub: 'আপনার সব কুইজ, ইনবক্স এবং খেলার রেকর্ড স্বয়ংক্রিয়ভাবে সেভ থাকে।',
    builderHeading: 'নতুন BFFquest গেম তৈরি করুন',
    builderSub:
      'নিচে গেম মোড বা টেমপ্লেট বেছে নিন, নিজের মতো সাজিয়ে পাবলিশ করুন এবং বন্ধুদের লিংক পাঠান।',
    loadTemplateLabel: 'রেডিমেড এডিটেবল টেমপ্লেট বেছে নিন:',
    templateLoadedMsg: 'টেমপ্লেট লোড হয়েছে! নিচে নিজের মতো এডিট করতে পারেন।',
    yourNameLabel: 'আপনার নাম *',
    yourNamePlaceholder: 'যেমন: আহাদ',
    quizTitleLabel: 'গেম বা কুইজের শিরোনাম *',
    quizDescLabel: 'বন্ধুদের জন্য ছোট বার্তা (ঐচ্ছিক)',
    questionLabel: 'প্রশ্ন',
    selectTrueAnswer: '৩টি অপশন + ১টি নিজের মতো লেখার অপশন (সঠিক উত্তরের বৃত্তে টিক দিন) *',
    customSlotHint: '৪ নম্বর অপশন (বন্ধুরা নিজেদের মতো উত্তর লিখতে পারবে)',
    addQuestionBtn: '+ নতুন প্রশ্ন / রাউন্ড যোগ করুন',
    publishBtn: 'পাবলিশ করুন ও লিংক নিন',
    publishingBtn: 'পাবলিশ হচ্ছে...',
    publishedBadge: 'সফলভাবে পাবলিশ হয়েছে',
    publishedHeading: 'আপনার গেম লিংক তৈরি!',
    publishedSub:
      'নিচে ডিরেক্ট লিংক কপি করুন অথবা হোয়াটসঅ্যাপে বন্ধুদের পাঠান।',
    directLinkLabel: 'ডিরেক্ট শেয়ার লিংক:',
    copyLinkBtn: 'লিংক কপি করুন',
    copiedBtn: 'কপি হয়েছে!',
    copyManualHint: 'লিংক সিলেক্ট হয়েছে! এবার Copy চাপুন।',
    whatsappShareBtn: 'হোয়াটসঅ্যাপে শেয়ার',
    shareNativeBtn: 'অন্যান্য অ্যাপে শেয়ার',
    openQuizBtn: 'গেম পেজ খুলুন',
    invitedBy: 'তৈরি করেছেন',
    questionsCount: 'টি রাউন্ড',
    noAccountNeeded: 'অ্যাকাউন্ট ছাড়াই খেলুন',
    startQuizBtn: 'খেলা শুরু করুন',
    nicknameLabel: 'আপনার নাম বা ডাকনাম *',
    nicknamePlaceholder: 'যেমন: রাফি',
    writeOwnLabel: 'অথবা নিজের মতো উত্তর লিখুন',
    writeOwnPlaceholder: 'এখানে আপনার উত্তরটি লিখুন...',
    backBtn: 'পেছনে',
    nextBtn: 'পরের ধাপ',
    finishBtn: 'সাবমিট করুন ও ফলাফল দেখুন',
    scoreRevealBadge: 'ফলাফল',
    shareScoreBtn: 'লিংক কপি করুন',
    downloadCardBtn: 'কার্ড ডাউনলোড',
    challengeBackTitle: 'এবার আপনার পালা!',
    challengeBackSub:
      'মাত্র ১ মিনিটে নিজের গেম বানিয়ে বন্ধুদের পাল্টা চ্যালেঞ্জ ছুড়ে দিন।',
    customAnswersTitle: 'লেখা কাস্টম উত্তরসমূহ',
    leaderboardTitle: 'লিডারবোর্ড',
    leaderboardSub: 'সর্বোচ্চ স্কোরের ভিত্তিতে সেরা বন্ধুদের তালিকা',
    participantsCount: 'জন খেলেছে',
    leaderboardEmpty: 'এখনো কেউ খেলেনি—সবার আগে খেলে ১ম স্থান দখল করুন!',
    dashboardTitle: 'আমার প্রোফাইল ও তৈরি করা গেমস',
    dashboardSub:
      'আপনার তৈরি করা সব গেম, বন্ধুদের স্কোর এবং BFFQuest Wrapped রিক্যাপ এখানে দেখুন।',
    totalQuizzes: 'মোট গেম',
    totalSubmissions: 'মোট খেলা হয়েছে',
    avgScore: 'গড় স্কোর',
    pauseBtn: 'বিরতি',
    activateBtn: 'চালু করুন',
    deleteBtn: 'ডিলিট',
    confirmDeleteQuiz: 'আপনি কি নিশ্চিত যে এই গেম এবং এর সব স্কোর ডিলিট করতে চান?',
    recentSubmissions: 'বন্ধুদের স্কোর ও লিখিত উত্তর:',
    noQuizzesYet: 'আপনি এখনো কোনো গেম তৈরি করেননি। ৬০ সেকেন্ডে প্রথমটি তৈরি করুন!',
    reportTitle: 'অভিযোগ জানান (Report Abuse)',
    reportSub: 'কোনো আপত্তিকর লিংক বা প্রশ্নের বিরুদ্ধে অভিযোগ জানান।',
    reportSlugLabel: 'গেম লিংক বা স্লাগ (ঐচ্ছিক)',
    reportReasonLabel: 'অভিযোগের কারণ *',
    reportDetailsLabel: 'বিস্তারিত বিবরণ *',
    reportSubmitBtn: 'অভিযোগ জমা দিন',
    reportSuccess: 'ধন্যবাদ! আপনার অভিযোগটি অ্যাডমিন রিভিউয়ের জন্য জমা হয়েছে।',
    adminTitle: 'সাইট অ্যাডমিন প্যানেল',
    footerNote: 'ফ্রেন্ডশিপ গেমিং প্ল্যাটফর্ম • লিকুইড গ্লাস সংস্করণ।',
  },
};

export const TEMPLATES: Record<Lang, QuizTemplate[]> = {
  en: [
    {
      id: 'best-friends',
      name: '🔥 Best Friends Classic',
      badge: 'Popular',
      accent: '#7C5CFA',
      icon: 'bubble',
      defaultTitle: 'How Well Do You Actually Know Me?',
      description: 'Everyday habits, comfort foods, and how I react in classic situations.',
      questions: [
        makeQ(
          'What is my ultimate comfort food after a long, tiring week?',
          'Biryani or spicy street food',
          'Loaded pizza or pasta',
          'Burgers, fries & cold coffee',
          EN_CUSTOM
        ),
        makeQ(
          'If our group hangout gets cancelled last minute, how do I react?',
          'Secretly relieved—staying home in peace',
          'Annoyed because I already got ready',
          'Calling another friend immediately',
          EN_CUSTOM
        ),
        makeQ(
          'Which small habit shows that I am stressed out?',
          'Going unusually quiet in chats',
          'Drinking way too much tea or coffee',
          'Staying up past 3 AM overthinking',
          EN_CUSTOM,
          'opt_2'
        ),
        makeQ(
          'What kind of vacation would I choose first?',
          'Quiet mountain cabin with misty views',
          'Vibrant city full of food & late cafes',
          'Relaxing beach by the ocean',
          EN_CUSTOM
        ),
        makeQ(
          'How do I usually reply to a long 3-minute voice note?',
          'Send an even longer voice note back',
          'Reply with two short text messages',
          'Listen at 2x speed and send a reaction',
          EN_CUSTOM
        ),
      ],
    },
    {
      id: 'campus-crew',
      name: '🎓 Campus & Squad Trivia',
      badge: 'Squad',
      accent: '#5B9BFA',
      icon: 'coffee',
      defaultTitle: 'The Ultimate Campus & Hangout Squad Test',
      description: 'Canteen talks, group projects, and late-night hangout habits.',
      questions: [
        makeQ(
          'What is my real role in any group project or team task?',
          'Designing & building the main thing',
          'Finishing everything the night before',
          'Moral support and ordering food',
          EN_CUSTOM
        ),
        makeQ(
          'Where do I spend most of my pocket money every month?',
          'Late-night food orders & tea stalls',
          'Tech gadgets & subscriptions',
          'Fashion, watches, or accessories',
          EN_CUSTOM
        ),
        makeQ(
          'If the hangout plan says 5:00 PM, when do I actually arrive?',
          '4:55 PM—always punctual',
          '5:15 PM—reasonably on time',
          'After someone texts that they reached',
          EN_CUSTOM,
          'opt_2'
        ),
        makeQ(
          'How do I recharge on a free Friday evening?',
          'Working on a cool side project',
          'Going out for tea and street food',
          'Playing games or watching a thriller',
          EN_CUSTOM
        ),
        makeQ(
          'What quality matters most to me in a close friend?',
          'Loyalty and honesty no matter what',
          'Great humor that fixes bad days',
          'Supporting each other’s big goals',
          EN_CUSTOM
        ),
      ],
    },
    {
      id: 'funny-roast',
      name: '😂 Funny Roast & Red Flags',
      badge: 'Funny',
      accent: '#D58BF5',
      icon: 'spark',
      defaultTitle: 'Do You Know My Biggest Quirks & Red Flags?',
      description: 'Let’s see if you know my funny habits and daily chaos.',
      questions: [
        makeQ(
          'What is my biggest everyday "red flag" as a friend?',
          'Replying 3 business days later',
          'Saying "I’m 5 minutes away" while still at home',
          'Giving advice I never follow myself',
          EN_CUSTOM
        ),
        makeQ(
          'What is the fastest way to make me instantly happy?',
          'Bringing me food without asking',
          'Hyping up my latest idea or photo',
          'Canceling a boring plan together',
          EN_CUSTOM
        ),
        makeQ(
          'If I suddenly became a billionaire tomorrow, what would I do first?',
          'Disappear on a world tour with close friends',
          'Buy the craziest tech setup & dream car',
          'Still bargain at local shops out of habit',
          EN_CUSTOM
        ),
        makeQ(
          'Why am I usually awake at 2:30 AM?',
          'Deep-diving into a random rabbit hole online',
          'Building or fixing something on my phone',
          'Having deep life talks in group chat',
          EN_CUSTOM
        ),
        makeQ(
          'What happens when I try to save money?',
          'I end up ordering food the same night',
          'I actually stick to a strict budget',
          'I buy something "on sale" I didn’t need',
          EN_CUSTOM
        ),
      ],
    },
    {
      id: 'siblings-cousins',
      name: '🏡 Siblings & Cousins',
      badge: 'Family',
      accent: '#4FD1E8',
      icon: 'sun',
      defaultTitle: 'The Ultimate Cousin & Sibling Bond Test',
      description: 'Family dinners, childhood secrets, and Eid hangout memories.',
      questions: [
        makeQ(
          'At a big family gathering or wedding, where will you find me?',
          'Near the food counter with my favorite cousins',
          'Sitting quietly in a corner on my phone',
          'Taking photos and roasting everyone’s outfits',
          EN_CUSTOM
        ),
        makeQ(
          'What did I always get in trouble for growing up?',
          'Staying up late with the lights on',
          'Laughing at the wrong moment',
          'Breaking or opening up gadgets out of curiosity',
          EN_CUSTOM
        ),
        makeQ(
          'When guests visit our house, what is my classic move?',
          'Smile politely and retreat to my room',
          'Serve tea and chat like a pro host',
          'Pretend I have urgent study or work',
          EN_CUSTOM
        ),
        makeQ(
          'Who is most likely to keep my secret in the family?',
          'My closest cousin',
          'My sibling (after blackmailing me first)',
          'Nobody—I keep my best secrets to myself',
          EN_CUSTOM
        ),
        makeQ(
          'What is my favorite part of festive holidays (like Eid)?',
          'Late-night cousin adda & outing',
          'Collecting Eidi and feasting all day',
          'Sleeping in after dressing up for 1 hour',
          EN_CUSTOM
        ),
      ],
    },
    {
      id: 'couples-vibe',
      name: '💖 Partner & Crush Vibe',
      badge: 'Special',
      accent: '#D58BF5',
      icon: 'spark',
      defaultTitle: 'How Well Do You Know My Heart?',
      description: 'Love languages, ideal dates, and the little things I notice.',
      questions: [
        makeQ(
          'What is my primary way of showing someone I care?',
          'Quality time and thoughtful late-night talks',
          'Helping them solve problems & actions over words',
          'Remembering tiny details they mentioned once',
          EN_CUSTOM
        ),
        makeQ(
          'What sounds like the most perfect evening date to me?',
          'Quiet rooftop cafe or long evening walk',
          'Trying a brand-new food spot together',
          'Cozy movie marathon and ordering in',
          EN_CUSTOM
        ),
        makeQ(
          'When I am upset with someone I care about, what do I do?',
          'Go quiet until I process my thoughts',
          'Talk it out immediately to clear the air',
          'Drop subtle hints and wait for them to notice',
          EN_CUSTOM
        ),
        makeQ(
          'What small gesture wins me over every single time?',
          'A genuine check-in text during a busy day',
          'Sharing songs, memes, or reels that remind them of me',
          'Listening patiently without judging',
          EN_CUSTOM
        ),
        makeQ(
          'Which future goal excites me the most right now?',
          'Building financial freedom & my own venture',
          'Traveling to bucket-list countries',
          'A peaceful home surrounded by favorite people',
          EN_CUSTOM
        ),
      ],
    },
    {
      id: 'gaming-night',
      name: '🎮 Gaming & Night Owls',
      badge: 'Gamer',
      accent: '#7C5CFA',
      icon: 'flame',
      defaultTitle: 'Night Owl & Gaming Squad Quiz',
      description: 'Rank matches, chess battles, and 3 AM discord vibes.',
      questions: [
        makeQ(
          'What is my go-to playstyle in competitive games or chess?',
          'Calculated strategy—thinking 4 moves ahead',
          'All-out aggressive rush from the start',
          'Playing for fun & chaos with friends',
          EN_CUSTOM
        ),
        makeQ(
          'When we lose a close match, what is my immediate reaction?',
          '"One more match—we cannot end on a loss!"',
          'Analyze what went wrong calmly',
          'Blame the lag and laugh it off',
          EN_CUSTOM
        ),
        makeQ(
          'What is my essential fuel during a late-night session?',
          'Strong coffee or masala tea',
          'Cold soda and spicy chips',
          'Just water and pure focus',
          EN_CUSTOM
        ),
        makeQ(
          'Which gadget upgrade do I care about the most?',
          'Fast phone/PC with zero frame drops',
          'Crisp headphones or audio gear',
          'Clean minimalist desk setup',
          EN_CUSTOM
        ),
        makeQ(
          'What time do I usually say "Goodnight" vs when I actually sleep?',
          'Say goodnight at 12 AM, sleep at 3 AM',
          'Fall asleep mid-conversation without warning',
          'Actually sleep right when I say goodnight',
          EN_CUSTOM
        ),
      ],
    },
  ],
  bn: [
    {
      id: 'best-friends',
      name: '🔥 বেস্ট ফ্রেন্ড ক্লাসিক',
      badge: 'জনপ্রিয়',
      accent: '#7C5CFA',
      icon: 'bubble',
      defaultTitle: 'তুমি আমাকে কতটা ভালো চেনো?',
      description: 'আমার প্রতিদিনের অভ্যাস, প্রিয় খাবার এবং মজার কিছু পছন্দ নিয়ে কুইজ।',
      questions: [
        makeQ(
          'সপ্তাহান্তে বা মন খারাপ থাকলে আমার সবচেয়ে প্রিয় খাবার কোনটি?',
          'কাচ্চি বিরিয়ানি বা ঝাল স্ট্রিট ফুড',
          'পিৎজা বা পাস্তা',
          'বার্গার, ফ্রাই ও কোল্ড কফি',
          BN_CUSTOM
        ),
        makeQ(
          'হঠাৎ করে শেষ মুহূর্তে আড্ডার প্ল্যান ক্যানসেল হলে আমি মনে মনে কী ভাবি?',
          'বাঁচা গেল! এখন বাসায় আরাম করে থাকব',
          'মেজাজ খারাপ হয়, কারণ রেডি হয়ে গিয়েছিলাম',
          'অন্য কোনো বন্ধুকে কল দিয়ে নতুন প্ল্যান করি',
          BN_CUSTOM
        ),
        makeQ(
          'আমি খুব চাপে বা টেনশনে থাকলে কোন অভ্যাসটি দেখে বোঝা যায়?',
          'গ্রুপ চ্যাটে একদম চুপচাপ হয়ে যাই',
          'ঘন ঘন চা বা কফি খাই',
          'রাত ৩টা পর্যন্ত জেগে কাজ গুছাই',
          BN_CUSTOM,
          'opt_2'
        ),
        makeQ(
          'ছুটিতে ঘুরতে যাওয়ার সুযোগ পেলে আমি কোন জায়গাটি সবার আগে বেছে নেব?',
          'কুয়াশা ঘেরা শান্ত পাহাড় ও মেঘ',
          'রাতের ঝলমলে শহর ও দারুণ সব রেস্তোরাঁ',
          'সমুদ্র সৈকত ও ঢেউয়ের গর্জন',
          BN_CUSTOM
        ),
        makeQ(
          'কেউ ৩ মিনিটের লম্বা ভয়েস নোট পাঠালে আমি সাধারণত কী করি?',
          'উত্তরে আরও বড় ভয়েস নোট পাঠাই',
          'ছোট দুই লাইনের টেক্সটে উত্তর দিই',
          '2x স্পিডে শুনে ইমোজি রিঅ্যাক্ট দিই',
          BN_CUSTOM
        ),
      ],
    },
    {
      id: 'campus-crew',
      name: '🎓 ক্যাম্পাস ও আড্ডা গ্যাং',
      badge: 'আড্ডা',
      accent: '#5B9BFA',
      icon: 'coffee',
      defaultTitle: 'আমাদের আড্ডা ও ক্যাম্পাস গ্যাং কুইজ',
      description: 'ক্যান্টিনের চা, গ্রুপ প্রজেক্ট এবং প্রতিদিনের আড্ডার স্মৃতি।',
      questions: [
        makeQ(
          'যেকোনো গ্রুপ প্রজেক্ট বা টিমের কাজে আমার আসল ভূমিকা কী থাকে?',
          'মূল ডিজাইন ও আসল কাজটি গুছিয়ে করা',
          'জমা দেওয়ার আগের রাতে পুরো কাজ শেষ করা',
          'সবাইকে উৎসাহ দেওয়া এবং খাবারের ব্যবস্থা করা',
          BN_CUSTOM
        ),
        makeQ(
          'প্রতি মাসে আমার সবচেয়ে বেশি টাকা কোন খাতে খরচ হয়?',
          'রাতের খাবার অর্ডার ও চায়ের আড্ডা',
          'টেক গ্যাজেট ও ইন্টারনেট/সাবস্ক্রিপশন',
          'ঘড়ি, পোশাক বা শখের জিনিস',
          BN_CUSTOM
        ),
        makeQ(
          'বিকেল ৫টায় দেখা করার কথা থাকলে আমি সাধারণত কখন পৌঁছাই?',
          '৪:৫৫ মিনিটে—সময়ের আগেই হাজির',
          '৫:১৫ মিনিটে—মোটামুটি সময়ের মধ্যেই',
          'অন্য কেউ পৌঁছে মেসেজ দিলে তারপর বাসা থেকে বের হই',
          BN_CUSTOM,
          'opt_2'
        ),
        makeQ(
          'শুক্রবার বা ছুটির সন্ধ্যায় আমি কীভাবে সময় কাটাতে পছন্দ করি?',
          'নিজের ক্রিয়েটিভ বা টেক প্রজেক্ট নিয়ে কাজ করা',
          'বন্ধুদের সাথে বাইরে চা ও স্ট্রিট ফুড আড্ডা',
          'দাবা/গেম খেলা বা থ্রিলার মুভি দেখা',
          BN_CUSTOM
        ),
        makeQ(
          'একজন কাছের বন্ধুর কোন গুণটি আমার কাছে সবচেয়ে বেশি গুরুত্বপূর্ণ?',
          'সততা এবং যেকোনো পরিস্থিতিতে পাশে থাকা',
          'মন খারাপ ভালো করে দেওয়ার মতো সেন্স অব হিউমার',
          'একে অপরের স্বপ্ন ও কাজে উৎসাহ দেওয়া',
          BN_CUSTOM
        ),
      ],
    },
    {
      id: 'funny-roast',
      name: '😂 মজার রোস্ট ও রেড ফ্ল্যাগ',
      badge: 'ফানি',
      accent: '#D58BF5',
      icon: 'spark',
      defaultTitle: 'আমার সবচেয়ে মজার অভ্যাস ও রেড ফ্ল্যাগ কোনটি?',
      description: 'দেখা যাক আমার পাগলামি আর অদ্ভুত অভ্যাসগুলো তুমি কতটা জানো!',
      questions: [
        makeQ(
          'বন্ধু হিসেবে আমার সবচেয়ে বড় "রেড ফ্ল্যাগ" বা মজার দোষ কোনটি?',
          'মেসেজ সিন করে ৩ দিন পর উত্তর দেওয়া',
          'বাসায় শুয়ে থেকে বলা "এই তো ৫ মিনিটের মধ্যে পৌঁছাচ্ছি"',
          'সবাইকে দারুণ বুদ্ধি দিই কিন্তু নিজে মানি না',
          BN_CUSTOM
        ),
        makeQ(
          'আমার মন খারাপ থাকলে ১ মিনিটে খুশি করার সবচেয়ে সহজ উপায় কী?',
          'না জিজ্ঞেস করেই আমার প্রিয় খাবার নিয়ে আসা',
          'আমার নতুন কোনো আইডিয়া বা কাজের প্রশংসা করা',
          'হঠাৎ কোথাও ঘুরতে বা চা খেতে নিয়ে যাওয়া',
          BN_CUSTOM
        ),
        makeQ(
          'হঠাৎ কাল সকালে ১০০ কোটি টাকার মালিক হলে আমি সবার আগে কী করব?',
          'কাছের বন্ধুদের নিয়ে ওয়ার্ল্ড ট্যুরে হারিয়ে যাব',
          'স্বপ্নের গ্যাজেট সেটআপ ও গাড়ি কিনব',
          'টাকা থাকলেও অভ্যাসবশত দোকানে দরাদরি করব',
          BN_CUSTOM
        ),
        makeQ(
          'রাত ২:৩০ বাজে আমি সাধারণত কী কারণে জেগে থাকি?',
          'ফোনে নতুন কোনো প্রজেক্ট বা আইডিয়া নিয়ে ঘাঁটাঘাঁটি করি',
          'র‍্যান্ডম ইউটিউব ভিডিও বা রিলস স্ক্রল করি',
          'গ্রুপ চ্যাটে গভীর রাতের আড্ডা দিই',
          BN_CUSTOM
        ),
        makeQ(
          'আমি যখনই টাকা জমানোর সিদ্ধান্ত নিই, তখন ঠিক কী ঘটে?',
          'সেদিন রাতেই অনলাইনে খাবার অর্ডার করে ফেলি',
          'সত্যি সত্যিই বাজেট মেনে টাকা জমাই',
          'ডিসকাউন্ট দেখে অপ্রয়োজনীয় কিছু কিনে ফেলি',
          BN_CUSTOM
        ),
      ],
    },
    {
      id: 'siblings-cousins',
      name: '🏡 ভাই-বোন ও কাজিন স্কোয়াড',
      badge: 'ফ্যামিলি',
      accent: '#4FD1E8',
      icon: 'sun',
      defaultTitle: 'কাজিন ও ভাই-বোনদের বন্ডিং টেস্ট!',
      description: 'ঈদের আড্ডা, বিয়ের দাওয়াত এবং ছোটবেলার গোপন সব স্মৃতি।',
      questions: [
        makeQ(
          'পারিবারিক অনুষ্ঠান বা বিয়ের দাওয়াতে আমাকে সাধারণত কোথায় পাওয়া যায়?',
          'প্রিয় কাজিনদের সাথে খাবারের টেবিলের আশেপাশে',
          'এক কোণায় চুপচাপ বসে ফোনে ব্যস্ত অবস্থায়',
          'সবার ছবি তোলা এবং মজার সমালোচনা করায় ব্যস্ত',
          BN_CUSTOM
        ),
        makeQ(
          'ছোটবেলায় বাসায় সবচেয়ে বেশি কোন কারণে আমি বকা খেতাম?',
          'রাত জাগা বা সারাক্ষণ খেলাধুলায় মেতে থাকা',
          'সিরিয়াস মুহূর্তে হঠাৎ হেসে ফেলা',
          'কৌতূহলবশত বাসার ইলেকট্রনিক জিনিস খুলে ফেলা',
          BN_CUSTOM
        ),
        makeQ(
          'বাসায় হঠাৎ মেহমান আসলে আমার প্রথম কাজ কী হয়?',
          'সালাম দিয়ে ভদ্রভাবে নিজের রুমে চলে যাওয়া',
          'সবার সাথে বসে গল্প জমানো ও আপ্যায়ন করা',
          'জরুরি পড়া বা কাজের অজুহাত দেখানো',
          BN_CUSTOM
        ),
        makeQ(
          'পরিবারে আমার সবচেয়ে গোপন কথা কার কাছে সবচেয়ে নিরাপদ?',
          'আমার সবচেয়ে কাছের কাজিনের কাছে',
          'ভাই বা বোনের কাছে (যদিও আগে ব্ল্যাকমেইল করবে)',
          'কারো কাছেই না—নিজের কথা নিজের কাছেই রাখি',
          BN_CUSTOM
        ),
        makeQ(
          'ঈদের দিন বা ছুটির উৎসবে আমার সবচেয়ে প্রিয় মুহূর্ত কোনটি?',
          'রাতের বেলা কাজিনদের সাথে লং আড্ডা ও ঘোরাঘুরি',
          'সালামি তোলা এবং সারাদিন মজার খাবার খাওয়া',
          'সকালে পাঞ্জাবি/ড্রেস পরে ছবি তুলেই লম্বা ঘুম দেওয়া',
          BN_CUSTOM
        ),
      ],
    },
    {
      id: 'couples-vibe',
      name: '💖 প্রিয় মানুষ ও স্পেশাল ভাইব',
      badge: 'স্পেশাল',
      accent: '#D58BF5',
      icon: 'spark',
      defaultTitle: 'তুমি আমার মনের কথা কতটা বোঝো?',
      description: 'ভালোলাগা, ছোট ছোট যত্ন এবং অব্যক্ত কথার কুইজ।',
      questions: [
        makeQ(
          'কাউকে আমি গুরুত্ব দিই বা ভালোবাসি—তা আমি কীভাবে প্রকাশ করি?',
          'সময় দিয়ে এবং গভীর রাতের লম্বা কথোপকথনে',
          'কথার চেয়ে কাজে—তার যেকোনো সমস্যায় পাশে দাঁড়িয়ে',
          'তার বলা খুব ছোট ছোট পছন্দের কথা মনে রেখে',
          BN_CUSTOM
        ),
        makeQ(
          'প্রিয় মানুষের সাথে সময় কাটানোর জন্য আমার কাছে সেরা পরিবেশ কোনটি?',
          'নিরিবিলি রুফটপ ক্যাফে বা সন্ধ্যার শান্ত হাঁটা পথ',
          'নতুন কোনো রেস্তোরাঁয় পছন্দের খাবার ট্রাই করা',
          'বৃষ্টির দিনে ঘরে বসে মুভি দেখা ও গল্প করা',
          BN_CUSTOM
        ),
        makeQ(
          'প্রিয় কোনো মানুষের ওপর অভিমান বা রাগ হলে আমি কী করি?',
          'একদম চুপ হয়ে যাই যতক্ষণ না মন শান্ত হয়',
          'সরাসরি কথা বলে সাথে সাথে মিটিয়ে নিই',
          'হালকা ইঙ্গিত দিই এবং সে নিজে বুঝুক তা অপেক্ষা করি',
          BN_CUSTOM
        ),
        makeQ(
          'কারো কোন ছোট কাজটি আমার মন জয় করে নেয়?',
          'ব্যস্ত দিনের মাঝেও ছোট্ট করে খোঁজ নেওয়া',
          'আমাকে মনে করে কোনো গান বা মজার রিলস শেয়ার করা',
          'কোনো বিচার না করে মনোযোগ দিয়ে আমার কথা শোনা',
          BN_CUSTOM
        ),
        makeQ(
          'ভবিষ্যৎ নিয়ে আমার সবচেয়ে বড় স্বপ্ন কোনটি?',
          'নিজের পায়ে দাঁড়ানো ও সফল কিছু গড়ে তোলা',
          'প্রিয় মানুষদের নিয়ে দেশ-বিদেশ ঘুরে দেখা',
          'শান্ত ও গোছানো একটি জীবন',
          BN_CUSTOM
        ),
      ],
    },
    {
      id: 'gaming-night',
      name: '🎮 গেমিং ও রাতজাগা স্কোয়াড',
      badge: 'গেমার',
      accent: '#7C5CFA',
      icon: 'flame',
      defaultTitle: 'নাইট আউল ও গেমিং স্কোয়াড কুইজ',
      description: 'দাবা, গেমিং ম্যাচ এবং রাত ৩টার আড্ডার বন্ধুদের জন্য।',
      questions: [
        makeQ(
          'যেকোনো গেম বা দাবা খেলার সময় আমার খেলার ধরন (Playstyle) কেমন?',
          'ঠান্ডা মাথায় ৪ চাল আগে থেকে পরিকল্পনা করে খেলা',
          'শুরু থেকেই ফুল অ্যাটাকিং খেলা',
          'জেতার চেয়ে বন্ধুদের সাথে মজা করাটাই আসল',
          BN_CUSTOM
        ),
        makeQ(
          'টানটান উত্তেজনার কোনো ম্যাচে হেরে গেলে আমার প্রথম কথা কী হয়?',
          '"আরেকটা ম্যাচ হোক—হেরে শেষ করা যাবে না!"',
          'কোথায় ভুল হলো তা ঠান্ডা মাথায় বিশ্লেষণ করা',
          'নেটওয়ার্ক বা পিং-এর দোষ দিয়ে হাসাহাসি করা',
          BN_CUSTOM
        ),
        makeQ(
          'রাত জেগে কাজ বা গেম খেলার সময় আমার প্রধান সঙ্গী কী?',
          'কড়া কফি বা দুধ চা',
          'চিপস, চানাচুর বা কোল্ড ড্রিংকস',
          'শুধু পানি আর ফুল মনোযোগ',
          BN_CUSTOM
        ),
        makeQ(
          'কোন ধরনের টেক বা গ্যাজেট আমার সবচেয়ে বেশি পছন্দের?',
          'ফাস্ট ফোন বা পিসি যা কখনো হ্যাং করে না',
          'দারুণ সাউন্ডের ইয়ারবাড বা হেডফোন',
          'মিনিমালিস্ট ও গোছানো ওয়ার্কস্টেশন',
          BN_CUSTOM
        ),
        makeQ(
          'আমি সাধারণত কখন "শুভরাত্রি" বলি আর সত্যি কখন ঘুমাই?',
          'রাত ১২টায় শুভরাত্রি বলে রাত ৩টায় ঘুমাই',
          'কথা বলতে বলতেই হঠাৎ ঘুমিয়ে পড়ি',
          'যখন বলি ঠিক তখনই ঘুমিয়ে পড়ি',
          BN_CUSTOM
        ),
      ],
    },
  ],
};

export function getScoreFeedback(pct: number, lang: Lang) {
  if (lang === 'bn') {
    if (pct >= 90)
      return {
        title: 'সেরা বন্ধু (Mind-Reader)!',
        subtitle: 'আপনি তার প্রতিটি পছন্দ, অভ্যাস এবং চিন্তাভাবনা নিখুঁতভাবে জানেন!',
      };
    if (pct >= 70)
      return {
        title: 'খুব কাছের মানুষ!',
        subtitle: 'দারুণ স্কোর! মাত্র দু-একটি প্রশ্নে একটু চমক ছিল।',
      };
    if (pct >= 45)
      return {
        title: 'ভালোই চেনেন!',
        subtitle: 'অনেকগুলোই মিলেছে—বাকিগুলো নিয়ে পরের চায়ের আড্ডায় গল্প হবে!',
      };
    return {
      title: 'নতুন করে জানার সুযোগ!',
      subtitle: 'কম স্কোর মানে খারাপ বন্ধু নয়—বরং একসাথে আরও নতুন স্মৃতি তৈরির সুযোগ!',
    };
  }

  if (pct >= 90)
    return {
      title: 'Mind-Reader Status!',
      subtitle: 'You know their habits, quirks, and go-to choices inside out.',
    };
  if (pct >= 70)
    return {
      title: 'Inner Circle Certified!',
      subtitle: 'Solid connection! Only a couple of plot twists caught you off guard.',
    };
  if (pct >= 45)
    return {
      title: 'Good Vibes & Guessing!',
      subtitle: 'You nailed the big stuff—and now you have great conversation starters.',
    };
  return {
    title: 'Fresh Discovery Unlocked!',
    subtitle: 'Low scores just mean more stories to share over coffee next time!',
  };
}
