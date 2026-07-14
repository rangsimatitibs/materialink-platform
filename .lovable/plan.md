
# Phase 1 — Database Schema + Role System

Scope: build the full backend data model and role/access foundation for the new platform. No UI, no page routes, no styling changes. Home page and existing styling/fonts stay exactly as they are. Admin will later manage content through this schema; UI comes in Phase 2.

## Roles

Collapse `app_role` enum to: `free`, `researcher`, `industrial_premium`, `producer`, `admin`.

- Existing `admin` rows in `user_roles` are preserved.
- Any other role rows are remapped to `free` before the enum swap (safe default; no admins affected).
- Enum swap is done via a new enum + column cast + drop old, so the change is atomic.
- `has_role(_user_id, _role)` stays as-is (still `SECURITY DEFINER`, still used by RLS).
- New helper functions:
  - `is_premium(uid)` → true for `industrial_premium` or `admin`
  - `is_paid(uid)` → true for `researcher`, `industrial_premium`, `admin`
  - `is_producer(uid)` → true for `producer` or `admin`
  Each `STABLE SECURITY DEFINER` with `search_path=public`.

## Tables (all in `public`)

Every table below gets: standard `id uuid PK`, `created_at`, `updated_at` with trigger, RLS enabled, and explicit GRANTs.

### Identity / org
- `profiles` — 1:1 with `auth.users`, holds `full_name`, `company_id` (nullable), `account_type` (mirrors primary role for quick reads). Auto-created via `handle_new_user` trigger on `auth.users`.
- `companies` — `company_name`, `slug`, `logo_url`, `country`, `website`, `description`, `company_type` (`producer` | `buyer` | `other`), `sustainability_focus`, `verified_status` (`pending`|`approved`|`rejected`).

### Taxonomy (admin-managed lookups)
- `material_categories` (name, slug, parent_id nullable for subcategories)
- `applications` (name, industry, description)
- `regulations` (name, region, description)
- `certifications` (name, issuing_body, region, description)
- `sources` (source_type, title, url, doi, organization, publication_year, notes)

### General materials layer
- `general_materials` — name, slug, short_description, category_id, chemical_formula, chemical_structure_url, sustainability_summary, end_of_life_summary, production_scale_maturity, data_confidence (`high`|`medium`|`low`|`ai_assisted`|`literature`|`supplier_reported`), status (`draft`|`published`).
- `general_material_synonyms` — material_id, synonym.
- `general_material_tags` — material_id, tag.

### Supplier / producer layer
- `supplier_material_grades` — general_material_id, company_id, grade_name, description, production_scale, availability_type (`wholesale`|`on_demand`|`pilot`|`industrial`), moq, country_of_production, uniqueness, datasheet_url, verified_status, premium_visibility (bool), status (`draft`|`pending_review`|`approved`|`rejected`).

### Polymorphic property/relation tables
Use `owner_type` (`general_material`|`supplier_grade`) + `owner_id` to serve both layers from one table (as your plan specified).

- `material_properties` — property_name, value_min, value_max, exact_value, unit, test_standard, source_id, confidence_level.
- `material_applications` — application_id.
- `material_regulations` — regulation_id, status, evidence_url, notes.
- `material_certifications` — certification_id, status, document_url, expiry_date.
- `sustainability_indicators` — bio_based_content, recycled_content, carbon_footprint_value, carbon_footprint_unit, lca_available, epd_available, carbon_credits, notes.

### User workflows
- `saved_materials` — user_id, owner_type, owner_id.
- `material_comparisons` — user_id, name, items jsonb.
- `introduction_requests` — user_id, supplier_grade_id, company_id, application, quantity, timeline, message, status (`submitted`|`reviewing`|`introduced`|`in_discussion`|`closed_won`|`closed_lost`), deal_value, success_fee_status.
- `material_edit_reports` — reporter_user_id, owner_type, owner_id, reason, details, status.
- `material_requests` — user_id, description, application, notes, status (for "can't find it" submissions).

### AI fill-in cache
- `ai_material_drafts` — general_material_id nullable, prompt, generated_payload jsonb, model, reviewed_by, status (`pending`|`approved`|`rejected`). Used later when admin triggers Lovable AI to draft a missing profile.

## RLS policy summary (plain English)

- **profiles**: user can read/update their own row; admins can read/update all.
- **companies**: producers can read/update their own company; premium + admin can read approved companies; public/free users cannot read.
- **Taxonomy tables** (categories, applications, regulations, certifications, sources): everyone authenticated can read; only admins can write.
- **general_materials + synonyms + tags**: any authenticated user (free and up) can read `status='published'`; admins write. Public visitors (anon) get no read access — matches "must create account to see database".
- **supplier_material_grades + linked polymorphic rows scoped to a supplier_grade**: readable only by `industrial_premium` and `admin`. Producers can read/write their own company's grades (draft/pending). No visibility to free/researcher — enforced at the row level, so non-premium users literally cannot fetch supplier rows.
- **Polymorphic tables** (`material_properties`, `material_applications`, `material_regulations`, `material_certifications`, `sustainability_indicators`): a row is readable if the underlying owner row is readable. Enforced via `EXISTS` subqueries against `general_materials` or `supplier_material_grades` combined with role checks.
- **saved_materials, material_comparisons, material_requests, material_edit_reports**: owner-only (`user_id = auth.uid()`); admins can read all.
- **introduction_requests**: buyer sees their own; producer sees requests for their company's grades; admin sees all.
- **ai_material_drafts**: admin-only.

## GRANTs

Every public table gets the correct grants in the same migration as `CREATE TABLE`. Default pattern:

- `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;`
- `GRANT ALL ON public.<table> TO service_role;`
- `anon` is granted `SELECT` only on nothing here — the platform is fully gated (no public reads of any content table).

## Frontend impact this phase

Minimal, non-visual only:
- Regenerated `src/integrations/supabase/types.ts` (auto).
- `AuthContext` gains a `role` field alongside `isAdmin` so future gating code can read it. No UI changes, no route changes, no style changes.
- Admin dashboard/waitlist page untouched.

## Out of scope (Phase 2+)

- All new admin CRUD pages (materials, categories, companies, supplier grades, approvals).
- Authenticated dashboard, search, material profile pages, supplier layer UI, compare, saved library.
- Producer dashboard, introduction request workflow UI.
- External DB linking + Lovable AI fill-in edge function (schema is ready for it via `ai_material_drafts` + `sources`).
- Pricing / paywall wiring; per current memory rule, upgrade CTAs will continue to route to the early-access waitlist when UI is built.

## Deliverable

One Supabase migration containing: enum change, all tables, indexes on FKs + slugs, `updated_at` triggers, RLS enable + policies, GRANTs, helper role functions, `handle_new_user` trigger for `profiles`. Plus a tiny non-visual `AuthContext` update to expose the current role.
