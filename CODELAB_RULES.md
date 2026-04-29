# Code Quality Rules for Antigravity

## 1. No `!important`
Do NOT use `!important` in CSS/SCSS. Instead, use higher specificity selectors or proper structural overrides. `!important` makes maintenance difficult and violates the user's explicit coding standards.

## 2. Use Theme Variables
NEVER hardcode hex, rgb, or hsl colors. Always use the provided CSS variables (e.g., `var(--color-text-primary)`). This ensures theme consistency and allows colors to change dynamically based on the active theme.

## 3. High Fidelity Glassmorphism
When building for the "Glass" theme:
- Use `backdrop-filter: blur(Npx)`.
- Use semi-transparent backgrounds with white borders.
- Use Micro-animations for luxury feel.
- Ensure text contrast is high (use dark variables on light glass).
