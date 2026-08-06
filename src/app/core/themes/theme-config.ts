import { ThemeDefinition } from './theme.model';
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
