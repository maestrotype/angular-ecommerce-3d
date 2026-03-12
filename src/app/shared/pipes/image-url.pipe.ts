import { Pipe, PipeTransform } from '@angular/core';
import { resolveImageUrl } from '../../../shared/utils/image.util';

@Pipe({
    name: 'imageUrl',
    standalone: true
})
export class ImageUrlPipe implements PipeTransform {
    transform(url: string | undefined | null): string {
        return resolveImageUrl(url);
    }
}
