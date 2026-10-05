describe("Responsive Design & Touch interactions", () => {
  const terminalLog = (violations) => {
    cy.task(
      'log',
      `${violations.length} accessibility violation${
        violations.length === 1 ? '' : 's'
      } ${violations.length === 1 ? 'was' : 'were'} detected`
    )
    const violationData = violations.map(
      ({ id, impact, description, nodes }) => ({
        id,
        impact,
        description,
        nodes: nodes.length,
        html: nodes.map(n => n.html).join(', ')
      })
    )
    cy.task('table', violationData)
  }

  it("loads the login page properly on mobile", () => {
    cy.viewport("iphone-6");
    cy.visit("/login");
    cy.get('input[name="username"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
  });

  it("loads the register page properly on tablet", () => {
    cy.viewport("ipad-2");
    cy.visit("/register");
    cy.get('input[name="username"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
  });
});
