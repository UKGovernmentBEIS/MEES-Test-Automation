import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

class NonFunctionalTestReporter implements Reporter {
  private testsByPage = new Map<string, Set<string>>();

  onTestEnd(test: TestCase, result: TestResult) {
    // Only process tests from non-functional project
    const projectName = test.parent.project()?.name;
    if (projectName !== 'non-functional') {
      return; // Skip tests from other projects
    }

    const pageAnnotation = test.annotations.find(a => a.type === 'page');
    const testTypeAnnotations = test.annotations.filter(a => a.type === 'test-type');

    if (pageAnnotation && testTypeAnnotations.length > 0) {
      const pageName = pageAnnotation.description || 'Unknown Page';
      if (!this.testsByPage.has(pageName)) {
        this.testsByPage.set(pageName, new Set());
      }
      testTypeAnnotations.forEach(annotation => {
        this.testsByPage.get(pageName)!.add(annotation.description || 'Unknown Test');
      });
    }
  }

  onEnd() {
    const reportPath = path.join(process.cwd(), 'test-results', 'non-functional-test-coverage.md');
    let markdown = '# Non-Functional Test Coverage Report\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += '## Test Coverage by Page\n\n';
    markdown += '| Page | Test Types |\n';
    markdown += '|------|------------|\n';

    for (const [page, testTypes] of this.testsByPage.entries()) {
      markdown += `| ${page} | ${Array.from(testTypes).join(', ')} |\n`;
    }

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, markdown);
    console.log(`\nNon-functional test coverage report: ${reportPath}`);
  }
}

export default NonFunctionalTestReporter;