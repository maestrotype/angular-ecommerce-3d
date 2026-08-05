import { ThemeDimension, ThemeId } from './theme.model';

/** Semantic tokens that must resolve after any theme is applied (F3 validation). */
export const REQUIRED_SEMANTIC_TOKENS = [
  '--surface-primary',
  '--surface-secondary',
  '--text-primary',
  '--text-secondary',
  '--border-default',
  '--interactive-primary',
  '--interactive-danger',
] as const;

export type RequiredSemanticToken = (typeof REQUIRED_SEMANTIC_TOKENS)[number];

export const ALL_THEME_DIMENSIONS: ThemeDimension[] = [
  'appearance',
  'typography',
  'spacing',
  'radius',
  'elevation',
  'density',
  'motion',
  'layout',
  'effects',
];

/** Maps theme id → DOM `data-theme` attribute (1:1 today; extension point). */
export const THEME_DOM_ID: Record<ThemeId, string> = {
  light: 'light',
  dark: 'dark',
  glass: 'glass',
  'dark-glass': 'dark-glass',
};
