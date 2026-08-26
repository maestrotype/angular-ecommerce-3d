
import { Component, Inject, ViewChildren, QueryList, AfterViewInit, Input, Output, EventEmitter, Optional, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of, Observable, throwError } from 'rxjs';
import { switchMap, catchError, finalize, map } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SectionService } from '../../../services/section.service';
import { PageService } from '../../../services/page.service';
import { CategoryService } from "src/app/core/services/category.service";
import { Category } from '../../../models/category.model';
import { Section, CreateSectionDto, UpdateSectionDto, MenuItem } from '../../../models/section.model';
import { LocalizedString } from '../../../../shared/models/localized-string.model';
import { getLocalizedString, resolveApiError, formatResolvedApiError } from '../../../../shared/utils/localization.util';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatChipListboxChange } from '@angular/material/chips';
import { ImageUploadComponent } from '../../../components/ui/image-upload/image-upload.component';
import { ConfirmationService } from '../../../services/confirmation.service';
import { getSectionPreset, SectionPresetFormPatch } from '../section-presets';
import { getSectionHash, findSectionByHash } from '../../../../shared/utils/section-anchor.util';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss']
})
export class SectionFormComponent implements AfterViewInit, OnInit {
  @Input() data: { section: Section | null } = { section: null };
  @Input() isDrawerMode = false;

  @Output() formChanged = new EventEmitter<any>();
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChildren(ImageUploadComponent) imageUploadComponents!: QueryList<ImageUploadComponent>;

  sectionForm: FormGroup;
  isEditMode: boolean;
  loading = false;
  uploadingImage = false;
  uploadingVideo = false;
  uploadingLogo = false;
  uploadingCategoryIcon = false;
  uploadingBrandLogo = false;
  private _activeMenuLang = localStorage.getItem('admin_menu_lang') || 'en';
  @Input() set activeMenuLang(val: string) {
    if (val && this._activeMenuLang !== val) {
      // Language changed to ${val}
      this._activeMenuLang = val;
      localStorage.setItem('admin_menu_lang', val);
    }
  }
  get activeMenuLang() { return this._activeMenuLang; }

  onLangChange(lang: string) {
    this.activeMenuLang = lang;
  }

  trackByFn(index: number) {
    return index;
  }

  model3dFile: File | null = null;
  model3dUrl: string | null = null;
  model3dFileName: string | null = null;
  videoFileName: string | null = null;
  uploading3d = false;

  sectionTypes = [
    { value: 'header', label: 'SECTION_TYPE_LABELS.HEADER' },
    { value: 'hero', label: 'SECTION_TYPE_LABELS.HERO' },
    { value: 'hero-glass', label: 'SECTION_TYPE_LABELS.HERO_GLASS' },
    { value: 'best-sellers', label: 'SECTION_TYPE_LABELS.BEST_SELLERS' },
    { value: 'product-carousel', label: 'SECTION_TYPE_LABELS.PRODUCT_CAROUSEL' },
    { value: 'lookbook', label: 'SECTION_TYPE_LABELS.LOOKBOOK' },
    { value: 'video-hero', label: 'SECTION_TYPE_LABELS.VIDEO_HERO' },
    { value: 'blog-posts', label: 'SECTION_TYPE_LABELS.BLOG_POSTS' },
    { value: 'categories', label: 'SECTION_TYPE_LABELS.CATEGORIES' },
    { value: 'special-offer', label: 'SECTION_TYPE_LABELS.SPECIAL_OFFER' },
    { value: 'brands', label: 'SECTION_TYPE_LABELS.BRANDS' },
    { value: 'testimonials', label: 'SECTION_TYPE_LABELS.TESTIMONIALS' },
    { value: 'newsletter', label: 'SECTION_TYPE_LABELS.NEWSLETTER' },
    { value: 'features-grid', label: 'SECTION_TYPE_LABELS.FEATURES_GRID' },
    { value: 'faq', label: 'SECTION_TYPE_LABELS.FAQ' },
    { value: 'stats', label: 'SECTION_TYPE_LABELS.STATS' },
    { value: 'contacts', label: 'SECTION_TYPE_LABELS.CONTACTS' },
    { value: 'about', label: 'SECTION_TYPE_LABELS.ABOUT' },
    { value: 'product-tabs', label: 'SECTION_TYPE_LABELS.PRODUCT_TABS' },
    { value: 'similar-products', label: 'SECTION_TYPE_LABELS.SIMILAR_PRODUCTS' },
    { value: 'bought-together', label: 'SECTION_TYPE_LABELS.BOUGHT_TOGETHER' },
    { value: 'html-content', label: 'SECTION_TYPE_LABELS.HTML_CONTENT' },
    { value: 'footer', label: 'SECTION_TYPE_LABELS.FOOTER' }
  ];


  pageTargets: { value: string; label: string; translate?: boolean }[] = [
    { value: 'home', label: 'TARGET_HOME', translate: true },
    { value: 'product', label: 'TARGET_PRODUCT', translate: true },
    { value: 'shop', label: 'TARGET_SHOP', translate: true },
  ];

  variants = [
    { value: 'default', label: 'VARIANT_DEFAULT' },
    { value: 'light', label: 'VARIANT_LIGHT' },
    { value: 'dark', label: 'VARIANT_DARK' },
    { value: 'glass', label: 'VARIANT_GLASS' },
    { value: 'light-soft', label: 'VARIANT_LIGHT_SOFT' },
    { value: 'dark-soft', label: 'VARIANT_DARK_SOFT' },
    { value: 'deep-dark', label: 'VARIANT_DEEP_DARK' },
    { value: 'glass-clear', label: 'VARIANT_GLASS_CLEAR' },
    { value: 'glass-deep', label: 'VARIANT_GLASS_DEEP' },
    { value: 'minimal', label: 'VARIANT_MINIMAL' }
  ];

  menuAccessOptions = [
    { value: 'all', label: 'HEADER_MENU_ACCESS_ALL' },
    { value: 'admin', label: 'HEADER_MENU_ACCESS_ADMIN' },
    { value: 'closed', label: 'HEADER_MENU_ACCESS_CLOSED' }
  ];

