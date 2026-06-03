Cypress.Commands.add("login", () => {
  cy.visit("http://localhost:8080/index.html#/");

  cy.get("#__xmlview0--usernameInput-inner").type("nora.kristiansen");
  cy.get("#__xmlview0--passwordInput-inner").type("abc1");
  cy.contains("Log in").click();

  cy.url().should("include", "#/calender");
});