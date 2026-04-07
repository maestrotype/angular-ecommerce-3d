import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Section } from '@shared/models/section.model';
import { SectionService } from 'src/admin/services/section.service';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ThreeDViewerComponent, LocalizedPipe, ImageUrlPipe, TranslateModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  @Input() data?: Section;
  private destroy$ = new Subject<void>();

  constructor(private sectionService: SectionService) { }

  ngOnInit(): void {
    console.log('AboutComponent ngOnInit, data:', this.data);
    if (!this.data) {
      console.log('AboutComponent: No data, fetching...');
      this.sectionService.getActiveSections().pipe(
        map(sections => sections.find(s => s.type === 'about')),
        takeUntil(this.destroy$)
      ).subscribe(section => {
        if (section) {
          console.log('AboutComponent: Found section:', section);
          this.data = section;
        } else {
          console.warn('AboutComponent: No "about" section found in active sections');
        }
      });
    }
  }

  ngOnDestroy() {
    console.log('AboutComponent ngOnDestroy');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
