describe("Responsive Design & Touch interactions", () => {
  it("loads the login page properly on mobile", () => {
    // Simulate an iPhone 6 view
    cy.viewport("iphone-6");
    cy.visit("/login");

    // Make sure we can see the form and buttons
    cy.get('input[name="username"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");

    cy.injectAxe();
    cy.checkA11y();
  });

  it("loads the register page properly on tablet", () => {
    // Simulate an iPad 2 view
    cy.viewport("ipad-2");
    cy.visit("/register");

    cy.get('input[name="username"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");

    cy.injectAxe();
    cy.checkA11y();
  });
});
