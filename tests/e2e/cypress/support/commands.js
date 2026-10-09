// Cypress commands

Cypress.Commands.add("login", (username = "test", password = null) => {
  // Use provided password or get from environment
  let loginPassword = password || Cypress.env("testUserPassword");
  
  // Fallback to default if still empty (for development/testing)
  if (!loginPassword) {
    loginPassword = "test_password_123";
  }
  
  expect(loginPassword, "Password for login").to.be.a("string").and.not.be.empty;

  // Navigate to login page
  cy.visit("/login");

  // Fill in credentials
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(loginPassword);

  // Submit login form
  cy.intercept("POST", "**/api/token/").as("loginRequest");
  cy.get('button[type="submit"]').click();

  // Wait for login to complete
  cy.wait("@loginRequest", { timeout: 15000 }).its("response.statusCode").should("eq", 200);

  // Verify successful login
  cy.url({ timeout: 10000 }).should("not.include", "/login");
  cy.url().should("eq", `${Cypress.config().baseUrl}/`);
});

Cypress.Commands.add("enableModules", (user, modules) => {
  const apiUrl = Cypress.env("apiUrl");

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/token/`,
    body: { username: user.username, password: user.password },
  }).then(({ body }) => {
    cy.request({
      method: "PATCH",
      url: `${apiUrl}/api/users/profile/`,
      headers: { Authorization: "Bearer " + body.access },
      body: modules,
    });
  });
});

Cypress.Commands.add("loginByApi", (username = "test", password = null) => {
  let loginPassword = password || Cypress.env("testUserPassword");
  if (!loginPassword) {
    loginPassword = "test_password_123";
  }

  const apiUrl = Cypress.env("apiUrl");

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/token/`,
    body: { username, password: loginPassword },
  }).then(({ body }) => {
    window.localStorage.setItem("access_token", body.access);
    window.localStorage.setItem("refresh_token", body.refresh);
  });
});
