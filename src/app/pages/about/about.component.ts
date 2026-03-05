import { Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Section } from '@shared/models/section.model';
import { SectionService } from 'src/admin/services/section.service';
import { map } from 'rxjs/operators';

interface StatItem {
  value: string;
  label_en: string;
  label_ru?: string;
  label_ua?: string;
  animatedValue?: string;
}

interface FeatureItem {
  icon: string;
  iconUrl?: string;
  text_en: string;
  text_ru?: string;
  text_ua?: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  @Input() data?: Section;

  stats: StatItem[] = [];
  features: FeatureItem[] = [];
  animatedStats: { display: string }[] = [];
  private statsAnimated = false;
  private animationFrames: number[] = [];

  constructor(
    private sectionService: SectionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (!this.data) {
      this.sectionService.getActiveSections().pipe(
        map(sections => sections.find(s => s.type === 'about'))
      ).subscribe(section => {
        if (section) {
          this.data = section;
          this.initSectionData();
        }
      });
    } else {
      this.initSectionData();
    }
  }

  ngOnDestroy(): void {
    this.animationFrames.forEach(id => cancelAnimationFrame(id));
  }

  private initSectionData(): void {
    const settings = (this.data as any)?.settings || {};
    this.stats = settings.stats || [];
    this.features = (settings.features || []).map((f: any, index: number) => {
      // Set default icons if none provided in DB
      if (!f.iconUrl) {
        const defaults = [
          '/assets/icons/about-quality.svg',
          '/assets/icons/about-delivery.svg',
          '/assets/icons/about-support.svg'
        ];
        return { ...f, iconUrl: defaults[index] || '' };
      }
      return f;
    });
    this.animatedStats = this.stats.map(s => ({ display: '0' }));
  }

  getStatLabel(stat: StatItem, lang: string): string {
    if (lang === 'ru' && stat.label_ru) return stat.label_ru;
    if (lang === 'ua' && stat.label_ua) return stat.label_ua;
    return stat.label_en || '';
  }

  getFeatureText(feature: FeatureItem, lang: string): string {
    if (lang === 'ru' && feature.text_ru) return feature.text_ru;
    if (lang === 'ua' && feature.text_ua) return feature.text_ua;
    return feature.text_en || '';
  }

  onCtaClick(): void {
    const settings = (this.data as any)?.settings || {};
    const url = settings.ctaUrl || '/shop';
    if (url.startsWith('#')) {
      const el = document.getElementById(url.slice(1));
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate([url]);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.statsAnimated) return;
    const el = document.querySelector('.stats-bar');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      this.statsAnimated = true;
      this.animateCounters();
    }
  }

  private animateCounters(): void {
    this.stats.forEach((stat, i) => {
      const raw = stat.value.replace(/[^0-9.]/g, '');
      const suffix = stat.value.replace(/[0-9.]/g, '');
      const target = parseFloat(raw);
      if (isNaN(target)) {
        this.animatedStats[i] = { display: stat.value };
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        this.animatedStats[i] = { display: current + suffix };
        if (progress < 1) {
          this.animationFrames.push(requestAnimationFrame(step));
        } else {
          this.animatedStats[i] = { display: stat.value };
        }
      };
      this.animationFrames.push(requestAnimationFrame(step));
    });
  }
}
