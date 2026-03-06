import { lightTheme } from './themes/default-theme-new';
import { darkTheme } from './themes/dark-theme';
import { glassTheme } from './themes/glass-theme';
import { darkGlassTheme } from './themes/dark-glass-theme';
import { Theme } from './theme.model';

export const FRONTEND_THEMES: Theme[] = [lightTheme, darkTheme, glassTheme];
export const ADMIN_THEMES: Theme[] = [lightTheme, darkTheme, glassTheme, darkGlassTheme];

// For legacy code support or simple list
export const AVAILABLE_THEMES: Theme[] = ADMIN_THEMES;

export const DEFAULT_THEME_ID = 'light';