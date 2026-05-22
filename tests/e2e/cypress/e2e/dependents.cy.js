describe('Dependents Flow', () => {
  let testUser;

  beforeEach(() => {
    // Generate a random test user
    const randomString = Math.random().toString(36).substring(2, 10);
    testUser = {
      username: `depuser_${randomString}`,
      email: `depuser_${randomString}@example.com`,
      first_name: 'Test',
      last_name: 'Parent',
      password: 'StrongPassword123!',
    };

    const apiUrl = `${Cypress.env('apiUrl')}/api/users/register/`;

    // Register user via API
    cy.request({
      method: 'POST',
      url: apiUrl,
      body: testUser,
    });

    // Login via UI
    cy.visit('/login');
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Wait for the login to process and redirect
    cy.url().should('not.include', '/login', { timeout: 10000 });

    // Verify successful login
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.contains(`Welcome, ${testUser.first_name}`).should('be.visible');
  });

  it('successfully creates two dependents', () => {
    // Navigate to Dependents page
    cy.contains('Dependents').click();
    cy.url().should('include', '/dependents');

    // --- Create first dependent ---
    cy.get('input[id="firstName"]').type('Anna');
    cy.get('input[id="lastName"]').type('Müller');
    cy.get('input[id="address"]').type('Teststrasse 1');
    cy.get('input[id="postalCode"]').type('8000');
    cy.get('input[id="city"]').type('Zürich');
    cy.get('input[id="mainDiagnosis"]').type('Asthma');
    cy.get('input[id="ahvNumber"]').type('756.1234.5678.90');

    cy.get('button[type="submit"]').click();

    // Verify first dependent in the list
    cy.contains('Anna Müller').should('be.visible');
    cy.contains('756.1234.5678.90').should('be.visible');
    cy.contains('Asthma').should('be.visible');

    // --- Create second dependent ---
    cy.get('input[id="firstName"]').type('Felix');
    cy.get('input[id="lastName"]').type('Müller');
    cy.get('input[id="address"]').type('Teststrasse 1');
    cy.get('input[id="postalCode"]').type('8000');
    cy.get('input[id="city"]').type('Zürich');
    cy.get('input[id="mainDiagnosis"]').type('ADHS');
    cy.get('input[id="ahvNumber"]').type('756.0987.6543.21');

    cy.get('button[type="submit"]').click();

    // Verify second dependent in the list
    cy.contains('Felix Müller').should('be.visible');
    cy.contains('756.0987.6543.21').should('be.visible');
    cy.contains('ADHS').should('be.visible');
  });
});
