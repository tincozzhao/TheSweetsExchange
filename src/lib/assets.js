// Turns a path inside /public (like "images/hero.jpg") into a URL that works
// both locally and under a GitHub Pages sub-path like /my-repo/.
export function asset(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  const base = import.meta.env.BASE_URL || './';
  return `${base}${path.replace(/^\.?\/+/, '')}`;
}
