export type Lang = 'en' | 'bn';

export type GameType =
  | 'quiz'
  | 'ama'
  | 'guess_side'
  | 'two_truths'
  | 'wrapped'
  | 'blind_ranking'
  | 'would_you_rather'
  | 'daily_quest'
  | 'classic_ludo'
  | 'snake_ludo';

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
  icon: string;
  accent: string;
  defaultTitle: string;
  description: string;
  questions: QuizQuestion[];
}

export interface GameModeMeta {
  id: GameType;
  numberTag: string;
  icon: string;
  accent: string;
  route: string;
  isCreatable: boolean;
  category: 'quiz' | 'party' | 'daily';
  badge: Record<Lang, string>;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
}

export interface DailyQuestItem {
  id: string;
  taskType: 'play_any' | 'create_any' | 'score_70';
  title: Record<Lang, string>;
  description: Record<Lang, string>;
}

export interface BadgeItem {
  id: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
}

export const BRAND = {
  name: import.meta.env.VITE_APP_NAME || 'BFFquest',
  storagePrefix: 'bffquest_v4_',
  limits: {
    minQuestions: 3,
    maxQuestions: 15,
  },
  ads: {
    enabled: false,
    sponsorText: '',
    sponsorUrl: '',
  },
};

export const GAME_MODES: GameModeMeta[] = [
  {
    id: 'ama',
    numberTag: '01',
    icon: 'bubble',
    accent: '#5B9BFA',
    route: '/inbox',
    isCreatable: false,
    category: 'party',
    badge: { en: 'Anonymous Inbox', bn: 'অ্যানোনিমাস ইনবক্স' },
    title: { en: 'Ask Me Anything', bn: 'আস্ক মি এনিথিং (AMA)' },
    subtitle: {
      en: 'Receive private anonymous questions & publish replies.',
      bn: 'গোপন প্রশ্ন পান এবং নিজের পছন্দের উত্তর প্রকাশ করুন।',
    },
  },
  {
    id: 'guess_side',
    numberTag: '02',
    icon: 'sun',
    accent: '#4FD1E8',
    route: '/create?type=guess_side',
    isCreatable: true,
    category: 'party',
    badge: { en: '50/50 Dilemma', bn: '৫০/৫০ পছন্দ' },
    title: { en: 'Guess My Side', bn: 'গেস মাই সাইড' },
    subtitle: {
      en: 'Coffee or Tea? Night or Day? See who knows your vibe.',
      bn: 'কফি নাকি চা? দেখুন বন্ধুরা আপনার পছন্দ কতটা জানে।',
    },
  },
  {
    id: 'two_truths',
    numberTag: '03',
    icon: 'mask',
    accent: '#F2B84B',
    route: '/create?type=two_truths',
    isCreatable: true,
    category: 'party',
    badge: { en: 'Deception', bn: 'সত্য ও মিথ্যা' },
    title: { en: 'Two Truths & One Lie', bn: 'দুটি সত্য ও একটি মিথ্যা' },
    subtitle: {
      en: 'Write 2 facts and 1 bluff. Can friends spot the lie?',
      bn: '২টি সত্যের ভিড়ে ১টি মিথ্যা লুকিয়ে বন্ধুদের চ্যালেঞ্জ করুন।',
    },
  },
  {
    id: 'wrapped',
    numberTag: '04',
    icon: 'spark',
    accent: '#D58BF5',
    route: '/wrapped',
    isCreatable: false,
    category: 'daily',
    badge: { en: 'Recap Card', bn: 'রিক্যাপ কার্ড' },
    title: { en: 'BFFQuest Wrapped', bn: 'BFFQuest র‍্যাপড' },
    subtitle: {
      en: 'Your real play stats, best scores & shareable story card.',
      bn: 'আপনার খেলার পরিসংখ্যান ও শেয়ার করার মতো রিক্যাপ কার্ড।',
    },
  },
  {
    id: 'blind_ranking',
    numberTag: '05',
    icon: 'spark',
    accent: '#A78BFA',
    route: '/create?type=blind_ranking',
    isCreatable: true,
    category: 'party',
    badge: { en: '#1 to #5 Lock', bn: '#১ থেকে #৫ র‍্যাংক' },
    title: { en: 'Blind Ranking', bn: 'ব্লাইন্ড র‍্যাংকিং' },
    subtitle: {
      en: 'Rank 5 items from #1 to #5 without knowing what comes next!',
      bn: 'পরের আইটেমটি না দেখেই ১ থেকে ৫ নম্বর র‍্যাংক লক করুন!',
    },
  },
  {
    id: 'would_you_rather',
    numberTag: '06',
    icon: 'moon',
    accent: '#EC4899',
    route: '/create?type=would_you_rather',
    isCreatable: true,
    category: 'party',
    badge: { en: 'Live Poll %', bn: 'লাইভ পোল %' },
    title: { en: 'Would You Rather', bn: 'উড ইউ রাদার' },
    subtitle: {
      en: 'Tough choices with instant group vote percentage splits.',
      bn: 'কঠিন পরিস্থিতির পছন্দ এবং বন্ধুদের লাইভ ভোটের হার।',
    },
  },
  {
    id: 'daily_quest',
    numberTag: '07',
    icon: 'flame',
    accent: '#3FD08A',
    route: '/daily',
    isCreatable: false,
    category: 'daily',
    badge: { en: 'Daily Streak', bn: 'ডেইলি স্ট্রিক' },
    title: { en: 'Daily Quest', bn: 'ডেইলি কুয়েস্ট' },
    subtitle: {
      en: 'Complete today’s challenge to build your streak & badges.',
      bn: 'প্রতিদিনের চ্যালেঞ্জ পূরণ করে স্ট্রিক ও ব্যাজ আনলক করুন।',
    },
  },
  {
    id: 'quiz',
    numberTag: '08',
    icon: 'badge',
    accent: '#7C5CFA',
    route: '/create?type=quiz',
    isCreatable: true,
    category: 'quiz',
    badge: { en: 'Classic + Write-in', bn: 'ক্লাসিক কুইজ' },
    title: { en: 'Friendship Quiz', bn: 'ফ্রেন্ডশিপ কুইজ' },
    subtitle: {
      en: '5-question trivia with custom write-in answers & podiums.',
      bn: 'নিজের মতো উত্তর লেখার সুবিধাসহ দারুণ ফ্রেন্ডশিপ কুইজ।',
    },
  },
  {
    id: 'classic_ludo',
    numberTag: '09',
    icon: 'spark',
    accent: '#EF4444',
    route: '/games/ludo',
    isCreatable: false,
    category: 'party',
    badge: { en: 'Multiplayer', bn: 'মাল্টিপ্লেয়ার' },
    title: { en: 'Classic Ludo (2P / 4P)', bn: 'ক্লাসিক লুডু (২/৪ জন)' },
    subtitle: {
      en: 'Real-time 4-colour Ludo with room codes & live dice.',
      bn: 'রুম কোড ও লাইভ ডাইসসহ ৪ রঙের ক্লাসিক লুডু।',
    },
  },
  {
    id: 'snake_ludo',
    numberTag: '10',
    icon: 'flame',
    accent: '#10B981',
    route: '/games/snake-ludo',
    isCreatable: false,
    category: 'party',
    badge: { en: '1–100 Board', bn: '১–১০০ বোর্ড' },
    title: { en: 'Snake Ludo (Snakes & Ladders)', bn: 'সাপ-লুডু (১–১০০)' },
    subtitle: {
      en: 'Climb ladders, dodge snakes, and race to Square 100 live.',
      bn: 'মই বেয়ে উঠুন, সাপ এড়িয়ে সবার আগে ১০০ ঘরে পৌঁছান।',
    },
  },
];

