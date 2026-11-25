import { SITE } from '../data/site.js';
import { asset } from '../lib/assets.js';
import { Cookie } from './Doodles.jsx';

const TONES = {
  beige: 'bg-beige',
  butter: 'bg-butter',
  pink: 'bg-strawberry/60',
  orange: 'bg-burnt/30',
};

// Shows a real photo when `src` is set. Otherwise shows a clearly-labelled,
// replaceable placeholder — we never pass off stock imagery as bakery products.
export default function Photo({
  src,
  alt = '',
  label = 'Photo',
  tone = 'beige',
  className = '',
  imgClassName = '',
  priority = false,
}) {
  if (src) {
    return (
      <img
        src={asset(src)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Placeholder image: ${label}`}
      className={`paper relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden p-6 text-center ${
        TONES[tone] || TONES.beige
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-3 rounded-[inherit] border-2 border-dashed border-cocoa/25"
      />
      <Cookie className="h-12 w-12 text-cocoa/40" />
      {SITE.showPlaceholderFlags && (
        <>
          <span className="font-hand text-2xl leading-none text-cocoa/70">Photo goes here</span>
          <span className="max-w-[20ch] text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cocoa/50">
            {label}
          </span>
        </>
      )}
    </div>
  );
}
