import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Gift, Plus } from 'lucide-react';
import Photo from './Photo.jsx';
import Reveal, { EASE } from './Reveal.jsx';
import { asset } from '../lib/assets.js';
import { Egg, Float, Heart, Sprinkles } from './Doodles.jsx';
import { AVAILABILITY, BOXES } from '../data/products.js';
import { formatPrice } from '../lib/format.js';

// `entered` (optional): when given, the photos slide in from the left and the copy/picker from the
// right once it becomes true (the home page's scroll transition drives it).
export default function LittleBox({ order, onAdd, entered }) {
  const slide = typeof entered === 'boolean';
  const off = typeof window === 'undefined' ? 600 : Math.round(window.innerWidth * 0.8);
  const startedIn = useRef(entered).current; // already complete when the page opens: no slide
  const side = (dir) => ({
    initial: slide ? (startedIn ? { x: 0, opacity: 1 } : { x: dir * off, opacity: 0 }) : false,
    animate: slide ? (entered ? { x: 0, opacity: 1 } : { x: dir * off, opacity: 0 }) : undefined,
    transition: { duration: 1, ease: EASE },
  });
  const [index, setIndex] = useState(0);
  const box = BOXES[index];
  if (!box) return null;

  const price = formatPrice(box.price);
  const avail = box.availability ? AVAILABILITY[box.availability] : null;
  const soldOut = box.availability === 'sold-out';
  const qty = order[box.id] || 0;

  return (
    <section
      id="boxes"
      className="paper relative flex min-h-[100svh] scroll-mt-16 items-center overflow-hidden bg-butter py-24 sm:py-32"
    >
      <Float className="absolute left-[4%] top-16 hidden md:block" duration={8}>
        <Egg className="h-14 w-14 text-cocoa/60" />
      </Float>
      <Float className="absolute bottom-16 right-[6%] hidden md:block" delay={1} duration={7}>
        <Sprinkles className="h-16 w-16 text-burnt" />
      </Float>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-12">
        {/* Big, slightly tilted photo with a smaller one overlapping */}
        <motion.div className="lg:col-span-7" {...side(-1)}>
        <Reveal className="relative" y={40}>
          <div className="relative -rotate-2 overflow-hidden rounded-[2.5rem] border-[8px] border-vanilla bg-vanilla shadow-paper">
            {/* a small flower in the top-right corner; the scroll transition zooms into it */}
            <img
              data-flower-anchor
              src={asset('images/transitions/flower.webp')}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="pointer-events-none absolute right-4 top-4 z-10 w-8 sm:w-11"
              style={{ filter: 'drop-shadow(0 3px 4px rgba(89,58,43,0.3))' }}
            />
            <div className="aspect-[5/4]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={box.id}
                  className="h-full w-full"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Photo
                    src={box.image}
                    alt={box.imageAlt}
                    label={`${box.name} — lifestyle photo`}
                    tone="pink"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-2 hidden w-40 rotate-6 overflow-hidden rounded-3xl border-[6px] border-vanilla shadow-paper sm:block md:w-52">
            <div className="aspect-square">
              <AnimatePresence mode="wait">
                <motion.div
                  key={box.id}
                  className="h-full w-full"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Photo
                    src={box.detailImage}
                    alt={box.detailAlt}
                    label={`${box.name} — close-up`}
                    tone="beige"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <Float className="absolute -left-5 -top-6" duration={6}>
            <Heart className="h-14 w-14 text-burnt" />
          </Float>
        </Reveal>
        </motion.div>

        {/* Copy + interactive picker */}
        <motion.div className="lg:col-span-5" {...side(1)}>
          <Reveal>
            <p className="flex items-center gap-2 font-hand text-3xl text-burnt">
              <Gift className="h-6 w-6" aria-hidden="true" /> a little box of happiness
            </p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight text-cocoa sm:text-6xl">
              Good things come in{' '}
              <span className="italic text-burnt">sweet little boxes.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <div role="group" aria-label="Choose a box" className="flex flex-wrap gap-2">
              {BOXES.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={i === index}
                  onClick={() => setIndex(i)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    i === index
                      ? 'border-cocoa bg-cocoa text-vanilla'
                      : 'border-cocoa/40 text-cocoa hover:border-cocoa'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            <div className="mt-6 min-h-[15rem] rounded-[2rem] bg-vanilla p-6 shadow-soft sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={box.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-cocoa">{box.name}</h3>
                    {price && <span className="font-serif text-xl text-burnt">{price}</span>}
                  </div>
                  {(box.size || avail) && (
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-cocoa/70">
                      {box.size && <span>{box.size}</span>}
                      {avail && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${avail.tone}`}
                        >
                          {avail.label}
                        </span>
                      )}
                    </p>
                  )}
                  <p className="mt-3 leading-relaxed text-cocoa/80">{box.description}</p>

                  {box.contents.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="What's inside">
                      {box.contents.map((item, i) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
                          whileHover={{ y: -3, rotate: -2 }}
                          className="rounded-full bg-strawberry/60 px-3 py-1 text-sm font-medium text-cocoa"
                        >
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    box.note && <p className="mt-4 font-hand text-2xl text-burnt">{box.note}</p>
                  )}

                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => onAdd(box.id)}
                    className={`mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 ${
                      soldOut
                        ? 'cursor-not-allowed bg-cocoa/10 text-cocoa/40'
                        : qty
                          ? 'bg-burnt text-vanilla'
                          : 'bg-cocoa text-vanilla hover:bg-burnt'
                    }`}
                  >
                    {qty ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    )}
                    {soldOut ? 'Sold out' : qty ? `In your order · ${qty}` : 'Add this box to my order'}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
