import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Barcode } from './Marks.jsx';
import { copyText, prettyUrl, stampDate, ticketNo } from '../lib/util.js';
import { sfx } from '../lib/sfx.js';

const STAMP_DELAY = 1050; // just after the 1s print animation finishes

export default function Ticket({ link }) {
  const [printed, setPrinted] = useState(false);
  const [torn, setTorn] = useState(false);
  const [qr, setQr] = useState('');

  useEffect(() => {
    QRCode.toString(link.shortUrl, { type: 'svg', margin: 0, color: { dark: '#000', light: '#0000' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [link.shortUrl]);

  useEffect(() => {
    const t = setTimeout(() => sfx.stamp(), STAMP_DELAY);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!torn) return;
    const t = setTimeout(() => setTorn(false), 2600);
    return () => clearTimeout(t);
  }, [torn]);

  async function tear() {
    if (torn) return;
    await copyText(link.shortUrl);
    sfx.tear();
    setTorn(true);
  }

  return (
    <div className={`ticket-window ${printed ? 'is-printed' : ''}`}>
      <article className="ticket" onAnimationEnd={(e) => e.target === e.currentTarget && setPrinted(true)}>
        <div className="ticket-body">
          <p className="ticket-head">
            <span>stub. link printing co.</span>
            <span>— customer copy —</span>
          </p>

          <dl className="ticket-meta">
            <div>
              <dt>Ticket</dt>
              <dd>{ticketNo(link.ticketNo)}</dd>
            </div>
            <div>
              <dt>Issued</dt>
              <dd>{stampDate(link.createdAt, true)}</dd>
            </div>
          </dl>

          <div className="ticket-route">
            <p className="ticket-label">From</p>
            <p className="ticket-long">{link.url}</p>
            <p className="ticket-label">To</p>
            <a className="ticket-short" href={link.shortUrl} target="_blank" rel="noreferrer">
              {prettyUrl(link.shortUrl)}
            </a>
          </div>

          <div className="ticket-foot">
            <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} aria-label="QR code for the short link" role="img" />
            <p>
              Thank you for
              <br />
              shortening.
              <br />
              <strong>Please keep this stub.</strong>
            </p>
          </div>
          <Barcode code={link.code} />

          <span className="stamp" aria-hidden="true">
            {link.custom ? 'Custom made' : 'Shortened'}
          </span>
        </div>

        <button className={`ticket-stub ${torn ? 'is-torn' : ''}`} onClick={tear} aria-label="Copy short link">
          <span>✂ tear here to copy</span>
          <span className="ticket-stub-code">/{link.code}</span>
        </button>
        {torn && (
          <p className="copied-note" role="status">
            copied! go share it ↗
          </p>
        )}
      </article>
    </div>
  );
}
