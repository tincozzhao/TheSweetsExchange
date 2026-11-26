import { motion } from 'framer-motion';
import Photo from './Photo.jsx';
import Reveal, { EASE } from './Reveal.jsx';
import { Heart } from './Doodles.jsx';
import { SITE } from '../data/site.js';
import { asset } from '../lib/assets.js';

// Rotation is applied through Motion (not Tailwind classes) because Motion
// writes its own inline `transform`, which would otherwise wipe out a
// Tailwind rotate-* class as soon as the entrance animation starts.
const FRAMES = [
  { cls: 'left-0 top-4 w-[58%]', rot: -3, tone: 'butter', tape: '-top-3 left-8 -rotate-[8deg]' },
  { cls: 'right-0 top-0 w-[46%]', rot: 4, tone: 'pink', tape: '-top-3 right-6 rotate-[7deg]' },
  { cls: 'bottom-0 left-[16%] w-[54%]', rot: 2, tone: 'beige', tape: '-top-3 left-1/2 -rotate-[4deg]' },
];

const NOTES = [
  { text: 'baked with love', cls: 'right-[2%] top-[52%]', rot: 6 },
  { text: 'sweeter together', cls: 'left-[0%] bottom-[2%]', rot: -6 },
];

// `instant`: skip the pieces' own entrance animations so the whole page moves as one
// (used when a page transition already slides the page in).
export default function OurStory({ instant = false }) {
  const { story } = SITE;
  const paragraphs = story.paragraphs.filter((p) => !p.placeholder || SITE.showPlaceholderFlags);

  return (
    <section id="story" className="relative flex min-h-[100svh] scroll-mt-16 items-center justify-center overflow-hidden py-24 sm:py-28"
      style={{ backgroundImage: `url(${asset('images/transitions/stripes-pink.webp')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="mx-auto grid w-full max-w-[88rem] items-center justify-items-center gap-14 px-5 sm:px-10 lg:grid-cols-2 lg:gap-20">
        {/* Scrapbook collage */}
        <div className="relative mx-auto h-[32rem] w-full max-w-2xl sm:h-[42rem]">
          {FRAMES.map((frame, i) => {
            const photo = story.photos[i] || {};
            return (
              <motion.figure
                key={i}
                data-story-polaroid={i}
                data-rot={frame.rot}
                initial={instant ? false : { opacity: 0, y: 50, rotate: frame.rot }}
                whileInView={{ opacity: 1, y: 0, rotate: frame.rot }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: i * 0.15, ease: EASE }}
                whileHover={{ rotate: 0, scale: 1.04, zIndex: 20 }}
                className={`absolute bg-vanilla p-2.5 pb-8 shadow-paper ${frame.cls}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute z-10 h-6 w-20 bg-butter/80 shadow-soft ${frame.tape}`}
                />
                <div className="aspect-[4/5] overflow-hidden">
                  <Photo
                    src={photo.src}
                    alt={photo.alt || ''}
                    label={`Story photo ${i + 1}`}
                    tone={frame.tone}
                  />
                </div>
                {photo.caption && (
                  <figcaption className="absolute inset-x-0 bottom-1.5 text-center font-hand text-xl text-cocoa/80">
                    {photo.caption}
                  </figcaption>
                )}
              </motion.figure>
            );
          })}

          {NOTES.map((note) => (
            <motion.p
              key={note.text}
              initial={instant ? false : { opacity: 0, scale: 0.7, rotate: note.rot }}
              whileInView={{ opacity: 1, scale: 1, rotate: note.rot }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.5 }}
              className={`absolute z-30 bg-butter px-4 py-2 font-hand text-2xl text-cocoa shadow-soft ${note.cls}`}
            >
              {note.text}
            </motion.p>
          ))}

        </div>

        {/* Story text */}
        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <Reveal instant={instant} className="flex flex-col items-center">
            <p className="font-hand text-4xl text-burnt">the people &amp; the passion</p>
            <h2 className="mt-2 text-6xl font-semibold leading-none tracking-tight text-cocoa sm:text-8xl">
              Our <span className="italic text-burnt">story</span>
            </h2>
            <svg
              viewBox="0 0 220 14"
              className="mx-auto mt-5 h-4 w-56 text-strawberry"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 8c15-9 25 9 40 0s25 9 40 0 25 9 40 0 25 9 40 0 25 9 40 0" />
            </svg>
          </Reveal>

          <div className="mt-8 space-y-6 text-xl leading-relaxed text-cocoa/85 sm:text-2xl">
            {paragraphs.map((p, i) => (
              <Reveal key={i} instant={instant} delay={0.1 + i * 0.1}>
                <p className={p.placeholder ? 'font-hand text-2xl leading-snug text-burnt' : ''}>
                  {p.text}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal instant={instant} delay={0.3} className="mt-10 flex items-center justify-center gap-3">
            <Heart className="h-9 w-9 text-burnt" />
            <p className="font-hand text-4xl text-cocoa">{story.signoff}</p>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
