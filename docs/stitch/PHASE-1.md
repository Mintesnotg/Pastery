# Phase 1 — Customer Experience

Paste **Prompt 0** from `DESIGN.md` first. Then paste each block below as its own Stitch generation. After all Phase 1 screens exist, run the Consistency Pass at the bottom.

Every customer screen reuses the same sticky header and four-column footer unless the prompt says otherwise.

---

## Prompt 1 — Landing page

```
Design a high-fidelity desktop landing page (1440px) for House of Bread London, a North London artisan bakery. Follow the existing House of Bread design system. Do not invent extra sections beyond this page structure.

PAGE GOAL: Make a first-time visitor hungry, then click Order Now.

PAGE STRUCTURE:

1. Sticky header
- Left: wheat-mark logo + “House of Bread” / “London”
- Centre-right text links: Home, Bread & Pastries, Cakes & Desserts, Gallery, About Us, Contact Us
- Far right: “Account” text link, then a prominent pill button “Order Online” with a small basket icon
- Home is the active link

2. Hero (full viewport width)
- Full-bleed bakery video still: bakers pulling golden loaves from a deck oven at dawn, steam, flour in the air. Overlay a soft dark-crust gradient so white type stays readable.
- Eyebrow chip: “Artisan Bakery · North London”
- Bold serif headline on two lines: “Freshly Baked” / “Every Day”
- Supporting line: “From slow-fermented sourdough to flaky all-butter croissants, every bake is crafted by hand in our London bakery.”
- Primary CTA: large pill “Order Now”
- Secondary CTA: outline pill “Explore the Bakes”
- Bottom of hero: a small bouncing chevron “Scroll” indicator
- Tiny trust row under the CTAs: five filled honey stars, “4.9 / 5”, and “Open from 7 AM daily”

3. Featured products carousel
- Eyebrow “Favourites”, heading “Our Featured Bakes”
- Horizontal card carousel with left/right arrows and dots
- Four cards visible: Classic Sourdough £4.50, Butter Croissant £2.90, Signature Victoria Sponge £28.00, Chocolate Chunk Cookies £2.80
- Each card: 4:3 photo, category label, serif name, one-line description, price, small “Order” pill
- Hover: card lifts, photo zooms slightly

4. Category tiles
- Three equal rounded photography tiles with soft shadows: Cakes, Breads, Pastries
- Each tile has a bakery icon, title, one-line description, and a dark gradient from the bottom so the title sits in cream type
- Hover: image scales gently

5. Testimonials
- Heading “What Our Customers Say”
- Card slider (not a wall of text): three cards visible
- Each card: circular customer photo, 5 honey stars, italic quote, name, short role
- Quotes:
  - Sarah Jenkins, Local Customer — “The sourdough is genuinely the best I've had outside of Paris. A true North London gem.”
  - James Okafor, Regular since 2019 — “Their almond croissants are dangerously good. The team always remembers my order.”
  - Emily Chen, Wedding Customer — “How delighted our wedding looked with the bespoke cake. Beautiful, delicious and on time.”

6. Footer (Deep Crust background, four columns)
- Column 1 Brand: logo, short history “Freshly baked every day in the heart of London. Slow-fermented sourdough, flaky pastries and celebration cakes crafted with love since 2010.” Instagram, Facebook, X as circular icons
- Column 2 Explore: Home, Bread & Pastries, Cakes & Desserts, Gallery, About Us, Contact Us, Order Online, Account
- Column 3 Visit Us: 24 Crown Lane, London N19 4NP · +44 20 7946 0958 · hello@houseofbreadlondon.co.uk
- Column 4 Opening Hours: Monday–Friday 7:00 AM–6:00 PM · Saturday 8:00 AM–6:00 PM · Sunday 8:00 AM–3:00 PM
- Bottom legal row: © 2026 House of Bread London

Motion: smooth scroll, sections fade up as they enter the viewport. Warm, generous whitespace. Photoreal bakery imagery only.
```

---

## Prompt 2 — Sign up / Login

