import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import Photo from './Photo.jsx';
import { Heart } from './Doodles.jsx';
import { EASE } from './Reveal.jsx';
import { SITE } from '../data/site.js';
import { asset } from '../lib/assets.js';

const WORDS = SITE.tagline.split(' ');

const wordContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const word = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.95, ease: EASE } },
};
const fadeUp = (delay) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, delay, ease: EASE } },
});

export default function Hero({ introDone }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const state = introDone ? 'show' : 'hidden';

  return (
    <section
      id="home"
      ref={ref}
      className="relative overflow-hidden bg-vanilla pb-20 pt-28 sm:pt-32"
      style={{ backgroundImage: `url(${asset('images/gingham.webp')})`, backgroundSize: '333px 456px' }}
    >
      {/* Soft background shapes */}
      <div
        aria-hidden="true"
        className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-strawberry/40"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh_-_8rem)] max-w-[90rem] items-center gap-12 px-5 sm:px-8 lg:grid-cols-12">
        {/* Copy */}
        <div className="rounded-[2.5rem] bg-vanilla/90 p-7 shadow-paper backdrop-blur-sm sm:p-10 lg:col-span-7 lg:p-10">
          <motion.p
            initial="hidden"
            animate={state}
            variants={fadeUp(0.05)}
            className="mb-5 font-hand text-4xl text-burnt sm:text-5xl lg:text-6xl"
          >
            from our kitchen to yours
          </motion.p>

          <motion.h1
            initial="hidden"
            animate={state}
            variants={wordContainer}
            aria-label={SITE.tagline}
            className="text-[4.25rem] font-semibold leading-[0.98] tracking-tight text-cocoa sm:text-7xl lg:text-[6rem] xl:text-[6.4rem]"
          >
            {WORDS.map((w, i) => (
              <span
                key={`${w}-${i}`}
                aria-hidden="true"
                className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-bottom"
              >
                <motion.span
                  variants={word}
                  className={`inline-block ${w.startsWith('sweeter') ? 'italic text-burnt' : ''}`}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate={state}
            variants={fadeUp(0.75)}
            className="mt-8 max-w-2xl font-serif text-2xl italic leading-relaxed text-cocoa/85 sm:text-3xl lg:text-4xl"
          >
            {SITE.subtitle}
          </motion.p>

          <motion.div
            initial="hidden"
            animate={state}
            variants={fadeUp(0.95)}
            className="mt-12 flex flex-wrap gap-5"
          >
            <motion.a
              href="#menu"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary group !px-7 !py-4 !text-base sm:!px-10 sm:!py-5 sm:!text-xl"
            >
              Explore Our Sweets
              <ArrowRight
                className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </motion.a>
            <motion.a
              href="#order"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-pink group !px-7 !py-4 !text-base sm:!px-10 sm:!py-5 sm:!text-xl"
            >
              Order Something Sweet
              <Heart className="h-7 w-7 text-burnt transition-transform duration-300 group-hover:scale-125" />
            </motion.a>
          </motion.div>
        </div>

        {/* Photo in an arched frame */}
        <motion.div
          initial="hidden"
          animate={state}
          variants={fadeUp(0.3)}
          className="relative mx-auto w-full max-w-[34rem] lg:col-span-5"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] border-[6px] border-vanilla bg-beige shadow-paper">
            <motion.div style={{ y: photoY }} className="absolute inset-x-0 -top-6 h-[calc(100%_+_4.5rem)]">
              <Photo
                src={SITE.hero.image}
                alt={SITE.hero.imageAlt}
                label="Hero photo — close-up of something freshly baked"
                tone="butter"
                priority
              />
            </motion.div>
          </div>

          {/* Spinning badge */}
          <div className="absolute -left-6 bottom-10 h-32 w-32 rounded-full bg-cocoa p-1.5 text-vanilla shadow-paper sm:-left-14 sm:h-40 sm:w-40">
            <svg
              viewBox="0 0 200 200"
              className="h-full w-full animate-spin-slow"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <path id="badge-circle" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
              </defs>
              <text
                fontSize="20"
                fontWeight="700"
                fill="currentColor"
                className="font-sans uppercase"
                letterSpacing="3"
              >
                <textPath href="#badge-circle" textLength="440" lengthAdjust="spacing">
                  Baked with love ✿ Made to share ✿
                </textPath>
              </text>
            </svg>
            <Heart className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-strawberry" />
          </div>

        </motion.div>
      </div>


      <a
        href="#menu"
        aria-label="Scroll to the menu"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-cocoa/70 sm:flex"
      >
        <span className="font-hand text-xl">scroll</span>
        <ArrowDown className="h-4 w-4 animate-bob" aria-hidden="true" />
      </a>
    </section>
  );
}
