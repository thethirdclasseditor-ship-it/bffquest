export type Lang = 'en' | 'bn';

export const BRAND = {
  name: import.meta.env.VITE_APP_NAME || 'BFFquest',
  storagePrefix: 'bffquest_v3_',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'support@bffquest.com',
  limits: {
    minQuestions: 5,
    maxQuestions: 15,
  },
  ads: {
    enabled: import.meta.env.VITE_ENABLE_ADS === 'true',
    sponsorText: 'Sponsored • Create & Share Your BFFquest Quiz Today!',
    sponsorUrl: '',
  },
};

export interface QuizOption {
  id: string;
  text: string;
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
  defaultTitle: string;
  description: string;
  questions: Omit<QuizQuestion, 'id' | 'position'>[];
}

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

export const COPY = {
  en: {
    tagline: 'Minimalist Friendship Games',
    heroTitle1: 'Discover Who Knows You Best on',
    heroSub:
      'Pick from 8+ interactive templates, customize your questions in 60 seconds, share your link anywhere, and watch your friends compete on your live leaderboard!',
    createBtn: 'Create Your Quiz',
    sampleBtn: 'Try Sample Quiz',
    navGuides: 'Guides',
    navDashboard: 'My Quizzes',
    navCreate: 'Create Quiz',
    demoBanner:
      'Local Demo Mode: Quizzes work only in this browser until Supabase Cloud is connected.',
    step1Title: '1. Pick a Template & Edit',
    step1Desc:
      'Choose from 8 fun categories in English or Bangla. Every question includes 3 choices + a write-your-own slot!',
    step2Title: '2. Copy & Share Link',
    step2Desc:
      'One-tap copy or share directly to WhatsApp & Messenger. Friends play instantly with zero sign-up.',
    step3Title: '3. Podium Leaderboard',
    step3Desc:
      'See who gets Gold, Silver, and Bronze on your live leaderboard and read their custom written answers!',
    builderHeading: 'Create Your BFFquest Quiz',
    builderSub:
      'Tap any template below to load questions, edit anything you like, and tap the circle next to your true answer.',
    loadTemplateLabel: 'Choose a Quick-Load Editable Template (8 Categories):',
    templateLoadedMsg: 'Template loaded! You can now edit any question below.',
    yourNameLabel: 'Your Display Name *',
    yourNamePlaceholder: 'e.g., Ahad',
    quizTitleLabel: 'Quiz Title *',
    quizDescLabel: 'Short Note for Friends (Optional)',
    questionLabel: 'Question',
    selectTrueAnswer: '3 Fixed Choices + 1 Write-In Slot (Tap circle for true answer) *',
    customSlotHint: 'Option 4 (Player writes their own answer — select circle if any written answer counts as correct)',
    addQuestionBtn: '+ Add Question',
    publishBtn: 'Publish & Get Share Link',
    publishingBtn: 'Publishing to Cloud...',
    publishedBadge: 'Published Live',
    publishedHeading: 'Your Quiz Link Is Ready!',
    publishedSub:
      'Copy your direct link below or share straight to WhatsApp. Friends on any phone can play immediately.',
    directLinkLabel: 'Direct Shareable Link (Tap to select or use Copy button):',
    copyLinkBtn: 'Copy Direct Link',
    copiedBtn: 'Link Copied to Clipboard!',
    copyManualHint: 'Link selected! Press Copy on your screen/keyboard.',
    whatsappShareBtn: 'Share on WhatsApp',
    shareNativeBtn: 'More Share Options',
    openQuizBtn: 'Open Quiz Page',
    invitedBy: 'Quiz Created by',
    questionsCount: 'Questions',
    noAccountNeeded: 'No Sign-Up Needed',
    startQuizBtn: 'Start Quiz Now',
    nicknameLabel: 'Your Name or Nickname (Shown on Leaderboard) *',
    nicknamePlaceholder: 'e.g., Rafi',
    writeOwnLabel: 'Or write your own answer',
    writeOwnPlaceholder: 'Type your custom answer here...',
    backBtn: 'Back',
    nextBtn: 'Next Question',
    finishBtn: 'Submit & See Score',
    scoreRevealBadge: 'Official Score Reveal',
    shareScoreBtn: 'Copy Score Link',
    downloadCardBtn: 'Download Score Card',
    challengeBackTitle: 'Now Turn the Tables!',
    challengeBackSub:
      'Create your own BFFquest quiz in 60 seconds and see if your friends can beat your score.',
    customAnswersTitle: 'Your Written Answers',
    leaderboardTitle: 'Friends Leaderboard',
    leaderboardSub: 'Ranked by highest score & fastest completion',
    participantsCount: 'Played',
    leaderboardEmpty: 'No friend has finished this quiz yet—be the first to claim #1 Gold!',
    dashboardTitle: 'My Created Quizzes',
    dashboardSub:
      'Quizzes you create on this browser are saved automatically here so you can check scores, read custom answers, pause, or delete anytime.',
    totalQuizzes: 'My Quizzes',
    totalSubmissions: 'Total Plays',
    avgScore: 'Weighted Avg Score',
    pauseBtn: 'Pause',
    activateBtn: 'Publish',
    deleteBtn: 'Delete',
    confirmDeleteQuiz: 'Are you sure you want to permanently delete this quiz and all its scores?',
    recentSubmissions: 'Friend Scores & Custom Answers:',
    noQuizzesYet: 'You have not created any quizzes yet. Create your first quiz in 60 seconds!',
    reportTitle: 'Report Inappropriate Quiz',
    reportSub: 'Help us keep BFFquest positive and safe. Report any abusive or privacy-violating quiz below.',
    reportSlugLabel: 'Quiz Link or Slug (Optional)',
    reportReasonLabel: 'Reason *',
    reportDetailsLabel: 'Details *',
    reportSubmitBtn: 'Submit Report',
    reportSuccess: 'Thank you! Your report has been recorded for admin review.',
    adminTitle: 'Site-Owner Admin Panel',
    footerNote: 'Scores are playful friendship games, not psychological assessments.',
  },
  bn: {
    tagline: 'প্রিমিয়াম ফ্রেন্ডশিপ কুইজ প্ল্যাটফর্ম',
    heroTitle1: 'কে আপনাকে সবচেয়ে ভালো চেনে তা জানুন',
    heroSub:
      '৮টিরও বেশি মজার টেমপ্লেট থেকে প্রশ্ন বেছে নিন, ৬০ সেকেন্ডে নিজের কুইজ সাজিয়ে লিংক শেয়ার করুন এবং লাইভ লিডারবোর্ডে দেখুন আপনার বন্ধুদের মধ্যে কে প্রথম হয়!',
    createBtn: 'নিজের কুইজ তৈরি করুন',
    sampleBtn: 'স্যাম্পল কুইজ খেলুন',
    navGuides: 'গাইড',
    navDashboard: 'আমার কুইজ',
    navCreate: 'কুইজ বানান',
    demoBanner:
      'লোকাল ডেমো মোড: Supabase যুক্ত না থাকলে কুইজ শুধু এই ব্রাউজারে কাজ করবে।',
    step1Title: '১. টেমপ্লেট ও প্রশ্ন সাজান',
    step1Desc:
      '৮টি ক্যাটাগরির বাংলা বা ইংরেজি টেমপ্লেট বেছে নিন। প্রতিটি প্রশ্নে ৩টি অপশন + ১টি নিজের মতো উত্তর লেখার বক্স থাকে!',
    step2Title: '২. ডিরেক্ট লিংক কপি ও শেয়ার',
    step2Desc:
      '১ ক্লিকে লিংক কপি করুন বা হোয়াটসঅ্যাপে পাঠান। বন্ধুদের কোনো অ্যাকাউন্ট খুলতে হবে না।',
    step3Title: '৩. প্রিমিয়াম লিডারবোর্ড',
    step3Desc:
      'কে গোল্ড, সিলভার ও ব্রোঞ্জ পেল তা লিডারবোর্ডে দেখুন এবং বন্ধুদের নিজ হাতে লেখা উত্তরগুলো পড়ুন!',
    builderHeading: 'আপনার BFFquest কুইজ তৈরি করুন',
    builderSub:
      'নিচের যেকোনো টেমপ্লেটে ট্যাপ করে প্রশ্ন লোড করুন, নিজের মতো এডিট করুন এবং সঠিক উত্তরের পাশের গোল বৃত্তে টিক দিন।',
    loadTemplateLabel: 'রেডিমেড এডিটেবল টেমপ্লেট বেছে নিন (৮টি ক্যাটাগরি):',
    templateLoadedMsg: 'টেমপ্লেট লোড হয়েছে! এখন নিচের যেকোনো প্রশ্ন আপনার মতো পরিবর্তন করতে পারেন।',
    yourNameLabel: 'আপনার নাম *',
    yourNamePlaceholder: 'যেমন: আহাদ',
    quizTitleLabel: 'কুইজের শিরোনাম *',
    quizDescLabel: 'বন্ধুদের জন্য ছোট নোট (ঐচ্ছিক)',
    questionLabel: 'প্রশ্ন',
    selectTrueAnswer: '৩টি ফিক্সড অপশন + ১টি নিজের মতো লেখার অপশন (সঠিক উত্তরের বৃত্তে টিক দিন) *',
    customSlotHint: '৪ নম্বর অপশন (এখানে বন্ধুরা নিজেদের মতো উত্তর টাইপ করতে পারবে)',
    addQuestionBtn: '+ নতুন প্রশ্ন যোগ করুন',
    publishBtn: 'পাবলিশ করুন ও লিংক নিন',
    publishingBtn: 'ক্লাউডে সেভ হচ্ছে...',
    publishedBadge: 'সফলভাবে পাবলিশ হয়েছে',
    publishedHeading: 'আপনার কুইজ লিংক তৈরি!',
    publishedSub:
      'নিচের বাটন থেকে ডিরেক্ট লিংক কপি করুন অথবা হোয়াটসঅ্যাপে বন্ধুদের পাঠান। যেকোনো ফোন থেকে সরাসরি খেলা যাবে।',
    directLinkLabel: 'ডিরেক্ট শেয়ার লিংক (সিলেক্ট করুন অথবা কপি বাটনে চাপুন):',
    copyLinkBtn: 'ডিরেক্ট লিংক কপি করুন',
    copiedBtn: 'লিংক কপি হয়েছে!',
    copyManualHint: 'লিংক সিলেক্ট হয়েছে! এবার আপনার স্ক্রিন থেকে Copy চাপুন।',
    whatsappShareBtn: 'হোয়াটসঅ্যাপে শেয়ার করুন',
    shareNativeBtn: 'অন্যান্য অ্যাপে শেয়ার',
    openQuizBtn: 'কুইজ পেজ খুলুন',
    invitedBy: 'আমন্ত্রণ জানিয়েছেন',
    questionsCount: 'টি প্রশ্ন',
    noAccountNeeded: 'অ্যাকাউন্ট ছাড়াই খেলুন',
    startQuizBtn: 'কুইজ শুরু করুন',
    nicknameLabel: 'আপনার নাম বা ডাকনাম (লিডারবোর্ডে এই নাম দেখা যাবে) *',
    nicknamePlaceholder: 'যেমন: রাফি',
    writeOwnLabel: 'অথবা নিজের মতো উত্তর লিখুন',
    writeOwnPlaceholder: 'এখানে আপনার উত্তরটি লিখুন...',
    backBtn: 'পেছনে',
    nextBtn: 'পরের প্রশ্ন',
    finishBtn: 'সাবমিট করুন ও স্কোর দেখুন',
    scoreRevealBadge: 'ফলাফল ও স্কোর',
    shareScoreBtn: 'স্কোর লিংক কপি করুন',
    downloadCardBtn: 'স্কোর কার্ড ডাউনলোড',
    challengeBackTitle: 'এবার আপনার পালা!',
    challengeBackSub:
      'মাত্র ১ মিনিটে নিজের কুইজ বানিয়ে বন্ধুদের পাল্টা চ্যালেঞ্জ ছুড়ে দিন।',
    customAnswersTitle: 'আপনার লেখা কাস্টম উত্তরসমূহ',
    leaderboardTitle: 'সেরা বন্ধুদের লিডারবোর্ড',
    leaderboardSub: 'সর্বোচ্চ স্কোর ও দ্রুততম সময়ের ভিত্তিতে র‍্যাংকিং',
    participantsCount: 'জন খেলেছে',
    leaderboardEmpty: 'এখনো কেউ এই কুইজটি খেলেনি—সবার আগে খেলে ১ম স্থান (🥇) দখল করুন!',
    dashboardTitle: 'আমার তৈরি কুইজসমূহ',
    dashboardSub:
      'আপনার তৈরি করা কুইজগুলো এখানে স্বয়ংক্রিয়ভাবে সেভ থাকে। যেকোনো সময় বন্ধুদের স্কোর ও লেখা উত্তর দেখুন।',
    totalQuizzes: 'মোট কুইজ',
    totalSubmissions: 'মোট অংশগ্রহণ',
    avgScore: 'গড় স্কোর',
    pauseBtn: 'বিরতি',
    activateBtn: 'চালু করুন',
    deleteBtn: 'ডিলিট',
    confirmDeleteQuiz: 'আপনি কি নিশ্চিত যে এই কুইজ এবং এর সব স্কোর ডিলিট করতে চান?',
    recentSubmissions: 'বন্ধুদের স্কোর ও লিখিত উত্তর:',
    noQuizzesYet: 'আপনি এখনো কোনো কুইজ তৈরি করেননি। মাত্র ৬০ সেকেন্ডে প্রথম কুইজটি বানিয়ে ফেলুন!',
    reportTitle: 'অভিযোগ জানান (Report Abuse)',
    reportSub: 'কোনো আপত্তিকর কুইজ লিংক সম্পর্কে অভিযোগ জানাতে নিচের ফর্মটি পূরণ করুন।',
    reportSlugLabel: 'কুইজের লিংক বা স্লাগ (ঐচ্ছিক)',
    reportReasonLabel: 'অভিযোগের কারণ *',
    reportDetailsLabel: 'বিস্তারিত বিবরণ *',
    reportSubmitBtn: 'অভিযোগ জমা দিন',
    reportSuccess: 'ধন্যবাদ! আপনার অভিযোগটি অ্যাডমিন রিভিউয়ের জন্য জমা হয়েছে।',
    adminTitle: 'সাইট অ্যাডমিন প্যানেল',
    footerNote: 'স্কোরগুলো নিছক বন্ধুত্বপূর্ণ খেলার ফলাফল, কোনো মনস্তাত্ত্বিক মূল্যায়ন নয়।',
  },
};

