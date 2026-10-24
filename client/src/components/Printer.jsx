import { useRef, useState } from 'react';
import Ticket from './Ticket.jsx';
import { CurlyArrow } from './Doodles.jsx';
import { api } from '../lib/api.js';
import { sfx } from '../lib/sfx.js';
import { prettyUrl } from '../lib/util.js';

// `claim` (from the Lost & Found note) pre-fills the alias; App remounts us when it changes.
export default function Printer({ base, onPrinted, claim }) {
  const claimed = claim ? claim.code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) : '';
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState(claimed);
  const [aliasOpen, setAliasOpen] = useState(Boolean(claimed));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [run, setRun] = useState(0);
  const urlRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    if (!url.trim()) {
      setError('Feed me a link first.');
      urlRef.current?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const link = await api.create(url, aliasOpen ? alias.trim() || undefined : undefined);
      sfx.print();
      setTicket(link);
      setRun((n) => n + 1);
      setUrl('');
      setAlias('');
      onPrinted?.(link);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="printer" aria-label="Shorten a link">
      <p className="margin-note" aria-hidden="true">
        paste the monster here
        <CurlyArrow />
      </p>

      <form className={`machine ${busy ? 'is-busy' : ''}`} onSubmit={submit} noValidate>
        <div className="machine-top">
          <span className="label">Model S-1 · Link printer</span>
          <span className={`led ${ticket && !busy ? 'is-ready' : ''}`} aria-hidden="true" />
        </div>

        <div className="feed">
          <label className="sr-only" htmlFor="url">
            Long URL
          </label>
          <input
            id="url"
            ref={urlRef}
            autoFocus={Boolean(claimed)}
            className="field"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck="false"
            placeholder="https://a-very-long-and-unwieldy.link/that/goes/on?and=on"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
          />
          <button className="btn btn-print" type="submit" disabled={busy}>
            {busy ? 'Printing…' : 'Print it'}
            <kbd aria-hidden="true">↵</kbd>
          </button>
        </div>

        <div className="machine-bottom">
          {aliasOpen ? (
            <label className="alias">
              <span className="alias-prefix">{base ? `${prettyUrl(base)}/` : '/'}</span>
              <input
                className="alias-field"
                value={alias}
                maxLength={32}
                placeholder="your-word"
                onChange={(e) => {
                  setAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''));
                  setError('');
                }}
                aria-label="Custom alias"
              />
              <button type="button" className="link-btn" onClick={() => setAliasOpen(false)}>
                never mind
              </button>
            </label>
          ) : (
            <button type="button" className="link-btn" onClick={() => setAliasOpen(true)}>
              + choose your own ending
            </button>
          )}
          {error && (
            <p className="error" role="alert" key={error}>
              {error}
            </p>
          )}
        </div>
      </form>

      <div className="slot" aria-hidden="true" />
      {ticket ? (
        <Ticket key={run} link={ticket} />
      ) : (
        <p className="slot-hint">your ticket will print right here</p>
      )}
    </section>
  );
}
