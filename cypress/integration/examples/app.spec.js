context('App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:80');
    cy.get('#openlogin').click();
    cy.get('#ips_username').type('erica');
    cy.get('#ips_password').type('whatever');
    cy.contains('Login').click();
  });

  it('Hosts a game', () => {
    cy.contains('Host').click();
    cy.get('#creategameok').click();
  });
});
