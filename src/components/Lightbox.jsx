import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CookieOnPlaid } from './PlaidPhoto.jsx';
import { EASE } from './Reveal.jsx';

// Enlarged photo viewer. Closes with the X button, Escape, or a click outside the photo.
export default function Lightbox({ item, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!item) return undefined;
    const opener = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={item.alt}
          className="fixed inset-0 z-[90] grid place-items-center bg-choc/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-[min(92vw,86vh)]"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <CookieOnPlaid
              src={item.src}
              alt={item.alt}
              eager
              inset="p-[5%]"
              className="aspect-square rounded-[2rem] border-[6px] border-cream shadow-paper"
            />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close enlarged photo"
              className="absolute -right-2 -top-3 grid h-11 w-11 place-items-center rounded-full bg-cream text-choc shadow-paper transition-colors hover:bg-rose hover:text-cream sm:-right-4"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
