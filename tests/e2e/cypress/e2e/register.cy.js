describe('Registration Flow', () => {
  const apiUrl = `${Cypress.env('apiUrl')}/api/users/register/`;

  it('successfully registers a new user', () => {
    cy.visit('/register');

    const randomString = Math.random().toString(36).substring(2, 10);
    const username = `testuser_${randomString}`;
    const email = `testuser_${randomString}@example.com`;

    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="first_name"]').type('John');
    cy.get('input[name="last_name"]').type('Doe');
    cy.get('input[name="display_name"]').type('John Doe Jr.');
    cy.get('input[name="password"]').type('StrongPassword123!');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/login');
    cy.contains('Sign in to your account').should('be.visible');
  });

  it('shows error on duplicate username', () => {
    cy.visit('/register');

    const randomString = Math.random().toString(36).substring(2, 10);
    const username = `testuser_${randomString}`;
    const email = `testuser_${randomString}@example.com`;

    cy.request({
      method: 'POST',
      url: apiUrl,
      body: {
        username,
        email,
        first_name: 'John',
        last_name: 'Doe',
        password: 'StrongPassword123!',
      },
      failOnStatusCode: false,
    });

    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(`another_${email}`);
    cy.get('input[name="first_name"]').type('John');
    cy.get('input[name="last_name"]').type('Doe');
    cy.get('input[name="display_name"]').type('John Doe Jr.');
    cy.get('input[name="password"]').type('StrongPassword123!');

    cy.get('button[type="submit"]').click();

    cy.contains('A user with that username already exists.').should('be.visible');
  });
});
