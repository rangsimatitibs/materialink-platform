# Remove Material Scouting & Researcher's Tool

Full teardown of both features across frontend, admin, and backend. Home page (`/`) is left untouched per your instruction — including `SupplierMoat`, even though it references suppliers. The new versions can be built later on a clean slate.

## 1. Public routes & pages

Delete from `src/App.tsx` and the filesystem:
- `/platform/material-scouting` → `src/pages/platform/MaterialScouting.tsx`
- `/platform/material/:id` → `src/pages/platform/MaterialDetail.tsx`
- `/platform/researchers-tool` → `src/pages/platform/ResearchersTool.tsx`
- `/platform/process-optimization` (already orphaned) → `src/pages/platform/ProcessOptimization.tsx`
- `/services` → `src/pages/ServicesLanding.tsx`

Remove their imports from `App.tsx`. Delete the whole `src/pages/platform/` folder.

## 2. Header, Footer, SignUp, Subscriptions

- `src/components/Header.tsx`: remove the "Platform" `NavigationMenu` (Material Scouting + Researcher's Tool coming-soon items). Nav becomes: Home · About.
- `src/components/Footer.tsx`: drop any Platform column links to the two features / `/services`.
- `src/pages/SignUp.tsx` and `src/pages/Subscriptions.tsx`: remove copy/links that mention Material Scouting, Researcher's Tool, or `/services`. Keep the pages themselves.

## 3. Components & hooks used only by the removed features

Delete:
- `src/components/Services.tsx` (marketing block for the two tools; not used on home)
- `src/components/Platform.tsx`
- `src/components/PropertyExplorer.tsx`
- `src/components/CategorizedProperties.tsx`
- `src/components/AdvancedPropertySearch.tsx`
- `src/components/BibliographySearch.tsx`
- `src/components/PremiumGate.tsx`, `src/components/TierGate.tsx`, `src/components/UsageMeter.tsx`, `src/components/SubscriptionBadge.tsx`, `src/components/BillingToggle.tsx` (all gate UI for these tools)
- `src/components/optimization/*` (whole folder)
- `src/hooks/useMaterialsData.ts`, `useResearchData.ts`, `useUnifiedMaterialSearch.ts`, `useOptimizationHistory.ts`, `useSubscription.ts`
- `src/data/equipmentRecommendations.ts`, `processTemplates.ts`, `researchProperties.ts`, `regulationDescriptions.ts`
- `src/utils/propertyCategories.ts`
- `src/assets/material-scouting-bg.jpg`, `material-validation-bg.jpg`, `bioprocessing-bg.jpg` if unreferenced after the deletions.

Anything still referenced from the home page / About / Auth / SignUp / Subscriptions stays.

## 4. Admin console

Per your choice, remove all data-management pages. Admin console keeps only **Dashboard** and **Waitlist Signups**.

- `src/App.tsx`: drop the admin routes for `materials`, `suppliers`, `research-materials`, `lab-recipes`, `external-sources`, `excluded-terms`.
- Delete the page files: `MaterialsAdmin.tsx`, `SuppliersAdmin.tsx`, `ResearchMaterialsAdmin.tsx`, `LabRecipesAdmin.tsx`, `ExternalSourcesAdmin.tsx`, `ExcludedTermsAdmin.tsx` and their forms under `src/components/admin/` (`MaterialForm`, `SupplierForm`, `ResearchMaterialForm`, `LabRecipeForm`).
- `src/pages/admin/AdminLayout.tsx`: remove the `Your Data` and `External Sources` sidebar sections. Keep Dashboard + User Management (Waitlist).
- `src/pages/admin/Dashboard.tsx`: rewrite to show only the Waitlist Signups stat + recent signups. Drop the materials/suppliers/research/lab-recipes cards, category pie chart, and country bar chart.

## 5. Backend teardown

Delete edge functions (via `supabase--delete_edge_functions`):
- `ai-material-search`
- `ai-property-lookup`
- `ai-bibliography-search`
- `fetch-material-data`

Also delete their `supabase/functions/<name>/` folders.

One SQL migration (`supabase--migration`) with `DROP TABLE ... CASCADE` for every table tied to these features:

```text
application_match_considerations, application_match_strengths, application_matches,
material_applications, material_properties, material_properties_database,
material_property_sources, material_property_values, material_regulations,
material_sustainability, material_synonyms, materials,
supplier_certifications, supplier_detailed_properties, supplier_properties, suppliers,
research_material_applications, research_material_properties, research_materials,
lab_recipe_materials, lab_recipe_steps, lab_recipes,
bibliography_entries, bibliography_libraries, saved_bibliography_entries,
external_data_sources, excluded_search_terms,
property_lookup_cache, optimization_runs,
daily_usage, monthly_usage, subscriptions
```

Also `DROP FUNCTION` for `search_materials`, `get_user_tier`, `has_tier_access` (no longer referenced once `useSubscription` is gone).

Delete the `material-images` storage bucket in the same migration.

Kept: `user_roles`, `has_role`, `waitlist_signups`, `update_updated_at_column`, and the auth schema — all still needed for admin + waitlist.

## 6. Verification

- `bun run build` clean (no orphan imports).
- `/` renders identically to before.
- `/admin` shows only Dashboard + Waitlist in the sidebar; Dashboard shows only waitlist stats.
- `/platform/...` and `/services` return the 404 page.
- Supabase types regenerate without the dropped tables.

## Technical notes

- `SupplierMoat` on the home page currently reads no data — it's static marketing copy — so dropping the `suppliers` table doesn't break it. It stays.
- `Subscriptions.tsx` currently just redirects to the early-access signup (per project memory), so removing `useSubscription` won't break its behavior; I'll strip the imports and any tier-specific copy referencing the two removed tools.
- Migration uses `DROP ... CASCADE` so residual FKs / policies come along cleanly.
- This is destructive on the DB side — you confirmed "Delete everything." Rows in `materials`, `suppliers`, `research_materials`, `lab_recipes`, `bibliography_*`, and `subscriptions` will be lost.
