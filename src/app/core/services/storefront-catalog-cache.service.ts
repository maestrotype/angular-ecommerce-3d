import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_PREFIX = 'storefront_catalog_v1';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEnvelope<T> {
  savedAt: number;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class StorefrontCatalogCacheService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  read<T>(key: string): T | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const raw = localStorage.getItem(this.storageKey(key));
      if (!raw) {
        return null;
      }

      const envelope = JSON.parse(raw) as CacheEnvelope<T>;
      if (!envelope?.data || Date.now() - envelope.savedAt > MAX_AGE_MS) {
        this.remove(key);
        return null;
      }

      return envelope.data;
    } catch {
      return null;
    }
  }

  write<T>(key: string, data: T): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const envelope: CacheEnvelope<T> = {
        savedAt: Date.now(),
        data,
      };
      localStorage.setItem(this.storageKey(key), JSON.stringify(envelope));
    } catch {
      // Quota exceeded or private mode — ignore.
    }
  }

  remove(key: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(this.storageKey(key));
  }

  private storageKey(key: string): string {
    return `${STORAGE_PREFIX}:${key}`;
  }
}
