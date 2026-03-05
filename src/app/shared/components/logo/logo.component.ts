import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss']
})
export class LogoComponent {
    @Input() width: string | number = 200;
    @Input() height: string | number = 60;
    @Input() showText = true;
}
