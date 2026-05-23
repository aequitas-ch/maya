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

  it('fails to create dependent with invalid AHV number', () => {
    // Navigate to Dependents page
    cy.contains('Dependents').click();
    cy.url().should('include', '/dependents');

    // Enter invalid AHV
    cy.get('input[id="firstName"]').type('Invalid');
    cy.get('input[id="lastName"]').type('AhvTest');
    cy.get('input[id="address"]').type('Teststrasse 1');
    cy.get('input[id="postalCode"]').type('8000');
    cy.get('input[id="city"]').type('Zürich');
    cy.get('input[id="mainDiagnosis"]').type('None');
    cy.get('input[id="ahvNumber"]').type('invalid-ahv-123');

    cy.get('button[type="submit"]').click();

    // Verify error message
    cy.contains('AHV number must be in the format 756.xxxx.xxxx.xx').should('be.visible');
  });

  it('successfully edits an existing dependent', () => {
    // Navigate to Dependents page
    cy.contains('Dependents').click();
    cy.url().should('include', '/dependents');

    // Create a dependent to edit
    cy.get('input[id="firstName"]').type('Edit');
    cy.get('input[id="lastName"]').type('Me');
    cy.get('input[id="address"]').type('Teststrasse 1');
    cy.get('input[id="postalCode"]').type('8000');
    cy.get('input[id="city"]').type('Zürich');
    cy.get('input[id="mainDiagnosis"]').type('To Edit');
    cy.get('input[id="ahvNumber"]').type('756.1111.2222.33');

    cy.get('button[type="submit"]').click();

    // Wait for creation to reflect in list
    cy.contains('Edit Me').should('be.visible');

    // Click Edit on the item
    // Locate the specific list item containing 'Edit Me' and click its Edit button
    cy.contains('li', 'Edit Me').contains('button', 'Edit').click();

    // Check that form populated correctly
    cy.get('input[id="firstName"]').should('have.value', 'Edit');

    // Change some data
    cy.get('input[id="firstName"]').clear().type('Edited');
    cy.get('input[id="lastName"]').clear().type('Successfully');
    cy.get('input[id="address"]').clear().type('Newstrasse 2');

    // Submit the update
    cy.get('button[type="submit"]').contains('Update Dependent').click();

    // Verify the list has updated
    cy.contains('Edited Successfully').should('be.visible');
    cy.contains('Newstrasse 2').should('be.visible');

    // Original shouldn't be there anymore
    cy.contains('Edit Me').should('not.exist');
  });
});
