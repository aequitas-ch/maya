describe("Authentication Flow", () => {
  it("successfully registers, logins, and logouts a new user", () => {
    // 1. Register
    cy.visit("/register");
    cy.injectAxe();
    cy.checkA11y(null, null, (violations) => { console.log(violations); }, true);

    const randomString = Math.random().toString(36).substring(2, 10);
    const username = `testuser_${randomString}`;
    const email = `testuser_${randomString}@example.com`;
    const password = `TestPass123!${randomString}`;

    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="first_name"]').type("John");
    cy.get('input[name="last_name"]').type("Doe");
    cy.get('input[name="display_name"]').type("John Doe Jr.");
    cy.get('input[name="password"]').type(password);

    cy.intercept('POST', '**/api/users/register/').as('registerRequest');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest').its('response.statusCode').should('eq', 201);

    // Verify redirect to login
    cy.url({ timeout: 10000 }).should("include", "/login");
    cy.contains(/Login|Sign in/i).should("be.visible");

    cy.injectAxe();
    cy.checkA11y(null, null, (violations) => { console.log(violations); }, true);

    // 2. Login
    cy.intercept('POST', '**/api/token/').as('loginRequest');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    // Verify redirect to dashboard/home and user is logged in
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains("John Doe Jr.").should("be.visible");

    // 3. Logout - click the button with the class list that handles logout
    cy.get('button').last().click();

    // Verify logout
    cy.url({ timeout: 10000 }).should("include", "/login");
    cy.contains(/Login|Sign in/i).should("be.visible");
  });

  it("shows error on duplicate username", () => {
    const apiUrl = `${Cypress.env("apiUrl")}/api/users/register/`;
    cy.visit("/register");

    const randomString = Math.random().toString(36).substring(2, 10);
    const username = `testuser_${randomString}`;
    const email = `testuser_${randomString}@example.com`;

    cy.request({
      method: "POST",
      url: apiUrl,
      body: {
        username,
        email,
        first_name: "John",
        last_name: "Doe",
        password: `TestPass123!${randomString}`,
      },
      failOnStatusCode: false,
    });

    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(`another_${email}`);
    cy.get('input[name="first_name"]').type("John");
    cy.get('input[name="last_name"]').type("Doe");
    cy.get('input[name="display_name"]').type("John Doe Jr.");
    cy.get('input[name="password"]').type(`TestPass123!${randomString}`);

    cy.get('button[type="submit"]').click();

    cy.contains(/already exists/i).should(
      "be.visible",
    );
  });
});
