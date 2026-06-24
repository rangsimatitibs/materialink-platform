## Goal

Add a **Properties** column to the homepage hero mock materials table. Each row gets a small "View" button that opens a right-side drawer with the full property set for that material, organized into tabs.

Purely presentational — no backend, no real data, no impact on platform tables or admin.

## Scope

- Only `src/components/Hero.tsx`.
- No changes to routing, schema, or other components.

## UI changes

### Table

Add a 6th column "Properties" (right-aligned, narrow). Each row renders a ghost button:

```
[ View → ]
```

Clicking it opens a `Sheet` (shadcn drawer, right side) with that row's full data.

### Drawer content

Header: material name + supplier subtitle + EPD/recycled badges.

Tabs (shadcn `Tabs`):

1. **Physical** — density, tensile strength, Young's modulus, thermal conductivity, melting/processing temp (values vary per material).
2. **Supplier** — supplier name, location, lead time, MOQ, form factor, datasheet link (mock `#`).
3. **Sustainability** — CO₂e (kg/kg), recycled content %, biogenic carbon, end-of-life route, water use.
4. **Certifications** — list of badges: EPD (with program, e.g. "EPD International, EN 15804"), ISO 14001, Cradle to Cradle, etc. Per-supplier, so each row carries its own list.

Each tab shows a clean two-column "label / value" grid using existing tokens (muted-foreground labels, foreground values, tabular-nums where numeric). Source line at the bottom: "Primary supplier data · sample".

### Data shape

Extend `sampleRows` with a `properties` object:

```ts
{
  physical: { density, tensile, modulus, thermal, processTemp },
  supplier: { name, location, leadTime, moq, form, datasheet },
  sustainability: { co2, recycled, biogenic, eol, water },
  certifications: [{ label, detail }]
}
```

Realistic-looking values per material (Mycelium, rPET, Hemp, Geopolymer).

## Technical

- Use existing `@/components/ui/sheet` and `@/components/ui/tabs` (already in repo).
- State: a single `useState<Row | null>` for the active row; drawer open when non-null.
- Keep all styling within existing semantic tokens (no hardcoded colors).
- Maintain current column widths by letting Material/Supplier flex and keeping the rest compact; on narrow viewports the table already scrolls horizontally via its rounded container — add `overflow-x-auto` if needed.

## Out of scope

- Material Scouting, Researcher's Tool, MaterialDetail, admin tables — unchanged.
- No new dependencies, no backend wiring.
