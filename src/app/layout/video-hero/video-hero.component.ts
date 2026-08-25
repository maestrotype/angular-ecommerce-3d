import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
export class VideoHeroComponent implements OnInit, OnChanges {
  @Input() data!: Section;
  @ViewChild('heroVideo') videoRef?: ElementRef<HTMLVideoElement>;

  settings: VideoHeroSettings = {};
  videoLoaded = false;
  videoError = false;
  isPlaying = false;

  ngOnInit(): void {
    this.applySettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.applySettings();
    }
  }

  togglePlay(): void {
    const el = this.videoRef?.nativeElement;
    if (!el) {
      return;
    }
    if (el.paused) {
      el.play();
      this.isPlaying = true;
    } else {
      el.pause();
      this.isPlaying = false;
    }
  }

  onVideoLoaded(): void {
    this.videoLoaded = true;
    const el = this.videoRef?.nativeElement;
    this.isPlaying = !!el && !el.paused;
  }

  onVideoError(): void {
    this.videoError = true;
    this.isPlaying = false;
  }

  private applySettings(): void {
    const incoming = (this.data?.settings as VideoHeroSettings) || {};
    this.settings = {
      autoplay: true,
      muted: true,
      loop: true,
      controls: false,
      overlayOpacity: 0.5,
      alignment: 'center',
      showPlayButton: true,
      ...incoming,
      posterImage: incoming.posterImage || this.data?.imageUrl || ''
    };
    this.videoError = !this.settings.videoUrl;
    this.videoLoaded = false;
    this.isPlaying = this.settings.autoplay === true && !!this.settings.videoUrl;
  }
}
