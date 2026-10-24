import { useMemo } from 'react';
import { hashOf } from '../lib/util.js';

// A barcode that is unique (and stable) per short code. Purely decorative.
export function Barcode({ code }) {
  const bars = useMemo(() => {
    const out = [];
    for (let i = 0, seed = hashOf(code); i < 44; i++) {
      seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
      out.push([1 + ((seed >>> 16) % 3), 1 + ((seed >>> 20) % 2)]);
    }
    return out;
  }, [code]);

  return (
    <div className="barcode" aria-hidden="true">
      {bars.map(([w, gap], i) => (
        <i key={i} style={{ width: w, marginRight: gap }} />
      ))}
    </div>
  );
}

export function Sparkline({ data = [] }) {
  const max = Math.max(1, ...data);
  return (
    <svg className="spark" viewBox="0 0 56 24" role="img" aria-label={`Clicks over the last 7 days: ${data.join(', ')}`}>
      {data.map((v, i) => {
        const h = Math.max(1.5, (v / max) * 22);
        return <rect key={i} x={i * 8 + 1} y={24 - h} width="5" height={h} rx="1" className={i === 6 ? 'today' : ''} />;
      })}
    </svg>
  );
}
