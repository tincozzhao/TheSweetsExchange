import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Link as LinkIcon } from 'lucide-react';
import PlaidPhoto, { CookieOnPlaid } from './PlaidPhoto.jsx';
import Lightbox from './Lightbox.jsx';
import { EASE } from './Reveal.jsx';
import { Flower, Float, Heart, Sprinkles } from './Doodles.jsx';
import { AVAILABILITY, COOKIE_PAGES } from '../data/products.js';
import { SITE } from '../data/site.js';
import { cookieHref, shareUrl } from '../lib/router.js';
import { formatPrice } from '../lib/format.js';

const pageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
  exit: (dir) => ({ opacity: 0, x: dir * -60, transition: { duration: 0.28, ease: EASE } }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.45 } },
};
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

function Highlight({ label, items, tone }) {
  return (
    <div>
      <h3 className="font-hand text-2xl text-rose">{label}</h3>
      <ul className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
        {items.map((item) => (
          <li
            key={item}
            className={`rounded-full px-4 py-1.5 text-sm font-bold text-choc ${tone}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Neighbour({ cookie, direction }) {
  const isNext = direction === 'next';
  return (
    <a
      href={cookieHref(cookie.slug)}
      aria-label={`${isNext ? 'Next' : 'Previous'} cookie: ${cookie.name}`}
      className={`group flex items-center gap-4 rounded-[1.5rem] border-2 border-choc/10 bg-cream p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:shadow-soft ${
        isNext ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <CookieOnPlaid
        src={cookie.page.top}
        alt=""
        eager
        inset="p-[6%]"
        className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20"
        tilt="group-hover:scale-110"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-rose">
          {!isNext && <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />}
          {isNext ? 'Next cookie' : 'Previous cookie'}
          {isNext && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
        <span className="mt-0.5 block truncate font-serif text-xl italic text-choc sm:text-2xl">
          {cookie.name}
        </span>
      </span>
    </a>
  );
}

export default function CookiePage({ cookie, qty, onOrder }) {
  const index = COOKIE_PAGES.findIndex((c) => c.slug === cookie.slug);
  const count = COOKIE_PAGES.length;
  const prev = COOKIE_PAGES[(index - 1 + count) % count];
  const next = COOKIE_PAGES[(index + 1) % count];

  // Slide the page left or right depending on which way the visitor is moving.
  const lastIndex = useRef(index);
  let dir = 1;
  const delta = index - lastIndex.current;
  if (delta !== 0) dir = delta > 0 ? 1 : -1;
  if (delta === -(count - 1)) dir = 1;
  if (delta === count - 1) dir = -1;
  useEffect(() => {
    lastIndex.current = index;
  }, [index]);

  const [viewer, setViewer] = useState(null);
  const [copied, setCopied] = useState(false);
  const closeViewer = useCallback(() => setViewer(null), []);

  // Page title and description for browser tabs and shared links.
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content');
    document.title = `${cookie.name} — ${SITE.name}`;
    meta?.setAttribute('content', `${cookie.page.tagline}. ${cookie.page.story}`);
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription != null) meta.setAttribute('content', previousDescription);
    };
  }, [cookie]);

  // Close the viewer and reset when moving to another cookie.
  useEffect(() => {
    setViewer(null);
    setCopied(false);
  }, [cookie.slug]);

  // Left / right arrow keys flip between cookies.
  useEffect(() => {
    const onKey = (e) => {
      if (viewer || e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'ArrowLeft') window.location.hash = cookieHref(prev.slug);
      if (e.key === 'ArrowRight') window.location.hash = cookieHref(next.slug);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewer, prev, next]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(cookie.slug));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copy this link:', shareUrl(cookie.slug));
    }
  };

  const price = formatPrice(cookie.price);
  const avail = cookie.availability ? AVAILABILITY[cookie.availability] : null;
  const soldOut = cookie.availability === 'sold-out';

  return (
    <div className="relative overflow-hidden bg-cream pb-24 pt-24 sm:pt-28">
      {/* soft decorative shapes */}
      <div aria-hidden="true" className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blush/70" />
      <div aria-hidden="true" className="absolute -right-20 top-[34rem] h-64 w-64 rounded-full bg-sage/25" />
      <Float className="absolute left-[5%] top-40 hidden lg:block" duration={8}>
        <Heart className="h-10 w-10 text-rose" />
      </Float>
      <Float className="absolute right-[6%] top-32 hidden lg:block" delay={1} duration={7}>
        <Sprinkles className="h-12 w-12 text-rose/80" />
      </Float>
      <Float className="absolute right-[8%] top-[46rem] hidden lg:block" delay={2} duration={9}>
        <Flower className="h-12 w-12 text-sage" />
      </Float>

      <AnimatePresence mode="wait" custom={dir} initial>
        <motion.article
          key={cookie.slug}
          custom={dir}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          aria-labelledby="cookie-name"
          className="relative mx-auto max-w-6xl px-5 sm:px-8"
        >
          {/* top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a href="#menu" className="btn btn-secondary !border-choc !text-choc hover:!bg-choc hover:!text-cream">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Menu
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-choc/80 transition-colors hover:bg-blush hover:text-choc"
            >
              {copied ? (
                <Check className="h-4 w-4 text-rose" aria-hidden="true" />
              ) : (
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
              )}
              <span aria-live="polite">{copied ? 'Link copied!' : 'Copy link'}</span>
            </button>
          </div>

          {/* title */}
          <header className="mt-10 text-center">
            <p className="font-hand text-3xl text-rose sm:text-4xl">a little bite of happiness</p>
            <h1
              id="cookie-name"
              className="mt-1 text-[3.4rem] font-semibold italic leading-[1] tracking-tight text-choc sm:text-8xl"
            >
              {cookie.name}
            </h1>
            <p className="mt-4 font-serif text-2xl italic text-rose sm:text-3xl">{cookie.page.tagline}</p>
          </header>

          {/* the two photos */}
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:gap-12">
            <PlaidPhoto
              src={cookie.page.top}
              alt={cookie.page.topAlt}
              caption="The outside"
              side="left"
              delay={0.15}
              eager
              onOpen={() => setViewer({ src: cookie.page.top, alt: cookie.page.topAlt })}
            />
            <PlaidPhoto
              src={cookie.page.inside}
              alt={cookie.page.insideAlt}
              caption="The inside"
              side="right"
              delay={0.4}
              eager
              onOpen={() => setViewer({ src: cookie.page.inside, alt: cookie.page.insideAlt })}
            />
          </div>

          {/* description */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto mt-14 max-w-3xl text-center"
          >
            <motion.p variants={rise} className="text-lg leading-relaxed text-choc/90 sm:text-xl">
              {cookie.page.story}
            </motion.p>

            <motion.div
              variants={rise}
              className="mt-10 grid gap-6 rounded-[2rem] bg-blush/60 p-6 text-left sm:grid-cols-2 sm:p-8"
            >
              <Highlight label="flavor notes" items={cookie.page.highlights.flavor} tone="bg-cream" />
              <Highlight label="texture notes" items={cookie.page.highlights.texture} tone="bg-sage/45" />
            </motion.div>

            <motion.div variants={rise} className="mt-10 flex flex-col items-center gap-5">
              <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
                {price && <span className="font-serif text-4xl text-choc">{price}</span>}
                {cookie.unit && (
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-choc/70">
                    {cookie.unit} · all one flavor
                  </span>
                )}
                {avail && (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${avail.tone}`}>
                    {avail.label}
                  </span>
                )}
              </p>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => onOrder(cookie.id)}
                className="btn btn-primary group disabled:cursor-not-allowed disabled:opacity-50"
              >
                {soldOut ? 'Sold out' : 'Order some sweetness'}
                <Heart className="h-5 w-5 text-strawberry transition-transform duration-300 group-hover:scale-125" />
              </button>
              {qty > 0 && (
                <p className="font-hand text-2xl text-rose">{qty} already in your order ♡</p>
              )}
            </motion.div>
          </motion.div>

          {/* previous / next */}
          <nav
            aria-label="More cookies"
            className="relative mt-20 border-t-2 border-dashed border-rose/40 pt-8"
          >
            <p className="mb-5 text-center font-hand text-3xl text-choc/70">
              cookie {index + 1} of {count}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Neighbour cookie={prev} direction="prev" />
              <Neighbour cookie={next} direction="next" />
            </div>
          </nav>
        </motion.article>
      </AnimatePresence>

      {/* scalloped edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-4 bg-choc"
        style={{
          WebkitMask: 'radial-gradient(circle at 50% 100%, transparent 11px, #000 12px) 0 0 / 28px 100%',
          mask: 'radial-gradient(circle at 50% 100%, transparent 11px, #000 12px) 0 0 / 28px 100%',
        }}
      />
      <Lightbox item={viewer} onClose={closeViewer} />
    </div>
  );
}
