import { Float } from './Doodles.jsx';
import { asset } from '../lib/assets.js';

// A photo cut-out (chocolate chips, chocolate piece, strawberries, sprinkles) that drifts gently.
// Position it with `className` (absolute + top/left/...), size with `w` (px) and tilt with `tilt` (deg).
const TREATS = {
  chips: 'images/treats/choc-chips.webp',
  chocolate: 'images/treats/choc-piece.webp',
  strawberries: 'images/treats/strawberries.webp',
  sprinkles: 'images/treats/sprinkles.webp',
};

export default function Treat({ name, className = '', w = 110, tilt = 0, delay = 0, duration = 8, y = 16, rotate = 5 }) {
  return (
    <Float className={`pointer-events-none ${className}`} delay={delay} duration={duration} y={y} rotate={rotate}>
      <img
        src={asset(TREATS[name])}
        alt=""
        draggable="false"
        loading="lazy"
        className="block h-auto max-w-none select-none"
        style={{ width: w, transform: `rotate(${tilt}deg)`, filter: 'drop-shadow(0 8px 10px rgba(60, 30, 15, 0.28))' }}
      />
    </Float>
  );
}
