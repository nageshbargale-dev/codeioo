// Hand-drawn bits: wobbly underline, curly arrow, and the SVG filter that makes stamps look inked.

export function Underline() {
  return (
    <svg className="underline" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 9 C40 3, 90 13, 150 6 S 240 10, 297 4" />
    </svg>
  );
}

export function CurlyArrow({ className = '' }) {
  return (
    <svg className={`curly-arrow ${className}`} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M8 10 C 40 4, 70 18, 62 40 C 56 56, 30 52, 40 36 C 52 18, 92 40, 104 76" />
      <path d="M92 70 L104 78 L108 63" />
    </svg>
  );
}

export function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="ink-rough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.7"
          result="speckle"
        />
        <feComposite in="SourceGraphic" in2="speckle" operator="in" result="inked" />
        <feDisplacementMap in="inked" in2="noise" scale="2.4" />
      </filter>
    </svg>
  );
}
