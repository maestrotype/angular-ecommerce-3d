import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from 'src/shared/models/section.model';

@Component({
    selector: 'app-hero-glass',
    templateUrl: './hero-glass.component.html',
    styleUrls: ['./hero-glass.component.scss']
})
export class HeroGlassComponent {
    @Input() data!: Section;
    constructor(private router: Router) {}
    modelReady = false;

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}