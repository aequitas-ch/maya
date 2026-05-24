describe('Test User Dependents Flow', () => {
  it('logs in as the test user and verifies dependents', () => {
    // Navigate to Login page
    cy.visit('/login');

    // Login as the seeded test user
    cy.get('input[name="username"]').type('test');
    cy.get('input[name="password"]').type('Secure123$');
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url().should('not.include', '/login', { timeout: 10000 });
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Verify display name
    cy.contains('Welcome, Test User').should('be.visible');

    // Navigate to Dependents page
    cy.contains('Dependents').click();
    cy.url().should('include', '/dependents');

    // Verify the linked dependents exist
    // The seed script links all dependents with the last name "Muster"
    // Since seed_admin_dependents.cy.js creates Peter and Franziska Muster,
    // we assume they are present in the environment
    cy.contains('Muster').should('be.visible');
  });
});
