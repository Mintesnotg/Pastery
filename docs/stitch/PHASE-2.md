# Phase 2 — Ordering, Admin CMS, Inventory

Generate Phase 1 first so Stitch already has the House of Bread design system. Then paste each block below as its own screen. Customer commerce screens keep the storefront header and footer. Prompts 17–22 use the Website CMS shell. Prompts 23–24 use a separate Kitchen shell.

After all Phase 2 screens exist, run the Consistency Pass at the bottom.

---

## 3. Order Management

### Prompt 8 — Product listing

```
Design a high-fidelity desktop product listing page (1440px) for House of Bread London. Follow the existing design system. Include the sticky storefront header (Bread & Pastries is active) and the four-column footer.

PAGE TITLE: “Bread & Pastries”
SUBTITLE: “Baked in small batches from dawn.”

TOOLBAR (full width above the grid):
- Left: result count “24 bakes”
- Right: grid/list toggle (grid selected), sort dropdown currently “Featured”

LAYOUT: 280px filter sidebar + product grid.

FILTER SIDEBAR:
- Category checkboxes: Cakes, Breads, Pastries (Breads and Pastries checked)
- Price range slider £0–£40, current range £2–£28
- Dietary tags as pills: Vegetarian, Vegan, Nut-free, Gluten-free, Contains nuts
- “Clear all” text link

GRID MODE (primary view): 3-column product cards with photo, category, name, price, dietary micro-pills, “Add” icon button. Hover: lift + photo zoom.

Show a small inset or second state for LIST MODE: each row is thumbnail + name + description + price + add, still using the same sidebar.

Do not open a product detail overlay on this screen.
```

---

### Prompt 9 — Product detail

```
Design a high-fidelity desktop product detail page for House of Bread London. Follow the existing design system. Storefront header + footer.

PRODUCT: “Signature Victoria Sponge” · Cakes · £28.00

LAYOUT: two columns.

LEFT — Image gallery
- Large square hero photo of the cake
- Four thumbnails under it; second thumbnail selected
- Hover on the hero: magnifier / zoom affordance (cursor-zoom hint + a 2× inset in the top-right of the image)

RIGHT — Buy panel
- Serif name, star rating 4.9 (128 reviews), price
- Flavour selector as pill buttons: Vanilla (selected), Lemon, Chocolate, Raspberry
- Size selector as pill buttons: 6" · 8" (selected) · 10"
- Quantity stepper (−  1  +)
- Text area “Special message on cake” with placeholder “Happy Birthday Amira”, 40 character counter
- Primary pill “Add to basket” and a heart wishlist button
- Short description, allergen line “Contains gluten, egg, milk”, 48-hour notice note for whole cakes

MOBILE TREATMENT ON THE SAME ARTBOARD (390px column beside the desktop):
- Gallery on top
- Sticky bottom bar: price + quantity stepper + “Add to basket”, always visible above the home indicator
```

---

### Prompt 10 — Cart drawer

```
Design a high-fidelity desktop cart drawer for House of Bread London overlaying a dimmed listing page. Follow the existing design system.

RIGHT DRAWER (420px wide, white, rounded on the left edge, full height):

HEADER: “Your basket” · 3 items · close X

LINE ITEMS (scrollable):
1. Butter Croissant thumbnail · £2.90 · qty stepper 2 · line £5.80 · trash icon
2. Classic Sourdough thumbnail · £4.50 · qty stepper 1 · line £4.50 · trash icon
3. Signature Victoria Sponge thumbnail · Vanilla · 8" · message “Happy Birthday Amira” in small italic · £28.00 · qty 1 · trash icon

FOOTER (pinned):
- Promo code input + “Apply” secondary button. Empty state, placeholder “Gift or bakery code”
- Breakdown: Subtotal £38.30 · Delivery £3.50 · Promo −£0.00 · Total £41.80
- Primary pill “Checkout”
- Text link “Continue shopping”

Empty-cart ghost (tiny secondary frame on the artboard): illustration of an empty bread basket, “Your basket is waiting”, button “Browse the bakes”.
```

