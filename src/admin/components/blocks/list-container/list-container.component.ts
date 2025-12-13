import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ListContainerComponent {
  @Input() title = '';
}


