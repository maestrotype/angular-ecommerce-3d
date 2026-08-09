import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'src/shared/models/section.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from 'src/app/shared/pipes/localized.pipe';

interface VideoHeroSettings {
  videoUrl?: string;
  posterImage?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  overlayOpacity?: number;
  alignment?: 'center' | 'left' | 'right';
  showPlayButton?: boolean;
  ctaText?: string | LocalizedString;
  ctaLink?: string;
  secondaryCtaText?: string | LocalizedString;
  secondaryCtaLink?: string;
}

@Component({
  selector: 'app-video-hero',
  templateUrl: './video-hero.component.html',
  styleUrls: ['./video-hero.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, LocalizedPipe]
})
export class VideoHeroComponent implements OnInit {
  @Input() data!: Section;

  settings: VideoHeroSettings = {};
  videoLoaded = false;
  videoError = false;

  ngOnInit(): void {
    this.settings = {
      autoplay: true,
      muted: true,
      loop: true,
      controls: false,
      overlayOpacity: 0.5,
      alignment: 'center',
      showPlayButton: true,
      ...(this.data?.settings as VideoHeroSettings || {})
    };
  }

  onVideoLoaded(): void {
    this.videoLoaded = true;
  }

  onVideoError(): void {
    this.videoError = true;
  }
}