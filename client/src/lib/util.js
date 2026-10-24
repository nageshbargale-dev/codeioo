import { useEffect, useState } from 'react';

export const prettyUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const ticketNo = (n) => `NO. ${String(n).padStart(6, '0')}`;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function stampDate(value, withTime = false) {
  const d = new Date(value);
  const date = `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  return `${date} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}

// Small deterministic hash so each link gets a stable tilt, barcode and epitaph.
export function hashOf(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

const EPITAPHS = [
  'it redirected so that others might arrive',
  'gone, but never 404gotten',
  "302'd to a better place",
  'short life. as intended.',
  'here lies a link that went the distance',
  'it pointed the way, until it didn’t',
  'loved by many. clicked by some.',
  'now resting in /dev/null',
];

export const epitaphFor = (code) => EPITAPHS[hashOf(code) % EPITAPHS.length];

export const tiltFor = (code, max = 1.4) => (((hashOf(code) % 1000) / 1000) * 2 - 1) * max;

// useState that remembers itself in localStorage (and survives when storage is blocked).
export function usePref(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return typeof initial === 'function' ? initial() : initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}
