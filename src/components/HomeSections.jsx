import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import Hero from './Hero.jsx';
import FreshlyBaked from './FreshlyBaked.jsx';
import LittleBox from './LittleBox.jsx';
import OurStory from './OurStory.jsx';
import InstagramGallery from './InstagramGallery.jsx';
import Order from './Order.jsx';
import Footer from './Footer.jsx';
import { asset } from '../lib/assets.js';
import { GALLERY, SITE } from '../data/site.js';

// The home page is split into four separate "pages" (chapters). Only one is on screen at a
// time, so nothing stacks or fights while you scroll:
//   0 hero -> 1 menu -> 2 boxes -> 3 our story -> 4 Instagram -> 5 order / footer
// Scrolling past the end of a page plays a transition into the next one; scrolling up past the
// start of a page plays the same transition in reverse.
//   hero <-> menu    the plaid cloth sweeps across and covers the screen
//   menu <-> boxes   the Chocolate Chip cookie from its menu card zooms in, blurs and blends
//                    into the yellow boxes page
//   boxes <-> story  the small flower on the box photo zooms in, blurs and blends into Our Story

const NAV = 64; // fixed header height
const LAST = 5;
const CHAPTER_OF = { home: 0, menu: 1, boxes: 2, story: 3, gallery: 4, order: 5 };
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
// Phones: the cookie first grows in from a tiny, faint version of itself, then zooms.
const T_COOKIE_M = { ...T_COOKIE, zoom: [0.2, 0.62], intro: 0.2 };
// Flower: the whole page is the "camera" - it zooms in on the flower until the flower fills the
// screen, and only then does it blur and blend into Our Story.
const T_FLOWER = {
  camera: true, zoom: [0.04, 0.58], ease: 3.2, fade: [0, 1, 1], blurFrom: 0, blurMax: 46,
  blurIn: [0.5, 0.64], blurOut: [0.78, 0.9],
  color: [0.48, 0.64, 0.8, 0.94], mid: 0.72, reveal: 0.78,
};

// Phones (narrower than Tailwind's md breakpoint) change page with buttons, never by scrolling.
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

