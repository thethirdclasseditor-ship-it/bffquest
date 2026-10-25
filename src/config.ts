export type Language = 'en' | 'bn';
export type QuizStatus = 'draft' | 'published' | 'disabled';

const env = (import.meta as any).env || {};

// ============================================================================
// 1. BRAND CONFIGURATION (নাম বদলাতে চাইলে শুধু name: 'Bondly' পরিবর্তন করুন)
// ============================================================================
export const BRAND = {
  name: env.VITE_APP_NAME || 'Bondly',
  storagePrefix: 'bondly_v2_',
  supabaseUrl: env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || '',
  enableAds: env.VITE_ENABLE_ADS === 'true',
  contactEmail: env.VITE_CONTACT_EMAIL || '[CONFIG_REQUIRED: support@yourdomain.com]',
  legalEntity: env.VITE_LEGAL_ENTITY || '[CONFIG_REQUIRED: Legal Entity Name]',
  limits: {
    minQuestions: 5,
    maxQuestions: 15,
    maxTitleLength: 120,
    maxQuestionLength: 220,
    maxOptionLength: 90,
  },
};

// ============================================================================
// 2. BILINGUAL UI DICTIONARY (English & বাংলা)
// ============================================================================
export const UI_TEXT = {
  en: {
    navGuides: 'Guides',
    navDashboard: 'Dashboard',
    navCreate: 'Create Quiz',
    demoBanner: 'Local Demo Mode: Connect Supabase in settings for live cloud storage.',
    heroBadge: 'No Account Required for Friends to Play',
    heroTitle1: 'Discover Who Knows You Best with',
    heroSubtitle:
      'Create a minimalist, personal friendship quiz in 60 seconds. Share your unique link in any chat and see who truly knows your habits, memories, and vibe.',
    btnCreateQuiz: 'Create Your Quiz',
    btnSampleQuiz: 'Try Sample Quiz',
    sampleCardBadge: 'Live Preview • Question 1 of 5',
    howItWorksTitle: 'Designed for Effortless Sharing',
    step1Title: '1. Pick Questions',
    step1Desc: 'Start with curated English or Bangla templates, or write your own custom questions.',
    step2Title: '2. Share Your Link',
    step2Desc: 'Send your private link on WhatsApp, Messenger, or Instagram. Friends play instantly.',
    step3Title: '3. Compare Scores',
    step3Desc: 'Answers stay locked on the server. Friends get a downloadable score card and you see all results.',
    modesTitle: 'Friendship Game Modes',
    modeMvpBadge: 'Active Mode',
    modePlannedBadge: 'Coming Soon',
    mode1Title: 'Who Knows Me Best?',
    mode1Desc: 'Lock in your true preferences and habits. Friends predict what you chose and get scored.',
    mode2Title: 'Friendship Compatibility',
    mode2Desc: 'Two friends answer the same questions independently to discover shared vibes.',
    mode3Title: 'Positive Friendship Awards',
    mode3Desc: 'Appreciation badges like Best Listener and Most Reliable—zero negativity.',
    createPageTitle: 'Build Your Friendship Quiz',
    createPageSub: 'Choose a template below or customize every question. Select the radio dot next to your true answer.',
    loadTemplateLabel: 'Quick-Load Editable Template:',
    labelCreatorName: 'Your Display Name *',
    placeholderCreatorName: 'e.g., Ahad',
    labelQuizTitle: 'Quiz Title *',
    labelQuizDesc: 'Short Welcome Note for Friends (Optional)',
    labelQuestionPrompt: 'Question Prompt *',
    labelSelectCorrect: 'Answer Options (Tap the circle next to your true answer) *',
    btnAddQuestion: '+ Add Question',
    btnPublishQuiz: 'Publish & Generate Link',
    btnPublishing: 'Publishing...',
    publishedBadge: 'Quiz Published',
    publishedTitle: 'Your Quiz Link is Live!',
    publishedSub: 'Share this link with friends. They can play immediately without creating an account.',
    btnCopyLink: 'Copy Quiz Link',
    btnCopied: 'Copied!',
    btnShareNative: 'Share with Friends',
    btnOpenQuiz: 'Open Quiz Page',
    invitedBy: 'Created by',
    questionsCount: 'Questions',
    estTime: '~2 min read & play',
    btnStartQuiz: 'Start Quiz Now',
    labelNickname: 'Your Name or Nickname (So your friend knows who played)',
    placeholderNickname: 'e.g., Rafi (Optional)',
    btnBack: 'Back',
    btnNext: 'Next Question',
    btnFinish: 'Submit & Reveal Score',
    scoreRevealBadge: 'Official Score Card',
    btnShareScore: 'Share My Score',
    btnDownloadCard: 'Download Score Card (PNG)',
    challengeBackTitle: 'Now Turn the Tables!',
    challengeBackSub: 'Create your own quiz in 60 seconds and see if your friends can beat your score.',
    dashSignInTitle: 'Creator Access',
    dashSignInSub: 'Enter your name and email to manage your quizzes and view friend submissions.',
    btnContinue: 'Continue to Dashboard',
    btnSignOut: 'Sign Out',
    statQuizzes: 'My Quizzes',
    statSubmissions: 'Friend Submissions',
    statAvgScore: 'Average Score',
    footerTagline: 'Minimalist, privacy-first friendship games & social quizzes.',
    footerDisclaimer: 'Scores are playful social games, not psychological assessments.',
  },
  bn: {
    navGuides: 'গাইড',
    navDashboard: 'ড্যাশবোর্ড',
    navCreate: 'কুইজ বানান',
    demoBanner: 'লোকাল ডেমো মোড চালু আছে: ক্লাউড ডাটাবেসের জন্য Supabase যুক্ত করুন।',
    heroBadge: 'বন্ধুদের খেলার জন্য কোনো অ্যাকাউন্ট লাগবে না',
    heroTitle1: 'কে আপনাকে সবচেয়ে ভালো চেনে জানুন',
    heroSubtitle:
      'মাত্র ৬০ সেকেন্ডে আপনার পছন্দ, অভ্যাস ও স্মৃতি নিয়ে নিজের কুইজ তৈরি করুন। হোয়াটসঅ্যাপ বা মেসেঞ্জারে লিংক শেয়ার করে দেখুন কে কত স্কোর করে!',
    btnCreateQuiz: 'নিজের কুইজ তৈরি করুন',
    btnSampleQuiz: 'ডেমো কুইজ খেলুন',
    sampleCardBadge: 'লাইভ প্রিভিউ • প্রশ্ন ১ / ৫',
    howItWorksTitle: 'কীভাবে কাজ করে?',
    step1Title: '১. প্রশ্ন বাছাই করুন',
    step1Desc: 'রেডিমেড বাংলা বা ইংরেজি টেমপ্লেট বেছে নিন অথবা নিজের মতো প্রশ্ন সাজান।',
    step2Title: '২. লিংক শেয়ার করুন',
    step2Desc: 'আপনার কুইজ লিংকটি বন্ধুদের গ্রুপে পাঠান। কোনো লগইন ছাড়াই তারা উত্তর দিতে পারবে।',
    step3Title: '৩. ফলাফল দেখুন',
    step3Desc: 'সঠিক উত্তর সার্ভারে সুরক্ষিত থাকে। বন্ধুরা সাথে সাথে স্কোর কার্ড পাবে এবং আপনি ড্যাশবোর্ডে সব ফলাফল দেখবেন।',
    modesTitle: 'ফ্রেন্ডশিপ গেম মোডসমূহ',
    modeMvpBadge: 'চালু আছে',
    modePlannedBadge: 'শীঘ্রই আসছে',
    mode1Title: 'কে আমাকে সবচেয়ে ভালো চেনে?',
    mode1Desc: 'আপনার নিজের পছন্দ ও অভ্যাসের সঠিক উত্তর লক করুন, বন্ধুরা অনুমান করে স্কোর করবে।',
    mode2Title: 'ফ্রেন্ডশিপ কমপ্যাটিবিলিটি',
    mode2Desc: 'দুই বন্ধু আলাদাভাবে একই প্রশ্নের উত্তর দিয়ে নিজেদের মিল খুঁজে বের করার মোড।',
    mode3Title: 'পজিটিভ ফ্রেন্ডশিপ অ্যাওয়ার্ডস',
    mode3Desc: 'সেরা শ্রোতা বা সবচেয়ে নির্ভরযোগ্য বন্ধুর জন্য পজিটিভ অ্যাওয়ার্ড ব্যাজ।',
    createPageTitle: 'আপনার ফ্রেন্ডশিপ কুইজ তৈরি করুন',
    createPageSub: 'নিচের যেকোনো টেমপ্লেট বেছে নিন অথবা প্রশ্নগুলো নিজের মতো লিখে সঠিক উত্তরের পাশে টিক দিন।',
    loadTemplateLabel: 'রেডিমেড টেমপ্লেট বেছে নিন (এডিট করা যাবে):',
    labelCreatorName: 'আপনার নাম *',
    placeholderCreatorName: 'যেমন: আহাদ',
    labelQuizTitle: 'কুইজের শিরোনাম *',
    labelQuizDesc: 'বন্ধুদের জন্য ছোট বার্তা (ঐচ্ছিক)',
    labelQuestionPrompt: 'প্রশ্ন *',
    labelSelectCorrect: 'অপশনসমূহ (আপনার সঠিক উত্তরের পাশের গোল বাটনে ট্যাপ করুন) *',
    btnAddQuestion: '+ নতুন প্রশ্ন যোগ করুন',
    btnPublishQuiz: 'পাবলিশ করুন ও লিংক নিন',
    btnPublishing: 'পাবলিশ হচ্ছে...',
    publishedBadge: 'কুইজ পাবলিশ হয়েছে',
    publishedTitle: 'আপনার কুইজ লিংক তৈরি!',
    publishedSub: 'এই লিংকটি বন্ধুদের পাঠান। তারা কোনো অ্যাকাউন্ট খোলা ছাড়াই সাথে সাথে খেলতে পারবে।',
    btnCopyLink: 'লিংক কপি করুন',
    btnCopied: 'কপি হয়েছে!',
    btnShareNative: 'বন্ধুদের শেয়ার করুন',
    btnOpenQuiz: 'কুইজ পেজ খুলুন',
    invitedBy: 'তৈরি করেছেন:',
    questionsCount: 'টি প্রশ্ন',
    estTime: '~২ মিনিট লাগবে',
    btnStartQuiz: 'কুইজ শুরু করুন',
    labelNickname: 'আপনার নাম বা ডাকনাম (যাতে আপনার বন্ধু চিনতে পারে)',
    placeholderNickname: 'যেমন: রাফি (ঐচ্ছিক)',
    btnBack: 'পেছনে',
    btnNext: 'পরবর্তী প্রশ্ন',
    btnFinish: 'সাবমিট করুন ও স্কোর দেখুন',
    scoreRevealBadge: 'অফিসিয়াল স্কোর কার্ড',
    btnShareScore: 'স্কোর শেয়ার করুন',
    btnDownloadCard: 'স্কোর কার্ড ডাউনলোড (PNG)',
    challengeBackTitle: 'এবার আপনার পালা!',
    challengeBackSub: 'মাত্র ৬০ সেকেন্ডে নিজের কুইজ বানিয়ে বন্ধুদের পাল্টা চ্যালেঞ্জ দিন।',
    dashSignInTitle: 'ক্রিয়েটর ড্যাশবোর্ড লগইন',
    dashSignInSub: 'আপনার কুইজ ও বন্ধুদের স্কোর দেখতে নাম এবং ইমেইল দিন।',
    btnContinue: 'ড্যাশবোর্ডে প্রবেশ করুন',
    btnSignOut: 'লগআউট',
    statQuizzes: 'আমার কুইজ',
    statSubmissions: 'মোট অংশগ্রহণ',
    statAvgScore: 'গড় স্কোর',
    footerTagline: 'বন্ধুত্বের ইতিবাচক ও প্রাইভেসি-ফার্স্ট সোশ্যাল কুইজ প্ল্যাটফর্ম।',
    footerDisclaimer: 'এই স্কোরগুলো কেবলই মজার খেলা, বন্ধুত্বের মনোস্তাত্ত্বিক মাপকাঠি নয়।',
  },
};

