import { useCallback, useEffect, useState } from 'react';
import Printer from './components/Printer.jsx';
import Desk from './components/Desk.jsx';
import Graveyard from './components/Graveyard.jsx';
import Notice from './components/Notice.jsx';
import Odometer from './components/Odometer.jsx';
import { InkFilters, Underline } from './components/Doodles.jsx';
import { api } from './lib/api.js';
import { sfx } from './lib/sfx.js';
import { usePref } from './lib/util.js';

const POLL_MS = 4000;

function readNotice() {
  const params = new URLSearchParams(window.location.search);
  const rip = params.get('rip');
  const lost = params.get('lost');
  if (!rip && !lost) return null;
  return rip ? { kind: 'rip', code: rip } : { kind: 'lost', code: lost };
}

export default function App() {
  const [theme, setTheme] = usePref('stub.theme', () => document.documentElement.dataset.theme || 'light');
  const [sound, setSound] = usePref('stub.sound', true);
  const [view, setView] = useState('desk');
  const [links, setLinks] = useState([]);
  const [buried, setBuried] = useState([]);
  const [stats, setStats] = useState({ links: 0, clicks: 0, base: '' });
  const [offline, setOffline] = useState('');
  const [notice, setNotice] = useState(readNotice);
  const [claim, setClaim] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => sfx.setEnabled(sound), [sound]);

  // Tidy ?rip= / ?lost= out of the address bar once the notice has been read.
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [l, b, s] = await Promise.all([api.list(), api.graveyard(), api.stats()]);
      setLinks(l);
      setBuried(b);
      setStats(s);
      setOffline('');
    } catch (err) {
      setOffline(err.message);
    }
  }, []);

  // Poll so click counters roll up live while you share your links.
  useEffect(() => {
    refresh();
    const id = setInterval(() => document.visibilityState === 'visible' && refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  async function bury(code) {
    try {
      await api.bury(code);
    } finally {
      refresh();
    }
  }

  async function revive(code) {
    sfx.zap();
    try {
      await api.revive(code);
    } finally {
      refresh();
    }
  }

  function show(next) {
    setView(next);
    requestAnimationFrame(() => document.getElementById('desk-or-graveyard')?.scrollIntoView({ behavior: 'smooth' }));
  }

  return (
    <>
      <InkFilters />

      <header className="masthead">
        <a className="logo" href="/" aria-label="stub. home">
          stub<span>.</span>
        </a>
        <p className="label masthead-tag">Link printing co. · Est. 2026</p>
        <nav className="tabs" aria-label="Sections">
          <button aria-current={view === 'desk' ? 'page' : undefined} onClick={() => show('desk')}>
            The Desk <sup>{links.length}</sup>
          </button>
          <button aria-current={view === 'graveyard' ? 'page' : undefined} onClick={() => show('graveyard')}>
            Graveyard <sup>{buried.length}</sup>
          </button>
        </nav>
        <div className="toggles">
          <button className="toggle" onClick={() => setSound((s) => !s)} aria-pressed={sound} title="Printer sounds">
            {sound ? '♪ sound on' : '♪ muted'}
          </button>
          <button
            className="toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title="Switch theme"
          >
            {theme === 'dark' ? '☀ paper' : '☾ darkroom'}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <p className="label kicker">No. 01 — A link printer for the impatient</p>
          <h1>
            Long links,
            <br />
            <em>printed</em>{' '}
            <span className="scribble">
              short
              <Underline />
            </span>
            .
          </h1>
          <p className="lede">
            Paste an unwieldy URL. We’ll set it in type, stamp it, and hand you a stub to tear off and share.
          </p>
          <div className="counters">
            <div>
              <span className="label">Links printed</span>
              <Odometer value={stats.links} digits={5} />
            </div>
            <div>
              <span className="label">Clicks served</span>
              <Odometer value={stats.clicks} digits={5} />
            </div>
          </div>
        </section>

        {offline && (
          <p className="offline" role="alert">
            {offline}
          </p>
        )}

        <Printer key={claim?.at} base={stats.base} claim={claim} onPrinted={refresh} />

        <div id="desk-or-graveyard">
          {view === 'desk' ? (
            <Desk links={links} onBury={bury} />
          ) : (
            <Graveyard buried={buried} onRevive={revive} />
          )}
        </div>
      </main>

      <footer className="colophon">
        <p className="hand">no links were harmed in the making of this site. a few were buried.</p>
        <p className="label">
          Set in Fraunces, Schibsted Grotesk &amp; JetBrains Mono · Built with MongoDB, Express, React &amp; Node
        </p>
      </footer>

      {notice && (
        <Notice notice={notice} onClose={() => setNotice(null)} onClaim={(code) => setClaim({ code, at: Date.now() })} />
      )}
    </>
  );
}
