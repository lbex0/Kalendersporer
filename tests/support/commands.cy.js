Cypress.Commands.add("login", () => 
{
  cy.visit("http://localhost:8080/index.html#/");

  cy.get("#content-kalendersporer---login--usernameInput-inner").should('be.visible').type("nora.kristiansen");
  cy.get("#content-kalendersporer---login--passwordInput-inner").should('be.visible').type("abc1")
  cy.get("#__button0-BDI-content").click();

  cy.wait(1000); // Vent litt for å sikre at navigasjonen har skjedd
  cy.url().should("include", "#/calender");
});