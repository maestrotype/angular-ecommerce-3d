import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultTitle = '3D Store - Modern E-commerce with 3D Visualization';
  private readonly defaultDescription = 'Discover our amazing collection of 3D products with interactive visualization, AI image processing, and modern glassmorphism design.';
  private readonly defaultKeywords = '3D store, e-commerce, 3D visualization, Three.js, glassmorphism, modern design';
  private readonly defaultImage = '/assets/images/og-default.jpg';
  private readonly baseUrl = 'https://3dstore.com';

  constructor(
    private title: Title,
    private meta: Meta
  ) {}

  updateSeo(data: SeoData): void {
    this.updateTitle(data.title);
    this.updateMetaTags(data);
    this.updateOpenGraph(data);
    this.updateTwitterCard(data);
    this.updateStructuredData(data.structuredData);
  }

  updateTitle(title?: string): void {
    const finalTitle = title ? `${title} | 3D Store` : this.defaultTitle;
    this.title.setTitle(finalTitle);
  }

  updateMetaTags(data: SeoData): void {
    const description = data.description || this.defaultDescription;
    const keywords = data.keywords || this.defaultKeywords;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'author', content: '3D Store' });
  }

  updateOpenGraph(data: SeoData): void {
    const title = data.title || this.defaultTitle;
    const description = data.description || this.defaultDescription;
    const image = data.image || this.defaultImage;
    const url = data.url || this.baseUrl;
    const type = data.type || 'website';

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: '3D Store' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });
  }

  updateTwitterCard(data: SeoData): void {
    const title = data.title || this.defaultTitle;
    const description = data.description || this.defaultDescription;
    const image = data.image || this.defaultImage;

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:site', content: '@3dstore' });
  }

  updateStructuredData(data?: any): void {
    if (!data) return;

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Product specific SEO
  updateProductSeo(product: any): void {
    const seoData: SeoData = {
      title: product.name,
      description: product.description || `Buy ${product.name} - High quality 3D product with interactive visualization`,
      keywords: `${product.name}, ${product.category}, 3D product, e-commerce`,
      image: product.imageUrl,
      url: `${this.baseUrl}/product/${product.id}`,
      type: 'product',
      structuredData: this.generateProductStructuredData(product)
    };

    this.updateSeo(seoData);
  }

  // Category specific SEO
  updateCategorySeo(category: any): void {
    const seoData: SeoData = {
      title: `${category.name} Products`,
      description: `Browse our collection of ${category.name} products with 3D visualization and modern design`,
      keywords: `${category.name}, products, 3D visualization, e-commerce`,
      type: 'website',
      structuredData: this.generateCategoryStructuredData(category)
    };

    this.updateSeo(seoData);
  }

  // Home page SEO
  updateHomeSeo(): void {
    const seoData: SeoData = {
      title: 'Home',
      description: this.defaultDescription,
      keywords: this.defaultKeywords,
      type: 'website',
      structuredData: this.generateWebsiteStructuredData()
    };

    this.updateSeo(seoData);
  }

  private generateProductStructuredData(product: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.imageUrl,
      brand: {
        '@type': 'Brand',
        name: '3D Store'
      },
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${this.baseUrl}/product/${product.id}`
      },
      aggregateRating: product.rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1
      } : undefined
    };
  }

  private generateCategoryStructuredData(category: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} Products`,
      description: `Browse our collection of ${category.name} products`,
      url: `${this.baseUrl}/category/${category.id}`
    };
  }

  private generateWebsiteStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '3D Store',
      description: this.defaultDescription,
      url: this.baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  // Reset to default SEO
  resetSeo(): void {
    this.updateHomeSeo();
  }
} 