```
Design a high-fidelity desktop auth screen (1440px) for House of Bread London. Follow the existing design system.

PAGE GOAL: Let a customer create an account or sign in without feeling like a banking app.

LAYOUT: Split screen.
- Left 45%: full-height bakery photograph of laminated croissants on a wooden board, overlay with the logo and the line “Welcome back to the bakery.”
- Right 55%: cream panel, vertically centred card (max-width 420px).

CARD CONTENTS:
- Segmented toggle at the top: “Sign In” | “Create Account”. Sign In is selected.
- Email field, Password field with show/hide eye icon
- “Remember me” checkbox + “Forgot password?” text link
- Full-width primary pill “Sign In”
- Divider “or continue with”
- Social buttons stacked, Google first (highest visual weight), then Apple, then Facebook. Each is a full-width rounded outline button with brand mark on the left and label on the right. Google is slightly larger / filled white with a stronger border so it reads as the preferred option.
- Fine print: “By continuing you agree to our Terms and Privacy Policy.”

TOGGLE TO SIGN UP STATE (design this as the second state of the same screen, shown as a selected-tab variant if Stitch allows only one canvas):
- Fields: Full name, Email, Password, Confirm password
- Inline validation: green check on valid email, red helper “Passwords must match” under confirm
- Primary pill “Create Account”
- Same social row underneath

Empty, focus, error, and success field states must be visible in the design (error shown on password: “Incorrect email or password”).
No sticky storefront header. A small “Back to bakery” text link sits above the card.
```

---

## Prompt 3 — Password reset flow

```
Design a high-fidelity desktop password-reset flow for House of Bread London as THREE sequential screens on one artboard, left to right, connected by a 3-step progress indicator (1 Email → 2 Verify → 3 New password). Follow the existing design system.

Shared chrome: cream background, centred white card (420px), logo above the card, step dots + labels above the form.

SCREEN A — Email
- Heading “Reset your password”
- Body “We’ll send a 6-digit code to your bakery account email.”
- Email input
- Primary pill “Send code”
- Text link “Back to sign in”
- Progress: step 1 active, 2 and 3 inactive

SCREEN B — Verify code
- Heading “Check your inbox”
- Body “Enter the code we sent to s***@email.com”
- Six square OTP boxes in a row, first three filled with “4 8 1”, cursor in box 4
- Helper “Didn’t get it? Resend in 0:24”
- Primary pill “Verify code”
- Progress: step 2 active, step 1 completed with a green check

SCREEN C — New password
- Heading “Choose a new password”
- New password + Confirm password fields with strength meter (Weak / Fair / Strong) under the first field, currently “Strong” in green
- Primary pill “Update password”
- Progress: step 3 active, 1 and 2 completed

Keep all three cards visually identical in width and padding so the flow feels like one journey.
```

---

## Prompt 4 — Profile dashboard

```
Design a high-fidelity desktop account dashboard (1440px) for a logged-in House of Bread London customer. Follow the existing design system. Include the standard sticky storefront header (Account is active) and the four-column footer.

PAGE GOAL: Let the customer manage their bakery account from one place.

LAYOUT: 260px left sidebar + main canvas.

SIDEBAR NAV (vertical, with small bakery icons):
- Profile Info (selected)
- Addresses
- Order History
- Wishlist
- Loyalty Points
- Sign out (muted, at the bottom)

MAIN — Profile Info
- Page title “Your profile” and subtitle “How we greet you on orders and at the counter.”
- Avatar circle with initials “AJ” and a “Change photo” ghost button
- Form in two columns: First name, Last name, Email, Phone, Date of birth, Preferred name
- Inline validation: Email shows a green check, Phone shows a red error “Enter a UK number, e.g. +44 7700 900123”
- Primary pill “Save changes” and a text button “Cancel”
- A quiet toast at the top of the main canvas in green: “Profile updated”

Do not put order tables on this screen. Sidebar only points to the other sections.
```

---

## Prompt 5 — Address book

