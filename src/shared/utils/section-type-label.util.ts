export function sectionTypeLabelKey(type: string | null | undefined): string {
  const normalized = (type || '').trim().replace(/-/g, '_').toUpperCase();
  return normalized ? `SECTION_TYPE_LABELS.${normalized}` : '';
}

export function resolveSectionTypeLabel(
  type: string | null | undefined,
  translate: { instant: (key: string) => unknown }
): string {
  const key = sectionTypeLabelKey(type);
  if (!key) {
    return '';
  }

  const value = translate.instant(key);
  if (typeof value === 'string' && value.trim() && value !== key) {
    return value;
  }

  return (type || '').trim().replace(/-/g, ' ');
}
