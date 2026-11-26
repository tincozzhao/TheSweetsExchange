// ─────────────────────────────────────────────────────────────────────────────
// SITE SETTINGS — the one place for brand details, contact info and page copy.
//
// Anything set to `null` is information that has NOT been verified yet. The site
// handles every `null` gracefully (it hides prices, shows friendly fallbacks,
// and so on) so nothing is invented. See MISSING_INFO.md for the full checklist.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  name: 'The Sweets Exchange',
  tagline: 'Life is sweeter when shared.',
  subtitle: 'Homemade happiness, baked with love and made to share.',

  // While true, empty photo slots and unfilled details are labelled so you can
  // spot them. Set to false once your real content is in, for a cleaner look.
  showPlaceholderFlags: true,

  // Turn a whole section off if the bakery doesn't offer it.
  features: {
    boxes: true, // "A Little Box of Happiness" (set false if there are no gift/assorted boxes)
  },

  // Currency used when a price is set in products.js.
  currency: 'USD',
  locale: 'en-US',

  instagram: {
    handle: 'the_sweets_exchange',
    url: 'https://www.instagram.com/the_sweets_exchange/',
    // Opens a direct-message thread with the account.
    dm: 'https://ig.me/m/the_sweets_exchange',
  },

  // TODO(owner): add an email address to switch on the "Send by email" button
  // in the order form. Leave as null to hide it.
  contact: {
    email: null,
  },

  // TODO(owner): fill these in with real, confirmed details. Plain sentences.
  // Example: pickup: 'Pickup by appointment — message us to arrange a time.'
  fulfilment: {
    pickup: null,
    delivery: null,
    leadTime: null,
  },

  // Hero photo. Put a file in public/images/ and reference it like 'images/hero.jpg'.
  hero: {
    image: 'images/hero.jpg',
    imageAlt: 'Hands holding up a gooey s’mores cookie in warm evening sunlight',
  },

  // Our Story. Only verified information belongs here.
  story: {
    paragraphs: [
      {
        text: 'The Sweets Exchange is built on one simple idea: life is sweeter when it is shared. Homemade happiness, baked with love and made to pass across the table.',
      },
      {
        placeholder: true,
        text: 'TODO(owner): tell your real story here — who is in the kitchen, how it started, what you love about baking for the people around you. Edit story.paragraphs in src/data/site.js.',
      },
    ],
    signoff: 'with love, The Sweets Exchange ♡',
    // Three scrapbook photos. Example: { src: 'images/story/kitchen.jpg', alt: 'Trays of cookies cooling', caption: 'Sunday batch' }
    photos: [
      { src: 'images/story/tray.jpg', alt: 'S’mores cookies cooling on a wire rack over a baking tray', caption: 'fresh out of the oven' },
      { src: 'images/story/cooling-rack.jpg', alt: 'Cookies with melted marshmallow on a cooling rack' },
      { src: 'images/story/close-up.jpg', alt: 'Close-up of chocolate chip cookies with flaky salt', caption: 'a little flaky salt' },
    ],
  },
};

export const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'menu', label: 'Menu', href: '#menu' },
  { id: 'story', label: 'Our Story', href: '#story' },
  { id: 'order', label: 'Order', href: '#order' },
  { id: 'instagram', label: 'Instagram', href: SITE.instagram.url, external: true },
];

// Instagram-style gallery: seven tiles. Use photos you own or have permission to
// use, stored locally, e.g. { src: 'images/gallery/01.jpg', alt: 'Describe it', caption: 'Short caption' }.
// No scraping services or embeds are used.
export const GALLERY = [
  { src: 'images/gallery/smores-pull.jpg', alt: 'Pulling apart a s’mores cookie with stretchy marshmallow', caption: 'the s’mores pull' },
  { src: 'images/products/strawberry-matcha.jpg', alt: 'Strawberry matcha cookies with white chocolate drizzle', caption: 'strawberry matcha' },
  { src: 'images/gallery/cinnamon-rolls-1.jpg', alt: 'A pan of frosted cinnamon rolls', caption: 'cinnamon roll Sunday' },
  { src: 'images/products/ube-matcha-latte.jpg', alt: 'Marbled purple ube and green matcha cookies', caption: 'ube matcha latte' },
  { src: 'images/products/chocolate-chip.jpg', alt: 'Chocolate chip cookies in a white box', caption: 'chocolate chip' },
  { src: 'images/products/earl-grey.jpg', alt: 'An Earl Grey cookie with sugar crystals', caption: 'earl grey' },
  { src: 'images/gallery/smores-close-up.jpg', alt: 'Close-up of s’mores cookies with toasted marshmallow', caption: 'toasted marshmallow' },
];
