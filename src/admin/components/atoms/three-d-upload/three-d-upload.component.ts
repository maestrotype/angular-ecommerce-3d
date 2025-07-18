import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ThreeDUploadService } from '../../../services/three-d-upload.service';

@Component({
  selector: 'app-three-d-upload',

  templateUrl: './three-d-upload.component.html',
  styleUrls: ['./three-d-upload.component.scss']
})
export class ThreeDUploadComponent {
  @Input() type: 'product' | 'section' = 'product';
  @Input() model3dUrl: string | null = null;
  @Output() model3dUrlChange = new EventEmitter<string | null>();
  uploading = false;

  constructor(private threeDUploadService: ThreeDUploadService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.glb')) return;
    this.uploading = true;
    this.threeDUploadService.upload3dModel(file, this.type).subscribe({
      next: (res) => {
        this.model3dUrl = res.url;
        this.model3dUrlChange.emit(res.url);
        this.uploading = false;
      },
      error: () => { this.uploading = false; }
    });
  }

  removeModel() {
    this.model3dUrl = null;
    this.model3dUrlChange.emit(null);
  }
}