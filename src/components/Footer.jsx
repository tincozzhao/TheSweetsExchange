import { ArrowUp, Instagram } from 'lucide-react';
import Wordmark from './Wordmark.jsx';
import { Flower, Heart } from './Doodles.jsx';
import { NAV_LINKS, SITE } from '../data/site.js';

export default function Footer() {
  return (
    <footer className="paper relative overflow-hidden bg-cocoa text-vanilla">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <a href="#home" aria-label="The Sweets Exchange, back to top" className="text-3xl">
              <Wordmark />
            </a>
            <p className="mt-6 max-w-sm font-serif text-xl italic leading-relaxed text-vanilla/80">
              {SITE.subtitle}
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-4">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-strawberry">
              Explore
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="inline-block py-1 text-lg transition-colors hover:text-butter"
                  >
                    {link.label}
                    {link.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-strawberry">
              Say hello
            </h2>
            <a
              href={SITE.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-vanilla/60 px-5 py-2.5 font-bold transition-colors hover:border-butter hover:bg-butter hover:text-cocoa"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />@{SITE.instagram.handle}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 border-t border-vanilla/20 pt-10 text-center">
          <div className="flex items-center gap-3 text-strawberry" aria-hidden="true">
            <Flower className="h-6 w-6" />
            <Heart className="h-7 w-7" />
            <Flower className="h-6 w-6" />
          </div>
          <p className="font-hand text-4xl text-butter sm:text-5xl">
            From our kitchen to your heart. ♡
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-vanilla/60">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <a
            href="#home"
            className="inline-flex items-center gap-2 rounded-full border border-vanilla/30 px-4 py-2 transition-colors hover:bg-vanilla hover:text-cocoa"
          >
            Back to top <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
