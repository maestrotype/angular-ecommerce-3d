import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeDViewerComponent } from './three-d-viewer.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ThreeDViewerComponent
  ],
  exports: [
    ThreeDViewerComponent
  ]
})
export class ThreeDViewerModule { }
