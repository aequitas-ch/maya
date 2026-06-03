describe("Data Entry with Fallbacks", () => {
  let testUser;

  beforeEach(() => {
    // Generate a random test user
    const randomString = Math.random().toString(36).substring(2, 10);
    testUser = {
      username: `fallback_${randomString}`,
      email: `fallback_${randomString}@example.com`,
      first_name: "Test",
      last_name: "Parent",
      password: "StrongPassword123!",
    };

    const apiUrl = `${Cypress.env("apiUrl") || "http://127.0.0.1:8000"}/api/users/register/`;

    // Register user via API
    cy.request({
      method: "POST",
      url: apiUrl,
      body: testUser,
    });

    // Login via UI
    cy.visit("/login");
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Verify login
    cy.url({ timeout: 10000 }).should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("preserves form data and shows an error message when submission fails due to network drop", () => {
    // First create a dependent
    cy.visit("/dependents");
    cy.get('input[id="firstName"]').type("Jane");
    cy.get('input[id="lastName"]').type("Doe");
    cy.get('input[id="address"]').type("123 Health St");
    cy.get('input[id="city"]').type("Zurich");
    cy.get('input[id="postalCode"]').type("8000");
    cy.get('input[id="mainDiagnosis"]').type("Cerebral Palsy");
    cy.get('input[id="ahvNumber"]').type("756.1234.5678.90");
    cy.get('button[type="submit"]').click();

    // Wait for the dependent to appear in the list
    cy.contains("Jane Doe").should("exist");

    // Navigate to Health Data page
    cy.contains("Health Data").click();
    cy.url().should("include", "/health");

    cy.injectAxe();
    cy.checkA11y();

    // Intercept the health record creation API call and simulate a 500 error
    cy.intercept("POST", "**/api/health/records/", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
      delayMs: 500,
    }).as("createHealthRecordFail");

    // Fill out the form
    cy.get('input[placeholder="e.g. Weight, Height"]').type("Height");
    cy.get('input[placeholder="e.g. kg, cm"]').type("cm");
    cy.get('input[placeholder="e.g. kg, cm"]')
      .parent()
      .next()
      .find("input")
      .type("120");
    cy.get("textarea").type("Yearly measurement");

    // Submit form
    cy.get("button").contains("Add Record").click();

    // Wait for the intercepted request
    cy.wait("@createHealthRecordFail");

    // Verify an error message is shown to the user
    // The specific error is handled as a formError fallback in Health.tsx or globally via intercept logic. We'll wait to ensure the error text appears.
    // In Health.tsx: {formError && <div className="bg-red-100 ...">{formError}</div>}
    // We expect some form of error text like "Failed to add" or similar fallback
    cy.contains("Failed to add health record").should("be.visible");

    // Check accessibility of the error state
    cy.checkA11y();

    // Verify that the data is not lost (form fields still have the values)
    cy.get('input[placeholder="e.g. Weight, Height"]').should(
      "have.value",
      "Height",
    );
    cy.get('input[placeholder="e.g. kg, cm"]').should("have.value", "cm");
    cy.get('input[placeholder="e.g. kg, cm"]')
      .parent()
      .next()
      .find("input")
      .should("have.value", "120");
    cy.get("textarea").should("have.value", "Yearly measurement");
  });
});
