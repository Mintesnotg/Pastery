# Design System: House of Bread London

Paste this entire file into Stitch as **Prompt 0** before any screen. It is the source of truth for mood, colour, type, and components.

---

House of Bread London is a family-run artisan bakery on Crown Lane in North London, baking since 2010. The product is a premium bakery website and staff admin: warm, edible, and trustworthy — never corporate, never cartoonish.

Create a cohesive web design system for this brand. Do not generate a full page yet. Output only the visual language: colour tokens, type pairing, component shapes, spacing, and a small component sheet (logo lockup, primary button, secondary button, input, card, badge, nav link).

## 1. Visual Theme & Atmosphere

Warm pastry-shop luxury. Flour-dusted cream backgrounds, honeyed gold accents, crust-brown actions, generous white space, and photography of real bread, croissants, and celebration cakes. The feeling is “Sunday morning in a North London bakery”: slow, generous, handmade, quietly premium.

Density is airy on customer pages and slightly denser on admin tables, but both share the same rounded geometry and earthy palette. Motion is soft: fade-in on scroll, gentle lift on hover, no bounce, no neon.

## 2. Color Palette & Roles

- Oven Cream `#FAF6EF` — page background for all customer screens.
- Warm Dough `#F4EAD8` — section bands, hover fills, chip backgrounds.
- Kneaded Wheat `#E8D5B7` — secondary surfaces, progress tracks, dashed “add new” cards.
- Crust Brown `#8B5E34` — primary actions, active nav, key icons.
- Dark Crust `#5C3D24` — primary hover, price text, emphasis.
- Deep Crust `#3F2A18` — headlines, body text, footer background.
- Honey Gold `#D9A441` — ratings, highlights, secondary emphasis, scrollbar.
- Berry `#9B2D2D` — sale tags, destructive actions, cancelled status.
- Fresh White `#FFFFFF` — cards, inputs, elevated panels.
- Status Yellow `#E8B84A` — pending / low stock.
- Status Green `#2F7D4A` — delivered / in stock / valid.
- Status Red `#B42318` — cancelled / out of stock / error.
- Cream on Dark `#FAF6EF` at 70% opacity — footer body text.

Do not introduce cool greys, electric blue, or black. Admin screens use the same cream canvas, not a generic SaaS grey dashboard.

## 3. Typography Rules

- Display / headings: elegant serif (Playfair Display or Georgia). Tight leading on hero headlines. Letter-spacing slightly open on small uppercase eyebrow labels (`0.3em`).
- UI / body: clean humanist sans-serif (Plus Jakarta Sans or Inter). Regular 16px body, medium 14px meta, semibold 14–16px buttons and nav.
- Prices: sans-serif, bold, Dark Crust.
- Never use comic, script, or condensed display fonts.

## 4. Component Stylings

- **Logo:** circular wheat-mark in a Honey-to-Crust gradient, wordmark “House of Bread” in serif, tiny uppercase “London” tracking underneath.
- **Primary button:** pill-shaped, Crust Brown fill, white label, soft shadow. Hover darkens to Dark Crust. Used for Order Now, Add to Cart, Pay, Save.
- **Secondary button:** pill outline in Crust Brown on cream. Hover fills Crust Brown with white text.
- **Tertiary / export:** smaller rounded rectangle, dough fill, crust outline. Used for CSV/PDF export.
- **Cards:** generously rounded corners (~20px), white surface, whisper-soft shadow, 1px crust at 10% opacity. Hover: lift 4px and slightly stronger shadow. Product images zoom ~5% inside a clipped rounded frame.
- **Inputs:** white fill, 12px corner radius, 1px crust/20% border. Focus ring in Honey Gold. Valid: green check inside the field. Invalid: berry border + helper text.
- **Pills / chips:** fully rounded, used for flavour, size, category, and date-range filters. Selected chip is Crust Brown with white text.
- **Status badges:** pill, uppercase 11px tracking. Pending = yellow, Delivered/In stock = green, Cancelled/Out of stock = red, Low stock = honey.
- **Header:** sticky, cream at 90% with blur. Logo left. Text links: Home, Bread & Pastries, Cakes & Desserts, Gallery, About Us, Contact Us. Right cluster: Account text link + pill “Order Online” with basket icon.
- **Footer:** Deep Crust background, four columns, Honey Gold column titles.

## 5. Layout Principles

- Max content width 1280px, horizontal padding 32px desktop / 16px mobile.
- Section vertical rhythm 64–96px.
- 4 / 8 / 12 / 16 / 24 / 32 spacing scale.
- Customer grids: 4 product cards on desktop, 2 on tablet, 1 on mobile.
- Admin: left sidebar 260px on desktop; collapses to a top bar + drawer on mobile.
- Always leave generous breathing room around photography. Do not pack cards edge to edge.

## Brand facts (use this copy, do not invent replacements)

- Brand: House of Bread London
- Tagline: Freshly Baked Every Day
- Address: 24 Crown Lane, London N19 4NP
- Phone: +44 20 7946 0958
- Email: hello@houseofbreadlondon.co.uk
- Hours: Monday–Friday 7:00 AM–6:00 PM · Saturday 8:00 AM–6:00 PM · Sunday 8:00 AM–3:00 PM
- Story: Slow-fermented sourdough, flaky pastries and celebration cakes, crafted with love since 2010.
- Categories: Cakes, Breads, Pastries (also Cookies & Treats, Coffee & Drinks where a listing needs them)
- Currency: GBP (£)

## Imagery

Photoreal bakery photography only: sourdough loaves, laminated croissants, cream cakes, flour-dusted benches, warm interior light. No illustrations of smiling cartoon bread unless a confirmation/confetti moment specifically asks for a celebratory illustration.
