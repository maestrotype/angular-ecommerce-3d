import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class LogoComponent {
    @Input() width: string | number = 200;
    @Input() height: string | number = 60;
    @Input() showText = true;
}
