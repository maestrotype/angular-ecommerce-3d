import { Component, Input } from '@angular/core';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  @Input() size: LoadingSpinnerSize = 'md';
  @Input() message = '';
  @Input() inline = false;

  get hostClasses(): string {
    const classes = ['app-loading-spinner', `app-loading-spinner--${this.size}`];
    if (this.inline) {
      classes.push('app-loading-spinner--inline');
    }
    return classes.join(' ');
  }
}
