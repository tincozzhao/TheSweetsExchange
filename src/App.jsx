import { useCallback, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Loader, { shouldShowIntro } from './components/Loader.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import FreshlyBaked from './components/FreshlyBaked.jsx';
import LittleBox from './components/LittleBox.jsx';
import OurStory from './components/OurStory.jsx';
import InstagramGallery from './components/InstagramGallery.jsx';
import Order from './components/Order.jsx';
import Footer from './components/Footer.jsx';
import { SITE } from './data/site.js';

export default function App() {
  const [intro] = useState(shouldShowIntro);
  const [introDone, setIntroDone] = useState(!intro);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  // order = { [itemId]: quantity }, shared by the menu, boxes and order form.
  const [order, setOrder] = useState({});
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

      <Nav introDone={introDone} />

      <main id="main">
        <Hero introDone={introDone} />
        <FreshlyBaked order={order} onAdd={addItem} />
        {SITE.features.boxes && <LittleBox order={order} onAdd={addItem} />}
        <OurStory />
        <InstagramGallery />
        <Order order={order} setQty={setQty} />
      </main>

      <Footer />

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
            className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-burnt px-5 py-3 font-bold text-vanilla shadow-paper transition-colors hover:bg-cocoa"
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
