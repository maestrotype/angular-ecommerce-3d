import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from 'src/shared/models/section.model';

@Component({
    selector: 'app-hero-glass',
    templateUrl: './hero-glass.component.html',
    styleUrls: ['./hero-glass.component.scss'],
    standalone: true,
    imports: []
})
export class HeroGlassComponent implements OnInit {
    @Input() data!: Section;
    constructor(private router: Router) { }
    modelReady = false;

    ngOnInit(): void {
        // Component initialized
    }

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}