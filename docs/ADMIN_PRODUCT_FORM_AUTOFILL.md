# Admin product form: smart fill (wishlist)

**Status:** idea / backlog — not scheduled  
**Branch:** `docs/admin-product-form-autofill`  
**Captured:** 2026-09-09  
**Surface:** `/admin` → Add / Edit product (`ProductFormComponent`)

This is a captured wish, not an implementation spec. Use it to resume the idea later. Do not treat anything below as a decision until a follow-up task is opened.

---

## Why

Creating a product in admin is slow. The form asks for a lot of copy and media before it is useful:

| Block | Fields today |
|-------|----------------|
| Metrics | category, price, stock |
| Name | `name_en` (required), `name_ru`, `name_ua` |
| Description | `description_en`, `description_ru`, `description_ua` |
| Media | images, optional 3D / AI 3D |
| Specs | key/value `FormArray` |

HTML `placeholder` attributes are only hints (`PRODUCT_NAME_PLACEHOLDER`, …). They do not fill the form. The existing AI stack on this page is **image → 3D model** (Tripo3D, Hunyuan, Meshy, Luma, Hugging Face TripoSR). There is no copy / vision-to-text path.

Goal: make “empty form → publishable product” faster, and slightly improve the form UX around that.

---

## Three levels (do in order)

Each level is useful on its own. Later levels reuse the same “apply draft to form” path so UI does not fork.

```
[ Fill sample ]  →  [ From page ]  →  [ AI describe from photos ]
     L0                  L1                      L2
  static fixture     read what is already      generate long copy
                     on the page               (vision + text)
```

All three must **patch a draft**, never auto-save the product. Prefer merge: fill empty controls, ask before overwriting filled ones. Support **Undo** for the last apply.

### L0 — static values as real form data (simplest)

Prepare a static fixture and apply it as control values (not as HTML placeholders).

- One TypeScript/JSON fixture, e.g. next to the form: sample name / description in EN, RU, UA, price, stock, 1–2 spec rows.
- Admin action: **Fill sample** (demo, onboarding, screenshots, marketplace listing).
- Optional: `?prefill=demo` on `/admin/products/new` for repeatable demos.
- Do not upload fake images in L0 unless we already have a local demo asset; copy-only is enough.

**Done when:** one click fills empty name/description/metrics with coherent sample data; existing filled fields stay unless the user confirms overwrite.

### L1 — read the page, fill name / description / extras (no AI)

An Angular service (and small helpers) looks at what is already on the create/edit page and proposes values.

Primary source = **this admin page**, not an external scrape:

1. Uploaded image filenames and order (`chair-oak.jpg` → name hint).
2. Fields already filled (category, price, a name in one locale).
3. Spec keys/values if present.
4. Later: EXIF / alt text if we start storing it.

Optional extras (only if L1 primary is done and still needed):

- Paste a storefront or supplier URL → `og:title`, `og:description`, JSON-LD `Product`.
- Clipboard text → split into name vs body.

Keep L1 **deterministic and fast** (no model, works offline for the primary source). Output a `ProductFormDraft` and reuse the same apply/merge as L0.

**Done when:** after images (and/or a few fields) exist, one click proposes name + short description in the active locales without calling an LLM.

### L2 — AI: rich description from page data, especially photos (free, easy)

Same draft pipeline. The model receives:

- product photos already on the form (preferred signal);
- L1 draft + any typed fields;
- locale list `en` / `ru` / `ua`;
- a prompt: long commercial description, specs guesses, keep claims modest.

UX: **Generate description** → preview (tabs per locale) → Apply / Discard. Never write the product until the admin confirms.

#### Free + easy (preference order for this project)

“Free” here means **no paid vendor by default**. Hosted free tiers still need a key and have limits; local/browser options have no API bill.

