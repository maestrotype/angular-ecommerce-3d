import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SectionPresetFormPatch } from '../../section-presets';
import { setFormArray } from './section-form-array.util';

export function applySectionPresetToForm(
  form: FormGroup,
  fb: FormBuilder,
  preset: SectionPresetFormPatch,
  onVideoFileName?: (name: string | null) => void
): void {
    form.patchValue({
      title_en: preset.title_en ?? form.get('title_en')?.value,
      title_ru: preset.title_ru ?? form.get('title_ru')?.value,
      title_ua: preset.title_ua ?? form.get('title_ua')?.value,
      subtitle_en: preset.subtitle_en ?? form.get('subtitle_en')?.value,
      subtitle_ru: preset.subtitle_ru ?? form.get('subtitle_ru')?.value,
      subtitle_ua: preset.subtitle_ua ?? form.get('subtitle_ua')?.value,
      content_en: preset.content_en ?? form.get('content_en')?.value,
      content_ru: preset.content_ru ?? form.get('content_ru')?.value,
      content_ua: preset.content_ua ?? form.get('content_ua')?.value,
      imageUrl: preset.imageUrl ?? form.get('imageUrl')?.value,
      logoUrl: preset.logoUrl ?? form.get('logoUrl')?.value,
      showSearch: preset.showSearch ?? form.get('showSearch')?.value,
      showCart: preset.showCart ?? form.get('showCart')?.value,
      showProfile: preset.showProfile ?? form.get('showProfile')?.value,
      showImage: preset.showImage ?? form.get('showImage')?.value,
      show3d: preset.show3d ?? form.get('show3d')?.value,
      model3dUrl: preset.model3dUrl ?? form.get('model3dUrl')?.value,
      variant: preset.variant ?? form.get('variant')?.value,
      anchorId: preset.anchorId ?? form.get('anchorId')?.value,
      newsletterPlaceholder: preset.newsletterPlaceholder ?? form.get('newsletterPlaceholder')?.value,
      newsletterButtonText: preset.newsletterButtonText ?? form.get('newsletterButtonText')?.value,
      copyright: preset.copyright ?? form.get('copyright')?.value,
      carouselSource: preset.carouselSource ?? form.get('carouselSource')?.value,
      carouselMode: preset.carouselMode ?? form.get('carouselMode')?.value,
      carouselLimit: preset.carouselLimit ?? form.get('carouselLimit')?.value,
      carouselAutoplay: preset.carouselAutoplay ?? form.get('carouselAutoplay')?.value,
      videoUrl: preset.videoUrl ?? form.get('videoUrl')?.value,
      videoCtaText: preset.videoCtaText ?? form.get('videoCtaText')?.value,
      videoCtaLink: preset.videoCtaLink ?? form.get('videoCtaLink')?.value,
      videoSecondaryCtaText: preset.videoSecondaryCtaText ?? form.get('videoSecondaryCtaText')?.value,
      videoSecondaryCtaLink: preset.videoSecondaryCtaLink ?? form.get('videoSecondaryCtaLink')?.value,
      videoAutoplay: preset.videoAutoplay ?? form.get('videoAutoplay')?.value,
      videoMuted: preset.videoMuted ?? form.get('videoMuted')?.value,
      videoLoop: preset.videoLoop ?? form.get('videoLoop')?.value,
      videoControls: preset.videoControls ?? form.get('videoControls')?.value,
      videoShowPlayButton: preset.videoShowPlayButton ?? form.get('videoShowPlayButton')?.value,
      videoOverlayOpacity: preset.videoOverlayOpacity ?? form.get('videoOverlayOpacity')?.value,
      videoAlignment: preset.videoAlignment ?? form.get('videoAlignment')?.value,
      stageCategories: preset.stageCategories ?? form.get('stageCategories')?.value,
      stageLimit: preset.stageLimit ?? form.get('stageLimit')?.value,
      stageAutoRotate: preset.stageAutoRotate ?? form.get('stageAutoRotate')?.value,
      stageProductIds: preset.stageProductIds ?? form.get('stageProductIds')?.value,
      blogDisplayMode: preset.blogDisplayMode ?? form.get('blogDisplayMode')?.value,
      blogShowCta: preset.blogShowCta ?? form.get('blogShowCta')?.value,
      blogCtaText: preset.blogCtaText ?? form.get('blogCtaText')?.value,
      blogCtaLink: preset.blogCtaLink ?? form.get('blogCtaLink')?.value
    });

    if (preset.social) {
      form.get('social')?.patchValue(preset.social);
    }

    if (preset.menu) {
      setFormArray(form.get('menu') as FormArray, preset.menu, (item: any) =>
        fb.group({
          title: fb.group({
            en: [item.title.en],
            ru: [item.title.ru],
            ua: [item.title.ua]
          }),
          url: [item.url, Validators.required],
          access: [item.access, Validators.required],
          isActive: [item.isActive ?? true],
          sectionId: [null]
        })
      );
    }

    if (preset.categories) {
      setFormArray(form.get('categories') as FormArray, preset.categories, (item: any) =>
        fb.group({
          name: [item.name, Validators.required],
          slug: [item.slug, Validators.required],
          icon: [item.icon],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.brands) {
      setFormArray(form.get('brands') as FormArray, preset.brands, (item: any) =>
        fb.group({
          name: [item.name, Validators.required],
          logo: [item.logo],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.testimonials) {
      setFormArray(form.get('testimonials') as FormArray, preset.testimonials, (item: any) =>
        fb.group({
          name: [item.name, Validators.required],
          role: [item.role],
          text: [item.text, Validators.required],
          avatar: [item.avatar],
          rating: [item.rating ?? 5, [Validators.min(1), Validators.max(5)]],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.features) {
      setFormArray(form.get('features') as FormArray, preset.features, (item: any) =>
        fb.group({
          icon: [item.icon, Validators.required],
          title: [item.title, Validators.required],
          description: [item.description, Validators.required],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.faqItems) {
      setFormArray(form.get('faqItems') as FormArray, preset.faqItems, (item: any) =>
        fb.group({
          question: [item.question, Validators.required],
          answer: [item.answer, Validators.required],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.stats) {
      setFormArray(form.get('stats') as FormArray, preset.stats, (item: any) =>
        fb.group({
          value: [item.value, Validators.required],
          label: [item.label, Validators.required],
          suffix: [item.suffix || ''],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.lookbookSlides) {
      setFormArray(form.get('lookbookSlides') as FormArray, preset.lookbookSlides, (item: any) =>
        fb.group({
          image: [item.image, Validators.required],
          title: [item.title, Validators.required],
          subtitle: [item.subtitle],
          ctaLabel: [item.ctaLabel],
          ctaUrl: [item.ctaUrl || '/shop'],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.carouselSlides) {
      setFormArray(form.get('carouselSlides') as FormArray, preset.carouselSlides, (item: any) =>
        fb.group({
          image: [item.image, Validators.required],
          title: [item.title, Validators.required],
          subtitle: [item.subtitle || ''],
          link: [item.link || '/shop'],
          price: [item.price ?? ''],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.videoUrl) {
      onVideoFileName?.(
        preset.videoUrl.split('/').pop()?.split('?')[0] || null
      );
    }

    if (preset.blogPosts) {
      setFormArray(form.get('blogPosts') as FormArray, preset.blogPosts, (item: any) =>
        fb.group({
          title: [item.title, Validators.required],
          excerpt: [item.excerpt],
          image: [item.image || ''],
          date: [item.date || ''],
          author: [item.author || ''],
          category: [item.category || ''],
          link: [item.link || '/shop'],
          isActive: [item.isActive ?? true]
        })
      );
    }

    if (preset.columns) {
      setFormArray(form.get('columns') as FormArray, preset.columns, (col: any) =>
        fb.group({
          title: fb.group({
            en: [col.title.en],
            ru: [col.title.ru],
            ua: [col.title.ua]
          }),
          linkSource: [col.linkSource || 'manual'],
          links: fb.array((col.links || []).map( (link: any) =>
            fb.group({
              label: fb.group({
                en: [link.label.en],
                ru: [link.label.ru],
                ua: [link.label.ua]
              }),
              url: [link.url, Validators.required]
            })
          ))
        })
      );
    }
}
