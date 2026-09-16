import { LOCAL_API_URL, PROD_API_URL, resolveApiUrl, setApiPreference } from './api-url.util';

describe('resolveApiUrl', () => {
  const originalLocation = window.location;

  afterEach(() => {
    localStorage.removeItem('use_local_api');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  function mockLocation(hostname: string, origin: string): void {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hostname, origin },
    });
  }

  it('uses local Nest API on localhost', () => {
    mockLocation('localhost', 'http://localhost:4200');
    expect(resolveApiUrl()).toBe(LOCAL_API_URL);
  });

  it('uses Render fallback on GitHub Pages', () => {
    mockLocation('maestrotype.github.io', 'https://maestrotype.github.io');
    expect(resolveApiUrl()).toBe(PROD_API_URL);
  });

  it('uses same-origin /api on a custom demo host', () => {
    mockLocation('demo.example.com', 'https://demo.example.com');
    expect(resolveApiUrl()).toBe('https://demo.example.com/api');
  });

  it('honors use_local_api preference', () => {
    mockLocation('demo.example.com', 'https://demo.example.com');
    setApiPreference(true);
    expect(resolveApiUrl()).toBe(LOCAL_API_URL);
  });
});
