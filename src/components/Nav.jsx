import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Wordmark from './Wordmark.jsx';
import { NAV_LINKS } from '../data/site.js';
import { EASE } from './Reveal.jsx';

export default function Nav({ introDone, routeKey, sectionsKey }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Highlight the link for whichever section is in the middle of the screen.
  useEffect(() => {
    // On a cookie page the Menu link stays highlighted; the home sections aren't mounted.
    if (routeKey === 'cookie') {
      setActive('menu');
      return undefined;
    }
    if (!('IntersectionObserver' in window)) return undefined;
    const els = NAV_LINKS.filter((l) => !l.external)
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [routeKey, sectionsKey]);

  const solid = scrolled || open;

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={introDone ? { y: 0, opacity: 1 } : { y: -48, opacity: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-vanilla shadow-soft' : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8"
      >
        <a
          href="#home"
          aria-label="The Sweets Exchange, back to top"
          className="text-[1.05rem] text-cocoa"
          onClick={() => setOpen(false)}
        >
          <Wordmark />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                aria-current={!link.external && active === link.id ? 'true' : undefined}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group relative inline-flex items-center gap-1 py-2 text-[0.95rem] font-medium text-cocoa"
              >
                {link.label}
                {link.external && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-[3px] w-full origin-left rounded-full bg-burnt transition-transform duration-300 ease-out ${
                    !link.external && active === link.id
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
                {link.external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border-2 border-cocoa text-cocoa transition-colors hover:bg-cocoa hover:text-vanilla md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid place-items-center"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden bg-vanilla md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 pb-8 pt-2 sm:px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.06, ease: EASE }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center justify-between border-b border-cocoa/15 py-4 font-serif text-3xl text-cocoa"
                  >
                    <span>
                      {link.label}
                      {link.external && <span className="sr-only"> (opens in a new tab)</span>}
                    </span>
                    {link.external && <ArrowUpRight className="h-6 w-6 text-burnt" aria-hidden="true" />}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
