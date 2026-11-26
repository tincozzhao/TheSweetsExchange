import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Loader, { shouldShowIntro } from './components/Loader.jsx';
import Nav from './components/Nav.jsx';
import HomeSections from './components/HomeSections.jsx';
import Footer from './components/Footer.jsx';
import CookiePage from './components/CookiePage.jsx';
import { SITE } from './data/site.js';
import { COOKIE_PAGES } from './data/products.js';
import { useRoute } from './lib/router.js';

export default function App() {
  const [intro] = useState(shouldShowIntro);
  const [introDone, setIntroDone] = useState(!intro);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  // order = { [itemId]: quantity }, shared by the menu, boxes and order form.
  const [order, setOrder] = useState({});
  const [chapter, setChapter] = useState(0);
  const setQty = useCallback((id, qty) => {
    setOrder((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(99, qty);
      return next;
    });
  }, []);
  const addItem = useCallback((id) => {
    setOrder((prev) => ({ ...prev, [id]: Math.min(99, (prev[id] || 0) + 1) }));
  }, []);

  const count = Object.values(order).reduce((sum, n) => sum + n, 0);

  // Which page is showing: the home page or one cookie's page (#/cookies/<slug>).
  const route = useRoute();
  const cookie = route.name === 'cookie' ? COOKIE_PAGES.find((c) => c.slug === route.slug) : null;
  const view = cookie ? 'cookie' : 'home';

  // After switching pages, put the visitor in the right place: the top of a cookie page,
  // or the section named in the link (#menu, #order …) when returning to the home page.
  const previousView = useRef(null);
  useEffect(() => {
    const came = previousView.current;
    previousView.current = view;
    if (view === 'cookie') {
      // Cookie -> cookie: glide back up. (Home -> cookie is handled when the home page exits.)
      if (came === 'cookie') window.scrollTo({ top: 0, behavior: 'smooth' });
      return undefined;
    }
    if (came === 'home') return undefined; // ordinary in-page anchors scroll by themselves
    const id = route.hash.replace(/^#/, '');
    const wantsSection = id && !id.startsWith('/');
    if (!wantsSection) {
      if (came) window.scrollTo({ top: 0, behavior: 'auto' });
      return undefined;
    }
    // The home page mounts just after the cookie page fades out, so wait for the section.
    let tries = 0;
    let timer;
    const go = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: came ? 'smooth' : 'auto', block: 'start' });
      else if (tries++ < 25) timer = setTimeout(go, 60);
    };
    timer = setTimeout(go, 60);
    return () => clearTimeout(timer);
  }, [view, route.hash]);

  // "Order some sweetness" on a cookie page: add it, then jump to the order form.
  const orderCookie = useCallback(
    (id) => {
      addItem(id);
      window.location.hash = '#order';
    },
    [addItem],
  );

  return (
    // reducedMotion="user" strips movement for visitors who ask for less motion.
    <MotionConfig reducedMotion="user">
      {intro && <Loader onDone={handleIntroDone} />}

      <a
        href="#main"
        className="sr-only z-[110] rounded-full bg-cocoa px-5 py-3 font-bold text-vanilla focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <Nav introDone={introDone} routeKey={view} sectionsKey={chapter} />

      <main id="main">
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => {
            if (view === 'cookie') window.scrollTo({ top: 0, behavior: 'auto' });
          }}
        >
          {view === 'cookie' ? (
            <motion.div
              key="cookie"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CookiePage cookie={cookie} qty={order[cookie.id] || 0} onOrder={orderCookie} />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <HomeSections
                order={order}
                setQty={setQty}
                onAdd={addItem}
                introDone={introDone}
                onChapter={setChapter}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {view === 'cookie' && <Footer />}

      {/* Floating reminder of what's in the order so far */}
      <AnimatePresence>
        {count > 0 && (
          <motion.a
            href="#order"
            key="order-pill"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))', right: 'max(1.25rem, env(safe-area-inset-right))' }}
            className="fixed z-40 inline-flex items-center gap-2 rounded-full bg-burnt px-5 py-3 font-bold text-vanilla shadow-paper transition-colors hover:bg-cocoa"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {count} in your order
            <span className="sr-only">. Go to the order form.</span>
          </motion.a>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
