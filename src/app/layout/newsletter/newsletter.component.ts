import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Section } from 'src/shared/models/section.model';
import { LocalizedPipe } from 'src/app/shared/pipes/localized.pipe';
import { getLocalizedString } from 'src/shared/utils/localization.util';
import { NewsletterService } from 'src/app/core/services/newsletter.service';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatIconModule, LocalizedPipe]
})
export class NewsletterComponent implements OnInit {
  @Input() data!: Section;

  email = '';
  loading = false;
  success = false;
  error = '';
  placeholder = '';
  buttonText = '';

  constructor(
    private newsletterService: NewsletterService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const settings = this.data?.settings ?? {};
    this.placeholder = getLocalizedString(settings.placeholder) || this.translate.instant('HOME.NEWSLETTER.PLACEHOLDER');
    this.buttonText = getLocalizedString(settings.buttonText) || this.translate.instant('HOME.NEWSLETTER.BUTTON');
  }

  subscribe(): void {
    if (this.loading || !this.email.trim()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    this.newsletterService.subscribe(this.email.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success) {
          this.error = this.translate.instant('HOME.NEWSLETTER.ERROR');
          return;
        }
        this.success = true;
        this.email = '';
      },
      error: () => {
        this.loading = false;
        this.error = this.translate.instant('HOME.NEWSLETTER.ERROR');
      }
    });
  }
}
