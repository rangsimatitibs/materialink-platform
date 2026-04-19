
The user wants a major overhaul:
1. Strip out all subscription/pricing UI — replace CTAs with "Book a Demo"
2. Visual reboot — minimal, chic aesthetic with refined typography
3. Strategic input — business model + structure for a meta-database of material categories serving both researchers and industry

Let me explore current state to plan precisely.

I'll examine: Hero, Services, Platform, Footer, Subscriptions page, SignUp flow, Header, and index.css to understand what to strip and restyle.

Let me look at what needs removing/changing.

# Website Reboot Plan

## Part 1: Strategic Recommendation — Meta-Database Business Model

### Recommended Model: **Tiered B2B SaaS + Data Licensing (freemium for research)**

A meta-database aggregating sustainable material categories needs to serve two very different audiences without diluting either. Recommended structure:

**Audience split — same data, different lenses:**

| Layer | Researchers | Industry |
|---|---|---|
| Goal | Discover, validate, publish | Source, qualify, scale |
| Value | Property data, citations, lab recipes | Suppliers, MOQs, certifications, TRL |
| Willingness to pay | Low (institutional) | High (procurement budgets) |

**Three-tier access (no consumer pricing — all "Contact us / Book a demo"):**

1. **Open Research Access** — free for verified academics. Read-only on aggregated property data + citations. Builds the network effect and data moat.
2. **Industry Workspace** — paid seats for R&D / procurement teams. Adds supplier connections, sourcing intelligence, batch comparison, export, API.
3. **Enterprise / Data Partner** — custom contracts for large manufacturers, certification bodies, or material producers who want to list, white-label, or integrate via API.

**Monetization streams (in priority order):**
- Industry seat subscriptions (primary recurring revenue)
- Supplier listing & verified-producer fees (marketplace side)
- API & data licensing to LCA tools, CAD/PLM platforms, ESG reporting tools
- Sponsored research collaborations (industry funds a researcher project through the platform)

### Meta-Database Structure — Category Architecture

A clean ontology that scales. Four root categories, each with consistent sub-facets:

```text
MateriaLink Meta-DB
│
├── 1. Bio-based & Renewable
│     (mycelium, algae, bacterial cellulose, agri-residues)
│
├── 2. Recycled & Circular
│     (post-consumer, post-industrial, upcycled composites)
│
├── 3. Engineered Sustainable
│     (bioplastics, geopolymers, green concretes, low-C alloys)
│
└── 4. Hybrid & Composite
      (bio-composites, natural fiber reinforced, mineral-bio)
```

Every material entry shares the same facets so search/filter stays coherent:
- **Identity** — name, synonyms, category, TRL
- **Properties** — mechanical, thermal, chemical, optical, biodegradation
- **Sourcing** — suppliers, regions, MOQ, lead time, certifications
- **Sustainability** — LCA snapshot, CO₂e, water, end-of-life
- **Provenance** — citations, lab recipes, validation status, contributors

This dual-view architecture means one data model powers both the "researcher's library" and the "industry sourcing" experience.

---

## Part 2: Website Reboot — Minimal & Chic

### Visual direction
- **Typography**: switch from Poppins → pairing of **Instrument Serif** (display headlines) + **Inter** (body). Editorial, calm, premium.
- **Palette**: pull back the bold teal. Off-white background `#FAFAF7`, ink `#1A1A1A`, single accent (muted forest green). Generous whitespace.
- **Layout**: large headlines, lots of negative space, thin dividers instead of cards everywhere, subtle hairline borders.
- **Motion**: very restrained — fade/slide only, no bouncy springs.

### Pages to update

**1. `src/index.css`** — new tokens (off-white bg, ink fg, single accent), import Instrument Serif + Inter, kill the gradient-heavy shadows.

**2. `tailwind.config.ts`** — register new font families (`font-serif` display, `font-sans` body).

**3. `src/components/Header.tsx`**
- Remove `<SubscriptionBadge>` and admin-only avatar clutter for non-admins
- Remove "Subscriptions" nav link
- Replace "Get Started" CTA with **"Book a Demo"** (links to a simple form / mailto)
- Lighter weight, smaller logo, serif wordmark

**4. `src/components/Hero.tsx`** — rebuild
- Big serif headline, one short subline, single "Book a Demo" CTA + secondary "Explore the Database" link
- Remove gradient background, floating shapes; replace with quiet single-color background + one editorial image or thin diagram

**5. `src/components/Services.tsx`** — simplify to 3 quiet feature rows (no colored cards, no gradient buttons)

**6. `src/components/Platform.tsx`** — convert pricing/feature-tier visuals into a clean "What's inside" overview with the 4-category meta-DB structure shown as a minimal list

**7. `src/components/Footer.tsx`** — strip to logo + 3 link columns + email

**8. `src/pages/Index.tsx`** — drop Services/Platform heavy sections, add a new minimal "Database" preview section reflecting the 4-category architecture

**9. Remove subscription surfaces from user-facing flows:**
- Delete route `/subscriptions` from `src/App.tsx` (keep file for now, just unrouted)
- `src/pages/SignUp.tsx` → strip the "Selected tier" banner + tier query-param logic, becomes a plain "Request access" form that writes to `waitlist_signups` (admin view stays)
- Remove `BillingToggle`, `SubscriptionBadge`, `PremiumGate`, `TierGate`, `UsageMeter` from rendered surfaces (files kept, just unused — can prune later)

**10. New page `src/pages/BookDemo.tsx`** + route `/demo`
- Minimal form: name, company, role (researcher / industry), message → inserts into `waitlist_signups` with `interest_area = "Demo request"`. Reuses existing table, no DB changes.

### What stays untouched
- Admin panel (Dashboard, WaitlistAdmin, all admin CRUD) — internal tooling, no style change needed
- Auth flow (login, signup-as-account, password reset) — already working
- Platform tools (`/platform/*`) — keep functional, light restyle only (header/footer inherit new look)
- Supabase schema — no migrations needed

### Out of scope (for this pass)
- Deleting subscription code/files entirely (kept dormant, can remove later)
- Stripe disconnection
- Rewriting platform tool internals

---

## Deliverables checklist
- [ ] New design tokens + fonts
- [ ] Header without subscriptions, "Book a Demo" CTA
- [ ] Rebuilt Hero, Services, Platform, Footer, Index
- [ ] New `/demo` page + route
- [ ] SignUp simplified, `/subscriptions` route removed
- [ ] Meta-DB 4-category structure surfaced on homepage
