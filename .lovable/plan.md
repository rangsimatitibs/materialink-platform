## Problem
The materials database currently loads every published material into memory and filters client-side with a 2-column card grid. That breaks past a few hundred rows and gives no way to narrow down by category, sustainability, or tags.

## Goal
Rebuild `/app/search` as a scalable, filterable, paginated results surface — same warm cream + green aesthetic, but designed for 1,000+ materials.

## New page structure

```text
┌──────────────────────────────────────────────────────────────┐
│  Materials database                                          │
│  General material profiles with typical property…            │
├──────────────────────────────────────────────────────────────┤
│  [🔎 Search name, formula, description…]  [Sort ▾]           │
│                                                              │
│  Category:  All · Polymers · Metals · Composites · Bio-…    │  ← horizontal chip filter row
│  Filters:   Confidence ▾   Sustainability ≥ [slider]   Tags ▾│
│  ── 4 active · Clear all ───────────────────────────────────│
├──────────────────────────────────────────────────────────────┤
│  Showing 1–24 of 1,247                                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Geopolymer concrete       Composite   High   82% 🌿    │  │  ← dense row
│  │ Alkali-activated binder concrete with no Portland…     │  │
│  │ #low-carbon · #construction · #binder                  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ... more rows ...                                           │
├──────────────────────────────────────────────────────────────┤
│  ‹ Prev   1 · 2 · 3 …  52 · Next ›     [24 per page ▾]      │
└──────────────────────────────────────────────────────────────┘
```

Dense list rows scale far better than large cards and can show category + confidence + sustainability score inline as colored chips.

## Backend query
Single query per page keyed on filters, using server-side pagination:

```ts
supabase
  .from("general_materials")
  .select(
    "id, name, slug, short_description, chemical_formula, data_confidence, category_id, material_categories(name)",
    { count: "exact" }
  )
  .eq("status", "published")
  .ilike*(q ? "name" : "" ...)         // OR filter across name/formula/short_description
  .in("category_id", selectedCategories)   // optional
  .in("data_confidence", selectedConfidence) // optional
  .order(sort.column, { ascending: sort.dir === "asc" })
  .range(page*perPage, page*perPage + perPage - 1);
```

Sustainability filter joins `sustainability_indicators` via a lightweight RPC (`search_materials`) so we can filter on `bio_based_content + recycled_content` combined score without pulling the whole table client-side. For phase 1 we can skip this and hide the sustainability slider until the RPC lands.

Tag filter uses `general_material_tags` — small dropdown reads distinct tags once, filtering adds a `.in("id", tagMatchedIds)` from a subselect RPC. Also deferred to phase 2 if it complicates the query.

### Phase 1 (this iteration)
- Full-text-ish search across `name`, `chemical_formula`, `short_description` via a single `.or("name.ilike.%q%,chemical_formula.ilike.%q%,short_description.ilike.%q%")`.
- Category chip filter (multi-select) driven by `material_categories`.
- Confidence multi-select (`high` / `medium` / `low` / `verified` / `estimated` / `ai_generated`).
- Sort: name asc/desc, confidence, recently updated.
- Pagination with prev/next + page numbers, 24 per page default, selectable 12 / 24 / 48.
- Debounced search input (300 ms), state synced to URL query params (`?q=&cat=&conf=&sort=&page=`) so results are shareable.

### Phase 2 (deferred, not built now)
- `search_materials` RPC accepting sustainability threshold, tag intersection, and full-text weight — call it from the same page without changing the UI.
- Optional saved searches and "add to comparison" multi-select.

## UI details (matches existing warm/green system)
- Search bar: full-width, cream card, forest-green focus ring.
- Category chips: rounded-full outline, active = filled `--primary`.
- Filter popovers (Confidence, Sort, Per-page): shadcn `Popover` + `Command` for keyboard-friendly multi-select.
- Result row: `Link` wrapping a `div` with grid columns — name (serif), category chip, confidence chip (reuses the tag palette added last turn), short description (truncated), tag chips row.
- Empty state: same warm illustration copy as today, plus a "Clear filters" button.
- Loading: skeleton rows instead of spinner so layout doesn't jump between pages.
- Pagination: shadcn `Pagination` component with numeric window (first, last, ±2 around current).

## Files touched
- `src/pages/app/Search.tsx` — full rewrite of the page body around the new list, filter bar, and pagination.
- `src/components/app/SearchFilters.tsx` (new) — category chips + confidence popover + sort popover, controlled via props.
- `src/components/app/MaterialResultRow.tsx` (new) — one dense row, reused for skeletons.
- No changes to schema, RLS, or routes.

## Verification
- Typecheck.
- Seed remains ~4 rows, so I'll manually paginate `perPage=2` in the URL to verify pagination and filter round-trips, then confirm URL state persists on reload.
- Confirm empty state and "Clear filters" reset both category and confidence.

## Out of scope
- Sustainability slider and tag filter (deferred to phase 2 with the RPC).
- Adding new indexes — Postgres will handle 1k rows without help; we'll revisit when the table grows.
- No visual redesign of the material profile page itself (that landed last turn).