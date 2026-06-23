export interface ParsedFooterLink {
  path: string;
  queryParams?: Record<string, string>;
}

export function parseFooterLink(url: string): ParsedFooterLink {
  if (!url) {
    return { path: '/' };
  }

  const [path, queryString] = url.split('?');
  if (!queryString) {
    return { path };
  }

  const queryParams: Record<string, string> = {};
  new URLSearchParams(queryString).forEach((value, key) => {
    queryParams[key] = value;
  });

  return { path, queryParams };
}
