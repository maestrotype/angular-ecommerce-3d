import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'src/shared/models/section.model';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';

import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';

@Component({
    selector: 'app-hero',
    templateUrl: './hero.component.html',
    styleUrls: ['./hero.component.scss'],
    standalone: true,
    imports: [CommonModule, TranslateModule, ThreeDViewerComponent, LocalizedPipe]
})
export class HeroComponent {
    @Input() data!: Section;
    constructor(private router: Router) { }
    modelReady = false;

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}