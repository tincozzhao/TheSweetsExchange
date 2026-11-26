import { asset } from '../lib/assets.js';

/* Left/right lace for a .lace-panel: overlapping vertical pieces read as one long strip. */
export default function LaceSides() {
  const W = 56; // px, strip width
  const H = Math.round(W * (824 / 120));
  const step = Math.round(H * 0.88);
  return ['left', 'right'].map((side) => (
    <div
      key={side}
      aria-hidden="true"
      className="pointer-events-none absolute overflow-hidden"
      style={{ width: W, top: -14, bottom: -14, [side]: -W / 2 }}
    >
      {Array.from({ length: 5 }, (_, k) => (
        <div
          key={k}
          className="absolute left-0"
          style={{
            top: k * step,
            width: W,
            height: H,
            backgroundImage: `url(${asset('images/lace-v.webp')})`,
            backgroundSize: '100% 100%',
            transform: side === 'right' ? 'scaleX(-1)' : undefined,
            filter: 'drop-shadow(0 1px 1.5px rgba(70, 40, 30, 0.55))',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 7%, #000 93%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0, #000 7%, #000 93%, transparent 100%)',
          }}
        />
      ))}
    </div>
  ));
}
