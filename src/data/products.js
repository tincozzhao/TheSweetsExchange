// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS & BOXES — the single source of truth for everything on the menu
// AND for the individual cookie pages (#/cookies/<slug>).
//
// Pricing (from the owner): a box of 3 same-flavor cookies is $12, an assorted
// box (5–6 different cookies) is $16, and a box of 3 cinnamon rolls is $12.
//
// A cookie that has a `page` gets its own shareable page and a clickable menu card.
//
// Fields on every product
//   id / slug     unique, URL-safe string (the slug is used in the page URL)
//   name          product name
//   description   short card text shown on the menu
//   price, unit   e.g. 12 and 'box of 3' (price null hides the price)
//   availability  'available' | 'limited' | 'preorder' | 'sold-out' | null
//   image         menu-card photo inside /public (or null)
//   page          (optional) the product-page content, see below
//
// Fields inside `page`
//   tagline       short italic line under the name
//   story         the longer flavor description
//   highlights    { flavor: [...], texture: [...] }  — kept to what the descriptions say
//   top / inside  the two cut-out photos (full cookie from above, cross-section)
//   topAlt / insideAlt   alt text for each photo
// ─────────────────────────────────────────────────────────────────────────────

export const AVAILABILITY = {
  available: { label: 'Available', tone: 'bg-butter text-cocoa' },
  limited: { label: 'Limited batch', tone: 'bg-strawberry text-cocoa' },
  preorder: { label: 'Pre-order', tone: 'bg-beige text-cocoa' },
  'sold-out': { label: 'Sold out', tone: 'bg-cocoa text-vanilla' },
};

const COOKIE_DIR = 'images/cookies';

// Every flavor comes in a box of 3 cookies of the SAME flavor for $12.
const flavor = ({ id, name, description, image = null, imageAlt = '', page = null }) => ({
  id,
  slug: id,
  name,
  description,
  price: 12,
  unit: 'box of 3',
  availability: 'available',
  image,
  imageAlt,
  page: page && {
    ...page,
    top: `${COOKIE_DIR}/${id}-top.webp`,
    inside: `${COOKIE_DIR}/${id}-inside.webp`,
  },
});

