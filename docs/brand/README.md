# House of Bread London — Brand Guidelines

**Brand idea: the loaf is the house.** Bread as shelter — warm, generous, handmade, quietly premium, rooted in North London since 2010.

Everything in this system is derived from the mark: a scored boule with a small arched doorway, set on a rounded tile. The three scoring cuts, the doorway and the tile are reused as the brand's graphic devices, so the identity stays coherent from the favicon to a bread bag.

Personality: **warm · generous · handmade · quietly premium · North London**. Never corporate, never cartoonish, never cold.

---

## 1. Logo

All files live in `frontend/public/`. They are pure vectors with the wordmark outlined to paths, so they render identically with no web fonts.

| File | Use |
| --- | --- |
| `logo.svg` | Primary horizontal lockup, light surfaces (Cream, Warm Dough, white, light photography) |
| `logo-dark.svg` | Horizontal lockup for dark surfaces (Deep Crust, Dark Crust, dark photography) — inverted Honey tile |
| `logo-stacked.svg` / `logo-stacked-dark.svg` | Stacked lockup for square formats: signage, splash screen, business card |
| `logo-mark.svg` | The tile mark alone: app icon, favicon (`src/app/icon.svg`), small spaces |
| `logo-mark-dark.svg` | Inverted tile for dark surfaces |
| `logo-mark-mono.svg` | Single-colour loaf, transparent background: stamps, embossing, one-ink print |
| `brand/wordmark.svg` / `brand/wordmark-dark.svg` | Wordmark without the tile, for when the mark already appears nearby |
| `brand/avatar.svg` | Circular version for social profiles |
| `brand/bakers-stamp.svg` / `brand/bakers-stamp-cream.svg` | Circular single-ink stamp for packaging |

**Colourways.** Light surfaces: Deep Crust tile, Honey loaf, Deep Crust wordmark, Crust "LONDON". Dark surfaces: Honey tile, Deep Crust loaf, Cream wordmark, Honey "LONDON". Never place the Deep Crust tile on a Deep Crust background.

**Clear space.** Keep a margin of **x = ¼ of the tile height** on all sides of any lockup; nothing else enters that zone.

**Minimum sizes.** Horizontal lockup 120 px / 30 mm wide. Stacked 64 px / 18 mm. Tile 16 px / 6 mm (below ~24 px the doorway disappears; that is expected).

**Don't:** stretch or rotate; add gradients, shadows, outlines or glows; recolour outside the palette; put the tile in a circle (use `brand/avatar.svg` instead); redraw the loaf; use the retired wheat badge.

---

## 2. Colour

| Name | Hex | RGB | Role |
| --- | --- | --- | --- |
| **Deep Crust** | `#3F2A18` | 63 42 24 | Headlines, body text, tile, footer, dark surfaces |
| **Honey Gold** | `#D9A441` | 217 164 65 | The loaf, highlights, ratings, focus ring, dark-surface labels |
| **Oven Cream** | `#FAF6EF` | 250 246 239 | Page background everywhere; text on dark surfaces |
| Crust Brown | `#8B5E34` | 139 94 52 | Primary buttons, links, "LONDON", eyebrow labels, icons |
| Dark Crust | `#5C3D24` | 92 61 36 | Button hover, prices, emphasis |
| Warm Dough | `#F4EAD8` | 244 234 216 | Section bands, chips, hover fills, pattern backgrounds |
| Kneaded Wheat | `#E8D5B7` | 232 213 183 | Borders, progress tracks, secondary surfaces |
| Berry | `#9B2D2D` | 155 45 45 | Sale tags, destructive actions, errors — sparingly |
| Fresh White | `#FFFFFF` | 255 255 255 | Cards, inputs, elevated panels |

**Proportions.** Roughly 60% Cream, 25% Deep Crust, 10% Honey, 5% Crust and Berry. One Honey accent per screen or page is usually enough.

**Contrast (WCAG).** Deep Crust on Cream 12.5:1 · Deep Crust on Warm Dough 11.3:1 · Dark Crust on Cream 9.1:1 · Honey on Deep Crust 6.0:1 · Crust on Cream 5.2:1 · White on Crust 5.6:1 · Berry on Cream 6.9:1 · White on Berry 7.5:1. All pass AA for normal text; Deep and Dark Crust on Cream pass AAA. Do not set Honey text on Cream or white (fails).

No cool greys, blues or black. "Dark" is always Deep Crust.

---

## 3. Typography

| Role | Face | Spec |
| --- | --- | --- |
| Display / H1 | **Fraunces** SemiBold 600 | 56 px, line-height 1.02, letter-spacing −0.015em |
| H2 | Fraunces SemiBold 600 | 40 / 1.1 |
| H3 | Fraunces SemiBold 600 | 24 / 1.2 |
| Accent / pull-quote | Fraunces Italic 400 | Used for the emphasised phrase inside a headline, in Crust or Honey |
| Body | **Plus Jakarta Sans** Regular 400 | 16 / 1.6 |
| Meta, captions | Plus Jakarta Sans Medium 500 | 14 / 1.5 |
| Buttons, nav | Plus Jakarta Sans SemiBold 600 | 14–16 |
| Prices | Plus Jakarta Sans Bold 700 | Dark Crust |
| Eyebrow label | Plus Jakarta Sans SemiBold 600 | 11 px, uppercase, 0.3em tracking, Crust |

