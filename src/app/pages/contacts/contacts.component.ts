import { Component, Input } from '@angular/core';
import { Section } from 'src/shared/models/section.model';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ContactFormComponent } from '../../shared/components/contact-form/contact-form.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, TranslateModule, LocalizedPipe, ContactFormComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
  @Input() data?: Section;

  onMessageSent(): void {
    // Additional logic after message is sent
  }
} 