function NextButton({ children, onClick, onBack, backLabel, tight }) {
  return (
    <div className={`flex flex-col items-center gap-3 px-5 pb-16 pt-2 md:hidden ${tight ? '-mt-20' : ''}`}>
      {children && (
        <button type="button" onClick={onClick} className="btn btn-primary group">
          {children}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      {onBack && <BackButton onClick={onBack}>{backLabel}</BackButton>}
    </div>
  );
}

function BackButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-secondary !border-choc !text-choc"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}

// ---- the instant-film line (our story <-> Instagram) --------------------------------------------
const POL_SRC = [
  ...SITE.story.photos.slice(0, 3).map((p) => p.src),
  ...GALLERY.slice(0, 7).map((g) => g.src),
];
const easeIO = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) ** 3;
const lerp = (a, b, t) => a + (b - a) * t;
const c01 = (n) => Math.min(1, Math.max(0, n));

function PolaroidLine({ lineRef }) {
  return (
    <div
      ref={lineRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55]"
      style={{ display: 'none' }}
    >
      <div data-pol-bg className="absolute inset-0" style={{ opacity: 0 }} />
      <div className="absolute inset-0 overflow-hidden">
        <img
          data-pol-grass
          src={asset('images/transitions/stripes.webp')}
          alt=""
          draggable="false"
          className="h-full w-full max-w-none object-cover"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        />
      </div>
      {POL_SRC.map((src, i) => (
        <div
          key={i}
          data-pol={i}
          className="absolute left-0 top-0 overflow-hidden bg-vanilla shadow-paper"
          style={{ display: 'none', boxSizing: 'border-box', willChange: 'transform' }}
        >
          <img src={asset(src)} alt="" draggable="false" className="block h-full w-full select-none object-cover" />
        </div>
      ))}
    </div>
  );
}

// Cherry-blossom flurry: the white flower flies across the screen, spinning, as if the viewer
// stood under a blossoming tree.
const PETALS = 30;
function PetalLayer({ petalRef }) {
  return (
    <div
      ref={petalRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      style={{ display: 'none' }}
    >
      {Array.from({ length: PETALS }, (_, i) => (
        <img
          key={i}
          src={asset('images/transitions/flower.webp')}
          alt=""
          draggable="false"
          className="absolute left-0 top-0 max-w-none select-none"
          style={{ display: 'none', willChange: 'transform' }}
        />
      ))}
    </div>
  );
}

// Swipe transition (Instagram <-> Order): a lace-edged burlap ribbon sweeps across the screen and
// drags the next page in behind it. The next page is previewed here, clipped to the ribbon's wake.
const SWIPE_RATIO = 525 / 1200;
function SwipeLayer({ swipeRef, view, order, setQty }) {
  return (
    <div
      ref={swipeRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45] overflow-hidden"
      style={{ display: 'none' }}
    >
      <div data-sw-under className="swipe-under absolute inset-0 overflow-hidden bg-vanilla" style={{ clipPath: 'inset(0 100% 0 0)' }}>
        {view === 'order' && (
          <>
            <div className="flex justify-center px-5 pt-20 md:hidden">
              <BackButton onClick={() => {}}>Back to Instagram</BackButton>
            </div>
            <Order order={order} setQty={setQty} />
          </>
        )}
        {view === 'insta' && (
          <>
            <GrassBg />
            <div className="flex justify-center px-5 pt-20 md:hidden">
              <BackButton onClick={() => {}}>Back to our story</BackButton>
            </div>
            <InstagramGallery held={false} />
          </>
        )}
      </div>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="swipe-mb" x="-30%" y="0" width="160%" height="100%">
          <feGaussianBlur data-sw-blur stdDeviation="0 0" />
        </filter>
      </svg>
      <div
        data-sw-ribbon
        className="absolute left-0 top-0 h-full"
        style={{
          backgroundImage: `url(${asset('images/transitions/swipe-ribbon.webp')})`,
          backgroundSize: '100% auto',
          backgroundRepeat: 'repeat-y',
          filter: 'url(#swipe-mb) drop-shadow(0 0 18px rgba(40, 20, 10, 0.55))',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

// The grass photo behind the Instagram page (slightly blurred so the page sits on top of it).
function GrassBg() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src={asset('images/transitions/stripes.webp')}
        alt=""
        draggable="false"
        className="h-full w-full max-w-none object-cover"
        style={{ filter: 'blur(0px)', transform: 'scale(1.08)' }}
      />
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
    plaidFilter: useMotionValue('blur(0px)'),
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <Piece
        src="images/transitions/plaid-cloth.webp"
        x={plaidLeft}
        y={plaidTop}
        w={mv.plaidW}
        r={mv.plaidR}
        o={mv.plaidO}
        shadow={mv.plaidFilter}
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
  const left = Math.min(maxLeft, Math.max(0, article.offsetLeft + article.offsetWidth / 2 - scroller.clientWidth / 2)); // card in the middle of the screen
  const r = img.getBoundingClientRect();
  const pageTop = r.top + window.scrollY;
  const maxTop = document.documentElement.scrollHeight - window.innerHeight;
  const top = Math.min(maxTop, Math.max(0, pageTop + r.height / 2 - window.innerHeight / 2));
  return { scroller, left, top, img };
}

function setCardInstant() {
  const t = cardTargets();
  if (!t) return;
  t.scroller.style.scrollSnapType = 'none'; // keep the card centred (the page is replaced right after)
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
  if (!t) return;
  if (cardInView() && Math.abs(t.scroller.scrollLeft - t.left) < 24) return;
  const sx = t.scroller.scrollLeft;
  const sy = window.scrollY;
  const snap = t.scroller.style.scrollSnapType;
  t.scroller.style.scrollSnapType = 'none';
  await run(750, (p) => {
    const e = smooth(p);
    t.scroller.scrollLeft = sx + (t.left - sx) * e;
    const y = sy + (t.top - sy) * e;
    lock(y);
    window.scrollTo({ top: y, behavior: 'instant' });
  });
  t.scroller.style.scrollSnapType = 'none'; // stay centred; the menu remounts after the transition
}

// ---- the page --------------------------------------------------------------------------

function Animated({ order, setQty, onAdd, introDone, onChapter }) {
  const [chapter, setChapter] = useState(initialChapter);
  const chapterRef = useRef(chapter);
  const [boxesIn, setBoxesIn] = useState(true);
  const [storyIn, setStoryIn] = useState(true);
  const [galleryHeld, setGalleryHeld] = useState(false);
  const [swipeView, setSwipeView] = useState(null);
  const lineRef = useRef(null);
  const petalRef = useRef(null);
  const swipeRef = useRef(null);
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
      m.plaidFilter.set('blur(0px)');
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
      const w = isMobile() ? M * 2.8 : M * 1.05 + 24; // just big enough that its edges sit outside the screen at full cover
      const w0 = S * 0.8;
      let swapped = false;
      let lastX = null;
      let lastT = 0;
      let blur = 0;
      await run(1000, (t) => {
        const p = dir > 0 ? t : 1 - t;
        m.plaidW.set(kf(p, [0, 0.5, 1], [w0, w, w]));
        m.plaidX.set(kf(p, [0, 0.5, 1], [-w0 * 0.6, W / 2, W + w * 0.6]));
        m.plaidY.set(H / 2 + Math.sin(p * Math.PI * 2) * 30);
        m.plaidR.set(kf(p, [0, 1], [-14, 12]));
        // motion blur: stronger the faster the cloth is moving
        const now = performance.now();
        const x = m.plaidX.get();
        if (lastX != null && now > lastT) {
          const v = Math.abs(x - lastX) / (now - lastT); // px per ms
          blur += (Math.min(12, v * 4) - blur) * 0.35;
        }
        lastX = x;
        lastT = now;
        m.plaidFilter.set(`blur(${blur.toFixed(1)}px)`);
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
      // `ease`: start slowly on the whole page, then speed up hard towards the flower
      const z = T.ease ? clamp01((p - T.zoom[0]) / (T.zoom[1] - T.zoom[0])) ** T.ease : kf(p, T.zoom, [0, 1]);
      const sx = rect.left + focus.x * w0;
      const sy = rect.top + focus.y * h0;
      const fx = sx + (W / 2 - sx) * z;
      const fy = sy + (H / 2 - sy) * z;
      if (T.camera) {
        // the whole page is scaled about the flower, which also slides to the screen centre
        const cam = document.getElementById('flower-camera');
        if (cam && rect.ox != null) {
          const cx = rect.left + w0 / 2;
          const cy = rect.top + h0 / 2;
          cam.style.transformOrigin = `${rect.ox}px ${rect.oy}px`;
          cam.style.transform = `translate(${(W / 2 - cx) * z}px, ${(H / 2 - cy) * z}px) scale(${Math.exp(Math.log(K) * z)})`;
          // the menu bar fades away and the zooming page is lifted above it, so the flower overlaps the bar
          const nb = document.querySelector('header');
          if (nb) {
            nb.style.transition = 'opacity 0.3s ease';
            nb.style.opacity = z > 0.03 ? '0' : '';
          }
          cam.style.position = 'relative';
          cam.style.zIndex = z > 0.2 ? '56' : '';
        }
      }
      const f = T.intro ? kf(p, [0, T.intro], [0.12, 1]) : 1; // grows in from tiny
      // `base`: draw the image at (about) its real pixel width and scale it DOWN to start, so the
      // browser rasterises it sharp instead of stretching a tiny bitmap as it zooms in.
      const wb = T.base || w0;
      const hb = (wb * h0) / w0;
      if (T.camera) {
        piece.o.set(0);
      } else {
      piece.w.set(wb * f);
      piece.x.set(fx - focus.x * wb * f);
      piece.y.set(fy - focus.y * hb * f);
      piece.s.set((w0 / wb) * Math.exp(Math.log(K) * z));
      piece.o.set(kf(p, T.fade, [1, 1, 0]) * (T.intro ? kf(p, [0, T.intro * 0.85], [0, 1]) : 1));
      }
      const bz = T.blurIn ? kf(p, T.blurIn, [0, 1]) : clamp01((z - T.blurFrom) / (1 - T.blurFrom));
      m.blurF.set(`blur(${((T.blurMax || 22) * bz ** 1.2 * kf(p, T.blurOut, [1, 0])).toFixed(2)}px)`);
      colorMV.set(kf(p, T.color, [0, 1, 1, 0]));
    };

    // 2/3 — cookie (menu <-> boxes) and flower (boxes <-> story).
    //   forward: measure the real thing, hide it, zoom + blend, swap the page underneath,
    //            then reveal the new page.
    //   reverse: blend over the page, swap, then zoom back out onto the real thing.
    // For the camera zoom: remember where the flower sits inside the page that will be scaled.
    const withOrigin = (r, T) => {
      if (!r || !T.camera) return r;
      const cam = document.getElementById('flower-camera');
      if (!cam) return r;
      cam.style.transform = '';
      const ir = cam.getBoundingClientRect();
      return {
        left: r.left, top: r.top, width: r.width, height: r.height,
        ox: r.left + r.width / 2 - ir.left, oy: r.top + r.height / 2 - ir.top,
      };
    };

    const playZoom = async (dir, cfg) => {
      const { piece, colorMV, focus, ratio, to, maxK, measure, hide, show, before, afterSwap, reveal, T, ms } = cfg;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const M = Math.max(W, H);
      const kFor = (w0) => Math.min((maxK * M) / w0, 8000 / w0);

      if (dir > 0) {
        await before?.();
        const rect = withOrigin(measure(), T);
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
        if (T.camera) {
          // Our Story shrinks until the whole page is a tiny dot on a plain tan screen …
          const sc = document.getElementById('story-camera');
          await run(ms * 0.42, (t) => {
            const zz = t * t * (3 - 2 * t);
            if (sc) {
              sc.style.transformOrigin = `50% ${window.scrollY + H / 2}px`;
              sc.style.transform = `scale(${Math.exp(Math.log(0.03) * zz)})`;
            }
            colorMV.set(kf(t, [0.3, 0.85], [0, 1]));
          });
        } else {
        // blend in over the page we are leaving …
        const dummy = { left: W / 2 - 100, top: H / 2 - 100 / ratio, width: 200, height: 200 / ratio };
        await run(ms / 2, (t) => frame(piece, colorMV, 1 - (1 - T.mid) * t, dummy, focus, kFor(200), T));
        }
        // … swap to the previous page (already showing its content) …
        afterSwap(true);
        skipTop.current = true;
        goTo(to);
        await raf();
        await raf();
        cfg.settle?.();
        lockY.current = window.scrollY;
        await raf();
        const rect = withOrigin(measure(), T);
        if (rect) {
          const K = kFor(rect.width);
          hide();
          await run(T.camera ? ms * 1.05 : ms / 2, (t) => frame(piece, colorMV, T.mid * (1 - (T.camera ? 1 - (1 - t) * (1 - t) * (1 - t) : t)), rect, focus, K, T)); // camera flower: slower so the zoom-out is clearly visible
        }
      }
      show();
    };

    // 3 <-> 4 — our story <-> Instagram. (Temporary soft cross-fade until the final effect is set.)
    const playFade = async (to) => {
      let swapped = false;
      await run(1100, (t) => {
        m.vanillaO.set(kf(t, [0, 0.45, 0.55, 1], [0, 1, 1, 0]));
        if (!swapped && t >= 0.5) {
          swapped = true;
          goTo(to);
        }
      });
    };

    // 3 <-> 4 — our story <-> Instagram. The story's instant-film photos gather into a line, the
    // Instagram photos slide in (as the same kind of print) and join it while the view slides along,
    // then they snap into the Instagram grid and the text fades in from the sides.
    // petals flying across the screen (dir 1: right -> left, -1: left -> right); runs on its own
    const flurry = (dir) => {
      const root = petalRef.current;
      if (!root) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const els = [...root.children];
      const r = (i, n) => {
        const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
        return x - Math.floor(x);
      };
      const spec = els.map((el, i) => {
        const big = i < 3;
        const size = big ? Math.max(W, H) * (0.3 + r(i, 1) * 0.22) : 60 + r(i, 2) * 170;
        return {
          el,
          size,
          delay: r(i, 3) * 0.55,
          dur: big ? 0.8 + r(i, 4) * 0.25 : 0.9 + r(i, 4) * 0.5,
          y: H * (0.12 + r(i, 5) * 0.76),
          amp: 25 + r(i, 6) * 70,
          ph: r(i, 7) * 6.28,
          turns: (1 + r(i, 8) * 1.6) * (r(i, 9) < 0.5 ? -1 : 1) * 360,
          blur: big ? 9 + r(i, 10) * 8 : r(i, 10) * 2.5,
          rx: r(i, 11) * 0.4,
        };
      });
      const total = 2.0;
      root.style.display = 'block';
      run(total * 1000, (p) => {
        const now = p * total;
        spec.forEach((o) => {
          const u = (now - o.delay) / o.dur;
          if (u < 0 || u > 1) {
            o.el.style.display = 'none';
            return;
          }
          const x = dir > 0 ? lerp(W + o.size * 0.6, -o.size * 0.6, u) : lerp(-o.size * 0.6, W + o.size * 0.6, u);
          const y = o.y + Math.sin(u * 5 + o.ph) * o.amp;
          o.el.style.display = 'block';
          o.el.style.width = `${o.size}px`;
          o.el.style.filter = o.blur > 0.3 ? `blur(${o.blur.toFixed(1)}px)` : '';
          o.el.style.transform = `translate(${x - o.size / 2}px, ${y - o.size / 2}px) rotate(${o.turns * u}deg)`;
        });
      }).then(() => {
        root.style.display = 'none';
        spec.forEach((o) => {
          o.el.style.display = 'none';
        });
      });
    };

    // 4 <-> 5 — Instagram <-> Order: the ribbon swipes across and pulls the other page in behind it.
    const playSwipe = async (dir) => {
      const root = swipeRef.current;
      if (!root) {
        goTo(dir > 0 ? 5 : 4);
        return;
      }
      const W = window.innerWidth;
      const H = window.innerHeight;
      const rw = Math.min(H * SWIPE_RATIO, W * 0.46);
      const under = root.querySelector('[data-sw-under]');
      const rib = root.querySelector('[data-sw-ribbon]');
      rib.style.width = `${rw}px`;
      const blurEl = root.querySelector('[data-sw-blur]');
      // speed graph: starts at the old pace and builds to its fastest right at the end (1.2x quicker overall)
      const curve = (p) => {
        const q = Math.pow(p, 1.35);
        return q * q * (3 - 2 * q);
      };
      const paint = (p) => {
        const e = curve(p);
        const v = (curve(Math.min(1, p + 0.01)) - curve(Math.max(0, p - 0.01))) / 0.02; // speed
        const mb = p > 0.55 ? Math.min(1, v / 2.2) * 14 * easeIO(c01((p - 0.55) / 0.35)) : 0;
        blurEl.setAttribute('stdDeviation', `${mb.toFixed(1)} 0`);
        const cx = dir > 0 ? lerp(-rw / 2, W + rw / 2, e) : lerp(W + rw / 2, -rw / 2, e);
        rib.style.transform = `translateX(${(cx - rw / 2).toFixed(1)}px)`;
        under.style.clipPath =
          dir > 0 ? `inset(0 ${Math.max(0, W - cx).toFixed(1)}px 0 0)` : `inset(0 0 0 ${Math.max(0, cx).toFixed(1)}px)`;
      };
      paint(0);
      setSwipeView(dir > 0 ? 'order' : 'insta');
      root.style.display = 'block';
      await raf();
      await raf();
      await run(1250, paint);
      paint(1);
      goTo(dir > 0 ? 5 : 4);
      await raf();
      await raf();
      rib.style.display = 'none';
      await wait(950); // the real page finishes its own entrance underneath, then the preview goes
      root.style.display = 'none';
      rib.style.display = '';
      setSwipeView(null);
    };

    const playPolaroids = async (dir) => {
      const root = lineRef.current;
      if (!root) {
        goTo(dir > 0 ? 4 : 3);
        return;
      }
      const W = window.innerWidth;
      const H = window.innerHeight;
      const pw = W / (4 * 1.14); // four prints (with their gaps) fill one screen width
      const gap = pw * 0.14;
      const stepX = pw + gap;
      const pad = pw * 0.05;
      const padB = pw * 0.16;
      const ph = (pw - 2 * pad) * 1.25 + pad + padB;
      const SW = 2.5; // seconds into the timeline where the page underneath is swapped
      const T = 3.5;
      const els = [...root.querySelectorAll('[data-pol]')];
      const bg = root.querySelector('[data-pol-bg]');
      bg.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
      const grass = root.querySelector('[data-pol-grass]');
      const R = { story: null, tiles: null };

      const measureStory = () =>
        [...document.querySelectorAll('[data-story-polaroid]')].map((f) => {
          const r = f.getBoundingClientRect();
          return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: f.offsetWidth, h: f.offsetHeight, rot: Number(f.dataset.rot) || 0 };
        });
      const measureTiles = () =>
        [...document.querySelectorAll('[data-gallery-tile]')].map((f) => {
          const r = f.getBoundingClientRect();
          return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
        });
      const setStoryHidden = (v) =>
        document.querySelectorAll('[data-story-polaroid]').forEach((f) => {
          f.style.visibility = v ? 'hidden' : '';
        });

      const put = (el, o) => {
        el.style.display = o.a <= 0.001 ? 'none' : 'block';
        el.style.opacity = String(o.a);
        el.style.width = `${o.w}px`;
        el.style.height = `${o.h}px`;
        el.style.padding = `${o.pt}px ${o.pt}px ${o.pb}px ${o.pt}px`;
        el.style.borderRadius = `${o.radius}px`;
        el.style.filter = o.blur > 0.2 ? `blur(${o.blur.toFixed(1)}px)` : '';
        el.style.transform = `translate(${o.cx - o.w / 2 + (o.sx || 0)}px, ${o.cy - o.h / 2 + (o.sy || 0)}px) rotate(${o.rot}deg)`;
      };

      const paint = (t) => {
        // how many prints have joined the line (fractional while one slides in)
        const q = [];
        for (let k = 0; k < 7; k += 1) q.push(easeOut(c01((t - (0.8 + k * 0.16)) / 0.62)));
        const nf = 3 + q.reduce((a, b) => a + b, 0);
        const centre = ((nf - 1) * stepX) / 2;
        const newest = (nf - 1) * stepX;
        const cam = Math.max(centre, newest - 0.28 * W);
        const lineX = (i) => W / 2 + i * stepX - cam;
        const lineY = H / 2;
        // a short shake of the whole line each time a print lands
        let sx = 0;
        let sy = 0;
        for (let k = 0; k < 7; k += 1) {
          const dt = t - (0.8 + k * 0.16 + 0.54);
          if (dt >= 0 && dt < 0.4) {
            const a = 0; // shake removed
            sx += Math.sin(dt * 70) * a;
            sy += Math.cos(dt * 83) * a * 0.7;
          }
        }
        if (t > SW) {
          const f = 1 - c01((t - SW) / 0.3);
          sx *= f;
          sy *= f;
        }

        const m = t > SW ? easeIO(c01((t - SW) / 0.9)) : 0;
        // background: the page's cream covers the page we leave, then blurs into the grass photo
        // (which drifts and motion-blurs with the line), settling as the page's own grass
        const fadeOut = t > SW ? 1 - easeIO(c01((t - SW - 0.45) / 0.6)) : 1;
        bg.style.opacity = String(easeIO(c01(t / 0.3)) * fadeOut);
        grass.style.opacity = String(c01(t / 0.9) * fadeOut);
        const gBlur = lerp(lerp(21, 3, easeIO(c01((t - 0.3) / 0.9))), 0, m);
        grass.style.filter = `blur(${gBlur.toFixed(1)}px)`;
        const gScale = lerp(1.22, 1.08, m);
        const gShift = Math.min(cam * 0.12, (gScale - 1) * window.innerWidth * 0.45) * (1 - m);
        grass.style.transform = `translateX(${(-gShift).toFixed(1)}px) scale(${gScale.toFixed(3)})`;

        const g = easeIO(c01((t - 0.2) / 0.6));
        for (let i = 0; i < 3; i += 1) {
          const sr = R.story?.[i];
          const lx = lineX(i);
          const o = {
            cx: sr ? lerp(sr.cx, lx, g) : lx,
            cy: sr ? lerp(sr.cy, lineY, g) : lineY,
            w: sr ? lerp(sr.w, pw, g) : pw,
            h: sr ? lerp(sr.h, ph, g) : ph,
            rot: sr ? lerp(sr.rot, 0, g) : 0,
            pt: pad,
            pb: padB,
            radius: 2,
            a: t > SW ? 1 - c01((t - SW) / 0.35) : 1,
            blur: 0,
            sx,
            sy,
          };
          o.a = Math.max(0, o.a);
          put(els[i], o);
        }
        for (let k = 0; k < 7; k += 1) {
          const i = 3 + k;
          const lx = lineX(i);
          const fromY = k % 2 === 0 ? -ph : H + ph;
          const tile = R.tiles?.[k];
          const o = {
            cx: lerp(lx, tile ? tile.cx : lx, m),
            cy: lerp(lerp(fromY, lineY, q[k]), tile ? tile.cy : lineY, m),
            w: lerp(pw, tile ? tile.w : pw, m),
            h: lerp(ph, tile ? tile.h : ph, m),
            rot: lerp((k % 2 === 0 ? -4 : 4) * (1 - q[k]), 0, m),
            pt: lerp(pad, 0, m),
            pb: lerp(padB, 0, m),
            radius: lerp(2, 24, m),
            a: t < 0.8 + k * 0.16 ? 0 : 1,
            blur: q[k] > 0 && q[k] < 1 ? 14 * (1 - q[k]) ** 1.4 : 0,
            sx,
            sy,
          };
          put(els[i], o);
        }
      };

      const finish = () => {
        root.style.display = 'none';
        els.forEach((e) => {
          e.style.display = 'none';
        });
        bg.style.opacity = '0';
        grass.style.opacity = '0';
      };

      root.style.display = 'block';
      try {
        if (dir > 0) {
          R.story = measureStory();
          setStoryHidden(true);
          paint(0);
          await run(SW * 1000, (p) => paint(p * SW));
          // swap to the Instagram page (tiles invisible, text waiting at the sides)
          setGalleryHeld(true);
          goTo(4);
          await raf();
          await raf();
          R.tiles = measureTiles();
          await run((T - SW) * 1000, (p) => paint(SW + p * (T - SW)));
          paint(T);
          setGalleryHeld(false); // tiles appear exactly where the prints landed, text slides in
          await raf();
          await raf();
          finish();
        } else {
          setGalleryHeld(true); // hide the real tiles, measure them, start from there
          await raf();
          await raf();
          R.tiles = measureTiles();
          paint(T);
          await run((T - SW) * 1000, (p) => paint(T - p * (T - SW)));
          skipTop.current = false;
          setStoryIn(true);
          goTo(3);
          await raf();
          await raf();
          R.story = measureStory();
          setStoryHidden(true);
          await run(SW * 1000, (p) => paint(SW - p * SW));
          setStoryHidden(false);
          await raf();
          await raf();
          finish();
        }
      } finally {
        setStoryHidden(false);
        setGalleryHeld(false);
        finish();
      }
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
        T: isMobile() ? T_COOKIE_M : T_COOKIE,
        ms: isMobile() ? 2300 : 1800,
        // slide the card bar so the Chocolate Chip card sits in the middle of the screen, then zoom
        before: () => bringCardIntoView(lock),
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

    // brings the small flower into view (smoothly) before the camera zooms in on it
    const bringFlowerIntoView = async () => {
      const el = flowerImg();
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top >= NAV + 8 && r.bottom <= window.innerHeight - 8) return;
      const sy = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ty = Math.min(max, Math.max(0, sy + r.top + r.height / 2 - window.innerHeight / 2));
      await run(600, (p) => {
        const y = sy + (ty - sy) * smooth(p);
        lock(y);
        window.scrollTo({ top: y, behavior: 'instant' });
      });
    };

    const playFlower = (dir) =>
      playZoom(dir, {
        piece: m.flower,
        colorMV: m.vanillaO,
        focus: FLOWER_FOCUS,
        ratio: FLOWER_RATIO,
        from: 2,
        to: dir > 0 ? 3 : 2,
        maxK: 1.8, // zooms well past the point where the flower fills the screen
        T: T_FLOWER,
        ms: 1400,
        before: bringFlowerIntoView,
        settle: () => window.scrollTo({ top: 0, behavior: 'instant' }),
        measure: () => flowerImg()?.getBoundingClientRect() ?? null,
        hide: () => {},
        show: () => {},
        afterSwap: (back) => {
          setStoryIn(back);
          if (!back) {
            const hb = document.querySelector('header');
            if (hb) hb.style.opacity = '';
          }
        },
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
        else if (c === 3 && dir > 0) await playPolaroids(1);
        else if (c === 4 && dir < 0) await playPolaroids(-1);
        else if (c === 4 && dir > 0) await playSwipe(1);
        else if (c === 5 && dir < 0) await playSwipe(-1);
      } finally {
        clear();
        const el = cardImg();
        if (el) el.style.opacity = '';
        const fl = flowerImg();
        if (fl) fl.style.opacity = '';
        const cam = document.getElementById('flower-camera');
        if (cam) { cam.style.transform = ''; cam.style.zIndex = ''; cam.style.position = ''; }
        const hb = document.querySelector('header');
        if (hb) { hb.style.opacity = ''; hb.style.transition = ''; }
        const sc = document.getElementById('story-camera');
        if (sc) sc.style.transform = '';
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
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 6;

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

    // Desktop: ordinary page scrolling runs at a gentler pace (eased, so it still feels smooth).
    const SCROLL_SPEED = 0.5;
    let target = null;
    let gliding = false;
    const glide = () => {
      if (target == null || busy.current) {
        target = null;
        gliding = false;
        return;
      }
      const cur = window.scrollY;
      const next = cur + (target - cur) * 0.16;
      if (Math.abs(target - next) < 0.6) {
        window.scrollTo({ top: target, behavior: 'instant' });
        target = null;
        gliding = false;
        return;
      }
      window.scrollTo({ top: next, behavior: 'instant' });
      requestAnimationFrame(glide);
    };
    const slowScroll = (e) => {
      if (isMobile()) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      const base = target ?? window.scrollY;
      target = Math.min(max, Math.max(0, base + e.deltaY * unit * SCROLL_SPEED));
      e.preventDefault();
      if (!gliding) {
        gliding = true;
        requestAnimationFrame(glide);
      }
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
      if (!e.defaultPrevented) slowScroll(e);
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
      if (!gliding) target = null; // scrolled some other way (keys, scrollbar, nav link)
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
      const link = e.target.closest && e.target.closest('a[href^="#"]');
      const id = link ? link.getAttribute('href').slice(1) : '';
      if (!link || CHAPTER_OF[id] == null) return;
      // phones: the hero's "Explore Our Sweets" button plays the cloth into the menu
      if (isMobile() && !busy.current && chapterRef.current === 0 && link.closest('#home') && id === 'menu') {
        e.preventDefault();
        start(0, 1);
        return;
      }
      // Nav / footer links always jump to their page, even when the address already says that
      // (the address does not change while you scroll between pages).
      e.preventDefault();
      if (busy.current) return;
      try {
        window.history.replaceState(null, '', `#${id}`);
      } catch {
        /* ignore */
      }
      const c = CHAPTER_OF[id];
      if (c !== chapterRef.current) {
        pendingId.current = id;
        setBoxesIn(true);
        setStoryIn(true);
        goTo(c);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
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
      <PolaroidLine lineRef={lineRef} />
      <PetalLayer petalRef={petalRef} />
      <SwipeLayer swipeRef={swipeRef} view={swipeView} order={order} setQty={setQty} />
      {chapter === 0 && <Hero introDone={introDone} />}
      {chapter === 1 && (
        <>
          <FreshlyBaked order={order} onAdd={onAdd} />
          <NextButton onClick={() => startRef.current?.(1, 1)} onBack={() => startRef.current?.(1, -1)} backLabel="Back to home" tight>
            Check out our assorted cookie box
          </NextButton>
        </>
      )}
      {chapter === 2 && SITE.features.boxes && (
        <div className="overflow-clip">
          <div id="flower-camera">
            <LittleBox order={order} onAdd={onAdd} entered={boxesIn} />
            <NextButton onClick={() => startRef.current?.(2, 1)} onBack={() => startRef.current?.(2, -1)} backLabel="Back to the menu">
              See our story
            </NextButton>
          </div>
        </div>
      )}
      {chapter === 3 && (
        <div className="overflow-clip">
          <div id="story-camera">
          <div className="flex justify-center px-5 pt-20 md:hidden">
            <BackButton onClick={() => startRef.current?.(3, -1)}>Back to the boxes</BackButton>
          </div>
          <motion.div
            initial={storyIn ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
            animate={storyIn ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <OurStory instant />
          </motion.div>
          <NextButton onClick={() => startRef.current?.(3, 1)}>See our Instagram</NextButton>
          </div>
        </div>
      )}
      {chapter === 4 && (
        <>
          <GrassBg />
          <div className="flex justify-center px-5 pt-20 md:hidden">
            <BackButton onClick={() => startRef.current?.(4, -1)}>Back to our story</BackButton>
          </div>
          <InstagramGallery held={galleryHeld} />
          <NextButton onClick={() => startRef.current?.(4, 1)}>Place an order</NextButton>
        </>
      )}
      {chapter === 5 && (
        <>
          <div className="flex justify-center px-5 pt-20 md:hidden">
            <BackButton onClick={() => startRef.current?.(5, -1)}>Back to Instagram</BackButton>
          </div>
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
