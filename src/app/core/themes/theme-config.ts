import { ThemeArea, ThemeDefinition } from './theme.model';
import {
  lightTheme,
  darkTheme,
  glassTheme,
  darkGlassTheme,
} from './theme-definitions';

export { themeLabelI18nKey } from './theme-label.util';

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  lightTheme,
  darkTheme,
  glassTheme,
  darkGlassTheme,
];

export const DEFAULT_THEME_ID = 'light';

export function themeDisplayName(theme: ThemeDefinition, area: ThemeArea): string {
  return theme.names?.[area] ?? theme.name;
}
