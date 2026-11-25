# The Sweets Exchange

An animated, editorial-style bakery website for **The Sweets Exchange**
([@the_sweets_exchange](https://www.instagram.com/the_sweets_exchange/)).

Built with **React**, **Vite**, **Tailwind CSS**, **Motion (Framer Motion)** and **Lucide icons**.
Deploys to **GitHub Pages** with a ready-made GitHub Actions workflow.

> **Important:** this site ships with clearly labelled placeholders for photos,
> products, prices and ordering details, because none of that has been verified.
> See [`MISSING_INFO.md`](./MISSING_INFO.md) for the checklist.

## Quick start

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

After your first `npm install`, commit the generated `package-lock.json`.

## Where to edit things

| What | File |
| --- | --- |
| Products, gift boxes, prices, availability | `src/data/products.js` |
| Brand details, contact email, pickup/delivery info, story, gallery, hero photo | `src/data/site.js` |
| Colours and fonts | `tailwind.config.js` and `index.html` (Google Fonts link) |
| Photos | `public/images/` (see the README in that folder) |
| Page sections | `src/components/` |

Anything left as `null` in the data files is treated as "not verified yet":
prices and availability are hidden, and friendly fallbacks are shown.

### Swapping in real photos

1. Copy your image into `public/images/…`
2. Reference it from the data file with a path relative to `public/`, for example
   `image: 'images/products/brownie.jpg'`
3. Write a helpful `imageAlt` description for screen readers.

Only use photos the bakery owns or has permission to use. The gallery uses locally
stored photos on purpose — it does not depend on any Instagram scraping service.

### Removing the placeholder labels

Set `showPlaceholderFlags: false` in `src/data/site.js` once your content is in.

### Turning off the gift-box section

Set `features.boxes: false` in `src/data/site.js`.

## How ordering works

There is no payment system or backend, so the order section is an **inquiry flow**
rather than a simulated checkout. Visitors pick items and quantities (or describe a
a note), add their name and details, and then:

- **Send on Instagram** — copies the message and opens a DM to the account
- **Send by email** — appears once you set `contact.email` in `src/data/site.js`
- **Copy message** — copies it so they can paste it anywhere

## Deploying to GitHub Pages

1. Put this project in your GitHub repository and push it to the `main` branch.
2. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push.
4. Your site appears at `https://<your-username>.github.io/<repository-name>/`
   (or `https://<your-username>.github.io/` if the repository is named `<your-username>.github.io`).

The base path is worked out from the repository name during the build, so you don't
need to edit `vite.config.js`. Locally the site uses relative paths and works anywhere.

### Other hosts

The built `dist/` folder is a plain static site. For Netlify, Cloudflare Pages or Vercel use
build command `npm run build` and output directory `dist`. No base-path setting is needed.

### Custom domain

Add the domain under **Settings → Pages**, then add a `public/CNAME` file containing the
domain name so it survives each deploy.

## Adding this to a repository that already has files

Copy the project files in without overwriting anything unrelated. If your repository
already has a `README.md`, `index.html` or `.gitignore`, merge by hand rather than replacing them.

## Accessibility and performance notes

- Uses a custom **bread-tongs cursor** (`src/assets/cursor.png`, set in `src/index.css`; ignored on touch screens)
- Honours the visitor's **reduced-motion** setting: movement is removed, continuous
  animations stop, and the entrance animation is skipped.
- Keyboard accessible, with a skip link, visible focus styles and labelled controls.
- Images are lazy-loaded; the hero photo loads eagerly. Decorative illustrations are inline SVG.
- SEO basics are in `index.html` (title, description, Open Graph tags, `Bakery` structured data).

## Project structure

```
├── index.html
├── public/                 favicon, robots.txt, images/
├── src/
│   ├── App.jsx             page composition + shared order state
│   ├── index.css           Tailwind layers, paper texture, reduced-motion rules
│   ├── data/               site.js and products.js (edit these)
│   ├── lib/                small helpers (asset paths, price format, order message)
│   └── components/         Nav, Hero, FreshlyBaked, LittleBox, OurStory,
│                           InstagramGallery, Order, Footer, Doodles, …
└── .github/workflows/deploy.yml
```

## Cookie pages

Each cookie has its own shareable page, using hash URLs so they work on GitHub Pages:
`#/cookies/smores`, `strawberry-matcha`, `espresso-brownie`, `chocolate-chip`, `earl-grey`, `ube-matcha`, `red-velvet`.
Content lives in `src/data/products.js` (the `page` field). Photos are in `public/images/cookies/`, the plaid cloth is `public/images/plaid.jpg`.
