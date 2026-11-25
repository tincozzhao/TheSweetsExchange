import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { asset } from '../lib/assets.js';
import { EASE } from './Reveal.jsx';

// Soft, layered drop shadow so the cut-out cookie looks like it is resting on the cloth.
const SHADOW =
  'drop-shadow(0 6px 5px rgba(80, 40, 30, 0.34)) drop-shadow(0 18px 16px rgba(80, 40, 30, 0.22))';

// The real pink plaid cloth photo as the backdrop, with the original cookie photo on top.
// Presentational only (no animation, no click) — used on the menu cards and in the viewer.
export function CookieOnPlaid({ src, alt, className = '', tilt = '', eager = false, inset = 'p-[8%]' }) {
  return (
    <div
      className={`relative overflow-hidden bg-blush bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${asset('images/plaid.jpg')})` }}
    >
      <div className={`absolute inset-0 flex items-center justify-center ${inset}`}>
        <img
          src={asset(src)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
          className={`max-h-full max-w-full object-contain transition-transform duration-700 ease-out ${tilt}`}
          style={{ filter: SHADOW }}
        />
      </div>
    </div>
  );
}

// One of the two photos on a cookie page. It fades and slides in on its own, grows
// slightly on hover, and opens the enlarged view when clicked.
export default function PlaidPhoto({ src, alt, caption, side = 'left', delay = 0, onOpen, eager }) {
  const fromX = side === 'left' ? -28 : 28;
  return (
    <motion.figure
      className="m-0"
      initial={{ opacity: 0, x: fromX, y: 24 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Enlarge photo: ${alt}`}
        className="group relative block w-full rounded-[2rem] text-left shadow-paper outline-offset-4"
      >
        <CookieOnPlaid
          src={src}
          alt={alt}
          eager={eager}
          className="aspect-square rounded-[2rem]"
          tilt={`${side === 'left' ? '-rotate-2' : 'rotate-1'} group-hover:scale-[1.06] group-focus-visible:scale-[1.06]`}
        />
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-choc opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>
      <figcaption className="mt-4 text-center font-serif text-2xl italic text-choc/85">
        {caption} <span className="text-rose">♡</span>
      </figcaption>
    </motion.figure>
  );
}
