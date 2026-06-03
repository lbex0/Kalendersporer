describe("Login flow - negativ", () => {
  it("innlogging skal feile og det skal ikke navigeres til calendar siden", () => {
    // Gå til appens startside (login)
    cy.visit("http://localhost:8080/index.html#/");

    //Fyll inn FEIL brukernavn og passord
    cy.get("#__xmlview0--usernameInput-inner").should('be.visible').type("nora.kristnsen");  
    cy.get("#__xmlview0--passwordInput-inner").should('be.visible').type("abc123");  

    // Klikk på login-knappen
    cy.contains("Log in").should('be.visible').click();

    // Verifiser at vi IKKE navigerer til kalenderen
    cy.url().should((url) => {
      expect(url).to.not.include("#/calender");
    });

    // Verifiser at kalenderkomponenten IKKE finnes
    cy.get('[id*="PC1"]').should("not.exist");

    // Verifiser at en feilmelding vises
    cy.contains(/invalid|wrong|error|feil|could not log in|incorrect/i, { timeout: 3000 })
      .should('exist');

    // Se om vi forblir på login, feltene skal fortsatt være tilgjengelige
    cy.get("#__xmlview0--usernameInput-inner").should('be.visible');
    cy.get("#__xmlview0--passwordInput-inner").should('be.visible');
  });
});