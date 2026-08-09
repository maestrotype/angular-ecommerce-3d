import { Type } from '@angular/core';

export const sectionComponentMap: { [key: string]: () => Promise<Type<any>> } = {
  header: () => import('../../layout/header/header.component').then(m => m.HeaderComponent),
  footer: () => import('../../layout/footer/footer.component').then(m => m.FooterComponent),
  hero: () => import('../../layout/hero/hero.component').then(m => m.HeroComponent),
  'hero-glass': () => import('../../layout/hero-glass/hero-glass.component').then(m => m.HeroGlassComponent),
  'best-sellers': () => import('../../layout/best-sellers/best-sellers.component').then(m => m.BestSellersComponent),
  categories: () => import('../../layout/categories/categories.component').then(m => m.CategoriesComponent),
  'special-offer': () => import('../../layout/special-offer/special-offer.component').then(m => m.SpecialOfferComponent),
  brands: () => import('../../layout/brands/brands.component').then(m => m.BrandsComponent),
  contacts: () => import('../../pages/contacts/contacts.component').then(m => m.ContactsComponent),
  about: () => import('../../pages/about/about.component').then(m => m.AboutComponent),
  'product-tabs': () => import('../product-detail/product-tabs/product-tabs.component').then(m => m.ProductTabsComponent),
  'similar-products': () => import('../../shared/components/recommendations/similar-products/similar-products.component').then(m => m.SimilarProductsComponent),
  'bought-together': () => import('../../shared/components/recommendations/bought-together/bought-together.component').then(m => m.BoughtTogetherComponent),
  'html-content': () => import('../html-content/html-content.component').then(m => m.HtmlContentComponent),
  testimonials: () => import('../../layout/testimonials/testimonials.component').then(m => m.TestimonialsComponent),
  newsletter: () => import('../../layout/newsletter/newsletter.component').then(m => m.NewsletterComponent),
  'features-grid': () => import('../../layout/features-grid/features-grid.component').then(m => m.FeaturesGridComponent),
  faq: () => import('../../layout/faq/faq.component').then(m => m.FaqComponent),
  stats: () => import('../../layout/stats/stats.component').then(m => m.StatsComponent),
};
