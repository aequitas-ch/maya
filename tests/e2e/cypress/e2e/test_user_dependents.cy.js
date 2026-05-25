describe('Test User Dependents Flow', () => {
  it('logs in as the test user and verifies dependents', () => {
    // Navigate to Login page
    cy.visit('/login');

    // Login as the seeded test user (created via migration 0005_create_test_user)
    cy.get('input[name="username"]').type('test');
    cy.get('input[name="password"]').type('Secure123$');
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Verify display name
    cy.contains('Welcome, Test User').should('be.visible');

    // Navigate to Dependents page
    cy.contains('Dependents').click();
    cy.url().should('include', '/dependents');

    // Create a Muster dependent for the test user directly in the test
    // so this spec is self-contained and does not depend on the seed job timing.
    cy.get('input[id="firstName"]').type('Peter');
    cy.get('input[id="lastName"]').type('Muster');
    cy.get('input[id="address"]').type('Musterstrasse');
    cy.get('input[id="postalCode"]').type('9999');
    cy.get('input[id="city"]').type('Musterstadt');
    cy.get('input[id="mainDiagnosis"]').type('Krankheit');
    cy.get('input[id="ahvNumber"]').type('756.2222.2222.11');
    cy.get('button[type="submit"]').click();

    // Verify the dependent is visible in the list
    cy.contains('Muster').should('be.visible');
  });
});
