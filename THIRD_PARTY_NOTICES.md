# Third-Party Notices

This project includes or depends on open-source software. Below are the primary
dependencies and their licenses. For the full dependency tree, run
`npm ls --all` in the repo root and `backend/` respectively.

## Project license

**angular-ecommerce-3d** (frontend + documentation) — [MIT License](../LICENSE)

**angular-ecommerce-backend** — MIT License (see `backend/package.json`)

## Bundled demo assets

| Asset | Location | License |
|-------|----------|---------|
| Duck, Avocado, WaterBottle `.glb` | `src/assets/demo/models/` | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) — [Khronos glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models) |
| Product thumbnail SVGs | `src/assets/demo/products/` | MIT (same as this project) |

## Frontend runtime dependencies (summary)

| Package | License | Notes |
|---------|---------|-------|
| @angular/* | MIT | Google Angular framework |
| @angular/material, @angular/cdk | MIT | Angular Material |
| three | MIT | 3D rendering |
| rxjs | Apache-2.0 | Reactive extensions |
| @ngx-translate/core | MIT | i18n |
| @stripe/stripe-js | MIT | Stripe.js loader |
| chart.js, ng2-charts | MIT | Admin charts |
| express | MIT | SSR server |
| zone.js | MIT | Angular zone |

## Backend runtime dependencies (summary)

| Package | License | Notes |
|---------|---------|-------|
| @nestjs/* | MIT | NestJS framework |
| typeorm | MIT | ORM |
| pg | MIT | PostgreSQL client |
| passport, passport-jwt | MIT | Authentication |
| bcrypt | MIT | Password hashing |
| class-validator, class-transformer | MIT | DTO validation |
| stripe | Apache-2.0 | Stripe server SDK |
| cloudinary | MIT | Optional media hosting |
| nodemailer | MIT-0 | Email |
| axios | MIT | HTTP client |

## Development & tooling

| Package | License |
|---------|---------|
| TypeScript | Apache-2.0 |
| Playwright | Apache-2.0 |
| Jest | MIT |
| ESLint, Prettier | MIT |
| webpack | MIT |

## Fonts & icons

- **Material Icons** — Apache-2.0 ([Google Fonts / Material Symbols](https://fonts.google.com/icons))
- System UI fonts via CSS `font-family` stacks in theme tokens

## External services (not shipped)

Buyers must obtain their own accounts and API keys for:

- PostgreSQL hosting
- Stripe / LiqPay / PayPal
- Cloudinary (optional)
- Remove.bg, Tripo3D / Meshy / other AI providers (optional)

## Disclaimer

Third-party packages are subject to their own licenses. This file is provided
for marketplace transparency and does not replace the full license text in each
dependency's repository.