---

### Prompt 11 — Checkout · Delivery

```
Design a high-fidelity desktop checkout screen, STEP 1 of 3, for House of Bread London. Follow the existing design system.

TOP: centred logo, then a 3-step progress bar: Delivery (active) → Payment → Review.

TWO COLUMNS: form 60% / order summary 40%.

DELIVERY COLUMN:
- Segmented control: Delivery (selected) | Collection
- Saved address cards, Home selected, “Deliver to a different address” text link
- Date / time slot picker as a real calendar widget for September 2026
  - Past dates greyed out
  - Fully booked dates (15, 16 Sep) greyed with a small “Full” label
  - Available dates in crust brown
  - 14 Sep selected
- Time slots as pills under the calendar: 09:00–11:00 (unavailable, greyed), 11:00–13:00 (selected), 13:00–15:00, 15:00–17:00 (unavailable)
- Helper: “Same-day delivery closes at 2 PM.”
- Primary pill “Continue to payment”

SUMMARY COLUMN:
- Line items with thumbnails, promo field, totals matching the cart (£41.80)
- Trust line “Baked to order · Keep chilled”

No footer mega-nav. A slim “Secure checkout · House of Bread London” bar is enough.
```

---

### Prompt 12 — Checkout · Payment

```
Design a high-fidelity desktop checkout screen, STEP 2 of 3, for House of Bread London. Same chrome as the Delivery step. Progress: Delivery completed, Payment active, Review upcoming.

LEFT — Payment
- Heading “Pay securely”
- Saved cards as selectable cards:
  - Visa •••• 4242  (selected, crust border, “Default”)
  - Mastercard •••• 8811
- “Add a new card” dashed card
- New-card form (visible because Add is also shown as an expanded panel):
  - Card number input with real-time grouping already showing “4242 4242 4242 4242” and a Visa mark
  - Expiry MM/YY, CVC, Name on card
- Billing address “Same as delivery” checkbox, checked
- Primary pill “Continue to review”
- Directly beside / under the button: trust badges in a quiet row — Visa, Mastercard, Amex, Apple Pay, lock icon “256-bit SSL”

RIGHT — same order summary as step 1.

Do not show a fake 3-D Secure modal on this screen.
```

---

### Prompt 13 — Checkout · Review

```
Design a high-fidelity desktop checkout screen, STEP 3 of 3, for House of Bread London. Progress: Delivery and Payment completed, Review active.

LEFT — Review list
- Delivery: Home address, Sun 14 Sep, 11:00–13:00, “Change” links
- Payment: Visa •••• 4242, “Change” link
- Items editable in summary only (quantities locked, “Edit basket” text link)

RIGHT — totals, gift-note field optional

BOTTOM OF LEFT COLUMN: Primary pill “Place order · £41.80” with the same trust badges as the payment step.

Quiet legal line: “You will receive an email as soon as the bakers start your order.”
```

---

### Prompt 14 — Order confirmation

```
Design a high-fidelity desktop order confirmation page for House of Bread London. Follow the existing design system. No cart, no checkout stepper.

HERO:
- Soft celebratory illustration (confetti in honey and cream, a loaf with a small flag). Not childish clip-art.
- Serif heading “The bakers have your order”
- Body “Order #HB-1048 is confirmed. We’ll email you when it moves to the oven.”
- Primary pill “Track order” and secondary “Back to the bakery”

SUMMARY CARD:
- Delivery window Sun 14 Sep, 11:00–13:00
- Address 14 Crouch Hill, London N4 4AU
- Item list with thumbnails and the cake message
- Total £41.80
- Payment Visa •••• 4242

A single tracking-link row: “Share this link with whoever is home” plus a copy-able URL field.
```

---

### Prompt 15 — Order tracking

