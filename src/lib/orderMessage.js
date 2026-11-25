import { SITE } from '../data/site.js';

// Builds the plain-text message that is copied / emailed / sent by Instagram DM.
export function buildMessage({ items, total = 0, name, contact, date, notes }) {
  const lines = [
    `Hi ${SITE.name}! I'd like to place an order:`,
  ];

  if (items.length) {
    lines.push(
      '',
      ...items.map((i) => `• ${i.qty} × ${i.name}${i.unit ? ` (${i.unit})` : ''}`),
    );
    if (total > 0) lines.push('', `Estimated total: $${total.toFixed(2)} (please confirm)`);
  }

  lines.push('');
  if (name.trim()) lines.push(`Name: ${name.trim()}`);
  if (contact.trim()) lines.push(`Contact: ${contact.trim()}`);
  if (date) lines.push(`Needed by: ${date}`);
  if (notes.trim()) lines.push('', `Notes: ${notes.trim()}`);
  lines.push('', 'Thank you! ♡');

  return lines.join('\n');
}
