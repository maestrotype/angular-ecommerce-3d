import { Section } from '../../../shared/models/section.model';

/**
 * Storefront chrome: app shell always mounts `app-header` / `app-footer`.
 * Those components load any active header/footer (not only pageTarget=global).
 * A header saved as Home Page must still appear at the top of Site Architect.
 */
function pickChromeSection(
  active: Section[],
  type: 'header' | 'footer',
  pageTarget: string
): Section | undefined {
  return (
    active.find(section => section.type === type && (section.pageTarget || 'global') === 'global') ||
    active.find(section => section.type === type && section.pageTarget === pageTarget) ||
    active.find(section => section.type === type)
  );
}

/** Build preview list matching storefront page composition (active, exact pageTarget, sorted). */
export function buildStorefrontPreviewSections(
  allSections: Section[],
  pageTarget: string
): Section[] {
  const active = allSections.filter(section => section.isActive !== false);
  const byOrder = (list: Section[]) =>
    [...list].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (pageTarget === 'global') {
    return byOrder(active.filter(section => section.pageTarget === 'global'));
  }

  const header = pickChromeSection(active, 'header', pageTarget);
  const footer = pickChromeSection(active, 'footer', pageTarget);
  const chromeIds = new Set(
    [header, footer].filter((section): section is Section => !!section).map(section => section.id)
  );
  const body = byOrder(
    active.filter(
      section =>
        section.pageTarget === pageTarget &&
        section.type !== 'header' &&
        section.type !== 'footer' &&
        !chromeIds.has(section.id)
    )
  );

  const result: Section[] = [];
  if (header) {
    result.push(header);
  }
  result.push(...body);
  if (footer) {
    result.push(footer);
  }
  return result;
}