```
Design a high-fidelity desktop order tracking page for House of Bread London. Storefront header + footer. Follow the existing design system.

HEADING: “Order #HB-1048”
SUBHEAD: “Estimated arrival 12:20–12:40”

VERTICAL STEPPER (primary) with bakery icons and timestamps:
1. Received — 09:12 — check, completed
2. Baking — 10:05 — oven icon, completed
3. Ready — 11:40 — box icon, current (honey highlight, pulsing dot)
4. Out for Delivery — courier icon, upcoming
5. Delivered — house icon, upcoming

A thin horizontal stepper duplicate under the heading for desktop, plus the vertical detail list so both patterns are designed.

MAP CARD on the right: stylised North London map with a small van marker, not a raw Google embed screenshot.

Help row: “Need to change something? Call +44 20 7946 0958 before it leaves the bakery.”
```

---

### Prompt 16 — Custom / bulk order form

```
Design a high-fidelity desktop custom/bulk order form for House of Bread London. Storefront header + footer. Follow the existing design system.

PAGE TITLE: “Celebration & bulk orders”
SUBTITLE: “Cakes, office platters, and wedding towers. We need 48 hours for most orders, a week for wedding cakes.”

MULTI-STEP LAYOUT with a left vertical stepper:
1. Occasion (active)
2. Bake details
3. Reference photos
4. Contact & submit

STEP 1 CANVAS (Occasion):
- Occasion cards: Birthday, Wedding, Office, Other
- Date needed (date picker)
- Guest count stepper
- Budget range dropdown
- Primary “Continue”

Also show STEPS 2–4 as stacked preview panels below (slightly de-emphasised) so the whole form is specified:
- Step 2: cake flavour, dietary needs, serving size, special message, notes textarea
- Step 3: drag-and-drop image upload zone “Drop reference photos or menus here”, plus two uploaded thumbnails with remove X
- Step 4: name, email, phone, preferred contact, primary “Send enquiry”

Keep the layout clean and step-by-step, not one endless scrolling questionnaire.
```

---

## 4. Content Management — Admin UI (website only)

This block is a **website CMS**. It controls what customers see on houseofbreadlondon.co.uk: seasonal homepage modules, cakes, breads, banners, pages, recipes, and reviews.

Do **not** put orders, revenue, kitchen queues, stock alerts, delivery, or staff-user admin on these screens. Inventory/sales live in section 5 with a separate kitchen shell.

Generate Prompt 17 first. Prompts 18–22 reuse this Website CMS shell.

### Prompt 17 — Website content dashboard

