# Phase 2 — Ordering, Admin CMS, Inventory

Generate Phase 1 first so Stitch already has the House of Bread design system. Then paste each block below as its own screen. Customer commerce screens keep the storefront header and footer. Admin screens use the staff shell described in Prompt 17.

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

## 4. Content Management — Admin UI

Admin screens share one staff shell. Generate Prompt 17 first, then every later admin prompt reuses that shell.

### Prompt 17 — Admin dashboard

```
Design a high-fidelity desktop admin dashboard (1440px) for House of Bread London staff. Follow the bakery design system — cream canvas, not a generic grey SaaS theme.

STAFF SHELL (reuse on every admin screen after this):
- Left sidebar 260px, Deep Crust background, cream type, wheat logo “House of Bread · Staff”
- Nav groups:
  Overview: Dashboard
  Catalogue: Products, Banners, Recipes, Reviews
  Kitchen: Inventory, Sales report
  System: Users (muted)
- Sidebar footer: avatar “Maya Chen · Head Baker”, sign out
- Top bar: page title, date “Monday 14 Sep 2026”, search, notification bell with a honey dot

MAIN — Dashboard
- Eyebrow “Bakery control centre”
- Heading “Good morning, Maya”
- KPI card row (4 equal white cards, bakery icons):
  1. Orders today — 38 — up 12%
  2. Revenue — £1,246 — up 8%
  3. Low stock alerts — 5 — yellow accent, “Needs bake”
  4. Out of stock — 2 — red accent
- Below: two columns
  - Left: “Today’s orders” compact table with status pills
  - Right: “Low stock” list with product thumbnail, remaining units, “Bake more” link
- Colour-coded health: green / yellow / red dots on KPI cards
```

---

### Prompt 18 — Product management table

```
Design a high-fidelity desktop Product Management screen inside the House of Bread staff shell (Products selected). Follow the existing design system.

TOOLBAR: search, category filter, primary “Add product”

TABLE (sortable column headers with chevrons):
- Thumbnail
- Product name (inline editable on click — one row shows an input with a green check)
- Category
- Price
- Stock
- Availability toggle switch (on = crust/honey, off = muted). One row is toggled off, label “Hidden”
- Row actions: edit pencil, duplicate, delete

Show 8 rows including Classic Sourdough, Butter Croissant, Almond Croissant (low stock yellow), Berry Pavlova (toggle off).

Footer: pagination 1–8 of 42.
```

---

### Prompt 19 — Add / Edit product

```
Design a high-fidelity desktop Add/Edit Product screen inside the staff shell. Follow the existing design system.

HEADING: “Edit product · Signature Victoria Sponge”
Tertiary “Save draft” + primary “Publish”

TWO COLUMNS:

LEFT (wider):
- Drag-and-drop image upload well with four filled thumbnails, first marked “Cover”, reorder handles, “Drop more photos”
- Product name
- Rich-text description editor (bold, italic, lists, link) with a short formatted cake description already entered
- Allergens checkboxes
- Dietary tags

RIGHT:
- Category select
- Price £
- SKU
- Availability toggle
- Variant / size builder:
  - Rows for 6" £22, 8" £28, 10" £36
  - Each row: size label, price, stock, delete
  - “Add size” dashed button
- Flavour chips with an “Add flavour” field

Sticky save bar at the bottom of the canvas on shorter viewports.
```

---

### Prompt 20 — Banner / promotion manager

```
Design a high-fidelity desktop Banner Manager inside the staff shell (Banners selected). Follow the existing design system.

SPLIT VIEW:
- LEFT 55%: draggable banner list. Each row is a drag handle, thumbnail, title, date range, on/off toggle, delete.
  Order:
  1. Weekend croissant box (active)
  2. Wedding cake season (active)
  3. Loyalty Gold Loaf (scheduled)
  4. Harvest loaf (paused)
- RIGHT 45%: live preview panel of the storefront hero as customers will see it, currently previewing “Weekend croissant box” with the bakery photography, headline, and Order Now button. Label the panel “Live preview · Homepage hero”

Helper text: “Drag to set homepage order. First active banner is the default hero.”
```

---

### Prompt 21 — Blog / recipe manager

```
Design a high-fidelity desktop Recipe / Blog manager inside the staff shell (Recipes selected). Follow the existing design system.

TOOLBAR: search, “All recipes” filter, primary “New recipe”

LIST + EDITOR split:
- Left list of recipes: “24-hour country sourdough”, “Almond croissant at home”, “Victoria sponge, bakery method” with featured-image thumbs and Published/Draft pills
- Right editor canvas for the selected recipe:
  - Featured image selector with a large preview and “Replace image”
  - Title field
  - Simple WYSIWYG toolbar (H2, H3, bold, italic, quote, numbered list, image, embed)
  - Body with a short recipe already laid out (ingredients + method)
  - SEO slug field
  - Primary “Publish”, secondary “Save draft”
```

---

### Prompt 22 — Reviews moderation

```
Design a high-fidelity desktop Reviews Moderation screen inside the staff shell (Reviews selected). Follow the existing design system.

FILTER CHIPS: All, Pending, Approved, Rejected, Flagged. “Pending” selected.

LIST OF REVIEW ROWS:
Each row: customer photo, name, star rating, product name, review excerpt, date, Approve / Reject segmented toggle.

Show five rows. Two are FLAGGed: left 4px berry stripe, honey “Flagged” badge, excerpt containing a highlighted phrase so staff can see the reported content. Those two have the toggle in a neutral pending state.

Bulk actions bar: “Approve selected”, “Reject selected”.

Keep the tone operational but still bakery-warm, not a toxic-content dark-mode tool.
```

---

## 5. Inventory Management

### Prompt 23 — Stock overview dashboard

```
Design a high-fidelity desktop Stock Overview dashboard inside the House of Bread staff shell (Inventory selected). Follow the existing design system. Must feel like a kitchen health check, not a warehouse ERP.

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
Design a high-fidelity, production-ready Product Sales Report screen for House of Bread London staff. Desktop 1440px first, and also show a 768px tablet and 390px mobile layout of the SAME screen on the artboard so it is clearly responsive. Follow the existing bakery admin shell (Sales report selected). Cream canvas, not grey SaaS.

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

Admin screens: same Deep Crust sidebar, cream canvas, honey/crust KPI accents, white rounded table cards, green/yellow/red status language. No Material grey, no blue links, no sharp 4px cards.

Do not rewrite copy or rearrange sections. Only lock colour, type, radius, and chrome.
```

## Phase 2 — Mobile pass

```
Restyle this screen for 390px width. Keep copy and components.

Commerce: sticky add-to-cart / checkout bars; filters in a bottom sheet; calendar slots wrap; steppers remain thumb-friendly.

Admin: sidebar becomes a drawer; KPI cards 2×2 or stack; tables become card lists on phones; the Product Sales export button stays top-right and must remain tappable.

No horizontal overflow.
```
