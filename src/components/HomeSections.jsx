import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import Hero from './Hero.jsx';
import FreshlyBaked from './FreshlyBaked.jsx';
import LittleBox from './LittleBox.jsx';
import OurStory from './OurStory.jsx';
import InstagramGallery from './InstagramGallery.jsx';
import Order from './Order.jsx';
import Footer from './Footer.jsx';
import { asset } from '../lib/assets.js';
import { SITE } from '../data/site.js';

// The home page is split into four separate "pages" (chapters). Only one is on screen at a
// time, so nothing stacks or fights while you scroll:
//   0 hero  ->  1 menu  ->  2 boxes  ->  3 our story / Instagram / order / footer
// Scrolling past the end of a page plays a transition into the next one; scrolling up past the
// start of a page plays the same transition in reverse.
//   hero <-> menu    the plaid cloth sweeps across and covers the screen
//   menu <-> boxes   the Chocolate Chip cookie from its menu card zooms in, blurs and blends
//                    into the yellow boxes page
//   boxes <-> story  the small flower on the box photo zooms in, blurs and blends into Our Story

const NAV = 64; // fixed header height
const LAST = 3;
const CHAPTER_OF = { home: 0, menu: 1, boxes: 2, story: 3, gallery: 3, order: 3 };
const COOKIE_RATIO = 1000 / 1030;
const FLOWER_RATIO = 1055 / 1100;
const COOKIE_FOCUS = { x: 0.392, y: 0.562 }; // pale golden dough in chocolate-chip-top.webp
const FLOWER_FOCUS = { x: 0.5, y: 0.5 };

// Timing of the zoom-and-blend, as progress stops (0..1). Cookie: blur starts as it zooms.
// Flower: it zooms until it fills ~70% of the screen before it blurs and blends.
const T_COOKIE = {
  zoom: [0.08, 0.6], fade: [0, 0.28, 0.5], blurFrom: 0, blurOut: [0.5, 0.8],
  color: [0.12, 0.4, 0.58, 0.8], mid: 0.5, reveal: 0.82,
};
const T_FLOWER = {
  zoom: [0.1, 0.76], fade: [0, 0.6, 0.7], blurFrom: 0, blurIn: [0.56, 0.66], blurOut: [0.8, 0.92],
  color: [0.6, 0.7, 0.84, 0.95], mid: 0.77, reveal: 0.8,
};

// Phones (narrower than Tailwind's md breakpoint) change page with buttons, never by scrolling.
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

