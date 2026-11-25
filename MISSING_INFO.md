# Information still needed from the bakery

Prices, flavors and photos now come from the bakery's menu, Instagram posts and the
`the-sweets-exchange-bakery-goods` folder. What's left is below. Set
`showPlaceholderFlags: false` in `src/data/site.js` once everything is filled in.

## Already filled in
- [x] 7 cookie flavors, each a **box of 3 same-flavor cookies for $12**: S'mores, Chocolate Chip, Earl Grey, Ube Matcha Latte, Strawberry Matcha, Strawberry Shortcake, Chocolate Strawberry (all marked "Available")
- [x] **Assorted Cookie Box**: 5-6 cookies, each a different flavor, **$16**
- [x] **Cinnamon Roll Box**: 3 cinnamon rolls, **$12**
- [x] Ordering is menu-only (no custom orders)
- [x] Photos for the hero, S'mores, Chocolate Chip, Earl Grey, Ube Matcha Latte, Strawberry Matcha, both boxes, Our Story and the gallery

## Photos still needed
- [ ] Strawberry Shortcake and Chocolate Strawberry cookies (still show a labelled placeholder) -> `image` in `src/data/products.js`
- [ ] A photo of the actual assorted cookie box and the actual cinnamon roll box (the current ones are photos from your folder and Instagram)

## Please confirm
- [ ] **Flavor descriptions**: Earl Grey ("bergamot", "floral"), Ube Matcha Latte ("rich ube", "earthy matcha") and Strawberry Matcha ("jammy", "earthy matcha") use the words from your Instagram posts; the other descriptions are generic placeholders -> `src/data/products.js`
- [ ] The Strawberry Matcha description mentions white chocolate drizzle and freeze-dried strawberry, which is what the photo shows. Edit it if the recipe differs.
- [ ] Which flavors go into an assorted box, and whether customers can choose them (the order form's notes field is where they can say which flavors they'd like)

## Ordering
- [ ] Pickup details -> `SITE.fulfilment.pickup`
- [ ] Delivery details (or confirmation there is none) -> `SITE.fulfilment.delivery`
- [ ] Lead time / how much notice is needed -> `SITE.fulfilment.leadTime`
- [ ] Email address for inquiries (optional; enables the "Send by email" button) -> `SITE.contact.email`
- [ ] Confirm the Instagram DM link works for the account: https://ig.me/m/the_sweets_exchange
- [ ] Payment method / policies: **not shown anywhere on the site**. The order form is an inquiry flow only; the "Estimated total" is just a convenience and is confirmed by the bakery.

## Our Story
- [ ] Real story: who is in the kitchen, how it started, what makes the bakery special -> `SITE.story.paragraphs`

## After the site is live
- [ ] Add your real site address as a canonical URL and `og:url` in `index.html`
- [ ] Optionally add a social-share image (`og:image`) in `index.html`
- [ ] Consider adding address / hours to the `Bakery` structured data in `index.html` once verified
