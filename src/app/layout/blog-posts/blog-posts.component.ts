import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'src/shared/models/section.model';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { LocalizedPipe } from 'src/app/shared/pipes/localized.pipe';
import { ImageUrlPipe } from 'src/app/shared/pipes/image-url.pipe';

interface BlogPost {
  id: string;
  title: string | LocalizedString;
  excerpt: string | LocalizedString;
  image: string;
  date: string;
  author: string;
  category?: string;
  link?: string;
}

@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
  styleUrls: ['./blog-posts.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, LocalizedPipe, ImageUrlPipe]
})
export class BlogPostsComponent implements OnInit, OnChanges {
  @Input() data!: Section;

  posts: BlogPost[] = [];
  displayMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this.applySettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.applySettings();
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private applySettings(): void {
    const items = this.data?.settings?.blogPosts ?? [];
    this.posts = items
      .filter((item: any) => item.isActive !== false)
      .map((item: any) => ({
        id: item.id || `post-${Date.now()}-${Math.random()}`,
        title: item.title,
        excerpt: item.excerpt,
        image: item.image || '',
        date: item.date || new Date().toISOString().split('T')[0],
        author: item.author || '',
        category: item.category,
        link: item.link
      }));

    this.displayMode = this.data?.settings?.displayMode === 'list' ? 'list' : 'grid';
  }
}
