// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS & BOXES — the single source of truth for everything on the menu.
//
// Source: the bakery's menu and the owner's pricing: a box of 3 same-flavor cookies is $12, an assorted
// box (5–6 different cookies) is $16, and a box of 3 cinnamon rolls is $12.
//
// Fields
//   id            unique, URL-safe string
//   name          product name
//   description   one or two mouth-watering sentences
//   price         a number like 12, or null if not verified (null hides the price)
//   unit          what the price covers, e.g. '3 cookies' (shown next to the price)
//   availability  'available' | 'limited' | 'preorder' | 'sold-out' | null (null hides it)
//   image         path inside /public, e.g. 'images/products/smores.jpg', or null
//   imageAlt      describe the photo for screen readers
//   placeholder   true while the entry is still sample content
// ─────────────────────────────────────────────────────────────────────────────

export const AVAILABILITY = {
  available: { label: 'Available', tone: 'bg-butter text-cocoa' },
  limited: { label: 'Limited batch', tone: 'bg-strawberry text-cocoa' },
  preorder: { label: 'Pre-order', tone: 'bg-beige text-cocoa' },
  'sold-out': { label: 'Sold out', tone: 'bg-cocoa text-vanilla' },
};

// Cookie flavors. Every flavor comes in a box of 3 cookies of the SAME flavor for $12.
// TODO(owner): descriptions are short — swap in your own wording. Strawberry Shortcake and
// Chocolate Strawberry don't have photos yet and show a labelled placeholder.
const flavor = (id, name, description, image = null, imageAlt = '') => ({
  id,
  name,
  description,
  price: 12,
  unit: 'box of 3',
  availability: 'available',
  image,
  imageAlt,
});

export const PRODUCTS = [
  flavor(
    'smores',
    'S’mores',
    'A big, soft chocolatey cookie with gooey toasted marshmallow in every bite.',
    'images/products/smores.jpg',
    'Three s’mores cookies on a plate, split open to show melted marshmallow',
  ),
  flavor(
    'chocolate-chip',
    'Chocolate Chip',
    'Golden, crinkly-edged and loaded with melty chocolate, finished with flaky salt.',
    'images/products/chocolate-chip.jpg',
    'A box of chocolate chip cookies with flaky salt on top',
  ),
  flavor(
    'earl-grey',
    'Earl Grey',
    'Bergamot and floral tea notes in a soft cookie with a sparkly sugar crust.',
    'images/products/earl-grey.jpg',
    'An Earl Grey cookie flecked with tea leaves and coated in sugar crystals',
  ),
  flavor(
    'ube-matcha-latte',
    'Ube Matcha Latte',
    'Rich ube swirled with earthy matcha in one marbled cookie.',
    'images/products/ube-matcha-latte.jpg',
    'Purple ube and green matcha swirled cookies stacked in a box',
  ),
  flavor(
    'strawberry-matcha',
    'Strawberry Matcha',
    'Earthy matcha with jammy strawberry, white chocolate drizzle and freeze-dried strawberry on top.',
    'images/products/strawberry-matcha.jpg',
    'Strawberry matcha cookies in a box with white chocolate drizzle and freeze-dried strawberry',
  ),
  flavor('strawberry-shortcake', 'Strawberry Shortcake', 'Sweet strawberry shortcake flavors in a soft, homemade cookie.'),
  flavor('chocolate-strawberry', 'Chocolate Strawberry', 'Rich chocolate and sweet strawberry together in one cookie.'),
];

// Boxes for "A Little Box of Happiness". Only shown if SITE.features.boxes is true.
//   note — a line shown where a "what's inside" list would go.
export const BOXES = [
  {
    id: 'assorted-box',
    name: 'Assorted Cookie Box',
    description: 'A box of 5–6 cookies, each one a different flavor, so everyone finds a favorite.',
    size: '5–6 cookies',
    note: 'every cookie is a different flavor ♡',
    contents: [],
    price: 16,
    unit: 'box',
    availability: 'available',
    image: 'images/products/assorted-box.jpg',
    imageAlt: 'A white box of assorted cookies including chocolate chip and Earl Grey',
    // Small close-up photo that overlaps the corner of the big photo.
    detailImage: 'images/story/close-up.jpg',
    detailAlt: 'Close-up of chocolate chip cookies with flaky salt',
  },
  {
    id: 'cinnamon-roll-box',
    name: 'Cinnamon Roll Box',
    description: 'Three soft, gooey cinnamon rolls with sweet icing, packed together in one box.',
    size: 'Box of 3',
    note: 'three cinnamon rolls in every box ♡',
    contents: [],
    price: 12,
    unit: 'box of 3',
    availability: 'available',
    image: 'images/gallery/cinnamon-rolls-1.jpg',
    imageAlt: 'A pan of freshly iced cinnamon rolls',
    detailImage: 'images/products/cinnamon-roll-close-up.jpg',
    detailAlt: 'Close-up of frosted cinnamon rolls with swirls of cinnamon',
  },
];

// Everything a visitor can add to an order, in one list.
export const ORDERABLE = [
  ...PRODUCTS.map((p) => ({ ...p, kind: 'sweet' })),
  ...BOXES.map((b) => ({ ...b, kind: 'box' })),
];
