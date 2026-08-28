import { resolveUiLanguage } from './ui-language.util';

describe('resolveUiLanguage', () => {
  it('keeps bundled language codes', () => {
    expect(resolveUiLanguage('en')).toBe('en');
    expect(resolveUiLanguage('ru')).toBe('ru');
    expect(resolveUiLanguage('ua')).toBe('ua');
  });

  it('normalizes regional and Ukrainian browser codes', () => {
    expect(resolveUiLanguage('en-US')).toBe('en');
    expect(resolveUiLanguage('ru-RU')).toBe('ru');
    expect(resolveUiLanguage('uk')).toBe('ua');
    expect(resolveUiLanguage('uk-UA')).toBe('ua');
  });

  it('falls back to English', () => {
    expect(resolveUiLanguage('')).toBe('en');
    expect(resolveUiLanguage('de')).toBe('en');
    expect(resolveUiLanguage(null)).toBe('en');
  });
});
