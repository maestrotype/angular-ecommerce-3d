import { Component, OnInit } from '@angular/core';
import { SectionService } from 'src/admin/services/section.service';
import { Section } from 'src/shared/models/section.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  sections: Section[] = [];

  constructor(private sectionService: SectionService) {}

  ngOnInit(): void {
    this.sectionService.getActiveSections().subscribe(sections => {
      this.sections = sections.sort((a, b) => a.order - b.order);
    });
  }
} 