describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Seed an admin user
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/users/register/`,
      body: {
        username: 'adminuser',
        password: 'adminpassword123',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
      },
      failOnStatusCode: false
    });

    // Login to get token to upgrade user
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/token/`,
      body: {
        username: 'adminuser',
        password: 'adminpassword123'
      }
    }).then((response) => {
      // Direct DB manipulation using django is normally better for seeding admins,
      // but here we just test that IF an admin logs in, they see the dashboard.
      // So let's mock the /users/profile/ response to include is_staff: true
      window.localStorage.setItem('access_token', response.body.access);
      window.localStorage.setItem('refresh_token', response.body.refresh);
    });
  });

  it('allows access to admin dashboard and manages translations', () => {
    // Mock the profile response to ensure we are an admin
    cy.intercept('GET', '**/users/profile/', (req) => {
      req.reply({
        username: 'adminuser',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        display_name: 'Admin User',
        is_staff: true
      });
    }).as('getProfile');

    cy.visit('/admin');
    cy.wait('@getProfile');

    cy.contains('admin_dashboard').should('be.visible');

    // Switch to translations tab
    cy.contains('manage_translations').click();
    cy.contains('translations').should('be.visible');

    // Mock getting translations
    cy.intercept('GET', '**/translations/', [{
        id: 1, key: 'test_key', en: 'Test English', de: 'Test German'
    }]).as('getTranslations');

    cy.reload();
    cy.wait('@getProfile');
    cy.wait('@getTranslations');

    cy.contains('manage_translations').click();
    cy.contains('Test English').should('be.visible');
  });
});
