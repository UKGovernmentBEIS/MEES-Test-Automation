import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import accessibilityConfig from '../config/accessibility.config.json';

export interface AccessibilityViolation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface AccessibilityResult {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  violationCount: number;
}

export class AccessibilityUtilities {
  /**
   * Analyzes the current page for accessibility violations using axe-core
   * @param page - The Playwright page object
   * @param selector - Optional CSS selector string to limit analysis
   * @returns Accessibility analysis results
   */
  static async analyzeAccessibility(
    page: Page,
    selector?: string
  ): Promise<AccessibilityResult> {
    const axeBuilder = new AxeBuilder({ page });
    
    // Use legacy mode to avoid page closure issues
    axeBuilder.setLegacyMode(true);

    // Apply configuration
    const { includeTags, excludeTags, disableRules } = accessibilityConfig;
    if (includeTags?.length) axeBuilder.withTags(includeTags);
    if (excludeTags?.length) axeBuilder.disableTags(excludeTags);
    if (disableRules?.length) axeBuilder.disableRules(disableRules);
    if (selector) axeBuilder.include(selector);

    const results = await axeBuilder.analyze();

    return {
      violations: results.violations as AccessibilityViolation[],
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      violationCount: results.violations.length,
    };
  }

  /**
   * Checks if there are any critical or serious accessibility violations
   */
  static hasCriticalViolations(violations: AccessibilityViolation[]): boolean {
    return violations.some(v => v.impact === 'critical' || v.impact === 'serious');
  }

  /**
   * Formats accessibility violations into a readable string for test reports
   */
  static formatViolations(violations: AccessibilityViolation[]): string {
    if (!violations.length) return 'No accessibility violations found.';

    return violations
      .map((violation, index) => {
        const nodeInfo = violation.nodes
          .map(node => `    Target: ${node.target.join(', ')}\n    HTML: ${node.html}`)
          .join('\n\n');

        return `
${index + 1}. ${violation.id} (${violation.impact})
   Description: ${violation.description}
   Help: ${violation.help}
   Help URL: ${violation.helpUrl}
   Affected elements (${violation.nodes.length}):
${nodeInfo}`;
      })
      .join('\n');
  }
}