// The order here is the order of the menu AND of the previous / next buttons on the pages.
export const PRODUCTS = [
  flavor({
    id: 'smores',
    name: 'S’mores',
    description: 'Melty chocolate and gooey, toasted marshmallow in a golden cookie.',
    image: 'images/products/smores.jpg',
    imageAlt: 'Three s’mores cookies on a plate, split open to show melted marshmallow',
    page: {
      tagline: 'A little campfire nostalgia',
      story:
        'A cozy, golden cookie filled with melty chocolate and gooey, toasted marshmallow. Every bite brings back the warmth and sweetness of a campfire night.',
      highlights: {
        flavor: ['Melty chocolate', 'Toasted marshmallow'],
        texture: ['Golden cookie', 'Gooey center'],
      },
      topAlt: 'A s’mores cookie from above, with melted chocolate and a streak of toasted marshmallow',
      insideAlt: 'A s’mores cookie broken in half, showing the gooey marshmallow inside',
    },
  }),
  flavor({
    id: 'strawberry-matcha',
    name: 'Strawberry Matcha',
    description: 'Earthy matcha meets bright strawberry, with a creamy drizzle and strawberry crumbles.',
    image: 'images/products/strawberry-matcha.jpg',
    imageAlt: 'Strawberry matcha cookies in a box with white chocolate drizzle and freeze-dried strawberry',
    page: {
      tagline: 'A berry sweet match',
      story:
        'Earthy matcha meets bright, fruity strawberry in a beautifully swirled cookie, finished with a creamy drizzle and strawberry crumbles. A delightful balance of sweet and earthy flavors.',
      highlights: {
        flavor: ['Earthy matcha', 'Bright strawberry'],
        texture: ['Creamy drizzle', 'Strawberry crumbles'],
      },
      topAlt: 'A strawberry matcha cookie from above, with white drizzle and red strawberry crumbles on green matcha dough',
      insideAlt: 'A strawberry matcha cookie broken in half, showing green matcha dough and strawberry crumbles',
    },
  }),
  flavor({
    id: 'espresso-brownie',
    name: 'Espresso Brownie',
    description: 'Fudgy brownie swirls and bold espresso notes, with a touch of flaky sea salt.',
    page: {
      tagline: 'A coffee lover’s dream',
      story:
        'Rich, fudgy brownie swirls meet bold espresso notes in a decadent cookie. Deep chocolate flavors, a soft center, and a delicate touch of flaky sea salt make every bite irresistible.',
      highlights: {
        flavor: ['Bold espresso notes', 'Deep chocolate', 'Flaky sea salt'],
        texture: ['Fudgy brownie swirls', 'Soft center'],
      },
      topAlt: 'An espresso brownie cookie from above, with dark brownie swirls and flakes of sea salt',
      insideAlt: 'An espresso brownie cookie broken in half, showing a soft, fudgy brownie center',
    },
  }),
  flavor({
    id: 'chocolate-chip',
    name: 'Chocolate Chip',
    description: 'Golden edges, a soft chewy center, chocolate chunks and flaky sea salt.',
    image: 'images/products/chocolate-chip.jpg',
    imageAlt: 'A box of chocolate chip cookies with flaky salt on top',
    page: {
      tagline: 'The timeless classic',
      story:
        'Golden edges, a soft and chewy center, generous chunks of chocolate, and a sprinkle of flaky sea salt. A familiar favorite that tastes like home.',
      highlights: {
        flavor: ['Chocolate chunks', 'Flaky sea salt'],
        texture: ['Golden edges', 'Soft, chewy center'],
      },
      topAlt: 'A chocolate chip cookie from above, with chunks of chocolate and flakes of sea salt',
      insideAlt: 'A chocolate chip cookie broken in half, showing a soft center and chocolate chunks',
    },
  }),
  flavor({
    id: 'earl-grey',
    name: 'Earl Grey',
    description: 'A fragrant tea cookie with the floral, citrus notes of Earl Grey.',
    image: 'images/products/earl-grey.jpg',
    imageAlt: 'An Earl Grey cookie flecked with tea leaves and coated in sugar crystals',
    page: {
      tagline: 'A little afternoon tea',
      story:
        'A delicately fragrant cookie infused with the comforting floral and citrus notes of Earl Grey tea. Soft, buttery, and perfect for a quiet afternoon.',
      highlights: {
        flavor: ['Floral', 'Citrus', 'Earl Grey tea'],
        texture: ['Soft', 'Buttery'],
      },
      topAlt: 'An Earl Grey cookie from above, flecked with tea leaves and sugar crystals',
      insideAlt: 'An Earl Grey cookie broken in half, showing a soft, tea-flecked center',
    },
  }),
  flavor({
    id: 'ube-matcha',
    name: 'Ube Matcha',
    description: 'Purple ube and earthy green matcha swirled into one soft, marbled cookie.',
    image: 'images/products/ube-matcha-latte.jpg',
    imageAlt: 'Purple ube and green matcha swirled cookies stacked in a box',
    page: {
      tagline: 'A swirl of two favorites',
      story:
        'Beautiful purple ube and earthy green matcha come together in a soft, marbled cookie. A playful combination of delicate sweetness and rich tea flavor.',
      highlights: {
        flavor: ['Delicate ube sweetness', 'Rich matcha'],
        texture: ['Soft', 'Marbled swirl'],
      },
      topAlt: 'An ube matcha cookie from above, marbled with purple ube and green matcha',
      insideAlt: 'An ube matcha cookie broken in half, showing layers of purple ube and green matcha',
    },
  }),
  flavor({
    id: 'red-velvet',
    name: 'Red Velvet',
    description: 'A velvety red cookie topped with creamy white frosting and red velvet crumbles.',
    page: {
      tagline: 'A little love in every bite',
      story:
        'A rich, velvety red cookie topped with creamy white frosting and delicate red velvet crumbles. Soft, indulgent, and beautifully nostalgic.',
      highlights: {
        flavor: ['Rich red velvet', 'Creamy white frosting'],
        texture: ['Velvety', 'Soft', 'Red velvet crumbles'],
      },
      topAlt: 'A red velvet cookie from above, covered in white frosting and red velvet crumbs',
      insideAlt: 'A red velvet cookie broken in half, showing a red crumb and a layer of white frosting',
    },
  }),
  // These two are still on the menu but don't have photos or a page yet.
  flavor({
    id: 'strawberry-shortcake',
    name: 'Strawberry Shortcake',
    description: 'Sweet strawberry shortcake flavors in a soft, homemade cookie.',
  }),
  flavor({
    id: 'chocolate-strawberry',
    name: 'Chocolate Strawberry',
    description: 'Rich chocolate and sweet strawberry together in one cookie.',
  }),
];

// Only the cookies that have a page, in page order (used for previous / next).
export const COOKIE_PAGES = PRODUCTS.filter((p) => p.page);

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
