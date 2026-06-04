Cypress.Commands.add("login", () => 
{
  cy.visit("http://localhost:8080/index.html#/");

  cy.get("#content-kalendersporer---login--usernameInput-inner").should('be.visible').type("nora.kristiansen");
  cy.get("#content-kalendersporer---login--passwordInput-inner").should('be.visible').type("abc1")
  cy.contains("Log in").click();

  cy.url().should("include", "#/calender");
});