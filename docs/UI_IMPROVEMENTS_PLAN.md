# UI Improvements Plan

**Created**: 2026-07-23
**Author**: Principal UI Architect
**Status**: In Progress

> This document tracks the UI improvements sprint. Each task is designed to be implemented sequentially, with progress tracked in `PROJECT_STATUS.md`.

---

## Sprint Overview

| Metric | Value |
|--------|-------|
| Total Tasks | 6 |
| Estimated Duration | ~4.5 hours |
| Priority | Visual polish & UX consistency |
| Dependencies | None (all tasks independent) |

---

## Task-023: Header Navigation Active States

**Status**: ⏳ Pending
**Estimate**: ~30 min
**Files**: `header.component.html`, `header.component.scss`

### Problem
From the screenshot, the active page indicator is a large red/pink glow behind the "Home" link. While visually interesting, it lacks precision and doesn't clearly communicate which page is active across all themes.

### Goals
- Add `routerLinkActive` class binding to navigation links
- Create an animated underline indicator that slides between items
- Ensure visibility across Light, Dark, and Glass themes
- Remove or soften the large background glow

### Implementation Steps
1. [ ] Analyze current `header.component.html` for routerLink usage
2. [ ] Add `routerLinkActive` directive to each nav link
3. [ ] Design animated underline using `::after` pseudo-element with transition
4. [ ] Test on all 3 themes (Light, Dark, Glass)
5. [ ] Verify build passes

### Acceptance Criteria
- Active link has clear visual distinction (color + underline)
- Underline animates smoothly when switching pages
- Works correctly in all themes without `!important`

---

## Task-024: Theme Selector Polish

**Status**: ⏳ Pending
**Estimate**: ~45 min
**Files**: `theme-selector.component.html`, `theme-selector.component.scss`, `theme-selector.component.ts`

### Problem
The theme selector dropdown (visible in screenshot) has a rough checkmark symbol (✔), small swatch samples, and no animation on open/close. The active state indicator could be more elegant.

### Goals
- Replace text checkmark with proper SVG icon
- Enlarge theme swatch previews for better visibility
- Add smooth open/close animation (fade + slide)
- Add glowing border ring on the active theme option

### Implementation Steps
1. [ ] Replace ✔ checkmark with Angular Material icon or inline SVG
2. [ ] Increase swatch sizes from current to ~32×20px
3. [ ] Add CSS transition for dropdown appearance (opacity + transform)
4. [ ] Style active option with animated border glow using semantic tokens
5. [ ] Verify all theme previews accurately represent their colors
6. [ ] Test keyboard accessibility (Tab, Enter, Escape)

### Acceptance Criteria
- Dropdown opens/closes with smooth animation (200ms ease-out)
- Active theme has visible glowing border, not just a checkmark
- Swatches are large enough to distinguish themes at a glance
- No hardcoded colors — all via semantic tokens

---

## Task-025: Brand Logos Interactivity

**Status**: ⏳ Pending
**Estimate**: ~30 min
**Files**: Brand section component (locate via file search)

### Problem
The "Trusted by Leading Brands" section shows brand logos (Nike, Puma, Reebok, Under Armour) as flat dark silhouettes with no interactivity. Low contrast on the Glass theme background.

### Goals
- Add hover effects: opacity increase, subtle scale, and brightness shift
- Improve logo contrast across all themes
- Consider adding brand names on hover via tooltip

### Implementation Steps
1. [ ] Locate the brands section component file
2. [ ] Add hover transitions (opacity 0.6→1.0, scale 1.0→1.05)
3. [ ] Adjust logo filter/brightness per theme for consistent visibility
4. [ ] Add optional tooltip with brand name on hover
5. [ ] Test visual consistency across themes

### Acceptance Criteria
- Logos respond to hover with smooth transitions (300ms)
- All logos maintain minimum WCAG contrast ratio on all themes
- Hover state provides clear visual feedback

---

## Task-026: Footer Glass Morphism

