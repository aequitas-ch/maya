describe('Profile Flow', () => {
  let user;

  beforeEach(() => {
    // Register a user programmatically to be used in the test
    const randomString = Math.random().toString(36).substring(2, 10);
    user = {
      username: `testuser_${randomString}`,
      email: `testuser_${randomString}@example.com`,
      first_name: 'Jane',
      last_name: 'Doe',
      display_name: 'Jane D.',
      password: 'InitialPassword123!'
    };

    const apiUrl = `${Cypress.env('apiUrl')}/api/users/register/`;
    cy.request({
      method: 'POST',
      url: apiUrl,
      body: user,
      failOnStatusCode: true,
    });
  });

  it('successfully logins and changes the display name', () => {
    // Login
    cy.visit('/login');
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button[type="submit"]').click();

    // Verify logged in
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Go to profile
    cy.visit('/profile');

    // Change display name
    cy.get('input[name="display_name"]').clear().type('Jane Updated');
    cy.contains('button', 'Save Profile').click();

    // Verify success message
    cy.contains('Profile updated successfully!').should('be.visible');

    // Verify nav bar is updated
    cy.contains('Welcome, Jane Updated').should('be.visible');
  });

  it('successfully registers, logins, changes password, logouts, and logins with new password', () => {
    // 1. Register is done in beforeEach but let's do it through UI as requested by user
    // "benutzer registrieren - Einloggen - Passwort ändern - ausloggen - mit neuen passwort einloggen"

    // We'll create a new user specifically for this test to follow the exact steps requested
    const randomString2 = Math.random().toString(36).substring(2, 10);
    const flowUser = {
      username: `flowuser_${randomString2}`,
      email: `flowuser_${randomString2}@example.com`,
      first_name: 'Flow',
      last_name: 'Test',
      display_name: 'Flow T.',
      password: 'OldPassword123!',
      newPassword: 'NewPassword123!'
    };

    // 1. Register
    cy.visit('/register');
    cy.get('input[name="username"]').type(flowUser.username);
    cy.get('input[name="email"]').type(flowUser.email);
    cy.get('input[name="first_name"]').type(flowUser.first_name);
    cy.get('input[name="last_name"]').type(flowUser.last_name);
    cy.get('input[name="display_name"]').type(flowUser.display_name);
    cy.get('input[name="password"]').type(flowUser.password);
    cy.get('button[type="submit"]').click();

    // 2. Login
    cy.url().should('include', '/login');
    cy.get('input[name="username"]').type(flowUser.username);
    cy.get('input[name="password"]').type(flowUser.password);
    cy.get('button[type="submit"]').click();

    // Ensure login finishes
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // 3. Change Password
    cy.visit('/profile');
    cy.get('input[name="old_password"]').type(flowUser.password);
    cy.get('input[name="new_password"]').type(flowUser.newPassword);
    cy.get('input[name="confirm_password"]').type(flowUser.newPassword);
    cy.contains('button', 'Update Password').click();

    // Verify success message
    cy.contains('Password updated successfully!').should('be.visible');

    // 4. Logout
    cy.contains('Logout').click();

    // Verify logout
    cy.url().should('include', '/login');

    // 5. Login with new password
    cy.get('input[name="username"]').type(flowUser.username);
    cy.get('input[name="password"]').type(flowUser.newPassword);
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains(`Welcome, ${flowUser.display_name}`).should('be.visible');
  });
});
