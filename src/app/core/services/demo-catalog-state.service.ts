import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Tracks whether the storefront is showing bundled demo catalog data. */
@Injectable({ providedIn: 'root' })
export class DemoCatalogStateService {
  private readonly demoModeSubject = new BehaviorSubject<boolean>(false);
  readonly isDemoMode$: Observable<boolean> = this.demoModeSubject.asObservable();

  setDemoMode(isDemo: boolean): void {
    if (this.demoModeSubject.value !== isDemo) {
      this.demoModeSubject.next(isDemo);
    }
  }

  isDemoMode(): boolean {
    return this.demoModeSubject.value;
  }
}
