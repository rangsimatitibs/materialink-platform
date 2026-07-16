## Goal
Retheme the material profile output page (`/app/materials/:slug`) so it matches the warm cream + forest green aesthetic already used on the Materials database page, replacing the current orange/hardcoded chips with a coherent, semantic palette. Introduce a small set of colorful category tags so material properties, applications, and regulations are easy to scan at a glance.

## Design language (locked to existing site tokens)
- Background: warm cream `--background` (already `45 30% 96%`).
- Headings: Playfair Display serif (already global) — apply to material name and section titles.
- Primary accent: deep forest green `--primary` for main actions and formula chip.
- Sustainability score: forest green numeric, cream label.
- Cards: `--card` with hairline `--border`, subtle `--shadow-medium` on the hero card.
- No hardcoded `bg-orange-*`, `text-white`, or Tailwind color literals anywhere on the page.

## Category tag palette (new semantic tokens in `src/index.css`)
Add a small set of soft, warm-cream compatible chip tokens (background + foreground pair for each), used across the profile:

```text
--tag-material     — forest green pill (identity chip beside the name)
--tag-source       — sage / leaf green (feedstock/tag chips)
--tag-application  — moss / soft olive (application chips)
--tag-regulation   — clay / amber (regulation & certification chips)
--tag-physical     — sky teal (physical properties group)
--tag-mechanical   — terracotta (mechanical properties group)
--tag-safety       — muted red-clay (safety & hazards group)
--tag-sustainability — leaf green (sustainability group)
--tag-ai           — warm ochre (AI Generated source badge)
--tag-local        — deep sage (Local / database source badge)
```

Each rendered as a rounded-full pill with `bg-[hsl(var(--tag-x)/0.15)]` and `text-[hsl(var(--tag-x))]`, tuned to sit calmly on the cream canvas.

## Page structure changes (`src/pages/app/MaterialProfile.tsx`)
No structural rewrite — keep the header card + tabs + accordion layout added last turn. Only restyle:

1. Hero card
   - Serif h1 for material name.
   - "Material" chip → `--tag-material` (forest green pill).
   - "Also known as" → small caps label + body text.
   - Formula pill → cream card with forest-green atom icon, subscripts preserved.
   - Sustainability block (right side) → serif numeric in `--primary`, small caps "Sustainability" label.
   - Sources chips → leaf icon + `--tag-source` color.
   - Applications chips → `--tag-application`.
   - Regulations chips → award icon + `--tag-regulation`.
   - Toggle button uses `variant="default"` (forest green) when open, `outline` when closed.
   - "Advanced Data Sheet — Premium" locked button uses muted card style, lock icon, small serif "Premium" tag.

2. Tabs
   - Pill tabs restyled to cream + border, active = forest green with cream text.
   - Suppliers count chip uses `--muted` when non-premium, forest green when active.

3. Material Properties accordion
   - Each group header carries its category color as a soft rounded icon square + a matching count chip (Description = neutral, Physical = teal, Mechanical = terracotta, Safety = clay-red, Sustainability = leaf-green, Other = muted).
   - Property cards: cream card, name in muted, value in serif/semibold, source badge (`Local` or `AI Generated`) top-right using `--tag-local` / `--tag-ai`.
   - Section title "Material Properties" set in Playfair.

4. Search results (`src/pages/app/Search.tsx`)
   - Confidence badge (High / Medium / Low) → colored by tier using the same tag tokens (High = leaf green, Medium = clay, Low = muted).
   - Card hover: forest-green border + subtle shadow to match the reference screenshot.

## Files touched
- `src/index.css` — add the 10 tag tokens above under `:root` and `.dark`, plus a tiny `.tag-*` utility layer or use inline `bg-[hsl(var(--tag-x)/0.15)]` classes directly in components.
- `src/pages/app/MaterialProfile.tsx` — swap every hardcoded orange/white class for the new tokens; adjust chip colors per category; ensure serif headings.
- `src/pages/app/Search.tsx` — restyle result cards and confidence badge to match.

## Out of scope
- No changes to data, routing, tabs behavior, or suppliers logic.
- No global font change (Playfair + system stack stay as-is).
- No dark-mode redesign beyond keeping tokens defined so it still works.

## Verification
- Typecheck.
- Visit `/app/materials/pla-polylactic-acid` (or any seeded material) and `/app/search` in the preview, confirm: cream background, forest-green accents, coherent colorful category chips, no orange leftovers, no `text-white` on light chips.