// ============================================================================
// 3. BILINGUAL EDITABLE QUIZ TEMPLATES
// ============================================================================
export interface QuizOption {
  id: string;
  text: string;
}

export interface CreatorQuestion {
  id: string;
  position: number;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
}

export const TEMPLATES_BY_LANG: Record<
  Language,
  {
    id: string;
    name: string;
    defaultTitle: string;
    description: string;
    questions: Omit<CreatorQuestion, 'id' | 'position'>[];
  }[]
> = {
  en: [
    {
      id: 'best-friends',
      name: 'Best Friends Classic',
      defaultTitle: 'How Well Do You Actually Know Me?',
      description: 'Everyday habits, comfort food, and how I react in classic situations.',
      questions: [
        {
          questionText: 'What is my ultimate comfort order after a long week?',
          options: [
            { id: 'opt_1', text: 'Loaded pizza or pasta' },
            { id: 'opt_2', text: 'Biryani or spicy street food' },
            { id: 'opt_3', text: 'Burgers and crispy fries' },
            { id: 'opt_4', text: 'Iced coffee and dessert' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'If our weekend plan gets cancelled last minute, how do I secretly feel?',
          options: [
            { id: 'opt_1', text: 'Relieved—pajamas and rest immediately' },
            { id: 'opt_2', text: 'Disappointed—I already got ready!' },
            { id: 'opt_3', text: 'Calling someone else to hang out' },
            { id: 'opt_4', text: 'Switching to solo gaming or a movie' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'Which habit gives away that I am stressed?',
          options: [
            { id: 'opt_1', text: 'Going completely quiet in group chats' },
            { id: 'opt_2', text: 'Over-organizing everything at 2 AM' },
            { id: 'opt_3', text: 'Drinking way too much tea or coffee' },
            { id: 'opt_4', text: 'Making sarcastic jokes nonstop' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'What kind of trip would I pick first if budget did not matter?',
          options: [
            { id: 'opt_1', text: 'Quiet mountain cabin with misty views' },
            { id: 'opt_2', text: 'Busy neon city full of food & late-night cafes' },
            { id: 'opt_3', text: 'Relaxing beach where nobody checks the clock' },
            { id: 'opt_4', text: 'Road trip adventure with close friends' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'How do I usually reply to a long voice note?',
          options: [
            { id: 'opt_1', text: 'Send an even longer voice note back' },
            { id: 'opt_2', text: 'Reply with short text messages' },
            { id: 'opt_3', text: 'Listen at 2x speed and react with an emoji' },
            { id: 'opt_4', text: 'Call them directly instead' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
    {
      id: 'campus-crew',
      name: 'Campus & Squad Trivia',
      defaultTitle: 'Squad Check: Are You Really in My Inner Circle?',
      description: 'Hangouts, late-night cravings, and group chat habits.',
      questions: [
        {
          questionText: 'What is my real role in a group project or team task?',
          options: [
            { id: 'opt_1', text: 'Building the whole thing the night before' },
            { id: 'opt_2', text: 'Making the design look clean and modern' },
            { id: 'opt_3', text: 'Doing the talking and presentation' },
            { id: 'opt_4', text: 'Moral support and ordering snacks' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'How early do I show up when the plan says 5:00 PM?',
          options: [
            { id: 'opt_1', text: '4:55 PM—always on time' },
            { id: 'opt_2', text: '5:15 PM—reasonably on time' },
            { id: 'opt_3', text: 'Leaving home at 5:00 PM sharp' },
            { id: 'opt_4', text: 'Only leaving after someone texts they arrived' },
          ],
          correctOptionId: 'opt_4',
        },
        {
          questionText: 'What is my biggest weakness with spending money?',
          options: [
            { id: 'opt_1', text: 'Late-night food delivery' },
            { id: 'opt_2', text: 'Tech gadgets & accessories' },
            { id: 'opt_3', text: 'Coffee and cafe hangouts' },
            { id: 'opt_4', text: 'Watches, rings, or fashion' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'What is my go-to way to recharge on a Friday night?',
          options: [
            { id: 'opt_1', text: 'A great movie or series with zero notifications' },
            { id: 'opt_2', text: 'Late dinner out with close friends' },
            { id: 'opt_3', text: 'Building a side project or playing chess' },
            { id: 'opt_4', text: 'Catching up on 10 hours of sleep' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'What quality do I value most in a close friend?',
          options: [
            { id: 'opt_1', text: 'Honesty and loyalty no matter what' },
            { id: 'opt_2', text: 'Effortless humor on tough days' },
            { id: 'opt_3', text: 'Ambition and hyping each other’s goals' },
            { id: 'opt_4', text: 'Calm presence and great listening' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
  ],
  bn: [
    {
      id: 'best-friends',
      name: 'বেস্ট ফ্রেন্ড স্পেশাল',
      defaultTitle: 'তুমি আমাকে আসলে কতটা ভালো চেনো?',
      description: 'আমার প্রতিদিনের অভ্যাস, প্রিয় খাবার এবং গোপন পছন্দ নিয়ে ৫টি প্রশ্ন!',
      questions: [
        {
          questionText: 'পুরো সপ্তাহের ক্লান্তির পর আমার সবচেয়ে প্রিয় খাবার কোনটি?',
          options: [
            { id: 'opt_1', text: 'পিৎজা বা পাস্তা' },
            { id: 'opt_2', text: 'কাচ্চি বিরিয়ানি বা ঝাল স্ট্রিট ফুড' },
            { id: 'opt_3', text: 'বার্গার ও ফ্রেঞ্চ ফ্রাই' },
            { id: 'opt_4', text: 'কোল্ড কফি বা মিষ্টি কিছু' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'হঠাৎ করে শেষ মুহূর্তে আড্ডার প্ল্যান ক্যানসেল হলে আমি মনে মনে কী ভাবি?',
          options: [
            { id: 'opt_1', text: 'বাঁচা গেল! এখন আরাম করে বাসায় থাকব' },
            { id: 'opt_2', text: 'মেজাজ খারাপ হয়—কারণ আমি রেডি হয়ে গেছি!' },
            { id: 'opt_3', text: 'অন্য কোনো বন্ধুকে ফোন দিয়ে বের হয়ে যাই' },
            { id: 'opt_4', text: 'মুভি দেখা বা গেম খেলা শুরু করি' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'আমি খুব চাপে বা টেনশনে থাকলে আমার কোন অভ্যাসটি দেখা যায়?',
          options: [
            { id: 'opt_1', text: 'গ্রুপ চ্যাটে একদম চুপচাপ হয়ে যাই' },
            { id: 'opt_2', text: 'রাত ২টায় সব কাজ নতুন করে গোছাতে বসি' },
            { id: 'opt_3', text: 'অতিরিক্ত চা বা কফি খেতে থাকি' },
            { id: 'opt_4', text: 'উল্টোপাল্টা জোকস বলে সবাইকে হাসানোর চেষ্টা করি' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'বাজেটের চিন্তা না থাকলে আমি সবার আগে কোথায় ঘুরতে যাব?',
          options: [
            { id: 'opt_1', text: 'মেঘে ঢাকা নির্জন পাহাড়ে' },
            { id: 'opt_2', text: 'রাতের ঝলমলে আধুনিক কোনো শহরে' },
            { id: 'opt_3', text: 'সমুদ্র সৈকতে—যেখানে সময়ের কোনো তাড়া নেই' },
            { id: 'opt_4', text: 'বন্ধুদের সাথে লম্বা রোড ট্রিপে' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'কেউ বড় ভয়েস মেসেজ পাঠালে আমি সাধারণত কীভাবে উত্তর দিই?',
          options: [
            { id: 'opt_1', text: 'আরও বড় ভয়েস নোট পাঠিয়ে উত্তর দিই' },
            { id: 'opt_2', text: 'ছোট দুই-তিন লাইন টেক্সট করি' },
            { id: 'opt_3', text: '2x স্পিডে শুনে শুধু ইমোজি রিঅ্যাক্ট দিই' },
            { id: 'opt_4', text: 'সরাসরি কল দিয়ে কথা বলি' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
    {
      id: 'campus-crew',
      name: 'ক্যাম্পাস ও আড্ডা গ্যাং',
      defaultTitle: 'আড্ডা কুইজ: তুমি কি সত্যিই আমার কাছের বন্ধু?',
      description: 'ক্যাম্পাস, আড্ডা, প্রজেক্ট আর রাতের অভ্যাসের আসল পরীক্ষা।',
      questions: [
        {
          questionText: 'গ্রুপ প্রজেক্ট বা টিমের কাজে আমার আসল ভূমিকা কী থাকে?',
          options: [
            { id: 'opt_1', text: 'জমা দেওয়ার আগের রাতে পুরো কাজ একা শেষ করা' },
            { id: 'opt_2', text: 'ডিজাইন এবং প্রেজেন্টেশন সুন্দর করে সাজানো' },
            { id: 'opt_3', text: 'সবার সামনে কথা বলা ও প্রেজেন্ট করা' },
            { id: 'opt_4', text: 'সবাইকে উৎসাহ দেওয়া এবং খাবারের ব্যবস্থা করা' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'বিকেল ৫টায় দেখা করার কথা থাকলে আমি কখন পৌঁছাই?',
          options: [
            { id: 'opt_1', text: '৪:৫৫ মিনিটে—সবসময় সময়ের আগে' },
            { id: 'opt_2', text: '৫:১৫ মিনিটে—মোটামুটি ঠিক সময়ে' },
            { id: 'opt_3', text: 'ঘড়িতে ৫টা বাজলে বাসা থেকে বের হই' },
            { id: 'opt_4', text: 'অন্য কেউ পৌঁছে মেসেজ দিলে তারপর রওনা দিই' },
          ],
          correctOptionId: 'opt_4',
        },
        {
          questionText: 'প্রতি মাসে আমার সবচেয়ে বেশি টাকা খরচ হয় কোনটির পেছনে?',
          options: [
            { id: 'opt_1', text: 'রাতের বেলা অনলাইনে খাবার অর্ডার করায়' },
            { id: 'opt_2', text: 'টেক গ্যাজেট ও অ্যাক্সেসরিজ কেনায়' },
            { id: 'opt_3', text: 'ক্যাফেতে কফি ও আড্ডায়' },
            { id: 'opt_4', text: 'ঘড়ি, আংটি বা পছন্দের পোশাকে' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'ছুটির রাতে নিজের মতো সময় কাটাতে আমি কোনটি বেছে নিই?',
          options: [
            { id: 'opt_1', text: 'ফোন সাইলেন্ট করে ভালো কোনো মুভি বা সিরিজ দেখা' },
            { id: 'opt_2', text: 'কাছের বন্ধুদের সাথে বাইরে ডিনার করা' },
            { id: 'opt_3', text: 'নতুন কোনো প্রজেক্ট তৈরি বা অনলাইনে দাবা খেলা' },
            { id: 'opt_4', text: 'টানা ১০ ঘণ্টা লম্বা ঘুম দেওয়া' },
          ],
          correctOptionId: 'opt_3',
        },
        {
          questionText: 'একজন কাছের বন্ধুর কোন গুণটি আমার কাছে সবচেয়ে গুরুত্বপূর্ণ?',
          options: [
            { id: 'opt_1', text: 'সততা এবং যেকোনো পরিস্থিতিতে পাশে থাকা' },
            { id: 'opt_2', text: 'মন খারাপের দিনে হাসাতে পারার ক্ষমতা' },
            { id: 'opt_3', text: 'নতুন লক্ষ্য ও স্বপ্নে একে অপরকে উৎসাহ দেওয়া' },
            { id: 'opt_4', text: 'ধৈর্য ধরে কথা শোনা এবং শান্ত থাকা' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
  ],
};

export function getScoreFeedback(percentage: number, lang: Language) {
  if (lang === 'bn') {
    if (percentage >= 90)
      return {
        title: 'মাইন্ড-রিডার বন্ধু! 🏆',
        subtitle: 'তুমি তো আমার সব অভ্যাস আর পছন্দ একেবারে মুখস্থ জানো!',
      };
    if (percentage >= 70)
      return {
        title: 'খাঁটি ইনার সার্কেল! ✨',
        subtitle: 'দারুণ স্কোর! মাত্র দু-একটা প্রশ্নে একটু দ্বিধা ছিল।',
      };
    if (percentage >= 45)
      return {
        title: 'ভালোই চেনো দেখা যাচ্ছে! 😊',
        subtitle: 'অনেকগুলোই মিলেছে—বাকিগুলো নিয়ে সামনের আড্ডায় গল্প হবে!',
      };
    return {
      title: 'নতুন করে জানার সুযোগ! ☕',
      subtitle: 'স্কোর কম মানেই সামনের চায়ের আড্ডায় আমাদের আরও অনেক গল্প জমানো বাকি!',
    };
  }

  if (percentage >= 90)
    return {
      title: 'Mind-Reader Status! 🏆',
      subtitle: 'You know my habits, quirks, and go-to choices inside out.',
    };
  if (percentage >= 70)
    return {
      title: 'Inner Circle Certified ✨',
      subtitle: 'Solid connection! Only a couple of plot twists caught you off guard.',
    };
  if (percentage >= 45)
    return {
      title: 'Good Vibes & Guessing 😊',
      subtitle: 'You nailed the big stuff—and now we have great conversation starters.',
    };
  return {
    title: 'Fresh Discovery Unlocked! ☕',
    subtitle: 'Low scores just mean more stories to share over coffee next time we meet.',
  };
}
