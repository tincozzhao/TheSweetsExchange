import { useEffect, useState } from 'react';

// A tiny hash router. GitHub Pages has no server-side routing, so every cookie page
// lives behind the "#": https://<site>/#/cookies/smores works as a direct link and can
// be shared, bookmarked or refreshed. Section anchors like #menu keep working too.

const COOKIE_RE = /^#\/cookies\/([a-z0-9-]+)\/?$/;

export const cookieHref = (slug) => `#/cookies/${slug}`;

function read() {
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  const match = hash.match(COOKIE_RE);
  return match ? { name: 'cookie', slug: match[1], hash } : { name: 'home', slug: null, hash };
}

export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

// The full, shareable address of a cookie page.
export function shareUrl(slug) {
  return `${window.location.origin}${window.location.pathname}${cookieHref(slug)}`;
}
