import { REQUIRED_SEMANTIC_TOKENS, RequiredSemanticToken } from './theme-contract';
import { ThemeId } from './theme.model';

export interface ThemeValidationResult {
  themeId: ThemeId;
  ok: boolean;
  missing: RequiredSemanticToken[];
}

/**
 * Runtime check that required semantic CSS variables resolve on :root / html
 * after `data-theme` is applied (Epic F3).
 */
export function validateThemeTokens(
  themeId: ThemeId,
  root: HTMLElement = document.documentElement
): ThemeValidationResult {
  const styles = getComputedStyle(root);
  const missing: RequiredSemanticToken[] = [];

  for (const token of REQUIRED_SEMANTIC_TOKENS) {
    const value = styles.getPropertyValue(token).trim();
    if (!value) {
      missing.push(token);
    }
  }

  return {
    themeId,
    ok: missing.length === 0,
    missing,
  };
}
