import { CTOS } from '../../src/core/enums';

function logToWindow(log) {
  cy.window().then(win => win.console.log('[CYPRESS]', log))
}

context('App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:80');

    cy.window().then((window) => {
      window.localStorage.setItem(
        'imageURL',
        '' // Add image url here
      );
    });

    // cy.get('#openlogin').click();

    cy.get('#ips_username').type('erica');
    cy.get('#ips_password').type('whatever');
    cy.get('#ips_remember').check();

    cy.contains('Login').click();
  });

  it('Hosts a game', () => {
    let port;

    cy.contains('Host').click();

    cy.get('#SHUFFLE').uncheck();

    cy.get('#creategameok').click();
    cy.window()
      .should('have.property', '__port')
      .then((_port) => {
        port = _port;
        cy.visit(`http://localhost:80/ygopro.html?room=${port}`);
      });

    // Create the iframe for second player (Maybe do this in app)
    cy.window().then((window) => {
      window.__isPlayer1 = true;
      const document = window.document;
      const iframe = document.createElement('iframe');
      iframe.src = `http://localhost:80/ygopro.html?room=${port}`;
      iframe.id = 'secondPlayer';

      window.toggleIframe = () => {
        const isOpen = window.__iframeOpen;
        iframe.style.position = isOpen ? 'static' : 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        window.__iframeOpen = !isOpen;
      };

      document.body.appendChild(iframe);
    });

    // Wait for iframe to fully load content and then alias the iframe body
    cy.get('#secondPlayer')
      .should((el) => {
        expect(el[0].contentWindow.document.body).to.not.be.empty;
        return [el[0].contentWindow.document.body];
      })
      .then((iframe) => iframe[0].contentWindow.document.body)
      .as('secondPlayer');

    cy.get('#player1lobbyslot').should('have.value', 'erica');

    cy.log('Get first indicator');

    cy.get('.lockindicator').eq(0).click();

    cy.log('Get second indicator');

    cy.get('@secondPlayer')
      .find('#player2lobbyslot')
      .should('have.value', 'erica');

    cy.get('@secondPlayer').find('.lockindicator').eq(1).click({ force: true });

    cy.contains('Duel').click();

    cy.get('#Paper').click();

    cy.get('@secondPlayer').find('#Rock').click({ force: true });

    cy.contains('Go First').click();

    // TODO: Change later
    cy.get('[data-id="10802915"]').click();

    cy.contains('Normal Summon').click();

    cy.get('.cardselectionzone.p0.MONSTERZONE.i0').click();

    cy.contains('Yes').click();

    cy.get('[data-reactid=".4.$revealer.0.9"]').click({force : true});

    cy.get('.cardselectionzone.p0.MONSTERZONE.i1').click();

    cy.get('.FaceUpAttack').click();

    cy.get('.card.p0.EXTRA').eq(0).click({ force: true });

    cy.get('#viewDecks img').eq(7).click();

    cy.contains('Special Summon').click();

    cy.get('#revealer img').eq(0).click({ force: true });
    cy.get('#revealer img').eq(1).click({ force: true });

    cy.get('.cardselectionzone.p0.MONSTERZONE.i2').click();

    cy.get('.FaceUpAttack').click();

    cy.get('.card.p0.MONSTERZONE.i2').eq(2).click({ force: true });

    logToWindow('Activating')

    cy.contains('Activate').click();

    cy.get('#revealer img').eq(0).click({ force: true });

    cy.get('.selectCheck').eq(2).find('input').check();

    cy.contains('button', 'Select').click();

    logToWindow('Clicked Select Button')

    cy.contains('Yes');
    cy.pause();
    cy.contains('Yes').click();

    cy.get('#revealer img').eq(1).click({ force: true });

    cy.get('.cardselectionzone.p0.MONSTERZONE.i0')
      .click({ force: true });

    cy.get('.FaceUpAttack').click();

    cy.get('#endphi.enabled').click();

    cy.window().then(win => win.toggleIframe());

    playRound(cy.get('@secondPlayer'));
  });
});


function playRound(parentElement = cy.get('body')) {
   // TODO: Change later
   parentElement.find('.HAND[data-id="10802915"]').click();

   parentElement.contains('Normal Summon').click();

   parentElement.find('.cardselectionzone.p0.MONSTERZONE.i0').click();

   parentElement.contains('Yes').click();

   parentElement.find('[data-reactid=".4.$revealer.0.9"]').click();

   parentElement.find('.cardselectionzone.p0.MONSTERZONE.i1').click();

   parentElement.find('.FaceUpAttack').click();

   parentElement.find('.card.p0.EXTRA').eq(0).click({ force: true });

   parentElement.find('#viewDecks img').eq(7).click();

   parentElement.contains('Special Summon').click();

   parentElement.find('#revealer img').eq(0).click({ force: true });
   parentElement.find('#revealer img').eq(1).click({ force: true });

   parentElement.find('.cardselectionzone.p0.MONSTERZONE.i2').click();

   parentElement.find('.FaceUpAttack').click();

   parentElement.find('.card.p0.MONSTERZONE.i2').eq(2).click({ force: true });

   parentElement.contains('Activate').click();

   parentElement.find('#revealer img').eq(0).click({ force: true });

   parentElement.find('.selectCheck').eq(2).find('input').check();

   parentElement.contains('button', 'Select').click();

   parentElement.contains('Yes').click();

   parentElement.find('#revealer img').eq(1).click({ force: true });

   parentElement.find('.cardselectionzone.p0.MONSTERZONE.i0').click();

   parentElement.find('.FaceUpAttack').click();
}