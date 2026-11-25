import { motion } from 'framer-motion';
import { ArrowUpRight, Instagram } from 'lucide-react';
import Photo from './Photo.jsx';
import Reveal, { EASE } from './Reveal.jsx';
import { Float, Heart } from './Doodles.jsx';
import { GALLERY, SITE } from '../data/site.js';

// Editorial grid: 4 columns x 3 rows on larger screens, filled exactly by 7 tiles.
const LAYOUT = [
  'col-span-2 row-span-2',
  '',
  '',
  'row-span-2',
  '',
  'col-span-2',
  '',
];
const TONES = ['butter', 'pink', 'beige', 'orange', 'butter', 'pink', 'beige'];

export default function InstagramGallery() {
  const { handle, url } = SITE.instagram;

  return (
    <section id="gallery" className="relative scroll-mt-16 overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-hand text-3xl text-burnt">follow along</p>
            <h2 className="mt-2 text-5xl font-semibold leading-none tracking-tight text-cocoa sm:text-7xl">
              On the <span className="italic text-burnt">&lsquo;gram</span>
            </h2>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary group"
          >
            <Instagram className="h-5 w-5" aria-hidden="true" />@{handle}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Reveal>

        <div className="mt-12 grid auto-rows-[9.5rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:gap-4 md:auto-rows-[13rem] md:grid-cols-4">
          {GALLERY.slice(0, LAYOUT.length).map((item, i) => (
            <motion.a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.caption || 'View this photo'} on Instagram, @${handle} (opens in a new tab)`}
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: EASE }}
              className={`group relative block overflow-hidden rounded-[1.5rem] shadow-soft ${LAYOUT[i]}`}
            >
              <Photo
                src={item.src}
                alt={item.alt || `A photo from ${SITE.name}`}
                label={`Gallery photo ${i + 1}`}
                tone={TONES[i]}
                imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-110"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cocoa/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Heart className="h-10 w-10 text-strawberry" />
                {item.caption && (
                  <span className="px-4 text-center font-hand text-2xl text-vanilla">
                    {item.caption}
                  </span>
                )}
              </span>
            </motion.a>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <p className="font-hand text-3xl text-cocoa/80">
            more crumbs &amp; cuteness over on Instagram &rarr;
          </p>
        </Reveal>
      </div>

      <Float className="absolute right-[4%] top-20 hidden md:block" duration={8}>
        <Heart className="h-12 w-12 text-strawberry" />
      </Float>
    </section>
  );
}
