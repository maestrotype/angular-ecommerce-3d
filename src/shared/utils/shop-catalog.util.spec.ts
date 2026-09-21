import {
  categoryQueryMatches,
  selectedCategoryFromFilterState,
} from './shop-catalog.util';

describe('categoryQueryMatches', () => {
  it('matches slug, display name, and query case-insensitively', () => {
    expect(categoryQueryMatches('cars', 'cars', 'Cars')).toBe(true);
    expect(categoryQueryMatches('Cars', 'cars')).toBe(true);
    expect(categoryQueryMatches('cars', 'people')).toBe(false);
  });

  it('ignores empty and all queries', () => {
    expect(categoryQueryMatches('all', 'cars')).toBe(false);
    expect(categoryQueryMatches('', 'cars')).toBe(false);
  });
});

describe('selectedCategoryFromFilterState', () => {
  it('keeps the route category when no sidebar boxes are checked yet', () => {
    expect(selectedCategoryFromFilterState([], 'cars')).toBe('cars');
    expect(selectedCategoryFromFilterState([], 'cars', false)).toBe('cars');
  });

  it('treats an empty sidebar as all when the user cleared filters', () => {
    expect(selectedCategoryFromFilterState([], 'cars', true)).toBe('all');
  });

  it('uses the single checked sidebar category', () => {
    expect(selectedCategoryFromFilterState(['shoes'], 'cars')).toBe('shoes');
  });

  it('keeps the current value when several boxes are checked', () => {
    expect(selectedCategoryFromFilterState(['cars', 'shoes'], 'cars')).toBe('cars');
  });
});
