import { Component, Input, OnInit } from '@angular/core';
import { Section } from '@shared/models/section.model';
import { SectionService } from 'src/admin/services/section.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  @Input() data?: Section;

  constructor(private sectionService: SectionService) { }

  ngOnInit(): void {
    console.log('AboutComponent ngOnInit, data:', this.data);
    if (!this.data) {
      console.log('AboutComponent: No data, fetching...');
      this.sectionService.getActiveSections().pipe(
        map(sections => sections.find(s => s.type === 'about'))
      ).subscribe(section => {
        if (section) {
          console.log('AboutComponent: Found section:', section);
          this.data = section;
        } else {
          console.warn('AboutComponent: No "about" section found in active sections');
        }
      });
    }
  }
}
