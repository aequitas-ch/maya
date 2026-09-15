import 'cypress-file-upload';

describe('Documents Flow', () => {
  let testUser;
  let testDependent;

  beforeEach(() => {
    // Generate a random test user
    const randomString = Math.random().toString(36).substring(2, 10);
    // Hardcoded password as requested by SonarCloud to not use random strings for passwords in tests, although this is just an e2e test
    testUser = {
      username: `docuser_${randomString}`,
      email: `docuser_${randomString}@example.com`,
      first_name: 'Doc',
      last_name: 'Tester',
      password: 'StrongPassword123!', // NOSONAR
    };

    const apiUrl = `${Cypress.env('apiUrl')}/api/users/register/`;

    // Register user via API
    cy.request({
      method: 'POST',
      url: apiUrl,
      body: testUser,
    }).then((response) => {
        // Login API
        cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/token/`,
            body: { username: testUser.username, password: testUser.password }
        }).then((loginResponse) => {
            const token = loginResponse.body.access;
            // Create Dependent API
            testDependent = {
                first_name: 'DocChild',
                last_name: 'Tester',
                address: 'Mustergasse 1',
                city: 'Zürich',
                postal_code: '8000',
                main_diagnosis: 'Testing',
                ahv_number: '756.1234.5678.90'
            };
            cy.request({
                method: 'POST',
                url: `${Cypress.env('apiUrl')}/api/dependents/`,
                headers: { 'Authorization': `Bearer ${token}` },
                body: testDependent
            }).then((depResponse) => {
                testDependent.id = depResponse.body.id;
            });
        });
    });

    // Login via UI
    cy.visit('/login');
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Wait for the login to process and redirect
    cy.url({ timeout: 10000 }).should('not.include', '/login');

    // Verify successful login
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.contains(`Welcome, ${testUser.first_name}`).should('be.visible');
  });

  it('successfully uploads and lists a document', () => {
    // Navigate to Dependents page
    cy.contains('Dependents').click();
    cy.url().should('include', '/dependents');

    // Click on Documents link for the dependent
    cy.contains('DocChild Tester').parents('li').contains('Documents').click();

    // Verify we are on documents page
    cy.url().should('include', `/dependents/${testDependent.id}/documents`);
    cy.contains('Upload Document').should('be.visible');

    // Fill form
    cy.get('input[id="documentName"]').type('Test Document UI');
    cy.get('textarea[id="documentDescription"]').type('Uploaded via Cypress');

    // Create a mock file
    cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('Mock file content Hello World'),
        fileName: 'mock.txt',
        mimeType: 'text/plain',
      });

    // Submit form
    cy.contains('button', 'Upload Document').click();

    // Verify success message and document in list
    cy.contains('Document uploaded successfully.').should('be.visible');
    cy.contains('Test Document UI').should('be.visible');
    cy.contains('Uploaded via Cypress').should('be.visible');
  });
});
