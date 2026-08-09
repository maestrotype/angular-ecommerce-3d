import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Section } from 'src/shared/models/section.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from 'src/app/shared/pipes/localized.pipe';

interface FaqItem {
  question: string | LocalizedString;
  answer: string | LocalizedString;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, MatExpansionModule, LocalizedPipe]
})
export class FaqComponent implements OnInit {
  @Input() data!: Section;
  items: FaqItem[] = [];

  ngOnInit(): void {
    const faqItems = this.data?.settings?.items ?? [];
    this.items = faqItems
      .filter((item: any) => item.isActive !== false)
      .map((item: any) => ({
        question: item.question,
        answer: item.answer
      }));
  }
}
