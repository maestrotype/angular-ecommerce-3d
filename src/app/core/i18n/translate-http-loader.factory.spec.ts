import { resolveI18nAssetBase } from './translate-http-loader.factory';

describe('resolveI18nAssetBase', () => {
  it('uses the document base href with a trailing slash', () => {
    expect(resolveI18nAssetBase()).toMatch(/\/$/);
  });
});
