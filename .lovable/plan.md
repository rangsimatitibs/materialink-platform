## Goal
Match the material profile header card **exactly** to the reference screenshot: warm cream card, orange "Material" pill, emerald sustainability %, mint-green outlined chips with leaf/medal icons, big bright-green "Hide Details" CTA, and mint-filled active tabs.

## Reference → token mapping
Retune the tag palette in `src/index.css` so the header matches the reference exactly. Tokens stay named the same so no component signatures change — only their hue/lightness shift.

```text
--tag-material     → warm orange       (was forest green)   → orange pill "Material"
--tag-source       → leaf green         (kept, brighten)    → green outlined "corn / sugarcane / cassava" with 🌿
--tag-application  → mint teal          (retune to teal)    → teal outlined "Packaging / 3D Printing / …"
--tag-regulation   → mint teal outline  (retune)            → outlined "FDA Approved" with medal 🏅
```

Add one new token used only by the big CTA:
- `--cta-primary: 145 65% 42%;` — bright emerald matching the reference "Hide Details" button.

## Component changes (`src/pages/app/MaterialProfile.tsx`)

1. **"Material" pill** — bump opacity so it reads as a solid orange pill (like reference), remove border.
2. **Formula chip** — keep, but use `Atom` in emerald tone (already does).
3. **Sustainability number** — switch from `text-primary` (dark forest) to a new `text-[hsl(var(--accent))]` bright emerald so "78%" pops like the reference.
4. **Sources chips** — already outlined with `Leaf` icon; retune via `--tag-source` so the outline + text is a brighter leaf green matching the ref.
5. **Applications chips** — currently no icon. Reference has no icon on applications either — keep as text-only but retune color to mint-teal outline via `--tag-application`.
6. **Regulations chips** — already show `Award` icon; that's the medal in the ref. Retune to same mint-teal outline as applications so they visually pair.
7. **Buttons row (Hide Details / Advanced Data Sheet)**:
   - "Hide Details" becomes a **solid bright emerald** button with a `ChevronUp` (or `ChevronDown` when collapsed) icon centered next to the label. Use inline style `backgroundColor: hsl(var(--cta-primary))` with white text, `h-12`, rounded-lg. Override the default `variant="default"` styling by passing `className` + `style`.
   - "Advanced Data Sheet" stays outlined but restyled: lock icon left, label center-left, tiny muted "Premium" pill on the right — already close, tighten spacing and use a lighter Premium pill.
8. **Tabs pills** — active state currently uses `bg-primary` (dark forest). Change to `bg-[hsl(var(--accent))]` bright emerald so the active pill looks like the reference's teal "Material Properties" pill. Inactive stays cream with border. `Find Suppliers` keeps its factory icon + lock.

No structural/layout changes — the reference layout already matches the current card (title row + sustainability on right, formula chip below, sources, then applications/regulations two-column, then CTA row, then tabs). Only colors, icons, and button treatment change.

## Files touched
- `src/index.css` — retune `--tag-material`, `--tag-application`, `--tag-regulation`, `--tag-source`; add `--cta-primary`. Also mirror in `.dark`.
- `src/pages/app/MaterialProfile.tsx` — swap sustainability % color class, restyle "Hide Details" button with chevron + bright emerald bg, retune tabs active state to accent, minor spacing tweaks.

## Out of scope
- Search results page (already redesigned last turn).
- Property accordion body — reference screenshot doesn't cover it, leave as-is.
- Dark mode fine-tuning beyond mirroring the retuned tokens.

## Verification
- Typecheck.
- Open `/app/materials/pla-polylactic-acid` (or first seeded material) and eyeball against the reference: orange "Material" pill, emerald 78%, leaf-green source chips, teal application/regulation chips with medal, big green "Hide Details" with chevron, teal active tab. Take a Playwright screenshot at 1280 to confirm.
