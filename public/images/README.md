# Photos go here

Drop photographs the bakery owns (or has permission to use) into these folders:

- `products/` — one photo per sweet or box
- `gallery/` — the Instagram-style grid
- `story/` — the scrapbook photos for "Our Story"
- `hero.jpg` (in this folder) — the big photo at the top of the page

Then point to them from the data files, using a path **relative to `public/`**:

```js
// src/data/products.js
image: 'images/products/brownie.jpg',
imageAlt: 'A tray of fudgy brownies cooling on parchment paper',
```

Tips for fast loading: export JPEGs or WebP at roughly 1200 px on the long edge
and keep each file under about 250 KB.
