import { useState } from 'react';
import Odometer from './Odometer.jsx';
import { Sparkline } from './Marks.jsx';
import { copyText, prettyUrl, stampDate, ticketNo, tiltFor } from '../lib/util.js';
import { sfx } from '../lib/sfx.js';

function LinkCard({ link, onBury }) {
  const [copied, setCopied] = useState(false);
  const [sinking, setSinking] = useState(false);

  async function copy() {
    await copyText(link.shortUrl);
    sfx.tear();
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function bury() {
    sfx.thud();
    setSinking(true);
    setTimeout(() => onBury(link.code), 550);
  }

  return (
    <li className={`card ${sinking ? 'is-sinking' : ''}`} style={{ '--tilt': `${tiltFor(link.code)}deg` }}>
      <p className="card-meta label">
        <span>{ticketNo(link.ticketNo)}</span>
        <span>{stampDate(link.createdAt)}</span>
      </p>

      <button className="card-short" onClick={copy} title="Copy short link">
        {prettyUrl(link.shortUrl)}
        {copied && <span className="card-copied">copied!</span>}
      </button>
      <a className="card-long" href={link.url} target="_blank" rel="noreferrer" title={link.url}>
        ↳ {prettyUrl(link.url)}
      </a>

      <div className="card-stats">
        <div>
          <span className="label">Clicks</span>
          <Odometer value={link.clicks} />
        </div>
        <div className="card-spark">
          <span className="label">7 days</span>
          <Sparkline data={link.week} />
        </div>
      </div>

      <div className="card-actions">
        <button className="chip" onClick={copy}>
          Copy
        </button>
        <a className="chip" href={link.shortUrl} target="_blank" rel="noreferrer">
          Visit ↗
        </a>
        <button className="chip chip-danger" onClick={bury} disabled={sinking}>
          Bury it
        </button>
      </div>
    </li>
  );
}

export default function Desk({ links, onBury }) {
  return (
    <section className="section" id="desk" aria-labelledby="desk-title">
      <header className="section-head">
        <p className="label">Your stubs · {links.length} in circulation</p>
        <h2 id="desk-title">The Desk.</h2>
        <p className="section-sub">Click counts roll in live. Copy a stub, or bury the ones you’re done with.</p>
      </header>

      {links.length === 0 ? (
        <div className="empty">
          <p className="hand">nothing printed yet… the printer is getting bored.</p>
        </div>
      ) : (
        <ul className="cards">
          {links.map((link) => (
            <LinkCard key={link.code} link={link} onBury={onBury} />
          ))}
        </ul>
      )}
    </section>
  );
}