export const TEMPLATES: Record<Lang, QuizTemplate[]> = {
  en: [
    {
      id: 'best-friend-vibe',
      name: 'Ultimate Bestie Check',
      badge: 'Most Popular',
      icon: 'bubble',
      accent: '#7C5CFA',
      defaultTitle: 'How Well Do You Actually Know Me?',
      description: 'Pick what matches my true vibe or write your own answer!',
      questions: [
        {
          id: 'q1',
          position: 1,
          questionText: 'What is my ultimate comfort food after a tiring week?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Hot Biryani / Kacchi' },
            { id: 'opt_2', text: 'Loaded Pizza & Fries' },
            { id: 'opt_3', text: 'Street Fuchka & Chotpoti' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'q2',
          position: 2,
          questionText: 'If we had a free weekend trip together, where would I go?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'Sea beach in Cox’s Bazar' },
            { id: 'opt_2', text: 'Quiet hills in Sajek / Sylhet' },
            { id: 'opt_3', text: 'Stay home gaming & watching movies' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'q3',
          position: 3,
          questionText: 'What is my biggest habit when texting in group chats?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Sending memes & reels at 2 AM' },
            { id: 'opt_2', text: 'Reading messages & replying 3 hours later' },
            { id: 'opt_3', text: 'Dropping voice notes instead of typing' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'q4',
          position: 4,
          questionText: 'Which superpower would I secretly pick first?',
          correctOptionId: 'opt_3',
          options: [
            { id: 'opt_1', text: 'Time travel' },
            { id: 'opt_2', text: 'Invisibility' },
            { id: 'opt_3', text: 'Instant teleportation anywhere' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'q5',
          position: 5,
          questionText: 'What do I value most in our friendship?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Unfiltered honesty & loyalty' },
            { id: 'opt_2', text: 'Chaotic adventures & inside jokes' },
            { id: 'opt_3', text: 'Showing up when times get tough' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
      ],
    },
    {
      id: 'late-night-squad',
      name: 'Late-Night Squad Trivia',
      badge: 'Squad Edition',
      icon: 'moon',
      accent: '#4FD1E8',
      defaultTitle: 'Are You Really in My Inner Circle?',
      description: 'Only true squad members score above 80% on this one.',
      questions: [
        {
          id: 'sq1',
          position: 1,
          questionText: 'What time do I usually fall asleep?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'Before 11 PM like a saint' },
            { id: 'opt_2', text: 'Around 2 AM scrolling my phone' },
            { id: 'opt_3', text: 'Sleep schedule? Never heard of it' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'sq2',
          position: 2,
          questionText: 'What is my go-to drink when we hang out?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Masala Milk Tea (Cha)' },
            { id: 'opt_2', text: 'Iced Coffee / Cold Brew' },
            { id: 'opt_3', text: 'Soft Drinks / Mocktail' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'sq3',
          position: 3,
          questionText: 'How do I react when plans get cancelled last minute?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Secretly relieved I can stay in bed' },
            { id: 'opt_2', text: 'Roast everyone in the group chat' },
            { id: 'opt_3', text: 'Make backup solo plans immediately' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
      ],
    },
    {
      id: 'campus-memories',
      name: 'Campus & Hangout Vibes',
      badge: 'Fun & Nostalgic',
      icon: 'spark',
      accent: '#D58BF5',
      defaultTitle: 'Our Hangout & Campus Memory Check',
      description: 'Test how well you remember our best hangout moments!',
      questions: [
        {
          id: 'cm1',
          position: 1,
          questionText: 'What am I always doing during a boring lecture or meeting?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Doodling or daydreaming' },
            { id: 'opt_2', text: 'Secretly texting under the desk' },
            { id: 'opt_3', text: 'Planning what we will eat after' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'cm2',
          position: 2,
          questionText: 'Who is always the most late when we plan a meetup?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'Definitely me (“I’m 5 mins away”)' },
            { id: 'opt_2', text: 'My friends while I wait first' },
            { id: 'opt_3', text: 'We all arrive 1 hour late together' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
        {
          id: 'cm3',
          position: 3,
          questionText: 'What kind of movie or show do I always recommend?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Mind-bending thriller & mystery' },
            { id: 'opt_2', text: 'Comedy & chaotic action' },
            { id: 'opt_3', text: 'Anime or sci-fi adventures' },
            { id: 'opt_4', text: 'Write your own answer...', isCustom: true },
          ],
        },
      ],
    },
  ],
  bn: [
    {
      id: 'best-friend-vibe',
      name: 'বেস্ট ফ্রেন্ড ভাইব চেক',
      badge: 'সবচেয়ে জনপ্রিয়',
      icon: 'bubble',
      accent: '#7C5CFA',
      defaultTitle: 'তুমি আমাকে আসলে কতটা ভালো চেনো?',
      description: 'সঠিক উত্তরটি বেছে নাও অথবা নিজের মতো উত্তর লিখে জানাও!',
      questions: [
        {
          id: 'q1',
          position: 1,
          questionText: 'ক্লান্তিকর একটি সপ্তাহের শেষে আমার সবচেয়ে পছন্দের খাবার কোনটি?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'গরম কাচ্চি বা বিরিয়ানি' },
            { id: 'opt_2', text: 'পিজ্জা ও ফ্রেঞ্চ ফ্রাই' },
            { id: 'opt_3', text: 'ফুচকা ও চটপটি' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'q2',
          position: 2,
          questionText: 'হঠাৎ ছুটি পেলে আমি কোথায় ঘুরতে যেতে সবচেয়ে বেশি পছন্দ করব?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'কক্সবাজার সমুদ্র সৈকত' },
            { id: 'opt_2', text: 'সাজেক বা সিলেটের নিরিবিলি পাহাড়' },
            { id: 'opt_3', text: 'বাসায় বসে মুভি দেখা ও গেম খেলা' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'q3',
          position: 3,
          questionText: 'গ্রুপ চ্যাটে মেসেজ দেওয়ার ক্ষেত্রে আমার সবচেয়ে বড় অভ্যাস কোনটি?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'রাত ২টায় মিম ও রিলস পাঠানো' },
            { id: 'opt_2', text: 'মেসেজ সিন করে ৩ ঘণ্টা পর রিপ্লাই দেওয়া' },
            { id: 'opt_3', text: 'টাইপ না করে ভয়েস নোট পাঠানো' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'q4',
          position: 4,
          questionText: 'যেকোনো একটি সুপারপাওয়ার বেছে নেওয়ার সুযোগ পেলে আমি কোনটি নেব?',
          correctOptionId: 'opt_3',
          options: [
            { id: 'opt_1', text: 'টাইম ট্রাভেল' },
            { id: 'opt_2', text: 'অদৃশ্য হয়ে যাওয়া' },
            { id: 'opt_3', text: 'মুহূর্তের মধ্যে যেকোনো জায়গায় টেলিপোর্ট করা' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'q5',
          position: 5,
          questionText: 'আমাদের বন্ধুত্বের কোন বিষয়টি আমার কাছে সবচেয়ে দামি?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'সততা ও বিশ্বাস' },
            { id: 'opt_2', text: 'পাগলামি ও ইনসাইড জোকস' },
            { id: 'opt_3', text: 'যেকোনো বিপদে পাশে থাকা' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
      ],
    },
    {
      id: 'late-night-squad',
      name: 'লেট-নাইট স্কোয়াড কুইজ',
      badge: 'স্কোয়াড স্পেশাল',
      icon: 'moon',
      accent: '#4FD1E8',
      defaultTitle: 'তুমি কি সত্যিই আমার ক্লোজ সার্কেলের বন্ধু?',
      description: 'শুধুমাত্র আসল বন্ধুরাই এখানে ৮০%-এর বেশি স্কোর করতে পারবে।',
      questions: [
        {
          id: 'sq1',
          position: 1,
          questionText: 'আমি সাধারণত রাত কয়টায় ঘুমাই?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'রাত ১১টার আগেই' },
            { id: 'opt_2', text: 'রাত ২টার দিকে ফোন স্ক্রল করতে করতে' },
            { id: 'opt_3', text: 'ঘুমের কোনো ঠিক-ঠিকানা নেই' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'sq2',
          position: 2,
          questionText: 'আড্ডায় বসলে আমার সবচেয়ে প্রিয় পানীয় কোনটি?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'দুধ চা / মাসালা চা' },
            { id: 'opt_2', text: 'কোল্ড কফি' },
            { id: 'opt_3', text: 'সফট ড্রিংকস' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'sq3',
          position: 3,
          questionText: 'শেষ মুহূর্তে ঘুরতে যাওয়ার প্ল্যান ক্যানসেল হলে আমি কী করি?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'মনে মনে খুশি হয়ে বাসায় আরাম করি' },
            { id: 'opt_2', text: 'গ্রুপ চ্যাটে সবাইকে পচাই' },
            { id: 'opt_3', text: 'নিজেই একা বের হয়ে যাই' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
      ],
    },
    {
      id: 'campus-memories',
      name: 'ক্যাম্পাস ও আড্ডা মেমোরি',
      badge: 'নস্টালজিক',
      icon: 'spark',
      accent: '#D58BF5',
      defaultTitle: 'আমাদের ক্যাম্পাস ও আড্ডার স্মৃতি পরীক্ষা',
      description: 'দেখা যাক আমাদের আড্ডার কথা তোমার কতটা মনে আছে!',
      questions: [
        {
          id: 'cm1',
          position: 1,
          questionText: 'বোরিং ক্লাস বা মিটিংয়ের সময় আমি সাধারণত কী করি?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'খাতায় আঁকাআঁকি বা অন্যমনস্ক হয়ে থাকা' },
            { id: 'opt_2', text: 'গোপনে ফোনে চ্যাট করা' },
            { id: 'opt_3', text: 'ক্লাস শেষে কী খাবো তা প্ল্যান করা' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'cm2',
          position: 2,
          questionText: 'দেখা করার প্ল্যান করলে সবসময় সবার শেষে কে আসে?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'আমি নিজেই (“এইতো ৫ মিনিটে আসছি”)' },
            { id: 'opt_2', text: 'আমার বন্ধুরা, আমিই সবার আগে অপেক্ষা করি' },
            { id: 'opt_3', text: 'সবাই মিলে ১ ঘণ্টা দেরি করে আসি' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
        {
          id: 'cm3',
          position: 3,
          questionText: 'আমি সবসময় কোন ধরনের মুভি বা সিরিজ দেখার পরামর্শ দিই?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'থ্রিলার ও রহস্য গল্প' },
            { id: 'opt_2', text: 'কমেডি ও অ্যাকশন' },
            { id: 'opt_3', text: 'অ্যানিমে বা সায়েন্স ফিকশন' },
            { id: 'opt_4', text: 'নিজের মতো উত্তর লিখুন...', isCustom: true },
          ],
        },
      ],
    },
  ],
};

export const GAME_PRESETS: Record<
  Exclude<GameType, 'quiz' | 'ama' | 'wrapped' | 'daily_quest'>,
  Record<
    Lang,
    {
      defaultTitle: string;
      description: string;
      questions: QuizQuestion[];
    }
  >
> = {
  guess_side: {
    en: {
      defaultTitle: 'Guess My Side: 50/50 Vibe Check',
      description: 'Can you guess which side I picked in these 5 dilemmas?',
      questions: [
        {
          id: 'gs1',
          position: 1,
          questionText: 'Morning Fuel: Hot Coffee vs Masala Tea?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Hot Coffee', icon: 'coffee' },
            { id: 'opt_2', text: 'Masala Tea', icon: 'tea' },
          ],
        },
        {
          id: 'gs2',
          position: 2,
          questionText: 'Peak Energy: Early Bird vs Night Owl?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'Early Bird', icon: 'sun' },
            { id: 'opt_2', text: 'Night Owl', icon: 'moon' },
          ],
        },
        {
          id: 'gs3',
          position: 3,
          questionText: 'Dream Escape: Mountain Cabin vs Ocean Beach?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Mountain Cabin', icon: 'mount' },
            { id: 'opt_2', text: 'Ocean Beach', icon: 'sun' },
          ],
        },
        {
          id: 'gs4',
          position: 4,
          questionText: 'Communication Style: Quick Text vs Voice Call?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Quick Text', icon: 'bubble' },
            { id: 'opt_2', text: 'Voice Call', icon: 'spark' },
          ],
        },
        {
          id: 'gs5',
          position: 5,
          questionText: 'Weekend Mood: Big House Party vs Cozy Solo Night?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'House Party', icon: 'flame' },
            { id: 'opt_2', text: 'Cozy Solo Night', icon: 'moon' },
          ],
        },
      ],
    },
    bn: {
      defaultTitle: 'গেস মাই সাইড: ৫০/৫০ ভাইব চেক',
      description: 'দেখুন তো এই ৫টি বিষয়ে আমি কোন দিকটি বেছে নিয়েছি!',
      questions: [
        {
          id: 'gs1',
          position: 1,
          questionText: 'সকালের শুরু: গরম কফি নাকি মাসালা চা?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'গরম কফি', icon: 'coffee' },
            { id: 'opt_2', text: 'মাসালা চা', icon: 'tea' },
          ],
        },
        {
          id: 'gs2',
          position: 2,
          questionText: 'কাজের শক্তি: ভোরের পাখি নাকি রাত জাগা পেঁচা?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'ভোরের পাখি', icon: 'sun' },
            { id: 'opt_2', text: 'রাত জাগা পেঁচা', icon: 'moon' },
          ],
        },
        {
          id: 'gs3',
          position: 3,
          questionText: 'ঘুরতে যাওয়া: পাহাড়ের চূড়া নাকি সমুদ্র সৈকত?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'পাহাড়ের চূড়া', icon: 'mount' },
            { id: 'opt_2', text: 'সমুদ্র সৈকত', icon: 'sun' },
          ],
        },
        {
          id: 'gs4',
          position: 4,
          questionText: 'যোগাযোগের ধরন: মেসেজ নাকি ভয়েস কল?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'মেসেজ চ্যাট', icon: 'bubble' },
            { id: 'opt_2', text: 'ভয়েস কল', icon: 'spark' },
          ],
        },
        {
          id: 'gs5',
          position: 5,
          questionText: 'ছুটির আমেজ: বন্ধুদের পার্টি নাকি নিরিবিলি বাসায় থাকা?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'বন্ধুদের পার্টি', icon: 'flame' },
            { id: 'opt_2', text: 'নিরিবিলি বাসা', icon: 'moon' },
          ],
        },
      ],
    },
  },
  two_truths: {
    en: {
      defaultTitle: 'Two Truths & One Lie: Can You Spot My Bluff?',
      description: 'In each round, two statements are 100% true and one is a lie!',
      questions: [
        {
          id: 'tt1',
          position: 1,
          questionText: 'Round 1: Travel & Childhood',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'I once got lost in a different city for 3 hours' },
            { id: 'opt_2', text: 'I have skydived from 10,000 feet' },
            { id: 'opt_3', text: 'I still keep my childhood best friend’s gift' },
          ],
        },
        {
          id: 'tt2',
          position: 2,
          questionText: 'Round 2: Food & Habits',
          correctOptionId: 'opt_3',
          options: [
            { id: 'opt_1', text: 'I can eat spicy food without drinking water' },
            { id: 'opt_2', text: 'I have burned instant noodles before' },
            { id: 'opt_3', text: 'I hate chocolate ice cream' },
          ],
        },
        {
          id: 'tt3',
          position: 3,
          questionText: 'Round 3: Secret Skills',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'I can speak 4 languages fluently' },
            { id: 'opt_2', text: 'I can stay awake for 24 hours straight' },
            { id: 'opt_3', text: 'I memorize song lyrics after hearing them twice' },
          ],
        },
      ],
    },
    bn: {
      defaultTitle: 'দুটি সত্য ও একটি মিথ্যা: আমার মিথ্যাটি ধরতে পারবে?',
      description: 'প্রতিটি রাউন্ডে ২টি বাক্য সত্য এবং ১টি মিথ্যা। মিথ্যাটি খুঁজে বের করো!',
      questions: [
        {
          id: 'tt1',
          position: 1,
          questionText: 'রাউন্ড ১: ভ্রমণ ও শৈশব',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'আমি একবার নতুন শহরে গিয়ে রাস্তা হারিয়ে ফেলেছিলাম' },
            { id: 'opt_2', text: 'আমি প্যারাসুটে করে আকাশ থেকে লাফ দিয়েছি' },
            { id: 'opt_3', text: 'আমার ছোটবেলার বন্ধুর দেওয়া উপহার এখনও আমার কাছে আছে' },
          ],
        },
        {
          id: 'tt2',
          position: 2,
          questionText: 'রাউন্ড ২: খাবার ও অভ্যাস',
          correctOptionId: 'opt_3',
          options: [
            { id: 'opt_1', text: 'আমি প্রচণ্ড ঝাল খাবার অনায়াসে খেতে পারি' },
            { id: 'opt_2', text: 'নুডলস রান্না করতে গিয়ে একবার পুড়িয়ে ফেলেছিলাম' },
            { id: 'opt_3', text: 'আমি চকলেট আইসক্রিম একদমই পছন্দ করি না' },
          ],
        },
        {
          id: 'tt3',
          position: 3,
          questionText: 'রাউন্ড ৩: গোপন দক্ষতা',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'আমি ৪টি ভাষায় অনর্গল কথা বলতে পারি' },
            { id: 'opt_2', text: 'আমি টানা ২৪ ঘণ্টা না ঘুমিয়ে থাকতে পারি' },
            { id: 'opt_3', text: 'যেকোনো গান দুইবার শুনলেই আমার মুখস্থ হয়ে যায়' },
          ],
        },
      ],
    },
  },
  blind_ranking: {
    en: {
      defaultTitle: 'Blind Ranking: My Top 5 Comfort Foods',
      description: 'Lock each item into Rank #1 to #5 without knowing what comes next!',
      questions: [
        {
          id: 'br1',
          position: 1,
          questionText: 'Kacchi Biryani',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br2',
          position: 2,
          questionText: 'Crispy Chicken Burger',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br3',
          position: 3,
          questionText: 'Street Fuchka Platter',
          correctOptionId: 'opt_3',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br4',
          position: 4,
          questionText: 'wood-Fired Pepperoni Pizza',
          correctOptionId: 'opt_4',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br5',
          position: 5,
          questionText: 'Chocolate Brownie with Ice Cream',
          correctOptionId: 'opt_5',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
      ],
    },
    bn: {
      defaultTitle: 'ব্লাইন্ড র‍্যাংকিং: আমার টপ ৫ প্রিয় খাবার',
      description: 'পরের খাবারটি কী আসবে তা না জেনেই #১ থেকে #৫ র‍্যাংক লক করো!',
      questions: [
        {
          id: 'br1',
          position: 1,
          questionText: 'কাচ্চি বিরিয়ানি',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br2',
          position: 2,
          questionText: 'ক্রিস্পি চিকেন বার্গার',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br3',
          position: 3,
          questionText: 'ঝাল ফুচকা ও চটপটি',
          correctOptionId: 'opt_3',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br4',
          position: 4,
          questionText: 'চিজ পিজ্জা',
          correctOptionId: 'opt_4',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
        {
          id: 'br5',
          position: 5,
          questionText: 'চকলেট ব্রাউনি ও আইসক্রিম',
          correctOptionId: 'opt_5',
          options: [
            { id: 'opt_1', text: 'Rank #1' },
            { id: 'opt_2', text: 'Rank #2' },
            { id: 'opt_3', text: 'Rank #3' },
            { id: 'opt_4', text: 'Rank #4' },
            { id: 'opt_5', text: 'Rank #5' },
          ],
        },
      ],
    },
  },
  would_you_rather: {
    en: {
      defaultTitle: 'Would You Rather: Impossible Squad Edition',
      description: 'Pick one scenario in each round and see the live group vote split!',
      questions: [
        {
          id: 'wyr1',
          position: 1,
          questionText: 'Would you rather...',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Have unlimited free flight tickets forever', icon: 'sun' },
            { id: 'opt_2', text: 'Eat for free at every restaurant forever', icon: 'coffee' },
          ],
        },
        {
          id: 'wyr2',
          position: 2,
          questionText: 'Would you rather...',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: 'Give up social media for 1 year', icon: 'bubble' },
            { id: 'opt_2', text: 'Give up watching movies & series for 1 year', icon: 'spark' },
          ],
        },
        {
          id: 'wyr3',
          position: 3,
          questionText: 'Would you rather...',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'Always know when someone is lying to you', icon: 'mask' },
            { id: 'opt_2', text: 'Get away with any lie you ever tell', icon: 'flame' },
          ],
        },
      ],
    },
    bn: {
      defaultTitle: 'উড ইউ রাদার: কঠিন পছন্দের চ্যালেঞ্জ',
      description: 'যেকোনো একটি বেছে নাও এবং দেখো কত শতাংশ বন্ধু তোমার সাথে একমত!',
      questions: [
        {
          id: 'wyr1',
          position: 1,
          questionText: 'তুমি কোনটি বেছে নেবে?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'আজীবন ফ্রি বিমানের টিকিট', icon: 'sun' },
            { id: 'opt_2', text: 'আজীবন যেকোনো রেস্তোরাঁয় ফ্রি খাবার', icon: 'coffee' },
          ],
        },
        {
          id: 'wyr2',
          position: 2,
          questionText: 'তুমি কোনটি বেছে নেবে?',
          correctOptionId: 'opt_2',
          options: [
            { id: 'opt_1', text: '১ বছর সোশ্যাল মিডিয়া ছাড়া থাকা', icon: 'bubble' },
            { id: 'opt_2', text: '১ বছর কোনো মুভি বা সিরিজ না দেখা', icon: 'spark' },
          ],
        },
        {
          id: 'wyr3',
          position: 3,
          questionText: 'তুমি কোনটি বেছে নেবে?',
          correctOptionId: 'opt_1',
          options: [
            { id: 'opt_1', text: 'কেউ মিথ্যা বললেই সাথে সাথে ধরে ফেলার ক্ষমতা', icon: 'mask' },
            { id: 'opt_2', text: 'নিজের বলা যেকোনো মিথ্যা সত্যি হিসেবে চালিয়ে দেওয়া', icon: 'flame' },
          ],
        },
      ],
    },
  },
  classic_ludo: {
    en: {
      defaultTitle: 'Classic Ludo Match',
      description: 'Real-time 2P & 4P Classic Ludo',
      questions: [],
    },
    bn: {
      defaultTitle: 'ক্লাসিক লুডু ম্যাচ',
      description: 'রিয়েল-টাইম ২ ও ৪ জনের ক্লাসিক লুডু',
      questions: [],
    },
  },
  snake_ludo: {
    en: {
      defaultTitle: 'Snake Ludo Match',
      description: 'Real-time 1–100 Snake Ludo',
      questions: [],
    },
    bn: {
      defaultTitle: 'সাপ-লুডু ম্যাচ',
      description: 'রিয়েল-টাইম ১–১০০ সাপ-লুডু',
      questions: [],
    },
  },
};

