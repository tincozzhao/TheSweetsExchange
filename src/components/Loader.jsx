import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Wordmark from './Wordmark.jsx';
import { Heart } from './Doodles.jsx';

const KEY = 'tse-intro-seen';

// The short entrance animation plays once per browser session, and never for
// people who prefer reduced motion.
export function shouldShowIntro() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.sessionStorage.getItem(KEY)) return false;
  } catch {
    /* storage can be blocked; just show the intro */
  }
  return true;
}

export default function Loader({ onDone }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    const timer = setTimeout(() => {
      setShow(false);
      onDone();
    }, 1900);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          aria-hidden="true"
          className="paper fixed inset-0 z-[100] grid place-items-center bg-butter text-cocoa"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 11, delay: 0.1 }}
            >
              <Heart className="h-14 w-14 text-burnt" />
            </motion.div>
            <motion.div
              className="text-3xl sm:text-4xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Wordmark />
            </motion.div>
            <motion.p
              className="font-hand text-2xl text-cocoa/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              made to share
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
