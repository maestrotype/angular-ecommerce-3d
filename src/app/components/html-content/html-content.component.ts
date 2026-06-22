import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Section } from 'src/shared/models/section.model';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { TranslateService } from '@ngx-translate/core';
import { getLocalizedString } from 'src/shared/utils/localization.util';

@Component({
  selector: 'app-html-content',
  standalone: true,
  imports: [CommonModule, LocalizedPipe],
  templateUrl: './html-content.component.html',
  styleUrls: ['./html-content.component.scss'],
})
export class HtmlContentComponent implements OnChanges, OnInit {
  @Input() data?: Section;

  safeContent: SafeHtml = '';

  constructor(
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.updateContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateContent();
    }
  }

  private updateContent(): void {
    const raw = getLocalizedString(
      this.data?.content,
      this.translate.currentLang || 'en',
    );
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(raw || '');
  }
}
