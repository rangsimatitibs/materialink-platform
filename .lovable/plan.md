## Homepage restructure

Rewrite the landing page (`src/pages/Index.tsx`) into 5 sections matching your script. Keep the global Header/Footer, deep-green palette, and serif/sans typography we already use.

### 1. Hero (`src/components/Hero.tsx` — rewrite)

- Eyebrow: "Material Sustainability Intelligence"
- H1: **Choose materials with confidence.**
- Subheadline (serif italic accent): *Link between material selection and sustainability assessment.*
- Description: "Discover materials, compare suppliers, assess environmental impacts, simulate alternatives and generate decision reports that feed directly into your LCA and EPD workflows."
- CTAs: **Book a demo** (primary → `/demo`) and **Explore materials** (secondary → `/platform/material-scouting`)
- Replace right-side photo + floating card with an inline **mock interface**: a styled results table titled "Materials" with columns `Material · Supplier · Carbon footprint · Recycled content · EPD available` and 3–4 example rows (e.g. Mycelium composite, rPET pellet, Hemp fibre board, Geopolymer concrete) with realistic values, supplier names, kgCO₂e/kg, % recycled, and an EPD ✓/— badge. Pure presentational, no data fetching.

### 2. Why MateriaLink? (new `src/components/WhyMaterialink.tsx`)

Three equal cards on a light surface:
- **Discover** — Find innovative and sustainable materials from verified suppliers.
- **Evaluate** — Compare environmental impacts, technical properties, and sustainability metrics.
- **Decide** — Generate decision-ready insights and feed directly into LCA and EPD workflows.

Each card: small icon, title, one-line description. Unified card grammar (rounded-2xl, hairline border, consistent padding).

### 3. Workflow comparison (rework `src/components/WorkflowComparison.tsx`)

- Eyebrow: "This is where the magic happens"
- Title: **Material Selection Meets Environmental Intelligence**
- Keep the two-column "Today vs MateriaLink" diagram already in place, with the supplier / carbon / recycled / EPD chips.
- Closing line under both panels: *"Every material choice becomes an environmental decision. MateriaLink helps you understand both simultaneously."*

### 4. The moat — Primary supplier data (new `src/components/SupplierMoat.tsx`)

Dark forest-green section.
- Eyebrow: "The moat"
- Title: **Powered by Primary Supplier Data**
- Lead: "Unlike traditional databases relying primarily on generic datasets, MateriaLink connects suppliers, materials, and environmental data in one platform."
- 4-item bullet list with check icons:
  - More accurate assessments
  - Better supplier transparency
  - Faster EPD and LCA workflows
  - Reduced dependence on generic assumptions
- Small footnote: "Reduces reliance on generic Ecoinvent-style assumptions by anchoring impact data to verified suppliers."

### 5. Future vision (new `src/components/FutureVision.tsx`)

- Eyebrow: "Future vision"
- Title: **From Material Discovery to Environmental Product Declarations**
- Vertical pipeline graphic (6 stacked nodes with connector lines): Discover → Compare → Assess → Simulate → Report → EPD Ready. Last node highlighted in primary green.
- Closing one-liner: *"The fastest way to understand the environmental consequences of a material decision."*

### Page wiring (`src/pages/Index.tsx`)

New order: `Header → Hero → WhyMaterialink → WorkflowComparison → SupplierMoat → FutureVision → Footer`. Remove `Platform` and `Services` from the homepage (the four-categories section and the two-precision-tools section). Those components stay in the repo and remain available for the Platform sub-pages, just not on `/`.

### Copy/SEO

Update the page-level JSON-LD `description` and the `sr-only` H1 to the new positioning: "MateriaLink — choose materials with confidence. Link between material selection and sustainability assessment."

### Out of scope

- No new routes, no backend changes, no auth changes.
- No design-token changes; reuse existing tokens in `index.css`.
- The mock table is presentational only (hard-coded sample rows).
