import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-special-offer',
    templateUrl: './special-offer.component.html',
    styleUrls: ['./special-offer.component.scss']
})
export class SpecialOfferComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void { }

    onShopNow(): void {
        this.router.navigate(['/shop']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
