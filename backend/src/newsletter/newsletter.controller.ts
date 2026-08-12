
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Controller('newsletter')
@UsePipes(new ValidationPipe({ transform: true }))
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  subscribe(@Body() dto: SubscribeNewsletterDto): Observable<{ success: boolean; message?: string; error?: string }> {
    return this.newsletterService.subscribe(dto).pipe(
      map(() => ({
        success: true,
        message: 'Subscribed successfully'
      })),
      catchError(error => of({
        success: false,
        error: error.message || 'Subscription failed'
      }))
    );
  }
}
