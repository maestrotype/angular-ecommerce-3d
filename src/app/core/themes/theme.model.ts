/**
 * Theme Engine v2 (Epic F / ADR-012)
 *
 * TypeScript catalog mirrors SCSS `[data-theme]` partials — it does NOT inject
 * CSS variables at runtime. Visuals come from:
 *   src/styles/themes/_default.scss | _dark.scss | _glass.scss
 *   src/admin/styles/_admin-*.scss
 */

export type ThemeId = 'light' | 'dark' | 'glass' | 'dark-glass';

export type ThemeArea = 'frontend' | 'admin';

/** Nine dimensions from ADR-004 — listed per theme to document scope of overrides. */
export type ThemeDimension =
  | 'appearance'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'elevation'
  | 'density'
  | 'motion'
  | 'layout'
  | 'effects';

/** Mini palette for theme-selector previews — values aligned with SCSS tokens. */
export interface ThemePreviewPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  success: string;
  warning: string;
  error: string;
  /** CSS blur for glass previews, e.g. '10px' or '0' */
  glassBlur: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  /** Where this theme is available in the UI */
  areas: ThemeArea[];
  /** SCSS source of truth for this theme */
  scssSource: string;
  /** Dimensions customized relative to semantic defaults (ADR-004) */
  dimensions: ThemeDimension[];
  preview: ThemePreviewPalette;
}

/** @deprecated Use ThemeDefinition — kept for existing imports */
export type Theme = ThemeDefinition;
