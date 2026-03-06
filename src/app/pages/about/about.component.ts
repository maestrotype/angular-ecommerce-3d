import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Section } from '@shared/models/section.model';
import { SectionService } from 'src/admin/services/section.service';
import { map } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app-shared/shared.module';
import { LocalizedPipe } from '@app-shared/pipes/localized.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    LocalizedPipe,
    MatIconModule,
    ThreeDViewerComponent
  ]
})
export class AboutComponent implements OnInit, AfterViewInit {
  @Input() data?: Section;
  @ViewChildren('statValue') statElements!: QueryList<ElementRef>;

  stats: any[] = [];
  features: any[] = [];
  cta: any = null;
  animated = false;

  constructor(
    private sectionService: SectionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (!this.data) {
      this.sectionService.getActiveSections().pipe(
        map(sections => sections.find(s => s.type === 'about'))
      ).subscribe(section => {
        if (section) {
          this.data = section;
          this.parseSettings();
        }
      });
    } else {
      this.parseSettings();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimation();
    }
  }

  private parseSettings(): void {
    const settings = this.data?.settings as any;
    if (settings) {
      this.stats = settings.stats || [];
      this.features = settings.features || [];
      this.cta = settings.cta || null;
    }
  }

  private initScrollAnimation(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animateCounters();
          this.animated = true;
        }
      });
    }, { threshold: 0.2 });

    const element = document.querySelector('#about');
    if (element) {
      observer.observe(element);
    }
  }

  private animateCounters(): void {
    this.statElements.forEach((el, index) => {
      const target = this.stats[index].value;
      const numericPart = parseInt(target.replace(/[^0-9]/g, ''));
      const suffix = target.replace(/[0-9]/g, '');

      if (isNaN(numericPart)) return;

      let start = 0;
      const duration = 2000;
      const startTime = performance.now();

      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * numericPart);

        el.nativeElement.innerText = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.nativeElement.innerText = target;
        }
      };

      requestAnimationFrame(update);
    });
  }
}