**Status**: ✅ Done (2026-07-24)
**Estimate**: ~60 min
**Files**: `footer.component.html`, `footer.component.scss`

### Problem
The footer (visible in screenshot) uses a solid dark background that doesn't match the Glass theme aesthetic. Links have no hover animations, and category names use inconsistent casing ("people" lowercase vs proper nouns).

### Goals
- Apply glass morphism styling (backdrop-filter, semi-transparent background)
- Add hover animations to all footer links (color shift + slight horizontal slide)
- Normalize category name casing to Title Case
- Ensure footer matches header styling language across themes

### Implementation Steps
1. [ ] Read current `footer.component.html` and `.scss`
2. [ ] Apply backdrop-filter blur + semi-transparent background for Glass theme
3. [ ] Add hover transitions to links: `translateX(4px)` + color change
4. [ ] Fix category casing in HTML template ("People", "Bpla" → verify correct names)
5. [ ] Add subtle top border gradient to separate footer from content
6. [ ] Test on all themes

### Acceptance Criteria
- Footer has glass effect in Glass theme matching the header
- Links animate on hover consistently
- All text uses proper casing
- Footer is visually distinct from page content

---

## Task-027: Badge Styling

**Status**: ⏳ Pending
**Estimate**: ~30 min
**Files**: `header.component.scss`, badge-related components

### Problem
Notification badges (e.g., "6" on the heart icon) appear small and may lack visibility on certain themes. No animation when count changes.

### Goals
- Increase minimum badge size to 18×18px for readability
- Add pop animation when count changes
- Ensure contrast on all themes

### Implementation Steps
1. [ ] Locate badge styling in header or shared components
2. [ ] Set min-width/height to 18px with proper border-radius
3. [ ] Add @keyframes pop animation for count changes
4. [ ] Verify badge colors use semantic tokens (--state-danger, etc.)
5. [ ] Test visibility on Light, Dark, and Glass themes

### Acceptance Criteria
- Badges are readable at 12px font minimum
- Badge pops in when count changes (200ms spring-like animation)
- High contrast text on badge background across all themes

---

## Task-028: Footer Information Architecture

**Status**: ✅ Done (2026-07-24)
**Estimate**: ~45 min
**Files**: `footer.component.html`, `footer.component.scss`

### Problem
The footer has empty column descriptions (hidden aria-labels with no visible content), no newsletter subscription, and no payment method indicators.

### Goals
- Remove empty/hidden column descriptions that serve no purpose
- Add newsletter subscription form (email input + subscribe button)
- Add payment method icons (Visa, Mastercard, Stripe, etc.)
- Consider adding social media links

### Implementation Steps
1. [ ] Audit footer HTML for empty/hidden elements
2. [ ] Design newsletter subscription UI (compact, matches theme)
3. [ ] Add payment icons row at footer bottom
4. [ ] Style new elements with semantic tokens
5. [ ] Test responsive layout (mobile: stacked, desktop: columns)

### Acceptance Criteria
- No empty or purely decorative hidden elements remain
- Newsletter form is functional (visual only — backend integration future task)
- Payment icons display correctly and are recognizable
- Footer collapses gracefully on mobile (< 768px)

---

## Progress Tracking

| Task | Status | Completed Date | Notes |
|------|--------|----------------|-------|
| Task-023 | ⏳ Pending | — | Nav active states |
| Task-024 | ⏳ Pending | — | Theme selector polish |
| Task-025 | ⏳ Pending | — | Brand logos interactivity |
| Task-026 | ✅ Done | 2026-07-24 | backdrop-filter, hover animations, theme variants |
| Task-027 | ⏳ Pending | — | Badge styling |
| Task-028 | ✅ Done | 2026-07-24 | Newsletter, social links, payment icons, IA restructuring |

---

## Implementation Order

Tasks should be executed in numerical order (023 → 028) to maintain a top-to-bottom visual flow through the page.

---

*This document is maintained alongside `PROJECT_STATUS.md`. Update both when completing tasks.*