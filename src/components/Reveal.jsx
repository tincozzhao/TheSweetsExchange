import { motion } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

// Fades and slides its children up the first time they scroll into view.
// `delay` lets siblings stagger. Reduced-motion users get a plain fade
// (MotionConfig in App.jsx strips the movement).
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  as = 'div',
  amount = 0.2,
  instant = false,
}) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={instant ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
