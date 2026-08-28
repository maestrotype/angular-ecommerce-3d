import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/** Prefix i18n URLs with `<base href>` so /admin/* does not request /admin/assets/i18n. */
export function resolveI18nAssetBase(): string {
  if (typeof document === 'undefined') {
    return '/';
  }
  const href = document.getElementsByTagName('base')[0]?.getAttribute('href')?.trim();
  if (!href) {
    return '/';
  }
  return href.endsWith('/') ? href : `${href}/`;
}

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, `${resolveI18nAssetBase()}assets/i18n/`, '.json');
}
