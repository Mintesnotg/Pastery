# House of Bread London — Google Stitch Prompt Pack

Copy-paste these prompts into [Google Stitch](https://stitch.withgoogle.com) to generate a professional bakery UI from the handwritten brief.

## How to run this in Stitch

1. Open Stitch and create a **new Web project** named `House of Bread London`.
2. Set the canvas to **Desktop (1440px)** first. Generate **Mobile (390px)** after each desktop screen is approved.
3. **Prompt 0 first.** Paste the Design System prompt from `DESIGN.md` (or from the “Prompt 0” block in `PHASE-1.md`) so every later screen inherits the same bakery language.
4. Generate **one screen per prompt**. Stitch is more accurate when each paste is a single screen, not a whole product.
5. After a phase is generated, **Shift-click every screen** on the canvas and paste the **Consistency Pass** prompt at the end of that phase file.
6. Do **Phase 1** before **Phase 2**. Customer surfaces first, then commerce, then admin.

| File | What it contains |
| --- | --- |
| [`DESIGN.md`](./DESIGN.md) | Brand system. Paste this once at the start of the Stitch project. |
| [`PHASE-1.md`](./PHASE-1.md) | Landing page + account screens. |
| [`PHASE-2.md`](./PHASE-2.md) | Ordering, checkout, admin CMS, inventory. |

## Prompt rules used here

- One screen, one paste.
- Layout and content first. Colours live in the design system so they are not restated in every screen prompt.
- Real bakery copy is included (tagline, hours, address, nav labels) so Stitch does not invent placeholder text.
- Hover, empty, error, and success states are named so you can ask Stitch for a second variant of the same screen if needed.

## Suggested generation order

**Phase 1**

1. Landing page  
2. Sign up / Login  
3. Password reset (3 steps)  
4. Profile dashboard  
5. Address book  
6. Order history  
7. Wishlist + loyalty widget  

**Phase 2**

8. Product listing  
9. Product detail  
10. Cart drawer  
11. Checkout — Delivery  
12. Checkout — Payment  
13. Checkout — Review  
14. Order confirmation  
15. Order tracking  
16. Custom / bulk order form  
17. Website content dashboard (live season + post cake/bread)  
18. Website product catalogue (cakes, breads, pastries)  
19. Post / edit a cake or bread  
20. Seasonal content (dynamic website render)  
21. Homepage banners & page copy  
22. Reviews on the website  
23. Stock overview (kitchen, not CMS)  
24. Product sales report (kitchen, not CMS)  
