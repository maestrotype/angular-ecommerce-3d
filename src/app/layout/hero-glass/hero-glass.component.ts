import { Component, Input, OnInit, HostListener } from '@angular/core';
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
    
    modelReady = false;
    modelScale: [number, number, number] = [9, 9, 9];
    modelPosition: [number, number, number] = [0, 0, 0];

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.updateModelTransform();
    }

    @HostListener('window:resize', ['$event'])
    onResize(): void {
        this.updateModelTransform();
    }

    private updateModelTransform(): void {
        const width = window.innerWidth;
        if (width < 500) {
            this.modelScale = [14, 14, 14];
            this.modelPosition = [0, -0.5, 0];
        } else if (width < 900) {
            this.modelScale = [12, 12, 12];
            this.modelPosition = [0, 0, 0];
        } else {
            this.modelScale = [9, 9, 9];
            this.modelPosition = [0, 0, 0];
        }
    }

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}