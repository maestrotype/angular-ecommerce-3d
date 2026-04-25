import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AnalyticsEvent {
  name: string;
  properties?: any;
  timestamp?: number;
}

declare global {
  interface Window {
    umami?: any;
    amplitude?: any;
    analytics_debug?: boolean;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly isDebug = !environment.production || !!window.analytics_debug;

  constructor(private router: Router) {
    this.initPageViewTracking();
  }

  /**
   * Initialize automatic page view tracking
   */
  private initPageViewTracking(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  /**
   * Track a page view
   * @param url The URL of the page viewed
   */
  trackPageView(url: string): void {
    if (this.isDebug) {
      console.log(`[Analytics] Page View: ${url}`);
    }

    // Support for Umami
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track({
        url,
        type: 'pageview'
      });
    }

    // Support for Amplitude
    if (window.amplitude && typeof window.amplitude.track === 'function') {
      window.amplitude.track('page_view', { url });
    }

    // Local Storage tracking for demo/visualization
    this.saveToLocalStorage('page_view', { url });
  }

  /**
   * Track a custom event
   * @param name Name of the event
   * @param properties Optional metadata for the event
   */
  trackEvent(name: string, properties: any = {}): void {
    const timestamp = Date.now();
    const event: AnalyticsEvent = { name, properties, timestamp };

    if (this.isDebug) {
      console.log(`[Analytics] Event: ${name}`, properties);
    }

    // Support for Umami
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(name, properties);
    }

    // Support for Amplitude
    if (window.amplitude && typeof window.amplitude.track === 'function') {
      window.amplitude.track(name, properties);
    }

    // Local Storage tracking
    this.saveToLocalStorage(name, properties);
  }

  /**
   * Internal helper to save events to local storage for the visualization dashboard
   */
  private saveToLocalStorage(name: string, properties: any): void {
    try {
      const history = JSON.parse(localStorage.getItem('analytics_history') || '[]');
      history.push({
        name,
        properties,
        timestamp: Date.now()
      });
      
      // Keep only last 100 events to prevent bloating local storage
      if (history.length > 100) {
        history.shift();
      }
      
      localStorage.setItem('analytics_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save analytics to local storage', e);
    }
  }

  /**
   * Get tracked events from local storage
   */
  getAnalyticsHistory(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_history') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear analytics history
   */
  clearHistory(): void {
    localStorage.removeItem('analytics_history');
  }
}
