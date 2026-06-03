# Test Strategy: Aequitas

This test strategy outlines the methodological approach to Quality Assurance (QA) for the Aequitas project. The goal is to provide developers with a guide to proactively uncover bugs and edge cases through targeted API tests (Bruno) and End-to-End tests (Cypress). Special focus is given to the currently implemented modules, security (tenant isolation), and accessibility for users with limited mobility.

## 1. Methodological Approach

The QA strategy is built on two pillars:

1.  **API Testing (Bruno):** Focus on business logic, data validation, permissions (Tenant Isolation), and backend performance.
2.  **E2E Testing (Cypress):** Focus on user journeys, UI interactions, frontend state management, and accessibility (A11y).

### Core Principles for All Tests
*   **"Listen to the Data":** Tests must represent real or realistic data structures.
*   **Self-Contained State:** Each test must generate its own state (e.g., by creating specific test users or auth tokens) and clean up afterward to prevent side effects between tests.
*   **Positive and Negative Tests:** Every endpoint and user journey must test both the "Happy Path" (success case) and failure cases (e.g., missing fields, unauthorized access, invalid formats).
*   **Automation:** All tests must be designed to run fully automated within CI/CD pipelines (GitHub Actions).

---

## 2. API Testing with Bruno

Bruno is used to test the Django REST Framework APIs.

### 2.1 Focus Areas for API Tests

*   **Tenant Isolation:** This is highly security-critical. Tests must rigorously verify that a user can **never** access or modify the data (Dependents, Health Records, Cost Approvals) of another user.
*   **Input Validation:** Ensure the backend correctly catches invalid data and returns helpful error messages.
*   **Roles and Permissions:** Verify that only authorized roles (e.g., Staff users) are allowed to modify certain endpoints (like global reference data).

### 2.2 Concrete Test Scenarios (Current Modules)

#### Core Module (Users, Profiles, Dependents)
*   **AHV Number Validation:**
    *   *Positive:* Create a Dependent with a valid AHV number (`756.xxxx.xxxx.xx`).
    *   *Negative:* Attempt to save AHV numbers in invalid formats (missing dots, too short, wrong prefix).
*   **Tenant Isolation for Dependents:**
    *   *Test:* User A creates a child. User B attempts to access it via a GET/PATCH/DELETE request using the child's ID.
    *   *Expected:* 404 Not Found or 403 Forbidden for User B.

#### Health Module (Health Data)
*   **Data Integrity:**
    *   *Test:* Create a `HealthRecord` with a date in the future (if logically restricted) or with invalid metric assignments.
    *   *Expected:* Correct rejection with a 400 Bad Request.
*   **Pagination and Limits:**
    *   *Test:* Query lists with many entries (e.g., >100). Do pagination and limit/offset parameters work correctly?

#### Settlement Module (Cost Approvals)
*   **Status Transitions:**
    *   *Test:* Attempt to transition a `CostApproval` status from an invalid state to another (e.g., directly from `new` to `rejected` without an intermediate step, if the logic prevents this).
*   **Reference Data Protection:**
    *   *Test:* A regular user attempts to create a new `Institution` or `Insurance` via POST request.
    *   *Expected:* 403 Forbidden (as this should only be possible via the Admin panel).

---

## 3. E2E Testing with Cypress

Cypress is used to test the platform from the end-user's perspective.

### 3.1 Focus Areas for E2E Tests

*   **User Journeys:** Smooth execution of core processes (Login, data entry, form submission).
*   **Error UI:** Are errors (e.g., due to lost network connection or backend failures) displayed adequately and understandably in the frontend?
*   **Internationalization (i18n):** Do dynamic UI translations (loaded from the DB) work in the frontend? Are fallbacks used when keys are missing?

### 3.2 Accessibility (A11y)

A central aspect of the platform is accessibility for parents, especially those with limited mobility or other impairments. We integrate **cypress-axe** to automate accessibility testing.

#### Implementation in Cypress
1.  Installation: `npm install --save-dev cypress-axe axe-core`
2.  Setup in `cypress/support/e2e.js`: `import 'cypress-axe'`
3.  Usage in Tests: After every `cy.visit()`, `cy.injectAxe()` must be called. Subsequently, `cy.checkA11y()` checks the current view for violations.

#### Concrete A11y Test Requirements
*   **Keyboard Navigation (Keyboard-only):**
    *   *Test:* Can the user navigate through all forms (e.g., creating a child or a cost approval) without a mouse?
    *   *Focus:* Are all `input`, `button`, and `select` elements reachable via the `Tab` key? Are interactive elements visually identifiable as focused (focus rings)?
*   **Screen Reader Compatibility:**
    *   *Test (via axe):* Do all form elements have correct `aria-labels` or associated `<label>` tags? Are error messages (e.g., "Invalid AHV Number") accessible to screen readers via `aria-live`?
*   **Color Contrast & Readability:**
    *   *Test (via axe):* Adherence to WCAG 2.1 AA (or AAA) standards for contrasts, particularly regarding the Tailwind colors used (e.g., the primary `teal` or the soft shadows/border-radiuses).

### 3.3 Concrete E2E Scenarios

*   **Data Entry with Fallbacks:**
    *   *Test:* Fill out a form to create a Health Record. Simulate a network drop during saving (e.g., via `cy.intercept`).
    *   *Expected:* The user receives a clear, accessible error message, and the entered data is not lost.
*   **Responsive Design & Touch:**
    *   *Test:* Run Cypress tests with simulated viewports (Mobile, Tablet). Are all large buttons (Airbnb style) easily reachable and optimized for touch interactions?
