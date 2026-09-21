import { Observable, Subscriber, timer } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

/** Show bundled demo only when there is no cache and live API is still pending. */
export const STOREFRONT_DEMO_DELAY_MS = 800;

export interface StorefrontCatalogPayload<T> {
  data: T;
  /** Bundled mock catalog — purchases disabled. */
  isDemo: boolean;
  /** Last successful API snapshot from localStorage. */
  fromCache: boolean;
}

export interface StorefrontCatalogStreamOptions<T> {
  live$: Observable<T>;
  demo: T;
  cached: T | null;
  delayMs?: number;
  onLivePersist?: (data: T) => void;
  onDemo?: () => void;
  onLive?: () => void;
}

/**
 * Emits once and completes (forkJoin-safe).
 * Priority: cache (instant) → live (fast) → demo (after delay if still empty).
 * Live fetch always runs in the background when cache/demo was shown first.
 */
export function createStorefrontCatalogStream<T>(
  options: StorefrontCatalogStreamOptions<T>,
): Observable<StorefrontCatalogPayload<T>> {
  const delayMs = options.delayMs ?? STOREFRONT_DEMO_DELAY_MS;

  return new Observable((subscriber: Subscriber<StorefrontCatalogPayload<T>>) => {
    let settled = false;

    const settle = (payload: StorefrontCatalogPayload<T>) => {
      if (settled) {
        return;
      }
      settled = true;
      subscriber.next(payload);
      subscriber.complete();
    };

    const refreshLive = () => {
      options.live$.pipe(take(1)).subscribe({
        next: (data) => {
          options.onLivePersist?.(data);
          options.onLive?.();
        },
        error: () => {},
      });
    };

    if (options.cached != null) {
      settle({ data: options.cached, isDemo: false, fromCache: true });
      refreshLive();
      return;
    }

    const liveSub = options.live$.pipe(take(1), catchError(() => [] as unknown as T[])).subscribe({
      next: (data) => {
        options.onLivePersist?.(data);
        options.onLive?.();
        settle({ data, isDemo: false, fromCache: false });
      },
      error: () => {},
    });

    const demoSub = timer(delayMs).subscribe(() => {
      if (settled) {
        return;
      }
      options.onDemo?.();
      settle({ data: options.demo, isDemo: true, fromCache: false });
      refreshLive();
    });

    return () => {
      liveSub.unsubscribe();
      demoSub.unsubscribe();
    };
  });
}
