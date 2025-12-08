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
   * Configuration is loaded from tests/config/accessibility.config.json
   * @param page - The Playwright page object
   * @returns Accessibility analysis results
   */
  static async analyzeAccessibility(page: Page): Promise<AccessibilityResult> {
    const axeBuilder = new AxeBuilder({ page });

    // Apply configurations from config file
    if (accessibilityConfig.includeTags && accessibilityConfig.includeTags.length > 0) {
      axeBuilder.withTags(accessibilityConfig.includeTags);
    }
    if (accessibilityConfig.excludeTags && accessibilityConfig.excludeTags.length > 0) {
      axeBuilder.disableTags(accessibilityConfig.excludeTags);
    }
    if (accessibilityConfig.disableRules && accessibilityConfig.disableRules.length > 0) {
      axeBuilder.disableRules(accessibilityConfig.disableRules);
    }

    const results = await axeBuilder.analyze();

    return {
      violations: results.violations as AccessibilityViolation[],
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      violationCount: results.violations.length,
    };
  }

  /**
   * Formats accessibility violations into a readable string for test reports
   * @param violations - Array of accessibility violations
   * @returns Formatted string describing violations
   */
  static formatViolations(violations: AccessibilityViolation[]): string {
    if (violations.length === 0) {
      return 'No accessibility violations found.';
    }

    return violations
      .map((violation, index) => {
        const nodeInfo = violation.nodes
          .map((node) => `    Target: ${node.target.join(', ')}\n    HTML: ${node.html}`)
          .join('\n\n');

        return `
${index + 1}. ${violation.id} (${violation.impact})
   Description: ${violation.description}
   Help: ${violation.help}
   Help URL: ${violation.helpUrl}
   Affected elements (${violation.nodes.length}):
${nodeInfo}
`;
      })
      .join('\n');
  }

  /**
   * Checks if there are any critical or serious accessibility violations
   * @param violations - Array of accessibility violations
   * @returns True if critical or serious violations exist
   */
  static hasCriticalViolations(violations: AccessibilityViolation[]): boolean {
    return violations.some((v) => v.impact === 'critical' || v.impact === 'serious');
  }

  /**
   * Filters violations by impact level
   * @param violations - Array of accessibility violations
   * @param impacts - Array of impact levels to filter by
   * @returns Filtered violations
   */
  static filterViolationsByImpact(
    violations: AccessibilityViolation[],
    impacts: string[]
  ): AccessibilityViolation[] {
    return violations.filter((v) => impacts.includes(v.impact));
  }
}
