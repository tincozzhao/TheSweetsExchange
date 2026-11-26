import LaceSides from './LaceSides.jsx';
import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react';
import Photo from './Photo.jsx';
import { CookieOnPlaid } from './PlaidPhoto.jsx';
import Reveal, { EASE } from './Reveal.jsx';
import { AVAILABILITY, isUnavailable, POPULAR, POPULAR_BADGE, PRODUCTS } from '../data/products.js';
import { SITE } from '../data/site.js';
import { formatPrice } from '../lib/format.js';
import { cookieHref } from '../lib/router.js';
import { asset } from '../lib/assets.js';

export default function FreshlyBaked({ order, onAdd }) {
  const scroller = useRef(null);
  const reduce = useReducedMotion();

  const scrollByCard = (dir) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector('article');
    const step = (card ? card.offsetWidth : 320) + 24;
    el.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section
      id="menu"
      className="scroll-mt-16 bg-[#3b2217] bg-cover bg-center py-24 sm:py-32"
      style={{ backgroundImage: `url(${asset('images/menu-bg.webp')})`, '--lace': `url(${asset('images/lace.webp')})` }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-5 sm:px-8">
        <Reveal className="lace-panel max-w-2xl">
          <LaceSides />
          <p className="font-hand text-3xl text-burnt">fresh from the kitchen</p>
          <h2 className="mt-2 text-5xl font-semibold leading-none tracking-tight text-cocoa sm:text-7xl">
            Freshly <span className="italic text-burnt">baked</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-cocoa/80">
            Every flavor comes in a box of 3 cookies, all the same flavor, for $12. Scroll through,
            then add anything you fancy to your order.
          </p>
        </Reveal>

        <div className="flex items-center gap-3 ">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous sweets"
            className="grid h-12 w-12 place-items-center rounded-full border-2 border-vanilla text-vanilla transition-colors hover:bg-vanilla hover:text-cocoa"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next sweets"
            className="grid h-12 w-12 place-items-center rounded-full border-2 border-vanilla bg-vanilla text-cocoa transition-colors hover:border-burnt hover:bg-burnt hover:text-vanilla"
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Freshly baked sweets. Scroll horizontally to see more."
        className="slim-scrollbar edge-pad relative mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-5 pb-10 pt-2"
      >
        {PRODUCTS.map((p, i) => {
          const price = formatPrice(p.price);
          // no "Available" tag; flagged flavors get "Popular", other statuses (sold out, limited...) still show
          const avail =
            p.availability && p.availability !== 'available'
              ? AVAILABILITY[p.availability]
              : POPULAR.has(p.id)
                ? POPULAR_BADGE
                : null;
          const soldOut = isUnavailable(p);
          const qty = order[p.id] || 0;
          // Cookies with a page are clickable: photo, name and "details" link all open it.
          const href = p.page ? cookieHref(p.slug) : null;
          const photo = p.image ? (
            <Photo
              src={p.image}
              alt={p.imageAlt}
              label={p.name}
              tone={['butter', 'pink', 'beige', 'orange'][i % 4]}
              imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-110"
            />
          ) : p.page ? (
            <CookieOnPlaid
              src={p.page.top}
              alt={p.page.topAlt}
              className="h-full w-full"
              tilt="-rotate-2 group-hover:scale-110"
            />
          ) : (
            <Photo src={null} label={p.name} tone={['butter', 'pink', 'beige', 'orange'][i % 4]} />
          );

          return (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.85, delay: (i % 4) * 0.1, ease: EASE }}
              className="group w-[78vw] max-w-[380px] shrink-0 snap-start rounded-[2.25rem] bg-vanilla p-3 shadow-paper sm:w-[360px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-paper">
                {href ? (
                  <a
                    href={href}
                    aria-label={`${p.name}: see the full cookie and what's inside`}
                    className="block h-full w-full"
                  >
                    {photo}
                  </a>
                ) : (
                  photo
                )}
                <span className="pointer-events-none absolute left-4 top-4 font-hand text-2xl text-[#a37e96]">
                  no. {String(i + 1).padStart(2, '0')}
                </span>
                {avail && (
                  <span
                    className={`pointer-events-none absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${avail.tone}`}
                  >
                    {avail.label}
                  </span>
                )}
                {p.placeholder && SITE.showPlaceholderFlags && (
                  <span className="pointer-events-none absolute bottom-4 left-4 -rotate-3 rounded-md bg-vanilla px-3 py-1 font-hand text-xl text-burnt shadow-soft">
                    sample slot
                  </span>
                )}
              </div>

              <div className="px-3 pb-3 pt-5">
                <h3 className="text-center text-2xl font-semibold leading-tight text-cocoa">
                  {href ? (
                    <a href={href} className="transition-colors duration-300 hover:text-burnt">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </h3>
                {price && (
                  <p className="mt-2 text-center font-serif text-3xl leading-none text-burnt">
                    {price}
                    {p.unit && (
                      <span className="mt-1.5 block font-sans text-xs font-bold uppercase tracking-[0.16em] text-cocoa/70">
                        per {p.unit}
                      </span>
                    )}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={() => onAdd(p.id)}
                  disabled={soldOut}
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                    soldOut
                      ? 'cursor-not-allowed border-cocoa/20 text-cocoa/40'
                      : qty
                        ? 'border-burnt bg-burnt text-vanilla'
                        : 'border-cocoa text-cocoa hover:bg-cocoa hover:text-vanilla'
                  }`}
                >
                  {qty ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}
                  {soldOut ? (p.availability === 'unavailable' ? 'Unavailable' : 'Sold out') : qty ? `In your order · ${qty}` : 'Add to order'}
                  <span className="sr-only"> {p.name}</span>
                </button>
                {href && (
                  <a
                    href={href}
                    className="inline-flex items-center gap-1 text-sm font-bold text-burnt underline-offset-4 hover:underline"
                  >
                    See inside
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only"> {p.name}</span>
                  </a>
                )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
