import { Component, Input } from '@angular/core';
import { Section } from 'src/shared/models/section.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  @Input() section!: Section;
}
