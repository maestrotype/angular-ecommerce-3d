import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeDViewerComponent } from './three-d-viewer.component';

@NgModule({
  declarations: [
    ThreeDViewerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ThreeDViewerComponent
  ]
})
export class ThreeDViewerModule { }
