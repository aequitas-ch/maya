describe('Seed Admin Dependents', () => {
  it('creates Peter and Franziska Muster for the admin user', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('aequitas-maya123$');
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Navigate to Dependents page
    cy.contains('Dependents').click();
    cy.url().should('include', '/dependents');

    // Create Dependant 1 (Peter Muster)
    cy.get('input[id="firstName"]').type('Peter');
    cy.get('input[id="lastName"]').type('Muster');
    cy.get('input[id="address"]').type('Musterstrasse');
    cy.get('input[id="postalCode"]').type('9999');
    cy.get('input[id="city"]').type('Musterstadt');
    cy.get('input[id="mainDiagnosis"]').type('Krankheit');
    cy.get('input[id="ahvNumber"]').type('756.1111.1111.11');

    cy.get('button[type="submit"]').click();

    // Wait for creation to reflect in list and list length to increase
    cy.contains('Peter Muster').should('be.visible');
    cy.contains('756.1111.1111.11').should('be.visible');
    cy.contains('Krankheit').should('be.visible');

    // The frontend form resets its state after successful creation. Wait for it to be ready.
    cy.get('input[id="firstName"]').should('have.value', '');

    // Create Dependant 2 (Fanziska Muster)
    cy.get('input[id="firstName"]').type('Fanziska');
    cy.get('input[id="lastName"]').type('Muster');
    cy.get('input[id="address"]').type('Musterstrasse');
    cy.get('input[id="postalCode"]').type('9999');
    cy.get('input[id="city"]').type('Musterstadt');
    cy.get('input[id="mainDiagnosis"]').type('Behinderung');
    cy.get('input[id="ahvNumber"]').type('756.1111.1111.22');

    cy.get('button[type="submit"]').click();

    // Wait for second creation
    cy.contains('Fanziska Muster').should('be.visible');
    cy.contains('756.1111.1111.22').should('be.visible');
    cy.contains('Behinderung').should('be.visible');
  });
});
