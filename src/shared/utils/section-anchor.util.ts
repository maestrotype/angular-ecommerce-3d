import { Section } from '../models/section.model';

/** Canonical DOM / hash id for a section (anchor wins over type). */
export function getSectionAnchorId(
  section: Pick<Section, 'anchorId' | 'type'> | null | undefined
): string {
  if (!section) {
    return '';
  }
  const anchor = typeof section.anchorId === 'string' ? section.anchorId.trim() : '';
  return anchor || section.type || '';
}

/** Hash link for header menu, e.g. `#blog`. */
export function getSectionHash(
  section: Pick<Section, 'anchorId' | 'type'> | null | undefined
): string {
  const id = getSectionAnchorId(section);
  return id ? `#${id}` : '';
}

/** Resolve scroll-spy / menu target in the live DOM. */
export function findSectionElement(anchorOrType: string): HTMLElement | null {
  if (typeof document === 'undefined' || !anchorOrType) {
    return null;
  }

  const direct = document.getElementById(anchorOrType);
  if (direct) {
    return direct;
  }

  try {
    return document.querySelector(`.section-wrapper#${CSS.escape(anchorOrType)}`) as HTMLElement | null;
  } catch {
    return document.querySelector(`.section-wrapper#${anchorOrType}`) as HTMLElement | null;
  }
}

/** Match a menu hash to a section record (anchorId or legacy type id). */
export function findSectionByHash(
  sections: Array<Pick<Section, 'id' | 'anchorId' | 'type'>>,
  hash: string
): Pick<Section, 'id' | 'anchorId' | 'type'> | undefined {
  const anchor = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!anchor) {
    return undefined;
  }

  return sections.find(
    section => getSectionAnchorId(section) === anchor || section.type === anchor
  );
}
