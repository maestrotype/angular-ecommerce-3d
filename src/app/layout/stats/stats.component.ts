import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'src/shared/models/section.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from 'src/app/shared/pipes/localized.pipe';

interface StatItem {
  value: string;
  label: string | LocalizedString;
  suffix: string;
  displayValue: string;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, LocalizedPipe]
})
export class StatsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() data!: Section;
  @ViewChildren('statValue') statValueRefs!: QueryList<ElementRef<HTMLElement>>;

  stats: StatItem[] = [];
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const items = this.data?.settings?.stats ?? [];
    this.stats = items
      .filter((item: any) => item.isActive !== false)
      .map((item: any) => ({
        value: String(item.value ?? '0'),
        label: item.label,
        suffix: item.suffix || '',
        displayValue: '0'
      }));
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }
          const index = Number((entry.target as HTMLElement).dataset['index']);
          this.animateStat(index);
          this.observer?.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    this.statValueRefs.forEach(ref => this.observer?.observe(ref.nativeElement));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private animateStat(index: number): void {
    const stat = this.stats[index];
    if (!stat) {
      return;
    }

    const target = Number(stat.value.replace(/[^\d.-]/g, ''));
    if (Number.isNaN(target)) {
      stat.displayValue = stat.value;
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.round(target * progress);
      stat.displayValue = `${current}${stat.suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        stat.displayValue = `${stat.value}${stat.suffix}`;
      }
    };

    requestAnimationFrame(tick);
  }
}