```
Design a high-fidelity desktop Website Content Management dashboard (1440px) for House of Bread London. This screen is a CMS for the public website only. It is not an orders desk, not a kitchen board, and not a sales or inventory dashboard. Follow the bakery design system — cream canvas, not a generic grey SaaS theme.

PAGE GOAL: Show what the live website is rendering right now, which season is driving that content, and give staff a fast way to post a new cake or a new bread.

WEBSITE CMS SHELL (reuse on Prompts 18–22 only):
- Left sidebar 260px, Deep Crust background, cream type, wheat-mark logo “House of Bread · Website CMS”
- Nav is content-only. No Orders, Inventory, Sales, Users, or kitchen items:
  Dashboard (selected)
  Seasonal content
  Products
  Homepage & banners
  Pages
  Recipes / Journal
  Reviews
- Sidebar footer: avatar “Maya Chen · Content editor”, sign out
- Top bar: page title “Website content”, date “Monday 14 Sep 2026”, search placeholder “Search pages, products, seasons”, ghost button “View live site”

MAIN CANVAS:
- Eyebrow “Content of the website”
- Serif heading “What’s live on the site”
- Subtitle “The storefront renders from the active season. Switch the season and the hero, featured bakes, stories, and gallery highlights swap automatically.”

LIVE SEASON BANNER (full width, white card):
- Left: Autumn leaf / harvest photography thumbnail
- Title “Autumn Harvest is live”
- Dates “1 Sep – 30 Nov 2026”
- Green pill “Rendering on storefront”
- Two actions: outline “Change season”, primary “Preview homepage”
- Tiny helper: “Christmas is scheduled to take over on 1 Dec 2026.”

KPI ROW (4 content cards, not commerce):
1. Published on the website — 42 — cakes, breads, pastries
2. Drafts not yet live — 4
3. Seasonal modules live — 6 — hero, featured, tiles, gallery
4. Next season — Christmas · 1 Dec — honey accent

TWO COLUMNS BELOW:

LEFT — “Storefront now showing”
- Miniature homepage preview of the live site: hero (“Harvest loaves are in”), featured product row (Country Rye, Pumpkin loaf, Blackberry cake), category tiles Cakes / Breads / Pastries, gallery strip
- Each block has a small caption “From: Autumn Harvest”
- This is a content preview, not an analytics chart

RIGHT — “Post to the website”
- Two large dashed-outline cards, equal height:
  1. Cake photo, heading “Post a new cake”, line “Publish a celebration cake to Cakes & Desserts”, primary pill “New cake”
  2. Bread photo, heading “Post a new bread”, line “Publish a loaf to Bread & Pastries”, primary pill “New bread”
- Smaller text link under them: “Or post a pastry”
- Then a compact “Scheduled website content” list (not orders):
  - Christmas hero + mince pies · 1 Dec 2026 · Scheduled
  - Easter hot-cross buns · 15 Mar 2027 · Draft
  - Summer picnic tarts · 1 Jun 2027 · Draft

Do not show: orders today, revenue, low stock, out of stock, bake queues, customer tickets, or staff permissions. If a module is not website copy, photography, season, page, or product content, leave it off this screen.
```

---

### Prompt 18 — Website product catalogue (cakes, breads, pastries)

```
Design a high-fidelity desktop Website Product Catalogue inside the House of Bread Website CMS shell (Products selected). Follow the existing design system. This table is how staff publish bakes onto the public website. It is not a stock room.

PAGE TITLE: “Products on the website”
SUBTITLE: “Post cakes, breads, and pastries. Only Published items render on the storefront. Seasonal items appear automatically when that season is live.”

TOOLBAR:
- Search “Search cakes, breads, pastries”
- Category filter chips: All · Cakes · Breads · Pastries (All selected)
- Season filter: All seasons · Everyday · Spring · Summer · Autumn · Christmas
- Primary split button “Post to website” with menu: New cake / New bread / New pastry

TABLE (sortable headers):
- Thumbnail (website image)
- Product name (one row inline-editing with a green check)
- Category pill: Cake / Bread / Pastry
- Price £
- Seasons (small chips, e.g. Everyday, Autumn)
- “On website” toggle (on = visible to customers, off = hidden/draft). One row off, label “Hidden from site”
- “Featured when season is live” star toggle
- Row actions: edit, duplicate, delete

Example rows:
- Signature Victoria Sponge · Cake · £28.00 · Everyday · On
- Classic Sourdough · Bread · £4.50 · Everyday · On · Featured
- Country Rye · Bread · £4.80 · Autumn · On
- Blackberry Harvest Cake · Cake · £32.00 · Autumn · On · Featured
- Almond Croissant · Pastry · £3.80 · Everyday · On
- Mince Pie · Pastry · £3.20 · Christmas · Off · “Scheduled for 1 Dec”
- Berry Pavlova · Cake · £6.20 · Summer · Off · Hidden from site
- Pumpkin Seed Loaf · Bread · £5.00 · Autumn · On

Footer: pagination 1–8 of 42. Empty-category hint: “No breads match this filter — post a new bread.”

Do not show stock counts, bake times, or kitchen alerts.
```

---

### Prompt 19 — Post / edit a cake or bread