export const DAILY_QUESTS: DailyQuestItem[] = [
  {
    id: 'dq_play_1',
    taskType: 'play_any',
    title: {
      en: 'Play Any Friendship Game Today',
      bn: 'আজ যেকোনো একটি ফ্রেন্ডশিপ গেম খেলুন',
    },
    description: {
      en: 'Complete 1 quiz or party mode to keep your daily flame alive.',
      bn: 'আপনার স্ট্রিক ধরে রাখতে আজ অন্তত ১টি গেম সম্পন্ন করুন।',
    },
  },
  {
    id: 'dq_create_1',
    taskType: 'create_any',
    title: {
      en: 'Create & Share a New Game Link',
      bn: 'নতুন একটি গেম তৈরি করে বন্ধুদের শেয়ার করুন',
    },
    description: {
      en: 'Launch a Quiz, Guess My Side, or Blind Ranking for your squad.',
      bn: 'বন্ধুদের জন্য নতুন একটি কুইজ বা পার্টি গেম তৈরি করুন।',
    },
  },
  {
    id: 'dq_score_70',
    taskType: 'score_70',
    title: {
      en: 'Score 70% or Higher on Any Game',
      bn: 'যেকোনো গেমে ৭০% বা তার বেশি স্কোর করুন',
    },
    description: {
      en: 'Prove your bestie intuition by hitting at least 70% accuracy.',
      bn: 'বন্ধুত্বের পরীক্ষায় অন্তত ৭০% সঠিক উত্তর দিয়ে চ্যালেঞ্জ জিতুন।',
    },
  },
];

