import { Component, Input } from '@angular/core';
import { Section } from 'src/shared/models/section.model';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
  @Input() data?: Section;

  onMessageSent(): void {
    // Additional logic after message is sent
  }
} 