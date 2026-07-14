
# Phase 4 — Data ingestion & storage strategy

The schema and CRUD already exist. This phase adds the **workflows and infrastructure** that populate three data domains: general materials, supplier grades, and company/producer profiles.

## 1. Data-authoring pipeline

Every material entry passes through the same funnel, ordered by data quality:

```text
  Admin manual entry ──┐
                       ├──► ai_material_drafts (pending)
  External DB import ──┤            │
                       │            ▼ admin review
  Lovable AI fill  ────┘   general_materials + child tables
                                    │
                                    ▼
                              status = 'published'
```

- **Draft table stays authoritative.** Nothing writes directly to `general_materials` from an automated source. `ai_material_drafts.generated_payload` (JSONB) holds the proposed values + citations, admin approves, apply-function copies fields into the canonical tables.
- **Source attribution.** Every property/regulation/certification row already has `source_id`. New rows added by external importers or AI must reference a row in `sources` (name, url, type).

## 2. External database connectors (edge functions)

Three edge functions, each hit only by admin actions from the CRUD UI:

| Function | Provider | Trigger | Writes to |
|---|---|---|---|
| `fetch-materials-project` | Materials Project (`MATERIALS_PROJECT_API_KEY`) | Admin "Import from Materials Project" on a material | `ai_material_drafts` |
| `fetch-pubchem` | PubChem REST (no key) | Admin "Import from PubChem" | `ai_material_drafts` |
| `fetch-regulations` | ECHA / CAMEO public JSON | Admin "Fetch regulations" on a material | `ai_material_drafts` (as regulation payload) |

Each function:
- Accepts `{ general_material_id, query }`.
- Returns a normalised payload `{ properties[], regulations[], sources[], meta }`.
- Persists that payload as a new `ai_material_drafts` row with `model='external:<provider>'`, `status='pending'`.

## 3. Lovable AI fill

Two entry points, both admin-gated:

- **Manual, per-material** — Admin clicks *Draft with AI* on a `general_materials` row. `ai-draft-material` edge function calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with a structured-output schema mirroring `general_materials` + `material_properties` + `sustainability_indicators`. Result goes into `ai_material_drafts`.
- **Auto on request** — When a user inserts into `material_requests`, a Postgres trigger inserts a `pending` `ai_material_drafts` row with the material name + user context. A cron job (pg_cron, every 5 min) picks up pending rows tagged `auto=true` and invokes the same edge function via `net.http_post`. Result stays as a draft until admin publishes.

Admin toggle: a new `general_materials.auto_ai_enabled boolean default true` column lets admin disable auto-drafting per material.

### Draft review UI (admin only)
New page `/admin/drafts` lists pending `ai_material_drafts`, shows the diff between current material record and proposed payload, and offers:
- **Apply** → RPC `apply_material_draft(draft_id)` merges payload into canonical tables inside a single transaction, sets draft `status='applied'`.
- **Reject** → sets `status='rejected'` with reviewer note.

## 4. Supplier grade authoring

Producers are the primary authors of grade data.

- Company row is **admin-provisioned** (per your earlier decision). Admin CRUD already covers `companies` and `profiles.company_id` linkage.
- Producers use `/app/producer` (already built) plus a new *Add grade* form that writes to `supplier_material_grades` with `status='draft'`.
- Admin queue at `/admin/grade-approvals` shows `status='pending'` grades; approve → `status='approved'` (RLS then exposes to premium buyers). This uses the existing table, no schema change beyond adding a `submitted_at` and `reviewer_notes` column.
- Grade child data (properties, sustainability, certifications) uses the same polymorphic tables with `owner_type='supplier_grade'`. Producers can write to their own via existing `can_write_owner` function.

## 5. Company / producer profile authoring

- `companies` is edited by admins in `/admin/companies` (already).
- Producers get an *Edit company profile* form on `/app/producer` that hits an RPC `update_own_company` (SECURITY DEFINER, checks `profiles.company_id = _company_id AND is_producer(auth.uid())`) — this avoids needing a broad UPDATE policy on `companies` for producers.
- Verification remains admin-only (`verified_status` is not editable by producers).

## 6. File storage

Three new buckets via `storage_create_bucket`:

| Bucket | Public | Path convention | Read | Write |
|---|---|---|---|---|
| `datasheets` | private | `<company_id>/<grade_id>/<filename>` | admin + premium + owning producer | admin + owning producer |
| `company-logos` | public | `<company_id>/logo.<ext>` | anyone (used on premium supplier cards) | admin + owning producer |
| `lca-reports` | private | `<owner_type>/<owner_id>/<filename>` | admin + premium | admin + producer if owner is their grade |

RLS on `storage.objects` uses `split_part(name, '/', 1)::uuid = profiles.company_id` for producer writes, and `is_premium(auth.uid())` for premium reads on the private buckets.

`supplier_material_grades.datasheet_url` and `companies.logo_url` continue to store the public/signed URL string; upload UI writes into the bucket then updates the URL column.

## 7. Schema deltas required

One migration:

- `general_materials`: add `auto_ai_enabled boolean not null default true`.
- `supplier_material_grades`: add `submitted_at timestamptz`, `reviewer_notes text`.
- `ai_material_drafts`: add `source text` (values: `admin`, `materials_project`, `pubchem`, `echa`, `ai`, `auto_ai`), `applied_at timestamptz`, `reviewer_notes text`.
- New RPCs: `apply_material_draft(draft_id uuid)`, `update_own_company(...)`.
- New trigger: `material_requests_after_insert` → seed `ai_material_drafts` row with `source='auto_ai'`.
- New cron: `process-pending-ai-drafts` every 5 min invoking `ai-draft-material` edge function.

## 8. Build order

1. Migration (schema deltas + RPCs + trigger).
2. Storage buckets + RLS.
3. Edge functions: `ai-draft-material`, `fetch-materials-project`, `fetch-pubchem`, `fetch-regulations`, `apply-material-draft` (thin wrapper if we prefer RPC via client).
4. Admin UI: `/admin/drafts` review page, "Draft with AI" / "Import from…" buttons on material form.
5. Admin UI: `/admin/grade-approvals` queue.
6. Producer UI: Add-grade form + company-profile edit + logo/datasheet upload widgets on `/app/producer`.
7. pg_cron job (via `supabase--insert`, not migration, since it embeds the anon key).

## Open item to confirm before build

Auto-drafting on every `material_requests` insert will consume Lovable AI credits per user request. Confirm you want it on by default; if not, we flip the trigger to only enqueue the draft without invoking AI, and admin manually runs the AI step.
