import { Component } from '@angular/core';

@Component({
    selector: 'app-hero',
    templateUrl: './hero.component.html',
    styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

    constructor() { }

    onShopNow(): void {
        console.log('Shop Now clicked');
        // Implement navigation to shop page
        // this.router.navigate(['/shop']);
    }
}