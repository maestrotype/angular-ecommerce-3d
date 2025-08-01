import { Component } from '@angular/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
  onMessageSent(): void {
    // Additional logic after message is sent
    console.log('Message sent successfully');
  }
} 