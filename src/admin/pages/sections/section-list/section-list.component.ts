import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SectionService } from '../../../services/section.service';
import { SectionFormComponent } from '../section-form/section-form.component';
import { Section, CreateSectionDto } from '../../../models/section.model';
import { LocalizedString } from '../../../../shared/models/localized-string.model';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from '../../../services/confirmation.service';
import { PageService } from '../../../services/page.service';
import { getLocalizedString } from 'src/shared/utils/localization.util';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { isSectionBasedPageTemplate } from 'src/shared/models/page.model';
import {
  buildMissingHomepageWizardDtos,
  HOMEPAGE_WIZARD_SECTIONS,
  wizardSectionExists
} from '../section-presets';
import {
  buildMissingPageTemplateSections,
  isPageTemplatePreset,
  PageTemplatePresetId
} from '../page-template-presets';

/** Build preview list matching storefront page composition (active, exact pageTarget, sorted). */
export function buildStorefrontPreviewSections(
  allSections: Section[],
  pageTarget: string
): Section[] {
  const active = allSections.filter(section => section.isActive !== false);
  const byOrder = (list: Section[]) =>
    [...list].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (pageTarget === 'global') {
    return byOrder(active.filter(section => section.pageTarget === 'global'));
  }

  const header = active.find(section => section.type === 'header' && section.pageTarget === 'global');
  const footer = active.find(section => section.type === 'footer' && section.pageTarget === 'global');
  const body = byOrder(
    active.filter(
      section =>
        section.pageTarget === pageTarget &&
        section.type !== 'header' &&
        section.type !== 'footer'
    )
  );

  const result: Section[] = [];
  if (header) {
    result.push(header);
  }
  result.push(...body);
  if (footer) {
    result.push(footer);
  }
  return result;
}

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class SectionListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['order', 'type', 'pageTarget', 'title', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Section>();
  allSections: Section[] = [];
  activePageTarget: string | null = 'home';
  pageFilterOptions: { value: string | null; label: string; translate?: boolean }[] = [
    { value: null, label: 'PAGE_TARGET_ALL', translate: true },
    { value: 'home', label: 'TARGET_HOME', translate: true },
    { value: 'shop', label: 'TARGET_SHOP', translate: true },
    { value: 'product', label: 'TARGET_PRODUCT', translate: true },
    { value: 'global', label: 'PAGE_TARGET_GLOBAL', translate: true },
  ];
  private readonly staticPageFilterOptions = [
    { value: 'home', label: 'TARGET_HOME', translate: true },
    { value: 'shop', label: 'TARGET_SHOP', translate: true },
    { value: 'product', label: 'TARGET_PRODUCT', translate: true },
    { value: 'global', label: 'PAGE_TARGET_GLOBAL', translate: true },
  ];
  loading = false;
  hasHeader = false;
  hasFooter = false;
  templateApplying = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isEditorOpen = false;
  editingSection: Section | null = null;
  editorMode: 'add' | 'edit' = 'add';
  showPicker = false;
  activeMenuLang: 'en' | 'ru' | 'ua' = 'en';
  previewData: any = null;
  selectedPreviewSection: Section | null = null;
  previewMode: 'desktop' | 'tablet' | 'mobile' | 'fold' = 'desktop';
  // 'default' = [data-theme="default"] (light), 'dark' = [data-theme="dark"], 'glass' = [data-theme="glass"]
  themeMode: 'default' | 'dark' | 'glass' = 'default';
  isFoldExpanded = false;
  selectedElementInfo: { selector: string, section: any } | null = null;
  sidebarWidth = 640;
  wizardRunning = false;
  isMobile = false;
  mobileArchitectOpen = false;
  private readonly resizeListener = () => this.checkScreenSize();
  private isResizing = false;
  private initialMouseX = 0;
  private initialSidebarWidth = 640;

  constructor(
    private sectionService: SectionService,
    private pageService: PageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  ngOnInit(): void {
    this.checkScreenSize();
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.resizeListener);
    }

    this.sidebarWidth = this.computeInitialSidebarWidth();
    this.initialSidebarWidth = this.sidebarWidth;

    this.loadPageFilterOptions();

    this.route.queryParams.subscribe(params => {
      const target = params['pageTarget'];
      const create = params['createIfMissing'] === 'true' || params['createIfMissing'] === true;
      const applyTemplate = params['applyTemplate'] as string | undefined;

      this.activePageTarget = target === undefined || target === null || target === '' ? 'home' : target;

      const handleQueryActions = () => {
        this.applyPageTargetFilter();
        if (target && create && this.getStorefrontTableSections(target).length === 0) {
          this.addSectionWithTarget(target);
        }
        if (target && applyTemplate && isPageTemplatePreset(applyTemplate)) {
          this.applyPageTemplateSections(target, applyTemplate);
        }
      };

      if (this.allSections.length === 0) {
        this.loadSections(handleQueryActions);
      } else {
        handleQueryActions();
      }
    });
    
    this.initResizeListeners();

    // Site Architect preview defaults to storefront light (independent of admin chrome theme).
    this.themeMode = 'default';
  }

  private initResizeListeners(): void {
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
  }

  onMouseDown(event: MouseEvent): void {
    this.isResizing = true;
    this.initialMouseX = event.clientX;
    this.initialSidebarWidth = this.sidebarWidth;
    document.body.classList.add('resizing-active');
    event.preventDefault();
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    
    // Smooth frame-based update
    requestAnimationFrame(() => {
      const deltaX = event.clientX - this.initialMouseX;
      const newWidth = this.initialSidebarWidth + deltaX;
      const maxWidth = Math.floor(window.innerWidth * 0.78);
      if (newWidth > 560 && newWidth < maxWidth) {
        this.sidebarWidth = newWidth;
      }
    });
  }

  private onMouseUp(): void {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.classList.remove('resizing-active');
    }
  }

  getSectionTypeLabelKey(type: string): string {
    const key = type.replace(/-/g, '_').toUpperCase();
    return `SECTION_TYPE_LABELS.${key}`;
  }

  private computeInitialSidebarWidth(): number {
    if (typeof window === 'undefined') {
      return 640;
    }
    const contentWidth = window.innerWidth - 280;
    return Math.min(860, Math.max(560, Math.floor(contentWidth * 0.52)));
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeListener);
      this.lockBodyScroll(false);
    }
  }

  toggleMobileArchitect(): void {
    if (this.mobileArchitectOpen) {
      this.closeMobileArchitect();
    } else {
      this.openMobileArchitect();
    }
  }

  openMobileArchitect(): void {
    this.mobileArchitectOpen = true;
    if (this.isMobile && this.previewMode === 'desktop') {
      this.previewMode = 'mobile';
    }
    this.lockBodyScroll(true);
  }

  closeMobileArchitect(): void {
    this.mobileArchitectOpen = false;
    this.lockBodyScroll(false);
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.mobileArchitectOpen = false;
        this.lockBodyScroll(false);
      }
    }
  }

  private lockBodyScroll(lock: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.body.classList.toggle('sections-architect-locked', lock);
  }

  loadSections(onLoaded?: () => void): void {
    this.loading = true;
    this.sectionService.getSections().subscribe({
      next: (sections) => {
        this.allSections = [...sections];
        this.hasHeader = sections.some(s => s.type === 'header');
        this.hasFooter = sections.some(s => s.type === 'footer');
        this.applyPageTargetFilter();
        this.loading = false;
        if (onLoaded) onLoaded();
      },
        error: (error) => {
          this.loading = false;
          const errorMsg = error?.status === 500
            ? this.translate.instant('SERVER_ERROR_LOGS_MSG')
            : this.translate.instant('FAILED_TO_LOAD_SECTIONS');
            
          this.snackBar.open(errorMsg, this.translate.instant('CLOSE_BTN'), { duration: 5000 });
        }
    });
  }

  private loadPageFilterOptions(): void {
    this.pageService.getPagesForAdmin().subscribe({
      next: (pages) => {
        const customOptions = pages
          .filter(page => isSectionBasedPageTemplate(page.template))
          .map(page => ({
            value: page.slug,
            label: getLocalizedString(page.title, this.translate.currentLang || 'en') || page.slug,
          }));
        this.pageFilterOptions = [
          { value: null, label: 'PAGE_TARGET_ALL', translate: true },
          ...this.staticPageFilterOptions,
          ...customOptions,
        ];
      },
    });
  }

  private applyPageTargetFilter(): void {
    if (!this.activePageTarget) {
      this.dataSource.data = [...this.allSections].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      return;
    }
    if (this.activePageTarget === 'global') {
      this.dataSource.data = this.allSections
        .filter(section => section.pageTarget === 'global')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return;
    }
    this.dataSource.data = this.getStorefrontTableSections(this.activePageTarget);
  }

  /** Table rows for a page — same scope as GET /sections?pageTarget=… */
  private getStorefrontTableSections(pageTarget: string): Section[] {
    return this.allSections
      .filter(section => section.pageTarget === pageTarget)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /** Sections passed to Site Architect — mirrors storefront composition. */
  get previewSections(): Section[] {
    const target = this.activePageTarget || 'home';
    let sections = buildStorefrontPreviewSections(this.allSections, target);

    if (this.isEditorOpen && this.previewData) {
      if (this.previewData.id) {
        sections = sections.map(section =>
          section.id === this.previewData.id ? { ...section, ...this.previewData } : section
        );
      } else if (this.previewData.type) {
        const draft = {
          ...this.previewData,
          isActive: this.previewData.isActive !== false,
          pageTarget: this.previewData.pageTarget || target,
          order: this.previewData.order ?? 9999
        };
        const header = sections.find(s => s.type === 'header');
        const footer = sections.find(s => s.type === 'footer');
        const body = sections.filter(s => s.type !== 'header' && s.type !== 'footer');
        sections = [
          ...(header ? [header] : []),
          ...body,
          draft,
          ...(footer ? [footer] : [])
        ];
      }
    }

    return sections;
  }

  onPageTargetFilterChange(value: string | null): void {
    this.activePageTarget = value;
    this.applyPageTargetFilter();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageTarget: value || null },
      queryParamsHandling: 'merge',
    });
  }

  getPageTargetLabel(target: string | undefined): string {
    if (!target) {
      return this.translate.instant('TARGET_HOME');
    }
    const option = this.pageFilterOptions.find(item => item.value === target);
    if (option?.translate) {
      return this.translate.instant(option.label);
    }
    return option?.label || target;
  }

  private addSectionWithTarget(target: string): void {
    this.editorMode = 'add';
    this.editingSection = { pageTarget: target } as any;
    this.showPicker = true;
    this.previewData = null;
    this.isEditorOpen = true;
  }

  private getDefaultPageTarget(): string {
    if (this.activePageTarget && this.activePageTarget !== 'global') {
      return this.activePageTarget;
    }
    return 'home';
  }

  private applyPageTemplateSections(pageTarget: string, template: PageTemplatePresetId): void {
    const dtos = buildMissingPageTemplateSections(pageTarget, template, this.allSections);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { applyTemplate: null },
      queryParamsHandling: 'merge',
    });

    if (dtos.length === 0) {
      this.snackBar.open(
        this.translate.instant('APPLY_PAGE_TEMPLATE_ALL_EXIST'),
        this.translate.instant('CLOSE_BTN'),
        { duration: 4000 }
      );
      return;
    }

    this.templateApplying = true;
    forkJoin(dtos.map(dto => this.sectionService.createSection(dto))).subscribe({
      next: () => {
        this.templateApplying = false;
        this.snackBar.open(
          this.translate.instant('APPLY_PAGE_TEMPLATE_SUCCESS', { count: dtos.length }),
          this.translate.instant('CLOSE_BTN'),
          { duration: 4000 }
        );
        this.loadSections();
      },
      error: () => {
        this.templateApplying = false;
        this.snackBar.open(
          this.translate.instant('APPLY_PAGE_TEMPLATE_ERROR'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 4000 }
        );
        this.loadSections();
      },
    });
  }

  onLangChange(lang: 'en' | 'ru' | 'ua'): void {
    this.activeMenuLang = lang;
  }

  onSectionTypeSelected(type: string): void {
    this.editorMode = 'add';
    const pageTarget = (type === 'header' || type === 'footer')
      ? 'global'
      : (this.editingSection?.pageTarget || this.getDefaultPageTarget());
    this.editingSection = { type, pageTarget } as any;
    this.isEditorOpen = true;
    this.showPicker = false;
    this.previewData = { type };
  }

  backToPicker(): void {
    const pageTarget = this.editingSection?.pageTarget || this.getDefaultPageTarget();
    this.editorMode = 'add';
    this.editingSection = { pageTarget } as any;
    this.previewData = null;
    this.showPicker = true;
  }

  selectForPreview(section: Section): void {
    if (this.isEditorOpen) return;
    this.selectedPreviewSection = this.selectedPreviewSection?.id === section.id ? null : section;
  }

  addSection(): void {
    this.editorMode = 'add';
    this.editingSection = this.activePageTarget && this.activePageTarget !== 'global'
      ? ({ pageTarget: this.activePageTarget } as Section)
      : null;
    this.showPicker = true;
    this.previewData = null;
    this.isEditorOpen = true;
  }

  runQuickStartWizard(): void {
    this.confirmationService.confirm({
      title: this.translate.instant('QUICK_START_WIZARD'),
      message: this.translate.instant('QUICK_START_WIZARD_CONFIRM'),
      confirmText: this.translate.instant('CREATE'),
      cancelText: this.translate.instant('CANCEL'),
      type: 'info'
    }).pipe(take(1)).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      const existing = this.allSections;
      const missingEntries = HOMEPAGE_WIZARD_SECTIONS.filter(entry => !wizardSectionExists(existing, entry));

      if (missingEntries.length === 0) {
        this.snackBar.open(
          this.translate.instant('QUICK_START_WIZARD_ALL_EXIST'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 4000 }
        );
        return;
      }

      const dtos = buildMissingHomepageWizardDtos(existing);

      this.wizardRunning = true;
      forkJoin(dtos.map(dto => this.sectionService.createSection(dto))).subscribe({
        next: () => {
          this.wizardRunning = false;
          const messageKey = missingEntries.length === HOMEPAGE_WIZARD_SECTIONS.length
            ? 'QUICK_START_WIZARD_SUCCESS'
            : 'QUICK_START_WIZARD_PARTIAL';
          this.snackBar.open(
            this.translate.instant(messageKey, { count: missingEntries.length }),
            this.translate.instant('CLOSE_BTN'),
            { duration: 4000 }
          );
          this.loadSections();
        },
        error: () => {
          this.wizardRunning = false;
          this.snackBar.open(
            this.translate.instant('QUICK_START_WIZARD_ERROR'),
            this.translate.instant('CLOSE_BTN'),
            { duration: 4000 }
          );
          this.loadSections();
        }
      });
    });
  }

  editSection(section: Section): void {
    this.editorMode = 'edit';
    this.editingSection = section;
    this.showPicker = false;
    this.previewData = { ...section };
    this.selectedPreviewSection = null;
    this.isEditorOpen = true;
    if (this.isMobile) {
      this.closeMobileArchitect();
    }
  }

  onFormChanged(data: any): void {
    // Merge into existing previewData to preserve server fields like `id`
    this.previewData = { ...this.previewData, ...data };
    
    // Live update the section in the main list so Architect view reflects changes
    if (this.editingSection && this.editingSection.id) {
      const allIndex = this.allSections.findIndex(s => s.id === this.editingSection?.id);
      if (allIndex > -1) {
        this.allSections = this.allSections.map((section, index) =>
          index === allIndex ? { ...section, ...data } : section
        );
      }
      const dataIndex = this.dataSource.data.findIndex(s => s.id === this.editingSection?.id);
      if (dataIndex > -1) {
        const updatedData = [...this.dataSource.data];
        updatedData[dataIndex] = { ...updatedData[dataIndex], ...data };
        this.dataSource.data = updatedData;
      }
    }
  }

  onFormSaved(): void {
    // Reload first, THEN close editor so the preview updates with fresh data
    this.loadSections(() => {
      this.closeEditor();
    });
  }

  closeEditor(): void {
    this.isEditorOpen = false;
    this.editingSection = null;
    this.previewData = null;
    this.showPicker = false;
  }

  toggleSection(section: Section): void {
    this.sectionService.toggleSection(section.id).subscribe({
      next: () => {
        const msg = section.isActive ? 'SECTION_DEACTIVATED' : 'SECTION_ACTIVATED';
        this.snackBar.open(this.translate.instant(msg), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.loadSections();
      },
      error: (error) => {
        this.snackBar.open(this.translate.instant('ERROR_UPDATING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  deleteSection(section: Section): void {
    const sectionLabel = getLocalizedString(section.title, this.translate.currentLang) || section.type;
    this.confirmationService.confirmDelete(sectionLabel).pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.sectionService.deleteSection(section.id).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('SECTION_DELETED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            this.loadSections();
          },
          error: () => {
            this.snackBar.open(this.translate.instant('ERROR_DELETING_SECTION'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          }
        });
      }
    });
  }

  duplicateSection(section: Section): void {
    const dto: CreateSectionDto = {
      type: section.type,
      title: this.buildDuplicateTitle(section.title),
      subtitle: section.subtitle,
      content: section.content,
      imageUrl: section.imageUrl,
      isActive: false,
      settings: JSON.parse(JSON.stringify(section.settings || {})),
      model3dUrl: section.model3dUrl,
      show3d: section.show3d,
      showImage: section.showImage,
      pageTarget: section.pageTarget,
      variant: section.variant,
      anchorId: section.anchorId ? `${section.anchorId}-copy` : undefined,
    };

    this.sectionService.createSection(dto).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('SECTION_DUPLICATED_SUCCESSFULLY'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
        this.loadSections();
      },
      error: () => {
        this.snackBar.open(
          this.translate.instant('ERROR_DUPLICATING_SECTION'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
      }
    });
  }

  private buildDuplicateTitle(title: string | LocalizedString): LocalizedString {
    const suffix = this.translate.instant('COPY_SUFFIX');
    if (typeof title === 'string') {
      return { en: `${title}${suffix}`, ru: `${title}${suffix}`, ua: `${title}${suffix}` };
    }

    return {
      en: `${title.en || ''}${suffix}`,
      ru: `${title.ru || title.en || ''}${suffix}`,
      ua: `${title.ua || title.en || ''}${suffix}`,
    };
  }

  trackBySectionId(_index: number, section: Section): number | string {
    return section.id;
  }

  drop(event: CdkDragDrop<Section[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const data = [...this.dataSource.data];
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.updateSectionOrder(data);
  }

  onPreviewReorder(newSections: Section[]): void {
    this.updateSectionOrder(newSections);
  }

  private updateSectionOrder(data: Section[]): void {
    this.dataSource.data = [...data];
    const sectionIds = data.map(section => section.id);
    this.sectionService.reorderSections(sectionIds).subscribe({
      next: (sections) => {
        this.allSections = sections;
        this.applyPageTargetFilter();
        this.snackBar.open(this.translate.instant('SECTIONS_REORDERED'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      },
      error: () => {
        this.snackBar.open(this.translate.instant('ERROR_REORDERING_SECTIONS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
        this.loadSections();
      }
    });
  }

  setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile' | 'fold'): void {
    if (mode === 'fold' && this.previewMode === 'fold') {
      this.isFoldExpanded = !this.isFoldExpanded;
    } else {
      this.previewMode = mode;
      this.isFoldExpanded = false;
    }
    this.selectedElementInfo = null;
  }

  setThemeMode(theme: 'default' | 'dark' | 'glass'): void {
    this.themeMode = theme;
  }

  onElementSelected(info: any): void {
    this.selectedElementInfo = info;
  }

  updateVisualOverride(property: string, delta: number|string): void {
    if (!this.selectedElementInfo) return;

    const { selector, section } = this.selectedElementInfo;
    const settings = JSON.parse(JSON.stringify(section.settings || {}));
    if (!settings.visualOverrides) settings.visualOverrides = { viewports: {}, themes: {} };

    // Support both numeric delta and direct value
    if (typeof delta === 'number') {
        const viewports = settings.visualOverrides.viewports;
        if (!viewports[this.previewMode]) viewports[this.previewMode] = {};
        if (!viewports[this.previewMode][selector]) viewports[this.previewMode][selector] = {};
        
        let currentVal = parseInt(viewports[this.previewMode][selector][property] || '0');
        viewports[this.previewMode][selector][property] = `${currentVal + delta}px`;
    }

    section.settings = settings;
    this.saveVisualOverride(section);
  }

  updateColorOverride(color: string, property: 'color' | 'background-color' = 'color'): void {
    if (!this.selectedElementInfo) return;

    const { selector, section } = this.selectedElementInfo;
    const settings = JSON.parse(JSON.stringify(section.settings || {}));
    if (!settings.visualOverrides) settings.visualOverrides = { viewports: {}, themes: {} };

    const themes = settings.visualOverrides.themes;
    if (!themes[this.themeMode]) themes[this.themeMode] = {};
    if (!themes[this.themeMode][selector]) themes[this.themeMode][selector] = {};
    
    themes[this.themeMode][selector][property] = color;

    settings.visualOverrides = { ...settings.visualOverrides, themes };
    section.settings = settings;
    this.saveVisualOverride(section);
  }

  private saveVisualOverride(section: any): void {
    this.sectionService.updateSection(section.id, { settings: section.settings }).subscribe({
      next: () => {
        this.allSections = this.allSections.map(s => s.id === section.id ? { ...section } : s);
        this.applyPageTargetFilter();
        
        // IMPORTANT: Sync local state so when the open form is submitted it doesn't overwrite these overrides
        if (this.editingSection && this.editingSection.id === section.id) {
          this.editingSection = { ...this.editingSection, settings: section.settings };
        }
        if (this.previewData && this.previewData.id === section.id) {
          this.previewData = { ...this.previewData, settings: section.settings };
        }
      }
    });
  }
}