export const BADGES: BadgeItem[] = [
  {
    id: 'first_play',
    title: { en: 'First Spark', bn: 'প্রথম চ্যালেঞ্জ' },
    desc: { en: 'Completed your first game', bn: 'প্রথমবার কোনো গেম সম্পন্ন করেছেন' },
  },
  {
    id: 'creator_star',
    title: { en: 'Game Master', bn: 'গেম মাস্টার' },
    desc: { en: 'Published a custom game', bn: 'নিজের একটি গেম পাবলিশ করেছেন' },
  },
  {
    id: 'mind_reader',
    title: { en: 'Mind Reader', bn: 'মাইন্ড রিডার' },
    desc: { en: 'Scored 80%+ on a friend’s game', bn: '৮০% বা তার বেশি স্কোর করেছেন' },
  },
  {
    id: 'streak_3',
    title: { en: 'On Fire (3d)', bn: 'টানা ৩ দিনের স্ট্রিক' },
    desc: { en: 'Reached a 3-day Daily Quest streak', bn: 'টানা ৩ দিন ডেইলি কুয়েস্ট সম্পন্ন করেছেন' },
  },
];

export const COPY = {
  en: {
    demoBanner: '',
    tagline: 'Friendship quiz games',
    heroTitle1: 'Better Friends.',
    heroTitle2: 'Bigger Moments.',
    heroSub:
      'Create fun quizzes, challenge your friends, and discover how well they really know you.',
    createBtn: 'Create a Quiz',
    exploreBtn: 'Explore Games',
    sampleBtn: 'Try Sample Quiz ›',
    navHome: 'Home',
    navExplore: 'Explore',
    navCreate: 'Create',
    navInbox: 'Inbox',
    navProfile: 'Profile',
    navGuides: 'Guides',
    qaCreateTitle: 'Create a Game',
    qaCreateSub: 'Launch in 30 seconds',
    qaPlayTitle: 'Explore Modes',
    qaPlaySub: '10 interactive games',
    qaShareTitle: 'BFFQuest Wrapped',
    qaShareSub: 'View your recap card',
    howItWorksTitle: 'How BFFquest Works',
    step1Title: 'Pick a Mode & Customize',
    step1Desc: 'Choose from our interactive game modes or load a ready-made template.',
    step2Title: 'Share Your Link',
    step2Desc: 'Send your direct link on WhatsApp, Instagram, or Messenger.',
    step3Title: 'See the Leaderboard',
    step3Desc: 'Watch friends climb the podium and read their custom write-in answers.',
    featuredTemplatesTitle: 'Quick-Start Quiz Templates',
    useTemplateBtn: 'Use This Template ›',
    exploreGamesTitle: 'Interactive Game Modes',
    seeAllGamesBtn: 'See All Modes ›',
    builderHeading: 'Create Your Interactive Game',
    builderSub: 'Pick a game mode below, customize your prompts, and share the link!',
    loadTemplateLabel: 'Quick-Load a Ready Template:',
    templateLoadedMsg: 'Template loaded! You can edit any question below.',
    yourNameLabel: 'Your Display Name *',
    yourNamePlaceholder: 'e.g., Alex',
    quizTitleLabel: 'Game Title *',
    quizDescLabel: 'Short Subtitle / Instructions',
    questionLabel: 'Question',
    addQuestionBtn: 'Add Another Round',
    publishBtn: 'Publish & Get Share Link',
    publishingBtn: 'Publishing...',
    writeOwnLabel: 'Write Your Own Answer',
    writeOwnPlaceholder: 'Type your custom answer here...',
    customSlotHint: 'Option 4 lets players type their own custom answer.',
    publishedBadge: 'Live & Ready',
    publishedHeading: 'Your Game Link is Live!',
    publishedSub: 'Share this link with friends to see their scores on your leaderboard.',
    directLinkLabel: 'Direct Share Link',
    copyLinkBtn: 'Copy Link',
    copiedBtn: 'Copied!',
    copyManualHint: 'Link selected! Press Ctrl+C (or long-press) to copy.',
    whatsappShareBtn: 'Share on WhatsApp',
    shareNativeBtn: 'More Share Options',
    openQuizBtn: 'Open Game',
    invitedBy: 'Created by',
    questionsCount: 'rounds',
    noAccountNeeded: 'Instant play • No login required',
    startQuizBtn: 'Start Playing Now',
    nicknameLabel: 'Your Name or Nickname *',
    nicknamePlaceholder: 'Enter your name so your friend knows it’s you...',
    backBtn: '‹ Back',
    nextBtn: 'Next ›',
    finishBtn: 'Submit & See Results',
    scoreRevealBadge: 'Official Result',
    shareScoreBtn: 'Copy Game Link',
    downloadCardBtn: 'Download Score Card',
    challengeBackTitle: 'Now Challenge Your Friends Back!',
    challengeBackSub: 'Create your own quiz or game in 30 seconds and see who knows you best.',
    customAnswersTitle: 'Custom Write-In Answers Submitted',
    leaderboardTitle: 'Friend Leaderboard',
    leaderboardSub: 'Ranked by accuracy and submission time',
    leaderboardEmpty: 'No one has played yet. Be the first on the podium!',
    participantsCount: 'played',
    dashboardTitle: 'My Created Games & Scores',
    dashboardSub: 'Manage your links, pause/resume games, and check friend results.',
    totalQuizzes: 'Created Games',
    totalSubmissions: 'Friend Plays',
    avgScore: 'Average Match',
    noQuizzesYet: 'You haven’t created any games yet. Launch your first one in seconds!',
    pauseBtn: 'Pause',
    activateBtn: 'Activate',
    deleteBtn: 'Delete',
    confirmDeleteQuiz: 'Are you sure you want to permanently delete this game and its scores?',
    recentSubmissions: 'Recent Friend Scores:',
    adminTitle: 'Site Owner Moderation Panel',
    reportTitle: 'Report Abuse or Inappropriate Content',
    reportSub: 'Help us keep BFFquest safe and welcoming for everyone.',
    reportSlugLabel: 'Game Link or Slug (Optional)',
    reportReasonLabel: 'Reason for Report *',
    reportDetailsLabel: 'Details *',
    reportSubmitBtn: 'Submit Report',
    reportSuccess: 'Thank you. Your report has been submitted for moderation review.',
    footerNote: 'Playful friendship games for friends.',
  },
  bn: {
    demoBanner: '',
    tagline: 'ফ্রেন্ডশিপ কুইজ ও পার্টি গেমস',
    heroTitle1: 'প্রিয় বন্ধু।',
    heroTitle2: 'সেরা মুহূর্ত।',
    heroSub:
      'মজার কুইজ তৈরি করুন, বন্ধুদের চ্যালেঞ্জ দিন এবং দেখুন তারা আপনাকে আসলে কতটা চেনে।',
    createBtn: 'কুইজ তৈরি করুন',
    exploreBtn: 'সব গেম দেখুন',
    sampleBtn: 'স্যাম্পল কুইজ খেলুন ›',
    navHome: 'হোম',
    navExplore: 'গেমস',
    navCreate: 'তৈরি করুন',
    navInbox: 'ইনবক্স',
    navProfile: 'প্রোফাইল',
    navGuides: 'গাইড',
    qaCreateTitle: 'গেম তৈরি করুন',
    qaCreateSub: 'মাত্র ৩০ সেকেন্ডে',
    qaPlayTitle: 'সব গেম মোড',
    qaPlaySub: '১০টি ইন্টারঅ্যাক্টিভ গেম',
    qaShareTitle: 'BFFQuest র‍্যাপড',
    qaShareSub: 'আপনার রিক্যাপ কার্ড',
    howItWorksTitle: 'BFFquest কীভাবে কাজ করে',
    step1Title: 'মোড ও প্রশ্ন সাজান',
    step1Desc: 'আমাদের ইন্টারঅ্যাক্টিভ গেম মোড বা রেডি টেমপ্লেট থেকে যেকোনো একটি বেছে নিন।',
    step2Title: 'লিংক শেয়ার করুন',
    step2Desc: 'হোয়াটসঅ্যাপ, মেসেঞ্জার বা ইনস্টাগ্রামে বন্ধুদের কাছে লিংক পাঠান।',
    step3Title: 'লিডারবোর্ড দেখুন',
    step3Desc: 'কে কত স্কোর করল এবং কে কী কাস্টম উত্তর লিখল তা সাথে সাথে দেখুন।',
    featuredTemplatesTitle: 'রেডিমেড কুইজ টেমপ্লেট',
    useTemplateBtn: 'এই টেমপ্লেট নিন ›',
    exploreGamesTitle: 'ইন্টারঅ্যাক্টিভ গেম মোডসমূহ',
    seeAllGamesBtn: 'সবগুলো দেখুন ›',
    builderHeading: 'আপনার গেম তৈরি করুন',
    builderSub: 'যেকোনো একটি মোড বেছে প্রশ্নগুলো নিজের মতো সাজিয়ে নিন!',
    loadTemplateLabel: 'রেডি টেমপ্লেট লোড করুন:',
    templateLoadedMsg: 'টেমপ্লেট লোড হয়েছে! নিচে যেকোনো প্রশ্ন পরিবর্তন করতে পারেন।',
    yourNameLabel: 'আপনার নাম *',
    yourNamePlaceholder: 'যেমন: রাফি',
    quizTitleLabel: 'গেমের শিরোনাম *',
    quizDescLabel: 'সংক্ষিপ্ত বিবরণ',
    questionLabel: 'প্রশ্ন',
    addQuestionBtn: 'আরেকটি রাউন্ড যোগ করুন',
    publishBtn: 'পাবলিশ করুন ও লিংক নিন',
    publishingBtn: 'পাবলিশ হচ্ছে...',
    writeOwnLabel: 'নিজের মতো উত্তর লিখুন',
    writeOwnPlaceholder: 'এখানে আপনার উত্তরটি লিখুন...',
    customSlotHint: '৪ নম্বর অপশনটিতে বন্ধুরা নিজেদের ইচ্ছেমতো উত্তর লিখে পাঠাতে পারবে।',
    publishedBadge: 'লাইভ ও প্রস্তুত',
    publishedHeading: 'আপনার গেম লিংক তৈরি হয়ে গেছে!',
    publishedSub: 'লিংকটি বন্ধুদের সাথে শেয়ার করুন এবং লিডারবোর্ডে তাদের স্কোর দেখুন।',
    directLinkLabel: 'সরাসরি শেয়ার লিংক',
    copyLinkBtn: 'লিংক কপি করুন',
    copiedBtn: 'কপি হয়েছে!',
    copyManualHint: 'লিংক সিলেক্ট হয়েছে! কপি করতে Ctrl+C (বা লং-প্রেস) করুন।',
    whatsappShareBtn: 'হোয়াটসঅ্যাপে শেয়ার',
    shareNativeBtn: 'অন্যান্য শেয়ার অপশন',
    openQuizBtn: 'গেমটি খুলুন',
    invitedBy: 'তৈরি করেছেন',
    questionsCount: 'টি রাউন্ড',
    noAccountNeeded: 'লগইন ছাড়াই সাথে সাথে খেলুন',
    startQuizBtn: 'খেলা শুরু করুন',
    nicknameLabel: 'আপনার নাম বা ডাকনাম *',
    nicknamePlaceholder: 'আপনার নাম লিখুন যাতে আপনার বন্ধু চিনতে পারে...',
    backBtn: '‹ পেছনে',
    nextBtn: 'পরবর্তী ›',
    finishBtn: 'সাবমিট করুন ও ফলাফল দেখুন',
    scoreRevealBadge: 'অফিসিয়াল ফলাফল',
    shareScoreBtn: 'গেম লিংক কপি করুন',
    downloadCardBtn: 'স্কোর কার্ড ডাউনলোড',
    challengeBackTitle: 'এবার আপনার বন্ধুদের পাল্টা চ্যালেঞ্জ দিন!',
    challengeBackSub: 'মাত্র ৩০ সেকেন্ডে নিজের কুইজ তৈরি করে দেখুন কে আপনাকে সবচেয়ে ভালো চেনে।',
    customAnswersTitle: 'বন্ধুদের লেখা কাস্টম উত্তরসমূহ',
    leaderboardTitle: 'ফ্রেন্ড লিডারবোর্ড',
    leaderboardSub: 'সর্বোচ্চ স্কোর অনুযায়ী র‍্যাংকিং',
    leaderboardEmpty: 'এখনও কেউ খেলেনি। সবার আগে খেলে ১ নম্বর স্থানটি দখল করুন!',
    participantsCount: 'জন খেলেছে',
    dashboardTitle: 'আমার তৈরি গেম ও স্কোরসমূহ',
    dashboardSub: 'আপনার গেমগুলোর লিংক কপি করুন এবং বন্ধুদের স্কোর দেখুন।',
    totalQuizzes: 'তৈরি গেম',
    totalSubmissions: 'মোট খেলা হয়েছে',
    avgScore: 'গড় স্কোর',
    noQuizzesYet: 'আপনি এখনও কোনো গেম তৈরি করেননি। এখনই প্রথমটি তৈরি করুন!',
    pauseBtn: 'পজ করুন',
    activateBtn: 'চালু করুন',
    deleteBtn: 'ডিলিট',
    confirmDeleteQuiz: 'আপনি কি নিশ্চিতভাবে এই গেমটি মুছে ফেলতে চান?',
    recentSubmissions: 'সাম্প্রতিক স্কোরসমূহ:',
    adminTitle: 'অ্যাডমিন মডারেশন প্যানেল',
    reportTitle: 'অভিযোগ বা রিপোর্ট জানান',
    reportSub: 'BFFquest সবার জন্য নিরাপদ রাখতে আমাদের সাহায্য করুন।',
    reportSlugLabel: 'গেম লিংক বা স্লাগ (ঐচ্ছিক)',
    reportReasonLabel: 'রিপোর্টের কারণ *',
    reportDetailsLabel: 'বিস্তারিত বিবরণ *',
    reportSubmitBtn: 'রিপোর্ট জমা দিন',
    reportSuccess: 'ধন্যবাদ। আপনার রিপোর্টটি রিভিউয়ের জন্য জমা হয়েছে।',
    footerNote: 'বন্ধুদের জন্য মজার ফ্রেন্ডশিপ গেমস।',
  },
};

