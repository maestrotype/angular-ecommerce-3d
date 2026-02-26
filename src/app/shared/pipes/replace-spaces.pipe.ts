import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replaceSpaces'
})
export class ReplaceSpacesPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value) return '';
        return value.replace(/\s+/g, '_');
    }
}