| Option | Cost | Vision (photo → text) | Fit |
|--------|------|------------------------|-----|
| **Hugging Face Inference** (BLIP / SmolVLM / similar) | free tier; token already exists in Integrations for TripoSR | yes | Reuse `ai.hfToken` and admin Integrations. Lightest *new* surface. |
| **Google Gemini Flash** (AI Studio) | free quota, one API key | yes, strong | Very easy HTTP call from Nest; good photo copy. |
| **Groq** | free tier, one key | check current vision models | Fast text expansion after a captioner. |
| **Ollama** local (`llava` / `minicpm-v`) | free, user’s GPU/RAM | yes | Same “custom URL” pattern as local 3D worker. Zero cloud. |
| **Chrome Prompt API / Gemini Nano** | free, on-device | limited | Prototype only; not all browsers. |

**Recommended first experiment:** Hugging Face vision caption (token already in admin) **or** Gemini Flash if HF vision quality is weak. Do **not** add a second paid 3D-style provider. Do **not** mix this with `AiGenerationProvider` (that interface is 3D task polling).

New backend piece should be a small **copy/vision** module (caption + expand + translate to EN/RU/UA), called from admin, keys in existing Integrations — not a new settings app.

**Done when:** with at least one product photo, admin can generate a long description in EN/RU/UA, preview it, and apply it to the form, with a documented free path (HF and/or local).

---

## Admin UI / UX (same initiative, small)

The form should make smart-fill obvious without cluttering the 3D block.

Suggested, not locked:

- Compact **Smart fill** control near name/description (menu: Fill sample / From page / AI describe), not a third media card.
- Sticky footer already has save — keep fill actions next to copy, not next to 3D generate (avoid mixing “AI 3D” and “AI text”).
- Preview sheet for L2; inline patch for L0/L1.
- Disabled + tooltip when L1 has nothing to read (no images, empty form) or L2 has no provider/key.
- Mobile: one menu, full-width preview; follow `docs/ADMIN_MOBILE_UX.md`.
- Empty-state hint on Add product: “Upload photos, then fill from page or generate copy.”
- No `!important`. Tokens / specificity only (`docs/AI_CONSTITUTION.md`, Epic E).

Polish is **incremental** (spacing, hierarchy, one toolbar), not a redesign of catalog/sidenav.

---

## Constraints (when this becomes a task)

- Touch `product-form` + a small prefill service + optional Nest copy endpoint. Do not refactor 3D generation.
- Keep EN / RU / UA. Generated copy must land in the matching controls.
- Admin stays in control: draft → preview → apply → user saves.
- Do not scrape arbitrary sites in the browser in a way that breaks CORS; URL import belongs on the backend if we do it.
- Marketplace zip: sample fixture is fine; paid API keys stay out of the template.

---

## Suggested implementation slices (later)

1. Fixture + **Fill sample** + merge/undo. (L0)
2. `ProductFormPrefillService` from images/fields + same apply path. (L1)
3. Smart fill menu + empty-state copy + mobile check. (UX)
4. Free vision/text provider + preview dialog. (L2)

---

## Current code (orientation)

- Form UI: `src/admin/pages/products/product-form/`
- Form controls: `createForm()` — names, category, price, stock, descriptions, specifications
- 3D AI (unrelated pipeline): `src/admin/services/ai-generation.service.ts`, `backend/src/ai-generation/`
- Integrations (keys): `src/admin/pages/integrations/`
- Related docs: [AI_PROVIDERS_ARCHITECTURE_PLAN.md](AI_PROVIDERS_ARCHITECTURE_PLAN.md), [LOCAL_AI_SETUP.md](LOCAL_AI_SETUP.md), [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

---

## Open questions (resolve when starting work)

1. Is L1 only “this admin page”, or also “paste supplier URL”?
2. First L2 provider: reuse Hugging Face token, or Gemini Flash?
3. Should AI also suggest category / specs, or only name + description?
4. Overwrite policy: always ask, or “fill empty only” with an explicit overwrite toggle?

---

## Resume checklist

When picking this up:

1. Re-read this file and the current `product-form` template (it may have changed).
2. Open a real task from `docs/templates/task-template.md` (next `task_012_…`) with a tight L0 or L0+UX slice.
3. Do not start L2 until L0 apply/merge exists — otherwise three UIs will fight the same controls.
