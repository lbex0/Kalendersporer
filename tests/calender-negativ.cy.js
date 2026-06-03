describe("Negativ test – kalenderen finner ingen resultater", () => {
  beforeEach(() => {
    cy.login();
  });

  it("skal ikke finne ukjent person, ikke åpne event og deretter logge ut", () => {
    // Vent til kalenderen er lastet
    cy.get('[id*="PC1"]', { timeout: 8000 }).should("exist");

    // Åpne visningsmenyen og bytt til Months
    cy.get('#__xmlview1--PC1-Header-ViewSwitch-select').should('be.visible').click({ force: true });
    cy.get('.sapMPopup-CTX .sapMSelectList', { timeout: 4000 }).contains('li', 'Months').click({ force: true });

    // Bekreft at visningen er satt til Months
    cy.get('#__xmlview1--PC1-Header-ViewSwitch-select-labelText')
      .should($el => {
        const txt = $el.text().trim().toLowerCase();
        expect(txt).to.eq('months');
      });

    // Naviger kalenderen for å sikre at knappene fungerer
    cy.get('#__xmlview1--PC1-Header-NavToolbar-NextBtn-img').should('exist').closest('button').click();
    cy.wait(200);
    cy.get('#__xmlview1--PC1-Header-NavToolbar-PrevBtn-img').should('exist').closest('button').click();

    // Søk etter en person som ikke finnes
    cy.get('input[placeholder*="Search"], input[id*="search"]', { timeout: 4000 }).clear().type("person", { delay: 20 });

    // Bekreft at søket ikke finner noen resultater
    cy.contains('person').should('not.exist');

    // Bekreft at det ikke dukker opp noen dialog/popover
    cy.get('.sapMDialog:visible, .sapMPopover:visible').should('not.exist');

    // Logg ut
    cy.contains('Logout', { timeout: 4000 }).should('be.visible').click({ force: true });

    // Bekreft at vi er tilbake på login-siden
    cy.get('#__xmlview0--usernameInput-inner', { timeout: 8000 }).should('be.visible');
    cy.get('#__xmlview0--passwordInput-inner').should('be.visible');
  });
});