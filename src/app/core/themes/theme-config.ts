import { ThemeArea, ThemeDefinition } from './theme.model';
import {
  lightTheme,
  darkTheme,
  glassTheme,
  darkGlassTheme,
} from './theme-definitions';

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  lightTheme,
  darkTheme,
  glassTheme,
  darkGlassTheme,
];

export const DEFAULT_THEME_ID = 'light';

/** i18n suffix for `HEADER.THEMES.*` — display names, not CSS ids. */
export function themeLabelI18nKey(themeId: string, area: ThemeArea): string {
  if (themeId === 'glass') {
    return area === 'admin' ? 'ICE' : 'AURORA';
  }
  if (themeId === 'dark-glass') {
    return 'EMBER';
  }
  return themeId.replace(/-/g, '_').toUpperCase();
}

export function themeDisplayName(theme: ThemeDefinition, area: ThemeArea): string {
  return theme.names?.[area] ?? theme.name;
}
