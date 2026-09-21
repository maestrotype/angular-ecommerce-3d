import { forkJoin, Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { ProductService } from '../../app/core/services/product.service';
import { PageSectionContext } from '../models/page-section-context.model';

/** Loads product lists needed by home/custom page sections (one request per data type). */
export function loadPageSectionContext(
  productService: ProductService,
  sectionTypes: Iterable<string>
): Observable<PageSectionContext> {
  const types = new Set(sectionTypes);
  const requests: {
    bestSellers?: ReturnType<ProductService['getBestSellers']>;
    specialOffers?: ReturnType<ProductService['getSpecialOffers']>;
    catalog?: ReturnType<ProductService['getProducts']>;
  } = {};

  if (types.has('best-sellers')) {
    requests.bestSellers = productService.getBestSellers().pipe(take(1), catchError(() => of([])));
  }

  if (types.has('product-carousel')) {
    requests.catalog = productService.getProducts().pipe(take(1), catchError(() => of([])));
    requests.specialOffers = productService.getSpecialOffers().pipe(take(1), catchError(() => of([])));
    if (!requests.bestSellers) {
      requests.bestSellers = productService.getBestSellers().pipe(take(1), catchError(() => of([])));
    }
  }

  if (Object.keys(requests).length === 0) {
    return of({});
  }

  return forkJoin(requests);
}
