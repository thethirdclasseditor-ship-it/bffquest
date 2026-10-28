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
  Edit3,
  Users,
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
  getSavedAdminKey,
  saveAdminKey,
  copyTextSafely,
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
 * REUSABLE DIRECT LINK COPY BOX (WITH FALLBACK SELECTION)
 * ============================================================================ */
const DirectLinkBox: React.FC<{ url: string; shareTitle?: string }> = ({ url, shareTitle }) => {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');

  const handleCopy = async () => {
    const res = await copyTextSafely(url);
    if (res.ok) {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 3000);
    } else {
      setCopyState('manual');
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      setTimeout(() => setCopyState('idle'), 4500);
    }
  };

  const whatsappText = encodeURIComponent(
    `${shareTitle ? `${shareTitle} — ` : ''}Play my ${BRAND.name} friendship quiz! ${url}`
  );

  return (
    <div style={{ textAlign: 'left', margin: '1.25rem 0' }}>
      <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
        {t.directLinkLabel}
      </label>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          ref={inputRef}
          type="text"
          readOnly
          className="form-input"
          value={url}
          onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
          style={{
            flex: '1 1 240px',
            fontWeight: 600,
            background: 'var(--bg)',
            color: 'var(--primary)',
          }}
        />
        <button type="button" className="btn btn-primary" onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={18} /> : <Copy size={18} />}
          <span>{copyState === 'copied' ? t.copiedBtn : t.copyLinkBtn}</span>
        </button>
      </div>

      {copyState === 'manual' && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--primary)',
            fontWeight: 600,
          }}
        >
          {t.copyManualHint}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.7rem',
          marginTop: '1.1rem',
        }}
      >
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
                await navigator.share({ title: shareTitle || BRAND.name, url });
                return;
              } catch {}
            }
            await handleCopy();
          }}
        >
          <Share2 size={18} />
          <span>{t.shareNativeBtn}</span>
        </button>
      </div>
    </div>
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
  const count = typeof totalParticipants === 'number' ? totalParticipants : entries.length;
  const topThree = entries.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="card" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          <Users size={14} /> {count} {t.participantsCount}
        </span>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 0 }}>
        {t.leaderboardSub}
      </p>

      {entries.length === 0 ? (
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg)',
            border: '1px dashed var(--border)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
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
                  <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>{medals[idx]}</div>
                  <strong
                    style={{
                      display: 'block',
                      marginTop: '0.35rem',
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.participantNickname}
                  </strong>
                  <div
                    style={{
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      marginTop: '0.2rem',
                    }}
                  >
                    {item.score}/{item.totalQuestions} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Ranked List with Progress Bars */}
          <div className="leaderboard-list">
            {entries.map((item, idx) => {
              const pct = Math.round(Number(item.scorePercentage));
              const badgeClass =
                idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : '';
              return (
                <div key={item.submissionId || idx} className="leaderboard-row">
                  <div className="leaderboard-row-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`rank-badge ${badgeClass}`}>{idx + 1}</span>
                      <strong>{item.participantNickname}</strong>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {item.score}/{item.totalQuestions} ({pct}%)
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
              <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
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
 * 3. CREATE QUIZ PAGE (8+ TEMPLATES, FIXED SWITCHING & 3+1 WRITE-IN SLOT)
 * ============================================================================ */
const CreateQuizPage: React.FC = () => {
  const { lang, t } = useLang();
  const templates = TEMPLATES[lang];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [creatorName, setCreatorName] = useState('');
  const [title, setTitle] = useState(templates[0].defaultTitle);
  const [description, setDescription] = useState(templates[0].description);
  const [hasEdited, setHasEdited] = useState(false);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);

  const buildQuestionsFromTemplate = (tpl: typeof templates[0]): QuizQuestion[] =>
    tpl.questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 1}_${Date.now()}`,
      position: idx + 1,
      options: q.options.map((o) => ({ ...o })),
    }));

  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    buildQuestionsFromTemplate(templates[0])
  );

  // Sync matching template when switching language ONLY if user hasn't manually edited text
  const prevLangRef = useRef<Lang>(lang);
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      if (!hasEdited) {
        const matching =
          TEMPLATES[lang].find((item) => item.id === selectedTemplateId) || TEMPLATES[lang][0];
        setSelectedTemplateId(matching.id);
        setTitle(matching.defaultTitle);
        setDescription(matching.description);
        setQuestions(buildQuestionsFromTemplate(matching));
      }
    }
  }, [lang, hasEdited, selectedTemplateId]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const loadTemplate = (tplId: string) => {
    const found = templates.find((item) => item.id === tplId);
    if (!found) return;
    setSelectedTemplateId(found.id);
    setTitle(found.defaultTitle);
    setDescription(found.description);
    setQuestions(buildQuestionsFromTemplate(found));
    setHasEdited(false);
    setErrorMsg(null);
    setTemplateNotice(`${found.name} — ${t.templateLoadedMsg}`);
    setTimeout(() => setTemplateNotice(null), 3000);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not publish quiz.');
    } finally {
      setPublishing(false);
    }
  };

  const shareUrl = publishedSlug ? `${window.location.origin}/q/${publishedSlug}` : '';

  if (publishedSlug) {
    return (
      <div className="container animate-in" style={{ paddingTop: '3rem', maxWidth: '660px' }}>
        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <span className="badge" style={{ marginBottom: '0.75rem' }}>
            {t.publishedBadge}
          </span>
          <h1 style={{ marginTop: 0 }}>{t.publishedHeading}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t.publishedSub}</p>

          <DirectLinkBox url={shareUrl} shareTitle={title} />

          <div style={{ marginTop: '1rem' }}>
            <Link to={`/q/${publishedSlug}`} className="btn btn-outline">
              {t.openQuizBtn}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-in" style={{ paddingTop: '2.25rem', maxWidth: '880px' }}>
      <h1 style={{ marginBottom: '0.35rem' }}>{t.builderHeading}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.5rem' }}>
        {t.builderSub}
      </p>

      {/* 8+ Quick-Load Editable Template Grid */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
          {t.loadTemplateLabel}
        </strong>
        <div className="template-grid">
          {templates.map((tpl) => {
            const isActive = selectedTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => loadTemplate(tpl.id)}
                className={`template-pill ${isActive ? 'active' : ''}`}
              >
                <span>{tpl.name}</span>
                <span className="badge" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                  {tpl.badge}
                </span>
              </button>
            );
          })}
        </div>
        {templateNotice && (
          <div className="alert-success" style={{ marginTop: '0.85rem', marginBottom: 0 }}>
            {templateNotice}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="alert-error" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">{t.yourNameLabel}</label>
            <input
              className="form-input"
              placeholder={t.yourNamePlaceholder}
              value={creatorName}
              onChange={(e) => {
                setCreatorName(e.target.value);
              }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t.quizTitleLabel}</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasEdited(true);
              }}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t.quizDescLabel}</label>
          <input
            className="form-input"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setHasEdited(true);
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {questions.map((q, qIdx) => (
          <div key={q.id} className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span className="badge">
                {t.questionLabel} {qIdx + 1} / {questions.length}
              </span>
              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '0.3rem 0.65rem', minHeight: '36px' }}
                onClick={() => {
                  if (questions.length <= BRAND.limits.minQuestions) {
                    setErrorMsg(`Minimum ${BRAND.limits.minQuestions} questions required.`);
                    return;
                  }
                  setHasEdited(true);
                  setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="form-group">
              <input
                className="form-input"
                value={q.questionText}
                placeholder={`${t.questionLabel} ${qIdx + 1}`}
                onChange={(e) => {
                  setHasEdited(true);
                  setQuestions((prev) =>
                    prev.map((item, idx) =>
                      idx === qIdx ? { ...item, questionText: e.target.value } : item
                    )
                  );
                }}
              />
            </div>

            <div className="form-label" style={{ marginBottom: '0.45rem' }}>
              {t.selectTrueAnswer}
            </div>

            <div className="grid-2">
              {q.options.slice(0, 3).map((opt, optIdx) => {
                const isSelected = q.correctOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected
                        ? '2px solid var(--primary)'
                        : '1.5px solid var(--border)',
                      background: isSelected ? 'var(--primary-soft)' : '#ffffff',
                    }}
                  >
                    <input
                      type="radio"
                      name={`correct_${q.id}`}
                      checked={isSelected}
                      onChange={() => {
                        setHasEdited(true);
                        setQuestions((prev) =>
                          prev.map((item, idx) =>
                            idx === qIdx ? { ...item, correctOptionId: opt.id } : item
                          )
                        );
                      }}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    <input
                      className="form-input"
                      placeholder={`Option ${optIdx + 1}`}
                      style={{ border: 'none', background: 'transparent', padding: '0.2rem' }}
                      value={opt.text}
                      onChange={(e) => {
                        setHasEdited(true);
                        setQuestions((prev) =>
                          prev.map((item, idx) =>
                            idx === qIdx
                              ? {
                                  ...item,
                                  options: item.options.map((o) =>
                                    o.id === opt.id ? { ...o, text: e.target.value } : o
                                  ),
                                }
                              : item
                          )
                        );
                      }}
                    />
                  </div>
                );
              })}

              {/* 4th Slot: Player Write-In Option */}
              {(() => {
                const isCustomSelected = q.correctOptionId === 'opt_4';
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isCustomSelected
                        ? '2px solid var(--primary)'
                        : '1.5px dashed var(--primary)',
                      background: isCustomSelected ? 'var(--primary-soft)' : '#faf8ff',
                    }}
                  >
                    <input
                      type="radio"
                      name={`correct_${q.id}`}
                      checked={isCustomSelected}
                      onChange={() => {
                        setHasEdited(true);
                        setQuestions((prev) =>
                          prev.map((item, idx) =>
                            idx === qIdx ? { ...item, correctOptionId: 'opt_4' } : item
                          )
                        );
                      }}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block' }}>
                        ✍️ {t.writeOwnLabel}
                      </strong>
                      <span>{t.customSlotHint}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (questions.length >= BRAND.limits.maxQuestions) return;
            setHasEdited(true);
            setQuestions((prev) => [
              ...prev,
              {
                id: `q_${Date.now()}`,
                position: prev.length + 1,
                questionText: '',
                options: [
                  { id: 'opt_1', text: '' },
                  { id: 'opt_2', text: '' },
                  { id: 'opt_3', text: '' },
                  { id: 'opt_4', text: t.writeOwnPlaceholder, isCustom: true },
                ],
                correctOptionId: 'opt_1',
              },
            ]);
          }}
        >
          <Plus size={18} />
          <span>{t.addQuestionBtn}</span>
        </button>

        <button
          type="button"
          disabled={publishing}
          onClick={handlePublish}
          className="btn btn-primary"
        >
          {publishing ? t.publishingBtn : t.publishBtn}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. PUBLIC QUIZ LANDING & PLAY PAGES (WITH 3 CHOICES + 1 WRITE-IN BOX)
 * ============================================================================ */
const PublicQuizPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { lang, t } = useLang();
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'unavailable' | 'not_found' | 'error'>(
    'loading'
  );
  const [errMsg, setErrMsg] = useState<string>('');

  useEffect(() => {
    setStatus('loading');
    api
      .getPublicQuizBySlug(slug, lang)
      .then((res) => {
        setStatus(res.status);
        if (res.quiz) setQuiz(res.quiz);
        if (res.errorMessage) setErrMsg(res.errorMessage);
      })
      .catch((err) => {
        setStatus('error');
        setErrMsg(err.message || 'Network error while loading quiz.');
      });
  }, [slug, lang]);

  if (status === 'loading') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        Loading quiz...
      </div>
    );
  }

  if (status !== 'ok' || !quiz) {
    return (
      <div className="container animate-in" style={{ paddingTop: '3.5rem', maxWidth: '540px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ marginTop: 0 }}>
            {status === 'error' ? 'Connection Error' : 'Quiz Unavailable'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {errMsg ||
              'This quiz link may have been paused, deleted, or created in local demo mode on another browser.'}
          </p>
          <Link to="/create" className="btn btn-primary">
            {t.createBtn}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-in" style={{ paddingTop: '2.5rem', maxWidth: '660px' }}>
      <div className="card card-elevated" style={{ textAlign: 'center' }}>
        <span className="badge" style={{ marginBottom: '0.75rem' }}>
          {t.invitedBy} {quiz.creatorDisplayName}
        </span>
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{quiz.title}</h1>
        {quiz.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {quiz.description}
          </p>
        )}
        <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          {quiz.questions.length} {t.questionsCount} • {t.noAccountNeeded}
        </p>
        <Link to={`/q/${quiz.slug}/play`} className="btn btn-primary" style={{ minWidth: '240px' }}>
          <Play size={18} />
          <span>{t.startQuizBtn}</span>
        </Link>
      </div>

      <LeaderboardCard entries={quiz.leaderboard} totalParticipants={quiz.totalParticipants} />
    </div>
  );
};

const PlayQuizPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLang();

  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [loadStatus, setLoadStatus] = useState<
    'loading' | 'ok' | 'unavailable' | 'not_found' | 'error'
  >('loading');
  const [nickname, setNickname] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadStatus('loading');
    api
      .getPublicQuizBySlug(slug, lang)
      .then((res) => {
        setLoadStatus(res.status);
        if (res.status === 'ok' && res.quiz) setQuiz(res.quiz);
      })
      .catch(() => {
        setLoadStatus('error');
      });
  }, [slug, lang]);

  if (loadStatus === 'loading') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        Loading quiz questions...
      </div>
    );
  }

  if (loadStatus !== 'ok' || !quiz) {
    return (
      <div className="container animate-in" style={{ paddingTop: '3.5rem', maxWidth: '540px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ marginTop: 0 }}>Quiz Unavailable</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            This quiz could not be loaded or is no longer accepting answers.
          </p>
          <Link to="/create" className="btn btn-primary">
            {t.createBtn}
          </Link>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIdx];
  const selectedId = answers[question.id] || '';
  const customVal = customTexts[question.id] || '';
  const isLast = currentIdx === quiz.questions.length - 1;
  const pct = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);
  const fixedOptions = question.options.slice(0, 3);

  const validateCurrentStep = (): boolean => {
    if (currentIdx === 0 && !nickname.trim()) {
      setErrorMsg('Please enter your name or nickname first.');
      return false;
    }
    if (!selectedId) {
      setErrorMsg('Please select an answer or write your own.');
      return false;
    }
    if (selectedId === 'opt_4' && !customVal.trim()) {
      setErrorMsg('Please type your custom answer in the box.');
      return false;
    }
    return true;
  };

  const handleFinish = async () => {
    if (!validateCurrentStep() || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await api.submitQuizAnswers({
        slug: quiz.slug,
        participantNickname: nickname,
        answers,
        customTexts,
        lang,
      });
      navigate(`/result/${result.submissionId}?token=${encodeURIComponent(result.resultToken)}`, {
        state: { result },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '660px' }}>
      <div className="card card-elevated">
        {currentIdx === 0 && (
          <div
            className="form-group"
            style={{
              paddingBottom: '1rem',
              marginBottom: '1.15rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <label className="form-label">{t.nicknameLabel}</label>
            <input
              className="form-input"
              placeholder={t.nicknamePlaceholder}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        )}

        <div style={{ marginBottom: '1.15rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.35rem',
            }}
          >
            <span>
              {t.questionLabel} {currentIdx + 1} / {quiz.questions.length}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <h2 style={{ fontSize: '1.28rem', marginTop: 0, marginBottom: '1.15rem' }}>
          {question.questionText}
        </h2>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* 3 Predefined Options */}
          {fixedOptions.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAnswers((prev) => ({ ...prev, [question.id]: opt.id }));
                }}
                className={`option-choice ${isSelected ? 'selected' : ''}`}
              >
                <span>{opt.text}</span>
                {isSelected && <CheckCircle2 size={19} color="var(--primary)" />}
              </button>
            );
          })}

          {/* 4th Write-Your-Own Option */}
          <div
            onClick={() => {
              setErrorMsg(null);
              setAnswers((prev) => ({ ...prev, [question.id]: 'opt_4' }));
            }}
            style={{
              padding: '0.85rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border:
                selectedId === 'opt_4'
                  ? '2px solid var(--primary)'
                  : '1.5px dashed var(--border)',
              background: selectedId === 'opt_4' ? 'var(--primary-soft)' : '#faf8ff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.45rem',
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--primary)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={16} /> {t.writeOwnLabel}
              </span>
              {selectedId === 'opt_4' && <CheckCircle2 size={19} color="var(--primary)" />}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder={t.writeOwnPlaceholder}
              value={customVal}
              onFocus={() => {
                setErrorMsg(null);
                setAnswers((prev) => ({ ...prev, [question.id]: 'opt_4' }));
              }}
              onChange={(e) => {
                setErrorMsg(null);
                setAnswers((prev) => ({ ...prev, [question.id]: 'opt_4' }));
                setCustomTexts((prev) => ({ ...prev, [question.id]: e.target.value }));
              }}
              style={{ background: '#ffffff' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={currentIdx === 0}
            onClick={() => {
              setErrorMsg(null);
              setCurrentIdx((i) => i - 1);
            }}
          >
            {t.backBtn}
          </button>

          {!isLast ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (!validateCurrentStep()) return;
                setErrorMsg(null);
                setCurrentIdx((i) => i + 1);
              }}
            >
              {t.nextBtn}
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              className="btn btn-primary"
              onClick={handleFinish}
            >
              {t.finishBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 5. RESULT PAGE, LEADERBOARD & SCORE CARD PNG GENERATOR
 * ============================================================================ */
const ResultPage: React.FC = () => {
  const { submissionId = '' } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { lang, t } = useLang();
  const token = searchParams.get('token') || '';

  const [result, setResult] = useState<SubmissionResult | null>(
    (location.state as any)?.result || null
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [copiedScore, setCopiedScore] = useState(false);

  useEffect(() => {
    if (!result) {
      api.getSubmissionResult(submissionId, token).then((res) => {
        setResult(res);
      });
    }
  }, [submissionId, token, result]);

  useEffect(() => {
    if (result?.quizSlug) {
      api.getPublicQuizBySlug(result.quizSlug, lang).then((res) => {
        if (res.status === 'ok' && res.quiz) {
          setLeaderboard(res.quiz.leaderboard || []);
          setTotalParticipants(res.quiz.totalParticipants || res.quiz.leaderboard?.length || 0);
        }
      });
    }
  }, [result, lang]);

  if (!result) {
    return (
      <div className="container" style={{ paddingTop: '3.5rem', textAlign: 'center' }}>
        <div className="card">
          <h1>Private Score Protected</h1>
          <Link to="/create" className="btn btn-primary">
            {t.createBtn}
          </Link>
        </div>
      </div>
    );
  }

  const fb = getScoreFeedback(result.scorePercentage, lang);
  const quizUrl = `${window.location.origin}/q/${result.quizSlug}`;
  const shareText = `I scored ${result.score}/${result.totalQuestions} (${result.scorePercentage}%) on ${result.creatorDisplayName}'s ${BRAND.name} Quiz! Can you beat my score? ${quizUrl}`;

  const downloadScoreCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#18122B';
    ctx.fillRect(0, 0, 800, 460);

    const grad = ctx.createLinearGradient(28, 28, 772, 432);
    grad.addColorStop(0, '#6D4AFF');
    grad.addColorStop(1, '#FF6B8B');
    ctx.fillStyle = grad;
    ctx.fillRect(28, 28, 744, 404);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${BRAND.name} • Official Friendship Score`, 64, 92);

    ctx.font = 'bold 68px sans-serif';
    ctx.fillText(
      `${result.score}/${result.totalQuestions} (${result.scorePercentage}%)`,
      64,
      195
    );

    ctx.fillStyle = '#F3EFFE';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(fb.title, 64, 255);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '23px sans-serif';
    ctx.fillText(
      `Player: ${result.participantNickname}  |  Quiz by: ${result.creatorDisplayName}`,
      64,
      325
    );

    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(window.location.host, 64, 385);

    const link = document.createElement('a');
    link.download = `${BRAND.name.toLowerCase()}-score.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="container animate-in" style={{ paddingTop: '2.5rem', maxWidth: '660px' }}>
      <div className="card card-elevated" style={{ textAlign: 'center' }}>
        <span className="badge">{t.scoreRevealBadge}</span>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', margin: '0.35rem 0' }}>
          {result.score} / {result.totalQuestions}
        </h1>
        <p style={{ fontWeight: 700, fontSize: '1.25rem', margin: '0.2rem 0' }}>
          {result.scorePercentage}% — {fb.title}
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{fb.subtitle}</p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
          }}
        >
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
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
              const res = await copyTextSafely(quizUrl);
              if (res.ok) {
                setCopiedScore(true);
                setTimeout(() => setCopiedScore(false), 2500);
              }
            }}
          >
            {copiedScore ? <Check size={18} /> : <Copy size={18} />}
            <span>{copiedScore ? t.copiedBtn : t.shareScoreBtn}</span>
          </button>

          <button type="button" className="btn btn-outline" onClick={downloadScoreCard}>
            <Download size={18} />
            <span>{t.downloadCardBtn}</span>
          </button>
        </div>

        {/* Display any custom written answers submitted by the player */}
        {result.customAnswers && result.customAnswers.length > 0 && (
          <div
            style={{
              textAlign: 'left',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              ✍️ {t.customAnswersTitle}:
            </strong>
            {result.customAnswers.map((item, idx) => (
              <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.questionText}:</span>{' '}
                <strong>“{item.customAnswer}”</strong>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            background: 'var(--primary-soft)',
            padding: '1.4rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.22rem' }}>{t.challengeBackTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {t.challengeBackSub}
          </p>
          <Link to="/create" className="btn btn-primary">
            {t.createBtn}
          </Link>
        </div>
      </div>

      <LeaderboardCard entries={leaderboard} totalParticipants={totalParticipants} />
      <AdBanner slotId="result-bottom" />
    </div>
  );
};

/* ============================================================================
 * 6. MY QUIZZES (PASSWORDLESS CREATOR DASHBOARD WITH WEIGHTED AVERAGE)
 * ============================================================================ */
const DashboardPage: React.FC = () => {
  const { t } = useLang();
  const [quizzes, setQuizzes] = useState<CreatorQuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [copiedQuizId, setCopiedQuizId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const list = await api.getCreatorDashboard();
      setQuizzes(list);
    } catch (error: any) {
      setErr(error.message || 'Could not load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Weighted Average Calculation across all individual submissions
  const totalSubs = quizzes.reduce((acc, q) => acc + q.submissionCount, 0);
  const totalWeightedSum = quizzes.reduce(
    (acc, q) =>
      acc + q.submissions.reduce((sAcc, sub) => sAcc + Number(sub.scorePercentage || 0), 0),
    0
  );
  const weightedAvg = totalSubs > 0 ? Math.round(totalWeightedSum / totalSubs) : 0;

  return (
    <div className="container animate-in" style={{ paddingTop: '2.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        <h1 style={{ margin: 0 }}>{t.dashboardTitle}</h1>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="button" className="btn btn-outline" onClick={load}>
            <RefreshCw size={16} />
          </button>
          <Link to="/create" className="btn btn-primary">
            + {t.navCreate}
          </Link>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.75rem' }}>
        {t.dashboardSub}
      </p>

      {err && <div className="alert-error">{err}</div>}

      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t.totalQuizzes}</span>
          <strong style={{ display: 'block', fontSize: '1.9rem' }}>{quizzes.length}</strong>
        </div>
        <div className="card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {t.totalSubmissions}
          </span>
          <strong style={{ display: 'block', fontSize: '1.9rem' }}>{totalSubs}</strong>
        </div>
        <div className="card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t.avgScore}</span>
          <strong style={{ display: 'block', fontSize: '1.9rem' }}>{weightedAvg}%</strong>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center' }}>
          Loading your quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {t.noQuizzesYet}
          </p>
          <Link to="/create" className="btn btn-primary">
            {t.createBtn}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {quizzes.map((q) => {
            const fullUrl = `${window.location.origin}/q/${q.slug}`;
            const isCopied = copiedQuizId === q.id;
            return (
              <div key={q.id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span className="badge">{q.status.toUpperCase()}</span>
                    <h3 style={{ margin: '0.35rem 0 0.15rem' }}>{q.title}</h3>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {q.questionCount} {t.questionsCount} • {q.submissionCount}{' '}
                      {t.participantsCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={async () => {
                        const res = await copyTextSafely(fullUrl);
                        if (res.ok) {
                          setCopiedQuizId(q.id);
                          setTimeout(() => setCopiedQuizId(null), 2500);
                        }
                      }}
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      <span>{isCopied ? t.copiedBtn : t.copyLinkBtn}</span>
                    </button>

                    <Link to={`/q/${q.slug}`} className="btn btn-outline">
                      {t.openQuizBtn}
                    </Link>

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={async () => {
                        try {
                          await api.toggleQuizStatus(q.id, q.status);
                          await load();
                        } catch (e: any) {
                          setErr(e.message);
                        }
                      }}
                    >
                      {q.status === 'published' ? t.pauseBtn : t.activateBtn}
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={async () => {
                        if (!window.confirm(t.confirmDeleteQuiz)) return;
                        try {
                          await api.deleteQuiz(q.id);
                          await load();
                        } catch (e: any) {
                          setErr(e.message);
                        }
                      }}
                    >
                      {t.deleteBtn}
                    </button>
                  </div>
                </div>

                {q.submissions.length > 0 && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <strong
                      style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.6rem' }}
                    >
                      {t.recentSubmissions}
                    </strong>
                    <div className="grid-2">
                      {q.submissions.map((s) => (
                        <div
                          key={s.submissionId}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <strong>{s.participantNickname}</strong>
                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                              {s.score}/{s.totalQuestions} ({Math.round(Number(s.scorePercentage))}
                              %)
                            </span>
                          </div>
                          {s.customAnswers && s.customAnswers.length > 0 && (
                            <div
                              style={{
                                marginTop: '0.45rem',
                                paddingTop: '0.45rem',
                                borderTop: '1px dashed var(--border)',
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {s.customAnswers.map((ca, idx) => (
                                <div key={idx}>
                                  ✍️ <em>{ca.questionText}:</em>{' '}
                                  <strong style={{ color: 'var(--text-main)' }}>
                                    “{ca.customAnswer}”
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 7. SITE-OWNER ADMIN PANEL (/admin)
 * ============================================================================ */
const AdminPage: React.FC = () => {
  const { t } = useLang();
  const [passkey, setPasskey] = useState(() => getSavedAdminKey());
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAdmin = async (keyToUse: string) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.adminGetDashboard(keyToUse);
      setData(res);
      setUnlocked(true);
      saveAdminKey(keyToUse);
    } catch (error: any) {
      setErr(error.message || 'Invalid Admin Passkey.');
      setUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passkey) {
      loadAdmin(passkey);
    }
  }, []);

  if (!unlocked || !data) {
    return (
      <div className="container animate-in" style={{ paddingTop: '3.5rem', maxWidth: '460px' }}>
        <div className="card card-elevated">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Lock size={22} color="var(--primary)" />
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t.adminTitle}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Enter your server-verified Admin Passkey to moderate all quizzes, submissions, and abuse
            reports.
          </p>
          {err && <div className="alert-error">{err}</div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadAdmin(passkey);
            }}
          >
            <div className="form-group">
              <label className="form-label">Admin Passkey *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter Admin Passkey"
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Verifying...' : 'Unlock Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredQuizzes = data.quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.creatorDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container animate-in" style={{ paddingTop: '2.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ margin: 0 }}>{t.adminTitle}</h1>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => loadAdmin(passkey)}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              saveAdminKey('');
              setPasskey('');
              setUnlocked(false);
              setData(null);
            }}
          >
            Lock Admin
          </button>
        </div>
      </div>

      {err && <div className="alert-error">{err}</div>}

      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Total Cloud Quizzes</span>
          <strong style={{ display: 'block', fontSize: '2rem' }}>{data.totalQuizzes}</strong>
        </div>
        <div className="card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Total Friend Submissions
          </span>
          <strong style={{ display: 'block', fontSize: '2rem' }}>{data.totalSubmissions}</strong>
        </div>
        <div className="card">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Open Abuse Reports</span>
          <strong
            style={{
              display: 'block',
              fontSize: '2rem',
              color: data.openReports > 0 ? 'var(--danger)' : 'var(--success)',
            }}
          >
            {data.openReports}
          </strong>
        </div>
      </div>

      {/* Abuse Reports Moderation Queue */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Abuse Reports Queue</h2>
        {data.reports.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No abuse reports submitted.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.reports.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <span className="badge">{r.status.toUpperCase()}</span>{' '}
                  <strong>{r.reason}</strong>
                  {r.quizSlug && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>
                      ({r.quizSlug})
                    </span>
                  )}
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)' }}>
                    {r.details}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  {r.status !== 'resolved' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={async () => {
                        await api.adminResolveReport(passkey, r.id, 'resolved');
                        await loadAdmin(passkey);
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={async () => {
                      await api.adminResolveReport(passkey, r.id, 'delete');
                      await loadAdmin(passkey);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Quizzes Management */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>All Published Quizzes</h2>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              className="form-input"
              placeholder="Search title, creator, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredQuizzes.map((q) => (
            <div
              key={q.id}
              style={{
                padding: '0.9rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span className="badge">{q.status.toUpperCase()}</span>{' '}
                <strong>{q.title}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  By: {q.creatorDisplayName} • Slug: <code>/q/{q.slug}</code> • Plays:{' '}
                  {q.submissionCount}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                <Link to={`/q/${q.slug}`} className="btn btn-outline">
                  View
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    const nextAction = q.status === 'published' ? 'disable' : 'publish';
                    await api.adminManageQuiz(passkey, q.id, nextAction);
                    await loadAdmin(passkey);
                  }}
                >
                  {q.status === 'published' ? 'Pause' : 'Publish'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    if (!window.confirm('Delete this quiz permanently?')) return;
                    await api.adminManageQuiz(passkey, q.id, 'delete');
                    await loadAdmin(passkey);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 8. GUIDES, REPORT ABUSE FORM & LEGAL PAGES
 * ============================================================================ */
const GuidesPage: React.FC = () => {
  const { lang } = useLang();
  return (
    <div className="container animate-in" style={{ paddingTop: '2.5rem', maxWidth: '820px' }}>
      <h1>
        {lang === 'bn'
          ? 'ফ্রেন্ডশিপ গাইড এবং সেরা কুইজ আইডিয়া'
          : 'Friendship Guides & Quiz Inspiration'}
      </h1>
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2>
          {lang === 'bn'
            ? 'সেরা বন্ধুকে জিজ্ঞাসা করার মতো দারুণ কিছু প্রশ্ন'
            : 'Best Scenario Questions to Ask Your Close Friends'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'bn'
            ? 'শুধু প্রিয় রঙ বা প্রিয় খাবারের মধ্যে সীমাবদ্ধ না থেকে পরিস্থিতি-ভিত্তিক প্রশ্ন করুন—যেমন: হঠাৎ আড্ডার প্ল্যান ক্যানসেল হলে আমি কী করি? এতে বোঝা যায় আপনার বন্ধু আপনাকে কতটা মনোযোগ দিয়ে চেনে।'
            : 'Instead of basic trivia like favorite colors, ask scenario-based questions about how you react when plans change or how you recharge after a busy week.'}
        </p>
      </div>
      <div className="card">
        <h2>
          {lang === 'bn'
            ? 'দূরের বন্ধুদের সাথে সম্পর্ক সতেজ রাখার উপায়'
            : 'Staying Connected with Long-Distance Friends'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'bn'
            ? 'ব্যস্ততার কারণে প্রতিদিন কথা না হলেও ছোট একটি ৫-প্রশ্নের কুইজ লিংক পাঠিয়ে সহজেই পুরনো স্মৃতি ও হাসির আড্ডা ফিরিয়ে আনা যায়।'
            : 'Quick 5-question quizzes let busy friends across different cities share a laugh on their own schedule.'}
        </p>
      </div>

      <AdBanner slotId="guides-bottom" />
    </div>
  );
};

const ReportAbusePage: React.FC = () => {
  const { t } = useLang();
  const [slug, setSlug] = useState('');
  const [reason, setReason] = useState('harassment');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="container animate-in" style={{ paddingTop: '2.5rem', maxWidth: '620px' }}>
      <div className="card card-elevated">
        <h1 style={{ marginTop: 0 }}>{t.reportTitle}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t.reportSub}</p>

        {done ? (
          <div className="alert-success">{t.reportSuccess}</div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErr(null);
              try {
                await api.submitAbuseReport(slug, reason, details);
                setDone(true);
              } catch (error: any) {
                setErr(error.message);
              }
            }}
          >
            {err && <div className="alert-error">{err}</div>}
            <div className="form-group">
              <label className="form-label">{t.reportSlugLabel}</label>
              <input
                className="form-input"
                placeholder="e.g., /q/ahad-bff-xyz"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.reportReasonLabel}</label>
              <select
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="harassment">Harassment or Bullying</option>
                <option value="privacy">Private Information Exposed</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="spam">Spam or Misleading Link</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t.reportDetailsLabel}</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {t.reportSubmitBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const SimpleInfoPage: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="container animate-in" style={{ paddingTop: '2.5rem', maxWidth: '720px' }}>
    <div className="card">
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>{text}</p>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());

  return (
    <LangContext.Provider value={{ lang, setLang, t: COPY[lang] }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateQuizPage />} />
            <Route path="/q/:slug" element={<PublicQuizPage />} />
            <Route path="/q/:slug/play" element={<PlayQuizPage />} />
            <Route path="/result/:submissionId" element={<ResultPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/report" element={<ReportAbusePage />} />
            <Route
              path="/about"
              element={
                <SimpleInfoPage
                  title={`About ${BRAND.name}`}
                  text={`${BRAND.name} is a minimalist, privacy-first friendship quiz platform supporting instant English and Bangla gameplay without requiring friends to sign up.`}
                />
              }
            />
            <Route
              path="/privacy"
              element={
                <SimpleInfoPage
                  title="Privacy Policy"
                  text="We store only the quiz questions you publish and the nickname/score of participating friends. Answer keys remain isolated on the server, and creators can delete their quizzes anytime."
                />
              }
            />
            <Route
              path="/terms"
              element={
                <SimpleInfoPage
                  title="Terms & Community Guidelines"
                  text="Quizzes are playful social games. Harassment, bullying, or sharing private personal information is strictly prohibited."
                />
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LangContext.Provider>
  );
};
