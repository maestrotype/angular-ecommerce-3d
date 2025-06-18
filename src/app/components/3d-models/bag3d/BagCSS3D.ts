import { Component } from '@angular/core';

@Component({
  selector: 'app-bag-css3d',
  templateUrl: './BagCSS3D.html',
  styleUrls: ['./BagCSS3D.scss']
})
export class BagCSS3DComponent {
  quilDiamonds = Array(25).fill(0);
  chainLinks = Array(30).fill(0);

  constructor() {}
}