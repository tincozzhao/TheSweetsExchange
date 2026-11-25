import { motion, useReducedMotion } from 'framer-motion';

// Small hand-drawn illustrations. They inherit colour from `currentColor`
// (set with a text-* class) and are purely decorative (aria-hidden).

const base = {
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function Cookie({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path
        d="M50 9c18-1 38 12 40 32 2 19-9 40-30 46-20 6-43-4-49-24C5 42 17 11 50 9z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M38 20c-3 3-4 8-1 11" />
      <circle cx="35" cy="42" r="4" fill="currentColor" />
      <circle cx="58" cy="30" r="3.5" fill="currentColor" />
      <circle cx="66" cy="55" r="4.2" fill="currentColor" />
      <circle cx="44" cy="66" r="3.6" fill="currentColor" />
      <circle cx="26" cy="62" r="2.6" fill="currentColor" />
      <circle cx="52" cy="48" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Heart({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path
        d="M50 86C20 63 9 46 17 30c8-14 25-12 33 2 8-14 25-16 33-2 8 16-3 33-33 56z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M27 30c-4 3-6 8-5 12" />
    </svg>
  );
}

export function Whisk({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path d="M50 96V58" />
      <path d="M50 58C28 52 26 22 50 8c24 14 22 44 0 50z" />
      <path d="M50 58C39 47 39 24 50 8c11 16 11 39 0 50z" />
      <path d="M50 58C45 46 45 24 50 8" />
      <path d="M44 62h12" />
    </svg>
  );
}

export function Wheat({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path d="M50 96C50 70 50 42 50 12" />
      <path d="M50 30c-10-2-15-9-15-17 10 1 15 7 15 17z" />
      <path d="M50 30c10-2 15-9 15-17-10 1-15 7-15 17z" />
      <path d="M50 52c-10-2-15-9-15-17 10 1 15 7 15 17z" />
      <path d="M50 52c10-2 15-9 15-17-10 1-15 7-15 17z" />
      <path d="M50 74c-10-2-15-9-15-17 10 1 15 7 15 17z" />
      <path d="M50 74c10-2 15-9 15-17-10 1-15 7-15 17z" />
    </svg>
  );
}

export function Egg({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path
        d="M50 10c17 0 29 28 29 47a29 29 0 0 1-58 0c0-19 12-47 29-47z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M36 44c-3 6-3 12 0 17" />
    </svg>
  );
}

export function Sprinkles({ className = '' }) {
  return (
    <svg {...base} strokeWidth="5" className={className}>
      <path d="M14 22l9 4" />
      <path d="M52 10l-3 10" />
      <path d="M80 26l-8 6" />
      <path d="M30 56l10-3" />
      <path d="M68 58l4 9" />
      <path d="M16 84l8-6" />
      <path d="M52 86l9 3" />
      <path d="M88 80l-6-5" />
    </svg>
  );
}

export function Flower({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      <path d="M50 42C40 30 42 14 50 10c8 4 10 20 0 32z" />
      <path d="M58 50c12-10 28-8 32 0-4 8-20 10-32 0z" />
      <path d="M50 58c10 12 8 28 0 32-8-4-10-20 0-32z" />
      <path d="M42 50C30 60 14 58 10 50c4-8 20-10 32 0z" />
    </svg>
  );
}

// Gently bobs and tilts. Stays still for people who prefer reduced motion.
export function Float({
  children,
  className = '',
  delay = 0,
  duration = 6,
  y = 14,
  rotate = 6,
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={reduce ? undefined : { y: [0, -y, 0], rotate: [-rotate, rotate, -rotate] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
