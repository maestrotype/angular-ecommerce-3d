import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Broadcasts storefront catalog invalidation after admin product/stage edits. */
@Injectable({
  providedIn: 'root',
})
export class CatalogRefreshService {
  private readonly changedSubject = new Subject<void>();
  readonly changed$ = this.changedSubject.asObservable();

  notify(): void {
    this.changedSubject.next();
  }
}
