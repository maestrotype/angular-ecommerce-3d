import { NgModule } from '@angular/core';
import { AdminSharedModule } from '../../admin-shared.module';
import { SectionsRoutingModule } from './sections-routing.module';
import { SectionListComponent } from './section-list/section-list.component';
import { SectionFormComponent } from './section-form/section-form.component';
import { SectionHeaderFormComponent } from './section-form/types/header-form.component';
import { SectionFooterFormComponent } from './section-form/types/footer-form.component';
import { SectionProductCarouselFormComponent } from './section-form/types/product-carousel-form.component';
import { SectionHeroFormComponent } from './section-form/types/hero-form.component';
import { SectionProductStageFormComponent } from './section-form/types/product-stage-form.component';
import { SectionComponentsFormComponent } from './section-form/types/section-components-form.component';
import { SectionPickerComponent } from '../../components/sections/section-picker/section-picker.component';
import { AdminSectionPreviewComponent } from '../../components/sections/section-preview/admin-section-preview.component';

@NgModule({
  declarations: [
    SectionListComponent,
    SectionFormComponent,
    SectionHeaderFormComponent,
    SectionFooterFormComponent,
    SectionProductCarouselFormComponent,
    SectionHeroFormComponent,
    SectionProductStageFormComponent,
    SectionComponentsFormComponent,
    SectionPickerComponent,
    AdminSectionPreviewComponent,
  ],
  imports: [
    AdminSharedModule,
    SectionsRoutingModule,
  ],
})
export class SectionsModule {}
