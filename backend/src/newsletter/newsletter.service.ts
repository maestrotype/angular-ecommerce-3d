
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepository: Repository<NewsletterSubscriber>
  ) {}

  subscribe(dto: SubscribeNewsletterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    return from(
      this.subscriberRepository.findOne({ where: { email: normalizedEmail } })
    ).pipe(
      switchMap(existing => {
        if (existing) {
          return from(Promise.resolve(existing));
        }

        const subscriber = this.subscriberRepository.create({ email: normalizedEmail });
        return from(this.subscriberRepository.save(subscriber));
      }),
      map(subscriber => subscriber),
      catchError(error => throwError(() => error))
    );
  }
}