Headlines are **sentence case**; the only capitals are tracked eyebrow labels and the "LONDON" line. A headline may carry one italic phrase ("Freshly baked *every day.*"). Never use script, comic or condensed display faces. Both families are open-source (SIL OFL) on Google Fonts; fallbacks are Georgia and the system sans stack.

---

## 4. Graphic devices

All four come from the mark. Use them deliberately — one device per composition is usually enough.

**The score** — three diagonal cuts. `brand/score-divider.svg` as a section divider in Honey; `brand/score-pattern.svg` (Crust at 14%) tiled on Warm Dough as a quiet texture, `brand/score-pattern-cream.svg` on Deep Crust; animated as a loading indicator in the app.

**The doorway** — the arch from the mark, as an image frame. `brand/doorway-mask.svg` works as a CSS mask (`mask: url(/brand/doorway-mask.svg) center/contain no-repeat`) for hero photography, product-card images, Instagram posts and badges. One arch per composition; the arch always sits on the baseline (flat side down).

**The tile** — the rounded square (corner radius 22% of width). Holds icons, avatars and category tiles. Default: Warm Dough tile with Crust icon; emphasis: Deep Crust tile with Honey icon.

**The baker's stamp** — circular, single ink, "HOUSE OF BREAD" above and "LONDON · EST. 2010" below the mono loaf. Deep Crust on kraft or cream; Cream on Deep Crust. For bags, boxes, tape, seals and wax.

---

## 5. Photography

Real bread, real light. Warm natural morning light, crust and crumb close-ups, hands at work, flour dust, kraft paper, linen, timber. Compositions are generous — one hero subject with breathing room — and often cropped into the doorway. Avoid cool colour casts, hard flash, stock-smiling people and any illustrated or cartoon bread.

---

## 6. Voice

Short, warm, plain. Specific over superlative: "24-hour ferment", "out of the oven at 7 am", "Crown Lane", not "artisanal excellence". Sentence case, no exclamation marks, no shouting. One gentle pun at most — the door is the joke.

Lines in use:

- Freshly baked every day. *(tagline)*
- Baked before London wakes.
- Come in — it's warm.
- Your tenth loaf is on the house. *(loyalty)*

Avoid: "artisanal solutions", "premium experience", "seamless", "platform", "leverage", emoji in brand copy.

---

## 7. Applications

**Packaging.** Kraft and cream stock only. One ink (the stamp or the mono loaf) on paper; the full-colour tile only where colour printing already exists (cup sleeves, stickers, boxes). Bags carry the stamp centred with a small tracked line of product information beneath.

**Print.** Business cards: Deep Crust front with the stacked dark lockup; Cream back with name in Fraunces, role as an eyebrow label, the tile top-right and the score divider bottom-right. Loyalty card: ten doorways, filled in Honey as loaves are bought.

**Signage.** Deep Crust fascia with the dark horizontal lockup and a tracked Honey line ("Est. 2010 · Crown Lane N19").

**Web app.** Cream canvas, white cards with 20 px radius, pill buttons in Crust (hover Dark Crust), Honey focus rings, product imagery masked into the doorway. Status badges: Pending yellow, Delivered green, Cancelled red, Low stock Honey. Admin screens use the same cream canvas — not a grey dashboard.

**Digital touchpoints shipped with the app.** Favicon `src/app/icon.svg`; Apple touch icon `src/app/apple-icon.png`; PWA manifest `src/app/manifest.ts` with `public/icons/icon-192.png`, `icon-512.png` and `icon-512-maskable.png`; social share image `public/og-image.jpg` (1200 × 630). Theme colour is Oven Cream in the browser UI and Deep Crust for the installed app.

**Social.** Avatar `brand/avatar.svg`. Feed rhythm: photograph in a doorway on Cream · Deep Crust quote tile with one italic Honey phrase · product photo with a Cream price pill · repeat.

---

## 8. Asset index

```
frontend/public/
  logo.svg · logo-dark.svg · logo-stacked.svg · logo-stacked-dark.svg
  logo-mark.svg · logo-mark-dark.svg · logo-mark-mono.svg
  og-image.jpg
  icons/icon-192.png · icons/icon-512.png · icons/icon-512-maskable.png
  brand/wordmark.svg · brand/wordmark-dark.svg · brand/avatar.svg
  brand/bakers-stamp.svg · brand/bakers-stamp-cream.svg
  brand/score-divider.svg · brand/score-pattern.svg · brand/score-pattern-cream.svg
  brand/doorway-mask.svg · brand/icon-square.svg (full-bleed source for OS-masked icons)
frontend/src/app/
  icon.svg · apple-icon.png · manifest.ts
```
