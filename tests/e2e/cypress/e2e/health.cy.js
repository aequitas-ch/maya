describe('Health Data Management', () => {
  let testUser;

  before(() => {
    // Generate a random test user
    const randomString = Math.random().toString(36).substring(2, 10);
    testUser = {
      username: `healthuser_${randomString}`,
      email: `healthuser_${randomString}@example.com`,
      first_name: 'Test',
      last_name: 'Parent',
      password: 'StrongPassword123!',
    };

    const apiUrl = `${Cypress.env('apiUrl') || 'http://127.0.0.1:8000'}/api/users/register/`;

    // Register user via API
    cy.request({
      method: 'POST',
      url: apiUrl,
      body: testUser,
    });
  });

  beforeEach(() => {
    // Login via UI
    cy.visit('/login');
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('allows adding and viewing health data for a dependent', () => {
    // First create a dependent
    cy.visit('/dependents')
    cy.get('input[id="firstName"]').type('Jane')
    cy.get('input[id="lastName"]').type('Doe')
    cy.get('input[id="address"]').type('123 Health St')
    cy.get('input[id="city"]').type('Zurich')
    cy.get('input[id="postalCode"]').type('8000')
    cy.get('input[id="mainDiagnosis"]').type('Cerebral Palsy')
    cy.get('input[id="ahvNumber"]').type('756.1234.5678.90')
    cy.get('button[type="submit"]').click()

    // Wait for the dependent to appear in the list
    cy.contains('Jane Doe').should('exist')

    // Navigate to Health Data page
    cy.contains('Health Data').click()
    cy.url().should('include', '/health')

    // Add a numeric health record
    cy.get('input[placeholder="e.g. Weight, Height"]').type('Weight')
    cy.get('input[placeholder="e.g. kg, cm"]').type('kg')
    cy.get('input[placeholder="e.g. kg, cm"]').parent().next().find('input').type('45.5')
    cy.get('textarea').type('Morning measurement')
    cy.get('button').contains('Add Record').click()

    // Verify the record is in the list
    cy.contains('Weight (kg)').should('exist')
    cy.contains('45.5').should('exist')
    cy.contains('Morning measurement').should('exist')

    // Verify the chart title exists
    cy.contains('Weight (kg) - Trend').should('exist')

    // Add a text health record
    cy.get('input[placeholder="e.g. Weight, Height"]').type('GMFC Score')
    cy.get('input[placeholder="e.g. kg, cm"]').clear()
    cy.get('input[placeholder="e.g. kg, cm"]').parent().next().find('input').clear().type('Level III')
    cy.get('textarea').clear().type('Annual assessment')
    cy.get('button').contains('Add Record').click()

    // Verify the text record is in the list
    cy.contains('GMFC Score').should('exist')
    cy.contains('Level III').should('exist')

    // Check autocomplete (select should have options now)
    cy.get('select').select('1') // Select the first existing metric
    cy.get('input[placeholder="e.g. Weight, Height"]').should('have.value', 'Weight')
  })
})
