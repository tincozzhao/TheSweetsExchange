import LaceSides from './LaceSides.jsx';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Instagram, Mail, Minus, Plus } from 'lucide-react';
import Reveal, { EASE } from './Reveal.jsx';
import { AVAILABILITY, ORDERABLE } from '../data/products.js';
import { SITE } from '../data/site.js';
import { asset } from '../lib/assets.js';
import { formatPrice } from '../lib/format.js';
import { buildMessage } from '../lib/orderMessage.js';

export default function Order({ order, setQty }) {
  const [form, setForm] = useState({ name: '', contact: '', date: '', notes: '' });
  const [status, setStatus] = useState({ type: '', text: '' });

  const items = useMemo(
    () => ORDERABLE.filter((i) => order[i.id] > 0).map((i) => ({ ...i, qty: order[i.id] })),
    [order],
  );

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const total = items.reduce((sum, i) => sum + (typeof i.price === 'number' ? i.price * i.qty : 0), 0);
  const hasUnpriced = items.some((i) => typeof i.price !== 'number');
  const message = buildMessage({ items, total: hasUnpriced ? 0 : total, ...form });
  const email = SITE.contact.email;

  const validate = () => {
    if (!form.name.trim()) return 'Please tell us your name so we know who to say hello to.';
    if (items.length === 0) return 'Add at least one sweet above to start your order.';
    return '';
  };

  // Called straight from a click so the browser allows the clipboard write.
  const copyText = () => {
    try {
      return navigator.clipboard.writeText(message).then(
        () => true,
        () => false,
      );
    } catch {
      return Promise.resolve(false);
    }
  };

  const onInstagram = (e) => {
    const err = validate();
    if (err) {
      e.preventDefault();
      setStatus({ type: 'error', text: err });
      return;
    }
    copyText().then((ok) =>
      setStatus({
        type: 'ok',
        text: ok
          ? 'Your message is copied. Paste it into the chat that just opened and hit send.'
          : 'The chat opened. Press “Copy message”, then paste it in and hit send.',
      }),
    );
  };

  const onEmail = (e) => {
    const err = validate();
    if (err) {
      e.preventDefault();
      setStatus({ type: 'error', text: err });
      return;
    }
    setStatus({ type: 'ok', text: 'Opening your email app with the message filled in…' });
  };

  const onCopy = async () => {
    const err = validate();
    if (err) {
      setStatus({ type: 'error', text: err });
      return;
    }
    const ok = await copyText();
    setStatus({
      type: ok ? 'ok' : 'error',
      text: ok
        ? 'Message copied. Paste it wherever you like.'
        : 'Couldn’t copy automatically — select the message above and copy it.',
    });
  };

  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Order inquiry — ${form.name || 'hello'}`)}&body=${encodeURIComponent(message)}`
    : '';

  return (
    <section
      id="order"
      className="relative scroll-mt-16 overflow-hidden bg-[#3b2217] bg-cover bg-center py-24 sm:py-32"
      style={{ backgroundImage: `url(${asset('images/menu-bg.webp')})`, '--lace': `url(${asset('images/lace.webp')})` }}
    >

      <div className="relative mx-auto max-w-4xl space-y-12 px-5 sm:px-8">
        {/* Info column */}
        <div className="text-center">
          <Reveal className="lace-panel mx-auto max-w-3xl">
            <LaceSides />
            <p className="font-hand text-3xl text-burnt">something sweet?</p>
            <h2 className="mt-2 text-5xl font-semibold leading-none tracking-tight text-cocoa sm:text-6xl">
              Place an <span className="italic text-burnt">order</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cocoa/80">
              Pick what you&rsquo;d like, add your details, and send us your request. We&rsquo;ll reply to confirm
              everything &mdash; nothing is charged on this site.
            </p>
          </Reveal>
        </div>

        {/* Order form */}
        <Reveal delay={0.1}>
          <form
            onSubmit={(e) => e.preventDefault()}
            noValidate
            aria-label="Order inquiry"
            className="rounded-[2rem] bg-vanilla p-6 shadow-paper sm:p-10"
          >
            {/* Items */}
            <fieldset className="mt-8">
              <legend className="text-xl font-semibold text-cocoa">
                What would you like?
              </legend>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {ORDERABLE.map((item) => {
                  const qty = order[item.id] || 0;
                  const soldOut = item.availability === 'sold-out' || item.availability === 'unavailable';
                  const price = formatPrice(item.price);
                  const avail = item.availability ? AVAILABILITY[item.availability] : null;
                  return (
                    <li
                      key={item.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 transition-colors duration-300 ${
                        qty ? 'border-burnt bg-butter/40' : 'border-cocoa/15'
                      } ${soldOut ? 'opacity-50' : ''}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-cocoa">{item.name}</p>
                        <p className="text-sm text-cocoa/65">
                          {item.kind === 'box' ? 'Box' : 'Sweet'}
                          {price ? ` · ${price}${item.unit ? ` / ${item.unit}` : ''}` : ''}
                          {avail ? ` · ${avail.label}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, qty - 1)}
                          disabled={qty === 0}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="grid h-9 w-9 place-items-center rounded-full border-2 border-cocoa text-cocoa transition-colors hover:bg-cocoa hover:text-vanilla disabled:cursor-not-allowed disabled:border-cocoa/20 disabled:text-cocoa/30 disabled:hover:bg-transparent"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span
                          className="w-6 text-center font-bold tabular-nums"
                          aria-live="polite"
                          aria-label={`${qty} of ${item.name}`}
                        >
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, qty + 1)}
                          disabled={soldOut}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="grid h-9 w-9 place-items-center rounded-full border-2 border-cocoa bg-cocoa text-vanilla transition-colors hover:border-burnt hover:bg-burnt disabled:cursor-not-allowed disabled:border-cocoa/20 disabled:bg-transparent disabled:text-cocoa/30"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            {/* Details */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="order-name" className="mb-1.5 block text-sm font-bold">
                  Your name <span className="text-burnt">*</span>
                </label>
                <input
                  id="order-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Jamie"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="order-contact" className="mb-1.5 block text-sm font-bold">
                  Email or Instagram handle
                </label>
                <input
                  id="order-contact"
                  type="text"
                  autoComplete="email"
                  value={form.contact}
                  onChange={update('contact')}
                  placeholder="So we can reply"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="order-date" className="mb-1.5 block text-sm font-bold">
                  When do you need it?
                </label>
                <input
                  id="order-date"
                  type="date"
                  value={form.date}
                  onChange={update('date')}
                  className="field"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="order-notes" className="mb-1.5 block text-sm font-bold">
                  Anything we should know?
                </label>
                <textarea
                  id="order-notes"
                  rows={4}
                  value={form.notes}
                  onChange={update('notes')}
                  placeholder="Which flavors for your assorted box, questions, dietary needs…"
                  className="field resize-y"
                />
              </div>
            </div>

            {items.length > 0 && !hasUnpriced && (
              <p className="mt-6 flex items-baseline justify-between gap-4 rounded-2xl bg-butter/50 px-5 py-3">
                <span className="font-semibold">Estimated total</span>
                <span className="font-serif text-2xl text-burnt">{formatPrice(total)}</span>
              </p>
            )}

            {/* Message preview */}
            <div className="mt-8">
              <p className="mb-2 text-sm font-bold">Your message</p>
              <pre
                className="whitespace-pre-wrap rounded-2xl bg-beige/70 p-4 font-sans text-sm leading-relaxed text-cocoa/90"
                tabIndex={0}
                aria-label="Preview of the message that will be sent"
              >
                {message}
              </pre>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <motion.a
                href={SITE.instagram.dm}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onInstagram}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
                Send on Instagram
                <span className="sr-only"> (opens in a new tab)</span>
              </motion.a>

              {email && (
                <motion.a
                  href={mailto}
                  onClick={onEmail}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-pink"
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  Send by email
                </motion.a>
              )}

              <button type="button" onClick={onCopy} className="btn btn-secondary">
                <Copy className="h-5 w-5" aria-hidden="true" />
                Copy message
              </button>
            </div>

            <div aria-live="polite" role="status" className="mt-4 min-h-[1.5rem]">
              <AnimatePresence mode="wait">
                {status.text && (
                  <motion.p
                    key={status.text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={`flex items-start gap-2 font-medium ${
                      status.type === 'error' ? 'text-burnt' : 'text-cocoa'
                    }`}
                  >
                    {status.type === 'ok' && (
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-burnt" aria-hidden="true" />
                    )}
                    {status.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
