
import { Pipe, PipeTransform } from '@angular/core';
import { Localizable, extractString } from '../../../shared/models/localization.model';

@Pipe({
    name: 'loc',
    standalone: false // We will register it in SharedModule
})
export class LocPipe implements PipeTransform {
    transform(value: Localizable, lang: string = 'en'): string {
        return extractString(value, lang);
    }
}