export function getScoreFeedback(
  pct: number,
  lang: Lang
): { title: string; subtitle: string } {
  if (lang === 'bn') {
    if (pct >= 85) {
      return {
        title: '🔥 টেলিপ্যাথিক বেস্ট ফ্রেন্ড!',
        subtitle: 'তুমি তো আমার মনের সব খবর একদম নিখুঁতভাবে জানো!',
      };
    }
    if (pct >= 60) {
      return {
        title: '✨ দারুণ বন্ধুত্ব!',
        subtitle: 'আমাদের ভাইব বেশ দারুণ মেলে, আরও একটু হলেই ১০০ হতো!',
      };
    }
    return {
      title: '😄 আরও আড্ডা দেওয়া দরকার!',
      subtitle: 'দেখা যাচ্ছে আমাদের আরও বেশি সময় কাটানো উচিত!',
    };
  }

  if (pct >= 85) {
    return {
      title: '🔥 Telepathic Bestie Status!',
      subtitle: 'You practically read my mind on every single round.',
    };
  }
  if (pct >= 60) {
    return {
      title: '✨ Solid Inner-Circle Vibe!',
      subtitle: 'You know me really well—just a couple of surprises left.',
    };
  }
  return {
    title: '😄 Time for More Hangouts!',
    subtitle: 'We definitely need more late-night chats and coffee runs.',
  };
}
