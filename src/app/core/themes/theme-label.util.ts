import { ThemeArea } from './theme.model';

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
