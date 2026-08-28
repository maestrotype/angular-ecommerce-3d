import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionListComponent } from './section-list/section-list.component';

const routes: Routes = [
  { path: '', component: SectionListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SectionsRoutingModule {}
