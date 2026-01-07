/**
 * Predefined test types for annotations and reporting
 */
export enum TestType {
  ACCESSIBILITY = 'Accessibility',
  CONTEXT_VERIFICATION = 'Context Verification',
  PERFORMANCE = 'Performance',
  SECURITY = 'Security',
  VISUAL_REGRESSION = 'Visual Regression',
  FUNCTIONAL = 'Functional',
  API = 'API',
  LOAD_TESTING = 'Load Testing'
}

/**
 * Predefined page names for consistency in reporting
 */
export enum PageName {
  HOME_PAGE = 'Home Page',
  ONE_LOGIN_HOME = 'One Login Home Page',
  ONE_LOGIN_EMAIL = 'One Login Enter Email Page',
  ONE_LOGIN_PASSWORD = 'One Login Enter Password Page',
  DASHBOARD = 'Dashboard',
  LOGIN_PAGE = 'Login Page'
}

/**
 * Annotation helper functions
 */
export class TestAnnotations {
  static testType(type: TestType) {
    return { type: 'test-type', description: type };
  }

  static page(page: PageName | string) {
    return { type: 'page', description: page };
  }

  static feature(feature: string) {
    return { type: 'feature', description: feature };
  }
}