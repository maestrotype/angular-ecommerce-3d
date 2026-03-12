import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'src/shared/models/section.model';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
    selector: 'app-hero-glass',
    templateUrl: './hero-glass.component.html',
    styleUrls: ['./hero-glass.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, ThreeDViewerComponent, TranslateModule, LocalizedPipe, ImageUrlPipe]
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