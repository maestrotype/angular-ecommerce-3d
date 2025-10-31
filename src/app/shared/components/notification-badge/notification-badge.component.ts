import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-notification-badge',
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.scss'],
})
export class NotificationBadgeComponent implements OnChanges {
  @Input() count: number = 0;
  @Input() pulse: boolean = false;
  @Output() onClick = new EventEmitter<void>();

  displayCount: string = '';

  ngOnChanges(): void {
    this.displayCount = this.count > 99 ? '99+' : this.count.toString();
  }
}
