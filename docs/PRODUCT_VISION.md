# Product Vision: How the App Looks and Works

Written for Kirat and Fezy. This is the full picture of the app: who it is for, how families plan Punjabi weddings today, every screen a user sees, how each vendor type appears, what vendors get, what is realistic on Expo + Supabase for two part-time founders, where competitors fail, and the features that make this worth using instead of WhatsApp, Instagram and phone calls.

It was assembled from six research briefs (user screens, vendor side, Punjabi wedding domain, competitors, design, technical realism) and 48 feature ideas that were each challenged by skeptic reviews. Where a number comes from research it says so. Where it is a judgment call it says that too.

Sections:

1. What the app is
2. The people and how they plan today
3. Events and vendor categories (the data the whole app is built on)
4. How it looks
5. Screen by screen (user side)
6. Vendor listings by type (halls and gurdwaras in depth)
7. The vendor's experience across phases, and the founders' admin
8. Technical reality on Expo + Supabase
9. Competitors: gaps, what to copy, traps
10. What sets it apart (verified ideas) and what was parked
11. Additions to the project plan
12. Open decisions
13. The November prototype and how to split the work

---

## 1. What the app is

**One sentence:** Every vendor for every event of a Punjabi wedding, from roka to reception, free to browse, no account needed, no pay-to-rank, built for Northern California.

**What it does in Phase 3/4:** a directory organised by wedding event. A parent or couple opens the app, taps the event they are planning (jaago, mehndi, anand karaj, reception), sees the vendor types that event needs, sees nearby vendors with a starting price and distance, opens an Instagram-style profile, and calls, texts, WhatsApps, or sends a structured inquiry. Saved vendors are grouped by event so the family builds a plan as they browse.

**What it becomes in Phase 8:** vendors manage their own listings and inquiries, families see a vendor's real track record (replies, showed up, price matched), two families share one wedding board, and the app knows the gurdwara rules, the community blackout dates and what families in each area code actually paid.

**Why now.** Instagram's organic reach has fallen to 2 to 3 percent of followers, so vendors' main free channel is decaying. The Knot and WeddingWire are under FTC scrutiny and a class action over fake leads. Every mainstream directory is built around one ceremony plus one reception for 130 guests; a Punjabi wedding is two families running parallel chains of 6 to 10 events over 4 to 5 days for 300 to 1,500 guests. Nobody serves that.

**Why you.** You grew up at these weddings, you speak the language of the parents who book half the vendors, and you can walk into a hall in Yuba City or a gurdwara office in Fremont. The competitors that matter (Rasam, DesiWeds, BollyWeds) are planner-first apps trying to build supply from a laptop. Your moat is the relationships and the event structure, not the code.

**What it is not.** Not a booking or payments platform, not a planner with 300 tasks, not a lead marketplace. It never charges vendors for introductions and never sells rank. Those are commitments, not just scope limits, and they should be stated in the app.

---

## 2. The people and how they plan today

### Who uses it

| Persona | What they do in the app | What they need |
| --- | --- | --- |
| **Mother or father planning for a son or daughter** (45 to 70, often Punjabi-first, Facebook and WhatsApp, not Instagram) | Books gurdwara, langar, halwai, dhol, ghori, pagg, thaal, mithai. Calls, does not DM. | Large text, Gurmukhi, Call button first, phone number printed, no sign-up wall, prices before calling |
| **The couple** (25 to 35, Instagram-first, plan themselves in the Bay Area, with parents in the Valley) | Books photo, video, DJ, decor, makeup, mehndi. Compares, saves, sends written inquiries. | Search by city and event, starting prices, videos, saved list they can share with parents |
| **Sibling or cousin coordinator** (the organised one) | Runs the list, forwards options to the family group, tracks who called whom | A board grouped by event, notes ("Bibi ji said too expensive"), a way to send a comparison to WhatsApp |
| **Vendors** (see section 6) | Phase 3/4: receive inquiry emails. Phase 8: manage listing and inbox. | Qualified leads with date, city and guest count; zero data-entry burden; proof it works |
| **Hall office staff** | Phase 8 web dashboard, tour requests, rate cards | Fewer repetitive phone questions ("outside catering? BYO alcohol?") |

### How NorCal Punjabi families find vendors today (in order of real weight)

1. **Aunties and the last wedding attended.** Families attend 8 to 15 weddings a year and scout live: "kihda si?" (whose was it?). Trust is "the Gill family used him and it was fine."
2. **WhatsApp.** Family, pind and community groups; vendor flyers forwarded as photos; voice notes asking "koi vadhia DJ dasso Yuba vich."
3. **Instagram.** Photographer captions credit the DJ, dhol, decor, makeup and mehndi; couples DM from there and wait days for a reply. Hashtags: #sikhwedding #punjabiwedding #bayareasikhwedding #yubacitywedding #jaago.
4. **Facebook groups** (where the parents are): 70 vendor replies to one question, unsearchable a week later.
5. **Gurdwara** notice boards and office staff; the gurdwara is also the venue, booked by walking in.
6. Indian grocery flyer racks, Punjabi radio, Sulekha, Yelp for halls, 2 or 3 bridal expos a year.

### The pain (users)

- **No prices anywhere.** "DM for price." Price depends on who referred you ("Punjabi rate vs gora rate").
- **No availability.** Every inquiry starts with "are you free Sept 12?" and ends three days later with "sorry, booked." DJs and dholis overbook peak Saturdays and send a junior team.
- **Vendors do not reply**, or reply at 1 AM after a gig; phone is the only reliable channel, often only in Punjabi.
- **Cash, Zelle, no contract.** Deposits vanish; disputes are settled through relatives.
- **No trustworthy reviews.** Yelp and Google are strangers; the only trusted signal is "someone I know used them."
- **Multi-day, two-city logistics.** Bride in Yuba City, groom in Fremont; the same dholi at maiyan Thursday, jaago Friday, gurdwara Saturday 9 AM, reception Saturday 7 PM; makeup at the house at 4:30 AM.
- **Two families, two budgets, one calendar.** Both sides' jaago on the same night; who pays the gurdwara donation; one shared photographer.
- **Backyard bureaucracy** nobody warns you about: tent permits, portable restrooms, noise complaints at 1 AM, fireworks being illegal.

### The pain (vendors)

- Low-quality leads: dozens of "price?" DMs with no date, city or guest count.
- No single calendar; double-booking across family text threads.
- Chasing balances after the wedding; cash-only expectations.
- One angry family's WhatsApp forward can cost a season; rivals post fake reviews; photos are reposted without credit.
- Reach: Instagram ads hit non-Punjabis; a Yuba City vendor wants Bay Area clients and vice versa; travel fees are awkward to quote.
- Many are home businesses run by women (mehndi, makeup, suits, thaal, sweets) who want clients but not their address public.

### Geography (the launch market)

| Region | Character | Wedding size |
| --- | --- | --- |
| Yuba City / Sutter (530) | Tight, farming-rooted, Sikh-majority town; everyone is two calls from everyone; cash culture; thin supply so families import vendors from Sacramento and the Bay | 700 to 1,500 (2,000 happens) |
| Sacramento / Elk Grove / Roseville (916) | Fastest-growing hub; many vendors serve both Yuba and the Bay; Punjabi-owned halls and hotel ballrooms | 400 to 800 |
| Fremont / San Jose / East Bay (510, 408, 650, 925) | Tech-professional couples who plan themselves, higher budgets, fusion and interfaith more common, planners, wineries; parents still run gurdwara, dhol, halwai and pagg through the network | 300 to 700 |
| Stockton / Lodi / Manteca / Tracy (209 north) | Trucking and agriculture plus Bay commuters; oldest gurdwara in the US (Stockton, 1912) | Yuba-style |
| Modesto / Turlock / Livingston (209 south) | Farm families; fairground and Punjabi-owned hall receptions | Large |
| Fresno (559), Bakersfield (661) | Own ecosystems; first Phase 8 expansion before SoCal | Large |

Add 925, 650, 559 and 707 to the plan's area-code list; Pleasanton, Dublin and Livermore are firmly part of the Bay Area Punjabi market.

### Seasonality and blackouts (store as data)

- Peak: late March through June (Memorial Day weekend is the busiest), late August through October, and Dec 20 to Jan 3 (students and Canada/UK relatives are home).
- Long-weekend clustering: MLK, Presidents' Day, Memorial Day, July 4, Labor Day, Thanksgiving.
- Valley heat in July and early August suppresses outdoor baraat, ghori and backyard jaago.
- Blackouts: Yuba City Nagar Kirtan weekend (first weekend of November; 200,000+ attendees) empties every hall, dholi and hotel in 530. Vaisakhi nagar kirtans in April by city. Gurpurabs in November and late December/January restrict gurdwara slots.
- Lead times: peak-Saturday gurdwara morning slots go 9 to 15 months out; halls 6 to 12; top photographers 8 to 14; DJs and dholis 3 to 9; makeup and mehndi 2 to 6.
- Thursday and Friday events run 15 to 30 percent cheaper.

---

## 3. Events and vendor categories

This is the spine of the app. Cultures, events and categories are rows in tables, never code, so a Punjabi Hindu or Punjabi Muslim event set (or a Gujarati one in Phase 8) is a seed file, not a rewrite. Every event has `host_side` (bride / groom / joint) because one Punjabi wedding is two parallel event chains.

Gurmukhi spellings below were cross-checked against Punjabi Wikipedia's article on Punjabi wedding customs; where the community spells something two ways (ਅਨੰਦ/ਆਨੰਦ, ਸਿਹਰਾ/ਸਹਿਰਾ, ਬਰਾਤ/ਬਾਰਾਤ) store the primary and keep the other as a search alias. Have your mothers read the list once before it ships.

### Events in order (Sikh default; H = Punjabi Hindu delta, M = Punjabi Muslim delta)