```
Design a high-fidelity desktop “Post to website” form inside the Website CMS shell. Follow the existing design system.

HEADING: “Post a new cake” with a category switcher at the top: Cake (selected) · Bread · Pastry
Tertiary “Save draft” + primary “Publish to website”

This form creates storefront content. When published, the item appears on the matching customer page (Cakes & Desserts, or Bread & Pastries) and, if seasonal, on the homepage for that season only.

TWO COLUMNS:

LEFT (wider):
- Drag-and-drop website photography well: “Drop cake photos” (copy swaps to “Drop bread photos” if Bread is selected). Four slots, first marked “Cover”, reorder handles
- Product name field, placeholder “e.g. Blackberry Harvest Cake” or “e.g. Pumpkin Seed Loaf”
- Rich-text website description editor (bold, italic, lists, link) with a short customer-facing blurb already entered
- Allergens checkboxes
- Dietary tags: Vegetarian, Vegan, Nut-free, Contains gluten

RIGHT — Website settings:
- Category: Cake / Bread / Pastry (Cake selected)
- Price £
- “Publish to website” toggle, currently on
- “Featured bake” checkbox: “Show in Featured carousel when its season is live”
- Season assignment (multi-select chips, required at least one):
  Everyday · Spring · Summer · Autumn (selected) · Winter · Christmas · Easter
  Helper: “The website dynamically renders this product only while one of these seasons is the live season. Everyday products always show.”
- Cake-only block (visible because Cake is selected): size/variant builder 6" £22, 8" £28, 10" £36, flavour chips Vanilla / Lemon / Chocolate, “Special message on cake” enabled checkbox
- Bread-only block (show as a collapsed/disabled preview so Stitch designs both): loaf weight 800g / 1kg, “sliced” option
- Storefront URL preview: /cakes-desserts/blackberry-harvest-cake

Sticky bottom bar: “Customers will see this on the Autumn website until 30 Nov.” + Publish to website

Do not include SKU warehouses, supplier fields, or stock thresholds.
```

---

### Prompt 20 — Seasonal content (dynamic website render)

```
Design a high-fidelity desktop Seasonal Content Manager inside the Website CMS shell (Seasonal content selected). Follow the existing design system.

PAGE GOAL: Staff pick which season is live. The public website dynamically re-renders hero, featured products, category stories, and gallery from that season’s content pack. No orders or inventory on this screen.

PAGE TITLE: “Seasonal website content”
SUBTITLE: “One season is live at a time. Switching it swaps what customers see on Home, product highlights, and gallery — without rebuilding the pages.”

TOP: segmented control of seasons as large selectable cards in a row:
- Everyday (always-on base layer)
- Spring
- Summer
- Autumn Harvest (selected, green “LIVE — rendering now”)
- Christmas (honey “Scheduled 1 Dec”)
- Easter
Each card: mood photo, date range, status pill (Live / Scheduled / Draft), product count “8 bakes attached”

MAIN SPLIT:
LEFT 55% — “Autumn Harvest content pack” editor
- Date range 1 Sep 2026 – 30 Nov 2026
- Primary toggle “Set as live season” (on)
- Homepage hero: image thumb, headline field “Harvest loaves are in”, supporting line, CTA “Order Now”
- Featured on homepage: 4 product picker chips (Country Rye, Pumpkin Seed Loaf, Blackberry Harvest Cake, Almond Croissant) with add/remove
- Category stories: Cakes / Breads / Pastries — each has a seasonal photo + one-line story
- Gallery highlight set: 6 image thumbs
- Homepage about blurb seasonal override
- “Attach more products” search that only lists published cakes, breads, pastries tagged Autumn

RIGHT 45% — “Live preview · what the website renders”
- Phone + desktop frames of the public homepage using THIS season’s pack
- Label “Dynamic render · Autumn Harvest”
- Caption under the preview: “If you switch live season to Christmas, this preview and the real site both swap to the Christmas pack.”

BOTTOM TIMELINE: Everyday (base) → Spring → Summer → Autumn (now) → Christmas (queued) → Easter
Helper: “Unpublished drafts never render. Everyday products remain visible underneath the seasonal layer.”

Include a small confirmation modal sketch: “Make Christmas live? Autumn content will hide from the website until next year.”
```

