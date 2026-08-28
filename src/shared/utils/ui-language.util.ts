export type UiLanguage = 'en' | 'ru' | 'ua';

const UI_LANGUAGES: UiLanguage[] = ['en', 'ru', 'ua'];

/** Map browser / stored codes (en-US, ru-RU, uk) to bundled i18n files. */
export function resolveUiLanguage(raw: string | null | undefined): UiLanguage {
  const value = (raw || 'en').toLowerCase().replace('_', '-');
  if (value.startsWith('ru')) {
    return 'ru';
  }
  if (value.startsWith('uk') || value.startsWith('ua')) {
    return 'ua';
  }
  if (value.startsWith('en')) {
    return 'en';
  }
  const exact = UI_LANGUAGES.find(lang => lang === value);
  return exact || 'en';
}