| # | Event | Gurmukhi | Aliases | When | Host, where, size | Essential vendors | Nice to have |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Roka / Thaka | ਰੋਕਾ / ਠਾਕਾ | roka, thaka | 3 to 12 months out | Bride's family, home or restaurant room, 15 to 60 | Mithai and dry-fruit boxes, thaal decoration, small caterer, photographer (1 to 2 hrs) | Florist, home decor, outfits |
| 2 | Chunni Chadai + Kurmai / Sagai | ਚੁੰਨੀ ਚੜ੍ਹਾਈ / ਕੁੜਮਾਈ / ਸਗਾਈ | chunni, kurmai, mangni, ring ceremony (ਮੁੰਦਰੀ) | 2 weeks to 6 months out | Bride's family (chunni), groom's family (traditional kurmai at gurdwara); home, restaurant or hall, 50 to 300 | Hall or restaurant, caterer, decor (small stage), photographer/videographer, DJ | Dhol, mehndi, makeup, jewellery, boutique, mithai |
| 3 | Saha / card distribution | ਸਾਹਾ / ਕਾਰਡ ਵੰਡਣਾ | | 3 to 8 weeks out | Each side | Printed invitations, video/e-invite designer, mithai boxes | |
| 4 | Akhand Paath / Sehaj Paath + Bhog | ਅਖੰਡ ਪਾਠ / ਸਹਿਜ ਪਾਠ / ਭੋਗ | paath, bhog | 48 hrs, bhog Saturday morning before T | Each side; gurdwara or home (house becomes veg and alcohol-free), 50 to 250 at bhog | Gurdwara or paathi Singhs, ragi jatha, langar sewa or halwai, tent + floor seating (home) | Sound system, photographer, rumalla supplier |
| 5 | Ladies Sangeet + Dholki | ਲੇਡੀਜ਼ ਸੰਗੀਤ / ਢੋਲਕੀ | sangeet, dholki | T-3 to T-1, often merged with mehndi | Each side; home or hall, 50 to 250 | Hall (if not home), DJ, dhol, caterer, decor, photo/video | Dholki singers, choreographer, live singer, lighting, bartender, makeup, photo booth |
| 6 | Mehndi | ਮਹਿੰਦੀ | mehndi, mehendi, henna | T-2 or T-3 | Bride's side; home or hall, 40 to 200 | Mehndi artist(s), decor (stage, marigold, cushions), DJ or dhol, caterer, photographer | Chaat and kulfi counters, tent and lighting, bangles, outfits, makeup |
| 7 | Maiyan / Vatna (H: Haldi; M: Mayun) | ਮਾਈਆਂ / ਵਟਣਾ / ਹਲਦੀ | maiyan, mayian, vatna, batna, haldi | T-3 to T-1, at home | Each side; backyard tent, 30 to 150 | Haldi/yellow decor (peerhi, phulkari), halwai or caterer (veg), photographer | Dhol, dholki singer, tent, outfits, chai service |
| 8 | Jaago | ਜਾਗੋ | jaago, jaggo, jago | Night of T-1 | Each side; hall (Valley) or backyard tent (Bay), 150 to 800, till 1 to 2 AM | Dhol (1 to 2), jaago pot and danda decor, caterer (meat and veg), photo/video | DJ with LED wall, live singer, bar supply, security, lighting and tent, bhangra team, drone, cold sparklers, makeup |
| 9 | Choora + Kalire | ਚੂੜਾ / ਕਲੀਰੇ | choora, chura, chooda, kalire, kaleere | Morning of T, 6 to 9 AM | Bride's side, home, 20 to 60 | Choora set seller, kalire maker, makeup and hair (arrives 4 to 6 AM), photo/video | Halwai for breakfast, short dhol, sweets |
| 10 | Sehra Bandi + Ghori | ਸਿਹਰਾ ਬੰਦੀ / ਘੋੜੀ ਚੜ੍ਹਨਾ | sehrabandi, ghori, ghodi, vaag pharai | 6:30 to 9 AM on T | Groom's side, home or hotel, 30 to 100 | Turban tier (pagg), sehra and kalgi, ghori with handler (Bay Area often swaps in a vintage car), dhol, photo/video | Breakfast halwai, decorated car, band baja |
| 11 | Baraat | ਬਰਾਤ | baraat, barat | 8:30 to 10 AM | Groom's side, approach to gurdwara, 100 to 400 | Dhol (2 to 4), party bus / limo, ghori | Band baja, bhangra team, drone, DJ truck |
| 12 | Milni | ਮਿਲਣੀ | milni | 9 to 10 AM | Bride's side hosts at gurdwara, 200 to 800 | Garlands (florist), nashta caterer or halwai, photo/video | Turban tying standby, gift trays |
| 13 | Anand Karaj + Laavan (H: Pheras; M: Nikah) | ਅਨੰਦ ਕਾਰਜ / ਲਾਵਾਂ | anand karaj, anand karj, laavan, lavan | 10:30 AM to 12:30 PM | Bride's side hosts and pays the donation; gurdwara, 200 to 800 | Gurdwara booking (donation, ragi, langar sewa), gurdwara-experienced photographer/videographer, bridal makeup (early call), bridal outfit | Florist (gurdwara-approved only), live stream for relatives abroad, turban tier, chunni |
| 14 | Langar | ਲੰਗਰ | langar | After the ceremony | Gurdwara kitchen or approved halwai | Langar caterer, gurdwara | Tent and chairs, sound |
| 15 | Viah di roti (Valley pattern: bride's-side lunch/dinner on T) | ਵਿਆਹ ਦੀ ਰੋਟੀ | | 1 to 4 PM or evening | Bride's side, hall, 300 to 1,200 | Hall, caterer, DJ, decor, photo/video | |
| 16 | Doli / Vidaai | ਡੋਲੀ / ਵਿਦਾਈ | doli, vidaai, vidai, bidaai | 2 to 5 PM | Bride's side departure, groom's side welcome | Decorated car / vintage car / limo, florist (car decor), photo/video | Halwai at groom's home, sweets and favours |
| 17 | Reception | ਰਿਸੈਪਸ਼ਨ | reception | T evening (Bay) or T+1 (Valley), 6 PM to midnight+ | Groom's side; hall or hotel ballroom, 300 to 1,500 | Hall, caterer, DJ + LED wall + lighting, decor, photographer, videographer/cinematographer, makeup | Dhol (entrance), live singer, MC, bhangra/giddha team, bar service and bartenders, security, valet, cake, photo booth / 360, cold sparklers, drone, limo, hotel blocks and shuttle, invitations, favours |
| 18 | Pag Phera / Muklawa | ਪਗ ਫੇਰਾ / ਮੁਕਲਾਵਾ | pag phera, muklawa | T+1 to T+3 | Bride's side, home or restaurant, 10 to 40 | Restaurant or caterer, sweets | Small photo |
| 19 | Whole wedding (not an event; a home card) | ਪੂਰਾ ਵਿਆਹ | | | | Wedding planner, invitations, outfits, jewellery, makeup, turban tying, priest/granthi, hotel blocks | Insurance, registry, travel agent |

H additions as separate rows under culture = Punjabi Hindu: Sagan/Tikka, Mata ki Chowki / Jagrata (needs a bhajan mandali), Ganesh Puja, Varmala, Pheras with pandit and mandap, Griha Pravesh; muhurat drives dates. M additions under culture = Punjabi Muslim (script may be Shahmukhi, so store `script` per culture): Mangni, Dholki nights, Mayun, Nikah, Rukhsati, Walima; halal only, no alcohol, Ramadan and Muharram blackouts.

Sikh weddings have no astrology. Never show "auspicious date" content to Sikh users; make it a per-culture flag.

### Vendor category taxonomy (grouped; all stored with English, Gurmukhi and search aliases)

**Venues:** Gurdwara (ਗੁਰਦੁਆਰਾ) · Banquet hall / marriage palace (ਬੈਂਕੁਇਟ ਹਾਲ) · Hotel ballroom · Restaurant private room · Outdoor: winery, farm, ranch · Community centre / fairgrounds · Mandir / Masjid (H/M) · Backyard tent, pandal, flooring, heaters and misters (ਟੈਂਟ)

**Food:** Punjabi caterer (ਕੇਟਰਿੰਗ, aliases: catering, khana) · Halwai for home functions and langar-style (ਹਲਵਾਈ) · Nashta / chai service · Live counters: chaat, tandoor, jalebi, paan, golgappa · Mithai, ladoo, dry-fruit boxes (ਮਿਠਾਈ) · Cake and desserts · Bar service, licensed bartenders, alcohol supply (shown only under jaago and reception, never near gurdwara, paath or maiyan)

**Music and performance:** Dhol player (ਢੋਲੀ, aliases: dhol, dholi, dhol wala) · Punjabi DJ with lighting and MC (ਡੀਜੇ) · Live singer / band · Dholki / ladies sangeet singers · Bhangra / giddha team · Sangeet choreographer · MC / host (Punjabi + English)

**Religious:** Ragi / kirtan jatha · Paathi Singhs · Granthi for home or hall Anand Karaj · Pandit / jotshi (H) · Imam / nikah khwan (M) · Bhajan mandali (H). Copy tone is "request seva" and "donation guidance", never "price".

**Photo and video:** Photographer (ਫੋਟੋਗ੍ਰਾਫਰ) · Videographer / cinematographer · Drone · Live streaming (relatives in Punjab, Canada, UK) · Photo booth / 360 booth

**Decor:** Decorator: stage, entrance, mandap, backdrop (ਸਜਾਵਟ) · Florist: milni garlands, car flowers, palki flowers (ਹਾਰ / ਫੁੱਲ) · Lighting, uplighting, LED wall, dance floor · Rentals: chairs, tables, linens, peerhi, floor seating, restrooms, generators · Jaago pot (gaggar) and danda decoration · Thaal / gift tray / nanki chhak packing · Cold sparklers (licensed operators only) · Signage and neon

**Beauty:** Bridal makeup and hair (ਮੇਕਅੱਪ) · Mehndi artist (ਮਹਿੰਦੀ ਵਾਲੀ) · Turban tying (ਪੱਗ, aliases: pagg, pagri, dastar, sehra) · Groom grooming / barber

**Attire and jewellery:** Bridal boutique: lehenga, suits, chunni sets (ਬੁਟੀਕ) · Groom wear: sherwani, kalgi, jutti · Tailor / alterations (ਦਰਜ਼ੀ) · Jewellery: 22k, artificial, choora, kalire (ਗਹਿਣੇ / ਸੁਨਿਆਰਾ) · Phulkari, dupattas, rumals

**Transport:** Ghori with handler (ਘੋੜੀ ਵਾਲਾ) · Vintage / exotic car, limo, party bus · Guest shuttle / charter bus · Valet and parking

**Stationery:** Printed invitations (India or local; Gurmukhi typesetting is a differentiator) · Digital and video invites for WhatsApp · Favours, welcome bags, thank-you cards

**Services:** Wedding planner / day-of coordinator · Security guards (most halls require them when alcohol is served) · Cleaning / teardown crew · Hotel room blocks · Permits and event insurance · Travel agent · Kids entertainment

Vendor tags used as filters and cultural safety: `veg_only`, `serves_halal`, `serves_jhatka` (not interchangeable; a common caterer mistake), `alcohol_ok`, `gurdwara_experienced`, `female_staff_available`, `punjabi_speaking`, `home_based` (hides street address), `travels_to_regions[]`, `multi_day_packages`, `byo_alcohol_allowed` (halls), `dhol_allowed_on_premises` (gurdwaras and halls), `interfaith_ceremony_policy` (gurdwaras). Never collect, infer or filter by caste; never create a "dowry" category ("nanki chhak", "trousseau", "thaal" are fine).

### Budget reality (2025 to 2026 NorCal, Punjabi-community vendors; use for seeded price bands, labelled "founders' estimate")

| Category | Yuba City / Valley | Sacramento | Bay Area |
| --- | --- | --- | --- |
| Gurdwara: donation + ragi + langar sewa | $1,500 to $5,000 | $2,000 to $6,000 | $2,500 to $8,000 |
| Indian-owned hall, food included, per plate | $40 to $75 | $55 to $95 | $80 to $150 |
| Hotel ballroom, per plate | $90 to $150 | $110 to $180 | $150 to $260 |
| Backyard tent package | $1,500 to $6,000 | $2,000 to $7,000 | $3,000 to $10,000 |
| Punjabi caterer, per head | $16 to $30 | $20 to $38 | $28 to $55 |
| Dhol, 2 hours | $400 to $700 | $450 to $800 | $500 to $1,000 |
| Punjabi DJ per event | $1,200 to $3,000 | $1,500 to $3,500 | $2,000 to $5,000 |
| Photo + video, 3 to 4 days | $5,000 to $12,000 | $6,000 to $15,000 | $9,000 to $25,000 |
| Reception decor | $4,000 to $15,000 | $5,000 to $20,000 | $10,000 to $50,000 |
| Mehndi artist, bridal | $250 to $600 | $300 to $800 | $400 to $1,200 |
| Bridal makeup + hair, per look | $350 to $800 | $400 to $1,000 | $600 to $2,000 |
| Turban tying, per turban | $50 to $100 | | $75 to $150 |
| Ghori with handler, 2 hours | $500 to $1,000 | $600 to $1,200 | $700 to $1,500 |
| Bar (bartenders + self-supplied alcohol), 600 to 1,000 guests | $2,000 to $8,000 | | $4,000 to $15,000 |
| Security, per guard per hour | $45 to $80 | | |

Whole-wedding totals, both sides, excluding jewellery and clothes bought in India: modest $30k to $60k; typical Yuba City $90k to $200k; Sacramento $70k to $160k; Bay Area $120k to $300k, hotel and winery weddings $250k to $600k. Bride's side traditionally pays the gurdwara day; groom's side the reception; each side pays its own paath, sangeet, maiyan and jaago.

---

## 4. How it looks

### The feel, in one paragraph

Open it and you see a cream page, not white, with a deep maroon primary colour (the red of a bridal lehenga and the choora) and marigold used only as small fills on icons and badges. The home screen is a vertical list of big event cards, each with a real photo from a NorCal Punjabi wedding: a lit jaago pot, mehndi hands, a gurdwara dome silhouette. Every event and category name appears in both scripts, English on top and Gurmukhi below (or the reverse in Punjabi mode). Text is large: body 17 to 18 point, buttons 56 tall. There is one main action on every screen. Nothing scrolls sideways except photo rows. A 60-year-old who has watched her kids use Instagram already knows where things are on a vendor profile, but there are no likes, followers or comments, and price and service area sit above the fold. It should feel like a well-made community directory that happens to be beautiful, not a wedding blog.

### Three directions considered, one recommended

| | A: Clear Ivory (modern minimal, emerald accent) | **B: Phulkari (warm, cream + maroon + marigold)** | C: Editorial Ink (paper, serif, antique gold) |
| --- | --- | --- | --- |
| Reads as | A calm utility (a quieter Airbnb) | "Ours" at first glance; a vendor's screenshot looks like an invitation | A wedding magazine; investors and photographers love it |
| Elders | Highest legibility, but reads as "an app for white weddings" | Cream is easier on older eyes than white; Mukta Mahee is the Gurmukhi they already read on WhatsApp and Android | Thin icons, hairlines and serif Gurmukhi fail elders |
| Verdict | Borrow its discipline | **Recommended** | Reject for this audience |

**Recommendation: B built on A's discipline.** One primary action per screen, no carousels, hairline separators, short motion. Phulkari diamond motif appears in exactly three places (app icon, empty-state illustrations, a thin stripe under the home header) and nowhere else, so it never looks like a sweet-shop flyer. No religious symbols as UI decoration (no Khanda, no Ik Onkar, no scripture imagery); Anand Karaj gets a gurdwara-dome silhouette.

### Tokens (all contrast ratios computed, not guessed)

| Token | Hex | Notes |
| --- | --- | --- |
| bg (cream) | `#FFF9F0` | page |
| surface | `#FFFFFF` | cards and sheets |
| text | `#2B1A14` | 15.9:1 on cream |
| text-2 | `#6B5A52` | 6.3:1 |
| primary (maroon) | `#8A1C30` | buttons, active tab, links; white on it 9.2:1 |
| primary-tint | `#F7E6E9` | selected chips |
| accent (marigold) | `#F0A030` | fills only, never text (2.05:1 on cream) |
| kesari (text-safe saffron) | `#A8500A` | "Founding vendor" text |
| mehndi green | `#3D6B33` | success, "open on your date" |
| verified teal | `#1F6F5F` | verified badge |
| error | `#B3261E` | |
| Dark mode (Phase 8) | bg `#17110F`, primary button `#B8354E`, marigold `#F2B04A` | warm dark, not black; parents keep phones in light mode, so light-only until Phase 8 |

### Type

- Latin: **Nunito** (rounded, friendly, weights 200 to 1000). Gurmukhi: **Mukta Mahee** (the Android system Gurmukhi on many phones; familiar). Alternative if you want one designer for both scripts: Anek Latin + Anek Gurmukhi.
- Scale: display 32, title 24, heading 20, body 17 (18 for bios), label 15, caption 13. Body weight 500, not 400; 400 looks grey on cream to older eyes.
- Gurmukhi runs about 8 percent bigger at the same nominal size and needs line-height 1.6 or higher, or the vowel marks above and below (ਿ ੀ ੇ ੈ ੋ ੌ ੁ ੂ) clip on Android. Set `lineHeight` explicitly on every Text that can hold Gurmukhi and keep `includeFontPadding` on.
- Never uppercase, letter-space or italicise Gurmukhi (no case exists). Punjabi strings run 20 to 40 percent wider: every button, chip and tab label uses `minHeight`, never fixed height, and allows two lines.
- Digits, prices, phone numbers and distances stay Latin in both languages, with tabular figures.
- In-app text-size switch (Default / Large / Extra large) in Profile, because elders rarely find the OS setting.

### Components (sizes in points)

- **Tap target** 48 minimum; **primary button** 56 tall, full width, radius 14; chips 44 tall pills that wrap into rows (no horizontal-only chip scroll: elders miss offscreen chips).
- **Event card (Home):** full width, minimum 96 tall (132 with a photo band), photo left or as background with scrim, event name 20/700, other script 16 below, third line "9 vendor types · 42 vendors", chevron right. Order is ceremony order, never alphabetical.
- **Category tile (Event page):** 2-column grid, icon in a cream circle, bilingual name, count "9 near you".
- **Vendor card (results, saved):** 3:2 cover with a 44×44 heart top-right and text badges bottom-left (Verified, Founding vendor, Travels to you, video glyph); name 18/700 (2 lines); "Dhol · Tracy, CA · 31 mi"; "From $450 / event" in bold text; optional chip "Speaks Punjabi". No Call button on cards (prevents pocket-dials and keeps cards calm).
- **Action row (profile):** four to five equal circles with a label under each: Call · Text · WhatsApp · Instagram · Directions (or "Area" for home-based vendors). Call opens a confirm sheet showing the number.
- **Sticky bottom bar (profile):** Save (outlined, 40 percent) + "Ask about price & date" (primary, 60 percent).
- **Icons:** 24px grid, 2px stroke, outline inactive, filled selected; custom Punjabi glyphs drawn to the same grid: dhol, jaago pot, pagg, choora, kalira, mehndi cone, ghori, harmonium.
- **Event icons (duotone with a tint blob):** Roka shagun envelope · Chunni draped dupatta · Kurmai rings · Paath canopy (no scripture) · Mehndi palm with paisley · Maiyan bowl with paste · Jaago pot with three flames · Sangeet dhol · Choora bangles with kalira · Sehra veil on turban · Baraat decorated mare · Milni crossing garlands · Anand Karaj dome · Reception chandelier · Doli palanquin.
- **States:** skeletons shaped like real content (never a lone spinner over a list); empty states with a line-art illustration, one sentence and one action; inline error cards with Retry; a yellow offline strip "No internet, showing what we loaded earlier".
- **Motion:** 160 to 320 ms, no bounces, Save heart pops once, inquiry success is one marigold check drawing in. Haptics only on chip select, Save on, inquiry sent, account created.
- **Copy tone:** second person, plain words, "Sat Sri Akal" in prefilled messages, "Ask about price & date" instead of "Send inquiry", "Save" (ਸੰਭਾਲੋ) not "Bookmark", every error says what to do next.

### Accessibility

48-point targets, 4.5:1 text contrast everywhere, font scaling to 200 percent without truncation (test at iOS AX3 and Android 200 percent on a 360-wide phone and an iPhone SE), sentence-style screen reader labels on every control ("Call Sukhi Dhol Crew, 530 555 0101"), `accessibilityLanguage="pa"` on Punjabi strings, colour never the only signal (selected chips get a check, verified has a word), Reduce Motion honoured.

### App icon and store screenshots (working brand)

Icon: rounded maroon square with four marigold diamonds forming one larger diamond, a cream gap between them leaving a small ring of negative space. Reads as embroidery at 60pt and a jewel at 20pt. Screenshots (six): "Every vendor. Every event." (Home) · "Dhol, mehndi, hall, near you" (results with map toggle) · "See their real work" (profile) · "One tap to call or text" (call sheet with number) · "Ask in 30 seconds" (inquiry form) · "Also in Punjabi / ਪੰਜਾਬੀ ਵਿੱਚ ਵੀ" (Home in Punjabi; the frame families forward to each other).

---

## 5. Screen by screen (user side, Phase 3/4 build)

Legend: **[Plan]** already in PROJECT_PLAN.md · **[Add]** not in the plan, cheap, recommended for Phase 3/4 · **[Ph8]** a slot for a Phase 8 item, do not build now.

### Navigation

**Bottom tabs** (height 64 plus safe area, icons 26, labels always visible, 13pt minimum):

| Tab | English | Punjabi | Root screen |
| --- | --- | --- | --- |
| Home | Home | ਘਰ | S4 |
| Search | Search | ਖੋਜ | S8 |
| Saved | Saved | ਸੰਭਾਲੇ | S15 |
| Profile | Profile | ਪ੍ਰੋਫ਼ਾਈਲ | S16 |

Expo Router: each tab owns a stack. The vendor profile is a shared route pushed inside whichever tab opened it, so Back returns to where you came from. Inquiry form, auth, filters, gallery and the location sheet are modals presented over the tabs.

**Map of the app:**

```
Cold start → S0 Splash
  first launch → S1 Welcome + language → S1b Who are you planning for? (skippable) → S4 Home
  returning    → S4 Home, or the deep-link target

S4 Home ── event card ──→ S5 Event page ── category row ──→ S6 Results list ⇄ S7 Results map
S4 Home ── search bar ──→ S8 Search   ·   S4 ── location chip ──→ S22a Location sheet
S6/S7 ── Filters ──→ S8b Filters sheet
any list / deep link / QR ── vendor card ──→ S9 Vendor profile
S9 ── media tile ──→ S10 Gallery and video viewer
S9 ── Call / Text / WhatsApp / Instagram / Directions ──→ leaves the app
S9 ── Save (logged out) ──→ S13 Auth sheet → S14 Phone or email → code → About you → back to S9, save completes
S9 ── Ask about price & date ──→ S11 Inquiry form ── Send (logged out) ──→ S13/S14 ──→ S11 (draft kept) ──→ S12 Sent
S12 ── "Ask 2 more" ──→ S11 prefilled for another vendor
S15 Saved ── segment ──→ S15b My Wedding setup → S15c Wedding board → S15d Slot detail
S16 Profile ──→ S17 Edit profile · S18 Notifications · S16c My inquiries · S16d Suggest a vendor · S16g For vendors · S19 Delete account
Deep links: /v/{slug} → S9 · /e/{event} → S5 · /c/{category}?near=… → S6 · /vendors → S16g · [Ph8] /w/{shareId} → shared board
```

### S0 Splash
Cream background, logo mark centred. Reads language, location and session from storage, warms the events and categories cache, routes. Maximum 600 ms. A deep link routes straight to its target; the first-launch language pick appears as a compact sheet over the target instead of blocking it.

### S1 Welcome + language [Plan] (one screen, not two)
Illustration band (line art of a dhol, a mehndi hand, a gurdwara dome; no stock white-wedding imagery) → headline "Every vendor for every event of your wedding" → "Roka to reception. Northern California." → two large side-by-side cards **English** and **ਪੰਜਾਬੀ** (preselected from device locale; tapping one re-renders the whole screen live in that language so an elder sees the effect before committing) → primary "Start browsing" → link "I already have an account" → small Terms · Privacy line. No account is asked for here, ever.

### S1b Who are you planning for? [Add] (one tap, skippable)
Five full-width rows: My own wedding · My son or daughter · My brother or sister · A friend or relative · **I'm a vendor**. The last routes to S16g (free founding-listing lead capture): vendors will install the app to look at it, so catch them. Personalises copy lightly ("your son's jaago"), prefills the My Wedding role, and gives you a role split in analytics. Shown once; changeable in Profile.

### S4 Home, organised by event [Plan]
Top to bottom:
1. Header: wordmark left; right, a 48-tall pill toggle **EN | ਪੰ** (the fastest way for a mixed household to flip the phone between parent and child).
2. Location chip, full width: "Near Yuba City · 25 mi ▾"; unset: "Set your location to see distance ▾" with an accent border.
3. Search bar (a button styled like an input): "Search dhol, mehndi, halls…" → S8 with the keyboard up.
4. [Add] "Your wedding" strip only when My Wedding exists: "Jaspreet & Amrit · 142 days · 5 of 11 events have a vendor" → S15c.
5. **Browse by event** under three group headers, **Before the wedding · Wedding day · After**, as single-column full-width event cards (one decision per row, never a carousel). Order and grouping come from the `events` table. A final neutral card "Whole wedding: planners, invitations, outfits, jewellery, makeup". Link "See all categories A to Z" → S8 grid.
6. [Add] "Recently viewed" row (local storage, 5 items, works logged out).
7. [Add] "New this week" row (vendors created in the last 7 days; hidden if none). Quietly rewards vendors who list.
8. Footer: "Know a vendor who should be here? Suggest them" → S16d.

Pull to refresh; long-press an event card → "Add to My Wedding". Events are seeded and cached so the screen never shows an empty state. [Ph8]: a labelled "Sponsored" row at a fixed position; a "Plan my wedding with help" card (AI planner).

### S5 Event page [Plan]
Header image 200 tall with Back and Share (shares `/e/jaago`) → name 26 + other script 18 → two-line explainer ("The night before the wedding, family carries the lit jaago pot house to house with dhol and boliyan.") + "Read more" expanding to a short founder-written guide: typical timing, who hosts, what to book first, gurdwara rules where relevant. No competitor has this content and second-generation planners need it. → [Add] a tip strip on accent background: "Book dhol 2 to 3 months ahead; May, June, November and December weekends go first." → **Vendors you'll need**: rows 72 tall (icon in a circle, bilingual name, "9 near you", chevron), **Essential** first, then **Nice to have** (from `event_categories`). → "Also for this event" chips (Invitations, Planner, Outfits). → Sticky bottom secondary button [Add] "Add Jaago to My Wedding". A zero-count category still opens S6 (which shows the widen / travels-to-you / suggest empties). [Ph8]: one labelled "Recommended for Jaago" sponsored card; "Ask the planner about this event".

### S6 Results list [Plan]
Nav: Back · "Dhol / ਢੋਲ" · "Map" icon+label. Sticky row: location chip · "Filters (2)" · sort chip "Nearest ▾" (Nearest · Price low to high · Newest · Most contacted; [Ph8] Top rated · Most reliable). Result line "9 dhol players within 25 miles of Yuba City". Vendor cards as specified in section 4. Infinite scroll, 20 per page. Footer "You've seen all 9" + "Widen to 50 mi" + "Suggest a vendor".

Empty states: no location set → "Set your location or city to sort by distance"; none in radius → "No dhol players within 25 mi of Yuba City" + "Widen to 50 mi" + "Show vendors who travel to you (4)" + "Suggest a vendor"; none in category at all → cross-category suggestions. Offline → cached last page under the banner. Hearts open the auth sheet when logged out; everything else works without an account. [Ph8]: rating row, "Open on Jun 13" chip once a wedding date exists, labelled sponsored cards at fixed indexes.

### S7 Results map [Add: the plan has "sort by distance"; a map is the natural pair]
Full-screen `react-native-maps` with a "List" toggle. Pins are price pills ("$450") for exact-location vendors (halls, shops, gurdwaras). **Home-based vendors never get a precise pin:** a soft circle at coordinates rounded to the city centroid, labelled with the name only, legend "Approximate area". Clustering at low zoom. Bottom: a snapping carousel of compact cards synced with the selected pin, so nobody has to hit a small pin. "Search this area" after panning. Chip "Who travels to me" draws service-radius circles that cover the user's point. Light, desaturated map style so pins carry the colour.

### S8 Search + S8b Filters [Plan]
Search field 56 tall with a **mic button labelled "Speak / ਬੋਲੋ"** [Add: OS dictation now; server transcription with confirm chips later]. Before typing: Recent searches · Popular chips (Dhol, DJ, Mehndi artist, Photographer, Banquet hall, Caterer, Decor, Makeup, Gurdwara, Turban tying) · **All categories A to Z** as a 2-column grid of 96-tall tiles. While typing: suggestion rows under Categories · Events · Vendors.

**Matching [Add]:** a synonym table so parents' words work: dhol / dholi / dhol wala / ਢੋਲ · mehndi / mehendi / henna / ਮਹਿੰਦੀ · caterer / catering / khana / food · hall / banquet / venue / palace · pagg / pagri / turban / dastar · ghodi / ghori / horse · ragi / kirtan / jatha · sweets / mithai / ladoo · lights / tent. Free text with no category match → Postgres full-text plus trigram over name and bio, sorted by distance. Gurmukhi keyboard input is accepted directly.

**Filters sheet:** Category chips (multi) · Events served · Location (Use my location / City or ZIP / area-code chips) · Distance 10 / 25 / 50 / 100 / Any · Price starting at bands · switches: Verified only · Travels to me · Speaks Punjabi · Has video · Founding vendor · sticky "Show 23 vendors" with a live count.

### S22a Location sheet [Plan]
"Where should we look?" → "Use my current location" (→ S22b) → "City or ZIP" with autocomplete from a bundled NorCal list → quick chips **510 · East Bay / 408 · South Bay / 916 · Sacramento / 209 · Central Valley / 530 · Yuba City** (area codes are how the community describes geography; each maps to a centroid and 40 mi) → "Within 10 / 25 / 50 / 100 mi / Anywhere", default 25. Persisted locally, no account needed.

### S22b Location pre-permission [Add]
Shown before the OS prompt and only when the user taps "near me", never at launch. "Find vendors close to home. We use your location only to sort vendors by distance. We never share it and never save it." → "Allow location" · "Type my city instead". Denied → toast "No problem, type your city" and focus the city field. Rule for every permission: say what it does, what it does not do, and give the non-technical alternative in the same breath.

### S22c Notification pre-permission [Add]
Fires only after the first inquiry is sent or first save. "Want us to remind you? Three days after an inquiry we'll check whether the vendor replied, and we'll tell you when new vendors join for the events you're planning. No advertising." Phase 3/4 uses **local notifications only** (no server, no Apple/Google push credentials): the 3-day follow-up "Did Sukhi Dhol Crew reply? [Yes, booked] [Yes, still deciding] [No reply yet]" (stored; this is the seed of the vendor reliability data) and a weekly "3 new dhol players near Yuba City" only for saved or inquired categories.

### S9 Vendor profile, Instagram-style [Plan]
Top to bottom on a 390-wide phone:
1. **Cover** 4:3 (minimum 240 tall), Back left, Share and overflow "…" right as 48 circles on a scrim.
2. **Avatar** 88 circle overlapping the cover's bottom-left edge.
3. **Identity:** name 24/700 with a teal verified check; category chips (primary first); location line: home-based → "Based in Tracy, CA · Travels up to 60 mi" (no street, ever); exact-location → "1234 Mowry Ave, Fremont · Open in Maps"; "Speaks Punjabi, Hindi, English"; badges (Founding vendor · Travels to you · Verified).
4. **Fact strip** (replaces Instagram's posts/followers/following): `From $450 / event` | `Jaago, Sangeet, Reception +2` | `Punjabi · English`. Each cell tappable.
5. **Price block:** "Starting at $450 / event" + note ("2 dholis · 2 hours · travel free within 40 mi") + caption "Prices vary, ask for a quote".
6. **Action row:** Call · Text · WhatsApp [Add: many NorCal Punjabi vendors run their business on it] · Instagram · Directions (or "Service area" for home-based vendors, scrolling to the map circle).
7. **Sticky bottom bar:** Save + **"Ask about price & date / ਕੀਮਤ ਤੇ ਤਾਰੀਖ਼ ਪੁੱਛੋ"**. After sending it reads "Sent Sep 25 · Send again?" and is disabled for 24 hours with a "Call them" hint.
8. **Bio** 18pt, 4-line clamp + "Read more"; Punjabi bio shown in Punjabi mode only if the vendor supplied one (no machine translation).
9. **Fact chips** from the category schema ("Seats 700", "Outside catering OK", "Jhatka available", "2 dholis"). **Events they serve** chips → S5. [Add] **"Has worked at"** chips (Fremont Gurdwara, Sacramento Palace) → search by venue.
10. **Media grid:** 3 columns, square, 2pt gaps, video tiles with play glyph and duration, optional 2:1 featured video first, event filter chips above (All · Mehndi · Jaago · Reception) so a user can see "only their Anand Karaj work". "See all 34".
11. **Map card:** exact vendors → pin and address; home-based → circle and "Serves within 60 mi of Tracy · exact address shared after booking".
12. **Contact block:** phone printed in text (elders read it aloud to someone), email, Instagram handle, website.
13. [Add] **Similar vendors nearby** (same category, by distance). No dead ends.
14. Footer: "Report a problem with this profile" (wrong number / closed / not their photos) · **"Are you this vendor? Claim your profile"** (Phase 3/4: opens S16g prefilled; [Ph8]: real claim flow).
Overflow: Share · Copy link · **Show QR code** [Add] · Report.

Behaviour: Call → `tel:` after a confirm sheet showing the number; Text → `sms:` prefilled "Sat Sri Akal, I found you on <app>. I'm looking for a dhol player for a jaago on ___." (language-aware); WhatsApp → `wa.me`; Instagram → app link with web fallback; Directions → Maps chooser; Save → heart fills + "Saved · Add to an event?" picker so Saved is grouped from the first save; Share → S20. Every action logs an analytics event and a first-party counter (views, calls, texts, WhatsApp, Instagram, directions, saves, inquiries) that feeds the vendor's monthly stats.

How it differs from Instagram: no follower counts, likes, comments or DMs; the grid is curated and tagged by event and venue, not chronological; price and service area above the fold; contact is structured; no infinite feed; everything has a Punjabi label. The visual kinship (cover, avatar, three-cell strip, square grid) is deliberate so elders already know where things are.

[Ph8]: rating + "Photos | Reviews (23)" segment; "Check your date" card; "Responds in ~2 h" chip; premium autoplay cover video; later a "Book" button.

### S10 Gallery and video viewer
Full-screen black, Close X 48 top-left (always visible; no gesture-only exits), counter "3 / 24", Share. Horizontal paging, pinch and double-tap zoom. Video autoplays muted with a 72px play button and a 3-second "Tap for sound" pill, fat 8px scrubber for older fingers, pauses when swiped away. Captions 16pt on a scrim: "Sukhi Dhol Crew at a jaago in Yuba City · Shot by Amrit Studios" (the credit is tappable; see section 10).

### S11 Inquiry form [Plan: event type, date, guest count, message]
Full-height modal, keyboard-aware. Header: X (confirms discard if edited) · "Ask about price & date" · vendor mini-card.
1. **Which event?** chips, prefilled from the path you came by (Jaago if via the Jaago page), multi-select, includes "Whole wedding" and "Not sure".
2. **Date:** native picker (iOS wheel style, not a calendar grid; small calendar digits are hard for elders) + "Not sure yet" checkbox. Optional start time for dhol, DJ and photo categories.
3. **About how many guests?** chips: Under 50 · 50 to 100 · 100 to 250 · 250 to 500 · 500+ · Not sure.
4. **Where?** city or venue, prefilled with the user's city (vendors need it to quote travel).
5. **Message:** prefilled in the chosen language and regenerated as fields change until manually edited: "Sat Sri Akal, we're planning a jaago on Jun 13 in Yuba City for about 100 to 250 guests. Could you share your price and whether you're available? Thank you." (Gurmukhi version in Punjabi mode.)
6. [Add] **Add a voice note (30 s)**: a mother can speak Punjabi instead of typing. Uploaded to Storage, linked in the email. This single control removes the biggest elder barrier.
7. Your name · Your phone (prefilled, editable) · "How should they reply?" chips Call · Text · WhatsApp · Email.
8. Consent line: "We'll email your inquiry to Sukhi Dhol Crew with your name and phone. They reply to you directly. You get a copy."
Sticky "Send / ਭੇਜੋ".

Type-specific questions appear for certain categories (section 6): a hall asks about catering preference and baraat with ghori; a caterer asks veg / veg + non-veg / jhatka and which hall; a photographer asks which events on which dates.

**Logged out at Send:** the draft is kept (memory and AsyncStorage, keyed by vendor, 24 h) → auth sheet → returns to S11 with the draft intact and name and phone filled → tap Send once more. No retyping, ever.

**On send:** insert `inquiries` row → Edge Function emails the vendor (Phase 3/4: the founders' inbox) with reply-to set to the user, a copy to the user, BCC founders → auto-saves the vendor under the chosen event. Duplicate within 24 h → "You already asked Sukhi on Sep 25. Send again?" Failure → "Couldn't send. Your message is saved, try again" with the form kept. Offline → "You're offline, we'll keep your message".

### S12 Inquiry sent
Check animation → "Sent to Sukhi Dhol Crew" → "Most vendors reply within 1 to 2 days by call or text. A copy is in your email." → card **"Want a faster answer?"** with Call now and Text now (honest about how this community books) → [Add] card **"Compare prices: ask 2 more dhol players"** with two compact cards and one-tap Ask buttons that open S11 prefilled with the same event, date, guests and message → "Saved to Jaago in My Wedding · View" → "Done". On the first inquiry, S22c follows.

### S13 Auth sheet [Plan: signup only when saving or inquiring]
Bottom sheet, about 60 percent. Contextual title ("Save vendors to your wedding" / "Send your inquiry") → a one-line reason (mandatory; elders abandon unexplained sign-ups): "Create a free account so vendors can reply to you and your saved list stays on your phone." → primary **Continue with phone number** (Phase 3 reality: email code first; phone login needs the LLC for US SMS registration, see section 8) → Continue with email → small Apple · Google row (Sign in with Apple is mandatory on iOS the moment Google is offered) → "Not now" (browsing continues). One flow for new and returning users: no passwords, no separate login and signup screens.

### S14 Code → About you
Email (or phone) → six 56×64 code boxes, auto-advance, SMS and mail autofill, auto-submit on the sixth digit, "Resend code" with a 30 s timer. New users: **About you**: First name (required) · City (autocomplete; prefilled if location granted) · a 56-tall checkbox row with a 28px box **"I am 18 or older / ਮੇਰੀ ਉਮਰ 18 ਸਾਲ ਜਾਂ ਵੱਧ ਹੈ"** (required) · legal line → "Create account". On success the sheet closes and the pending action completes itself (the save happens, or S11 reappears with the draft). Three fields total, no passwords.

### S15 Saved [Plan: grouped by event] + My Wedding [Add]
Segmented control: **Saved vendors | My Wedding / ਮੇਰਾ ਵਿਆਹ**.

**Saved:** sticky headers "Jaago · 3", "Reception · 5", last "Not assigned yet · 2". Rows 96 tall: thumb, name, "Dhol · Tracy · 31 mi", "From $450", inline Call icon, overflow: Move to event · Add a note · **Mark as booked** (green badge; dims other candidates in that slot) · Share · Remove. Rows with inquiries show "Inquiry sent Sep 25". Notes render as a grey line ("Bibi ji said too expensive"), because that is how families actually decide. Logged out: "Sign in to see your saved vendors" (hearts are not stored locally when logged out; the interruption is the design).

**S15b My Wedding setup:** "Set up your wedding in 30 seconds": names (optional) · date (or "Not set" → "Help me pick", section 10) · **Which side? Bride's / Groom's / Both** (drives which events show, e.g. Ghori vs Choora; labels are renameable, internally Side A / Side B) · "Which events are you having?" checklist with the common set pre-ticked · per-event guest range chip and "At home?" toggle.

**S15c Wedding board:** header (names, date, countdown, progress "5 of 11 events have a booked vendor") → one section per chosen event in ceremony order → slot rows: "Dhol: 2 saved · none booked → **Choose**" / "Photographer: **Booked** Amrit Studios ✓" / "Caterer: nothing yet → **Find**" (Find opens S6 filtered to the category, the event and the event's city) → "Add another event" → sticky **Share plan**: Phase 3/4 generates a plain-text summary per event (booked vendor + phone, candidates, notes) with `/v/` links into WhatsApp, the thing families forward today, now structured. [Ph8]: a live `/w/{shareId}` link where relatives with the app see and edit the same board; the two-sides board; AI planner "Fill my empty slots".

Every slot says one of three words: **Booked / Choose / Find** (ਬੁੱਕ ਹੋ ਗਿਆ / ਚੁਣੋ / ਲੱਭੋ). It reads like the paper checklist a mother already keeps.

**S15d Slot detail:** candidates as cards with Call and Ask, "Mark booked", notes, "Find more", and [Add] **Compare** once there are 2+ candidates (section 10).

### S16 Profile and settings [Plan]
Logged out: a card "Create an account or sign in" with the reason, then rows available to everyone: Language · **Text size** (Default / Large / Extra large) [Add] · Location · Planning for · Help & contact (WhatsApp or text the founders, five FAQs) · Suggest a vendor → S16d · For vendors → S16g · Rate the app · About · Privacy · Terms · Version.
Logged in: header (initial avatar, name, "Yuba City · Planning for my son", Edit profile → S17) · **My inquiries (3)** → S16c (newest first; status chip Sent; [Ph8] Replied / Booked; follow-up answer if given; "Send again" after 24 h) · Notifications → S18 (master switch; Inquiry follow-ups · New vendors for my events · Tips & reminders) · the general rows · Log out · separated, red **Delete account** → S19.

### S19 Delete account [Plan: required by Apple]
Screen 1 lists what is removed (profile, saved vendors, My Wedding, inquiry history in the app) and the honest line "Vendors you already emailed keep that email." · "Prefer to keep your list? Log out instead." · optional "Share my saved list first" · red "Delete my account". Screen 2 confirms with a fresh code (prevents a grandchild deleting it by accident; no English typing). Edge Function with the service role deletes the auth user and cascades; Apple token revoked when the user signed in with Apple. Success → Home, logged out. No dark patterns.

### S16d Suggest a vendor [Add]
Vendor name · category · city · phone or Instagram · "How do you know them?" (We used them / Family or friend / Saw on Instagram) · note → `vendor_leads`. "We'll reach out to them and tell you when they're listed." Seeds the Phase 6 spreadsheet with real demand.

### S16g For vendors [Add]
"Free listings for our first 50 founding vendors. Families browsing by event find you for exactly the events you serve." + a lead form (name, business, category, city, phone, Instagram) + "Text us". Reached from S1b, S9 "Claim your profile", Profile, and `/vendors`.

### S20 Share a vendor and S21 deep links [Add]
Native share sheet with "Sukhi Dhol Crew, dhol player in Tracy, CA, from $450. Photos, videos and number: https://<domain>/v/sukhi-dhol-crew". The link opens S9 if installed, otherwise a **lightweight web landing page** with OpenGraph tags (cover, name, city, price) so WhatsApp and iMessage show a rich preview; without a preview a bare link looks like spam to elders. The landing page has Call, "Open in app" and "Get the app". Each founding vendor gets their `/v/` link and a "Find us on <app>" story sticker for their Instagram bio: vendor Instagram becomes the install channel. Universal links need the Phase 5 domain; the custom scheme works from day one.

### S23 Error and not found
"Something went wrong on our side, it's not you." + "Go to Home" + "Report this". Not-found: "That vendor isn't listed anymore" + similar vendors.

### Walkthrough: a mother of the groom finds a dhol player for the jaago

Harjit Kaur, 58, Yuba City, iPhone, reads Gurmukhi comfortably and English slowly. Her daughter installed the app but Harjit is alone on the sofa. First launch, no account.

1. Tap the icon. Welcome appears with ਪੰਜਾਬੀ already highlighted from her phone's locale; she taps it anyway (2) and the screen flips to Gurmukhi in front of her. "Start browsing" (3).
2. "Who are you planning for?" → "My son or daughter" (4).
3. Home. She scrolls past Roka, Mehndi, Sangeet and stops at the Jaago card: the photo shows a lit jaago pot, so no reading is needed (5).
4. Jaago page. First essential row: "ਢੋਲ / Dhol · 9 near you" (6).
5. Results, sorted by newest because no location is set. She taps the location chip (7) → "Use my current location" (8) → the Punjabi pre-permission page explains it only sorts by distance (9) → iOS prompt, "Allow While Using App" (10). The list re-sorts: "Sukhi Dhol Crew · Dhol · Tracy · 31 mi · From $450 / event · Speaks Punjabi".
6. She taps the card (11). Profile: cover of two dholis at a jaago, phone number printed, "Based in Tracy · travels up to 60 mi", starting price, five labelled buttons. She taps a video (12), taps for sound (13), watches 20 seconds, taps X (14).
7. "Ask about price & date" (15). Jaago chip already selected, message already written in Punjabi. She spins the date wheel to 13 June (16, 17), taps "100 to 250" (18), holds the microphone (19) and says in Punjabi "our son's jaago is in Yuba City, we need two dholis", taps Send (20).
8. Auth sheet: "Create a free account so the vendor can reply to you." Continue with email (21), types her email, "Send code" (22), the code autofills (23). About you: types "Harjit", city is already Yuba City, ticks 18+ (24), "Create account" (25).
9. The form comes back exactly as she left it. Send (26).
10. "Sent to Sukhi Dhol Crew." Under it: "Call now" and "Ask 2 more dhol players" with two cards. She taps Ask on Punjab Beats (27) and Send (28); everything was prefilled.

26 taps from icon to first inquiry on a cold first launch including language, role, location permission and account creation. A returning, logged-in user with location set does the same job in about 12 taps. The second inquiry is 2 taps. Today the same job is a WhatsApp message to the family group, a day's wait, a bare phone number, a saved contact, a call, a request for photos, a request for a price.

Phase 4 acceptance target: 12 taps or fewer logged in, 27 or fewer cold, no typing except email or phone and first name.

### Where Phase 8 items slot in

| Phase 8 item | Screens | Placement |
| --- | --- | --- |
| 1. Reviews and ratings | S9, S6, S16c | Rating under the name; "Photos | Weddings (12)" segment; "Write a review" only for vendors the user inquired with or marked booked |
| 2. Vendor accounts | S13/S14, S9, S16 | Same code login with a `vendor` role; "Claim your profile" becomes real; Profile gets "Switch to business view" |
| 3. Availability calendars | S11, S9, S6/S7 | "Check your date" card; "Open on Jun 13" chips; greyed map pins |
| 4. Premium profiles | S9 | Autoplay cover video, 100 media, pinned highlights, packages |
| 5. Sponsored placements | S4, S5, S6 | Labelled cards at fixed positions, never mixed into the nearest-first order |
| 6. AI planner | S4, S15c | Entry card on Home; planner inside My Wedding filling empty slots from real listings only |
| 7 to 9. Expansion, other cultures | S22a, S4 | Region picker in the location sheet; culture switch swaps the event set (events are data already) |

---

## 6. Vendor listings by type

### The shared model

One `vendors` row per business with common fields; category-specific facts live in a `details` JSONB column validated by a per-category schema in the app, so adding a field for one category needs no migration and one component renders the fact chips with Punjabi labels from the `translations` table.

Common to every listing: name and optional Gurmukhi name, tagline, bio (optional Punjabi bio), categories (primary + up to 2), events served, base city, coordinates (city centroid when home-based), service radius (10 / 25 / 50 / 100 / all NorCal / will travel) and travel-fee note, `address_visibility` (public for halls, boutiques, jewellers, gurdwaras; city-only default for home-based; on request), contact routing (call number, text number, WhatsApp, email and honestly whether they check it, Instagram, website, preferred contact, office hours for halls, languages), pricing display (`hidden` / `starting_at` / `range` / `packages` / `contact`; unit per event, hour, person, plate, hand, turban, day; note such as "weekday discounts" or "community rates on request"), media (cover, photos and short videos each tagged with event, venue and photo credit), trust (status, badges, years in business, team size), provenance (founder-entered / claimed / self-signup, last verified, median response time).

**Action buttons** behave the same everywhere: Call (shows office hours for halls) · Text (prefilled) · WhatsApp (first-class, not an afterthought) · Instagram · Directions (only when the address is public; otherwise a small map with a service circle) · Save (then "Save to which event?") · Ask about price & date (the type-specific form, email with reply-to = user, CC user, BCC founders). Plus Share, "Suggest an edit / Report", and "Is this your business? Claim it".

**Inquiry base for all types:** events (chips) · date(s) (or "Not fixed: month/year") · guest band · event city or hall (autocomplete from halls in the app) · message · preferred contact · language. Then 2 to 5 type-specific questions, all chips and toggles, never long text.

### Banquet halls and venues (the deepest listing, because families pick the hall first)

**Fields.** Rooms (seated, standing, combined capacity; ceiling height; floor plan). Catering: in-house (yes / no / optional), outside catering allowed (yes / approved list only / no), approved caterers (linked vendor ids, confirmed both ways), outside-caterer requirements (insurance, kitchen fee), kitchen type, vegetarian-only kitchen toggle, tandoor allowed outdoors. Alcohol: policy (full bar / beer and wine / BYOB with corkage $ / dry), bartender required, security required ("1 guard per 100 guests, $X/hr"). Money: rental fee by day (Mon to Thu / Fri / Sat / Sun), per-plate minimum, minimum guests, minimum spend, peak months, deposit percent, cancellation policy, overtime, cleanup fee, service charge, what is included (tables, chairs, chiavari upgrade, linens, dance floor, stage, house sound, projector, uplighting, bridal suite, groom's room, coordinator). Timing: earliest setup, latest end, music curfew, same-day two events (Anand Karaj lunch plus evening reception is common), Sunday morning available. Baraat: ghori allowed on property, dhol outside allowed, staging area (lot / driveway / street permit), outdoor space. Effects and decor: cold sparks, low fog, open flame, ceiling draping, wall attachments, confetti, fireworks, decor restrictions, in-house decor, decor vendor restrictions. Stage and AV: stage size, dance floor size, LED wall, house sound OK for DJs, power. Logistics: parking spaces, valet, overflow, ADA, restrooms, nearest hotels and shuttle, distance to gurdwaras (computed from the curated gurdwara table, never typed), loading dock. Office: hours, tour booking (walk-in / appointment), contact person.

**Profile extras.** Fact chips ("Seats 700", "Outside catering: approved list", "BYO alcohol · corkage $500", "Ghori OK in lot", "Curfew 1 AM"). **"Real weddings here"**: an auto-gallery of every other vendor's photos tagged with this hall, filterable by event, so the hall's page fills with content it never uploaded. "Approved caterers (6)" and "Decorators who have worked here (11)" rows. **Book a tour** (inquiry variant with three preferred slots). **Rate card** (PDF or in-app table).

**Inquiry asks.** Events and dates with AM/PM slot; guest count; same-day lunch plus evening?; catering (in-house / bringing our caterer: name); alcohol yes/no; baraat with ghori and dhol?; tour request; budget band.

This is the page to build first for the November demo (section 13). "Can we bring our own caterer?" is the single most common booking dead-end in NorCal Punjabi weddings, and no product indexes it in either direction.

### Gurdwaras (informational, non-commercial)

Fields: office phone and hours, website, address (always public), parking; Anand Karaj booking process (steps, documents, how far ahead, donation guidance), requirements note, typical slots, max ceremonies per day, granthi language, explains ceremony in English; langar hall capacity, langar provided by (sevadars / family arranges / both), outside halwai allowed, seating; rules (head covering, no alcohol or meat, photography rules, decor rules, milni location, dhol in lot, ghori allowed, dress code); etiquette notes for non-Sikh guests (EN + PA); donation guidance (never "price"); `verified_by_office`, otherwise a banner "Community-submitted: confirm with the gurdwara office"; `interfaith_ceremony_policy` in the office's own words, no commentary.

Buttons: Call office · Directions · Website · Save. **No Text, WhatsApp or Instagram.** "Send inquiry" only if the office opted in; otherwise the button reads **"How to book"** and opens the steps. No ads, no sponsored anything, no bar or alcohol vendors surfaced anywhere near a gurdwara page.

### Everyone else (fields that matter, and what the inquiry asks)

| Type | Fields that decide the booking | Inquiry asks |
| --- | --- | --- |
| **Caterers** | Cuisines; dietary (veg-only kitchen / veg + non-veg / jhatka / halal / eggless / Jain); service styles; live stations (tandoor, chaat, dosa, jalebi, kulfi, chai, paan); per-plate veg and non-veg; kids price; minimum headcount; staff per 50 guests; tasting; menus per event; **approved at halls** (verified both sides); health permit; own warmers; home-event minimum; lead time; late-night service | Headcount; hall (warns if the caterer is not on that hall's list); veg / non-veg / jhatka; live stations; style; tasting |
| **DJs** | Genres (Bhangra, Bollywood, Punjabi folk, Top 40); MC included and MC languages; dhol included or partner dholi (linked); sound packages; lighting (uplighting, moving heads, cold sparks, CO2, LED wall, monogram); outdoor ceremony rig; hours included; overtime; setup time; screens; sangeet package; insurance; backup gear; sample mix links | Events and dates; hall; hours; baraat dhol?; MC in Punjabi?; lighting level; guests |
| **Dhol players** | Dholis count (solo / 2 / 3+); occasions (baraat, jaago, mehndi, reception entrance, gurdwara lot); per hour or per event; minimum hours; attire; travel radius; pairs with DJ; video clips | Events and dates; hours from/to; how many dholis; city |
| **Decor / mandap / stage** | Specialties (reception stage, mandap, palki decor subject to gurdwara rules, mehndi and jaago village theme, home decor, car decor, entrances); fresh vs silk; inventory highlights (thrones, chandeliers, draping, LED backdrops, phulkari props, jaago pots, charpai sets); packages per event; setup hours; venues worked (auto from tagged photos); minimum spend; delivery radius | Hall (they check restrictions); theme and colours; stage / mandap / tables / entrance; tables count; budget band; up to 3 inspiration photos |
| **Photographers and videographers** | Photo / video / both; style; packages (hours, shooters, events, deliverables); drone; same-day edit; 48-hour teaser reel; film lengths; 4K; albums; delivery weeks; raw files policy; second shooter; multi-day discount; travel; destination (Punjab, Canada, UK); **live streaming**; portfolio grouped by event and venue | Which events on which dates (a matrix); photo/video/both; hours per event; drone; same-day edit; live stream; deliverable priority; budget band |
| **Mehndi artists** | Bridal pricing (hands / hands + feet / full arms and legs); guest per-hand pricing; minimum guests or hours; styles; natural cone, no PPD; bridal hours; team size for 100-guest nights; travels to home or studio; travel fee after N miles; trial; groom mehndi | Bridal date and party date; guests wanting mehndi; hours; at home or hall; style; coverage |
| **Makeup and hair** | Services (bridal makeup, hair, draping, dupatta setting, airbrush); packages (single look / Anand Karaj + Reception / all events); trial price; family per person; **early-morning fee** (Anand Karaj means 4 to 6 AM calls); on location; travel; touch-up stay rate; team size (how many ready by 8 AM); deeper skin tone experience; groom grooming | Events, dates and ready-by times; how many people; looks; location; trial; hair; draping |
| **Turban tying (pagg)** | Styles (Patiala shahi, Morni, Wattan wali, Dumalla, Nok wali, Chand tora); per turban; group pricing for 10+ baraatis; pre-tied available; cloth supply; colour matching; early morning; travel; starching; kalgi and sehra setup; time per turban | Date and ready-by; groom plus how many; style; pre-tied?; location; cloth provided? |
| **Boutiques, lehenga and sherwani rental** | Buy / rent / custom; showroom (public); appointment only; price ranges; custom lead time (India import); alterations; sizes; rental includes; deposit; designers; accessories (kalire, jutti, pagri sets, sehra); men's sets; family discount; lookbook by event | Buy or rent; who; events; wedding date (lead-time warning); budget; appointment slots |
| **Jewellery** | Types (bridal sets, kundan, 22k, artificial, choora, kalire, kalgi); sale / rental; store address; price ranges; deposit; customisation; certification | Sale or rental; items; events; date; budget; appointment |
| **Sweets and desserts** | Products (ladoo boxes, pinni, panjiri, barfi trays for milni, jalebi station, kulfi cart, custom cakes); custom packaging (names, date); minimum order; lead time; per box or per lb; delivery radius; eggless; permit | Event and date; items and quantities; packaging text; pickup or delivery |
| **Invitations** | Formats (boxed cards, scroll, laser-cut, e-invite, video invite); **Gurmukhi typesetting**; motifs; per card; minimum; lead time; proofing; extras (shagun envelopes, menus, welcome signs) | Print / digital / video; quantity; events; languages; date needed |
| **Ghori, cars, limos, party buses** | Horses count, handler, decoration, minimum hours, insurance (halls ask), venue restrictions, weather policy, band baja partner; vehicles with capacity, hourly, minimum hours, chauffeur, car decor allowed, dhol on bus allowed, alcohol policy, typical routes | Date, pickup time, route; passengers; vehicle; hours; decoration |
| **Live singers and bands, dholki singers, bhangra teams, choreographers** | Genres; group size; sound included; set lengths; song list; per set or per event; travel; pairs with DJ; video; for choreographers: styles, session format (studio / home / Zoom), package pricing, lead time, day-of coordination | Event and date; sets; genre; sound; guests; for choreographers: performances count, group sizes, weeks of rehearsal |
| **Ragi jathas, paathi Singhs, granthis, pandits, imams** | Type; services (Sukhmani Sahib, Akhand Paath 48h, Sehaj Paath, kirtan at home, ardaas, samagri list); languages; explains in English; members; own instruments and sound; travel; donation guidance shown as "discuss directly" unless the vendor opts to show a range; audio samples | Ceremony; date and time; home or hall; attendees; English explanation needed |
| **Florists, lighting and stage production, photo booths, kids entertainment, planners** | Products and packages, minimums, lead time, delivery radius, setup; planners: service levels (full / partial / month-of / day-of per event), Sikh and Punjabi wedding experience, budget range handled, consultation | Event and date; items; venue; guests; budget band; planners: planning stage, service level, consultation slots |

Categories the plan does not list but the market needs: halwai and home-event cooks (tandoor at the house for maiyan and jaago), chai and paan carts, bartenders, security, valet, tent and chair rental, restroom trailers, hotel blocks and shuttles, live-streaming crews, trousseau and shagun-tray packing, cold-spark specialists, bhangra teams, tailoring, lehenga preservation, travel agents, civil officiants.

---

## 7. The vendor's experience across phases, and the founders' admin

### Phase 3/4: founders enter sample vendors

Tables: `vendors`, `vendor_categories` and `vendor_events` (many-to-many), `vendor_media`, `vendor_packages`, `vendor_links` (worked_with / approved_at, with `confirmed_by_both`), `gurdwaras` (curated), `translations`, `vendor_private` (email, exact address, owner notes: no API access at all). Entry path: the Supabase table editor for text plus `scripts/seed-vendors.ts` that reads a CSV whose columns mirror the Phase 6 spreadsheet, resizes photos into three WebP variants with a blurhash, uploads them and upserts by slug. The same script later ingests real founding vendors, so it is not throwaway work. Sample vendors carry `is_sample = true` so they can be bulk-hidden in Phase 6. Include deliberately awkward samples: no photos, a 40-character name, home-based, no email, Punjabi-only bio, a 100-mile radius.

### Phase 6: founding-vendor onboarding is concierge, not self-serve

A DJ in Manteca will not fill a 40-field form. A founder does it with them, in person or on a WhatsApp call, in 15 minutes: business name (and Gurmukhi spelling if wanted), owner, categories, events served; which number for calls, which for texts, WhatsApp, whether they actually check email, Instagram, languages, hours; base city, radius, address visibility; the category fields read aloud as questions ("Do you allow outside catering? Jhatka?"); pricing display choice (many will pick hidden; offer "starting at" as the compromise and show them, once analytics exist, that priced listings get tapped more); photos and videos (the vendor WhatsApps 15 to 30 files, or the founder pulls from Instagram with the vendor scrolling and pointing; for each photo ask "who shot this?" and record the credit, because photographers are protective and credits build the worked-with graph for free); "worked with" and "approved at" lists; two or three past clients for vouches (section 10); signed consent.

**Consent form** (a web page on the domain; e-sign = typed name + checkbox + timestamp + IP; PDF stored; plain English with a Punjabi summary): non-exclusive licence to display name, logo, photos, videos and info in the app, website and marketing (marketing opt-out); vendor confirms photo rights or photographer permission and agrees to credits; permission to forward inquiries by email, text and WhatsApp; accuracy and duty to notify changes; removal within 7 days on request; founding terms (free base tier for life, Plus free in year one, no lead guarantee, no commission, no paying for placement, no soliciting only happy clients for reviews); reviews may appear later with a right to reply; takedown contact.

**What the vendor gets immediately:** the live `/v/` link, a numbered "Founding #17" badge, an Instagram story graphic with QR, a printed QR table tent for halls, boutiques and mithai counters, and a **concierge WhatsApp number** to text edits ("change my price", "add these photos", "I'm booked Jun 13") that founders apply within 24 to 48 hours. This stays a supported edit path even after Phase 8 because half the vendors will never open an editor.

**Inquiry delivery in Phase 6/7:** email alone will lose leads. Send every inquiry by email and, once the LLC exists and SMS registration is done, by SMS too, with the summary and a reply-to number; BCC founders so they can nudge non-responders; a one-tap "I replied" link stamps `first_response_at`, which seeds the response badge.

**Claiming later:** every founder-entered listing has a claim token. "Is this your business?" → enter the phone or email on file → code → account with role owner. No match → Instagram DM verification or a five-minute video call, approved in admin. Halls can add office staff as extra seats.

### Phase 8: vendor accounts

Lives in the same app as a **Business mode** toggle in Profile (no second app; vendors are also users planning their own kids' weddings), plus a web dashboard for halls with office staff and anyone who wants a desktop for bulk uploads, rate cards, calendars and billing.

- **Onboarding** (5 minutes, resumable): code login, business name, category, events served; base city and radius on a map; where inquiries should go; Instagram handle (app suggests profile picture and bio text; the vendor confirms); 5 photos via share sheet or camera roll; pricing display; submit → "Under review, usually live within 2 days" (founders approve all new listings in year one).
- **Profile editor** with a completeness meter ("60 percent, add packages to reach 80"); sections Basics · Contact · Service area · Details (the category schema as toggles and chips) · Pricing and packages · Photos and videos · Worked with · Availability · Badges and documents. Punjabi fields side by side with English. Every field shows "Visible to customers as: [preview]".
- **Media upload:** multi-select, auto-compress, reorder, set cover, tag event + venue + credit (credit autocompletes to listed vendors; tagging a photographer notifies them and adds the photo to their "Worked with" tab pending approval). Instagram import realistically means the OS share sheet (Instagram → Share → this app), since the consumer photo API is gone. Duplicate detection by perceptual hash. Moderation queue for new media.
- **Inquiry inbox:** New → Awaiting me → Waiting on customer → Booked / Lost. Card shows first name, event chips, date, guests, city or hall, time since received, and "Also asked 3 other DJs" (yes, show it; it motivates a fast reply). Reply in-app or one-tap "Reply by WhatsApp / Text / Call / Email" with context. Five saved templates with merge fields in EN and PA; three quick replies ("Available, let's talk" / "Not available that date" / "Back to you tonight"); voice-note replies; after-hours auto-reply. **Response badge** from median first-reply time over 90 days once 5+ inquiries: "Usually replies within an hour / same day / within 3 days"; no badge if slower.
- **Lead tracking:** status, notes, follow-up date, a date-conflict warning when two "Quote sent" inquiries share a date, season view ("23 inquiries · 9 booked"), CSV export.
- **Availability calendar:** tap dates as Booked / Held / Available; halls mark AM/PM; DJs and mehndi artists allow multiple per day; Google Calendar busy-day sync; iCal import. Customers see only green/grey, never client names; the profile shows "Available on your date" once My Wedding has a date.
- **Analytics** (phone: 4 tiles and one chart; web: full): views, unique viewers, saves, inquiries, taps by button, funnel, "which events brought viewers", "where viewers searched from", top photos, category benchmark, weekly digest by WhatsApp or email.
- **Tiers** (billed on the web via Stripe, never in-app, to stay clear of App Store IAP rules): **Free** (Founding = free for life): full profile, 20 photos, 2 videos, inbox, 3 templates, basic stats, calendar blocking. **Plus** (~$39/mo or $349/yr; free in year one for founding vendors): 60 photos, 8 videos, packages, unlimited templates, calendar sync, full analytics, weekly digest. **Pro** (~$129/mo; halls, photographers, planners): multi-seat staff, a labelled sponsored slot on chosen event pages capped per category and region, rate-card and floor-plan hosting, priority support. No commissions, no pay-per-lead, ever. That is the pitch against The Knot and WeddingWire.
- **Badges:** Founding Vendor (numbered, permanent) · Verified (code login + Instagram match + founder call or visit) · Licensed and Insured (documents uploaded, expiry tracked) · Quick Responder (computed) · Punjabi Speaking (self-declared; one report removes it) · Approved at N venues (both sides confirm) · Top Rated (Phase 8 reviews). Every badge tooltip states its criteria in EN and PA.

### Founders' admin (web; Supabase Studio plus a small admin, adding screens only when a task becomes weekly)

Approval queue (new listings, claims, edits as before/after diffs) · media moderation (auto-flags: low resolution, third-party watermark, duplicate hash, missing credit) · merge duplicates (by phone, Instagram, name similarity; old slug redirects) · inactivity rules (3 unanswered inquiries in 30 days or 2 bounced messages → WhatsApp nudge → "Slow to respond" label → hide after 90 days silent → retire after 180 with saves preserved) · reports · vendor CRM imported from the Phase 6 spreadsheet (who knows them, contacted, signed, consent version, tags, next follow-up) · inquiry monitor (all inquiries visible in year one; founders can nudge or step in) · taxonomy and translations editor · view-as for support · audit log and feature flags per environment · CSV import/export and bulk hide of samples.

### Designing for how these vendors actually behave

Phone-first and WhatsApp-first: every notification also goes to WhatsApp or SMS and every reply can happen there; the inbox exists so responsiveness can be measured, not to force a new habit. Instagram is the portfolio: share-sheet import, credit tagging and a "Find us on <app>" story graphic make posting here feel like an extension of Instagram, not a second job. Older Punjabi-first vendors: Gurmukhi labels, voice-note replies, big toggles, a human concierge line, founders doing edits on their behalf indefinitely. Halls have staff: web dashboard, seats, rate cards, tour booking, office hours on Call. Pricing shyness: "Starting at" plus off-season deals, and analytics that prove priced listings convert better. Seasonality: prompts in March and October to update calendar and prices.

---

## 8. Technical reality on Expo + Supabase

### Architecture in one paragraph

One Expo app (Expo Router, TypeScript, `expo-image`, TanStack Query for data and caching, a tiny Zustand store for UI state) talking directly to Supabase Postgres through the Data API with row-level security. Two server-side pieces only: Edge Function `send-inquiry` (email plus rate limits) and Edge Function `delete-account`. Reference data (cultures, events, categories, cities, zip codes) lives in tables and is cached on the device. Founders manage vendors through the table editor and the seed script; no admin panel until it is needed weekly. Development runs on local Supabase (Docker) so the dev database never pauses; one hosted project is production.

### How each planned feature is actually built

| Feature | Mechanism | Notes |
| --- | --- | --- |
| Bilingual names | One `jsonb` column `{"en": "Jaago", "pa": "ਜਾਗੋ"}`; client reads `name[locale] ?? name.en` | Half a day |
| 18+ | `profiles.adult_confirmed_at`, never a birthdate | |
| Hiding home-based addresses | Do not put them in an exposed row. `vendors.address_line` is NULL for home-based vendors; `vendors.location` is the **city centroid** (jitter can be triangulated; a centroid cannot). Street address, exact coordinates and vendor email live in `vendor_private`, which has RLS enabled, zero policies and no grants, so the API returns nothing even if a policy is later added to `vendors` by mistake | Column-level REVOKE works with PostgREST but is easy to regress; avoid |
| RLS | Reference tables readable by all; `vendors` where `status = 'published'`; `profiles` and `saved_vendors` own rows; `inquiries` own rows **select only, no insert policy** so the client cannot bypass the Edge Function's rate limits. Views use `security_invoker`. Run `supabase db advisors` before every migration | RLS mistakes show up as empty arrays, not errors; test every query as anon and as a second user |
| Location search | PostGIS point on `vendors`, one `search_vendors(lat, lng, category, event, max_km, q)` RPC using `ST_DWithin(location, point, greatest(service_radius, max_km))` so a Sacramento DJ who serves the valley shows up in a Stockton search; order by distance, then founding, then has-photos | PostGIS is overkill at 500 vendors but free |
| Geocoding | No external API: ship a `zip_codes` table from the US Census ZCTA gazetteer (California ~1,700 rows) and a hand-built `cities` table (~60 NorCal cities with aliases "SJ", "Sac", "Yuba"). Device location via `expo-location`, requested only on "Near me"; city label from the nearest zip row, not reverse geocoding | Zero keys, works offline after first load |
| Search synonyms | `vendor_categories.search_tags text[]` (`{dhol, dholi, drummer, ਢੋਲ}`); free text falls to full-text plus `pg_trgm` | This is the whole "Punjabi search" solution; nobody will type Gurmukhi |
| Media | Public bucket `vendor-media`; the seed script pre-generates 400w / 1080w / 1600w WebP with `sharp` plus a blurhash (Supabase image transforms are Pro-only). `expo-image` with disk cache and blurhash placeholder; `FlashList` grid; never load full-size in a grid. Video: cap 3 per vendor, 60 s, 1080p MP4 ≤ 25 MB with a poster; `expo-video` muted autoplay when on screen | A profile view is ~500 KB; Free egress covers ~10,000 views a month |
| Inquiries by email | Edge Function verifies the JWT, checks the profile is complete and 18+, rate-limits (1 per user per vendor per 24 h → 409 with the previous timestamp; 5/hour, 15/day per user; a global daily cap in `app_config` set to 90 while on Resend Free's 100/day, alert at 80), reads the vendor email with the service role, sends via **Resend** (from `inquiries@mail.<domain>`, to vendor, reply-to the user, BCC founders, subject "Inquiry: Jaago, Sat Jun 13, 100 to 250 guests, from Harjit (Yuba City)", idempotency key = inquiry id), inserts the row | Resend Free: 3,000/month, 100/day. Sending to arbitrary recipients needs a verified domain (Phase 5); until then you can only send to your own inbox, which matches "all test inquiries go to our own inbox". Never use Apple's private-relay email as reply-to; vendors' replies bounce. Store `event_date` as a `date`, never a timestamp |
| Auth emails | Supabase's built-in SMTP is development-only (about 2 per hour). Point Auth at Resend SMTP before anyone outside the founders signs up; change the template to a 6-digit code (`{{ .Token }}`) because magic links open in the browser and lose the session | |
| Knowing whether the vendor replied | Email is fire-and-forget. A **local notification** 48 to 72 h later ("Did Sukhi Dhol Crew get back to you?" with Yes / No) feeds `vendor_signals` and the reliability data | No push credentials needed |
| Push | `expo-notifications` + Expo Push Service (free) needs an APNs key and an FCM service account. **Nothing in Phase 3/4 needs remote push**; local notifications cover follow-ups. Remote push also does not work in Expo Go on Android | Defer to Phase 8 |
| i18n | `react-i18next` + `expo-localization`; all UI strings externalised from the first commit even though `pa.json` stays empty until Phase 7; fonts via `expo-font`; `fontFamily` swapped per locale; line-height ≥ 1.6 in Punjabi mode | Retrofitting i18n later means touching every screen; do it now |
| Deep links | Expo Router gives every route a URL. The custom scheme works immediately; Universal Links and App Links need the Phase 5 domain (`apple-app-site-association`, `assetlinks.json`); Apple caches AASA through its CDN, allow a day. The share URL serves a small HTML page with OpenGraph tags (an Edge Function returning HTML or a static site) | WhatsApp and Instagram in-app browsers may not fire universal links; the page needs an "Open in app" button |
| Auth | **Email 6-digit code + native Sign in with Apple** for Phase 3; Google in Phase 4/7. Apple: `expo-apple-authentication` → `signInWithIdToken`; register the bundle ID as the client ID; Apple returns the name only on the first sign-in, save it immediately; needs a dev build, not Expo Go. Guideline 4.8: offering Google makes Apple mandatory. Session storage needs an AsyncStorage adapter plus an AppState listener for token refresh. Publishable key in `EXPO_PUBLIC_…`; service role only in Edge Function secrets and the seed script's local `.env` | **Phone/SMS login is not feasible before the LLC:** US A2P messaging needs 10DLC registration tied to a business entity or toll-free verification, takes weeks, costs per message. Treat "email or phone" as email now, phone in Phase 7/8 |
| Pending action after login | A logged-out tap on Save or Ask stores `{type, vendorId, eventId}` in memory, opens the auth sheet, completes the action after login; profile completion is one screen between auth and the action | |
| Account deletion | Edge Function → `auth.admin.deleteUser`; `profiles` and `saved_vendors` cascade; `inquiries.user_id` set null and sender fields scrubbed by a trigger; client signs out and clears the cache. **Apple requires revoking the Sign in with Apple token on deletion:** keep the authorization code, exchange it at Apple's token endpoint with a client secret you sign with your `.p8` key, call `/auth/revoke`. Budget half a day. Google Play additionally requires a **web URL** where users can request deletion | Never block deletion on a third-party failure; log it |
| Seeding | `supabase/seed.sql` for reference data; `scripts/seed-vendors.ts` (run with `tsx`) for vendors and media, idempotent | |
| Builds | Expo Go works until you add Sign in with Apple, Google or push; then `eas build --profile development` gives a dev client. EAS Free: 15 iOS + 15 Android builds a month on a slow queue (30 to 90 minute waits happen); Starter ($19/mo) for priority; use `eas update` for JS-only changes. iOS TestFlight internal testing (100 users, no review) is enough for founders and family. Android internal testing is immediate, **but personal Play accounts created after Nov 2023 must run a closed test with 12 opted-in testers for 14 consecutive days before production access**; start that during the Phase 6 beta or the Android launch slips by weeks | Back up the Android keystore |
| Monitoring and analytics | `@sentry/react-native` with the Expo plugin (source maps on EAS builds). `posthog-react-native` with autocapture off and explicit events (`event_opened`, `category_opened`, `search_performed`, `vendor_viewed`, `vendor_action {call|text|whatsapp|instagram|directions|share}`, `vendor_saved`, `inquiry_sent`, `signup_completed`, `language_changed`). Plus a first-party `vendor_events (vendor_id, kind, day, count)` table aggregated nightly with `pg_cron` for the monthly vendor stats email | Privacy labels: Name, Email, Coarse Location (optional), Product Interaction, Crash Data. No App Tracking Transparency prompt needed |

### Effort for a first testable build (both founders, 15 to 20 combined hours a week, Claude Code doing much of the typing)

| Work | Hours |
| --- | --- |
| Scaffold: Expo Router tabs, theme tokens, typography, i18n skeleton, ESLint and Prettier, EAS config | 12 |
| Schema, migrations, RLS, reference seed, advisors clean | 10 |
| Auth (email code + Apple), profile and 18+, pending-action pattern, delete account with Apple revoke | 22 |
| Home by event, event page | 10 |
| Search: PostGIS RPC, zip and city typeahead, Near me, results list, sort | 20 |
| Vendor profile: cover, grid, viewer, video tile, action buttons, share | 20 |
| Inquiry form + Edge Function + Resend + rate limits + duplicates | 14 |
| Saved vendors grouped by event with the "save for which event?" sheet | 8 |
| Loading, empty, error, offline states; accessibility pass | 16 |
| Native, EAS and Expo gremlins buffer | 20 |
| **Phase 3 total** | **about 150 h, 8 to 10 weeks** |
| Phase 4: seed 25 vendors with media (12), test on both phones and fix (20), developer accounts, TestFlight and Play internal (10) | **about 45 h, 3 weeks** |

Cut for the first build if needed: Google sign-in, remote push, video (Instagram Reel links only), Punjabi translations (keep the toggle wired, strings empty). Do not cut: RLS, account deletion, empty and offline states, the seed script.

### What commonly goes wrong

Supabase Free projects pause after 7 days of inactivity (a paused production during family beta looks like the app is dead; move to Pro at $25 before anyone outside the two of you installs it). RLS mistakes show as empty lists. Auth emails not arriving because the default SMTP is throttled. Session lost on restart (missing storage adapter). Unoptimised 4 MB photos. `tel:` and `sms:` do nothing on simulators; test on real phones; Android's `sms:` body syntax differs. A vague location-permission string gets an App Store rejection. Clipped Gurmukhi matras and truncated buttons at large text sizes. Expo SDK upgrades mid-phase (pin it; upgrade between phases). EAS build quota eaten by "one more build". The date picker shifting the wedding by a day when converted to UTC (store `YYYY-MM-DD` strings).

### App Store and Play review risks

| Risk | Guideline | Mitigation |
| --- | --- | --- |
| "Not enough functionality" | 4.2 | A directory with real listings is explicitly allowed; native features Apple can see: location search, saving, in-app inquiry, share sheet, offline cache, language toggle |
| Placeholder content | 2.1 | Never submit to App Store review with fake vendors; TestFlight internal is fine. The plan already sequences real vendors before submission |
| Login required to browse | 5.1.1(v) | Browsing without an account, as planned; still provide a reviewer test account |
| Account deletion | 5.1.1(v), Play | In-app, two taps from Profile; Play also needs the web URL |
| Third-party login without Apple | 4.8 | Ship Apple + email; if Google is added Apple stays |
| Reviews (Phase 8) turn the app into user-generated content | 1.2 | Report button on every review, block, moderation with a stated response time, terms with a zero-tolerance clause; start with structured questions rather than free text |
| Privacy policy | 5.1.1, Play Data Safety | URL in App Store Connect and inside Profile; needs the Phase 5 domain |
| 18+ checkbox misread as adult content | Age rating | Rate 4+; the checkbox is a contract measure; never say "adults only" in the UI |

### Monthly cost

| | Build and test | ~1,000 users | ~10,000 users |
| --- | --- | --- | --- |
| Supabase | Free (local dev) | Pro $25 | Pro + small compute, ~$40 to $55 |
| Resend | Free | Free | Free or Pro $20 |
| Expo EAS | Free | Free or Starter $19 | Starter $19 |
| Sentry, PostHog | Free | Free | Free to ~$26 |
| Apple Developer | $99/yr | | |
| Google Play | $25 once | | |
| Domain | Phase 5, ~$1.50/mo | | |
| **Total infrastructure** | **~$8/mo** | **~$35 to $55/mo** | **~$90 to $150/mo** |

The biggest cost is not infrastructure; it is the California LLC minimum franchise tax ($800/yr) and any SMS features.

### Harder than it looks

Sign in with Apple token revocation on deletion · US phone login (10DLC, needs the LLC) · "near me" that respects both the user's radius and each vendor's service radius while keeping home-based vendors unlocatable · getting originals, consent and consistent quality from 50 vendors (the pipeline is easy, the collection is not) · video hosting beyond a few short clips · saved-by-event semantics when a vendor is saved from Search with no event context · knowing whether the vendor replied · universal links through WhatsApp and Instagram browsers · Punjabi typography across every button and who writes 40 Punjabi bios · Play's 12-tester rule · reviews in a small community where every reviewer is someone's cousin.

### Easier than it looks

Tabs, stacks and deep links from the file tree · Call, Text, Instagram and Directions as one `Linking.openURL` each · distance sort as one RPC · bilingual reference data · saved vendors as one table and one policy · Sentry and PostHog in 30 minutes each · one `StateView` component for every empty/loading/error state · the seed script (150 lines, reused for real vendors) · the language toggle · local notifications for follow-ups · monthly vendor stats emails with `pg_cron` and one Edge Function.

### Edge cases the app must handle

First launch offline (bundled `assets/reference.json` renders Home and event pages; previously viewed profiles render from cache; never-seen vendors show retry) · location denied (type a city; nothing is blocked; "Open Settings" link) · GPS timeout indoors (last known position, then the typed city) · vendor with no photos (category illustration and initials; ranked after vendors with photos at equal distance) · vendor with no email (`inquiry_channel = 'sms'`: the button reads "Text inquiry" and opens `sms:` prefilled; or `relay`: the email goes to the founders who forward by WhatsApp within the day, realistic at 50 vendors and the best early conversion data) · duplicate inquiry within 24 h · Resend failure (row saved as failed, retry with the same idempotency key) · daily cap reached (queued, sent after midnight by `pg_cron`; users never see Resend's limits) · Apple "Hide My Email" users (require a real email or phone for replies) · a shared link to a vendor unpublished since (a "no longer listed" screen with similar vendors) · a zip outside California ("We're Northern California only for now" plus a waitlist that stores the zip for Phase 8) · deleting an account while offline (refused honestly, never a fake success) · `app_config.min_supported_build` forcing an update screen on old builds.

---

## 9. Competitors: gaps, what to copy, traps

### What exists (research date 2026-09-25, sources in the research brief)

- **The Knot / WeddingWire:** the US yellow pages for weddings; subscription advertising with 12-month contracts, $125 to $1,200 a month, featured listings $5k to $15k a year. Vendors can dispute reviews into deletion. A New Yorker exposé, a senator's FTC letter and a class action (April 2025) over "fake brides" and fake leads; ~95 percent of leads ghost. One wedding = one date, one venue, one ceremony plus reception; no dhol, bhangra, turban, langar, ghori or mithai categories; NorCal Punjabi vendors are largely absent because the price is unjustifiable for a dhol player.
- **Zola:** registry-first; pay-per-connection credits and a paid "Boost" for first-page placement; support black holes.
- **Thumbtack / Bark:** pay-per-lead; $70 to $130 per wedding-photography inquiry in some markets, shared with 3 to 5 pros; "99 percent of leads were duds"; the higher bidder outranks the better-rated pro.
- **Yelp / Google:** where hall searches land; restaurant-centric; home-based Punjabi vendors have no page; fake-review filtering removes legitimate wedding reviews.
- **Instagram:** the de facto directory (68 percent of couples vet vendors there) with no search by city, date or event, no pricing, buried DMs, 2 to 3 percent organic reach, and parents are not there.
- **Facebook groups:** 70 unranked replies to "recommend a DJ in Sacramento", unsearchable a week later.
- **WedMeGood, ShaadiSaga/WeddingBazaar (India):** culturally right taxonomy, city-based not event-based, pay-to-rank, negative reviews removed, MouthShut rating 1.3/5.
- **Sulekha:** the closest incumbent for NorCal desi vendors; classifieds feel; lead packages that under-deliver; robocall spam.
- **Rasam** (launched Sept 2026, Toronto): all-in-one South Asian planner with shared boards and a curated marketplace; planner-first, not directory-first. The closest new competitor.
- **DesiWeds** ($59 to $79 a month charged to the couple), **BollyWeds** (aggregated 310k venues), **Jab We Wed**, **ShaadixCo**, **Saathiya** (32 vendors): thin supply, web-only, or national aggregation.
- **ShaadiShop's blog** lists 180+ NorCal Indian-wedding vendors including 7 gurdwaras, dhol and turban tying: proof the supply exists and is Punjabi-specific. It is a static post.
- **Punjabi Wedding Organizer, Elsker, Jubily (UK):** tradition-aware checklists with no vendor directory.

**No Sikh or Punjabi-specific vendor directory app exists for Northern California.**

### Gap table

| Family need | Knot/WW | Zola | Thumbtack/Bark | Yelp/Google | Instagram | FB groups | WedMeGood | Sulekha | Rasam and co. | **This app (Phase 3)** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Browse by event (roka to reception) | No | No | No | No | No | No | Photo filter only | No | Rasam plans by event, no browse | **Yes, core** |
| Punjabi categories (dhol, pagg, langar, ghori, mithai) | No | No | No | Weak | Hashtags | Ad hoc | India only | Partial | Partial | **Yes** |
| Free, searchable listing for home-based vendors | Free tier not visible | Yes | Pay per lead | Yes | Yes | Yes | No | Paid | Unknown | **Yes** |
| No pay-to-rank | No | Boost | Bidding | Ads | Algorithm | n/a | No | No | Unknown | **Yes, stated publicly** |
| Upfront "starting at" price | Optional | Optional | Quotes | No | No | No | Yes | No | Some | **Yes, on cards** |
| Elder-friendly, Gurmukhi | No | No | No | No | No | No | Hindi UI | No | No | **Yes** |
| Browse without an account | Yes | Yes | No | Yes | Partial | No | Partial | Yes | Varies | **Yes** |
| Reviews vendors cannot delete | No | ? | ? | Filtered | n/a | Threads | Removes | ? | Unknown | Phase 8, designed right |
| Local NorCal Punjabi supply | Generic | Generic | Generic | Some | Yes | Yes | None | Some | Thin | **50 curated founding vendors** |
| Direct Call / Text / WhatsApp / Instagram | Form-gated | Form-gated | Message-gated | Yes | DM | No | Form | Phone | Email | **All** |
| Availability by date | Venues, stale | Some | No | No | No | No | No | No | UK only | Phase 8 |

### Worth copying

Price-first storefronts (77 percent of couples decide whom to contact on price) · a vendor response-time signal · real-weddings galleries filtered by event · a vendor-side app whose first screen is "your inquiries, your views, your saves" · multi-vendor inquiry from one form, **capped** · a tradition-aware checklist back-dated from event dates, each task paired with a vendor category · a visible curation bar ("Founding vendor, vetted in person by the founders") · shared planning with family · per-event bilingual RSVP as the model for the language toggle · expo economics ($275 for one day at a table is the anchor for a $20 to $40 monthly tier later).

### Traps to avoid

1. Pay-to-rank and badges sold to advertisers (the single largest trust killer on record). If sponsored slots come in Phase 8: labelled, one per screen, capped per category and region, never affecting organic order.
2. Pay-per-lead and credit packs. Charge for tools and visibility features, never for introductions.
3. 12-month lock-ins and non-refundable plans. Month-to-month or nothing.
4. Vendor-removable reviews. Tie reviews to a booked inquiry; public vendor reply instead of deletion.
5. Review gating (soliciting only happy clients). Ban it in the consent form from day one.
6. A free tier that is not actually visible.
7. Uncapped fan-out inquiry forms.
8. Selling couple data to vendors. Parents in particular distrust this; make "we don't sell your data" a stated position.
9. Sales-rep culture. Keep onboarding relationship-based and say so.
10. Undisclosed referral fees (10 to 20 percent hidden planner commissions are normal in the desi world). Any fee ever taken is disclosed on the profile.
11. Planner-first scope creep. Directory-first is correct; add planning only where it feeds discovery.
12. Generic categories that lump a Bay Area Bollywood DJ with a Yuba City dhol-and-DJ package.

### Positioning

Every incumbent monetises the introduction and therefore has an incentive to flood vendors with low-quality contacts and hide price. This app's unit of organisation is the **event** and its unit of trust is the **community**, priced so vendors pay for tools, never for couples.

For the store listing and the pitch: "Every vendor for every event of a Punjabi wedding, from roka to reception. Free to browse, no account needed, no pay-to-rank. Built by two people who grew up at these weddings."

Vendor pitch in one line: "Instagram shows your work to 2 percent of your followers; we show it, with your price and a Call button, to every family in 510, 916, 408, 209 and 530 planning a jaago this season, and it costs you nothing."

---

## 10. What sets it apart

Six ideation passes produced 48 feature ideas. Each was meant to be challenged by three skeptics (vendor adoption, user value, two-founder feasibility). The run partly failed: an internet outage killed the merge step and the first five verdicts, and a usage limit stopped it after 17 ideas had been fully judged. So: **"Verified"** below means all three skeptics reviewed it (score out of 5 is their average; "keeps" is how many of the three said keep). **"Not verified"** means the reviews never ran and the placement is a judgment call. Two ideas were rejected by the skeptics and are listed in "parked" with the reasons. Duplicates across passes have been merged.

The design principle behind all of it: every family action (inquiry, save, call note, follow-up answer) produces a signal a vendor wants (leads, stats, badges, credits), and every vendor action (upload, price, availability) produces something a family wants before they call. The app owns the loop that WhatsApp and Instagram cannot close.

### A. Why vendors post here and keep it fresh

**1. Booking-sheet inquiries and the monthly scorecard** (not verified; core, low risk; Phase 3/4 email, Phase 6 SMS, Phase 8 dashboard). Every inquiry reaches the vendor as a structured booking sheet: subject "Jaago · Sat Jun 13 · Yuba City · 100 to 250 guests · from Harjit K. (530)", the phone number printed large (Punjabi vendors call back, they do not email), the voice note, and buttons Reply by WhatsApp / Text / Call plus a one-tap "I replied" link that stamps `first_response_at`. Monthly, from `vendor_events`: "September: 340 views · 22 calls · 9 inquiries · 3 unanswered · you replied in about 6 h (category median 31 h) · listings with a starting price got 2.4× more calls than yours. Add one? Reply to this message." This is why a vendor keeps the listing current. Instagram cannot tell them which wedding event or city drove a view. Risk: a scorecard can demoralise low-traffic vendors; send tips instead when views are under 20.

**2. Send-my-card: the vendor's WhatsApp brochure** (verified 3.0). Every vendor gets a link and a WhatsApp-ready image card (maroon frame, cover, name, city, from-price, badges, QR) they send to every lead they get anywhere ("here's everything") instead of dumping 30 photos. Saves open the app and tag the source; the scorecard says "Your card was opened 41 times, saved 12, 4 inquiries came from it." Because the card is what they hand to customers, a wrong price or stale photo gets fixed immediately. Phase 4 landing page and PNG; Phase 8 "Send my card" button and per-event variants.

**3. The Founding 50 charter** (verified 3.3). A permanent numbered "Founding #17" badge, a Founding Wall page inside the app, a labelled year-one first-position tiebreak within a distance band, a concierge WhatsApp line that edits their profile for them forever, a physical kit (QR table tent, story graphic, stickers, profile card), category caps (max 5 per category so a Yuba dholi is not one of 15), "37 of 50 spots taken" on the vendors page, and being named in the launch posts. Status and scarcity in a community that runs on izzat, not a discount. The placement perk must be labelled and time-boxed or it becomes the pay-to-rank trap.

**4. Hall pages that build themselves** (not verified; build for the November demo). Any vendor photo tagged with a hall shows on that hall's page under "Real weddings here", filterable by event. A two-way-verified "Approved caterers (6)" and "Decorators who have worked here (11)". A fact-chip strip ("Seats 700 · Outside catering: approved list · BYO alcohol, corkage $500 · Ghori OK in lot · Curfew 1 AM") that answers the hall's fifteen daily phone questions once. Book a tour with three slots. Halls get a page richer than they could build, for zero effort; caterers and decorators appear exactly where a family that has picked the hall looks next. Give halls a per-vendor hide toggle.

**5. Team credits and tag-to-recruit** (not verified; Phase 6 by hand, Phase 8 automated). At intake, every photo records who shot it, which hall, and who else was on the team; tagged vendors not yet listed become leads and get a personal WhatsApp from the founders: "Amrit Studios credited your dhol in 6 photos from a wedding at Sacramento Palace. Your free founding profile is 80 percent ready: link." Profiles show "Often works with" (both confirm) and "Featured in 23 real weddings", which is permanent where an Instagram tag scrolls away in a week. Phase 8: the inviter earns a free Plus month per claim. This is how the first 50 recruit the next 300 without cold calls. Never show "invited by" publicly; only the mutual link.

**6. The availability ladder** (not verified; rung 1 Phase 6/7, the rest Phase 8). Rung 1 needs no vendor account: a monthly WhatsApp "Reply with dates you're booked in June, e.g. 6/13 6/20, or ALL OPEN", entered by the founders. Once a family's wedding date exists, profiles show "Open on Sat Jun 13" or "Booked on your date", results get an "Open on my date" filter, map pins grey out. Rung 2: tap-to-block calendar and Google Calendar busy-day sync. Rung 3: a date-request board where only vendors with that date open inside that radius get pinged, capped at 5 responders. Rung 4: a "hold my date" booking summary the family confirms (a record, not escrow, no payments). Stale calendars destroy trust: show "updated 3 days ago" and expire after 30 days.

**7. Packs and the weekday deal board** (not verified; packs Phase 4 entry, deals Phase 6 founder-entered, paid Phase 8). Multi-event packs ("4-event dhol pack: maiyan, jaago, baraat, reception, $1,800") and, with vendor accounts, cross-vendor bundles ("Jaago pack: 2 dholis + jaago pot decor + lights", one inquiry to the lead vendor). Dated, labelled deals ("20 percent off Thursday jaagos, Jan to Feb") in a separate Deals section families filter by their date; never a sort boost. Thursday and Friday events already run 15 to 30 percent cheaper by phone and January to February is dead; nobody publishes it. The deal board is the first sensible paid product ($15 per live deal per month or included in Plus) because it is content with a price, not a rank purchase; a deal requires a listed base price, which quietly pushes price transparency.

**8. Attributed links and the ROI receipt** (not verified; Phase 6/7). Links carry `?src=ig|qr|wa`; the monthly email says "Your Instagram sent 42 families and 6 inquiries" and ships a fresh story asset each month; a private founding-vendor leaderboard; after the first season a shareable "Your year on <app>: 1,240 views, 88 calls, 31 inquiries, 9 weddings booked (your report), cost to you $0" card. It is the Plus sales letter and the referral proof for the next 250 vendors.

### B. Why families open it instead of WhatsApp, Instagram and phone calls

**9. Sanjha Viah: the two-sides wedding board** (verified 3.0, keeps 3 of 3). One wedding, two host families, one board. Each side runs its own chain (own paath, maiyan, sangeet, jaago); a Shared lane holds the gurdwara day, milni garlands, photographer, live stream; the other side sees dates and booked-or-not only (no budgets, guest lists or notes cross the line). Clash rules, client-side and suggest-only: both jaagos the same night, groom's reception and bride's dinner the same evening, an event starting within two hours of the gurdwara slot ending, makeup before 4 AM, the same vendor double-booked across sides. "Find" on a Side B slot searches near Side B's city, not the phone's location. Data model in Phase 3 Step 1 (`weddings`, `wedding_sides`, `wedding_members`, `wedding_events` with `host_side`, `wedding_slots`), single-side board in Phase 3/4, join code and co-editing in Phase 8 right after vendor accounts. Nobody else models two host families; it is why "near me" is wrong half the time in a generic app. Labels are renameable (Side A / Side B internally) for interfaith and same-sex couples.

**10. Wedding week run-of-show with vendor call sheets** (verified 3.0, keeps 3). A day-by-day timeline (Thu maiyan, Fri jaago, Sat choora 6 AM → baraat → Anand Karaj → reception) with every booked vendor's arrive-by time from category defaults (makeup start minus 180, decor minus 300, caterer minus 120, dhol minus 30, photographer minus 60, pagg minus 90), exported per vendor as a WhatsApp-ready call sheet ("Sat 13 Jun: Baraat, arrive 8:00 AM, Tierra Buena Gurdwara parking lot, no dhol inside. Day contact: Amrit (530)…") and as a one-page PDF for the fridge. A tight-gap check flags the same vendor on two events with less than the drive time between them. Nothing is sent automatically; the message is shown before sending. Phase 3/4 on top of the board, one to two days.

**11. "Ki kiha?": post-call capture** (verified 3.3, keeps 3). Ten minutes after a parent taps Call, a local notification asks "Did you reach Sukhi Dhol Crew?"; Yes opens a sheet with chips (Available on our date · Not available · Quoted a price $ · Will call back · Left a message), an optional line and a 30-second voice note. The board then reads "Papa called Jun 3 · Available · $600 (2 dholis)". Parents get credit for the calls they make; the couple gets written outcomes without making elders type; the board becomes more accurate than the group chat. Quoted prices feed the price bands; "no answer" twice feeds the responsiveness list. Cap one prompt per vendor per day; voice notes never go to the vendor. Phase 3/4, about a day.

**12. Compare card** (verified 3.0). Pick two or three saved vendors in a slot and get a side-by-side (cover, starting price and unit, drive time from the event venue, highlights, Speaks Punjabi, Verified, has video, latest call note, inquiry status) rendered as one 1080×1350 image for the family WhatsApp group, with each vendor's link in the caption. The forwarded object in this community is an image, not a link. Phase 8: a web vote page where relatives tap "This one / ਇਹ ਵਾਲਾ" without installing anything. A listed price and a video visibly win the comparison, which is the only pressure that reliably gets vendors to fill in their profile. Notes are off by default in the image.

**13. "Kinne bande?": headcount-driven needs and cost estimator** (verified 2.7). Each event carries a guest band and venue type; a rules table (founder-seeded; content is a weekend with both founders' mothers) turns "900-guest reception in 530" into "2 dholis for the entrance, 3 to 4 security guards (hall rule with alcohol), 4 bartenders, about 90 tables, typical $45k to $90k", and pre-fills every inquiry, comparison and call sheet with those numbers so the family never repeats the headcount to twenty vendors. Alcohol lines exist only under jaago and reception. Every line says "typical, confirm with your hall". Scope cap: needs, cost band, prefill; free-form questions belong to the Phase 8 planner.

**14. Date finder and booking runway** (verified 3.0; merged with "Booking Runway", not verified). Before booking anything, enter two or three candidate Saturdays and a gurdwara; per date see the gurdwara's booking process and rules (founder-written from one call to each of about ten offices, "confirmed with the office on <date>"), the community blackout calendar (Yuba City Nagar Kirtan weekend, Vaisakhi nagar kirtans by city, Gurpurabs, holiday clusters, Dec 20 to Jan 3; muhurat note for Hindu users; Ramadan and Muharram for Muslim users; nothing astrological for Sikh users), Valley heat flags, and honest scarcity ("6 families already asked about Sat Jun 13 in 916", shown only at 3+). Choosing a date gives every board slot a book-by chip from category lead times (gurdwara 9 to 12 months, hall 8 to 10, photographer 6 to 8, DJ and dhol 3 to 6, makeup and mehndi 2 to 4, pagg 1) and a local notification "Your jaago is in 10 weeks and no dhol is booked; 9 near Yuba City". The date is the first and most consequential decision; if the app is where the date got picked, it is where the plan lives afterwards. Tables in Phase 3, content Phase 4 to 6, screen Phase 4. Add "update the blackout table" as a recurring January task.

**15. Home event kit** (not verified; Phase 4 content). Marking an event "at home" (maiyan, jaago, paath, mehndi, choora morning) adds a backyard checklist to it: tent and flooring with heaters or misters by season, portable restrooms for 300+, generator for the DJ, neighbour notice and parking, music cutoff, fireworks illegal in most cities, paath room prep and the 48 veg and alcohol-free hours, cleanup crew Sunday morning, each row linked to the category that solves it. Tone: a helpful uncle, never a compliance form. City-specific ordinance notes are "community-reported" until verified. This is the only channel that will ever send traffic to tent houses, restroom trailers and cleanup crews, which makes them easy founding vendors.

**16. Plan this event and the budget builder** (not verified; Phase 4 form, Phase 7/8 builder). From an event page, one form (date, city, guests, side, voice note) fans out to the essential categories the user ticks, one vendor per category (default: nearest verified, "Change" is one tap), capped at 5 categories and 1 vendor per category, and fills the event's slots as "Asked". The opposite of Thumbtack's shared lead. Later, "Jaago · 400 guests · Yuba City · under $8,000" returns one vendor per essential category whose starting prices fit, with swap buttons and a running estimate; only priced, complete profiles are eligible, which is the strongest pull toward price transparency without pay-to-rank. The Phase 8 AI planner should be a chat layer that only fills these inputs, grounded on listings and event guides, never a free-form recommender.

**17. Start from a cousin's wedding** (not verified; Phase 4 text export with links, Phase 8 templates). The board's text export already carries every vendor's `/v/` link. Later, a finished board becomes a plan template another family imports in one tap (events, guest counts, booked vendors with "Used by the Gill family" chips, with the sharer's consent, costs off by default). "Kihda si?" becomes a permanent, searchable referral. Only boards with at least one inquiry sent through the app can be shared with vendors included.

### C. Trust in a community where people trust aunties over strangers

**18. Reliability ledger: counts, not stars** (verified 3.0, keeps 3). From the app's own follow-ups (3-day "did they reply?", post-event "showed up as agreed? price matched the quote?"), each profile shows plain lines once 5+ data points exist: "Replied within a day · 11 of 14", "Showed up as agreed · 9 of 9", "Price matched the quote · 8 of 9", "Booked through this app · 14 families". No percentages, no stars, a grey "Not enough data yet" for new vendors so they are not punished. Phase 8: a vendor "reply promise", a "Most reliable" sort with a Bayesian prior so 2 of 2 does not beat 40 of 45. This is the first reputation signal that exists before reviews and vendor accounts, and it measures the fear behind every Punjabi booking: the junior team sent to a double-booked Saturday. No-answer is unknown, never negative.

**19. Wedding-stamped reviews** (verified 3.3, keeps 3; Phase 8 item 1, plumbing in Phase 3/4). A review can only exist as a named card tied to a booked wedding: inquiry sent → "Yes, booked" → event date passes → two days later "How did Sukhi Dhol Crew do at your jaago?" → four yes/no rows (Showed up on time · Did what was promised · Price matched the quote · Would book again), an optional 140-character line in EN or PA, optional 3 photos. Identity is "Harjit K. · Yuba City · Jaago · Jun 2026" with an anonymous-family toggle that keeps the verified stamp. Reviews grouped by event ("5 jaagos · 4 receptions"), one public vendor reply, removal only for policy with a grey placeholder so counts cannot silently shrink, every review moderated in year one. No inquiry plus booked status means no review, so competitors cannot brigade and vendors cannot delete. The Phase 3/4 plumbing (booked status, event date on inquiries, the post-event notification) costs a day and means reviews launch with a backlog of eligible weddings instead of zero.

**20. Vouches: named recommendations from people who already have your number** (verified 3.5; the highest-scored idea). At founding-vendor intake the founder asks for two or three past clients, phones them, confirms the wedding and consent, and enters "Vouched by Balwinder S., Fremont · Reception · Nov 2025" with an optional line or 30-second voice note ("Ohna ne bahut vadhia kam kita"). Rendered above the media grid; "Vouched by 3 families" on cards. Phase 8, opt-in on both sides: contact matching with on-device hashed phone numbers so the strip reads "Someone in your contacts vouched for this vendor" and, if the voucher allowed it, a "Message Balwinder on WhatsApp" button. It answers "kihda si?" before the family has to ask the group. Every vouch call is also a beta-tester recruit. Show names only with opt-in, counts only at 2+, re-confirm annually, disclose contact matching in the privacy labels.

**21. Gurdwara partner pages and venue confirmation** (verified 2.7; merged with "Gurdwara Partner Pages", not verified). Founders visit each of about a dozen launch-market gurdwara offices (Yuba City Tierra Buena, Sacramento Bradshaw, West Sacramento, Fremont, San Jose, Stockton, Manteca, Lodi, Tracy, Turlock, Livingston) with a one-page proposal: a free, office-verified page (booking steps, rules, dhol and photography policy, langar arrangement, interfaith policy in the office's own words), a printed QR flyer for the shoe area and langar-hall rack, and a monthly email of how many families viewed it; with the office's consent, a "Saturdays still open" grid updated by a monthly WhatsApp, shown with "Last updated Sep 12" and hidden after 45 days stale. Pledges in writing: no ads, no paid placement, no bar vendors near these pages, takedown in 24 hours, no religious symbols in branding. Second layer: a vendor's "Has worked at Fremont Gurdwara / Sacramento Palace" stays grey until the venue confirms; confirmed becomes a teal chip and the vendor appears on the venue's "Vendors who have worked here" list, sorted by count, never for sale. A gurdwara-confirmed chip answers "will this photographer embarrass us at the gurdwara?" and is the one credential money cannot buy. Wording is always "has worked here" and "confirmed by the office", never "recommended"; committees change yearly, re-confirm annually, treat every gurdwara identically.

**22. Sulah: private-first dispute handling** (verified 3.0; Phase 8 with reviews, informal from Phase 6). Any "No" on the review questions or a "Something went wrong" tap opens a private case (chips: Did not show · Late · Different team than promised · Charged more than quoted · Deposit not returned · Damaged or unsafe; one line; optional receipt photo, never public). The vendor gets a 7-day private window (apology, partial or full refund offer, explanation); the family closes it as "Resolved: publish as resolved", "Not resolved: publish" or "Withdraw". Only the structured review plus a tag ("Resolved with the family" in green) ever publishes. Founders can be asked to act as go-betweens: forwarding and reminders only, no escrow, no rulings, stated in the terms. Two resolved and zero unresolved earns "Resolves issues"; three unresolved in twelve months triggers review and possible delisting (in the consent form). It mirrors how the community already settles things (a phone call from an elder before anyone goes public) and prevents the one-star that starts a feud. From Phase 6 the inquiry copy email carries "Something went wrong? Text us", which produces the case history.

**23. "Seen live" and wedding credits** (verified 2.7; merged with two unverified variants). Every founding vendor's QR table tent and sticker (DJ booth, dhol case, mehndi table, dessert table; never at the gurdwara) opens `/v/{slug}?src=live`, which saves the vendor with a note "Seen at a jaago, Jun 12" and a one-chip "Would I book them? Yes / Maybe / No", through signup if needed. "At a wedding right now? Tag the vendors" in Profile and Search. Vendors earn "Seen live by 23 families this season" once N ≥ 5. Phase 8: the couple publishes a consented, unlisted credits page listing their vendor team, printed as a QR card for reception tables and the DJ's LED wall ("Loved the dhol? Scan for our vendor team"), so the 800 guests who ask "whose dhol was that?" scan instead of asking around; vendors gain "Featured in 14 real weddings". This digitises the number-one discovery channel in the community. No guest names, no ceremony photos of minors, one-tap unpublish, only the couple can generate it.

**24. "What families near you paid": price bands** (verified 3.0, keeps 3; merged with "Community price bands", not verified). Per category × region × guest band, from three sources: vendor starting prices, the quoted price captured in call notes and in an optional third follow-up question ("What did they quote?" in bands), and a three-question post-event survey 14 days after each event ("About how much did you pay?", "Would you book them again?", one private line for the founders). Nightly p25/p50/p75, suppressed under n = 5, rounded to $50, never per vendor. Shown on results ("Families in 530 paid $450 to $700 for a jaago dhol, 12 reports"), on profiles ("Typical in your area $500 to $800" beside "From $450" with a "Listed price" marker), and in the inquiry form. Until real data exists, cells are seeded from the research table and labelled "Founders' estimate". This directly attacks "Punjabi rate vs gora rate" while respecting the taboo on listing exact prices, and it is the most shareable content the app can produce for the launch ("How much does a Yuba City reception cost?"). Frame it as what families paid, never what a vendor should charge.

### D. AI and data, honestly sorted

**25. Punjabi voice layer** (not verified). The voice note on inquiries (Phase 3/4, no AI, half a day) is not a gimmick; it is the single control that removes the biggest elder barrier. Server transcription with Punjabi support (a few cents per minute) that shows "Heard: ਢੋਲ · Yuba City" as editable chips and only runs the search after a tap is worth shipping in Phase 4 to 6 when Punjabi-first beta testers arrive; auto-executing voice search is not. Vendor voice replies transcribed and translated for the couple come with Phase 8 accounts. Punjabi speech recognition with code-switching and dialects is error-prone, so the transcript is always shown and editable; audio is deleted after 90 days.

**26. "Kihda si?" screenshot lookup** (not verified). Share an Instagram or WhatsApp screenshot into the app; a perceptual hash against consented vendor media identifies "This is Amrit Decor · Sacramento · from $4,000" (Phase 6, about a day, no ML service, expect 70 to 80 percent hits on straight screenshots). Unknown photos get category routing and "Attach to inquiry: can you do this for our jaago?" Visual similarity search waits for several thousand tagged images (Phase 8). Every photo a vendor uploads becomes a hook that routes stolen and forwarded reposts back to their profile with credit, which is the strongest argument for giving the app a full portfolio. Threshold stays conservative; show the matched photo side by side.

**27. Demand intelligence** (not verified; logging from Phase 3/4, an hour). Log every search with its result count; nightly rollups give the founders a ranked list of gaps ("14 families searched for mehndi artists near Manteca last month and found nobody"), which becomes the Phase 6 outreach priority and the cold-lead pitch line ("Be the first mehndi artist listed in the 209"); later a Plus-tier season heatmap for vendors and real book-by medians for families. Aggregates only, minimum 5, never a lead marketplace.

**28. AI intake assistant, a founder-only tool** (not verified; Phase 6). Paste a vendor's Instagram bio and 10 to 20 captions (manual paste, never scraping) and drop their WhatsApp photo dump; one model call with the app's taxonomy as the only allowed vocabulary returns a draft profile (categories, events served, venues worked at matched against the venue tables, co-vendor credits, six highlights, a 600-character bio, a Gurmukhi draft flagged for native review), every fact citing its caption, unknowns left null, no invented prices; a vision call tags each photo by event and flags watermarks. Lands as `status = draft`; the founder reviews it with the vendor on a call; the vendor corrects and signs. Three hours of data entry per vendor becomes twenty minutes, so 50 complete, filterable profiles is a month of evenings, not a season. Invisible to users; nothing publishes without founder plus vendor review.

**29. Vendor inbox assistant** (not verified; Phase 4 auto-acknowledgement inside the existing Edge Function, drafts Phase 8). The family gets an automatic, clearly labelled acknowledgement built from the vendor's structured fields ("Sukhi Dhol Crew received your jaago inquiry for Sat Jun 13. Usually replies within a day. Starting at $450 / 2 hrs. This is an automatic message."). Phase 8: a drafted reply in the family's language generated only from the vendor's saved answers and templates, approved with one tap or replaced by a voice note, plus a date-conflict check ("You already sent a quote for Jun 13 to another family"). The gimmick versions ("AI answers as the vendor", a chatbot for elders) would erode the trust the app depends on; do not build them.

### E. Business model and growth

**30. The no-pay-to-rank constitution** (the skeptics rejected a per-card "Why here?" sheet and a scored ranking formula as over-engineering at 50 vendors; the principle survives as a static page). A screen "How we order vendors / ਅਸੀਂ ਵੈਂਡਰ ਕਿਵੇਂ ਲਗਾਉਂਦੇ ਹਾਂ" reachable from Profile and vendor onboarding: nearest first, then track record, then profile completeness; payment never moves a vendor up; reviews cannot be deleted by vendors; badge criteria with exact thresholds; sponsored slots labelled, one per screen, outside the organic order; a short quarterly trust report (reviews removed and why, vendors delisted and why, sponsored slots sold) templated from admin queries. In a market where the incumbent is under FTC scrutiny this is a marketing asset. Change the ordering at most once per season, with notice.

**31. Revenue without corrupting trust.** In order: founding vendors free for life on the base tier; the weekday deal board (item 7) as the first paid product; Plus and Pro tools (section 7) billed on the web; labelled, capped sponsored event-page slots only after the constitution and the first trust report exist. No commissions, no per-lead charges, no couple data sold. The pitch when a big vendor asks to pay for the top spot is the constitution.

**32. City captain expansion kit** (not verified; Phase 8 items 7 to 9). Expansion is a data pack (events, categories, translations, region) plus a local captain (a well-connected photographer or planner) who signs the first 30 founding vendors across 8 categories for Pro free in their region and 20 percent of Plus/Pro revenue from vendors they onboarded for 24 months; founders approve every listing and captains have no influence on rank; a region is invisible to users until the 30/8 threshold is met, so the first user never sees an empty city. Order: Fresno and Bakersfield (same culture, vendors already travel), then SoCal, then Surrey and Brampton, then the UK. Gate every new region on NorCal metrics (for example 200+ inquiries a month). Culture packs (Punjabi Hindu, Punjabi Muslim with Shahmukhi, then Gujarati, Tamil) reviewed by three families from that community before launch.

### Considered and parked

- **A scored "earned rank" formula** (rejected by skeptics): gameable with friends' inquiries, jumpy at small numbers, and a public formula must then be defended. Keep a simple published rule (item 30) and the reliability counts; revisit scoring after a season of data.
- **"Real work verified" badge from photographer confirmations** (rejected): photographers refusing to allow decorators to use their images could strip a founding vendor's gallery; free-text credits cannot be confirmed. Keep photo credits and the "Shot by" caption; drop the badge and the confirm/reject queue until Phase 8 has real photographer accounts.
- **Per-card "Why is this vendor here?" sheet**: over-engineering at 50 vendors; the static page covers it.
- **Availability probability** computed from sparse inquiry data: would mislead families. Show vendor-confirmed status or nothing.
- **AI chatbot for elders, AI replying as the vendor**: erode trust; the voice note and the form are the features.
- **In-app group chat, payments, escrow, contracts**: the plan's scope rule is right; the app records, it never holds money.
- **A full budget planner in Phase 4**: ranges shown, nothing entered, until Phase 8.
- **Caste, sub-community or religion filters**, even if users ask: never.

---

## 11. Additions to the project plan

Tasks the plan does not have yet, by phase. Each is small; together they are the difference between a directory and the product described above.

**Phase 1: Setup**
- Decide branch protection: GitHub Team (about $4 per person per month) or a public repo; free private repos cannot require reviews.
- Add a GitHub Actions check (lint, type check, tests) required on every pull request.
- Add 925, 650, 559 and 707 to the launch area-code list.
- Start the vendor spreadsheet now and talk to 5 to 10 friendly vendors before Phase 3; it is not coding work and it tests whether vendors want this.

**Phase 2: Design**
- Add the location sheet, the pre-permission screens, the auth sheet, the code entry, the inquiry-sent screen, the My Wedding board and slot detail, the gallery viewer and the empty/offline states to the Figma list.
- Design every screen in Punjabi mode as well as English, at 130 percent text size.
- Design the hall profile variant (fact chips, real weddings here, approved caterers, book a tour).

**Phase 3: Build**
- Step 1: externalise every UI string from the first commit; bilingual `jsonb` names; `host_side` on events; the `weddings`, `wedding_sides`, `wedding_members`, `wedding_events`, `wedding_slots` tables; `gurdwaras`, `blackout_dates`, `category_lead_times`, `price_bands`, `event_needs_rules`, `vendor_events` counters, `vendor_signals`, `vendor_notes`, `vendor_leads`, `search_events`; `vendor_private` with zero policies; `is_sample` on vendors; `vendors.details` JSONB with per-category schemas.
- Step 1: email 6-digit code plus Sign in with Apple; phone login moves to Phase 7/8 (needs the LLC).
- Step 1: Apple token revocation inside account deletion; a web deletion-request page for Google Play (Phase 5 domain).
- Step 2: "Who are you planning for?"; the event guides and booking tips on event pages (founder-written content); "New this week" and "Recently viewed" rows.
- Step 3: map view with centroid circles for home-based vendors; area-code chips; NorCal city and zip typeahead from bundled tables; synonym and transliteration search; dictation button.
- Step 4: WhatsApp button; "Has worked at" chips; similar vendors; QR code; report and claim links; call confirm sheet with the number.
- Step 5: prefilled bilingual message; voice note; draft preservation across sign-up; "Ask 2 more"; duplicate and rate-limit handling; auto-save to the chosen event; automatic acknowledgement to the family; local 3-day follow-up notification; post-call capture.
- Step 5: My Wedding setup and board with Booked / Choose / Find, notes, Mark as booked, text export with links; Compare card image; wedding week run-of-show with call sheets.
- Step 6: in-app text-size switch; read-only offline cache; Sentry and PostHog from the first build (not Phase 7); the web landing page for `/v/` links with OpenGraph tags.

**Phase 4: Test**
- Seed price bands, lead times, blackout dates, needs rules and the home event kit rows.
- Include awkward sample vendors (no photos, no email, home-based, long name, Punjabi-only bio).
- Acceptance: 12 taps logged in and 27 cold from icon to first inquiry; no typing except email and first name; Punjabi mode at 130 percent on a 360-wide Android and an iPhone SE with no clipped matras; home-based vendors show no street address anywhere including the share text, landing page and email.
- Move Supabase production to Pro before anyone outside the two of you installs.
- Build the Founding Wall screen (seeded with samples) and the "For vendors" page.

**Phase 5: Official**
- Verify a `mail.` subdomain for Resend (SPF, DKIM, DMARC); point Supabase Auth at Resend SMTP.
- Universal links and App Links (AASA and assetlinks); expect a day of propagation.
- Write the consent form as a web page with e-sign; include the founding terms and the no-solicitation-of-happy-clients rule.
- Publish the "How we order vendors" page and the "we don't sell your data" line in the privacy policy.

**Phase 6: Vendors**
- Intake as a concierge call with the per-category question list; record photo credits, venues and co-vendors for every photo; collect two or three vouches per vendor.
- Build the AI intake tool before outreach starts.
- Gurdwara office visits with the one-page proposal, QR flyers, and the confirmation sheet; venue confirmations for "has worked at".
- The founding kit: numbered badge, profile card PNG, story graphic, QR table tent, stickers, the concierge WhatsApp number.
- Rung 1 of availability: the monthly "which dates are you booked" WhatsApp.
- Founder-entered weekday deals and packages from the intake call.
- Send inquiries by email and SMS once the LLC and 10DLC registration exist; BCC founders; "I replied" link.
- Start the Google Play closed test with 12 testers for 14 days during the family beta.

**Phase 7: Launch**
- Show reliability counts and price bands once thresholds are met; "Seen live" and vouch counts; the first monthly vendor stats emails with attributed sources.
- The transcription service behind the mic button, with confirm chips.
- The first quarterly trust report, before any sponsored slot is sold.

**Phase 8: Growth (reorder)**
1. Vendor accounts and the inbox (with response badges, templates, voice replies, conflict check)
2. Two-sides board with join codes, co-editing and the compare vote page
3. Wedding-stamped reviews with Sulah
4. Availability rungs 2 to 4; gurdwara "Saturdays still open" grid
5. Deal board (paid), Plus and Pro
6. Sponsored slots (labelled, capped) only after the constitution and trust report
7. AI planner as a chat layer over the budget builder
8. Fresno and Bakersfield via a city captain, then SoCal, then Surrey/Brampton, then the UK
9. Punjabi Hindu and Punjabi Muslim culture packs, then others

**Ongoing:** update the blackout table every January; re-confirm gurdwara cards and vouches annually; March and October "season is starting" prompts to vendors.

---

## 12. Open decisions

| Decision | Recommended default | Why |
| --- | --- | --- |
| Design direction | B "Phulkari" on A's discipline | Elders recognise it before reading; vendors want to be seen in it |
| Fonts | Nunito + Mukta Mahee | Mukta Mahee is the Gurmukhi they already read on Android and WhatsApp |
| First-build auth | Email code + Sign in with Apple; Google in Phase 4/7; phone after the LLC | US SMS registration needs a business entity |
| Email provider | Resend (free to 3,000 a month) | Simple API, idempotency keys, cheap domain verification |
| Maps | react-native-maps (Apple Maps on iOS, Google on Android) | Free; the list view is the default anyway |
| Video in the first build | Instagram Reel links plus at most 3 short hosted clips per vendor | Transcoding and egress are a Phase 8 problem |
| Analytics | PostHog plus first-party counters | The counters feed the vendor stats email; PostHog is for you |
| Dark mode | Phase 8 | Parents keep phones in light mode |
| Inquiry delivery for vendors without email | `sms` channel opens a prefilled text; `relay` sends to the founders who forward by WhatsApp | Realistic at 50 vendors and produces the best early data |
| Branch protection | GitHub Team or public repo | Free private repos cannot enforce reviews |
| Dev database | Local Supabase in Docker; one hosted production project | Free projects pause after 7 days idle |
| Founding-vendor offer | Base tier free for life; Plus free in year one; numbered badge; concierge line; category caps of 5 | Status and scarcity over discount |
| The word for "inquiry" in the UI | "Ask about price & date / ਕੀਮਤ ਤੇ ਤਾਰੀਖ਼ ਪੁੱਛੋ" | Says what it does |
| Side labels | Bride's side / Groom's side by default, renameable, Side A / B internally | Interfaith and same-sex couples served quietly |
| What to call the app | Undecided until Phase 5; "Everwed" and "Wedbook" are probably taken, check early | Don't get attached |

---

## 13. The November prototype and how to split the work

### The goal

A hall owner, opening a new location closer to downtown, sees the app running on your phone in November and says "put me on it." That needs a demo that feels real to a hall, not a finished product. Today is late September; that is about seven to eight weeks.

### What the demo must show (in this order, on a phone in your hand)

1. Home organised by event, in English, then flipped to Punjabi with one tap (event and category names are bilingual data, so this costs nothing extra).
2. Tap **Reception** → the vendor types a reception needs → tap **Banquet hall** → a list sorted by distance from Yuba City with starting prices.
3. **Their hall**, built as a real profile with their real photos (ask for them; that conversation is itself the pitch): fact chips (seats N, outside catering policy, BYO alcohol and corkage, ghori in the lot, curfew, parking), the photo grid, "Real weddings here" with a few tagged sample photos, "Approved caterers" linking to two sample caterer profiles, Call and Directions buttons that actually work, **Book a tour**.
4. Submit a tour request on the spot and show it arriving in your inbox as a structured booking sheet (event, date, guests, catering preference, baraat with ghori, three tour slots, the family's phone).
5. The **Founding 50** page with their hall as #1, and the printed QR table tent for their front desk.
6. Save the hall to "Reception" and show the Saved tab grouped by event.

Then the offer: founding vendor #1, free for life, a page that answers the fifteen questions their office gets by phone every day, tour requests that arrive with the date and guest count already written, an approved-caterer list they control, a QR tent for the new location's front desk, and their new address in front of every family in 530 and 916 before they have printed cards.

### Demo build scope (a strict cut of Phase 3)

In: Expo Go on both your phones (no App Store accounts needed yet), email-code login only, Home, Event page, results list sorted by distance from a typed city or area-code chip (skip GPS permission polish), vendor profile with fact chips and gallery, the hall profile variant, inquiry form emailing to your own inbox via Resend, Saved grouped by event, the Punjabi toggle wired with the tab bar and event names translated (UI strings can stay English), 20 to 25 sample vendors across the reception categories plus the real hall, Founding Wall page seeded.

Out until after the demo: Sign in with Apple, Google, map view, voice note, My Wedding board, account deletion, offline cache, EAS builds, remote push, most Punjabi UI strings.

### Week by week

| Week | Track A: Build | Track B: Product, content, vendors |
| --- | --- | --- |
| 1 (now) | Phase 1 tech: Expo app with tabs, theme tokens, ESLint and Prettier, i18n skeleton, local Supabase, CI check, push to the repo | Phase 1 workspace: task board, Drive, Figma workspace, decisions doc, weekly check-in, partnership agreement draft; start the events and categories spreadsheet with Gurmukhi and aliases |
| 2 | Schema, migrations, RLS, seed reference data from the spreadsheet; auth with email code; profile and 18+ | Brand basics and the design system in Figma; Home, Event page, Results, Profile, Inquiry screens (English and Punjabi) |
| 3 | Home by event, Event page, results list with the PostGIS search and city typeahead | Sample vendor data: 20 to 25 vendors with photos (your own or stock), fact chips per type; write the event guides and booking tips |
| 4 | Vendor profile with fact chips, gallery, action buttons; the hall variant with real weddings here and approved caterers | Visit the hall owner: get photos, capacity, policies, permission; draft the founding-vendor offer and the consent form; the QR table tent design |
| 5 | Inquiry form and Edge Function with Resend to your inbox; Saved grouped by event; Founding Wall | Seed script inputs finalised; the hall's profile data entered; the demo script written and rehearsed with Claude Code driving the app on a second phone |
| 6 | States (loading, empty, error), Punjabi toggle, polish against Figma; test every flow on both phones; fix | Bug log on the task board; pitch one-pager for the hall; second and third warm vendors lined up (a caterer and a DJ who work at that hall, so the "approved caterers" row is real) |
| 7 | Buffer for Expo and Supabase gremlins; demo build frozen by the end of the week | Demo day. Then feed what the owner says into the decisions doc |

Effort: about 90 to 110 combined hours for the cut scope, so roughly 12 to 15 hours a week across the two of you, with Claude Code doing most of the typing on Track A.

### Splitting the work

The plan says you both own every part and review each other's work; keep that. Split by track, not by feature, and swap review:

- **Track A (Build)** drives Claude Code in VS Code, owns the repo, Supabase and the seed script, and opens a pull request per feature, which merges itself once the checks pass (a draft PR waits for Track B).
- **Track B (Product, content, vendors)** owns Figma, the events and categories data, the event guides, the sample vendor content, the hall relationship, the founding offer and consent form, the demo script, the task board and the weekly check-in, and tests what lands on `main` on your phone (that is the review).

Whoever is more comfortable in code takes Track A. If that is unclear, split by what each of you would rather explain to the hall owner: the person who wants to demo the app should be the one who built the hall profile. Both of you do the Phase 1 workspace tasks in week 1, and both of you test on your own phones in week 6.

### After the demo

If the owner says yes, that is founding vendor #1 and the real Phase 3 continues: Sign in with Apple, account deletion, My Wedding board, voice note, maps, the offline cache, then Phase 4 with TestFlight and Play internal testing. If the owner hesitates, the reasons go in the decisions doc and shape the next two vendor conversations before any more code is written.

