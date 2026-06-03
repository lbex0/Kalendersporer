describe("Login flow", () => {
  it("burde logge inn successfullt and navigere til calendar siden", () => {

    // Gå til appens startside (login)
    cy.visit("http://localhost:8080/index.html#/");

    // Skriv inn brukernavn og passord
    cy.get("#__xmlview0--usernameInput-inner").type("nora.kristiansen");  
    cy.get("#__xmlview0--passwordInput-inner").type("abc1");  

    // Klikk på login knappen
    cy.contains("Log in").click();

    // Verifiser at vi navigerte til kalenderen
    cy.url().should("include", "#/calender");

    // Sjekk at kalenderkomponenten eksisterer i DOM
    cy.get('[id*="PC1"]', { timeout: 8000 })  // venter til PC1 vises
      .should("exist");

    // Sjekk at navnet på brukeren vises i headeren
    cy.contains("nora.kristiansen", { matchCase: false }).should("exist");
  });
});
