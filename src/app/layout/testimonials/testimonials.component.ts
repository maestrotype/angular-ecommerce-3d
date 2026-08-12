import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Section } from 'src/shared/models/section.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from 'src/app/shared/pipes/localized.pipe';
import { getLocalizedString } from 'src/shared/utils/localization.util';

interface TestimonialItem {
  name: string | LocalizedString;
  role: string | LocalizedString;
  text: string | LocalizedString;
  avatar: string;
  rating: number;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule, LocalizedPipe]
})
export class TestimonialsComponent implements OnInit {
  @Input() data!: Section;
  testimonials: TestimonialItem[] = [];

  ngOnInit(): void {
    const items = this.data?.settings?.testimonials ?? [];
    this.testimonials = items
      .filter((item: any) => item.isActive !== false)
      .map((item: any) => ({
        name: item.name,
        role: item.role,
        text: item.text,
        avatar: item.avatar || '',
        rating: Math.min(5, Math.max(1, Number(item.rating) || 5))
      }));
  }

  getInitials(name: string | LocalizedString): string {
    const value = getLocalizedString(name);
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }
}
