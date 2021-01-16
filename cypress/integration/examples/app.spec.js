context('App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:80'); 

    cy.get('#openlogin').click();

    cy.get('#ips_username').type('erica');
    cy.get('#ips_password').type('whatever');
    cy.get('#ips_remember').check();

    cy.contains('Login').click();
  });

  it('Hosts a game', () => {
    let port;

    cy.contains('Host').click();
  
    cy.get('#creategameok').click();
    cy.window()
      .should('have.property', '__port')
      .then(_port => {
        port = _port
        cy.visit(`http://localhost:80/ygopro.html?room=${port}`)
      })

    // Create the iframe for second player (Maybe do this in app)
    cy.document()
      .then(document => {
        const iframe = document.createElement('iframe');
        iframe.src = `http://localhost:80/ygopro.html?room=${port}`;
        iframe.id = 'secondPlayer'
        document.body.appendChild(iframe);
      })

    // Wait for iframe to fully load content and then alias the iframe body
    cy.get('#secondPlayer')
      .should(el => {
        expect(el[0].contentWindow.document.body).to.not.be.empty;
        return [el[0].contentWindow.document.body];
      })
      .then(iframe => iframe[0].contentWindow.document.body)
      .as('secondPlayer');

    cy.get('#player1lobbyslot')
      .should('have.value', 'erica');

    cy.log('Get first indicator');

    cy.get('.lockindicator')
      .eq(0)
      .click();

    cy.log('Get second indicator');

    cy.get('@secondPlayer')
      .find('#player2lobbyslot')
      .should('have.value', 'erica');

    cy.get('@secondPlayer')
      .find('.lockindicator')
      .eq(1)
      .click({ force: true });

    cy.contains('Duel')
      .click();

    cy.get('#Paper').click();

    cy.get('@secondPlayer').find('#Rock').click({ force: true });

    cy.contains('Go First')
      .click();
    
  });
});
