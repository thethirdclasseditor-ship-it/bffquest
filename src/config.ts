export type Lang = 'en' | 'bn';

export const BRAND = {
  name: import.meta.env.VITE_APP_NAME || 'BFFquest',
  storagePrefix: 'bffquest_v2_',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'support@bffquest.com',
  limits: {
    minQuestions: 5,
    maxQuestions: 15,
  },
  // Adsterra, Monetag, বা A-Ads চালানোর কনফিগারেশন:
  // যখন অ্যাড দেখাতে চাইবেন, enabled: true করবেন অথবা Cloudflare-এ VITE_ENABLE_ADS="true" দেবেন।
  ads: {
    enabled: import.meta.env.VITE_ENABLE_ADS === 'true',
    // আপনি চাইলে নিচের sponsorUrl ও sponsorText দিয়ে নিজের প্রোডাক্ট বা অ্যাফিলিয়েট লিংকও প্রমোট করতে পারবেন
    sponsorText: 'Sponsored • Play & Share BFFquest with your squad!',
    sponsorUrl: '',
  },
};

export interface QuizOption {
  id: string;
  text: string;
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
  defaultTitle: string;
  description: string;
  questions: Omit<QuizQuestion, 'id' | 'position'>[];
}

export const COPY = {
  en: {
    tagline: 'Minimalist Friendship Games',
    heroTitle1: 'Discover Who Knows You Best on',
    heroSub:
      'Create a personalized friendship quiz in 60 seconds, share your link in any chat, and see how your friends rank on your leaderboard—no account required to play.',
    createBtn: 'Create Your Quiz',
    sampleBtn: 'Try Sample Quiz',
    navGuides: 'Guides',
    navDashboard: 'Dashboard',
    navCreate: 'Create Quiz',
    demoBanner: 'Local Demo Mode: Quizzes & scores save in your browser until Supabase is connected.',
    step1Title: '1. Customize Questions',
    step1Desc: 'Pick from ready-made English or Bangla templates or write your own questions.',
    step2Title: '2. Share Private Link',
    step2Desc: 'Send your unique link on WhatsApp, Messenger, or Instagram. Zero sign-up friction.',
    step3Title: '3. Live Leaderboard',
    step3Desc: 'Answers stay locked server-side. Friends get a score card and rank on your leaderboard.',
    builderHeading: 'Create Your BFFquest Quiz',
    builderSub: 'Choose a template below or edit any question. Tap the circle next to your true answer.',
    loadTemplateLabel: 'Quick-Load Editable Template:',
    yourNameLabel: 'Your Display Name *',
    yourNamePlaceholder: 'e.g., Ahad',
    quizTitleLabel: 'Quiz Title *',
    quizDescLabel: 'Short Note for Friends (Optional)',
    questionLabel: 'Question',
    selectTrueAnswer: 'Options (Tap the circle for your true answer) *',
    addQuestionBtn: '+ Add Question',
    publishBtn: 'Publish & Get Share Link',
    publishingBtn: 'Publishing...',
    publishedBadge: 'Published Successfully',
    publishedHeading: 'Your Quiz Link Is Ready!',
    publishedSub: 'Share this link with friends. Anyone can play immediately without creating an account.',
    copyLinkBtn: 'Copy Quiz Link',
    copiedBtn: 'Link Copied!',
    whatsappShareBtn: 'Share on WhatsApp',
    shareNativeBtn: 'More Share Options',
    openQuizBtn: 'Open Quiz Page',
    invitedBy: 'Invited by',
    questionsCount: 'Questions',
    noAccountNeeded: 'No Account Required',
    startQuizBtn: 'Start Quiz Now',
    nicknameLabel: 'Your Name or Nickname (Shown on the leaderboard) *',
    nicknamePlaceholder: 'e.g., Rafi',
    backBtn: 'Back',
    nextBtn: 'Next Question',
    finishBtn: 'Finish & See Score',
    scoreRevealBadge: 'Official Score Reveal',
    shareScoreBtn: 'Share My Score',
    downloadCardBtn: 'Download Score Card',
    challengeBackTitle: 'Now Turn the Tables!',
    challengeBackSub: 'Create your own quiz in 60 seconds and see if your friends can beat your score.',
    leaderboardTitle: 'Top Friends Leaderboard',
    leaderboardEmpty: 'No friend has completed this quiz yet—be the first on the board!',
    dashboardTitle: 'Creator Dashboard',
    signInTitle: 'Creator Sign In',
    signInSub: 'Enter your name and email to manage your quizzes and view all friend submissions.',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    continueBtn: 'Continue to Dashboard',
    signOutBtn: 'Sign Out',
    totalQuizzes: 'My Quizzes',
    totalSubmissions: 'Friend Submissions',
    avgScore: 'Average Score',
    pauseBtn: 'Pause',
    activateBtn: 'Publish',
    deleteBtn: 'Delete',
    recentSubmissions: 'Friend Scores:',
    noQuizzesYet: 'You have not created any quizzes yet.',
    reportTitle: 'Report Inappropriate Quiz',
    reportSub: 'Help us keep BFFquest positive and safe. Report any abusive or privacy-violating quiz below.',
    reportSlugLabel: 'Quiz Link or Slug (Optional)',
    reportReasonLabel: 'Reason *',
    reportDetailsLabel: 'Details *',
    reportSubmitBtn: 'Submit Report',
    reportSuccess: 'Thank you! Your report has been recorded for review.',
    footerNote: 'Scores are playful friendship games, not psychological assessments.',
  },
  bn: {
    tagline: 'প্রিমিয়াম ফ্রেন্ডশিপ কুইজ প্ল্যাটফর্ম',
    heroTitle1: 'কে আপনাকে সবচেয়ে ভালো চেনে তা জানুন',
    heroSub:
      'মাত্র ৬০ সেকেন্ডে নিজের পছন্দ ও অভ্যাস নিয়ে কুইজ তৈরি করুন, বন্ধুদের ইনবক্সে বা গ্রুপে লিংক শেয়ার করুন এবং লিডারবোর্ডে দেখুন কে প্রথম হয়—খেলার জন্য কোনো অ্যাকাউন্ট খুলতে হবে না।',
    createBtn: 'নিজের কুইজ তৈরি করুন',
    sampleBtn: 'স্যাম্পল কুইজ খেলুন',
    navGuides: 'গাইড',
    navDashboard: 'ড্যাশবোর্ড',
    navCreate: 'কুইজ বানান',
    demoBanner: 'লোকাল ডেমো মোড চালু আছে: Supabase যুক্ত না করা পর্যন্ত তথ্য আপনার ব্রাউজারে সেভ থাকবে।',
    step1Title: '১. প্রশ্ন পছন্দ করুন',
    step1Desc: 'রেডিমেড বাংলা বা ইংরেজি টেমপ্লেট বেছে নিন অথবা নিজের মতো প্রশ্ন সাজান।',
    step2Title: '২. লিংক শেয়ার করুন',
    step2Desc: 'হোয়াটসঅ্যাপ, মেসেঞ্জার বা ইনস্টাগ্রামে লিংক পাঠান। বন্ধুদের সাইন-আপ করতে হবে না।',
    step3Title: '৩. লাইভ লিডারবোর্ড',
    step3Desc: 'সঠিক উত্তর সার্ভারে সুরক্ষিত থাকে। বন্ধুরা সাথে সাথে স্কোর কার্ড ও লিডারবোর্ড দেখতে পাবে।',
    builderHeading: 'আপনার BFFquest কুইজ তৈরি করুন',
    builderSub: 'নিচের যেকোনো টেমপ্লেট বেছে নিন অথবা প্রশ্ন এডিট করুন। আপনার সঠিক উত্তরের পাশের গোল বাটনে টিক দিন।',
    loadTemplateLabel: 'রেডিমেড টেমপ্লেট বেছে নিন (এডিট করা যাবে):',
    yourNameLabel: 'আপনার নাম *',
    yourNamePlaceholder: 'যেমন: আহাদ',
    quizTitleLabel: 'কুইজের শিরোনাম *',
    quizDescLabel: 'বন্ধুদের জন্য ছোট বার্তা (ঐচ্ছিক)',
    questionLabel: 'প্রশ্ন',
    selectTrueAnswer: 'অপশনসমূহ (আপনার সঠিক উত্তরের পাশের বৃত্তে ট্যাপ করুন) *',
    addQuestionBtn: '+ নতুন প্রশ্ন যোগ করুন',
    publishBtn: 'পাবলিশ করুন ও লিংক নিন',
    publishingBtn: 'পাবলিশ হচ্ছে...',
    publishedBadge: 'সফলভাবে পাবলিশ হয়েছে',
    publishedHeading: 'আপনার কুইজ লিংক তৈরি!',
    publishedSub: 'এই লিংকটি বন্ধুদের পাঠান। তারা কোনো অ্যাকাউন্ট ছাড়াই যেকোনো ফোন থেকে সরাসরি খেলতে পারবে।',
    copyLinkBtn: 'লিংক কপি করুন',
    copiedBtn: 'কপি হয়েছে!',
    whatsappShareBtn: 'হোয়াটসঅ্যাপে শেয়ার করুন',
    shareNativeBtn: 'অন্যান্য অ্যাপে শেয়ার',
    openQuizBtn: 'কুইজ পেজ খুলুন',
    invitedBy: 'আমন্ত্রণ জানিয়েছেন',
    questionsCount: 'টি প্রশ্ন',
    noAccountNeeded: 'অ্যাকাউন্ট ছাড়াই খেলুন',
    startQuizBtn: 'কুইজ শুরু করুন',
    nicknameLabel: 'আপনার নাম বা ডাকনাম (লিডারবোর্ডে এই নাম দেখা যাবে) *',
    nicknamePlaceholder: 'যেমন: রাফি',
    backBtn: 'পেছনে',
    nextBtn: 'পরের প্রশ্ন',
    finishBtn: 'সাবমিট করুন ও স্কোর দেখুন',
    scoreRevealBadge: 'ফলাফল ও স্কোর',
    shareScoreBtn: 'স্কোর শেয়ার করুন',
    downloadCardBtn: 'স্কোর কার্ড ডাউনলোড',
    challengeBackTitle: 'এবার আপনার পালা!',
    challengeBackSub: 'মাত্র ১ মিনিটে নিজের কুইজ বানিয়ে বন্ধুদের পাল্টা চ্যালেঞ্জ ছুড়ে দিন।',
    leaderboardTitle: 'সেরা বন্ধুদের লিডারবোর্ড',
    leaderboardEmpty: 'এখনো কোনো বন্ধু এই কুইজটি খেলেনি—সবার আগে খেলে প্রথম স্থান দখল করুন!',
    dashboardTitle: 'ক্রিয়েটর ড্যাশবোর্ড',
    signInTitle: 'ক্রিয়েটর লগইন',
    signInSub: 'আপনার কুইজগুলো পরিচালনা করতে এবং বন্ধুদের স্কোর দেখতে নাম ও ইমেইল দিন।',
    emailLabel: 'ইমেইল অ্যাড্রেস',
    passwordLabel: 'পাসওয়ার্ড',
    continueBtn: 'ড্যাশবোর্ডে প্রবেশ করুন',
    signOutBtn: 'লগআউট',
    totalQuizzes: 'আমার কুইজ',
    totalSubmissions: 'বন্ধুদের অংশগ্রহণ',
    avgScore: 'গড় স্কোর',
    pauseBtn: 'বিরতি',
    activateBtn: 'চালু করুন',
    deleteBtn: 'ডিলিট',
    recentSubmissions: 'বন্ধুদের স্কোর:',
    noQuizzesYet: 'আপনি এখনো কোনো কুইজ তৈরি করেননি।',
    reportTitle: 'অভিযোগ জানান (Report Abuse)',
    reportSub: 'কোনো আপত্তিকর কুইজ লিংক সম্পর্কে অভিযোগ জানাতে নিচের ফর্মটি পূরণ করুন।',
    reportSlugLabel: 'কুইজের লিংক বা নাম (ঐচ্ছিক)',
    reportReasonLabel: 'অভিযোগের কারণ *',
    reportDetailsLabel: 'বিস্তারিত বিবরণ *',
    reportSubmitBtn: 'অভিযোগ জমা দিন',
    reportSuccess: 'ধন্যবাদ! আপনার অভিযোগটি সফলভাবে রেকর্ড করা হয়েছে।',
    footerNote: 'স্কোরগুলো নিছক বন্ধুত্বপূর্ণ খেলার ফলাফল, কোনো মনস্তাত্ত্বিক মূল্যায়ন নয়।',
  },
};

