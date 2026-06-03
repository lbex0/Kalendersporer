describe("Positiv test – finne Tobias sin bursdag og logge ut", () => {
  // Brukerdefinert kommando for å logge inn før hver test
  beforeEach(() => {
    cy.login();
  });

  it("skal søke etter Tobias, åpne bursdagen hans og logge ut", () => {
    // Vente på at kalender lastet
    cy.get('[id*="PC1"]', { timeout: 8000 }).should("exist");

    // Åpne dropdown 
    cy.get('#__xmlview1--PC1-Header-ViewSwitch-select').should('be.visible').click({ force: true });

    // Når listen dukker opp, velg Months
    cy.get('.sapMPopup-CTX .sapMSelectList', { timeout: 4000 }).contains('li', 'Months').click({ force: true });

    // Verifiser at teksten ble oppdatert fra Hours til Months
    cy.get('#__xmlview1--PC1-Header-ViewSwitch-select-labelText')
    .should($el => {
        const txt = $el.text().trim().toLowerCase();
        expect(['months']).to.include(txt);
    });

    // Naviger i kalenderen med å gå en gang frem og tilbake for å sikre at navigasjonen fungerer
    cy.get('#__xmlview1--PC1-Header-NavToolbar-NextBtn-img').should('exist').closest('button').click();
    cy.wait(200);
    cy.get('#__xmlview1--PC1-Header-NavToolbar-PrevBtn-img').should('exist').closest('button').click();


    // Søk etter Tobias
    cy.get('input[placeholder*="Søk"], input[placeholder*="Search"], input[id*="search"]').clear().type("tobias");
    // Verifiser at Tobias sin bursdag vises i søkeresultatet
    cy.contains(/tobias/i).should("exist");

    // Klikk på Tobias sin bursdag
    cy.get('[id*="PC1"]').find('.sapUiCalendarApp, .sapUiCalItem, .sapMPCAppointment, .sapUiCalItemText').contains(/tobias|bursdag/i).first().click();

    // Verifiser popup dialog og lukk den
    cy.get('.sapMDialog, .sapMPopover', { timeout: 5000 }).should('be.visible');

    cy.contains(/Close|OK/i).click({ force: true });

    // Logg ut
    cy.contains('Logout', { timeout: 4000 }).should('be.visible').click({ force: true })

    // Verifiser at vi er tilbake på login-siden
    cy.get('#__xmlview0--usernameInput-inner', { timeout: 8000 }).should('be.visible');
    cy.get('#__xmlview0--passwordInput-inner').should('be.visible');
  });
});