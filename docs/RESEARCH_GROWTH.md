# What successful apps do, and what Wedded App takes from them

Research notes from 2026-09-30. For each app: the one lesson that matters to us, then our own version of it. We borrow ideas, never designs, wording or features wholesale. Sources are at the end.

## The short version

1. **Spread through the chats people already use.** Every plan, shortlist and vendor page should be a link that opens without the app, looks good in WhatsApp, and invites the next person in (Partiful, Meesho).
2. **Families decide together, so let them plan together.** Parents, siblings and cousins are part of the decision (Shaadi.com). A wedding plan with family members, and a way to react to vendors, is both the most useful feature and the best growth loop we can build.
3. **Be useful before the marketplace is full.** Free planning tools bring families in before we have every vendor (Zola, Andrew Chen's "come for the tool, stay for the network").
4. **Win the vendors by being the opposite of The Knot.** No pay-to-rank, no long contracts, no blasted or fake leads, and real numbers that show the app works for them.
5. **Show trust with counts, not stars.** "Replied to 9 of 11 families" and "Saved by 40 families" are honest, need no reviews, and can't be bought (Thumbtack, Airbnb Superhost, Houzz).
6. **Great photos sell.** Doing the photography ourselves for the first vendors is worth more than any feature (Airbnb).
7. **Win one area first.** Fill Yuba City and the 530 area before anywhere else (cold-start playbook).

## App by app

### Partiful: every invite is a landing page
- **What works:** an invite is a link that opens in any browser. Guests RSVP without installing anything, and every event shows the app to new people. It grew with almost no marketing.
- **Our version:** a family's plan and shortlist become shareable links. A relative taps the link in the family WhatsApp group, sees the shortlisted halls with photos, and can join the plan in one step, on the web or in the app. Vendor pages already open on the web (#58, #64). Next they need rich link previews (photo, name, price) so they look inviting in WhatsApp.

### Meesho: build for WhatsApp, not against it
- **What works:** its users lived in WhatsApp and weren't eager to install apps, so it made sharing to WhatsApp the main action. People trust products that come from someone they know.
- **Our version:** our users (parents, aunties, uncles) coordinate weddings in WhatsApp groups. "Send to family" should be one tap from every vendor page and shortlist, and what arrives in the group should be readable without the app.

### Shaadi.com: the family is the customer
- **What works:** parents and siblings often create and manage profiles for the person getting married, and the product supports that openly.
- **Our version:** a wedding plan has members with roles: the person who set it up, family who can edit, and family who can only look. "Planning for my son / daughter / myself" is part of setup (vision S2). Relatives can react to shortlisted vendors (love it / maybe / no), so the family can see where everyone stands without a 40-message thread.

### Zola: free tools first, the business follows
- **What works:** free planning tools (website, checklist, guest list) bring couples in, and revenue comes from what they buy later.
- **Our version:** My Wedding (the board of events and the vendor types each needs) is our free tool. It should be synced to the account so it's never lost, and it should do real work. For example, set the guest count for each event once, and every inquiry fills it in (a Punjabi wedding has very different numbers for the mehndi and the reception).

### The Knot and WeddingWire: learn from what vendors hate
- **What vendors complain about:**
  - 12-month contracts;
  - rankings you pay for;
  - the same lead sold to many competitors;
  - low-quality or suspected fake leads;
  - no budget filter, so leads don't fit.
- **Our version, as promises to vendors:**
  - ranking by distance and fit only, never by payment;
  - one inquiry goes to the vendor the family chose;
  - every inquiry comes from a signed-in family with a real phone number, the date, the guest count and the details;
  - founding vendors are free for life, with no contracts.

  Add budget and capacity filters so families only contact vendors that fit.

### Thumbtack and Airbnb: badges that are earned, not bought
- **What works:** Thumbtack's Top Pro and Airbnb's Superhost depend on replying quickly and reliably. Families look for them, and they push vendors to behave well.
- **Our version:** the reliability line from our own follow-up answers, such as "Replied to 9 of 11 families". It shows only after 5 or more answers, and a missing answer is never counted against a vendor (vision idea 18). Later, a "Quick to reply" badge.

### Houzz: saves are social proof
- **What works:** people save photos into collections, and those saves feed awards that pros proudly display.
- **Our version:** "Saved by 40 families" on vendor pages. It's an anonymous count, only shown above a minimum so nobody can be identified. It's a good reason for vendors to share their Wedded App page.

### Airbnb: do the unscalable thing
- **What works:** the founders photographed early listings themselves, and bookings rose sharply.
- **Our version:** for the first founding vendors, founders collect or shoot the photos. The upload script already handles resizing. A monthly WhatsApp scorecard for vendors ("22 families viewed you, 9 asked, you replied to 8") keeps them engaged. That needs view and tap counts, which we should start collecting now so the history exists.

### Availability: the date is the first question
- **What works:** wedding marketplaces let couples filter by vendors who are free on their date. Vendors who show availability get contacted first.
- **Our version:** an availability calendar for vendors, kept by founders for founding vendors until vendors have accounts. It powers "Available on your date" and a date filter. The vision already specifies it (§6 availability calendar).

### Cold start: supply first, one area at a time
- **What works:** marketplaces win by filling one area densely before expanding, and by starting on the hard side (for us, vendors).
- **Our version:** Yuba City and the 530 area first. The Founding 50, the QR tents for halls and the vendor scorecards are all supply-side tools. Expand area code by area code.

## What we're building from this (priority order)

| # | Feature | Why | Status |
| --- | --- | --- | --- |
| 1 | **Plan together:** My Wedding saved to the account, family members with roles, invite links that work in WhatsApp and on the web | Useful, keeps the plan safe, and is our growth loop | Building (Tab A) |
| 2 | **Family reactions** on shortlisted vendors | Families decide together | After 1 |
| 3 | **Vendor numbers:** anonymous views and call, text, directions and share taps; "Saved by N families"; "Replied to N of M families" | Trust for families, proof for vendors, monthly scorecards | Building (Tab A) |
| 4 | **Search filters:** guest capacity, price ceiling, language, sort by price | Families only contact vendors that fit, so leads are better | Building (Tab A) |
| 5 | **Availability calendar** and "Available on your date" | The first question every family asks | Next |
| 6 | **Guest count per event** in My Wedding, filling in inquiries | Less typing, better leads | Next |
| 7 | **Rich WhatsApp link previews** (photo, name, price) for vendor, plan and shortlist links | Links look good where our users live | Next (web head tags) |
| 8 | **Vendor promises page** for the pitch: no pay-to-rank, one inquiry per family choice, free founding listing | Differentiates from The Knot | Content (founders) |

## What we won't do

- Sell ranking, or show paid placement without a clear "Sponsored" label (vision: only in Phase 8, labelled).
- Blast one family's inquiry to many vendors.
- Add likes, followers or public comments; the heart means Save.
- Show star ratings before there are enough real, verified answers.

## Sources

- Partiful's link-based growth: [Sacra](https://sacra.com/chat/h/ca6c792b-7d6d-42a9-ae5f-0970a819c66c/), [NoGood](https://nogood.io/blog/partiful-marketing-strategy/), [Consumer App Lab](https://consumerapplab.substack.com/p/virality-isnt-retention-lessons-from)
- Meesho and WhatsApp: [upGrowth teardown](https://upgrowth.in/meesho-built-social-commerce-india-gtm-strategy-teardown/), [Behind the Feature](https://behindthefeature.substack.com/p/how-meesho-turned-whatsapp-aunties)
- Shaadi.com and family involvement: [Shaadi.com blog](https://blog.shaadi.com/how-to-use-shaadi-app-as-a-matchmaking-platform-step-by-step-guide/)
- Zola: [Wikipedia](https://en.wikipedia.org/wiki/Zola_(company)), [Fast Company](https://www.fastcompany.com/90212949/zolas-plan-to-take-on-the-72-billion-wedding-industry), [Unbounce case study](https://unbounce.com/landing-pages/zola-case-study-targeted-marketing/)
- The Knot and WeddingWire, and vendor complaints: [WeddingPro](https://pros.weddingpro.com/blog/marketing/best-advertising-platform-for-wedding-vendors/), [Wedy marketplace comparison](https://www.wedypro.ai/blog/wedding-vendor-marketplace-comparison), [PetaPixel on the lead lawsuit](https://petapixel.com/2025/04/17/the-knot-accused-of-selling-fake-leads-to-wedding-photographers/), [planning.wedding](https://planning.wedding/is-the-knot-worth-it-for-vendors)
- Thumbtack Top Pro: [Thumbtack community](https://community.thumbtack.com/discussion/1695/top-pro-badge-2024-top-status-ranking), [Pro Basics](https://www.thumbtack.com/pro-basics)
- Airbnb photography and Superhost: [GrowthHackers](https://growthhackers.com/growth-studies/airbnb/), [Medium](https://medium.com/@cagdasbalci0/airbnbs-path-to-100b-how-two-designers-and-an-engineer-turned-air-mattresses-into-a-global-9615bbbfe703)
- Houzz badges and ideabooks: [Houzz Badges 101](https://www.houzz.com/ideabooks/1965967/thumbs/houzz-badges-101), [Best of Houzz](https://www.houzz.com/best-of-houzz)
- Availability: [WeddingPro on availability](https://pros.weddingpro.com/blog/vendor-visibility-availability/), [Sharetribe wedding marketplace guide](https://www.sharetribe.com/create/how-to-build-marketplace-for-wedding-services/)
- Cold start: [Andrew Chen on marketplaces (Stripe Atlas)](https://stripe.com/guides/atlas/andrew-chen-marketplaces), [Why "Uber for X" failed](https://andrewchen.com/why-uber-for-x-failed/)
- WedMeGood (India): [YourStory](https://yourstory.com/2019/04/online-wedding-platform-wedmegood-funding), [Publir interview](https://publir.com/blog/2022/02/in-conversation-co-founder-wedmegood/)