function NextButton({ children, onClick }) {
  return (
    <div className="flex justify-center px-5 pb-16 pt-2 md:hidden">
      <button type="button" onClick={onClick} className="btn btn-primary group">
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const smooth = (t) => t * t * (3 - 2 * t);
const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Piecewise-linear value for progress p over keyframe stops ps -> vs (each segment eased).
function kf(p, ps, vs) {
  if (p <= ps[0]) return vs[0];
  for (let i = 1; i < ps.length; i += 1) {
    if (p <= ps[i]) {
      const t = smooth((p - ps[i - 1]) / (ps[i] - ps[i - 1]));
      return vs[i - 1] + (vs[i] - vs[i - 1]) * t;
    }
  }
  return vs[vs.length - 1];
}

// Runs fn(t) with t going 0 -> 1 over `ms` milliseconds (real time, not scroll position).
function run(ms, fn) {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      fn(t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

function initialChapter() {
  const id = window.location.hash.replace(/^#/, '');
  return CHAPTER_OF[id] ?? 0;
}

const cardImg = () => document.querySelector('#menu a[href$="cookies/chocolate-chip"] img');
const flowerImg = () => document.querySelector('[data-flower-anchor]');

function useOverlay() {
  return {
    plaidX: useMotionValue(-4000),
    plaidY: useMotionValue(0),
    plaidW: useMotionValue(600),
    plaidR: useMotionValue(0),
    plaidO: useMotionValue(0),
    cookie: { x: useMotionValue(0), y: useMotionValue(0), w: useMotionValue(300), s: useMotionValue(1), o: useMotionValue(0) },
    flower: { x: useMotionValue(0), y: useMotionValue(0), w: useMotionValue(60), s: useMotionValue(1), o: useMotionValue(0) },
    blurF: useMotionValue('blur(0px)'),
    butterO: useMotionValue(0),
    vanillaO: useMotionValue(0),
  };
}

function Piece({ src, x, y, w, r, s, o, ratio, shadow, origin }) {
  return (
    <motion.img
      src={asset(src)}
      alt=""
      draggable="false"
      style={{
        x,
        y,
        width: w,
        rotate: r,
        scale: s,
        opacity: o,
        aspectRatio: ratio,
        filter: shadow,
        transformOrigin: origin,
        willChange: 'transform, opacity',
      }}
      className="absolute left-0 top-0 max-w-none select-none object-contain"
    />
  );
}

// Converts a centre position + width into the top-left corner used for positioning.
function useCorner(c, w, ratio, axis) {
  const mv = useMotionValue(0);
  const calc = () => {
    mv.set(axis === 'x' ? c.get() - w.get() / 2 : c.get() - w.get() / ratio / 2);
  };
  useMotionValueEvent(c, 'change', calc);
  useMotionValueEvent(w, 'change', calc);
  useEffect(calc, []); // eslint-disable-line react-hooks/exhaustive-deps
  return mv;
}

function Overlay({ mv }) {
  const plaidLeft = useCorner(mv.plaidX, mv.plaidW, 1032 / 1036, 'x');
  const plaidTop = useCorner(mv.plaidY, mv.plaidW, 1032 / 1036, 'y');
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <Piece
        src="images/transitions/plaid-cloth.webp"
        x={plaidLeft}
        y={plaidTop}
        w={mv.plaidW}
        r={mv.plaidR}
        o={mv.plaidO}
        ratio={1032 / 1036}
      />
      <Piece
        src="images/cookies/chocolate-chip-top.webp"
        x={mv.cookie.x}
        y={mv.cookie.y}
        w={mv.cookie.w}
        s={mv.cookie.s}
        o={mv.cookie.o}
        shadow="drop-shadow(0 6px 5px rgba(80,40,30,0.34)) drop-shadow(0 18px 16px rgba(80,40,30,0.22))"
        ratio={COOKIE_RATIO}
        origin={`${COOKIE_FOCUS.x * 100}% ${COOKIE_FOCUS.y * 100}%`}
      />
      <Piece
        src="images/transitions/flower.webp"
        x={mv.flower.x}
        y={mv.flower.y}
        w={mv.flower.w}
        s={mv.flower.s}
        o={mv.flower.o}
        shadow="drop-shadow(0 3px 4px rgba(89,58,43,0.3))"
        ratio={FLOWER_RATIO}
        origin={`${FLOWER_FOCUS.x * 100}% ${FLOWER_FOCUS.y * 100}%`}
      />
      <motion.div
        className="absolute inset-0"
        style={{ backdropFilter: mv.blurF, WebkitBackdropFilter: mv.blurF }}
      />
      <motion.div className="absolute inset-0 bg-butter" style={{ opacity: mv.butterO }} />
      <motion.div className="absolute inset-0 bg-vanilla" style={{ opacity: mv.vanillaO }} />
    </div>
  );
}

// ---- scroll helpers used to bring the menu's Chocolate Chip card into view -----------------

function cardTargets() {
  const img = cardImg();
  const scroller = document.querySelector('#menu .snap-x');
  const article = img?.closest('article');
  if (!img || !scroller || !article) return null;
  const maxLeft = scroller.scrollWidth - scroller.clientWidth;
  const left = Math.min(maxLeft, Math.max(0, article.offsetLeft - 20)); // a snap point
  const r = img.getBoundingClientRect();
  const pageTop = r.top + window.scrollY;
  const maxTop = document.documentElement.scrollHeight - window.innerHeight;
  const top = Math.min(maxTop, Math.max(0, pageTop + r.height / 2 - window.innerHeight / 2));
  return { scroller, left, top, img };
}

function setCardInstant() {
  const t = cardTargets();
  if (!t) return;
  t.scroller.scrollLeft = t.left;
  window.scrollTo({ top: t.top, behavior: 'instant' });
}

function cardInView() {
  const t = cardTargets();
  if (!t) return true;
  const r = t.img.getBoundingClientRect();
  return (
    r.top >= NAV + 8 && r.bottom <= window.innerHeight - 8 && r.left >= 0 && r.right <= window.innerWidth
  );
}

async function bringCardIntoView(lock) {
  const t = cardTargets();
  if (!t || cardInView()) return;
  const sx = t.scroller.scrollLeft;
  const sy = window.scrollY;
  const snap = t.scroller.style.scrollSnapType;
  t.scroller.style.scrollSnapType = 'none';
  await run(550, (p) => {
    const e = smooth(p);
    t.scroller.scrollLeft = sx + (t.left - sx) * e;
    const y = sy + (t.top - sy) * e;
    lock(y);
    window.scrollTo({ top: y, behavior: 'instant' });
  });
  t.scroller.style.scrollSnapType = snap;
}

// ---- the page --------------------------------------------------------------------------

function Animated({ order, setQty, onAdd, introDone, onChapter }) {
  const [chapter, setChapter] = useState(initialChapter);
  const chapterRef = useRef(chapter);
  const [boxesIn, setBoxesIn] = useState(true);
  const [storyIn, setStoryIn] = useState(true);
  const mv = useOverlay();
  const busy = useRef(false);
  const cool = useRef(0);
  const lockY = useRef(0);
  const pendingId = useRef(null);
  const skipTop = useRef(false);
  const startRef = useRef(null);

  const goTo = (c) => {
    chapterRef.current = c;
    setChapter(c);
    onChapter?.(c);
  };

  // Every new page starts at its top (or at the section named by a nav link).
  useLayoutEffect(() => {
    onChapter?.(chapter);
    if (pendingId.current) {
      document.getElementById(pendingId.current)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      pendingId.current = null;
    } else if (!skipTop.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    skipTop.current = false;
    lockY.current = window.scrollY; // the new page's position is the one to hold
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  useEffect(() => {
    const m = mv;
    const lock = (y) => {
      lockY.current = y;
    };

    // Resets everything the overlay draws.
    const clear = () => {
      m.plaidO.set(0);
      m.cookie.o.set(0);
      m.flower.o.set(0);
      m.blurF.set('blur(0px)');
      m.butterO.set(0);
      m.vanillaO.set(0);
    };

    // 1 — hero <-> menu: the plaid cloth grows to cover the screen as it flies across.
    // The page swaps while the cloth covers everything. dir -1 plays it backwards.
    const playPlaid = async (dir, to) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const S = Math.min(W, H);
      const M = Math.max(W, H);
      const w = M * 1.05 + 24; // just big enough that its edges sit outside the screen at full cover
      const w0 = S * 0.8;
      let swapped = false;
      await run(1600, (t) => {
        const p = dir > 0 ? t : 1 - t;
        m.plaidW.set(kf(p, [0, 0.5, 1], [w0, w, w]));
        m.plaidX.set(kf(p, [0, 0.5, 1], [-w0 * 0.6, W / 2, W + w * 0.6]));
        m.plaidY.set(H / 2 + Math.sin(p * Math.PI * 2) * 30);
        m.plaidR.set(kf(p, [0, 1], [-14, 12]));
        m.plaidO.set(t > 0.002 && t < 0.998 ? 1 : 0);
        if (!swapped && t >= 0.5) {
          swapped = true;
          goTo(to);
        }
      });
      m.plaidO.set(0);
    };

    // Draws one frame of a zoom-and-blend. The piece starts exactly on `rect` (where the real
    // cookie / flower sits on the page), zooms into `focus`, and the page colour blends in.
    const frame = (piece, colorMV, p, rect, focus, K, T) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const w0 = rect.width;
      const h0 = rect.height;
      const z = kf(p, T.zoom, [0, 1]);
      const sx = rect.left + focus.x * w0;
      const sy = rect.top + focus.y * h0;
      const fx = sx + (W / 2 - sx) * z;
      const fy = sy + (H / 2 - sy) * z;
      piece.w.set(w0);
      piece.x.set(fx - focus.x * w0);
      piece.y.set(fy - focus.y * h0);
      piece.s.set(Math.exp(Math.log(K) * z));
      piece.o.set(kf(p, T.fade, [1, 1, 0]));
      const bz = T.blurIn ? kf(p, T.blurIn, [0, 1]) : clamp01((z - T.blurFrom) / (1 - T.blurFrom));
      m.blurF.set(`blur(${(22 * bz ** 1.2 * kf(p, T.blurOut, [1, 0])).toFixed(2)}px)`);
      colorMV.set(kf(p, T.color, [0, 1, 1, 0]));
    };

    // 2/3 — cookie (menu <-> boxes) and flower (boxes <-> story).
    //   forward: measure the real thing, hide it, zoom + blend, swap the page underneath,
    //            then reveal the new page.
    //   reverse: blend over the page, swap, then zoom back out onto the real thing.
    const playZoom = async (dir, cfg) => {
      const { piece, colorMV, focus, ratio, to, maxK, measure, hide, show, before, afterSwap, reveal, T, ms } = cfg;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const M = Math.max(W, H);
      const kFor = (w0) => Math.min((maxK * M) / w0, 8000 / w0);

      if (dir > 0) {
        await before?.();
        const rect = measure();
        if (!rect) {
          goTo(to);
          return;
        }
        const K = kFor(rect.width);
        hide();
        let swapped = false;
        let shown = false;
        await run(ms, (p) => {
          frame(piece, colorMV, p, rect, focus, K, T);
          if (!swapped && p >= T.mid) {
            swapped = true;
            afterSwap(false);
            goTo(to);
          }
          if (!shown && p >= T.reveal) {
            shown = true;
            reveal(true);
          }
        });
        reveal(true);
      } else {
        // blend in over the page we are leaving …
        const dummy = { left: W / 2 - 100, top: H / 2 - 100 / ratio, width: 200, height: 200 / ratio };
        await run(ms / 2, (t) => frame(piece, colorMV, 1 - (1 - T.mid) * t, dummy, focus, kFor(200), T));
        // … swap to the previous page (already showing its content) …
        afterSwap(true);
        skipTop.current = true;
        goTo(to);
        await raf();
        await raf();
        cfg.settle?.();
        lockY.current = window.scrollY;
        await raf();
        const rect = measure();
        if (rect) {
          const K = kFor(rect.width);
          hide();
          await run(ms / 2, (t) => frame(piece, colorMV, T.mid * (1 - t), rect, focus, K, T));
        }
      }
      show();
    };

    const playCookie = (dir) =>
      playZoom(dir, {
        piece: m.cookie,
        colorMV: m.butterO,
        focus: COOKIE_FOCUS,
        ratio: COOKIE_RATIO,
        from: 1,
        to: dir > 0 ? 2 : 1,
        maxK: 12,
        T: T_COOKIE,
        ms: 1800,
        before: () => {
          // no pre-scroll animation: if the card is off screen, snap it into place at once so the
          // zoom starts straight away, exactly like the flower
          if (!cardInView()) setCardInstant();
          lock(window.scrollY);
        },
        settle: setCardInstant,
        measure: () => cardImg()?.getBoundingClientRect() ?? null,
        hide: () => {
          const el = cardImg();
          if (el) el.style.opacity = '0';
        },
        show: () => {
          const el = cardImg();
          if (el) el.style.opacity = '';
        },
        afterSwap: (back) => setBoxesIn(back), // forward: boxes page starts empty, back: complete
        reveal: (v) => setBoxesIn(v),
      });

    const playFlower = (dir) =>
      playZoom(dir, {
        piece: m.flower,
        colorMV: m.vanillaO,
        focus: FLOWER_FOCUS,
        ratio: FLOWER_RATIO,
        from: 2,
        to: dir > 0 ? 3 : 2,
        maxK: 3,
        T: T_FLOWER,
        ms: 1500,
        measure: () => flowerImg()?.getBoundingClientRect() ?? null,
        hide: () => {
          const el = flowerImg();
          if (el) el.style.opacity = '0';
        },
        show: () => {
          const el = flowerImg();
          if (el) el.style.opacity = '';
        },
        afterSwap: (back) => setStoryIn(back),
        reveal: (v) => setStoryIn(v),
      });

    const start = async (c, dir) => {
      busy.current = true;
      lockY.current = window.scrollY;
      try {
        if (c === 0 && dir > 0) await playPlaid(1, 1);
        else if (c === 1 && dir < 0) await playPlaid(-1, 0);
        else if (c === 1 && dir > 0) await playCookie(1);
        else if (c === 2 && dir < 0) await playCookie(-1);
        else if (c === 2 && dir > 0) await playFlower(1);
        else if (c === 3 && dir < 0) await playFlower(-1);
      } finally {
        clear();
        const el = cardImg();
        if (el) el.style.opacity = '';
        const fl = flowerImg();
        if (fl) fl.style.opacity = '';
        await wait(60);
        lockY.current = window.scrollY;
        busy.current = false;
        cool.current = Date.now() + 700;
      }
    };

    startRef.current = (c, dir) => {
      if (!busy.current) start(c, dir);
    };

    const atTop = () => window.scrollY <= 2;
    const atBottom = () =>
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

    // A scroll attempt (wheel / swipe / key) at the very start or end of a page starts a transition.
    const attempt = (dir, e) => {
      if (isMobile() && !busy.current) return; // phones: scrolling never changes page
      if (busy.current) {
        e.preventDefault();
        return;
      }
      const c = chapterRef.current;
      const goes = (dir > 0 && c < LAST && atBottom()) || (dir < 0 && c > 0 && atTop());
      if (!goes) return;
      e.preventDefault();
      if (Date.now() < cool.current) return; // swallow inertia from the previous gesture
      start(c, dir);
    };

    // Only a clearly vertical gesture changes page; sideways scrolling (the menu carousel) never does.
    let lastSide = 0;
    const onWheel = (e) => {
      if (e.ctrlKey) return; // pinch-zoom
      if (busy.current) {
        e.preventDefault();
        return;
      }
      const ax = Math.abs(e.deltaX);
      const ay = Math.abs(e.deltaY);
      if (ax > 0 && ax >= ay * 0.6) lastSide = Date.now();
      if (e.shiftKey || ay === 0 || ax >= ay * 0.6) return; // sideways
      if (Date.now() - lastSide < 350 && ay < 40) return; // tail of a sideways swipe
      attempt(e.deltaY > 0 ? 1 : -1, e);
    };
    let touchY = null;
    let touchX = null;
    let touchSide = false;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      touchSide = false;
    };
    const onTouchMove = (e) => {
      if (busy.current) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (touchY == null || !e.cancelable) return;
      const dy = touchY - e.touches[0].clientY;
      const dx = touchX - e.touches[0].clientX;
      if (Math.abs(dx) > Math.abs(dy) * 0.6 && Math.abs(dx) > 6) touchSide = true;
      if (touchSide) return; // a sideways swipe (menu carousel) never changes page
      if (Math.abs(dy) > 8) attempt(dy > 0 ? 1 : -1, e);
    };
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(tag)) return;
      const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if (busy.current && (down || up || ['Home', 'End'].includes(e.key))) return e.preventDefault();
      if (down) attempt(1, e);
      else if (up) attempt(-1, e);
    };
    const onScroll = () => {
      // hold the page still while a transition plays
      if (busy.current && Math.abs(window.scrollY - lockY.current) > 1) {
        window.scrollTo({ top: lockY.current, behavior: 'instant' });
      }
    };
    // Nav links / buttons that point at a section jump to the page that holds it.
    const onHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      const c = CHAPTER_OF[id];
      if (c == null || busy.current) return;
      if (c !== chapterRef.current) {
        pendingId.current = id;
        setBoxesIn(true);
        setStoryIn(true);
        goTo(c);
      }
    };

    // On phones the hero's "Explore Our Sweets" button plays the cloth into the menu.
    const onClick = (e) => {
      if (!isMobile() || busy.current || chapterRef.current !== 0) return;
      const a = e.target.closest && e.target.closest('#home a[href="#menu"]');
      if (!a) return;
      e.preventDefault();
      start(0, 1);
    };
    window.addEventListener('click', onClick);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onHash);
      busy.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Overlay mv={mv} />
      {chapter === 0 && <Hero introDone={introDone} />}
      {chapter === 1 && (
        <>
          <FreshlyBaked order={order} onAdd={onAdd} />
          <NextButton onClick={() => startRef.current?.(1, 1)}>Check out our assorted cookie box</NextButton>
        </>
      )}
      {chapter === 2 && SITE.features.boxes && (
        <>
          <LittleBox order={order} onAdd={onAdd} entered={boxesIn} />
          <NextButton onClick={() => startRef.current?.(2, 1)}>See our story</NextButton>
        </>
      )}
      {chapter === 3 && (
        <>
          <motion.div
            initial={storyIn ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
            animate={storyIn ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <OurStory instant />
          </motion.div>
          <InstagramGallery />
          <Order order={order} setQty={setQty} />
          <Footer />
        </>
      )}
    </>
  );
}

export default function HomeSections(props) {
  const reduce = useReducedMotion();
  if (reduce) {
    const { order, setQty, onAdd, introDone } = props;
    return (
      <>
        <Hero introDone={introDone} />
        <FreshlyBaked order={order} onAdd={onAdd} />
        {SITE.features.boxes && <LittleBox order={order} onAdd={onAdd} />}
        <OurStory />
        <InstagramGallery />
        <Order order={order} setQty={setQty} />
        <Footer />
      </>
    );
  }
  return <Animated {...props} />;
}