  availableSections: Section[] = [];
  productFilterCategories: Category[] = [];
  readonly carouselSortOptions = [
    { value: 'newest', label: 'CATALOG_SORT_NEWEST' },
    { value: 'name', label: 'CATALOG_SORT_NAME' },
    { value: 'price', label: 'CATALOG_SORT_PRICE' },
    { value: 'stock', label: 'CATALOG_SORT_STOCK' },
  ] as const;

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private pageService: PageService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    @Optional() public dialogRef: MatDialogRef<SectionFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { section: Section | null }
  ) {
    this.sectionForm = this.fb.group({}); // Temp init
    this.isEditMode = false;
  }

  ngOnInit(): void {
    const dataSource = this.isDrawerMode ? this.data : this.dialogData;
    this.isEditMode = !!dataSource?.section?.id;
    this.sectionForm = this.createForm(dataSource?.section);

    if (this.isEditMode && dataSource?.section?.model3dUrl) {
      this.model3dUrl = dataSource.section.model3dUrl;
      this.model3dFileName = dataSource.section.model3dUrl.split('/').pop() || null;
    }

    const videoUrl = (dataSource?.section?.settings as any)?.videoUrl || this.sectionForm.get('videoUrl')?.value;
    if (videoUrl) {
      this.videoFileName = videoUrl.split('/').pop()?.split('?')[0] || null;
    }

    this.loadAvailableSections();
    this.loadPageTargets();
    this.loadCategories();

    // Live Sync for Preview
    this.sectionForm.valueChanges.subscribe(val => {
      const packed = this.packLocalizedFields(val);
      // Ensure other fields from val are preserved
      const previewData = { ...val, ...packed };
      this.formChanged.emit(previewData);
    });

    if (!dataSource?.section?.id) {
      const type = this.sectionForm.get('type')?.value;
      const preset = type ? getSectionPreset(type) : null;
      if (preset) {
        this.applyPresetToForm(preset);
      }
    }
  }

  ngAfterViewInit(): void {
    // Subscribe to changes in the imageUploadComponents QueryList
    this.imageUploadComponents.changes.subscribe(() => {
      // This will be called whenever the QueryList changes,
      // allowing you to access the newly added ImageUploadComponent instances.
      // For example, if you need to re-initialize them or update their state.
      // This is a placeholder; you might need to implement specific logic here
      // if you have specific initialization needs for the image upload components.
    });
  }

  private loadAvailableSections(): void {
    this.sectionService.getSections().subscribe(sections => {
      this.availableSections = sections.filter(
        section =>
          section.type !== 'header' &&
          section.type !== 'footer' &&
          section.isActive !== false &&
          section.pageTarget === 'home'
      );
      this.syncMenuSectionIdsFromUrls();
    });
  }

  /** Resolve legacy `#type` menu links to sectionId after sections load. */
  private syncMenuSectionIdsFromUrls(): void {
    this.menu.controls.forEach(control => {
      const url = control.get('url')?.value as string;
      const currentId = control.get('sectionId')?.value;
      if (!url?.startsWith('#') || currentId) {
        return;
      }
      const match = findSectionByHash(this.availableSections, url);
      if (match?.id) {
        control.patchValue({ sectionId: match.id }, { emitEvent: false });
      }
    });
  }

  private loadPageTargets(): void {
    this.pageService.getPagesForAdmin().subscribe(pages => {
      const staticTargets = [
        { value: 'home', label: 'TARGET_HOME', translate: true },
        { value: 'product', label: 'TARGET_PRODUCT', translate: true },
        { value: 'shop', label: 'TARGET_SHOP', translate: true },
      ];
      const pageTargets = pages.map(page => ({
        value: page.slug,
        label: typeof page.title === 'string' ? page.title : (page.title?.en || page.slug),
        translate: false,
      }));
      this.pageTargets = [...staticTargets, ...pageTargets];

      const currentTarget = this.sectionForm.get('pageTarget')?.value;
      if (currentTarget && !this.pageTargets.some(t => t.value === currentTarget)) {
        this.pageTargets.push({ value: currentTarget, label: currentTarget });
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.productFilterCategories = categories;
      },
    });
  }

  getProductCategorySlug(category: Category): string {
    const name = typeof category.name === 'string'
      ? category.name
      : category.name?.en || '';
    return category.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  onCarouselCategoriesChange(event: MatChipListboxChange): void {
    const value = Array.isArray(event.value)
      ? event.value
      : event.value
        ? [event.value]
        : [];
    this.sectionForm.get('carouselCategories')?.setValue(value);
  }

  private createForm(section?: Section | null): FormGroup {
    // Map database type to display type
    let displayType = section?.type || 'hero';
    if (section?.type === 'categories') {
      displayType = 'categories'; // Use the value from sectionTypes
    }

    // Use a casted version of settings for easier access in TS
    const settings = section?.settings as any;

    return this.fb.group({
      type: [displayType, Validators.required],
      title_en: [this.getLocalizedValue(section?.title, 'en') || '', (displayType === 'header' || displayType === 'brands' || displayType === 'categories' || displayType === 'footer') ? [] : [Validators.required]],
      title_ru: [this.getLocalizedValue(section?.title, 'ru') || ''],
      title_ua: [this.getLocalizedValue(section?.title, 'ua') || ''],
      subtitle_en: [this.getLocalizedValue(section?.subtitle, 'en') || ''],
      subtitle_ru: [this.getLocalizedValue(section?.subtitle, 'ru') || ''],
      subtitle_ua: [this.getLocalizedValue(section?.subtitle, 'ua') || ''],
      content_en: [this.getLocalizedValue(section?.content, 'en') || ''],
      content_ru: [this.getLocalizedValue(section?.content, 'ru') || ''],
      content_ua: [this.getLocalizedValue(section?.content, 'ua') || ''],
      imageUrl: [section?.imageUrl || settings?.posterImage || ''],
      isActive: [section?.isActive ?? true],
      model3dUrl: [section?.model3dUrl || ''],
      show3d: [section?.show3d ?? false],
      showImage: [section?.showImage ?? true],
      pageTarget: [section?.pageTarget || 'home'],
      variant: [section?.variant || 'default'],
      anchorId: [section?.anchorId || ''],

      logoUrl: [settings?.logoUrl || ''],
      showSearch: [settings?.showSearch ?? true],
      showCart: [settings?.showCart ?? true],
      showProfile: [settings?.showProfile ?? true],
      menu: this.fb.array(
        (settings?.menu || []).map((item: MenuItem) => {
          let titleObj: LocalizedString;
          if (typeof item.title === 'string') {
            titleObj = { en: item.title, ru: item.title, ua: item.title };
          } else {
            titleObj = {
              en: item.title?.en || '',
              ru: item.title?.ru || '',
              ua: item.title?.ua || ''
            };
          }
          return this.fb.group({
            title: this.fb.group({
              en: [titleObj.en],
              ru: [titleObj.ru],
              ua: [titleObj.ua]
            }),
            url: [item.url, Validators.required],
            access: [item.access || 'all', Validators.required],
            isActive: [item.isActive ?? true],
            sectionId: [item['sectionId'] || null]
          });
        })
      ),
      categories: this.fb.array(
        (displayType === 'categories' ? (settings?.categories || []) : []).map((category: any) =>
          this.fb.group({
            name: [this.getLocalizedValue(category.name, 'en'), Validators.required],
            slug: [category.slug || '', Validators.required],
            icon: [category.icon],
            isActive: [category.isActive ?? true]
          })
        )
      ),
      brands: this.fb.array(
        (settings?.brands || []).map((brand: any) =>
          this.fb.group({
            name: [this.getLocalizedValue(brand.name, 'en'), Validators.required],
            logo: [brand.logo || ''],
            isActive: [brand.isActive ?? true]
          })
        )
      ),
      testimonials: this.fb.array(
        (settings?.testimonials || []).map((item: any) =>
          this.fb.group({
            name: [this.getLocalizedValue(item.name, 'en'), Validators.required],
            role: [this.getLocalizedValue(item.role, 'en')],
            text: [this.getLocalizedValue(item.text, 'en'), Validators.required],
            avatar: [item.avatar || ''],
            rating: [item.rating ?? 5, [Validators.min(1), Validators.max(5)]],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      features: this.fb.array(
        (settings?.features || []).map((item: any) =>
          this.fb.group({
            icon: [item.icon || 'star', Validators.required],
            title: [this.getLocalizedValue(item.title, 'en'), Validators.required],
            description: [this.getLocalizedValue(item.description, 'en'), Validators.required],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      faqItems: this.fb.array(
        (settings?.items || []).map((item: any) =>
          this.fb.group({
            question: [this.getLocalizedValue(item.question, 'en'), Validators.required],
            answer: [this.getLocalizedValue(item.answer, 'en'), Validators.required],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      stats: this.fb.array(
        (settings?.stats || []).map((item: any) =>
          this.fb.group({
            value: [item.value || '', Validators.required],
            label: [this.getLocalizedValue(item.label, 'en'), Validators.required],
            suffix: [item.suffix || ''],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      carouselSource: [settings?.source || 'new'],
      carouselMode: [settings?.mode || 'products'],
      carouselCategories: [
        displayType === 'product-carousel' && Array.isArray(settings?.categories)
          ? settings.categories.filter((slug: unknown): slug is string => typeof slug === 'string')
          : [],
      ],
      carouselSortOrder: [settings?.sortOrder || 'newest'],
      carouselLimit: [settings?.limit ?? 8, [Validators.min(3), Validators.max(16)]],
      carouselAutoplay: [settings?.autoplay !== false],
      carouselSlides: this.fb.array(
        (settings?.slides || []).map((item: any) =>
          this.fb.group({
            image: [item.image || '', Validators.required],
            title: [this.getLocalizedValue(item.title, 'en'), Validators.required],
            subtitle: [this.getLocalizedValue(item.subtitle, 'en')],
            link: [item.link || '/shop'],
            price: [item.price ?? ''],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      lookbookSlides: this.fb.array(
        (settings?.slides || []).map((item: any) =>
          this.fb.group({
            image: [item.image || '', Validators.required],
            title: [this.getLocalizedValue(item.title, 'en'), Validators.required],
            subtitle: [this.getLocalizedValue(item.subtitle, 'en')],
            ctaLabel: [this.getLocalizedValue(item.ctaLabel, 'en')],
            ctaUrl: [item.ctaUrl || '/shop'],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      videoUrl: [settings?.videoUrl || ''],
      videoCtaText: [this.getLocalizedValue(settings?.ctaText, 'en') || ''],
      videoCtaLink: [settings?.ctaLink || '/shop'],
      videoSecondaryCtaText: [this.getLocalizedValue(settings?.secondaryCtaText, 'en') || ''],
      videoSecondaryCtaLink: [settings?.secondaryCtaLink || '/about'],
      videoAutoplay: [settings?.autoplay !== false],
      videoMuted: [settings?.muted !== false],
      videoLoop: [settings?.loop !== false],
      videoControls: [settings?.controls === true],
      videoShowPlayButton: [settings?.showPlayButton !== false],
      videoOverlayOpacity: [settings?.overlayOpacity ?? 0.5, [Validators.min(0), Validators.max(1)]],
      videoAlignment: [settings?.alignment || 'center'],
      blogDisplayMode: [settings?.displayMode || 'grid'],
      blogShowCta: [settings?.showCta ?? true],
      blogCtaText: [this.getLocalizedValue(settings?.ctaText, 'en') || ''],
      blogCtaLink: [settings?.ctaLink || '/shop'],
      blogPosts: this.fb.array(
        (settings?.blogPosts || []).map((item: any) =>
          this.fb.group({
            title: [this.getLocalizedValue(item.title, 'en'), Validators.required],
            excerpt: [this.getLocalizedValue(item.excerpt, 'en')],
            image: [item.image || ''],
            date: [item.date || ''],
            author: [item.author || ''],
            category: [item.category || ''],
            link: [item.link || '/shop'],
            isActive: [item.isActive ?? true]
          })
        )
      ),
      newsletterPlaceholder: [this.getLocalizedValue(settings?.placeholder, 'en') || ''],
      newsletterButtonText: [this.getLocalizedValue(settings?.buttonText, 'en') || 'Subscribe'],
      // Footer specific
      social: this.fb.group({
        instagram: [settings?.social?.instagram || ''],
        facebook: [settings?.social?.facebook || ''],
        twitter: [settings?.social?.twitter || ''],
        youtube: [settings?.social?.youtube || '']
      }),
      copyright: [settings?.copyright || ''],
      columns: this.fb.array(
        (settings?.columns && settings.columns.length > 0 ? settings.columns : (displayType === 'footer' ? this.getDefaultFooterColumns() : [])).map((col: any) => {
          let titleObj: LocalizedString;
          if (typeof col.title === 'string') {
            titleObj = { en: col.title, ru: col.title, ua: col.title };
          } else {
            titleObj = {
              en: col.title?.en || '',
              ru: col.title?.ru || '',
              ua: col.title?.ua || ''
            };
          }
          return this.fb.group({
            title: this.fb.group({
              en: [titleObj.en],
              ru: [titleObj.ru],
              ua: [titleObj.ua]
            }),
            links: this.fb.array((col.links || []).map((link: any) => {
              let labelObj: LocalizedString;
              if (typeof link.label === 'string') {
                labelObj = { en: link.label, ru: link.label, ua: link.label };
              } else {
                labelObj = {
                  en: link.label?.en || '',
                  ru: link.label?.ru || '',
                  ua: link.label?.ua || ''
                };
              }
              return this.fb.group({
                label: this.fb.group({
                  en: [labelObj.en],
                  ru: [labelObj.ru],
                  ua: [labelObj.ua]
                }),
                url: [link.url || '', Validators.required]
              });
            }))
          });
        })
      )
    });
  }

  private getDefaultFooterColumns(): any[] {
    return [
      {
        title: { en: 'Quick Links', ru: 'Быстрые ссылки', ua: 'Швидкі посилання' },
        linkSource: 'manual',
        links: [
          { label: { en: 'Home', ru: 'Главная', ua: 'Головна' }, url: '/home' },
          { label: { en: 'Shop', ru: 'Магазин', ua: 'Магазин' }, url: '/shop' },
          { label: { en: 'About', ru: 'О нас', ua: 'Про нас' }, url: '/about' },
          { label: { en: 'Contacts', ru: 'Контакты', ua: 'Контакти' }, url: '/contacts' }
        ]
      },
      {
        title: { en: 'Categories', ru: 'Категории', ua: 'Категорії' },
        linkSource: 'shop-categories',
        links: []
      }
    ];
  }


  get menu(): FormArray {
    return this.sectionForm.get('menu') as FormArray;
  }

  get categories(): FormArray {
    return this.sectionForm.get('categories') as FormArray;
  }

  get brands(): FormArray {
    return this.sectionForm.get('brands') as FormArray;
  }

  get testimonials(): FormArray {
    return this.sectionForm.get('testimonials') as FormArray;
  }

  get features(): FormArray {
    return this.sectionForm.get('features') as FormArray;
  }

  get faqItems(): FormArray {
    return this.sectionForm.get('faqItems') as FormArray;
  }

  get stats(): FormArray {
    return this.sectionForm.get('stats') as FormArray;
  }

  get lookbookSlides(): FormArray {
    return this.sectionForm.get('lookbookSlides') as FormArray;
  }

  get carouselSlides(): FormArray {
    return this.sectionForm.get('carouselSlides') as FormArray;
  }

  get blogPosts(): FormArray {
    return this.sectionForm.get('blogPosts') as FormArray;
  }

  get columns(): FormArray {
    return this.sectionForm.get('columns') as FormArray;
  }

  getLinks(columnIndex: number): FormArray {
    return this.columns.at(columnIndex).get('links') as FormArray;
  }

  addFooterColumn() {
    this.columns.push(this.fb.group({
      title: this.fb.group({
        en: [''],
        ru: [''],
        ua: ['']
      }),
      links: this.fb.array([])
    }));
  }

  removeFooterColumn(index: number) {
    this.columns.removeAt(index);
  }

  addFooterLink(columnIndex: number) {
    this.getLinks(columnIndex).push(this.fb.group({
      label: this.fb.group({
        en: [''],
        ru: [''],
        ua: ['']
      }),
      url: ['', Validators.required]
    }));
  }

  removeFooterLink(columnIndex: number, linkIndex: number) {
    this.getLinks(columnIndex).removeAt(linkIndex);
  }

  dropFooterColumn(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.columns.controls, event.previousIndex, event.currentIndex);
    this.columns.updateValueAndValidity();
  }

  dropFooterLink(columnIndex: number, event: CdkDragDrop<FormArray>) {
    const links = this.getLinks(columnIndex);
    moveItemInArray(links.controls, event.previousIndex, event.currentIndex);
    links.updateValueAndValidity();
  }

  addMenuItem() {
    this.menu.push(this.fb.group({
      title: this.fb.group({
        en: ['', Validators.required],
        ru: [''],
        ua: ['']
      }),
      url: ['', Validators.required],
      access: ['all', Validators.required],
      isActive: [true],
      sectionId: [null]
    }));
  }

  addCategory() {
    this.categories.push(this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      icon: [''],
      isActive: [true]
    }));
  }

  addBrand() {
    this.brands.push(this.fb.group({
      name: ['', Validators.required],
      logo: [''],
      isActive: [true]
    }));
  }

  addTestimonial() {
    this.testimonials.push(this.fb.group({
      name: ['', Validators.required],
      role: [''],
      text: ['', Validators.required],
      avatar: [''],
      rating: [5, [Validators.min(1), Validators.max(5)]],
      isActive: [true]
    }));
  }

  addFeature() {
    this.features.push(this.fb.group({
      icon: ['star', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true]
    }));
  }

  addFaqItem() {
    this.faqItems.push(this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
      isActive: [true]
    }));
  }

  addStat() {
    this.stats.push(this.fb.group({
      value: ['', Validators.required],
      label: ['', Validators.required],
      suffix: [''],
      isActive: [true]
    }));
  }

  addLookbookSlide() {
    this.lookbookSlides.push(this.fb.group({
      image: ['', Validators.required],
      title: ['', Validators.required],
      subtitle: [''],
      ctaLabel: [''],
      ctaUrl: ['/shop'],
      isActive: [true]
    }));
  }

  addCarouselSlide() {
    this.carouselSlides.push(this.fb.group({
      image: ['', Validators.required],
      title: ['', Validators.required],
      subtitle: [''],
      link: ['/shop'],
      price: [''],
      isActive: [true]
    }));
  }

  removeCarouselSlide(index: number) {
    this.carouselSlides.removeAt(index);
  }

  dropCarouselSlide(event: CdkDragDrop<FormArray>) {
    moveItemInArray(this.carouselSlides.controls, event.previousIndex, event.currentIndex);
    this.carouselSlides.updateValueAndValidity();
  }

  addBlogPost() {
    this.blogPosts.push(this.fb.group({
      title: ['', Validators.required],
      excerpt: [''],
      image: [''],
      date: [''],
      author: [''],
      category: [''],
      link: ['/shop'],
      isActive: [true]
    }));
  }

  removeMenuItem(index: number) {
    this.menu.removeAt(index);
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  removeBrand(index: number) {
    this.brands.removeAt(index);
  }

  removeTestimonial(index: number) {
    this.testimonials.removeAt(index);
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  removeFaqItem(index: number) {
    this.faqItems.removeAt(index);
  }

  removeStat(index: number) {
    this.stats.removeAt(index);
  }

  removeLookbookSlide(index: number) {
    this.lookbookSlides.removeAt(index);
  }

  removeBlogPost(index: number) {
    this.blogPosts.removeAt(index);
  }

  dropMenuItem(event: CdkDragDrop<FormArray>) {
    const dir = event.previousIndex > event.currentIndex ? -1 : 1;
    const from = event.previousIndex;
    const to = event.currentIndex;

    if (from === to) return;

    const control = this.menu.at(from);
    this.menu.removeAt(from);
    this.menu.insert(to, control);
  }

  dropCategory(event: CdkDragDrop<FormArray>) {
    const from = event.previousIndex;
    const to = event.currentIndex;

    if (from === to) return;

    const control = this.categories.at(from);
    this.categories.removeAt(from);
    this.categories.insert(to, control);
  }

  dropBrand(event: CdkDragDrop<FormArray>) {
    const from = event.previousIndex;
    const to = event.currentIndex;

    if (from === to) return;

    const control = this.brands.at(from);
    this.brands.removeAt(from);
    this.brands.insert(to, control);
  }

  dropTestimonial(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.testimonials, event);
  }

  dropFeature(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.features, event);
  }

  dropFaqItem(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.faqItems, event);
  }

  dropStat(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.stats, event);
  }

  dropLookbookSlide(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.lookbookSlides, event);
  }

  dropBlogPost(event: CdkDragDrop<FormArray>) {
    this.dropFormArrayItem(this.blogPosts, event);
  }

  private dropFormArrayItem(array: FormArray, event: CdkDragDrop<FormArray>): void {
    const from = event.previousIndex;
    const to = event.currentIndex;
    if (from === to) {
      return;
    }
    const control = array.at(from);
    array.removeAt(from);
    array.insert(to, control);
  }

  onSectionSelect(index: number, sectionId: number | null) {
    const menuItem = this.menu.at(index);
    if (sectionId) {
      const section = this.availableSections.find(s => s.id === sectionId);
      if (section) {
        menuItem.patchValue({ url: getSectionHash(section), sectionId });
      }
    } else {
      menuItem.patchValue({ sectionId: null });
    }
  }

  onImageFileSelected(file: File): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const imageUrl = this.normalizeUploadedUrl(response.url);
          this.sectionForm.patchValue({ imageUrl });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onPosterFileSelected(file: File): void {
    this.onImageFileSelected(file);
  }

  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) {
      this.snackBar.open(this.translate.instant('INVALID_VIDEO_FORMAT'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      this.snackBar.open(this.translate.instant('VIDEO_SIZE_LIMIT'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    this.uploadingVideo = true;
    this.sectionService.uploadVideo(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const videoUrl = this.normalizeUploadedUrl(response.url);
          this.sectionForm.patchValue({ videoUrl });
          this.videoFileName = file.name;
        }
        this.uploadingVideo = false;
      },
      error: () => {
        this.uploadingVideo = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_VIDEO'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  removeVideo(): void {
    this.sectionForm.patchValue({ videoUrl: '' });
    this.videoFileName = null;
  }

  onCarouselSlideImageSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.carouselSlides.at(index).patchValue({ image: this.normalizeUploadedUrl(response.url) });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onCarouselSlideImageUploaded(url: string, index: number): void {
    this.carouselSlides.at(index).patchValue({ image: url });
  }

  onLookbookSlideImageSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.lookbookSlides.at(index).patchValue({ image: this.normalizeUploadedUrl(response.url) });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onBlogPostImageSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.blogPosts.at(index).patchValue({ image: this.normalizeUploadedUrl(response.url) });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onTestimonialAvatarSelected(file: File, index: number): void {
    this.uploadingImage = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.testimonials.at(index).patchValue({ avatar: this.normalizeUploadedUrl(response.url) });
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  private normalizeUploadedUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  onImageUploaded(url: string): void {
    this.sectionForm.patchValue({ imageUrl: url });
  }

  onLogoFileSelected(file: File): void {
    this.uploadingLogo = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const baseUrl = window.location.origin;
          const logoUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
          this.sectionForm.patchValue({ logoUrl });
        }
        this.uploadingLogo = false;
      },
      error: (error) => {
        this.uploadingLogo = false;
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_LOGO'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onLogoUploaded(url: string): void {
    this.sectionForm.patchValue({ logoUrl: url });
    this.uploadingLogo = false;
  }

  onCategoryIconSelected(file: File, index: number): void {
    this.uploadingCategoryIcon = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const iconUrl = response.url;
          this.categories.at(index).patchValue({ icon: iconUrl });

          // Find the corresponding image upload component and notify it
          const imageUploadComponents = this.imageUploadComponents.toArray();
          if (imageUploadComponents[index + 1]) { // +1 because first component is for logo
            imageUploadComponents[index + 1].onUploadSuccess(iconUrl);
          }
        }
        this.uploadingCategoryIcon = false;
      },
      error: (error) => {
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_CATEGORY_ICON'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.uploadingCategoryIcon = false;
      }
    });
  }

  onCategoryIconUploaded(url: string, index: number): void {
    this.categories.at(index).patchValue({ icon: url });
  }

  removeCategoryIcon(index: number): void {
    this.categories.at(index).patchValue({ icon: '' });
  }

  onBrandLogoSelected(file: File, index: number): void {
    this.uploadingBrandLogo = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          const logoUrl = response.url;
          this.brands.at(index).patchValue({ logo: logoUrl });

          // Notify the image upload component
          const imageUploadComponents = this.imageUploadComponents.toArray();
          // Offset logic: Find by index among specific components if needed, or rely on index
          // This logic depends on the HTML structure. First is logo, then categories, then brands.
        }
        this.uploadingBrandLogo = false;
      },
      error: (error) => {
        this.snackBar.open(this.translate.instant('ERROR_UPLOADING_BRAND_LOGO'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.uploadingBrandLogo = false;
      }
    });
  }

  onBrandLogoUploaded(url: string, index: number): void {
    this.brands.at(index).patchValue({ logo: url });
  }

  onTestimonialAvatarUploaded(url: string, index: number): void {
    this.testimonials.at(index).patchValue({ avatar: url });
  }

  onLookbookSlideImageUploaded(url: string, index: number): void {
    this.lookbookSlides.at(index).patchValue({ image: url });
  }

  onBlogPostImageUploaded(url: string, index: number): void {
    this.blogPosts.at(index).patchValue({ image: url });
  }

  removeBrandLogo(index: number): void {
    this.brands.at(index).patchValue({ logo: '' });
  }

  on3dFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.name.toLowerCase().endsWith('.glb')) {
        this.snackBar.open(this.translate.instant('SELECT_VALID_GLB'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        this.snackBar.open(this.translate.instant('MODEL_3D_SIZE_LIMIT'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        return;
      }

      this.model3dFile = file;
      this.model3dFileName = file.name;
      this.sectionForm.patchValue({ model3dUrl: '' });
    }
  }

  remove3dModel(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.model3dFile = null;
    this.model3dUrl = null;
    this.model3dFileName = null;
    this.sectionForm.patchValue({ model3dUrl: '' });
  }

  private upload3dIfSelected(): Observable<string | null> {
    if (!this.model3dFile) {
      return of(this.sectionForm.value.model3dUrl || null);
    }

    this.uploading3d = true;
    return this.sectionService.upload3dModel(this.model3dFile).pipe(
      map(response => {
        this.uploading3d = false;
        if (response?.url) {
          const baseUrl = window.location.origin;
          const model3dUrl = response.url.startsWith('http') ? response.url : baseUrl + response.url;
          this.sectionForm.patchValue({ model3dUrl });
          return model3dUrl;
        }
        return null;
      }),
      catchError(error => {
        this.uploading3d = false;
        const resolved = resolveApiError(error, this.translate, {
          titleKey: 'ERROR_UPLOADING_3D_MODEL',
        });
        this.snackBar.open(formatResolvedApiError(resolved), this.translate.instant('CLOSE_BTN'), {
          duration: resolved.duration,
          panelClass: resolved.panelClass,
        });
        return throwError(() => error);
      })
    );
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    this.loading = true;

    this.upload3dIfSelected().subscribe({
      next: (model3dUrl) => {
        const rawFormValue = this.sectionForm.getRawValue();
        const formValue = this.packLocalizedFields(rawFormValue);
        const dataSource = this.isDrawerMode ? this.data : this.dialogData;
        const existingSettings = dataSource?.section?.settings || {};
        let formData: any;

        if (formValue.type === 'header') {
          formData = {
            type: formValue.type,
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              logoUrl: formValue.logoUrl || '',
              showSearch: formValue.showSearch ?? true,
              showCart: formValue.showCart ?? true,
              showProfile: formValue.showProfile ?? true,
              menu: (formValue.menu || []).map((item: any) => ({
                ...item,
                title: {
                  en: item.title?.en || '',
                  ru: item.title?.ru || '',
                  ua: item.title?.ua || ''
                }
              }))
            }
          };
        } else if (formValue.type === 'categories') {
          formData = {
            type: 'categories',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            settings: {
              ...existingSettings,
              categories: (formValue.categories || []).map((cat: any, index: number) => {
                const existingCat = this.findExistingCategory((existingSettings as any)?.categories, cat, index);
                const name = this.buildLocalizedNameFromForm(cat.name, existingCat?.name);
                return {
                  ...cat,
                  name,
                  slug: cat.slug || getLocalizedString(name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                };
              })
            }
          };
        } else if (formValue.type === 'brands') {
          formData = {
            type: 'brands',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: false,
            showImage: false,
            settings: {
              ...existingSettings,
              brands: (formValue.brands || []).map((brand: any, index: number) => {
                const existingBrand = this.findExistingBrand((existingSettings as any)?.brands, brand, index);
                return {
                  ...brand,
                  name: this.buildLocalizedNameFromForm(brand.name, existingBrand?.name)
                };
              })
            }
          };
        } else if (formValue.type === 'testimonials') {
          formData = {
            type: 'testimonials',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              testimonials: this.mapLocalizedSettingsList(
                formValue.testimonials,
                (existingSettings as any)?.testimonials,
                ['name', 'role', 'text']
              )
            }
          };
        } else if (formValue.type === 'features-grid') {
          formData = {
            type: 'features-grid',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              features: this.mapLocalizedSettingsList(
                formValue.features,
                (existingSettings as any)?.features,
                ['title', 'description']
              )
            }
          };
        } else if (formValue.type === 'faq') {
          formData = {
            type: 'faq',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              items: this.mapLocalizedSettingsList(
                formValue.faqItems,
                (existingSettings as any)?.items,
                ['question', 'answer']
              )
            }
          };
        } else if (formValue.type === 'stats') {
          formData = {
            type: 'stats',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              stats: this.mapLocalizedSettingsList(
                formValue.stats,
                (existingSettings as any)?.stats,
                ['label']
              )
            }
          };
        } else if (formValue.type === 'product-carousel') {
          formData = {
            type: 'product-carousel',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: false,
            showImage: false,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              mode: formValue.carouselMode || 'products',
              source: formValue.carouselSource || 'new',
              categories: formValue.carouselCategories || [],
              sortOrder: formValue.carouselSortOrder || 'newest',
              limit: Number(formValue.carouselLimit) || 8,
              autoplay: formValue.carouselAutoplay !== false,
              slides: formValue.carouselMode === 'custom'
                ? this.mapLocalizedSettingsList(
                    formValue.carouselSlides,
                    (existingSettings as any)?.slides,
                    ['title', 'subtitle']
                  ).map((slide: any) => ({
                    ...slide,
                    price: slide.price === '' || slide.price === null || slide.price === undefined
                      ? undefined
                      : Number(slide.price)
                  }))
                : (existingSettings as any)?.slides || []
            }
          };
        } else if (formValue.type === 'lookbook') {
          formData = {
            type: 'lookbook',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: false,
            showImage: true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              autoplay: formValue.carouselAutoplay !== false,
              slides: this.mapLocalizedSettingsList(
                formValue.lookbookSlides,
                (existingSettings as any)?.slides,
                ['title', 'subtitle', 'ctaLabel']
              )
            }
          };
        } else if (formValue.type === 'video-hero') {
          formData = {
            type: 'video-hero',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: false,
            showImage: true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              videoUrl: formValue.videoUrl || '',
              posterImage: formValue.imageUrl || '',
              autoplay: formValue.videoAutoplay !== false,
              muted: formValue.videoMuted !== false,
              loop: formValue.videoLoop !== false,
              controls: formValue.videoControls === true,
              overlayOpacity: Number(formValue.videoOverlayOpacity ?? 0.5),
              alignment: formValue.videoAlignment || 'center',
              showPlayButton: formValue.videoShowPlayButton !== false,
              ctaText: this.buildLocalizedNameFromForm(
                formValue.videoCtaText,
                (existingSettings as any)?.ctaText
              ),
              ctaLink: formValue.videoCtaLink || '/shop',
              secondaryCtaText: this.buildLocalizedNameFromForm(
                formValue.videoSecondaryCtaText,
                (existingSettings as any)?.secondaryCtaText
              ),
              secondaryCtaLink: formValue.videoSecondaryCtaLink || '/about'
            }
          };
        } else if (formValue.type === 'blog-posts') {
          formData = {
            type: 'blog-posts',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: '',
            show3d: false,
            showImage: true,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              displayMode: formValue.blogDisplayMode || 'grid',
              showCta: formValue.blogShowCta !== false,
              ctaText: this.buildLocalizedNameFromForm(
                formValue.blogCtaText,
                (existingSettings as any)?.ctaText
              ),
              ctaLink: formValue.blogCtaLink || '/shop',
              blogPosts: this.mapLocalizedSettingsList(
                formValue.blogPosts,
                (existingSettings as any)?.blogPosts,
                ['title', 'excerpt']
              )
            }
          };
        } else if (formValue.type === 'newsletter') {
          formData = {
            type: 'newsletter',
            title: formValue.title,
            subtitle: formValue.subtitle,
            content: formValue.content,
            imageUrl: formValue.imageUrl || '',
            isActive: formValue.isActive,
            model3dUrl: model3dUrl || '',
            show3d: formValue.show3d || false,
            showImage: formValue.showImage || false,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            settings: {
              ...existingSettings,
              placeholder: this.buildLocalizedNameFromForm(
                formValue.newsletterPlaceholder,
                (existingSettings as any)?.placeholder
              ),
              buttonText: this.buildLocalizedNameFromForm(
                formValue.newsletterButtonText,
                (existingSettings as any)?.buttonText
              )
            }
          };
        } else if (formValue.type === 'footer') {
          formData = {
            ...formValue,
            pageTarget: 'global', // Footer is usually global
            settings: {
              ...existingSettings,
              social: formValue.social,
              copyright: formValue.copyright,
              columns: formValue.columns
            }
          };
        } else {
          formData = {
            ...formValue,
            pageTarget: formValue.pageTarget || 'home',
            variant: formValue.variant || 'default',
            anchorId: formValue.anchorId || '',
            model3dUrl: model3dUrl || ''
            // NOTE: Explicitly NOT sending `settings` here so we don't accidentally trample
            // visualOverrides set by the Site Architect toolbar during an active session!
          };
        }

        if (this.isEditMode && dataSource?.section?.id) {
          this.sectionService.updateSection(dataSource.section.id, formData).subscribe({
            next: (result) => {
              this.loading = false;
              this.snackBar.open(this.translate.instant('SECTION_UPDATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
              if (this.isDrawerMode) {
                this.saved.emit(result);
              } else {
                this.dialogRef.close(result);
              }
            },
            error: (error) => {
              this.loading = false;
              this.snackBar.open(this.translate.instant('ERROR_UPDATING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            }
          });
        } else {
          this.sectionService.createSection(formData).subscribe({
            next: (result) => {
              this.loading = false;
              this.snackBar.open(this.translate.instant('SECTION_CREATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
              if (this.isDrawerMode) {
                this.saved.emit(result);
              } else {
                this.dialogRef.close(result);
              }
            },
            error: (error) => {
              this.loading = false;
              this.snackBar.open(this.translate.instant('ERROR_CREATING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            }
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(this.translate.instant('ERROR_PROCESSING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    if (this.isDrawerMode) {
      this.cancelled.emit();
    } else {
      this.dialogRef.close();
    }
  }

  loadDemoContent(): void {
    const type = this.sectionForm.get('type')?.value;
    const preset = getSectionPreset(type);

    if (!preset) {
      this.snackBar.open(
        this.translate.instant('DEMO_CONTENT_NOT_AVAILABLE'),
        this.translate.instant('CLOSE_BTN'),
        { duration: 3000 }
      );
      return;
    }

    const applyPreset = () => {
      this.applyPresetToForm(preset);
      this.snackBar.open(
        this.translate.instant('DEMO_CONTENT_LOADED'),
        this.translate.instant('CLOSE_BTN'),
        { duration: 3000 }
      );
    };

    if (this.isEditMode) {
      this.confirmationService.confirmAction(
        this.translate.instant('FILL_DEMO_DATA'),
        this.translate.instant('SECTION')
      ).pipe(take(1)).subscribe(confirmed => {
        if (confirmed) {
          applyPreset();
        }
      });
      return;
    }

    applyPreset();
  }

  private applyPresetToForm(preset: SectionPresetFormPatch): void {
    this.sectionForm.patchValue({
      title_en: preset.title_en ?? this.sectionForm.get('title_en')?.value,
      title_ru: preset.title_ru ?? this.sectionForm.get('title_ru')?.value,
      title_ua: preset.title_ua ?? this.sectionForm.get('title_ua')?.value,
      subtitle_en: preset.subtitle_en ?? this.sectionForm.get('subtitle_en')?.value,
      subtitle_ru: preset.subtitle_ru ?? this.sectionForm.get('subtitle_ru')?.value,
      subtitle_ua: preset.subtitle_ua ?? this.sectionForm.get('subtitle_ua')?.value,
      content_en: preset.content_en ?? this.sectionForm.get('content_en')?.value,
      content_ru: preset.content_ru ?? this.sectionForm.get('content_ru')?.value,
      content_ua: preset.content_ua ?? this.sectionForm.get('content_ua')?.value,
      imageUrl: preset.imageUrl ?? this.sectionForm.get('imageUrl')?.value,
      logoUrl: preset.logoUrl ?? this.sectionForm.get('logoUrl')?.value,
      showSearch: preset.showSearch ?? this.sectionForm.get('showSearch')?.value,
      showCart: preset.showCart ?? this.sectionForm.get('showCart')?.value,
      showProfile: preset.showProfile ?? this.sectionForm.get('showProfile')?.value,
      showImage: preset.showImage ?? this.sectionForm.get('showImage')?.value,
      show3d: preset.show3d ?? this.sectionForm.get('show3d')?.value,
      model3dUrl: preset.model3dUrl ?? this.sectionForm.get('model3dUrl')?.value,
      variant: preset.variant ?? this.sectionForm.get('variant')?.value,
      anchorId: preset.anchorId ?? this.sectionForm.get('anchorId')?.value,
      newsletterPlaceholder: preset.newsletterPlaceholder ?? this.sectionForm.get('newsletterPlaceholder')?.value,
      newsletterButtonText: preset.newsletterButtonText ?? this.sectionForm.get('newsletterButtonText')?.value,
      copyright: preset.copyright ?? this.sectionForm.get('copyright')?.value,
      carouselSource: preset.carouselSource ?? this.sectionForm.get('carouselSource')?.value,
      carouselMode: preset.carouselMode ?? this.sectionForm.get('carouselMode')?.value,
      carouselLimit: preset.carouselLimit ?? this.sectionForm.get('carouselLimit')?.value,
      carouselAutoplay: preset.carouselAutoplay ?? this.sectionForm.get('carouselAutoplay')?.value,
      videoUrl: preset.videoUrl ?? this.sectionForm.get('videoUrl')?.value,
      videoCtaText: preset.videoCtaText ?? this.sectionForm.get('videoCtaText')?.value,
      videoCtaLink: preset.videoCtaLink ?? this.sectionForm.get('videoCtaLink')?.value,
      videoSecondaryCtaText: preset.videoSecondaryCtaText ?? this.sectionForm.get('videoSecondaryCtaText')?.value,
      videoSecondaryCtaLink: preset.videoSecondaryCtaLink ?? this.sectionForm.get('videoSecondaryCtaLink')?.value,
      videoAutoplay: preset.videoAutoplay ?? this.sectionForm.get('videoAutoplay')?.value,
      videoMuted: preset.videoMuted ?? this.sectionForm.get('videoMuted')?.value,
      videoLoop: preset.videoLoop ?? this.sectionForm.get('videoLoop')?.value,
      videoControls: preset.videoControls ?? this.sectionForm.get('videoControls')?.value,
      videoShowPlayButton: preset.videoShowPlayButton ?? this.sectionForm.get('videoShowPlayButton')?.value,
      videoOverlayOpacity: preset.videoOverlayOpacity ?? this.sectionForm.get('videoOverlayOpacity')?.value,
      videoAlignment: preset.videoAlignment ?? this.sectionForm.get('videoAlignment')?.value,
      blogDisplayMode: preset.blogDisplayMode ?? this.sectionForm.get('blogDisplayMode')?.value,
      blogShowCta: preset.blogShowCta ?? this.sectionForm.get('blogShowCta')?.value,
      blogCtaText: preset.blogCtaText ?? this.sectionForm.get('blogCtaText')?.value,
      blogCtaLink: preset.blogCtaLink ?? this.sectionForm.get('blogCtaLink')?.value
    });

    if (preset.social) {
      this.sectionForm.get('social')?.patchValue(preset.social);
    }

    if (preset.menu) {
      this.setFormArray(this.menu, preset.menu, item =>
        this.fb.group({
          title: this.fb.group({
            en: [item.title.en],
            ru: [item.title.ru],
            ua: [item.title.ua]
          }),
          url: [item.url, Validators.required],
          access: [item.access, Validators.required],
          isActive: [item.isActive ?? true],
          sectionId: [null]
        })
      );
    }

    if (preset.categories) {
      this.setFormArray(this.categories, preset.categories, item =>
        this.fb.group({
          name: [item.name, Validators.required],
          slug: [item.slug, Validators.required],
          icon: [item.icon],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.brands) {
      this.setFormArray(this.brands, preset.brands, item =>
        this.fb.group({
          name: [item.name, Validators.required],
          logo: [item.logo],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.testimonials) {
      this.setFormArray(this.testimonials, preset.testimonials, item =>
        this.fb.group({
          name: [item.name, Validators.required],
          role: [item.role],
          text: [item.text, Validators.required],
          avatar: [item.avatar],
          rating: [item.rating ?? 5, [Validators.min(1), Validators.max(5)]],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.features) {
      this.setFormArray(this.features, preset.features, item =>
        this.fb.group({
          icon: [item.icon, Validators.required],
          title: [item.title, Validators.required],
          description: [item.description, Validators.required],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.faqItems) {
      this.setFormArray(this.faqItems, preset.faqItems, item =>
        this.fb.group({
          question: [item.question, Validators.required],
          answer: [item.answer, Validators.required],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.stats) {
      this.setFormArray(this.stats, preset.stats, item =>
        this.fb.group({
          value: [item.value, Validators.required],
          label: [item.label, Validators.required],
          suffix: [item.suffix || ''],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.lookbookSlides) {
      this.setFormArray(this.lookbookSlides, preset.lookbookSlides, item =>
        this.fb.group({
          image: [item.image, Validators.required],
          title: [item.title, Validators.required],
          subtitle: [item.subtitle],
          ctaLabel: [item.ctaLabel],
          ctaUrl: [item.ctaUrl || '/shop'],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.carouselSlides) {
      this.setFormArray(this.carouselSlides, preset.carouselSlides, item =>
        this.fb.group({
          image: [item.image, Validators.required],
          title: [item.title, Validators.required],
          subtitle: [item.subtitle || ''],
          link: [item.link || '/shop'],
          price: [item.price ?? ''],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.videoUrl) {
      this.videoFileName = preset.videoUrl.split('/').pop()?.split('?')[0] || null;
    }

    if (preset.blogPosts) {
      this.setFormArray(this.blogPosts, preset.blogPosts, item =>
        this.fb.group({
          title: [item.title, Validators.required],
          excerpt: [item.excerpt],
          image: [item.image || ''],
          date: [item.date || ''],
          author: [item.author || ''],
          category: [item.category || ''],
          link: [item.link || '/shop'],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.columns) {
      this.setFormArray(this.columns, preset.columns, col =>
        this.fb.group({
          title: this.fb.group({
            en: [col.title.en],
            ru: [col.title.ru],
            ua: [col.title.ua]
          }),
          linkSource: [col.linkSource || 'manual'],
          links: this.fb.array((col.links || []).map(link =>
            this.fb.group({
              label: this.fb.group({
                en: [link.label.en],
                ru: [link.label.ru],
                ua: [link.label.ua]
              }),
              url: [link.url, Validators.required]
            })
          ))
        })
      );
    }
  }

  private setFormArray<T>(array: FormArray, items: T[], builder: (item: T) => FormGroup): void {
    while (array.length) {
      array.removeAt(0);
    }
    items.forEach(item => array.push(builder(item)));
  }

  getLocalizedValue(value: any, lang: string): string {
    if (!value) return '';
    if (typeof value === 'string') return lang === 'en' ? value : '';
    return value[lang] || '';
  }

  private buildLocalizedNameFromForm(
    formName: string,
    existingName: string | LocalizedString | undefined
  ): LocalizedString {
    const existing =
      typeof existingName === 'object' && existingName !== null
        ? existingName
        : {
            en: typeof existingName === 'string' ? existingName : '',
            ru: '',
            ua: ''
          };

    return {
      en: formName || '',
      ru: existing.ru || '',
      ua: existing.ua || ''
    };
  }

  private mapLocalizedSettingsList(
    items: any[] | undefined,
    existingItems: any[] | undefined,
    localizedFields: string[]
  ): any[] {
    return (items || []).map((item, index) => {
      const existing = (existingItems || [])[index];
      const mapped = { ...item };
      localizedFields.forEach(field => {
        mapped[field] = this.buildLocalizedNameFromForm(item[field], existing?.[field]);
      });
      return mapped;
    });
  }

  private findExistingCategory(categories: any[] | undefined, cat: any, index: number): any {
    const list = categories || [];
    return list.find((item) => item.slug && cat.slug && item.slug === cat.slug) || list[index];
  }

  private findExistingBrand(brands: any[] | undefined, brand: any, index: number): any {
    const list = brands || [];
    return list.find((item) => item.name && brand.name && getLocalizedString(item.name) === brand.name) || list[index];
  }

  private packLocalizedFields(formValue: any): any {
    const data = { ...formValue };

    data.title = {
      en: formValue.title_en,
      ru: formValue.title_ru,
      ua: formValue.title_ua
    };

    data.subtitle = {
      en: formValue.subtitle_en,
      ru: formValue.subtitle_ru,
      ua: formValue.subtitle_ua
    };

    data.content = {
      en: formValue.content_en,
      ru: formValue.content_ru,
      ua: formValue.content_ua
    };

    if (formValue.type === 'lookbook') {
      data.settings = {
        autoplay: formValue.carouselAutoplay !== false,
        slides: this.mapLocalizedSettingsList(
          formValue.lookbookSlides,
          undefined,
          ['title', 'subtitle', 'ctaLabel']
        )
      };
    }

    if (formValue.type === 'product-carousel') {
      data.settings = {
        mode: formValue.carouselMode || 'products',
        source: formValue.carouselSource || 'new',
        categories: formValue.carouselCategories || [],
        sortOrder: formValue.carouselSortOrder || 'newest',
        limit: Number(formValue.carouselLimit) || 8,
        autoplay: formValue.carouselAutoplay !== false,
        slides: formValue.carouselMode === 'custom'
          ? this.mapLocalizedSettingsList(
              formValue.carouselSlides,
              undefined,
              ['title', 'subtitle']
            ).map((slide: any) => ({
              ...slide,
              price: slide.price === '' || slide.price === null || slide.price === undefined
                ? undefined
                : Number(slide.price)
            }))
          : []
      };
    }

    if (formValue.type === 'video-hero') {
      data.settings = {
        videoUrl: formValue.videoUrl || '',
        posterImage: formValue.imageUrl || '',
        autoplay: formValue.videoAutoplay !== false,
        muted: formValue.videoMuted !== false,
        loop: formValue.videoLoop !== false,
        controls: formValue.videoControls === true,
        overlayOpacity: Number(formValue.videoOverlayOpacity ?? 0.5),
        alignment: formValue.videoAlignment || 'center',
        showPlayButton: formValue.videoShowPlayButton !== false,
        ctaText: formValue.videoCtaText || '',
        ctaLink: formValue.videoCtaLink || '/shop',
        secondaryCtaText: formValue.videoSecondaryCtaText || '',
        secondaryCtaLink: formValue.videoSecondaryCtaLink || '/about'
      };
    }

    if (formValue.type === 'blog-posts') {
      data.settings = {
        displayMode: formValue.blogDisplayMode || 'grid',
        showCta: formValue.blogShowCta !== false,
        ctaText: formValue.blogCtaText || '',
        ctaLink: formValue.blogCtaLink || '/shop',
        blogPosts: this.mapLocalizedSettingsList(
          formValue.blogPosts,
          undefined,
          ['title', 'excerpt']
        )
      };
    }

    // Cleanup temporary fields
    delete data.title_en; delete data.title_ru; delete data.title_ua;
    delete data.subtitle_en; delete data.subtitle_ru; delete data.subtitle_ua;
    delete data.content_en; delete data.content_ru; delete data.content_ua;

    return data;
  }
}
