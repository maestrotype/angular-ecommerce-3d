import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalService } from '../../core/services/modal.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { SectionService } from '../../core/services/section.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from 'src/shared/models/category.model';
import { parseFooterLink } from '../../core/utils/footer-link.util';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})



export class FooterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any;
  cartCount = 0;
  favoritesCount = 0;
  currentYear = new Date().getFullYear();
  shopCategories: Category[] = [];
  parseFooterLink = parseFooterLink;

  private cartSubscription: Subscription = new Subscription();
  private favoritesSubscription: Subscription = new Subscription();
  private footerSubscription: Subscription = new Subscription();
  private categoriesSubscription: Subscription = new Subscription();

  @HostBinding('class')
  get variantClass(): string {
    return this.data?.variant && this.data.variant !== 'default' ? `variant-${this.data.variant}` : '';
  }

  constructor(
    private modalService: ModalService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private router: Router,
    private sectionService: SectionService,
    private categoryService: CategoryService,
  ) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getTotalCount().subscribe(
      count => this.cartCount = count
    );

    this.favoritesSubscription = this.favoritesService.favoritesCount$.subscribe(
      count => this.favoritesCount = count
    );

    this.loadShopCategories();

    if (!this.data) {
      this.loadFooterData();
    }
  }

  isShopCategoriesColumn(col: any): boolean {
    return col?.linkSource === 'shop-categories';
  }

  private loadShopCategories(): void {
    this.categoriesSubscription = this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.shopCategories = (categories || []).filter(c => c.isActive !== false);
      },
      error: () => {
        this.shopCategories = [];
      },
    });
  }

  private loadFooterData(): void {
    this.footerSubscription = this.sectionService.getActiveSections(undefined, 'footer').subscribe(sections => {
      const footer = sections.find(s => s.type === 'footer');
      if (footer) {
        this.data = footer;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Future footer live preview logic can go here
    }
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    this.footerSubscription.unsubscribe();
    this.categoriesSubscription.unsubscribe();
  }

  openAuthModal(): void {
    this.modalService.openModal({
      id: 'auth-modal',
      type: 'auth',
      data: null,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
      }
    });
  }

  openCartModal(): void {
    this.modalService.openModal({
      id: 'cart-modal',
      type: 'cart',
      data: null,
      options: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
      }
    });
  }

  openFavoritesPage(): void {
    this.router.navigate(['/favorites']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
