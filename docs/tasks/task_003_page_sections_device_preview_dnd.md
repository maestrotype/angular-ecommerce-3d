# Task 003: Page Sections — Device Preview Fix & Drag-Drop UX

## Status: 🔄 IN PROGRESS (Started 2026-08-09)

---

## Problem Statement

The **Page Sections** admin view (`/admin/sections`) has two groups of critical UI issues:

### 1. Device Emulator — incorrect rendering

**Symptoms** (from user screenshots):
- **Fold Mobile** — device frame appears incorrectly sized; content bleeds out or clips unexpectedly
- **Mobile (iPhone)** — the emulator "collapses" (схлопнулся) when switching to mobile mode; device frame becomes too small relative to the panel

**Root Cause**:
- `.device-emulator` has a hardcoded `height: 3500px` for **all** preview modes — including mobile (780px) and fold (680px)
- The `:host` computed height is `calc(3500px * scale)` regardless of mode — for mobile at `scale: 0.68` this is `2380px`, which overfills the `architect-content` container
- For `fold` mode: `width: 323px * scale(0.7) = 226px` — too narrow to fit inside `architect-card` (min-width: 380px), causing overflow/clip
- No `--preview-height-raw` variable is applied to `.device-emulator` — the device frame is not bounded to the real device screen height

### 2. Section Drag & Drop — poor UX

**Symptoms**:
- **In the sections table** — dragging a row shows a generic full-row clone, no clear visual feedback
- **In the Architect preview** — `cdk-drag-preview` renders in `<body>` **outside** the scaled container → appears as a giant unscaled block while dragging
- Conflict between drag gesture and click-to-edit on section wrappers in the Architect view

---

## Root Cause Analysis

### Device emulator sizing

| Mode | `--preview-width-raw` | `--preview-height-raw` | `--preview-scale` | Device frame height |
|------|-----------------------|------------------------|-------------------|---------------------|
| desktop | 1200px | *(none — scrollable)* | 0.46 | 3500px (correct — long page) |
| tablet | 768px | 1024px | 0.58 | **3500px ❌ should be 1024px** |
| mobile | 390px | 780px | 0.68 | **3500px ❌ should be 780px** |
| fold (closed) | 323px | 680px | 0.70 | **3500px ❌ should be 680px** |
| fold (expanded) | 700px | 900px | 0.52 | **3500px ❌ should be 900px** |

The fix: `.device-emulator` must use `height: var(--preview-height-raw, 3500px)` so that real device modes get a bounded frame, while the desktop remains the full-page scroll.

### CDK drag-preview scaling

`cdk-drag-preview` is appended to `<body>` by the CDK. Since `.device-emulator` uses `transform: scale(0.46…0.70)`, the preview exits the scaling context → renders at 1:1 size → looks enormous.

Fix: use a custom `*cdkDragPreview` template that renders only a compact badge (section name + type icon), not the full scaled section.

---

## Planned Changes

### Files to modify

| File | Change |
|------|--------|
| `admin-section-preview.component.scss` | Fix `:host` height, `.device-emulator` to use `--preview-height-raw`, fold expanded height, smooth transitions |
| `admin-section-preview.component.html` | Add `*cdkDragPreview` badge template per section |
| `section-list.component.scss` | Improve `cdk-drag-preview` and `cdk-drag-placeholder` for the table rows |

### Detailed fix plan

#### `admin-section-preview.component.scss`

```scss
// BEFORE
:host {
  height: calc(3500px * var(--preview-scale)); // ❌ always 3500px
}
.device-emulator {
  height: 3500px; // ❌ ignores --preview-height-raw
}

// AFTER
:host {
  // For desktop: full scrollable height
  // For devices: bounded to device screen height (scaled)
  height: calc(var(--preview-height-raw, 3500px) * var(--preview-scale));
}
.device-emulator {
  height: var(--preview-height-raw, 3500px);
  // full-page-preview inside scrolls independently
}
```

- Add `--preview-height-raw` for fold-expanded: `900px`
- `:host` width/height smooth transition on mode switch
- Fix fold min-width issues in `.architect-content`

#### `admin-section-preview.component.html`

```html
<!-- Custom CDK drag preview — compact badge only -->
<div *cdkDragPreview class="drag-preview-badge">
  <mat-icon>drag_indicator</mat-icon>
  <span>{{ s.type | titlecase }}</span>
</div>
```

#### `section-list.component.scss`

```scss
// Styled drag preview for table rows
.cdk-drag-preview.list-row-item {
  background: var(--surface-elevated);
  border: 1px solid var(--interactive-primary);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  opacity: 0.95;
}

.cdk-drag-placeholder {
  background: rgba(var(--interactive-primary-rgb), 0.08);
  border: 2px dashed var(--interactive-primary);
  border-radius: 8px;
  opacity: 1; // visible placeholder
}
```

---

## Acceptance Criteria

- [ ] Switching to **mobile** mode shows a clear phone-shaped frame (390×780) with content scrollable inside
- [ ] Switching to **fold** mode shows a narrow phone frame (323×680)
- [ ] Clicking fold button a second time expands to tablet-fold size (700×900)
- [ ] Dragging a row in the **sections table** shows a clean styled row preview, not a raw clone
- [ ] Dragging in the **Architect preview** shows a compact badge (not a full-page block)
- [ ] Click-to-edit on architect sections still works after drag system improvements
- [ ] No layout overflow or clipping on any device mode
- [ ] Smooth CSS transitions when switching between device modes

---

## References

- Component: [`admin-section-preview.component`](../src/admin/components/sections/section-preview/)
- Component: [`section-list.component`](../src/admin/pages/sections/section-list/)
- Related Epic: H7 — Admin UX Polish
- Screenshots: user-reported 2026-08-09 (fold mobile broken, mobile collapsed)
