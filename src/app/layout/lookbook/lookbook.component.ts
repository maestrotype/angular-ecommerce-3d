import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'src/shared/models/section.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

export interface LookbookSlide {
  image: string;
  title: string | LocalizedString;
  subtitle?: string | LocalizedString;
  ctaLabel?: string | LocalizedString;
  ctaUrl?: string;
}

@Component({
  selector: 'app-lookbook',
  templateUrl: './lookbook.component.html',
  styleUrls: ['./lookbook.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LocalizedPipe, ImageUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LookbookComponent implements OnInit, OnDestroy {
  @Input() data!: Section;
  slides: LookbookSlide[] = [];
  activeIndex = 0;
  private timer?: ReturnType<typeof setInterval>;
  private autoplay = true;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const items = this.data?.settings?.slides ?? [];
    this.slides = items
      .filter((item: any) => item.isActive !== false && item.image)
      .map((item: any) => ({
        image: item.image,
        title: item.title,
        subtitle: item.subtitle,
        ctaLabel: item.ctaLabel,
        ctaUrl: item.ctaUrl || '/shop'
      }));
    this.autoplay = this.data?.settings?.autoplay !== false;
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  isInternal(url?: string): boolean {
    return !!url && url.startsWith('/');
  }

  goTo(index: number): void {
    if (!this.slides.length) {
      return;
    }
    const total = this.slides.length;
    this.activeIndex = ((index % total) + total) % total;
    this.cdr.markForCheck();
  }

  next(): void {
    this.goTo(this.activeIndex + 1);
  }

  prev(): void {
    this.goTo(this.activeIndex - 1);
  }

  pause(): void {
    this.stopAutoplay();
  }

  resume(): void {
    this.startAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (!this.autoplay || this.slides.length < 2 || !isPlatformBrowser(this.platformId)) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => this.next());
      }, 5600);
    });
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
