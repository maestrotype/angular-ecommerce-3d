import { Component, EventEmitter, Input, Output } from '@angular/core';

export type EmptyStateIconType = 'material' | 'emoji';
export type EmptyStateSize = 'default' | 'compact';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() iconType: EmptyStateIconType = 'material';
  @Input() title = '';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() size: EmptyStateSize = 'default';
  @Output() actionClick = new EventEmitter<void>();

  onAction(): void {
    this.actionClick.emit();
  }

  get hostClasses(): string {
    const classes = ['app-empty-state'];
    if (this.size === 'compact') {
      classes.push('app-empty-state--compact');
    }
    return classes.join(' ');
  }
}
