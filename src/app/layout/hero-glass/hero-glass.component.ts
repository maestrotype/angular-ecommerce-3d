import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Section } from 'src/shared/models/section.model';
import { SharedModule } from 'src/app/shared/shared.module';
import { ThreeDViewerComponent } from '../../components/three-d-viewer/three-d-viewer.component';

@Component({
    selector: 'app-hero-glass',
    templateUrl: './hero-glass.component.html',
    styleUrls: ['./hero-glass.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, ThreeDViewerComponent, SharedModule]
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