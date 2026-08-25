import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    requests.bestSellers = productService.getBestSellers().pipe(catchError(() => of([])));
  }

  if (types.has('product-carousel')) {
    requests.catalog = productService.getProducts().pipe(catchError(() => of([])));
    requests.specialOffers = productService.getSpecialOffers().pipe(catchError(() => of([])));
    if (!requests.bestSellers) {
      requests.bestSellers = productService.getBestSellers().pipe(catchError(() => of([])));
    }
  }

  if (Object.keys(requests).length === 0) {
    return of({});
  }

  return forkJoin(requests);
}
