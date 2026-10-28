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
  RefreshCw,
  Edit3,
  Users,
  Compass,
  Inbox,
  User,
  Home,
  Flag,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  BRAND,
  COPY,
  TEMPLATES,
  GAME_MODES,
  GAME_PRESETS,
  BADGES,
  Lang,
  GameType,
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
  AmaInboxData,
  WrappedRecapData,
  DailyQuestStatus,
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
 * LIQUID GLASS VECTOR ART HELPER (Uses <symbol> defs from index.html)
 * ============================================================================ */
const GlassArt: React.FC<{ name: string; size?: number; className?: string }> = ({
  name,
  size = 44,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    className={className}
    style={{ flexShrink: 0, display: 'block' }}
    aria-hidden="true"
  >
    <use href={`#${name}`} />
  </svg>
);

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
          style={{ color: 'var(--lav)', fontWeight: 600 }}
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
 * REUSABLE DIRECT LINK COPY BOX
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
    `${shareTitle ? `${shareTitle} — ` : ''}Play my ${BRAND.name} game! ${url}`
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
            flex: '1 1 220px',
            fontWeight: 600,
            color: 'var(--cy)',
          }}
        />
        <button type="button" className="b" onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={18} /> : <Copy size={18} />}
          <span>{copyState === 'copied' ? t.copiedBtn : t.copyLinkBtn}</span>
        </button>
      </div>

      {copyState === 'manual' && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--cy)',
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
          className="b btn-whatsapp"
        >
          <MessageCircle size={18} />
          <span>{t.whatsappShareBtn}</span>
        </a>

        <button
          type="button"
          className="b o"
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
 * LIQUID GLASS PODIUM LEADERBOARD
 * ============================================================================ */
