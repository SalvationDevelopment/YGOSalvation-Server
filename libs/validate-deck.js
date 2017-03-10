function validateDeck (deck, banlist, database) {
  function getCardById (cardId) {
    for (var i = 0; i < database.length; i++) {
      if (database[i].id == cardId) {
        return database[i];
      }
    }
    return null;
  }

  var validate = {
    error: false,
    msg: ''
  };
  // make sure we can work with the input
  if (!deck.main || !deck.side || !deck.extra || typeof deck.main.forEach !== 'function' || typeof deck.side.forEach !== 'function' || typeof deck.extra.forEach !== 'function') {
    validate.error = true;
    validate.msg = 'Invalid deck object';
    return validate;
  }
  // check deck lengths
  if (deck.main.length < 40) {
    validate.error = true;
    validate.msg = 'Main Deck size below 40';
    return validate;
  }
  if (deck.main.length > 60) {
    validate.error = true;
    validate.msg = 'Main Deck size above 60';
    return validate;
  }
  if (deck.side.length > 15) {
    validate.error = true;
    validate.msg = 'Side Deck size above 15';
    return validate;
  }
  if (deck.extra.length > 15) {
    validate.error = true;
    validate.msg = 'Extra Deck size above 15';
    return validate;
  }
  // remap decks
  var main = {};
  var side = {};
  var extra = {};
  deck.main.forEach(function (card) {
    var cardObject = getCardById(card);
    if (cardObject.alias) {
      card = cardObject.alias;
    }
    if (!main[card]) {
      main[card] = 1;
    } else {
      main[card]++;
    }
  });
  deck.side.forEach(function (card) {
    var cardObject = getCardById(card);
    if (cardObject.alias) {
      card = cardObject.alias;
    }
    if (!side[card]) {
      side[card] = 1;
    } else {
      side[card]++;
    }
  });
  deck.extra.forEach(function (card) {
    var cardObject = getCardById(card);
    if (cardObject.alias) {
      card = cardObject.alias;
    }
    if (!extra[card]) {
      extra[card] = 1;
    } else {
      extra[card]++;
    }
  });
  // check amount of cards
  for (var card in main) {
    if (main[card] > 3 || side[card] && main[card] + side[card] > 3) {
      validate.error = true;
      validate.msg = "You have " + cardAmount+ " copies of " + card + " but the limit is " + banlist[card];
      return validate;
    }
  }
  for (var card in side) {
    if (side[card] > 3 || main[card] && main[card] + side[card] > 3) {
      validate.error = true;
      validate.msg = "You have " + cardAmount+ " copies of " + card + " but the limit is " + banlist[card];
      return validate;
    }
  }
  for (var card in extra) {
    if (extra[card] > 3 || side[card] && extra[card] + side[card] > 3) {
      validate.error = true;
      validate.msg = "You have " + cardAmount+ " copies of " + card + " but the limit is " + banlist[card];
      return validate;
    }
  }
  // check banlist, assume banlist is an object generated from ConfigParser()
  for (var card in banlist.bannedCards) {
    var cardAmount = 0;
    if (main[card]) {
      cardAmount += main[card];
    }
    if (side[card]) {
      cardAmount += side[card];
    }
    if (extra[card]) {
      cardAmount += extra[card];
    }
    if (cardAmount > banlist.bannedCards[card]) {
      validate.error = true;
      validate.msg = "You have " + cardAmount+ " copies of " + card + " but the limit is " + banlist[card];
      return validate;
    }
  }
  return validate;
}

if (module && typeof module.exports !== 'undefined') {
  module.exports = validateDeck;
}