export const TEMPLATES: Record<Lang, QuizTemplate[]> = {
  en: [
    {
      id: 'best-friends',
      name: '🔥 Best Friends Classic',
      badge: 'Popular',
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
    {
      id: 'childhood-memories',
      name: '🚲 Childhood & School Days',
      badge: 'Nostalgia',
      defaultTitle: 'Do You Know My School & Childhood Story?',
      description: 'Backbench memories, school tiffin, and growing up.',
      questions: [
        makeQ(
          'What kind of student was I back in school?',
          'Quietly smart—studied right before exams',
          'Backbench entertainer with all the jokes',
          'Front-row regular who finished homework early',
          EN_CUSTOM
        ),
        makeQ(
          'What was my favorite thing about school breaks/tiffin?',
          'Street food outside the school gate',
          'Playing cricket or football in 35°C heat',
          'Sharing tiffin in the classroom with the gang',
          EN_CUSTOM
        ),
        makeQ(
          'Which subject did I secretly enjoy (or hate the least)?',
          'Math, Computers, or Science',
          'English & Literature stories',
          'None—I was there for the friends!',
          EN_CUSTOM
        ),
        makeQ(
          'What was my favorite afternoon pastime as a kid?',
          'Playing video games or cartoons',
          'Cycling or playing outside till sunset',
          'Drawing, crafting, or experimenting with things',
          EN_CUSTOM
        ),
        makeQ(
          'If I could relive one day from our old days, what would it be?',
          'Our last day of school hangout with the whole crew',
          'A carefree rainy day holiday with zero worries',
          'Our first big trip or picnic together',
          EN_CUSTOM
        ),
      ],
    },
    {
      id: 'long-distance',
      name: '✈️ Long-Distance BFFs',
      badge: 'Forever',
      defaultTitle: 'Miles Apart, Still Best Friends?',
      description: 'For friends who don’t talk every day but never lose the bond.',
      questions: [
        makeQ(
          'How do we usually catch up after weeks of being busy?',
          'A sudden 2-hour call covering 6 months of lore',
          'Sending reels and memes daily without words',
          'Meeting up after months like zero time passed',
          EN_CUSTOM
        ),
        makeQ(
          'What is the first thing we must do when we meet in person?',
          'Go straight to our favorite food spot',
          'Walk around for hours roasting everything',
          'Take a photo we forget to post',
          EN_CUSTOM
        ),
        makeQ(
          'How do you know I am genuinely proud of you?',
          'I hype up your wins to everyone I know',
          'I send a heartfelt message when you least expect it',
          'I roast you to your face but defend you everywhere',
          EN_CUSTOM
        ),
        makeQ(
          'What keeps our friendship strong despite busy schedules?',
          'Zero ego even if someone replies late',
          'Sharing the exact same sense of humor',
          'Always showing up when things get serious',
          EN_CUSTOM
        ),
        makeQ(
          'Where will our friendship be 10 years from now?',
          'Successful, travelling together, same terrible jokes',
          'Still sending memes at 2 AM',
          'Neighbors or business partners!',
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
    {
      id: 'childhood-memories',
      name: '🚲 স্কুল জীবন ও শৈশব',
      badge: 'নস্টালজিয়া',
      defaultTitle: 'আমার স্কুল জীবন ও ছোটবেলা কতটা জানো?',
      description: 'স্কুল টিফিন, ব্যাকবেঞ্চের গল্প এবং শৈশবের সোনালী দিন।',
      questions: [
        makeQ(
          'স্কুল জীবনে আমি ঠিক কোন ধরনের ছাত্র ছিলাম?',
          'চুপচাপ কিন্তু পরীক্ষার আগের রাতে পড়ে ভালো রেজাল্ট করা',
          'ব্যাকবেঞ্চে বসে পুরো ক্লাস মাতিয়ে রাখা',
          'সময়মতো সব হোমওয়ার্ক শেষ করা ভদ্র ছাত্র',
          BN_CUSTOM
        ),
        makeQ(
          'স্কুলের টিফিন ব্রেকে আমার সবচেয়ে প্রিয় কাজ কী ছিল?',
          'স্কুল গেটের বাইরের ঝালমুড়ি, ফুচকা বা আচার খাওয়া',
          'কড়া রোদে ক্রিকেট বা ফুটবল খেলতে নেমে যাওয়া',
          'ক্লাসরুমে বসে বন্ধুদের সাথে টিফিন ভাগাভাগি করা',
          BN_CUSTOM
        ),
        makeQ(
          'স্কুলে কোন ক্লাস বা বিষয়টি আমার সবচেয়ে ভালো লাগত?',
          'গণিত, আইসিটি বা বিজ্ঞান',
          'বাংলা বা ইংরেজি গল্পের ক্লাস',
          'পড়ার চেয়ে বন্ধুদের সাথে দেখা হওয়াটাই আসল ছিল!',
          BN_CUSTOM
        ),
        makeQ(
          'ছোটবেলায় বিকেল হলেই আমার প্রধান আকর্ষণ কী ছিল?',
          'মাঠে খেলতে যাওয়া বা সাইকেল চালানো',
          'টিভিতে প্রিয় কার্টুন বা ভিডিও গেম খেলা',
          'নতুন কিছু বানানো বা আঁকাআঁকি করা',
          BN_CUSTOM
        ),
        makeQ(
          'পুরোনো দিনের কোন একটি দিন ফিরে পেলে আমি বারবার বাঁচতে চাইব?',
          'স্কুলের শেষ দিনটিতে সব বন্ধুদের সাথে আড্ডা',
          'ঝুম বৃষ্টির দিনে স্কুল ছুটি হওয়ার সেই আনন্দ',
          'বন্ধুদের সাথে প্রথমবার দূরে কোথাও পিকনিক বা ট্যুর',
          BN_CUSTOM
        ),
      ],
    },
    {
      id: 'long-distance',
      name: '✈️ দূরের কিন্তু কাছের বন্ধু',
      badge: 'চিরকালের',
      defaultTitle: 'দূরে থাকলেও আমাদের বন্ধুত্ব কতটা অটুট?',
      description: 'যাদের সাথে প্রতিদিন কথা হয় না, কিন্তু সম্পর্ক একটুও বদলায়নি।',
      questions: [
        makeQ(
          'অনেকদিন ব্যস্ত থাকার পর আমাদের কীভাবে আবার কথা শুরু হয়?',
          'হঠাৎ ২ ঘণ্টার লম্বা কলে গত ৬ মাসের সব গল্প শেষ করা',
          'কথা না হলেও প্রতিদিন মজার রিলস ও মিম পাঠানো',
          'অনেক মাস পর দেখা হলেও মনে হয় গতকালই কথা হয়েছে',
          BN_CUSTOM
        ),
        makeQ(
          'অনেকদিন পর সামনাসামনি দেখা হলে আমাদের প্রথম কাজ কী হয়?',
          'সোজা আমাদের প্রিয় খাবারের দোকানে চলে যাওয়া',
          'ঘণ্টার পর ঘণ্টা হাঁটতে হাঁটতে পুরনো গল্প করা',
          'ছবি তোলা (যা আর কখনো পোস্ট করা হয় না)',
          BN_CUSTOM
        ),
        makeQ(
          'ব্যস্ততার মাঝেও আমাদের বন্ধুত্ব টিকে থাকার আসল রহস্য কী?',
          'লেট রিপ্লাই নিয়ে কোনো অভিমান বা ইগো না থাকা',
          'আমাদের দুজনের সেন্স অব হিউমার একদম এক হওয়া',
          'বিপদে বা দরকারে সবসময় একে অপরের পাশে থাকা',
          BN_CUSTOM
        ),
        makeQ(
          'বন্ধুর কোনো সাফল্যে আমি কীভাবে আনন্দ প্রকাশ করি?',
          'সবার কাছে গর্ব করে তার সাফল্যের গল্প বলি',
          'মন থেকে বড় একটি শুভেচ্ছা মেসেজ পাঠাই',
          'সামনে পচাই কিন্তু পেছনে সবসময় সাপোর্ট করি',
          BN_CUSTOM
        ),
        makeQ(
          'আজ থেকে ১০ বছর পর আমাদের বন্ধুত্ব কোথায় থাকবে?',
          'নিজ নিজ জায়গায় সফল, কিন্তু আড্ডায় সেই আগের মতোই পাগলাটে',
          'তখনো রাত ২টায় একে অপরকে মিম পাঠাব',
          'একসাথে নতুন কোনো প্রজেক্ট বা বিজনেস করব!',
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
