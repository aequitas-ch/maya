// Cypress commands
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
