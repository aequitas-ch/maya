describe("Test User Dependents Flow", () => {
  it("logs in as the test user and verifies dependents", () => {
    const testUserPassword = Cypress.env("testUserPassword");
    expect(testUserPassword, "Cypress test user password").to.be.a("string").and.not.be.empty;

    // Navigate to Login page
    cy.visit("/login");

    // Login as the seeded test user (created via migration 0005_create_test_user)
    cy.intercept('POST', '**/api/token/').as('loginRequest');
    cy.get('input[name="username"]').type("test");
    cy.get('input[name="password"]').type(testUserPassword);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    // Verify successful login
    cy.url({ timeout: 10000 }).should("not.include", "/login");
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);

    // Verify display name
    cy.contains(/test/i, { matchCase: false, timeout: 10000 }).should("be.visible");

    // Navigate to Dependents page
    cy.get('a[href="/dependents"]').first().click();
    cy.url().should("include", "/dependents");

    // Create a Muster dependent for the test user directly in the test
    // so this spec is self-contained and does not depend on the seed job timing.
    const randomName = `Peter`;

    cy.get('input[id="firstName"]').type(randomName);
    cy.get('input[id="lastName"]').type("Muster");
    cy.get('input[id="address"]').type("Musterstrasse");
    cy.get('input[id="postalCode"]').type("9999");
    cy.get('input[id="city"]').type("Musterstadt");
    cy.get('input[id="mainDiagnosis"]').type("Krankheit");
    cy.get('input[id="ahvNumber"]').type("756.2222.2222.11");
    cy.intercept('POST', '**/api/dependents/').as('createDependentRequest');
    cy.intercept('GET', '**/api/dependents/').as('getDependentsRequest');
    cy.get('form').find('button[type="submit"]').click();

    cy.wait('@createDependentRequest').its('response.statusCode').should('eq', 201);

    // After creating a dependent, wait for the fetch to resolve and the DOM to settle
    // The test was failing to find the content because we only waited for the request to start,
    // not to complete and render
    cy.wait('@getDependentsRequest', { timeout: 10000 }).its('response.statusCode').should('eq', 200);

    // Verify the dependent is visible in the list
    cy.contains(randomName, { timeout: 10000 }).should("be.visible");
    cy.contains("Muster", { timeout: 10000 }).should("be.visible");
  });
});
