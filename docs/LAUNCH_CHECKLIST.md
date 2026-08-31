# Launch Checklist (Phase A5)

Complete before publishing **v1.0.0** and opening public sales.

---

## A5.1 — Platform

- [ ] Choose primary platform: ThemeForest / CodeCanyon / Gumroad / own site
- [ ] Create seller account and payout details
- [ ] Set item title, tags, category (JavaScript / Angular / eCommerce)

See [MARKETPLACE_LICENSE.md](MARKETPLACE_LICENSE.md) for license wording.

---

## A5.2 — Legal & listing

- [ ] Regular + Extended license text on product page (or platform defaults)
- [ ] [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) included in zip
- [ ] [CHANGELOG.md](../CHANGELOG.md) shows v1.0.0 scope
- [ ] Listing copy: [marketing-assets/MARKETPLACE_DESCRIPTION.md](../marketing-assets/MARKETPLACE_DESCRIPTION.md)
- [ ] Honest feature matrix (PayPal mock, Stripe real, Swagger at `/api/docs`)

---

## A5.3 — Support

- [ ] Support email active: **support@maestrotype.com** (see [SUPPORT.md](SUPPORT.md))
- [ ] Auto-reply or helpdesk for 24–48h SLA
- [ ] Optional: Discord / GitHub Discussions link in README

---

## A5.4 — Soft launch (beta)

- [ ] 2–3 trusted buyers install from zip / private repo
- [ ] Collect feedback: install time, broken docs, missing assets
- [ ] Fix blockers before public launch
- [ ] Log results in [MARKETPLACE_LAUNCH_ROADMAP.md §6](MARKETPLACE_LAUNCH_ROADMAP.md)

---

## A5.5 — Release tag

Prerequisites: A1–A4 exit gates green, CI passing on `main`.

```bash
# After merge to main:
git checkout main && git pull
git tag -a v1.0.0 -m "v1.0.0 — Track A marketplace launch"
git push origin v1.0.0
```

- [ ] GitHub Release notes from CHANGELOG v1.0.0 section
- [ ] Upload marketplace zip (exclude `node_modules`, `.env`, `test-results`)
- [ ] Publish listing

---

## Pre-launch QA (manual)

| Check | Done |
|-------|------|
| Fresh clone → GETTING_STARTED ≤30 min | ☐ |
| `npm run demo:models` + `backend npm run seed` | ☐ |
| `docker compose up` | ☐ |
| 3D viewer on shop / PDP | ☐ |
| Stripe test checkout | ☐ |
| Theme switch (light / dark / glass) | ☐ |
| Mobile 375px storefront | ☐ |
| `npm run screenshots:capture` → listing PNGs | ☐ |
| Demo video (VIDEO_SCRIPT.md) | ☐ |

---

## Zip packaging (buyer deliverable)

```bash
npm run pack:marketplace
# → dist-marketplace/angular-ecommerce-3d-v1.0.0.zip
```

See [marketing-assets/LISTING_PACK.md](../marketing-assets/LISTING_PACK.md). The pack uses `git archive` (committed files only) and refuses `.env`.

Buyer first steps inside zip: open `START_HERE.md`.

---

*Track A complete when this checklist and roadmap §2 score ≥ 8/10.*