---

### Prompt 21 — Homepage banners & page copy

```
Design a high-fidelity desktop Homepage & Pages editor inside the Website CMS shell (Homepage & banners selected). Follow the existing design system. Website copy only.

TABS: Homepage banners | Pages (Home, About Us, Gallery, Contact Us) | Recipes / Journal

HOMEPAGE BANNERS TAB (default):
- Helper: “Banners are attached to a season. The live season decides which banner the website renders.”
- LEFT 55%: draggable list, each row = handle, thumb, title, linked season chip, on/off for that season, delete
  1. Harvest loaves are in · Autumn · Live
  2. Christmas pre-orders · Christmas · Scheduled
  3. Wedding cake season · Everyday · Active
  4. Summer picnic tarts · Summer · Draft
- RIGHT 45%: live storefront hero preview for the selected banner, labelled “Website render · depends on live season”

PAGES TAB (show as a secondary state or lower panel):
- List of website pages: Home, Bread & Pastries, Cakes & Desserts, Gallery, About Us, Contact Us
- Selecting About Us opens a simple WYSIWYG of the About story, featured image, and “Publish page” — no staff HR or order settings

RECIPES / JOURNAL TAB:
- List + editor: “24-hour country sourdough”, “Almond croissant at home” with Published/Draft pills
- Featured image, title, simple WYSIWYG, “Publish to website”
- Optional season chip so a Christmas pudding recipe only renders during the Christmas season
```

---

### Prompt 22 — Reviews on the website

```
Design a high-fidelity desktop Reviews screen inside the Website CMS shell (Reviews selected). Follow the existing design system.

PAGE GOAL: Choose which customer quotes appear on the public website (landing testimonials). Not a moderation war-room for abuse tooling beyond approve/reject for site visibility.

FILTER CHIPS: All, Waiting to go live, Live on website, Hidden, Flagged. “Waiting to go live” selected.

LIST:
Each row: customer photo, name, star rating, product (cake or bread name), excerpt, date, toggle “Show on website” (approve = live, reject = hidden).

Show five rows. Two flagged with a berry stripe and “Flagged” badge — those must stay off the website until cleared.

Bulk: “Publish to website”, “Hide from website”.

Keep the tone bakery-warm. Still no orders, stock, or kitchen data.
```

---

## 5. Inventory Management

These two screens are a **separate Kitchen admin**, not part of the Website CMS. Do not reuse the Prompt 17 CMS nav. Use a Kitchen shell: sidebar items Stock overview, Sales report only.

### Prompt 23 — Stock overview dashboard

```
Design a high-fidelity desktop Stock Overview dashboard for House of Bread London kitchen staff. Use a Kitchen admin shell (not the Website CMS). Sidebar: Stock overview (selected), Sales report. Follow the existing design system. Must feel like a kitchen health check, not a warehouse ERP, and not a website CMS.

TOP WIDGET CARDS (4 equal KPI cards with colour-coded status dots):
1. Total Products — 42 — green
2. Low Stock Alerts — 5 — yellow
3. Out-of-Stock Items — 2 — red
4. Expiring Soon — 3 — honey

MAIN: searchable, filterable stock table
- Search field “Search by product name”
- Filters: All statuses, Category
- Columns: Product (thumbnail + name), Current stock, Threshold, Status badge, Last baked
- Status badges: In stock = green, Low = yellow, Out = red, Expiring = honey
- Example rows:
  - Classic Sourdough · 48 · threshold 20 · In stock
  - Almond Croissant · 6 · threshold 12 · Low
  - Berry Pavlova · 0 · threshold 8 · Out
  - Fresh Cream Cakes · 9 · threshold 10 · Expiring (use-by today 18:00)

A tiny legend under the table explaining the four colours.
```

---

### Prompt 24 — Product sales report