```
Design a high-fidelity desktop Address Book screen for House of Bread London, still inside the account dashboard shell (same header, same sidebar with Addresses selected, same footer). Follow the existing design system.

PAGE TITLE: “Saved addresses”
SUBTITLE: “Used for delivery and for collection reminders.”

CONTENT: CSS grid of address cards, 3 per row on desktop.

Each saved address card:
- Small “Home” or “Work” pill
- Recipient name
- Full UK address
- Phone
- Top-right icon cluster: pencil (edit), trash (delete)
- Optional “Default” honey badge on one card

Include exactly three cards:
1. Default Home — Amira Jones, 14 Crouch Hill, London N4 4AU
2. Work — Amira Jones, 88 Clerkenwell Road, London EC1M 5RJ
3. A dashed-outline “Add new address” card as the last tile: plus icon, label “Add a new address”, no fill, Kneaded Wheat dashed border, same corner radius as the solid cards

Hover on solid cards: lift. Hover on dashed card: fill Warm Dough.
```

---

## Prompt 6 — Order history

```
Design a high-fidelity desktop Order History screen for House of Bread London, inside the account dashboard shell (Order History selected in the sidebar). Follow the existing design system.

PAGE TITLE: “Order history”
Filters as chips: All, Pending, Delivered, Cancelled. “All” selected.

CONTENT: vertical list of order cards, not a dense spreadsheet.

Each card:
- Left: thumbnail stack of the baked goods
- Order number #HB-1042, date 12 Sep 2026, item count
- Colour-coded status pill: Pending = yellow, Delivered = green, Cancelled = red
- Total in GBP
- Text buttons “View details” and, if Delivered, “Reorder”

Show three example cards:
1. #HB-1042 · 12 Sep 2026 · Delivered (green) · Classic Sourdough + Butter Croissant · £7.40
2. #HB-1038 · 8 Sep 2026 · Pending (yellow) · Signature Victoria Sponge · £28.00 · helper “Baking for Saturday collection”
3. #HB-1011 · 22 Aug 2026 · Cancelled (red) · Berry Pavlova · £6.20

A faint vertical timeline spine on the left of the list so the history feels chronological.
```

---

## Prompt 7 — Wishlist + loyalty widget

```
Design a high-fidelity desktop account screen for House of Bread London that combines Wishlist and Loyalty Points. Use the account dashboard shell with Loyalty Points selected. Follow the existing design system.

TOP BAND — Loyalty widget
- Heading “Bakery rewards”
- Large circular meter on the left: 340 / 500 points, honey arc, centre label “160 to next treat”
- Right of the meter: “Gold Loaf” tier name, a linear progress bar to the next reward (free almond croissant), and a line “Earn 1 point for every £1 spent.”
- Small text “Next reward unlocks at 500 points”

BELOW — Wishlist
- Heading “Saved bakes”
- 4-column product card grid: Almond Croissant, Country Rye, Vanilla Cheesecake, Harvest Seed Loaf
- Each card: photo, name, price, heart icon filled berry (already wishlisted), primary “Add to basket” pill
- One card shows an “Out of season” muted state with the add button disabled

Empty-state note in the corner of the artboard (small, secondary): a dashed area titled “Empty wishlist” with the line “Tap the heart on a bake to save it here.” so developers can see the empty treatment without replacing the filled grid.
```

---

## Phase 1 — Consistency Pass

After generating Prompts 1–7, Shift-select every Phase 1 screen and paste:

```
Apply one consistent House of Bread London visual theme across all selected screens.

- Cream canvas, crust-brown primary pills, honey-gold stars and highlights, deep-crust footer and headlines
- Serif for headings, sans-serif for UI
- Pill buttons, generously rounded white cards, whisper-soft shadows
- Same sticky header (logo, nav, Account, Order Online) on every storefront and account screen
- Same four-column footer on every storefront and account screen
- Auth and password-reset screens stay header-free except for the logo and Back link
- Do not change layout or copy. Only unify colour, type, radius, and component chrome.
```

## Phase 1 — Mobile pass (optional, after desktop is approved)

For each approved desktop screen, duplicate to 390px and paste:

```
Restyle this screen for a 390px mobile viewport. Keep every section and all copy.

- Header collapses to logo + hamburger + basket
- Hero video is full width, headline and Order Now stack vertically, scroll chevron remains
- Featured carousel becomes a snap-scroll row, one and a half cards visible
- Category tiles stack
- Testimonials become a single-card slider
- Footer columns stack
- Account dashboard: sidebar becomes a horizontal chip scroller under the header
- Forms are single column, primary CTA is sticky at the bottom of the viewport
- No horizontal page overflow
```