const LeaderboardCard: React.FC<{
  entries?: LeaderboardEntry[];
  totalParticipants?: number;
}> = ({ entries = [], totalParticipants }) => {
  const { t } = useLang();
  const count = typeof totalParticipants === 'number' ? totalParticipants : entries.length;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <div className="g" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
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
          <Trophy size={20} color="var(--lav)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t.leaderboardTitle}</h3>
        </div>
        <span className="t">
          <Users size={13} /> {count} {t.participantsCount}
        </span>
      </div>
      <p style={{ color: 'var(--t3)', fontSize: '0.84rem', marginTop: 0 }}>{t.leaderboardSub}</p>

      {entries.length === 0 ? (
        <div
          style={{
            padding: '1.4rem',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.15)',
            textAlign: 'center',
            color: 'var(--t2)',
          }}
        >
          {t.leaderboardEmpty}
        </div>
      ) : (
        <>
          {/* Concept Board 2-1-3 Podium Bars */}
          <div className="pod">
            <div className="a2">
              <span style={{ fontSize: '1.1rem' }}>🥈 2</span>
              {second ? (
                <>
                  <small
                    style={{
                      fontSize: '0.78rem',
                      marginTop: '0.25rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {second.participantNickname}
                  </small>
                  <small style={{ color: 'var(--cy)', fontSize: '0.75rem' }}>
                    {Math.round(Number(second.scorePercentage))}%
                  </small>
                </>
              ) : (
                <small style={{ color: 'var(--t3)', fontSize: '0.75rem' }}>—</small>
              )}
            </div>

            <div className="a1">
              <span style={{ fontSize: '1.25rem' }}>🥇 1</span>
              {first && (
                <>
                  <small
                    style={{
                      fontSize: '0.84rem',
                      marginTop: '0.25rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {first.participantNickname}
                  </small>
                  <small style={{ color: '#fde68a', fontSize: '0.8rem' }}>
                    {Math.round(Number(first.scorePercentage))}%
                  </small>
                </>
              )}
            </div>

            <div className="a3">
              <span style={{ fontSize: '1.05rem' }}>🥉 3</span>
              {third ? (
                <>
                  <small
                    style={{
                      fontSize: '0.76rem',
                      marginTop: '0.2rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {third.participantNickname}
                  </small>
                  <small style={{ color: 'var(--pk)', fontSize: '0.74rem' }}>
                    {Math.round(Number(third.scorePercentage))}%
                  </small>
                </>
              ) : (
                <small style={{ color: 'var(--t3)', fontSize: '0.75rem' }}>—</small>
              )}
            </div>
          </div>

          <div className="leaderboard-list">
            {entries.map((item, idx) => {
              const pct = Math.round(Number(item.scorePercentage));
              return (
                <div key={item.submissionId || idx} className="leaderboard-row">
                  <div className="leaderboard-row-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span className={`n ${idx === 0 ? 'on' : ''}`}>{idx + 1}</span>
                      <strong>{item.participantNickname}</strong>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--lav)' }}>
                      {item.score}/{item.totalQuestions} ({pct}%)
                    </div>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${pct}%` }} />
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
 * 1. LIQUID GLASS SHELL, DESKTOP PILL NAV & MOBILE FLOATING DOCK
 * ============================================================================ */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    document.title = `${BRAND.name} — ${t.heroTitle1} ${t.heroTitle2}`;
  }, [lang, t]);

  const handleSwitch = (next: Lang) => {
    setLang(next);
    saveLang(next);
  };

  const isHome = path === '/';
  const isExplore = path.startsWith('/explore') || path.startsWith('/daily');
  const isCreate = path.startsWith('/create');
  const isInbox = path.startsWith('/inbox') || path.startsWith('/ama');
  const isProfile = path.startsWith('/dashboard') || path.startsWith('/wrapped');

  return (
    <div className="liquid-shell">
      {api.isDemoMode && <div className="demo-bar">{t.demoBanner}</div>}

      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-link">
            <i className="brand-orb" />
            <span>{BRAND.name}</span>
          </Link>

          <nav className="desktop-pill-nav" aria-label="Main Navigation">
            <Link to="/" className={`pill-nav-link ${isHome ? 'active' : ''}`}>
              {t.navHome}
            </Link>
            <Link to="/explore" className={`pill-nav-link ${isExplore ? 'active' : ''}`}>
              {t.navExplore}
            </Link>
            <Link to="/create" className="pill-nav-link create-cta">
              + {t.navCreate}
            </Link>
            <Link to="/inbox" className={`pill-nav-link ${isInbox ? 'active' : ''}`}>
              {t.navInbox}
            </Link>
            <Link to="/dashboard" className={`pill-nav-link ${isProfile ? 'active' : ''}`}>
              {t.navProfile}
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
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
          </div>
        </div>
      </header>

      <main style={{ flex: 1, paddingBottom: '6.5rem' }}>{children}</main>

      {/* Mobile Floating Liquid Glass Bottom Dock */}
      <div className="mobile-dock-wrap">
        <nav className="mobile-dock" aria-label="Mobile Bottom Navigation">
          <Link to="/" className={`dock-item ${isHome ? 'active' : ''}`}>
            <Home size={20} />
            <span>{t.navHome}</span>
          </Link>
          <Link to="/explore" className={`dock-item ${isExplore ? 'active' : ''}`}>
            <Compass size={20} />
            <span>{t.navExplore}</span>
          </Link>
          <Link to="/create" className={`dock-item ${isCreate ? 'active' : ''}`}>
            <span className="dock-plus-btn">
              <Plus size={24} />
            </span>
            <span style={{ color: '#fff' }}>{t.navCreate}</span>
          </Link>
          <Link to="/inbox" className={`dock-item ${isInbox ? 'active' : ''}`}>
            <span className="unread-dot" />
            <Inbox size={20} />
            <span>{t.navInbox}</span>
          </Link>
          <Link to="/dashboard" className={`dock-item ${isProfile ? 'active' : ''}`}>
            <User size={20} />
            <span>{t.navProfile}</span>
          </Link>
        </nav>
      </div>

      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '2.2rem 0 6rem',
          marginTop: 'auto',
          color: 'var(--t2)',
          fontSize: '0.86rem',
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
              marginBottom: '0.8rem',
            }}
          >
            <span className="brand-link" style={{ fontSize: '1rem' }}>
              <i className="brand-orb" style={{ width: 20, height: 20 }} />
              {BRAND.name}
            </span>
            <div style={{ display: 'flex', gap: '1.15rem', flexWrap: 'wrap' }}>
              <Link to="/explore">{t.navExplore}</Link>
              <Link to="/daily">Daily Quest</Link>
              <Link to="/wrapped">Wrapped</Link>
              <Link to="/guides">{t.navGuides}</Link>
              <Link to="/privacy">Privacy</Link>
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
                <ShieldAlert size={14} /> Report
              </Link>
              <Link to="/admin" style={{ color: 'var(--t3)' }}>
                Admin
              </Link>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              color: 'var(--t3)',
              fontSize: '0.8rem',
            }}
          >
            <span>
              © {new Date().getFullYear()} {BRAND.name}
            </span>
            <span>{t.footerNote}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ============================================================================
 * 2. LIQUID GLASS HOMEPAGE (Inspired by Concept Board)
 * ============================================================================ */
const HomePage: React.FC = () => {
  const { lang, t } = useLang();
  const sampleQ = TEMPLATES[lang][0].questions[0];
  const featuredTemplates = TEMPLATES[lang].slice(0, 3);

  return (
    <div className="container animate-in" style={{ paddingTop: '1.75rem' }}>
      {/* Hero Section */}
      <section
        className="grid-2"
        style={{ alignItems: 'center', gap: '2rem', padding: '1rem 0 2.5rem' }}
      >
        <div>
          <span className="t">
            <Sparkles size={13} /> {t.tagline}
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.35rem, 6.5vw, 4.1rem)',
              lineHeight: 1.03,
              letterSpacing: '-0.035em',
              fontWeight: 800,
              margin: '0.9rem 0',
            }}
          >
            {t.heroTitle1}
            <br />
            <span className="gr">{t.heroTitle2}</span>
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--t2)',
              maxWidth: '460px',
              marginBottom: '1.6rem',
            }}
          >
            {t.heroSub}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            <Link to="/create" className="b" style={{ minHeight: '50px', padding: '0 1.75rem' }}>
              {t.createBtn}
            </Link>
            <Link to="/explore" className="b o" style={{ minHeight: '50px', padding: '0 1.6rem' }}>
              {t.exploreBtn}
            </Link>
          </div>
        </div>

        {/* Hero Visual Orbit & Floating Glass Preview Card */}
        <div
          style={{
            position: 'relative',
            minHeight: '390px',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              opacity: 0.9,
              pointerEvents: 'none',
            }}
          >
            <GlassArt name="hero2" size={380} />
          </div>

          <div
            className="g card-elevated"
            style={{
              position: 'relative',
              zIndex: 2,
              width: 'min(330px, 92%)',
              transform: 'rotate(-2deg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="lab">{t.questionLabel} 1 / 5</span>
              <span className="t">Preview</span>
            </div>
            <div className="bar">
              <i style={{ width: '35%' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.02rem', margin: '0.2rem 0' }}>
              {sampleQ.questionText}
            </p>
            <div className="o">{sampleQ.options[0].text}</div>
            <div className="o on">{sampleQ.options[1].text}</div>
            <div className="o">{sampleQ.options[2].text}</div>
            <Link
              to="/q/sample-best-friend-quiz"
              className="b btn-sm"
              style={{ marginTop: '0.25rem' }}
            >
              {t.sampleBtn}
            </Link>
          </div>

          <div
            className="g"
            style={{
              position: 'absolute',
              top: '6%',
              right: '2%',
              zIndex: 3,
              padding: '0.6rem 0.95rem',
              borderRadius: '18px',
              transform: 'rotate(4deg)',
            }}
          >
            <span className="lab" style={{ display: 'block' }}>
              Match
            </span>
            <b className="gr" style={{ fontSize: '1.35rem' }}>
              92%
            </b>
          </div>

          <div
            className="g"
            style={{
              position: 'absolute',
              bottom: '4%',
              left: '4%',
              zIndex: 3,
              padding: '0.55rem 0.9rem',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              transform: 'rotate(-3deg)',
            }}
          >
            <GlassArt name="bubble" size={24} />
            <span>Share with one link</span>
          </div>
        </div>
      </section>

      {/* Quick Actions Trio */}
      <section className="grid-3" style={{ marginBottom: '2.75rem' }}>
        <Link
          to="/create"
          className="g"
          style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}
        >
          <GlassArt name="bubble" size={44} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t.qaCreateTitle}</h3>
            <p style={{ margin: 0, color: 'var(--t2)', fontSize: '0.84rem' }}>{t.qaCreateSub}</p>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '1.3rem' }}>›</span>
        </Link>

        <Link
          to="/explore"
          className="g"
          style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}
        >
          <GlassArt name="sun" size={44} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t.qaPlayTitle}</h3>
            <p style={{ margin: 0, color: 'var(--t2)', fontSize: '0.84rem' }}>{t.qaPlaySub}</p>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '1.3rem' }}>›</span>
        </Link>

        <Link
          to="/wrapped"
          className="g"
          style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}
        >
          <GlassArt name="spark" size={44} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t.qaShareTitle}</h3>
            <p style={{ margin: 0, color: 'var(--t2)', fontSize: '0.84rem' }}>{t.qaShareSub}</p>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '1.3rem' }}>›</span>
        </Link>
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>{t.howItWorksTitle}</h2>
        <div className="grid-3">
          {[
            { num: '1', title: t.step1Title, desc: t.step1Desc },
            { num: '2', title: t.step2Title, desc: t.step2Desc },
            { num: '3', title: t.step3Title, desc: t.step3Desc },
          ].map((st) => (
            <div key={st.num} className="g">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  marginBottom: '0.75rem',
                }}
              >
                {st.num}
              </div>
              <h3 style={{ margin: '0 0 0.35rem' }}>{st.title}</h3>
              <p style={{ margin: 0, color: 'var(--t2)', fontSize: '0.9rem' }}>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Templates */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>{t.featuredTemplatesTitle}</h2>
        <div className="grid-3">
          {featuredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="g"
              style={{ ['--a' as any]: tpl.accent, display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  height: 104,
                  borderRadius: 18,
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '0.85rem',
                  background: `radial-gradient(70% 90% at 50% 0%, ${tpl.accent}66, transparent), rgba(255,255,255,0.04)`,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <GlassArt name={tpl.icon} size={58} />
              </div>
              <div>
                <span className="t">{tpl.badge}</span>
              </div>
              <h3 style={{ margin: '0.55rem 0 0.9rem' }}>{tpl.name}</h3>
              <Link
                to={`/create?type=quiz&tpl=${tpl.id}`}
                className="b o btn-sm"
                style={{ marginTop: 'auto' }}
              >
                {t.useTemplateBtn}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Explore All 7+1 Games Grid */}
      <section style={{ marginBottom: '2.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{t.exploreGamesTitle}</h2>
          <Link to="/explore" className="b o btn-sm">
            {t.seeAllGamesBtn}
          </Link>
        </div>

        <div className="grid-4">
          {GAME_MODES.map((gm) => (
            <Link
              key={gm.id}
              to={gm.route}
              className="g game-card"
              style={{ ['--a' as any]: gm.accent }}
            >
              <GlassArt name={gm.icon} size={44} />
              <div style={{ marginTop: '0.35rem' }}>
                <span className="t" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}>
                  {gm.badge[lang]}
                </span>
              </div>
              <h3 style={{ margin: '0.25rem 0 0.1rem', fontSize: '1.05rem' }}>{gm.title[lang]}</h3>
              <p style={{ margin: 0, color: 'var(--t2)', fontSize: '0.83rem' }}>
                {gm.subtitle[lang]}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA Glass Card */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div
          className="g card-elevated"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            padding: '1.75rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.3rem' }}>{t.ctaBannerTitle}</h3>
            <p style={{ margin: 0, color: 'var(--t2)' }}>{t.ctaBannerSub}</p>
          </div>
          <Link to="/create" className="b" style={{ minHeight: '50px', padding: '0 1.8rem' }}>
            {t.createBtn}
          </Link>
        </div>
        <AdBanner slotId="home-bottom" />
      </section>
    </div>
  );
};

/* ============================================================================
 * 3. EXPLORE GAMES PAGE (/explore) WITH SEGMENTED FILTER & SAMPLES
 * ============================================================================ */
const ExplorePage: React.FC = () => {
  const { lang, t } = useLang();
  const [filter, setFilter] = useState<'all' | 'quiz' | 'party' | 'daily'>('all');

  const sampleLinkMap: Partial<Record<GameType, string>> = {
    quiz: '/q/sample-best-friend-quiz',
    guess_side: '/q/sample-guess-side',
    two_truths: '/q/sample-two-truths',
    blind_ranking: '/q/sample-blind-ranking',
    would_you_rather: '/q/sample-would-you-rather',
  };

  const filtered = GAME_MODES.filter((g) => filter === 'all' || g.category === filter);

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '900px' }}>
      <div className="game-stage">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.2rem',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.9rem' }}>{t.exploreGamesTitle}</h1>
          <span className="t ok">8 Interactive Modes</span>
        </div>

        <div className="seg" style={{ marginBottom: '1.4rem' }}>
          <button
            type="button"
            className={filter === 'all' ? 'on' : ''}
            onClick={() => setFilter('all')}
          >
            All (8)
          </button>
          <button
            type="button"
            className={filter === 'quiz' ? 'on' : ''}
            onClick={() => setFilter('quiz')}
          >
            Quiz
          </button>
          <button
            type="button"
            className={filter === 'party' ? 'on' : ''}
            onClick={() => setFilter('party')}
          >
            Party
          </button>
          <button
            type="button"
            className={filter === 'daily' ? 'on' : ''}
            onClick={() => setFilter('daily')}
          >
            Daily & Recap
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {filtered.map((gm) => {
            const sampleUrl = sampleLinkMap[gm.id];
            return (
              <div
                key={gm.id}
                className="g"
                style={{
                  ['--a' as any]: gm.accent,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <GlassArt name={gm.icon} size={50} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{gm.title[lang]}</h3>
                      <span className="t">{gm.badge[lang]}</span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--t2)', fontSize: '0.9rem' }}>
                      {gm.subtitle[lang]}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                  {sampleUrl && (
                    <Link to={sampleUrl} className="b o btn-sm">
                      <Play size={15} /> Try Sample
                    </Link>
                  )}
                  <Link to={gm.route} className="b btn-sm">
                    {gm.isCreatable ? '+ Create' : 'Open ›'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. UNIVERSAL MULTI-GAME CREATOR (/create)
 * ============================================================================ */
const CreateQuizPage: React.FC = () => {
  const { lang, t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as GameType) || 'quiz';
  const initialTpl = searchParams.get('tpl') || '';

  const creatableModes: GameType[] = [
    'quiz',
    'guess_side',
    'two_truths',
    'blind_ranking',
    'would_you_rather',
  ];
  const activeMode: GameType = creatableModes.includes(initialType) ? initialType : 'quiz';

  const templates = TEMPLATES[lang];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTpl && templates.some((item) => item.id === initialTpl)
      ? initialTpl
      : templates[0].id
  );
  const [creatorName, setCreatorName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupVoting, setGroupVoting] = useState(true);
  const [lockPositions, setLockPositions] = useState(true);
  const [hasEdited, setHasEdited] = useState(false);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const loadModeDefaults = (mode: GameType, tplId?: string) => {
    if (mode === 'quiz') {
      const found =
        TEMPLATES[lang].find((item) => item.id === (tplId || selectedTemplateId)) ||
        TEMPLATES[lang][0];
      setSelectedTemplateId(found.id);
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
    } else if (
      mode === 'guess_side' ||
      mode === 'two_truths' ||
      mode === 'blind_ranking' ||
      mode === 'would_you_rather'
    ) {
      const preset = GAME_PRESETS[mode][lang];
      setTitle(preset.defaultTitle);
      setDescription(preset.description);
      setQuestions(
        preset.questions.map((q, idx) => ({
          ...q,
          id: `${mode}_q_${idx + 1}_${Date.now()}`,
          position: idx + 1,
          options: q.options.map((o) => ({ ...o })),
        }))
      );
    }
    setHasEdited(false);
  };

  useEffect(() => {
    loadModeDefaults(activeMode, initialTpl);
  }, [activeMode, lang]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const handleSelectMode = (mode: GameType) => {
    setPublishedSlug(null);
    setErrorMsg(null);
    setSearchParams({ type: mode });
  };

  const handleLoadQuizTemplate = (tplId: string) => {
    const found = templates.find((item) => item.id === tplId);
    if (!found) return;
    setSelectedTemplateId(found.id);
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
        gameType: activeMode,
        settings: { groupVoting, lockPositions },
        questions,
      });
      setPublishedSlug(res.slug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not publish game.');
    } finally {
      setPublishing(false);
    }
  };

  const shareUrl = publishedSlug ? `${window.location.origin}/q/${publishedSlug}` : '';
  const modeMeta = GAME_MODES.find((m) => m.id === activeMode) || GAME_MODES[0];

  if (publishedSlug) {
    return (
      <div className="container animate-in" style={{ paddingTop: '2.5rem', maxWidth: '660px' }}>
        <div
          className="game-stage"
          style={{ ['--a' as any]: modeMeta.accent, textAlign: 'center' }}
        >
          <span className="t ok" style={{ marginBottom: '0.75rem' }}>
            {t.publishedBadge} • {modeMeta.title[lang]}
          </span>
          <h1 style={{ marginTop: 0 }}>{t.publishedHeading}</h1>
          <p style={{ color: 'var(--t2)' }}>{t.publishedSub}</p>

          <DirectLinkBox url={shareUrl} shareTitle={title} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <Link to={`/q/${publishedSlug}`} className="b o">
              {t.openQuizBtn}
            </Link>
            <button
              type="button"
              className="b o"
              onClick={() => {
                setPublishedSlug(null);
              }}
            >
              + Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '900px' }}>
      <h1 style={{ marginBottom: '0.3rem' }}>{t.builderHeading}</h1>
      <p style={{ color: 'var(--t2)', marginTop: 0, marginBottom: '1.25rem' }}>{t.builderSub}</p>

      {/* Game Mode Selector Bar */}
      <div className="seg" style={{ marginBottom: '1.5rem' }}>
        {creatableModes.map((mId) => {
          const meta = GAME_MODES.find((gm) => gm.id === mId)!;
          return (
            <button
              key={mId}
              type="button"
              className={activeMode === mId ? 'on' : ''}
              onClick={() => handleSelectMode(mId)}
            >
              {meta.title[lang]}
            </button>
          );
        })}
      </div>

      {/* Template Grid for Classic Quiz */}
      {activeMode === 'quiz' && (
        <div className="g" style={{ marginBottom: '1.4rem' }}>
          <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: '0.4rem' }}>
            {t.loadTemplateLabel}
          </strong>
          <div className="template-grid">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleLoadQuizTemplate(tpl.id)}
                className={`template-pill ${selectedTemplateId === tpl.id ? 'active' : ''}`}
              >
                <span>{tpl.name}</span>
                <span className="t" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                  {tpl.badge}
                </span>
              </button>
            ))}
          </div>
          {templateNotice && (
            <div className="alert-success" style={{ marginTop: '0.85rem', marginBottom: 0 }}>
              {templateNotice}
            </div>
          )}
        </div>
      )}

      {errorMsg && <div className="alert-error">{errorMsg}</div>}

      {/* Creator & Game Details */}
      <div className="g" style={{ marginBottom: '1.4rem', ['--a' as any]: modeMeta.accent }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <GlassArt name={modeMeta.icon} size={38} />
          <div>
            <span className="t">{modeMeta.badge[lang]}</span>
            <h3 style={{ margin: '0.15rem 0 0' }}>{modeMeta.title[lang]}</h3>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">{t.yourNameLabel}</label>
            <input
              className="form-input"
              placeholder={t.yourNamePlaceholder}
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
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

        <div className="form-group" style={{ marginBottom: activeMode === 'would_you_rather' || activeMode === 'blind_ranking' ? '1rem' : 0 }}>
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

        {activeMode === 'would_you_rather' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div>
              <strong>Enable Live Group Vote Percentages</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
                Show % split between Scenario A and Scenario B on the result screen
              </div>
            </div>
            <button
              type="button"
              className={`tg ${groupVoting ? 'on' : ''}`}
              onClick={() => setGroupVoting((v) => !v)}
              aria-label="Toggle Group Voting"
            />
          </div>
        )}

        {activeMode === 'blind_ranking' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div>
              <strong>Strict Blind Lock Rule (#1 to #{questions.length})</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
                Once a player places an item into a rank slot, it cannot be moved
              </div>
            </div>
            <button
              type="button"
              className={`tg ${lockPositions ? 'on' : ''}`}
              onClick={() => setLockPositions((v) => !v)}
              aria-label="Toggle Blind Lock"
            />
          </div>
        )}
      </div>

      {/* Mode-Specific Question / Round Editors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {questions.map((q, qIdx) => (
          <div key={q.id} className="g">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span className="t">
                {activeMode === 'blind_ranking'
                  ? `Creator's True Rank #${qIdx + 1}`
                  : `${t.questionLabel} ${qIdx + 1} / ${questions.length}`}
              </span>
              {questions.length > BRAND.limits.minQuestions && (
                <button
                  type="button"
                  className="b x btn-sm"
                  onClick={() => {
                    setHasEdited(true);
                    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                {activeMode === 'blind_ranking'
                  ? `Item for Rank #${qIdx + 1} (Players will see items in shuffled order)`
                  : activeMode === 'two_truths'
                  ? 'Round Topic / Prompt'
                  : `${t.questionLabel} ${qIdx + 1}`}
              </label>
              <input
                className="form-input"
                value={q.questionText}
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

            {/* MODE A: Guess My Side OR Would You Rather (2 Big Choices) */}
            {(activeMode === 'guess_side' || activeMode === 'would_you_rather') && (
              <>
                <div className="form-label" style={{ marginBottom: '0.45rem' }}>
                  {activeMode === 'guess_side'
                    ? 'Enter 2 Sides & Tap the Circle for YOUR Side *'
                    : 'Enter Scenario A & Scenario B (Tap your own preferred pick) *'}
                </div>
                <div className="grid-2">
                  {[0, 1].map((optIdx) => {
                    const optId = optIdx === 0 ? 'opt_1' : 'opt_2';
                    const opt = q.options[optIdx] || { id: optId, text: '' };
                    const isSelected = q.correctOptionId === optId;
                    return (
                      <div
                        key={optId}
                        className={`o ${isSelected ? 'on' : ''}`}
                        style={{ padding: '0.55rem 0.85rem' }}
                      >
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={isSelected}
                          onChange={() => {
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, correctOptionId: optId } : item
                              )
                            );
                          }}
                          style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                        />
                        <input
                          className="form-input"
                          placeholder={optIdx === 0 ? 'Side / Scenario A' : 'Side / Scenario B'}
                          style={{ border: 'none', background: 'transparent' }}
                          value={opt.text}
                          onChange={(e) => {
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx
                                  ? {
                                      ...item,
                                      options: item.options.map((o, oI) =>
                                        oI === optIdx ? { ...o, text: e.target.value } : o
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
                </div>
              </>
            )}

            {/* MODE B: Two Truths & One Lie (3 Statements, radio selects THE LIE) */}
            {activeMode === 'two_truths' && (
              <>
                <div className="form-label" style={{ marginBottom: '0.45rem', color: '#fcd34d' }}>
                  Write 2 Truths and 1 Lie — Select the circle next to THE LIE *
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[0, 1, 2].map((optIdx) => {
                    const optId = `opt_${optIdx + 1}`;
                    const opt = q.options[optIdx] || { id: optId, text: '' };
                    const isLie = q.correctOptionId === optId;
                    return (
                      <div
                        key={optId}
                        className={`o ${isLie ? 'bad' : 'good'}`}
                        style={{ padding: '0.5rem 0.85rem' }}
                      >
                        <input
                          type="radio"
                          name={`lie_${q.id}`}
                          checked={isLie}
                          onChange={() => {
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, correctOptionId: optId } : item
                              )
                            );
                          }}
                          style={{ width: 18, height: 18, accentColor: '#f87171' }}
                        />
                        <span className="t" style={{ minWidth: 64, justifyContent: 'center' }}>
                          {isLie ? 'LIE ✕' : 'TRUTH ✓'}
                        </span>
                        <input
                          className="form-input"
                          placeholder={`Statement ${optIdx + 1}`}
                          style={{ border: 'none', background: 'transparent' }}
                          value={opt.text}
                          onChange={(e) => {
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx
                                  ? {
                                      ...item,
                                      options: item.options.map((o, oI) =>
                                        oI === optIdx ? { ...o, text: e.target.value } : o
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
                </div>
              </>
            )}

            {/* MODE C: Classic Friendship Quiz (3 Fixed + 1 Write-in Slot) */}
            {activeMode === 'quiz' && (
              <>
                <div className="form-label" style={{ marginBottom: '0.45rem' }}>
                  {t.selectTrueAnswer}
                </div>
                <div className="grid-2">
                  {q.options.slice(0, 3).map((opt, optIdx) => {
                    const isSelected = q.correctOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`o ${isSelected ? 'on' : ''}`}
                        style={{ padding: '0.4rem 0.75rem' }}
                      >
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={isSelected}
                          onChange={() => {
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, correctOptionId: opt.id } : item
                              )
                            );
                          }}
                          style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                        />
                        <input
                          className="form-input"
                          placeholder={`Option ${optIdx + 1}`}
                          style={{ border: 'none', background: 'transparent', padding: '0.2rem' }}
                          value={opt.text}
                          onChange={(e) => {
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

                  {/* 4th Write-in Slot */}
                  {(() => {
                    const isCustomSelected = q.correctOptionId === 'opt_4';
                    return (
                      <div
                        className={`o ${isCustomSelected ? 'on' : ''}`}
                        style={{
                          padding: '0.55rem 0.85rem',
                          borderStyle: isCustomSelected ? 'solid' : 'dashed',
                        }}
                      >
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={isCustomSelected}
                          onChange={() => {
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, correctOptionId: 'opt_4' } : item
                              )
                            );
                          }}
                          style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                        />
                        <div style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>
                          <strong style={{ color: 'var(--cy)', display: 'block' }}>
                            ✍️ {t.writeOwnLabel}
                          </strong>
                          <span>{t.customSlotHint}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
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
          className="b o"
          onClick={() => {
            if (questions.length >= BRAND.limits.maxQuestions) return;
            const nextPos = questions.length + 1;
            setQuestions((prev) => [
              ...prev,
              {
                id: `q_${Date.now()}`,
                position: nextPos,
                questionText: '',
                options:
                  activeMode === 'guess_side' || activeMode === 'would_you_rather'
                    ? [
                        { id: 'opt_1', text: '', icon: 'sun' },
                        { id: 'opt_2', text: '', icon: 'moon' },
                      ]
                    : activeMode === 'two_truths'
                    ? [
                        { id: 'opt_1', text: '' },
                        { id: 'opt_2', text: '' },
                        { id: 'opt_3', text: '' },
                      ]
                    : [
                        { id: 'opt_1', text: '' },
                        { id: 'opt_2', text: '' },
                        { id: 'opt_3', text: '' },
                        { id: 'opt_4', text: t.writeOwnPlaceholder, isCustom: true },
                      ],
                correctOptionId: activeMode === 'blind_ranking' ? `opt_${nextPos}` : 'opt_1',
              },
            ]);
          }}
        >
          <Plus size={18} />
          <span>{t.addQuestionBtn}</span>
        </button>

        <button type="button" disabled={publishing} onClick={handlePublish} className="b">
          {publishing ? t.publishingBtn : t.publishBtn}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 5. PUBLIC GAME LANDING & MULTI-MODE PLAYER (/q/:slug & /q/:slug/play)
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
        setErrMsg(err.message || 'Network error.');
      });
  }, [slug, lang]);

  if (status === 'loading') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (status !== 'ok' || !quiz) {
    return (
      <div className="container animate-in" style={{ paddingTop: '3.5rem', maxWidth: '540px' }}>
        <div className="g" style={{ textAlign: 'center' }}>
          <h1 style={{ marginTop: 0 }}>Game Unavailable</h1>
          <p style={{ color: 'var(--t2)' }}>
            {errMsg || 'This game link may have been paused or deleted.'}
          </p>
          <Link to="/explore" className="b">
            {t.exploreBtn}
          </Link>
        </div>
      </div>
    );
  }

  const modeMeta = GAME_MODES.find((m) => m.id === (quiz.gameType || 'quiz')) || GAME_MODES[0];

  return (
    <div className="container animate-in" style={{ paddingTop: '2.2rem', maxWidth: '660px' }}>
      <div
        className="game-stage"
        style={{ ['--a' as any]: modeMeta.accent, textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <GlassArt name={modeMeta.icon} size={64} />
        </div>
        <span className="t" style={{ marginBottom: '0.75rem' }}>
          {modeMeta.title[lang]} • {t.invitedBy} {quiz.creatorDisplayName}
        </span>
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{quiz.title}</h1>
        {quiz.description && (
          <p style={{ color: 'var(--t2)', marginBottom: '1.25rem' }}>{quiz.description}</p>
        )}
        <p style={{ fontWeight: 600, color: 'var(--lav)', marginBottom: '1.5rem' }}>
          {quiz.questions.length} {t.questionsCount} • {t.noAccountNeeded}
        </p>
        <Link to={`/q/${quiz.slug}/play`} className="b" style={{ minWidth: '240px' }}>
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
      .catch(() => setLoadStatus('error'));
  }, [slug, lang]);

  if (loadStatus === 'loading') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        Loading game...
      </div>
    );
  }

  if (loadStatus !== 'ok' || !quiz) {
    return (
      <div className="container animate-in" style={{ paddingTop: '3.5rem', maxWidth: '540px' }}>
        <div className="g" style={{ textAlign: 'center' }}>
          <h1 style={{ marginTop: 0 }}>Game Unavailable</h1>
          <Link to="/explore" className="b">
            {t.exploreBtn}
          </Link>
        </div>
      </div>
    );
  }

  const gameType: GameType = quiz.gameType || 'quiz';
  const modeMeta = GAME_MODES.find((m) => m.id === gameType) || GAME_MODES[0];
  const question = quiz.questions[currentIdx];
  const selectedId = answers[question.id] || '';
  const customVal = customTexts[question.id] || '';
  const isLast = currentIdx === quiz.questions.length - 1;
  const pct = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);

  // Used slots in Blind Ranking so locked slots cannot be overwritten
  const lockedSlotMap: Record<string, string> = {};
  if (gameType === 'blind_ranking') {
    quiz.questions.forEach((qItem) => {
      const chosenSlot = answers[qItem.id];
      if (chosenSlot) {
        lockedSlotMap[chosenSlot] = qItem.questionText;
      }
    });
  }

  const validateCurrentStep = (): boolean => {
    if (currentIdx === 0 && !nickname.trim()) {
      setErrorMsg('Please enter your name or nickname first.');
      return false;
    }
    if (!selectedId) {
      setErrorMsg('Please make a selection to continue.');
      return false;
    }
    if (selectedId === 'opt_4' && gameType === 'quiz' && !customVal.trim()) {
      setErrorMsg('Please type your custom answer in the box.');
      return false;
    }
    return true;
  };

  const handleFinish = async (overrideAnswers?: Record<string, string>) => {
    const finalAnswers = overrideAnswers || answers;
    if (!overrideAnswers && !validateCurrentStep()) return;
    if (submitting) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await api.submitQuizAnswers({
        slug: quiz.slug,
        participantNickname: nickname,
        answers: finalAnswers,
        customTexts,
        lang,
      });
      navigate(`/result/${result.submissionId}?token=${encodeURIComponent(result.resultToken)}`, {
        state: { result, voteStats: quiz.voteStats },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container animate-in" style={{ paddingTop: '1.75rem', maxWidth: '640px' }}>
      <div className="game-stage" style={{ ['--a' as any]: modeMeta.accent }}>
        {currentIdx === 0 && (
          <div
            className="form-group"
            style={{
              paddingBottom: '1rem',
              marginBottom: '1.1rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
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

        {/* Stage Header & Progress */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <span className="t">{modeMeta.title[lang]}</span>
          <span style={{ fontSize: '0.84rem', color: 'var(--t2)', fontWeight: 600 }}>
            {currentIdx + 1} / {quiz.questions.length}
          </span>
        </div>
        <div className="bar" style={{ marginBottom: '1.25rem' }}>
          <i style={{ width: `${pct}%` }} />
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        {/* ====================================================================
         * GAMEPLAY UI 1: GUESS MY SIDE OR WOULD YOU RATHER (Big VS / OR Tiles)
         * ==================================================================== */}
        {(gameType === 'guess_side' || gameType === 'would_you_rather') && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2
              style={{
                textAlign: 'center',
                fontSize: '1.3rem',
                marginTop: 0,
                marginBottom: '1.1rem',
              }}
            >
              {question.questionText}
            </h2>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setAnswers((prev) => ({ ...prev, [question.id]: 'opt_1' }));
              }}
              className={`o big ${selectedId === 'opt_1' ? 'on' : ''}`}
            >
              <GlassArt name={question.options[0]?.icon || 'coffee'} size={62} />
              <span style={{ marginTop: '0.4rem' }}>{question.options[0]?.text}</span>
            </button>

            <div className="orb vs">{gameType === 'guess_side' ? 'VS' : 'OR'}</div>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setAnswers((prev) => ({ ...prev, [question.id]: 'opt_2' }));
              }}
              className={`o big ${selectedId === 'opt_2' ? 'on' : ''}`}
            >
              <GlassArt name={question.options[1]?.icon || 'tea'} size={62} />
              <span style={{ marginTop: '0.4rem' }}>{question.options[1]?.text}</span>
            </button>
          </div>
        )}

        {/* ====================================================================
         * GAMEPLAY UI 2: TWO TRUTHS & ONE LIE (Mask Icon + 3 Statements)
         * ==================================================================== */}
        {gameType === 'two_truths' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: '0.6rem' }}>
              <GlassArt name="mask" size={64} />
              <span style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
                Two are true. One is a lie. Spot the lie!
              </span>
            </div>
            <h2
              style={{
                textAlign: 'center',
                fontSize: '1.22rem',
                marginTop: '0.4rem',
                marginBottom: '1.1rem',
              }}
            >
              {question.questionText}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {question.options.slice(0, 3).map((opt, idx) => {
                const isSelected = selectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAnswers((prev) => ({ ...prev, [question.id]: opt.id }));
                    }}
                    className={`o ${isSelected ? 'on' : ''}`}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <span className={`n ${isSelected ? 'on' : ''}`}>{idx + 1}</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
         * GAMEPLAY UI 3: BLIND RANKING (Reveal Item 1-by-1 & Lock Slot 1..N)
         * ==================================================================== */}
        {gameType === 'blind_ranking' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="g" style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
              <div style={{ display: 'grid', placeItems: 'center', marginBottom: '0.35rem' }}>
                <GlassArt name="spark" size={48} />
              </div>
              <span className="lab">Current Item to Rank</span>
              <h2 style={{ margin: '0.3rem 0 0', fontSize: '1.45rem' }}>{question.questionText}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {Array.from({ length: quiz.questions.length }, (_, sIdx) => {
                const slotId = `opt_${sIdx + 1}`;
                const occupiedBy = lockedSlotMap[slotId];
                const isCurrentItemSlot = selectedId === slotId;
                const isLockedByPrevious = Boolean(occupiedBy && !isCurrentItemSlot);

                return (
                  <button
                    key={slotId}
                    type="button"
                    disabled={isLockedByPrevious}
                    onClick={() => {
                      if (currentIdx === 0 && !nickname.trim()) {
                        setErrorMsg('Please enter your name or nickname first.');
                        return;
                      }
                      setErrorMsg(null);
                      const nextAns = { ...answers, [question.id]: slotId };
                      setAnswers(nextAns);

                      // Auto-advance once locked if strict blind lock is active
                      if (quiz.settings?.lockPositions !== false) {
                        if (!isLast) {
                          setTimeout(() => setCurrentIdx((i) => i + 1), 240);
                        }
                      }
                    }}
                    className={`o ${isCurrentItemSlot || isLockedByPrevious ? 'on' : ''}`}
                    style={{
                      justifyContent: 'flex-start',
                      opacity: isLockedByPrevious ? 0.65 : 1,
                    }}
                  >
                    <span className={`n ${isCurrentItemSlot || isLockedByPrevious ? 'on' : ''}`}>
                      {sIdx + 1}
                    </span>
                    <span>
                      {occupiedBy ? (
                        <strong>{occupiedBy}</strong>
                      ) : (
                        <span style={{ color: 'var(--t3)' }}>Tap to lock in Rank #{sIdx + 1}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
         * GAMEPLAY UI 4: CLASSIC FRIENDSHIP QUIZ (3 Fixed + 1 Write-In)
         * ==================================================================== */}
        {gameType === 'quiz' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.28rem', marginTop: 0, marginBottom: '1.15rem' }}>
              {question.questionText}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {question.options.slice(0, 3).map((opt) => {
                const isSelected = selectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAnswers((prev) => ({ ...prev, [question.id]: opt.id }));
                    }}
                    className={`o ${isSelected ? 'on' : ''}`}
                  >
                    <span>{opt.text}</span>
                    {isSelected && <CheckCircle2 size={19} color="var(--cy)" />}
                  </button>
                );
              })}

              {/* 4th Write-Your-Own Option */}
              <div
                onClick={() => {
                  setErrorMsg(null);
                  setAnswers((prev) => ({ ...prev, [question.id]: 'opt_4' }));
                }}
                className={`o ${selectedId === 'opt_4' ? 'on' : ''}`}
                style={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  borderStyle: selectedId === 'opt_4' ? 'solid' : 'dashed',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--cy)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Edit3 size={16} /> {t.writeOwnLabel}
                  </span>
                  {selectedId === 'opt_4' && <CheckCircle2 size={18} color="var(--cy)" />}
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
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
          <button
            type="button"
            className="b o"
            disabled={
              currentIdx === 0 ||
              (gameType === 'blind_ranking' && quiz.settings?.lockPositions !== false)
            }
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
              className="b"
              onClick={() => {
                if (!validateCurrentStep()) return;
                setErrorMsg(null);
                setCurrentIdx((i) => i + 1);
              }}
            >
              {gameType === 'two_truths'
                ? 'That’s the Lie ›'
                : gameType === 'guess_side'
                ? 'Lock In ›'
                : t.nextBtn}
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              className="b"
              onClick={() => handleFinish()}
            >
              {submitting ? 'Submitting...' : t.finishBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 6. MULTI-GAME RESULT & COMPARISON PAGE (/result/:submissionId)
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
  const [quizData, setQuizData] = useState<PublicQuiz | null>(null);
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
          setQuizData(res.quiz);
        }
      });
    }
  }, [result, lang]);

  if (!result) {
    return (
      <div className="container" style={{ paddingTop: '3.5rem', textAlign: 'center' }}>
        <div className="g">
          <h1>Result Protected</h1>
          <Link to="/explore" className="b">
            {t.exploreBtn}
          </Link>
        </div>
      </div>
    );
  }

  const gameType: GameType = result.gameType || quizData?.gameType || 'quiz';
  const modeMeta = GAME_MODES.find((m) => m.id === gameType) || GAME_MODES[0];
  const fb = getScoreFeedback(result.scorePercentage, lang);
  const quizUrl = `${window.location.origin}/q/${result.quizSlug}`;
  const shareText = `I scored ${result.score}/${result.totalQuestions} (${result.scorePercentage}%) on ${result.creatorDisplayName}'s ${modeMeta.title.en} on ${BRAND.name}! Play here: ${quizUrl}`;
  const details = result.details || [];

  const downloadScoreCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, 800, 460);

    const grad = ctx.createLinearGradient(28, 28, 772, 432);
    grad.addColorStop(0, '#7C5CFA');
    grad.addColorStop(0.6, '#4FD1E8');
    grad.addColorStop(1, '#D58BF5');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, 744, 404);

    ctx.fillStyle = '#C9B8FF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${BRAND.name} • ${modeMeta.title.en}`, 64, 92);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(
      `${result.score}/${result.totalQuestions} (${result.scorePercentage}%)`,
      64,
      195
    );

    ctx.fillStyle = '#4FD1E8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(fb.title, 64, 255);

    ctx.fillStyle = '#A7B1C5';
    ctx.font = '23px sans-serif';
    ctx.fillText(
      `Player: ${result.participantNickname}  |  By: ${result.creatorDisplayName}`,
      64,
      325
    );

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#78859D';
    ctx.fillText(window.location.host, 64, 385);

    const link = document.createElement('a');
    link.download = `${BRAND.name.toLowerCase()}-result.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '680px' }}>
      <div
        className="game-stage"
        style={{ ['--a' as any]: modeMeta.accent, textAlign: 'center' }}
      >
        <span className="t ok">{t.scoreRevealBadge}</span>
        <p style={{ color: 'var(--t2)', margin: '0.45rem 0 0.25rem' }}>
          {result.quizTitle} • by {result.creatorDisplayName}
        </p>

        {/* Liquid Glass Conic Score Ring */}
        <div className="ring" style={{ ['--pct' as any]: `${result.scorePercentage}%` }}>
          <div>{result.scorePercentage}%</div>
        </div>

        <h2 style={{ margin: '0.2rem 0' }}>{fb.title}</h2>
        <p style={{ color: 'var(--t2)', marginTop: '0.2rem', marginBottom: '1.4rem' }}>
          {result.score} of {result.totalQuestions} matched • {fb.subtitle}
        </p>

        {/* Mode-Specific Breakdown (Guess My Side, Two Truths, Blind Ranking, Would You Rather) */}
        {details.length > 0 && gameType === 'guess_side' && (
          <div className="g" style={{ textAlign: 'left', marginBottom: '1.4rem' }}>
            <span className="lab" style={{ display: 'block', marginBottom: '0.6rem' }}>
              Side-by-Side Match Breakdown
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {details.map((d, idx) => {
                const chosen = d.options.find((o) => o.id === d.selectedOptionId)?.text || '';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>
                      <strong>{d.questionText}:</strong> {chosen}
                    </span>
                    <span className={`t ${d.isCorrect ? 'ok' : 'w'}`}>
                      {d.isCorrect ? 'Match ✓' : 'Miss ✕'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {details.length > 0 && gameType === 'two_truths' && (
          <div className="g" style={{ textAlign: 'left', marginBottom: '1.4rem' }}>
            <span className="lab" style={{ display: 'block', marginBottom: '0.6rem' }}>
              Truths & Lies Reveal
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {details.map((d, idx) => {
                const lieOption = d.options.find((o) => o.id === d.correctOptionId);
                return (
                  <div key={idx} className={`o ${d.isCorrect ? 'good' : 'bad'}`}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>{d.questionText}</div>
                      <strong>The Lie was: “{lieOption?.text}”</strong>
                    </div>
                    <span className={`t ${d.isCorrect ? 'ok' : 'w'}`}>
                      {d.isCorrect ? 'Spotted!' : 'Fooled'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {details.length > 0 && gameType === 'blind_ranking' && (
          <div className="g" style={{ textAlign: 'left', marginBottom: '1.4rem' }}>
            <div className="cmp">
              <span className="lab">Your Rank</span>
              <span />
              <span className="lab">Creator’s Rank</span>
            </div>
            {details.map((d, idx) => {
              const userRank = d.selectedOptionId.replace('opt_', '#');
              const creatorRank = d.correctOptionId.replace('opt_', '#');
              return (
                <div key={idx} className="cmp">
                  <div className="o" style={{ justifyContent: 'center', padding: '0.5rem' }}>
                    {userRank} · {d.questionText}
                  </div>
                  <span style={{ fontWeight: 800, color: d.isCorrect ? 'var(--green)' : 'var(--red)' }}>
                    {d.isCorrect ? '=' : '≠'}
                  </span>
                  <div
                    className={`o ${d.isCorrect ? 'good' : 'bad'}`}
                    style={{ justifyContent: 'center', padding: '0.5rem' }}
                  >
                    {creatorRank} · {d.questionText}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {details.length > 0 && gameType === 'would_you_rather' && (
          <div className="g" style={{ textAlign: 'left', marginBottom: '1.4rem' }}>
            <span className="lab" style={{ display: 'block', marginBottom: '0.7rem' }}>
              Group Vote Comparison
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {details.map((d, idx) => {
                const stat = quizData?.voteStats?.[d.questionId] || {
                  opt_1: d.selectedOptionId === 'opt_1' ? 1 : 0,
                  opt_2: d.selectedOptionId === 'opt_2' ? 1 : 0,
                  total: 1,
                };
                const total = Math.max(stat.total, 1);
                const pct1 = Math.round((stat.opt_1 / total) * 100);
                const pct2 = 100 - pct1;
                return (
                  <div key={idx}>
                    <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
                      {d.questionText}
                    </strong>
                    <div style={{ fontSize: '0.84rem', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          A: {d.options[0]?.text}{' '}
                          {d.selectedOptionId === 'opt_1' && <strong>(Your Pick)</strong>}
                        </span>
                        <b>{pct1}%</b>
                      </div>
                      <div className="bar">
                        <i style={{ width: `${pct1}%` }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.84rem', marginTop: '0.45rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          B: {d.options[1]?.text}{' '}
                          {d.selectedOptionId === 'opt_2' && <strong>(Your Pick)</strong>}
                        </span>
                        <b>{pct2}%</b>
                      </div>
                      <div className="bar">
                        <i style={{ width: `${pct2}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Written Answers */}
        {result.customAnswers && result.customAnswers.length > 0 && (
          <div className="g" style={{ textAlign: 'left', marginBottom: '1.4rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--cy)' }}>
              ✍️ {t.customAnswersTitle}:
            </strong>
            {result.customAnswers.map((item, idx) => (
              <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--t2)' }}>{item.questionText}:</span>{' '}
                <strong>“{item.customAnswer}”</strong>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.7rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
          }}
        >
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="b btn-whatsapp"
          >
            <MessageCircle size={18} />
            <span>{t.whatsappShareBtn}</span>
          </a>

          <button
            type="button"
            className="b o"
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

          <button type="button" className="b o" onClick={downloadScoreCard}>
            <Download size={18} />
            <span>{t.downloadCardBtn}</span>
          </button>
        </div>

        <div className="g" style={{ textAlign: 'center' }}>
          <h3 style={{ marginTop: 0 }}>{t.challengeBackTitle}</h3>
          <p style={{ color: 'var(--t2)', marginBottom: '1rem' }}>{t.challengeBackSub}</p>
          <Link to={`/create?type=${gameType}`} className="b">
            {t.createBtn}
          </Link>
        </div>
      </div>

      <LeaderboardCard
        entries={quizData?.leaderboard}
        totalParticipants={quizData?.totalParticipants}
      />
      <AdBanner slotId="result-bottom" />
    </div>
  );
};

/* ============================================================================
 * 7. GAME 01 · ASK ME ANYTHING (AMA) INBOX (/inbox) & PUBLIC PAGE (/ama/:slug)
 * ============================================================================ */
const AmaInboxPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState<AmaInboxData | null>(null);
  const [creatorName, setCreatorName] = useState('');
  const [promptText, setPromptText] = useState('Ask me anything anonymously!');
  const [tab, setTab] = useState<'private' | 'published'>('private');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [publishToggle, setPublishToggle] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadInbox = async () => {
    setLoading(true);
    try {
      const res = await api.getCreatorAmaInbox();
      if (res.hasInbox && res.inbox) {
        setInbox(res.inbox);
        setCreatorName(res.inbox.creatorDisplayName);
        setPromptText(res.inbox.promptText);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const handleSaveInbox = async (nextOpen?: boolean) => {
    setErr(null);
    try {
      const saved = await api.upsertAmaInbox({
        creatorDisplayName: creatorName,
        promptText,
        isOpen: typeof nextOpen === 'boolean' ? nextOpen : inbox?.isOpen ?? true,
        existingSlug: inbox?.slug,
      });
      await loadInbox();
      if (!inbox) setInbox(saved);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        Loading AMA Inbox...
      </div>
    );
  }

  if (!inbox) {
    return (
      <div className="container animate-in" style={{ paddingTop: '2.2rem', maxWidth: '600px' }}>
        <div className="game-stage" style={{ ['--a' as any]: '#5B9BFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
            <GlassArt name="bubble" size={56} />
            <div>
              <span className="t">01 · Ask Me Anything</span>
              <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.65rem' }}>
                Launch Your Private Question Inbox
              </h1>
            </div>
          </div>
          <p style={{ color: 'var(--t2)' }}>
            Friends send anonymous questions via your link. Every question stays 100% private until
            you choose to answer and publish it.
          </p>
          {err && <div className="alert-error">{err}</div>}
          <div className="form-group">
            <label className="form-label">Your Display Name *</label>
            <input
              className="form-input"
              placeholder="e.g., Ahad"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Inbox Prompt for Friends</label>
            <input
              className="form-input"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>
          <button type="button" className="b" onClick={() => handleSaveInbox(true)}>
            Create My AMA Link
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/ama/${inbox.slug}`;
  const allQuestions = inbox.questions || [];
  const privateList = allQuestions.filter((q) => q.status === 'private');
  const publishedList = allQuestions.filter((q) => q.status === 'published');
  const shownList = tab === 'private' ? privateList : publishedList;

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '720px' }}>
      <div className="game-stage" style={{ ['--a' as any]: '#5B9BFA' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GlassArt name="bubble" size={46} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Ask Me Anything Inbox</h1>
              <span style={{ fontSize: '0.84rem', color: 'var(--t2)' }}>{inbox.promptText}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={`t ${inbox.isOpen ? 'ok' : 'w'}`}>
              {inbox.isOpen ? 'Inbox Open' : 'Inbox Closed'}
            </span>
            <button
              type="button"
              className={`tg ${inbox.isOpen ? 'on' : ''}`}
              onClick={() => handleSaveInbox(!inbox.isOpen)}
              title="Toggle Inbox Open/Closed"
            />
          </div>
        </div>

        <DirectLinkBox url={shareUrl} shareTitle={inbox.promptText} />

        {err && <div className="alert-error">{err}</div>}

        <div className="seg" style={{ margin: '1.25rem 0' }}>
          <button
            type="button"
            className={tab === 'private' ? 'on' : ''}
            onClick={() => setTab('private')}
          >
            Private Inbox ({privateList.length})
          </button>
          <button
            type="button"
            className={tab === 'published' ? 'on' : ''}
            onClick={() => setTab('published')}
          >
            Published Answers ({publishedList.length})
          </button>
        </div>

        {shownList.length === 0 ? (
          <div className="g" style={{ textAlign: 'center', color: 'var(--t2)' }}>
            {tab === 'private'
              ? 'No new private questions yet. Share your AMA link above on WhatsApp or stories!'
              : 'You have not published any answers yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {shownList.map((q) => (
              <div key={q.id} className="g">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.82rem',
                      color: 'var(--t2)',
                    }}
                  >
                    <GlassArt name="mask" size={20} /> Anonymous
                  </span>
                  <span className={`t ${q.status === 'published' ? 'ok' : ''}`}>
                    {q.status === 'published' ? 'Published' : 'Private'}
                  </span>
                </div>

                <p style={{ fontSize: '1.08rem', fontWeight: 600, margin: '0.3rem 0 0.85rem' }}>
                  “{q.questionText}”
                </p>

                {q.answerText && replyingId !== q.id && (
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.05)',
                      marginBottom: '0.8rem',
                    }}
                  >
                    <span className="lab" style={{ display: 'block' }}>
                      Your Reply
                    </span>
                    <div>{q.answerText}</div>
                  </div>
                )}

                {replyingId === q.id ? (
                  <div style={{ marginTop: '0.75rem' }}>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Write your answer..."
                      value={answerDraft}
                      onChange={(e) => setAnswerDraft(e.target.value)}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '0.75rem 0',
                      }}
                    >
                      <span>Publish to my public page</span>
                      <button
                        type="button"
                        className={`tg ${publishToggle ? 'on' : ''}`}
                        onClick={() => setPublishToggle((v) => !v)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="b btn-sm"
                        onClick={async () => {
                          await api.manageAmaQuestion({
                            questionId: q.id,
                            action: 'answer',
                            answerText: answerDraft,
                            publish: publishToggle,
                          });
                          setReplyingId(null);
                          await loadInbox();
                        }}
                      >
                        Save Answer
                      </button>
                      <button
                        type="button"
                        className="b o btn-sm"
                        onClick={() => setReplyingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="b o btn-sm"
                      onClick={() => {
                        setReplyingId(q.id);
                        setAnswerDraft(q.answerText || '');
                        setPublishToggle(true);
                      }}
                    >
                      Reply
                    </button>
                    {q.status === 'published' && (
                      <button
                        type="button"
                        className="b o btn-sm"
                        onClick={async () => {
                          await api.manageAmaQuestion({
                            questionId: q.id,
                            action: 'unpublish',
                          });
                          await loadInbox();
                        }}
                      >
                        <EyeOff size={14} /> Make Private
                      </button>
                    )}
                    <button
                      type="button"
                      className="b o btn-sm"
                      onClick={async () => {
                        await api.manageAmaQuestion({
                          questionId: q.id,
                          action: 'delete',
                        });
                        await loadInbox();
                      }}
                    >
                      Skip / Delete
                    </button>
                    <button
                      type="button"
                      className="b x btn-sm"
                      onClick={async () => {
                        if (!window.confirm('Report and block this anonymous sender?')) return;
                        await api.manageAmaQuestion({
                          questionId: q.id,
                          action: 'block_report',
                        });
                        await loadInbox();
                      }}
                    >
                      <Flag size={14} /> Block & Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PublicAmaPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<'loading' | 'ok' | 'not_found'>('loading');
  const [inbox, setInbox] = useState<AmaInboxData | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    api.getPublicAmaInbox(slug).then((res) => {
      setStatus(res.status);
      if (res.inbox) setInbox(res.inbox);
    });
  };

  useEffect(() => {
    load();
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        Loading AMA...
      </div>
    );
  }

  if (status !== 'ok' || !inbox) {
    return (
      <div className="container animate-in" style={{ paddingTop: '3.5rem', maxWidth: '540px' }}>
        <div className="g" style={{ textAlign: 'center' }}>
          <h1>AMA Inbox Not Found</h1>
          <Link to="/inbox" className="b">
            Create Your Own AMA Inbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '640px' }}>
      <div className="game-stage" style={{ ['--a' as any]: '#5B9BFA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
          <GlassArt name="mask" size={52} />
          <div>
            <span className="t">Anonymous AMA • {inbox.creatorDisplayName}</span>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.45rem' }}>{inbox.promptText}</h1>
          </div>
        </div>

        {!inbox.isOpen ? (
          <div className="alert-error">
            {inbox.creatorDisplayName} has temporarily paused new questions.
          </div>
        ) : sent ? (
          <div className="alert-success">
            Your anonymous question was sent privately!
            <div style={{ marginTop: '0.6rem' }}>
              <button
                type="button"
                className="b o btn-sm"
                onClick={() => {
                  setQuestionText('');
                  setSent(false);
                }}
              >
                Send Another Question
              </button>
            </div>
          </div>
        ) : (
          <div>
            {err && <div className="alert-error">{err}</div>}
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Send an anonymous question or confession..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.75rem',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>
                🔒 100% Anonymous • Private until answered
              </span>
              <button
                type="button"
                className="b"
                onClick={async () => {
                  setErr(null);
                  try {
                    await api.sendAmaQuestion(inbox.slug, questionText);
                    setSent(true);
                  } catch (e: any) {
                    setErr(e.message);
                  }
                }}
              >
                Send Anonymously
              </button>
            </div>
          </div>
        )}

        {/* Published Q&A Feed */}
        {inbox.publishedQuestions && inbox.publishedQuestions.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <span className="lab" style={{ display: 'block', marginBottom: '0.75rem' }}>
              Published Answers ({inbox.publishedQuestions.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {inbox.publishedQuestions.map((q) => (
                <div key={q.id} className="g">
                  <div style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>Anonymous asked:</div>
                  <p style={{ fontWeight: 700, margin: '0.2rem 0 0.65rem' }}>“{q.questionText}”</p>
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: '14px',
                      background: 'rgba(91,155,250,0.14)',
                      border: '1px solid rgba(91,155,250,0.3)',
                    }}
                  >
                    <strong>{inbox.creatorDisplayName}:</strong> {q.answerText}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 8. GAME 04 · BFFQUEST WRAPPED (/wrapped) — REAL GAMEPLAY RECAP
 * ============================================================================ */
const WrappedPage: React.FC = () => {
  const { lang } = useLang();
  const [recap, setRecap] = useState<WrappedRecapData | null>(null);
  const [slide, setSlide] = useState<'recap' | 'card'>('recap');

  useEffect(() => {
    api.getWrappedRecap().then(setRecap);
  }, []);

  if (!recap) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        Loading Wrapped...
      </div>
    );
  }

  const downloadWrappedCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, 720, 900);

    const grad = ctx.createLinearGradient(0, 0, 720, 900);
    grad.addColorStop(0, '#D58BF5');
    grad.addColorStop(0.5, '#7C5CFA');
    grad.addColorStop(1, '#4FD1E8');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 660, 840);

    ctx.fillStyle = '#D58BF5';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('BFFQuest Wrapped', 70, 110);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 110px sans-serif';
    ctx.fillText(`${recap.totalPlayed}`, 70, 260);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Games & Quizzes Played', 70, 310);

    ctx.fillStyle = '#4FD1E8';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`Best Score: ${recap.bestScorePct}%`, 70, 420);
    ctx.fillText(`Games Created: ${recap.totalCreated}`, 70, 490);
    ctx.fillText(`Friends Reached: ${recap.totalFriendsReached}`, 70, 560);
    ctx.fillText(`Daily Streak: ${recap.currentStreak} days`, 70, 630);

    ctx.fillStyle = '#A7B1C5';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Top Game: ${recap.topGameTitle.slice(0, 34)}`, 70, 730);
    ctx.fillText(window.location.host, 70, 810);

    const link = document.createElement('a');
    link.download = 'bffquest-wrapped.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '560px' }}>
      <div className="game-stage" style={{ ['--a' as any]: '#D58BF5' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.2rem' }}>
          <div className="bar" style={{ flex: 1 }}>
            <i style={{ width: '100%' }} />
          </div>
          <div className="bar" style={{ flex: 1 }}>
            <i style={{ width: slide === 'card' ? '100%' : '35%' }} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h1 className="gr" style={{ margin: 0, fontSize: '1.8rem' }}>
            BFFQuest Wrapped
          </h1>
          <GlassArt name="spark" size={42} />
        </div>

        {!recap.hasEnoughData ? (
          <div className="g" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
            <p className="lab">Your Year in Quizzes</p>
            <h2 style={{ margin: '0.5rem 0' }}>No Gameplay History Yet</h2>
            <p style={{ color: 'var(--t2)', marginBottom: '1.5rem' }}>
              Real totals appear once your play history exists. Play or create at least 1 game to
              unlock your personalized BFFQuest Wrapped!
            </p>
            <Link to="/explore" className="b">
              Play Your First Game
            </Link>
          </div>
        ) : (
          <>
            <div className="seg" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className={slide === 'recap' ? 'on' : ''}
                onClick={() => setSlide('recap')}
              >
                1 · Recap Slide
              </button>
              <button
                type="button"
                className={slide === 'card' ? 'on' : ''}
                onClick={() => setSlide('card')}
              >
                2 · Share Card
              </button>
            </div>

            {slide === 'recap' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <span className="lab">Your Real Activity Recap</span>
                <div
                  className="gr"
                  style={{ fontSize: '5.2rem', fontWeight: 800, lineHeight: 1.05 }}
                >
                  {recap.totalPlayed + recap.totalCreated}
                </div>
                <h2 style={{ margin: '0.3rem 0 0.5rem' }}>
                  Total Moments Played & Created
                </h2>
                <p style={{ color: 'var(--t2)' }}>
                  Top Game: <strong>{recap.topGameTitle}</strong>
                </p>
                <button
                  type="button"
                  className="b"
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => setSlide('card')}
                >
                  View Shareable Card ›
                </button>
              </div>
            ) : (
              <div>
                <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                  <div className="g">
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {recap.bestScorePct}%
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>Best Score</span>
                  </div>
                  <div className="g">
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{recap.totalPlayed}</div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>Games Played</span>
                  </div>
                  <div className="g">
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {recap.totalFriendsReached}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
                      Friends Reached
                    </span>
                  </div>
                  <div className="g">
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {recap.currentStreak} 🔥
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>Daily Streak</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="b"
                  style={{ width: '100%' }}
                  onClick={downloadWrappedCard}
                >
                  <Download size={18} /> Download Wrapped Card (PNG)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 9. GAME 07 · DAILY QUEST (/daily) — STREAK CALENDAR & BADGES
 * ============================================================================ */
const DailyQuestPage: React.FC = () => {
  const { lang } = useLang();
  const [status, setStatus] = useState<DailyQuestStatus>(() => api.getDailyQuestStatus());

  useEffect(() => {
    setStatus(api.getDailyQuestStatus());
  }, []);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedSet = new Set(status.completedDates);

  // Last 28 days for History Grid
  const last28Days = Array.from({ length: 28 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - idx));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    return { dayNum: d.getDate(), key, done: completedSet.has(key) };
  });

  const targetRoute =
    status.quest.taskType === 'create_any' ? '/create' : '/q/sample-best-friend-quiz';

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem', maxWidth: '640px' }}>
      <div className="game-stage" style={{ ['--a' as any]: '#3FD08A' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.7rem' }}>Daily Quest</h1>
          <span className="t ok">🔥 {status.currentStreak} Day Streak</span>
        </div>

        {/* Today's Challenge Card */}
        <div
          className="g"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.4rem',
          }}
        >
          <GlassArt name="flame" size={60} />
          <div style={{ flex: 1 }}>
            <span className={`t ${status.isCompletedToday ? 'ok' : 'w'}`}>
              {status.isCompletedToday ? 'Completed Today ✓' : 'Today’s Challenge'}
            </span>
            <h3 style={{ margin: '0.35rem 0 0.2rem' }}>{status.quest.title[lang]}</h3>
            <p style={{ margin: 0, color: 'var(--t2)', fontSize: '0.88rem' }}>
              {status.quest.description[lang]}
            </p>
          </div>
        </div>

        {!status.isCompletedToday && (
          <Link
            to={targetRoute}
            className="b"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            Start Today’s Challenge ›
          </Link>
        )}

        {/* 28-Day Completion History */}
        <div className="g" style={{ marginBottom: '1.4rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.6rem',
            }}
          >
            <span className="lab">28-Day Activity Calendar</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>{status.todayKey}</span>
          </div>
          <div className="wk">
            {daysOfWeek.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="cal">
            {last28Days.map((item) => (
              <i key={item.key} className={item.done ? 'done' : ''} title={item.key}>
                {item.done ? '✓' : item.dayNum}
              </i>
            ))}
          </div>
        </div>

        {/* Real Achievements & Badges */}
        <div className="g">
          <span className="lab" style={{ display: 'block', marginBottom: '0.75rem' }}>
            Badges (Unlocked from Real Gameplay)
          </span>
          <div className="grid-2">
            {BADGES.map((b) => {
              const unlocked = status.unlockedBadges.includes(b.id);
              return (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    opacity: unlocked ? 1 : 0.4,
                    filter: unlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  <GlassArt name="badge" size={38} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                      {b.title[lang]}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--t2)' }}>{b.desc[lang]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 10. PROFILE / MY QUIZZES DASHBOARD (/dashboard)
 * ============================================================================ */
const DashboardPage: React.FC = () => {
  const { lang, t } = useLang();
  const [quizzes, setQuizzes] = useState<CreatorQuizSummary[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'disabled'>('all');
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
      setErr(error.message || 'Could not load games.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalSubs = quizzes.reduce((acc, q) => acc + q.submissionCount, 0);
  const totalWeightedSum = quizzes.reduce(
    (acc, q) =>
      acc + q.submissions.reduce((sAcc, sub) => sAcc + Number(sub.scorePercentage || 0), 0),
    0
  );
  const weightedAvg = totalSubs > 0 ? Math.round(totalWeightedSum / totalSubs) : 0;

  const shownQuizzes = quizzes.filter((q) => filter === 'all' || q.status === filter);

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem' }}>
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
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
          <Link to="/wrapped" className="b o btn-sm">
            ✨ Wrapped
          </Link>
          <Link to="/daily" className="b o btn-sm">
            🔥 Daily Quest
          </Link>
          <button type="button" className="b o btn-sm" onClick={load}>
            <RefreshCw size={15} />
          </button>
          <Link to="/create" className="b btn-sm">
            + {t.navCreate}
          </Link>
        </div>
      </div>
      <p style={{ color: 'var(--t2)', marginTop: 0, marginBottom: '1.5rem' }}>{t.dashboardSub}</p>

      {err && <div className="alert-error">{err}</div>}

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="g">
          <span className="lab">{t.totalQuizzes}</span>
          <strong style={{ display: 'block', fontSize: '2rem' }}>{quizzes.length}</strong>
        </div>
        <div className="g">
          <span className="lab">{t.totalSubmissions}</span>
          <strong style={{ display: 'block', fontSize: '2rem' }}>{totalSubs}</strong>
        </div>
        <div className="g">
          <span className="lab">{t.avgScore}</span>
          <strong className="gr" style={{ display: 'block', fontSize: '2rem' }}>
            {weightedAvg}%
          </strong>
        </div>
      </div>

      <div className="seg" style={{ marginBottom: '1.25rem', maxWidth: '420px' }}>
        <button
          type="button"
          className={filter === 'all' ? 'on' : ''}
          onClick={() => setFilter('all')}
        >
          All ({quizzes.length})
        </button>
        <button
          type="button"
          className={filter === 'published' ? 'on' : ''}
          onClick={() => setFilter('published')}
        >
          Live
        </button>
        <button
          type="button"
          className={filter === 'disabled' ? 'on' : ''}
          onClick={() => setFilter('disabled')}
        >
          Paused
        </button>
      </div>

      {loading ? (
        <div className="g" style={{ textAlign: 'center' }}>
          Loading your games...
        </div>
      ) : shownQuizzes.length === 0 ? (
        <div className="g" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ color: 'var(--t2)', marginBottom: '1.25rem' }}>{t.noQuizzesYet}</p>
          <Link to="/create" className="b">
            {t.createBtn}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {shownQuizzes.map((q) => {
            const fullUrl = `${window.location.origin}/q/${q.slug}`;
            const isCopied = copiedQuizId === q.id;
            const modeMeta = GAME_MODES.find((m) => m.id === q.gameType) || GAME_MODES[0];

            return (
              <div key={q.id} className="g">
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
                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                      <span className={`t ${q.status === 'published' ? 'ok' : 'w'}`}>
                        {q.status.toUpperCase()}
                      </span>
                      <span className="t">{modeMeta.title[lang]}</span>
                    </div>
                    <h3 style={{ margin: '0.4rem 0 0.15rem' }}>{q.title}</h3>
                    <span style={{ fontSize: '0.86rem', color: 'var(--t2)' }}>
                      {q.questionCount} {t.questionsCount} • {q.submissionCount}{' '}
                      {t.participantsCount}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="b btn-sm"
                      onClick={async () => {
                        const res = await copyTextSafely(fullUrl);
                        if (res.ok) {
                          setCopiedQuizId(q.id);
                          setTimeout(() => setCopiedQuizId(null), 2500);
                        }
                      }}
                    >
                      {isCopied ? <Check size={15} /> : <Copy size={15} />}
                      <span>{isCopied ? t.copiedBtn : t.copyLinkBtn}</span>
                    </button>

                    <Link to={`/q/${q.slug}`} className="b o btn-sm">
                      <Eye size={15} /> {t.openQuizBtn}
                    </Link>

                    <button
                      type="button"
                      className="b o btn-sm"
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
                      className="b x btn-sm"
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
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <strong
                      style={{ display: 'block', fontSize: '0.86rem', marginBottom: '0.6rem' }}
                    >
                      {t.recentSubmissions}
                    </strong>
                    <div className="grid-2">
                      {q.submissions.map((s) => (
                        <div
                          key={s.submissionId}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.09)',
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
                            <span style={{ color: 'var(--cy)', fontWeight: 700 }}>
                              {s.score}/{s.totalQuestions} ({Math.round(Number(s.scorePercentage))}
                              %)
                            </span>
                          </div>
                          {s.customAnswers && s.customAnswers.length > 0 && (
                            <div
                              style={{
                                marginTop: '0.4rem',
                                paddingTop: '0.4rem',
                                borderTop: '1px dashed rgba(255,255,255,0.12)',
                                fontSize: '0.8rem',
                                color: 'var(--t2)',
                              }}
                            >
                              {s.customAnswers.map((ca, idx) => (
                                <div key={idx}>
                                  ✍️ <em>{ca.questionText}:</em>{' '}
                                  <strong style={{ color: '#fff' }}>“{ca.customAnswer}”</strong>
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
 * 11. LIQUID GLASS SITE-OWNER ADMIN PANEL (/admin)
 * ============================================================================ */
const AdminPage: React.FC = () => {
  const { t } = useLang();
  const [passkey, setPasskey] = useState(() => getSavedAdminKey());
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
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
      <div className="container animate-in" style={{ paddingTop: '3rem', maxWidth: '460px' }}>
        <div className="game-stage">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.5rem',
            }}
          >
            <Lock size={22} color="var(--cy)" />
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t.adminTitle}</h1>
          </div>
          <p style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
            Enter your server-verified Admin Passkey to moderate all games, submissions, AMA
            inboxes, and abuse reports.
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
            <button type="submit" disabled={loading} className="b" style={{ width: '100%' }}>
              {loading ? 'Verifying...' : 'Unlock Liquid Glass Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredQuizzes = data.quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.creatorDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === 'all' || (q.gameType || 'quiz') === modeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="container animate-in" style={{ paddingTop: '2rem' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GlassArt name="badge" size={42} />
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{t.adminTitle}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="button" className="b o btn-sm" onClick={() => loadAdmin(passkey)}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            type="button"
            className="b x btn-sm"
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

      {/* Liquid Glass Admin Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <div className="g">
          <span className="lab">Published Games</span>
          <strong style={{ display: 'block', fontSize: '2.1rem' }}>{data.totalQuizzes}</strong>
        </div>
        <div className="g">
          <span className="lab">Friend Plays</span>
          <strong className="gr" style={{ display: 'block', fontSize: '2.1rem' }}>
            {data.totalSubmissions}
          </strong>
        </div>
        <div className="g">
          <span className="lab">AMA Questions</span>
          <strong style={{ display: 'block', fontSize: '2.1rem' }}>
            {data.totalAmaQuestions ?? 0}
          </strong>
        </div>
        <div className="g">
          <span className="lab">Open Reports</span>
          <strong
            style={{
              display: 'block',
              fontSize: '2.1rem',
              color: data.openReports > 0 ? 'var(--red)' : 'var(--green)',
            }}
          >
            {data.openReports}
          </strong>
        </div>
      </div>

      {/* Abuse Reports Queue */}
      <div className="g" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Moderation & Abuse Reports Queue</h2>
        {data.reports.length === 0 ? (
          <p style={{ color: 'var(--t2)', margin: 0 }}>No abuse reports pending.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.reports.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '0.9rem',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <span className={`t ${r.status === 'resolved' ? 'ok' : 'w'}`}>
                    {r.status.toUpperCase()}
                  </span>{' '}
                  <strong>{r.reason}</strong>
                  {r.quizSlug && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--cy)' }}>({r.quizSlug})</span>
                  )}
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--t2)' }}>{r.details}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  {r.status !== 'resolved' && (
                    <button
                      type="button"
                      className="b o btn-sm"
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
                    className="b x btn-sm"
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

      {/* All Games Directory */}
      <div className="g">
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
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>All Cloud Games ({filteredQuizzes.length})</h2>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto', minHeight: 40 }}
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="quiz">Friendship Quiz</option>
              <option value="guess_side">Guess My Side</option>
              <option value="two_truths">Two Truths & One Lie</option>
              <option value="blind_ranking">Blind Ranking</option>
              <option value="would_you_rather">Would You Rather</option>
            </select>
            <input
              className="form-input"
              style={{ width: 240, minHeight: 40 }}
              placeholder="Search title, creator, slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {filteredQuizzes.map((q) => (
            <div
              key={q.id}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span className={`t ${q.status === 'published' ? 'ok' : 'w'}`}>
                  {q.status.toUpperCase()}
                </span>{' '}
                <span className="t">{q.gameType || 'quiz'}</span>{' '}
                <strong>{q.title}</strong>
                <div style={{ fontSize: '0.83rem', color: 'var(--t2)', marginTop: '0.2rem' }}>
                  By: {q.creatorDisplayName} • Slug: <code>/q/{q.slug}</code> • Plays:{' '}
                  {q.submissionCount}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                <Link to={`/q/${q.slug}`} className="b o btn-sm">
                  View
                </Link>
                <button
                  type="button"
                  className="b o btn-sm"
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
                  className="b x btn-sm"
                  onClick={async () => {
                    if (!window.confirm('Delete this game permanently?')) return;
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
 * 12. GUIDES, REPORT ABUSE & INFO PAGES
 * ============================================================================ */
const GuidesPage: React.FC = () => {
  const { lang } = useLang();
  return (
    <div className="container animate-in" style={{ paddingTop: '2.2rem', maxWidth: '820px' }}>
      <h1>
        {lang === 'bn'
          ? 'ফ্রেন্ডশিপ গাইড এবং ৮টি গেম খেলার নিয়ম'
          : 'Friendship Guides & How to Play All 8 Games'}
      </h1>
      <div className="g" style={{ marginBottom: '1.1rem' }}>
        <h3>1. Ask Me Anything (AMA) & Friendship Quizzes</h3>
        <p style={{ color: 'var(--t2)', margin: 0 }}>
          Open your private AMA inbox to receive anonymous questions that stay hidden until you
          publish a reply, or build a 5-question Friendship Quiz with custom write-in answers.
        </p>
      </div>
      <div className="g" style={{ marginBottom: '1.1rem' }}>
        <h3>2. Guess My Side, Two Truths & Blind Ranking</h3>
        <p style={{ color: 'var(--t2)', margin: 0 }}>
          Test your friends’ intuition with 50/50 This-or-That dilemmas, challenge them to spot your
          hidden lie, or watch them lock items #1 to #5 in Blind Ranking without seeing what comes
          next!
        </p>
      </div>
      <div className="g">
        <h3>3. Would You Rather, Daily Quests & Wrapped</h3>
        <p style={{ color: 'var(--t2)', margin: 0 }}>
          Vote on tough dilemmas with live group percentages, complete daily challenges to build
          your streak, and export your BFFQuest Wrapped share card anytime.
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
    <div className="container animate-in" style={{ paddingTop: '2.2rem', maxWidth: '620px' }}>
      <div className="game-stage">
        <h1 style={{ marginTop: 0 }}>{t.reportTitle}</h1>
        <p style={{ color: 'var(--t2)' }}>{t.reportSub}</p>

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
                placeholder="e.g., /q/ahad-bff-xyz or /ama/ahad"
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
            <button type="submit" className="b">
              {t.reportSubmitBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const SimpleInfoPage: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="container animate-in" style={{ paddingTop: '2.2rem', maxWidth: '720px' }}>
    <div className="g">
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p style={{ color: 'var(--t2)' }}>{text}</p>
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
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/create" element={<CreateQuizPage />} />
            <Route path="/q/:slug" element={<PublicQuizPage />} />
            <Route path="/q/:slug/play" element={<PlayQuizPage />} />
            <Route path="/result/:submissionId" element={<ResultPage />} />
            <Route path="/inbox" element={<AmaInboxPage />} />
            <Route path="/ama/:slug" element={<PublicAmaPage />} />
            <Route path="/wrapped" element={<WrappedPage />} />
            <Route path="/daily" element={<DailyQuestPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/report" element={<ReportAbusePage />} />
            <Route
              path="/about"
              element={
                <SimpleInfoPage
                  title={`About ${BRAND.name}`}
                  text={`${BRAND.name} is an interactive Liquid Glass friendship gaming platform supporting 8 game modes in English and Bangla without requiring friends to sign up.`}
                />
              }
            />
            <Route
              path="/privacy"
              element={
                <SimpleInfoPage
                  title="Privacy Policy"
                  text="We store only the game prompts you publish, anonymous AMA questions (which remain private until answered), and participant nicknames/scores. Creators can delete their games anytime."
                />
              }
            />
            <Route
              path="/terms"
              element={
                <SimpleInfoPage
                  title="Terms & Community Guidelines"
                  text="Games on BFFquest are playful social experiences. Harassment, bullying, or sharing private personal information is strictly prohibited."
                />
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LangContext.Provider>
  );
};
