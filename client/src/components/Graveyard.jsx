import { epitaphFor, stampDate, tiltFor } from '../lib/util.js';

export function Tombstone({ link, onRevive, big = false }) {
  return (
    <li className={`grave ${big ? 'grave-big' : ''}`} style={{ '--tilt': `${tiltFor(link.code, 2.5)}deg` }}>
      <div className="stone">
        <p className="stone-rip">R.I.P.</p>
        <p className="stone-code">/{link.code}</p>
        <p className="stone-dates">
          {stampDate(link.createdAt)} — {stampDate(link.buriedAt || link.updatedAt || link.createdAt)}
        </p>
        <p className="stone-clicks">
          served {link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}
        </p>
        <p className="stone-epitaph">“{epitaphFor(link.code)}”</p>
      </div>
      <div className="grass" aria-hidden="true" />
      {onRevive && (
        <button className="chip chip-revive" onClick={() => onRevive(link.code)}>
          ⚡ Revive
        </button>
      )}
    </li>
  );
}

export default function Graveyard({ buried, onRevive }) {
  return (
    <section className="section graveyard" id="graveyard" aria-labelledby="graveyard-title">
      <header className="section-head">
        <p className="label">In memoriam · {buried.length} laid to rest</p>
        <h2 id="graveyard-title">The Link Graveyard.</h2>
        <p className="section-sub">
          Buried links stop redirecting, and visitors get a tombstone instead. Changed your mind? You can bring one back.
        </p>
      </header>

      {buried.length === 0 ? (
        <div className="empty">
          <p className="hand">no casualties yet. every link alive &amp; well.</p>
        </div>
      ) : (
        <ul className="graves">
          {buried.map((link) => (
            <Tombstone key={link.code} link={link} onRevive={onRevive} />
          ))}
        </ul>
      )}
    </section>
  );
}