export const TEMPLATES: Record<Lang, QuizTemplate[]> = {
  en: [
    {
      id: 'best-friends',
      name: 'Best Friends Classic',
      badge: 'Popular',
      defaultTitle: 'How Well Do You Actually Know Me?',
      description: 'Everyday habits, comfort foods, and how I react in classic situations.',
      questions: [
        {
          questionText: 'What is my ultimate comfort food after a long, tiring week?',
          options: [
            { id: 'opt_1', text: 'Biryani or spicy street food' },
            { id: 'opt_2', text: 'Loaded pizza or pasta' },
            { id: 'opt_3', text: 'Burgers and crispy fries' },
            { id: 'opt_4', text: 'Iced coffee and dessert' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'If our group hangout gets cancelled last minute, how do I react?',
          options: [
            { id: 'opt_1', text: 'Secretly relieved—staying home in peace' },
            { id: 'opt_2', text: 'Annoyed because I already got ready' },
            { id: 'opt_3', text: 'Calling another friend immediately' },
            { id: 'opt_4', text: 'Starting a movie or gaming session' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'Which small habit shows that I am stressed out?',
          options: [
            { id: 'opt_1', text: 'Going unusually quiet in chats' },
            { id: 'opt_2', text: 'Drinking way too much tea or coffee' },
            { id: 'opt_3', text: 'Staying up past 3 AM organizing things' },
            { id: 'opt_4', text: 'Making nonstop sarcastic jokes' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'What kind of vacation would I choose first?',
          options: [
            { id: 'opt_1', text: 'Quiet mountain cabin with misty views' },
            { id: 'opt_2', text: 'Vibrant city full of food & late cafes' },
            { id: 'opt_3', text: 'Relaxing beach by the ocean' },
            { id: 'opt_4', text: 'Road trip with the whole crew' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'How do I usually reply to a long 3-minute voice note?',
          options: [
            { id: 'opt_1', text: 'Send an even longer voice note back' },
            { id: 'opt_2', text: 'Reply with two short text messages' },
            { id: 'opt_3', text: 'Listen at 2x speed and send a reaction' },
            { id: 'opt_4', text: 'Call them directly instead' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
    {
      id: 'campus-crew',
      name: 'Campus & Squad Trivia',
      badge: 'Squad',
      defaultTitle: 'Campus & Hangout Crew Test',
      description: 'Canteen talks, group plans, and late-night habits.',
      questions: [
        {
          questionText: 'What is my real role in any group project or team task?',
          options: [
            { id: 'opt_1', text: 'Designing & building the main thing' },
            { id: 'opt_2', text: 'Finishing everything the night before' },
            { id: 'opt_3', text: 'Doing the talking & presentation' },
            { id: 'opt_4', text: 'Moral support and ordering food' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'Where do I spend most of my money every month?',
          options: [
            { id: 'opt_1', text: 'Late-night food orders & cafes' },
            { id: 'opt_2', text: 'Tech gadgets & accessories' },
            { id: 'opt_3', text: 'Watches, rings, or fashion' },
            { id: 'opt_4', text: 'Saving it for future projects' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'If the plan says 5:00 PM, when do I actually arrive?',
          options: [
            { id: 'opt_1', text: '4:55 PM—always punctual' },
            { id: 'opt_2', text: '5:15 PM—reasonably on time' },
            { id: 'opt_3', text: 'Leaving home at 5:00 PM' },
            { id: 'opt_4', text: 'After someone texts that they reached' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'How do I recharge on a free Friday evening?',
          options: [
            { id: 'opt_1', text: 'Working on a creative or tech project' },
            { id: 'opt_2', text: 'Going out for tea and street food' },
            { id: 'opt_3', text: 'Playing chess or watching a thriller' },
            { id: 'opt_4', text: 'Catching up on 10 hours of sleep' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'What quality matters most to me in a close friend?',
          options: [
            { id: 'opt_1', text: 'Loyalty and honesty no matter what' },
            { id: 'opt_2', text: 'Great humor that fixes bad days' },
            { id: 'opt_3', text: 'Supporting each other’s big goals' },
            { id: 'opt_4', text: 'Zero drama after months apart' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
  ],
  bn: [
    {
      id: 'best-friends',
      name: 'বেস্ট ফ্রেন্ড ক্লাসিক',
      badge: 'জনপ্রিয়',
      defaultTitle: 'তুমি আমাকে কতটা ভালো চেনো?',
      description: 'আমার প্রতিদিনের অভ্যাস, প্রিয় খাবার এবং মজার কিছু পছন্দ নিয়ে কুইজ।',
      questions: [
        {
          questionText: 'সপ্তাহান্তে বা মন খারাপ থাকলে আমার সবচেয়ে প্রিয় খাবার কোনটি?',
          options: [
            { id: 'opt_1', text: 'কাচ্চি বিরিয়ানি বা ঝাল স্ট্রিট ফুড' },
            { id: 'opt_2', text: 'পিৎজা বা পাস্তা' },
            { id: 'opt_3', text: 'বার্গার ও ফ্রেঞ্চ ফ্রাই' },
            { id: 'opt_4', text: 'কোল্ড কফি বা ডেজার্ট' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'হঠাৎ করে শেষ মুহূর্তে আড্ডার প্ল্যান ক্যানসেল হলে আমি মনে মনে কী ভাবি?',
          options: [
            { id: 'opt_1', text: 'বাঁচা গেল! এখন বাসায় আরাম করে থাকব' },
            { id: 'opt_2', text: 'মেজাজ খারাপ হয়, কারণ রেডি হয়ে গিয়েছিলাম' },
            { id: 'opt_3', text: 'অন্য কোনো বন্ধুকে কল দিয়ে নতুন প্ল্যান করি' },
            { id: 'opt_4', text: 'মুভি দেখা বা গেম খেলা শুরু করি' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'আমি খুব চাপে বা টেনশনে থাকলে কোন অভ্যাসটি দেখে বোঝা যায়?',
          options: [
            { id: 'opt_1', text: 'গ্রুপ চ্যাটে একদম চুপচাপ হয়ে যাই' },
            { id: 'opt_2', text: 'ঘন ঘন চা বা কফি খাই' },
            { id: 'opt_3', text: 'রাত ৩টা পর্যন্ত জেগে কাজ গুছাই' },
            { id: 'opt_4', text: 'বেশি বেশি মজা বা জোকস করি' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'ছুটিতে ঘুরতে যাওয়ার সুযোগ পেলে আমি কোন জায়গাটি সবার আগে বেছে নেব?',
          options: [
            { id: 'opt_1', text: 'কুয়াশা ঘেরা শান্ত পাহাড় ও মেঘ' },
            { id: 'opt_2', text: 'রাতের ঝলমলে শহর ও দারুণ সব রেস্তোরাঁ' },
            { id: 'opt_3', text: 'সমুদ্র সৈকত ও ঢেউয়ের গর্জন' },
            { id: 'opt_4', text: 'বন্ধুদের সাথে লং রোড ট্রিপ' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'কেউ ৩ মিনিটের লম্বা ভয়েস নোট পাঠালে আমি সাধারণত কী করি?',
          options: [
            { id: 'opt_1', text: 'উত্তরে আরও বড় ভয়েস নোট পাঠাই' },
            { id: 'opt_2', text: 'ছোট দুই লাইনের টেক্সটে উত্তর দিই' },
            { id: 'opt_3', text: '2x স্পিডে শুনে ইমোজি রিঅ্যাক্ট দিই' },
            { id: 'opt_4', text: 'সরাসরি কল দিয়ে কথা বলি' },
          ],
          correctOptionId: 'opt_1',
        },
      ],
    },
    {
      id: 'campus-crew',
      name: 'ক্যাম্পাস ও আড্ডা গ্যাং',
      badge: 'আড্ডা',
      defaultTitle: 'আমাদের আড্ডা ও ক্যাম্পাস কুইজ',
      description: 'ক্যান্টিনের চা, গ্রুপ প্রজেক্ট এবং প্রতিদিনের আড্ডার স্মৃতি।',
      questions: [
        {
          questionText: 'যেকোনো গ্রুপ প্রজেক্ট বা টিমের কাজে আমার আসল ভূমিকা কী থাকে?',
          options: [
            { id: 'opt_1', text: 'মূল ডিজাইন ও আসল কাজটি গুছিয়ে করা' },
            { id: 'opt_2', text: 'জমা দেওয়ার আগের রাতে পুরো কাজ শেষ করা' },
            { id: 'opt_3', text: 'প্রেজেন্টেশনের সময় কথা বলা' },
            { id: 'opt_4', text: 'সবাইকে উৎসাহ দেওয়া এবং খাবারের ব্যবস্থা করা' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'প্রতি মাসে আমার সবচেয়ে বেশি টাকা কোন খাতে খরচ হয়?',
          options: [
            { id: 'opt_1', text: 'রাতের খাবার অর্ডার ও ক্যাফেতে আড্ডা' },
            { id: 'opt_2', text: 'টেক গ্যাজেট ও অ্যাক্সেসরিজ' },
            { id: 'opt_3', text: 'ঘড়ি, আংটি বা পছন্দের পোশাক' },
            { id: 'opt_4', text: 'নতুন প্রজেক্ট বা ভবিষ্যতের জন্য জমানো' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'বিকেল ৫টায় দেখা করার কথা থাকলে আমি সাধারণত কখন পৌঁছাই?',
          options: [
            { id: 'opt_1', text: '৪:৫৫ মিনিটে—সময়ের আগেই হাজির' },
            { id: 'opt_2', text: '৫:১৫ মিনিটে—মোটামুটি সময়ের মধ্যেই' },
            { id: 'opt_3', text: 'ঘড়িতে ৫টা বাজলে বাসা থেকে বের হই' },
            { id: 'opt_4', text: 'অন্য কেউ পৌঁছে মেসেজ দিলে তারপর রওনা দিই' },
          ],
          correctOptionId: 'opt_2',
        },
        {
          questionText: 'শুক্রবার বা ছুটির সন্ধ্যায় আমি কীভাবে সময় কাটাতে পছন্দ করি?',
          options: [
            { id: 'opt_1', text: 'নিজের ক্রিয়েটিভ বা টেক প্রজেক্ট নিয়ে কাজ করা' },
            { id: 'opt_2', text: 'বন্ধুদের সাথে বাইরে চা ও আড্ডা' },
            { id: 'opt_3', text: 'দাবা খেলা বা থ্রিলার মুভি দেখা' },
            { id: 'opt_4', text: 'ফোন সাইলেন্ট করে লম্বা ঘুম দেওয়া' },
          ],
          correctOptionId: 'opt_1',
        },
        {
          questionText: 'একজন কাছের বন্ধুর কোন গুণটি আমার কাছে সবচেয়ে বেশি গুরুত্বপূর্ণ?',
          options: [
            { id: 'opt_1', text: 'সততা এবং যেকোনো পরিস্থিতিতে পাশে থাকা' },
            { id: 'opt_2', text: 'মন খারাপ ভালো করে দেওয়ার মতো সেন্স অব হিউমার' },
            { id: 'opt_3', text: 'একে অপরের স্বপ্ন ও কাজে উৎসাহ দেওয়া' },
            { id: 'opt_4', text: 'অনেকদিন কথা না হলেও সম্পর্ক একই রকম থাকা' },
          ],
          correctOptionId: 'opt_1',
        },
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