```
Design a high-fidelity, production-ready Product Sales Report screen for House of Bread London kitchen staff. Desktop 1440px first, and also show a 768px tablet and 390px mobile layout of the SAME screen on the artboard so it is clearly responsive. Use the Kitchen admin shell (Sales report selected), not the Website CMS. Cream canvas, not grey SaaS.

PAGE HEADER
- Left: serif title “Product Sales”
- Right, top-right corner: secondary-style Export split button “Export” with a small menu hint for CSV and PDF (outline / dough fill, not the primary crust pill)

DATE RANGE (directly under the title, as a chip row):
Today | Yesterday | This week | This month | Custom range
“This week” is selected. Custom range, when imagined, opens a dual calendar — do not cover the table with it; show the chips only.

SUMMARY CARDS (four small KPI cards in a single row on desktop, 2×2 on tablet, stack on mobile):
1. Total units sold — 1,284
2. Total revenue — £8,642.50
3. Best-selling product — Almond Croissant · 312 units
4. Average order value — £18.40

FILTER BAR (one row on desktop, wraps on mobile):
- Category dropdown: All categories, Cakes, Breads, Pastries (All selected)
- Search bar: placeholder “Search by product name”
- Sort dropdown: Most sold (selected), Highest revenue, Price high–low

MAIN DATA TABLE — the core of the screen
Columns, in this exact order:
Product | Image | Unit price | Quantity sold | Total revenue | Trend

- Product: serif-adjacent name + tiny category label
- Image: 40px rounded thumbnail
- Unit price: £
- Quantity sold: integer
- Total revenue: £
- Trend: small sparkline (up green / down berry) plus a % delta

Example rows (mix of cakes, breads, pastries):
- Almond Croissant · pastry photo · £3.80 · 312 · £1,185.60 · +18%
- Classic Sourdough · bread photo · £4.50 · 260 · £1,170.00 · +9%
- Butter Croissant · pastry photo · £2.90 · 241 · £698.90 · −4%
- Signature Victoria Sponge · cake photo · £28.00 · 36 · £1,008.00 · +22%
- Pain au Chocolat · £3.40 · 190 · £646.00 · +6%
- Country Rye · £4.80 · 88 · £422.40 · −2%

Table header is sticky. Row hover is Warm Dough. Numeric columns are right-aligned. Sorted by Quantity sold descending.

RESPONSIVE RULES (must be visible in the tablet and mobile frames):
- Desktop: KPI row + full 6-column table
- Tablet: KPIs 2×2, filter bar wraps, table remains but Trend can collapse to % only
- Mobile: KPIs stack, filters become a “Filters” bottom sheet button, table turns into stacked cards per product (image, name, units, revenue, trend) so nothing requires sideways page-scroll. If a compact table is used, only Product, Qty, Revenue remain and the row opens for the rest.

No extra charts unless a small sparkline in the Trend column. Do not add a second page of analytics.
```

---

## Phase 2 — Consistency Pass

Shift-select every Phase 2 screen and paste:

```
Unify all selected screens to the House of Bread London system.

Customer commerce screens: same sticky header, pill CTAs, cream canvas, serif headings, four-column footer except during checkout (slim secure bar only).

Website CMS screens (Prompts 17–22): same Deep Crust “Website CMS” sidebar, cream canvas, live-season language, publish-to-website toggles. No orders, revenue, or stock widgets on CMS screens.

Kitchen screens (Prompts 23–24): separate Stock / Sales sidebar. Do not mix CMS seasonal modules into the kitchen reports.

No Material grey, no blue links, no sharp 4px cards.

Do not rewrite copy or rearrange sections. Only lock colour, type, radius, and chrome.
```

## Phase 2 — Mobile pass

```
Restyle this screen for 390px width. Keep copy and components.

Commerce: sticky add-to-cart / checkout bars; filters in a bottom sheet; calendar slots wrap; steppers remain thumb-friendly.

Admin: sidebar becomes a drawer; KPI cards 2×2 or stack; tables become card lists on phones; the Product Sales export button stays top-right and must remain tappable.

No horizontal overflow.
```
