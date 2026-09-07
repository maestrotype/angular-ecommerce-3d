import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Section } from '@shared/models/section.model';
import { SectionService } from '../../core/services/section.service';
import { getDemoSections } from '../../../shared/constants/demo-catalog';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

const DEFAULT_ABOUT_SECTION = getDemoSections('about')[0];

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
    if (this.data) {
      return;
    }

    this.sectionService.getActiveSections('about').pipe(
      map(sections => sections.find(s => s.type === 'about') ?? sections[0]),
      takeUntil(this.destroy$)
    ).subscribe(section => {
      this.data = section ?? DEFAULT_ABOUT_SECTION;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
