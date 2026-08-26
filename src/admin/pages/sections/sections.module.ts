import { NgModule } from '@angular/core';
import { AdminSharedModule } from '../../admin-shared.module';
import { SectionsRoutingModule } from './sections-routing.module';
import { SectionListComponent } from './section-list/section-list.component';
import { SectionFormComponent } from './section-form/section-form.component';
import { SectionPickerComponent } from '../../components/sections/section-picker/section-picker.component';
import { AdminSectionPreviewComponent } from '../../components/sections/section-preview/admin-section-preview.component';

@NgModule({
  declarations: [
    SectionListComponent,
    SectionFormComponent,
    SectionPickerComponent,
    AdminSectionPreviewComponent,
  ],
  imports: [
    AdminSharedModule,
    SectionsRoutingModule,
  ],
})
export class SectionsModule {}
