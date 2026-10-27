import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Share2,
  Play,
  Download,
  CheckCircle2,
  Trophy,
  MessageCircle,
  ShieldAlert,
  Lock,
  Search,
  RefreshCw,
  PenTool,
  AlertCircle,
} from 'lucide-react';
import {
  BRAND,
  COPY,
  TEMPLATES,
  Lang,
  QuizQuestion,
  getScoreFeedback,
} from './config';
import {
  api,
  getSavedLang,
  saveLang,
  copyTextSafely,
  getSavedAdminKey,
  saveAdminKey,
  PublicQuiz,
  SubmissionResult,
  CreatorQuizSummary,
  LeaderboardEntry,
  AdminDashboardData,
} from './api';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof COPY.en;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: COPY.en,
});

const useLang = () => useContext(LangContext);

/* ============================================================================
 * REUSABLE AD BANNER SLOT
 * ============================================================================ */
const AdBanner: React.FC<{ slotId: string }> = ({ slotId }) => {
  if (!BRAND.ads.enabled) return null;

  return (
    <aside className="ad-slot-box" aria-label="Sponsored Content" data-slot={slotId}>
      {BRAND.ads.sponsorUrl ? (
        <a
          href={BRAND.ads.sponsorUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          {BRAND.ads.sponsorText}
        </a>
      ) : (
        <span>{BRAND.ads.sponsorText}</span>
      )}
    </aside>
  );
};

/* ============================================================================
 * UPGRADED PODIUM LEADERBOARD COMPONENT
 * ============================================================================ */
const LeaderboardCard: React.FC<{
  entries?: LeaderboardEntry[];
  totalParticipants?: number;
}> = ({ entries = [], totalParticipants }) => {
  const { t } = useLang();
  const count = totalParticipants ?? entries.length;
  const topThree = entries.slice(0, 3);

  const medals = ['🥇 #1', '🥈 #2', '🥉 #3'];

  return (
    <div className="card" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.35rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={22} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t.leaderboardTitle}</h3>
        </div>
        <span className="badge">
          {count} {t.participantsCount}
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '0 0 0.75rem' }}>
        {t.leaderboardSub}
      </p>

      {entries.length === 0 ? (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg)',
            border: '1px dashed var(--border)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.92rem',
          }}
        >
          {t.leaderboardEmpty}
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="podium-grid">
            {topThree.map((item, idx) => {
              const pct = Math.round(Number(item.scorePercentage));
              return (
                <div key={item.submissionId || idx} className={`podium-card rank-${idx + 1}`}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {medals[idx]}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1.02rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.participantNickname}
                  </div>
                  <div
                    style={{
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      marginTop: '0.2rem',
                    }}
                  >
                    {item.score}/{item.totalQuestions} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Ranked List with Score Bars */}
          <div className="leaderboard-list">
            {entries.map((item, idx) => {
              const pct = Math.max(4, Math.round(Number(item.scorePercentage)));
              const rankClass =
                idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : '';
              return (
                <div key={item.submissionId || idx} className="leaderboard-row">
                  <div className="leaderboard-row-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span className={`rank-badge ${rankClass}`}>{idx + 1}</span>
                      <strong>{item.participantNickname}</strong>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {item.score}/{item.totalQuestions} ({Math.round(Number(item.scorePercentage))}%)
                    </div>
                  </div>
                  <div className="score-bar-mini">
                    <div className="score-bar-mini-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/* ============================================================================
 * 1. MINIMALIST PREMIUM LAYOUT & LANGUAGE SWITCHER
 * ============================================================================ */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    document.title = `${BRAND.name} — ${t.tagline}`;
  }, [lang, t.tagline]);

  const handleSwitch = (next: Lang) => {
    setLang(next);
    saveLang(next);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {api.isDemoMode && <div className="demo-bar">{t.demoBanner}</div>}

      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-link">
            <span className="brand-mark">
              <Sparkles size={18} />
            </span>
            <span>{BRAND.name}</span>
          </Link>

          <div className="nav-actions">
            <div className="lang-switch" role="group" aria-label="Language Switcher">
              <button
                type="button"
                className={`lang-pill ${lang === 'en' ? 'active' : ''}`}
                onClick={() => handleSwitch('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-pill ${lang === 'bn' ? 'active' : ''}`}
                onClick={() => handleSwitch('bn')}
              >
                বাংলা
              </button>
            </div>

            <Link to="/guides" className="btn btn-outline" style={{ padding: '0.45rem 0.85rem' }}>
              {t.navGuides}
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-outline"
              style={{ padding: '0.45rem 0.85rem' }}
            >
              {t.navDashboard}
            </Link>
            <Link to="/create" className="btn btn-primary" style={{ padding: '0.45rem 1rem' }}>
              {t.navCreate}
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, paddingBottom: '4rem' }}>{children}</main>

      <footer
        style={{
          background: '#ffffff',
          borderTop: '1px solid var(--border)',
          padding: '2.5rem 0 2rem',
          marginTop: 'auto',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <strong>{BRAND.name}</strong>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <Link to="/guides">{t.navGuides}</Link>
              <Link to="/about">About</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms</Link>
              <Link
                to="/report"
                style={{
                  color: 'var(--danger)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: 600,
                }}
              >
                <ShieldAlert size={15} /> Report Abuse
              </Link>
              <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Admin
              </Link>
            </div>
          </div>
          <div
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span>
              © {new Date().getFullYear()} {BRAND.name}.
            </span>
            <span>{t.footerNote}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ============================================================================
 * 2. HOME PAGE
 * ============================================================================ */
const HomePage: React.FC = () => {
  const { lang, t } = useLang();
  const sampleQ = TEMPLATES[lang][0].questions[0];

  return (
    <div className="animate-in">
      <section
        style={{
          padding: '3.5rem 0 3rem',
          background:
            'radial-gradient(circle at top right, #f3effe 0%, #fcfbfe 60%, #fff5f8 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '2.5rem' }}>
            <div>
              <span className="badge" style={{ marginBottom: '1rem' }}>
                <Sparkles size={14} /> {t.tagline}
              </span>
              <h1
                style={{
                  fontSize: 'clamp(2rem, 4.5vw, 3.1rem)',
                  lineHeight: 1.18,
                  margin: '0 0 1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {t.heroTitle1}{' '}
                <span style={{ color: 'var(--primary)' }}>{BRAND.name}</span>
              </h1>
              <p
                style={{
                  fontSize: '1.08rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.75rem',
                }}
              >
                {t.heroSub}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                <Link to="/create" className="btn btn-primary">
                  {t.createBtn}
                </Link>
                <Link to="/q/sample-best-friend-quiz" className="btn btn-secondary">
                  {t.sampleBtn}
                </Link>
              </div>
            </div>

            <div className="card card-elevated">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.9rem',
                }}
              >
                <span className="badge">{t.questionLabel} 1 / 5</span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {BRAND.name} Live Preview
                </span>
              </div>
              <p style={{ fontWeight: 700, fontSize: '1.12rem', margin: '0 0 1rem' }}>
                {sampleQ.questionText}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div className="option-choice selected">
                  <span>{sampleQ.options[0].text}</span>
                  <CheckCircle2 size={18} color="var(--primary)" />
                </div>
                <div className="option-choice">
                  <span>{sampleQ.options[1].text}</span>
                </div>
                <div
                  className="option-choice"
                  style={{ borderStyle: 'dashed', color: 'var(--text-secondary)' }}
                >
                  <span>✍️ {sampleQ.options[3]?.text}</span>
                </div>
              </div>
              <div
                style={{
                  marginTop: '1.2rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {t.noAccountNeeded}
                </span>
                <Link
                  to="/q/sample-best-friend-quiz"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.95rem', minHeight: '38px' }}
                >
                  {t.startQuizBtn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '3.25rem 1.15rem' }}>
        <div className="grid-3">
          <div className="card">
            <h3>{t.step1Title}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t.step1Desc}</p>
          </div>
          <div className="card">
            <h3>{t.step2Title}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t.step2Desc}</p>
          </div>
          <div className="card">
            <h3>{t.step3Title}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t.step3Desc}</p>
          </div>
        </div>

        <AdBanner slotId="home-bottom" />
      </section>
    </div>
  );
};

/* ============================================================================
 * 3. CREATE QUIZ PAGE (FIXED TEMPLATE SWITCHING, 3+1 CUSTOM OPTION, SAFE COPY)
 * ============================================================================ */
const CreateQuizPage: React.FC = () => {
  const { lang, t } = useLang();
  const templates = TEMPLATES[lang];

  const [selectedTplId, setSelectedTplId] = useState<string>(templates[0].id);
  const [creatorName, setCreatorName] = useState('');
  const [title, setTitle] = useState(templates[0].defaultTitle);
  const [description, setDescription] = useState(templates[0].description);
  const [hasEdited, setHasEdited] = useState(false);
  const [tplNotice, setTplNotice] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    templates[0].questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 1}_${Date.now()}`,
      position: idx + 1,
      options: q.options.map((o) => ({ ...o })),
    }))
  );

  // Only react when `lang` itself changes, preserving the selected template ID
  const prevLangRef = useRef<Lang>(lang);
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;

    if (hasEdited) return;
    const nextList = TEMPLATES[lang];
    const matching = nextList.find((item) => item.id === selectedTplId) || nextList[0];
    setSelectedTplId(matching.id);
    setTitle(matching.defaultTitle);
    setDescription(matching.description);
    setQuestions(
      matching.questions.map((q, idx) => ({
        ...q,
        id: `q_${idx + 1}_${Date.now()}`,
        position: idx + 1,
        options: q.options.map((o) => ({ ...o })),
      }))
    );
  }, [lang, hasEdited, selectedTplId]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const linkInputRef = useRef<HTMLInputElement | null>(null);

  const loadTemplate = (tplId: string) => {
    const found = templates.find((item) => item.id === tplId);
    if (!found) return;
    setSelectedTplId(found.id);
    setTitle(found.defaultTitle);
    setDescription(found.description);
    setQuestions(
      found.questions.map((q, idx) => ({
        ...q,
        id: `q_${idx + 1}_${Date.now()}`,
        position: idx + 1,
        options: q.options.map((o) => ({ ...o })),
      }))
    );
    setHasEdited(false);
    setErrorMsg(null);
    setTplNotice(t.templateLoadedMsg);
    setTimeout(() => setTplNotice(null), 3000);
  };

  const handlePublish = async () => {
    setErrorMsg(null);
    setPublishing(true);
    try {
      const res = await api.publishQuiz({
        creatorDisplayName: creatorName,
        title,
        description,
        questions,
      });
      setPublishedSlug(res.slug);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not publish quiz.');
    } finally {
      setPublishing(false);
    }
  };

  const shareUrl = publishedSlug ? `${window.location.origin}/q/${publishedSlug}` : '';
  const whatsappText = encodeURIComponent(
    `${title} — Take my ${BRAND.name} friendship quiz and see how well you know me! ${shareUrl}`
  );

  const handleCopyPublishedLink = async () => {
    const res = await copyTextSafely(shareUrl);
    if (res.ok) {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } else {
      setCopyStatus('manual');
      if (linkInputRef.current) {
        linkInputRef.current.focus();
        linkInputRef.current.select();
      }
    }
  };

  if (publishedSlug) {
    return (
      <div className="container animate-in" style={{ paddingTop: '2.75rem', maxWidth: '660px' }}>
        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <span className="badge" style={{ marginBottom: '0.75rem' }}>
            {t.publishedBadge}
          </span>
          <h1 style={{ marginTop: 0 }}>{t.publishedHeading}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t.publishedSub}</p>

          <div style={{ textAlign: 'left', margin: '1.25rem 0' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
              {t.directLinkLabel}
            </label>
            <input
              ref={linkInputRef}
              type="text"
              readOnly
              className="form-input"
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              style={{
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-soft)',
                textAlign: 'center',
              }}
            />
          </div>

          {copyStatus === 'copied' && <div className="alert-success">{t.copiedBtn}</div>}
          {copyStatus === 'manual' && <div className="alert-success">{t.copyManualHint}</div>}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <button type="button" className="btn btn-primary" onClick={handleCopyPublishedLink}>
              {copyStatus === 'copied' ? <Check size={18} /> : <Copy size={18} />}
              <span>{copyStatus === 'copied' ? t.copiedBtn : t.copyLinkBtn}</span>
            </button>

            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <MessageCircle size={18} />
              <span>{t.whatsappShareBtn}</span>
            </a>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title, url: shareUrl });
                    return;
                  } catch {}
                }
                await handleCopyPublishedLink();
              }}
            >
              <Share2 size={18} />
              <span>{t.shareNativeBtn}</span>
            </button>

            <Link to={`/q/${publishedSlug}`} className="btn btn-outline">
              {t.openQuizBtn}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-in" style={{ paddingTop: '2.25rem', maxWidth: '860px' }}>
      <h
