import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Section } from 'src/shared/models/section.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from 'src/app/shared/pipes/localized.pipe';

interface FeatureItem {
  icon: string;
  title: string | LocalizedString;
  description: string | LocalizedString;
}

@Component({
  selector: 'app-features-grid',
  templateUrl: './features-grid.component.html',
  styleUrls: ['./features-grid.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule, LocalizedPipe]
})
export class FeaturesGridComponent implements OnInit {
  @Input() data!: Section;
  features: FeatureItem[] = [];

  ngOnInit(): void {
    const items = this.data?.settings?.features ?? [];
    this.features = items
      .filter((item: any) => item.isActive !== false)
      .map((item: any) => ({
        icon: item.icon || 'star',
        title: item.title,
        description: item.description
      }));
  }
}
