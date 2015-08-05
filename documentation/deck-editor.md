# YGOPro Online Deck Editor

---

## Preface

The project "Online Deck Editor" is defined as interface between client and YGOPro, it allows users to construct their own decks with all cards available on [Salvation Development's server](http://ygopro.us)
It is entirely available under the [launcher version of the code](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/http/js/deck-edit-launcher.js) and uses its own [style sheet](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/http/css/deck-edit.css).

Below the documentation of the underlying JavaScript.

---

## Requirements

- **jQuery** (version 1.7 or higher will suffice)
- **jQueryUI** (JS was built with custom version of jQueryUI 1.11.4 available [here](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/http/js/jquery-ui.min.js) -- core modules: droppable, draggable)
- **[ConfigParser.js](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/http/js/ConfigParser.js)** (documentation below)
- **[parseYDK.js](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/http/js/parseYDK.js)** (documentation below)
- **database.json** (more information below)
- **lflist.conf** (YGOPro file parsed by ConfigParser to turn banlist into JS format)
- **Strings.conf** (YGOPro file parsed by ConfigParser to turn setcodes into JS format)

--

## Documentation

The JavaScript file is divided into two semantic parts -- the event handlers and jQuery loading of the server resources (see Requirements), and the functions defined to manage those events.

### Globals

- `cards`
  - Array representing the card database (database.json)
- `lflist`
  - Object representing the List of Limited and Forbidden Cards
- `imgDir`
  - Server location of the images
- `attributeMap`
  - Map of YGOPro representation of monster attributes
- `typeMap`
  - Map of YGOPro representation of Spell and Trap Card types
- `raceMap`
  - Map of YGOPro representation of Monster Types
- `monsterMap`
  - Map of YGOPro representation of 
- `deckStorage`
  - Object for handling all deck operations
- `drawDeckEditor(ydk)`
  - Function to draw the deck editor from a parsed YDK (through `parseYDK`) file
- `drawDeck(target)`
  - Draw a specific deck stored in `deckStorage`
- `shuffleArray`
  - Shuffle an array around. I was lazy and copied from the internet. Sorry, not sorry.
- `storeCard(outputArray)`
  - Store card ID from an array into an array from `deckStorage`
- `cardSort(prev, next)`
  - Function used for `Array.sort`
- `sortDeck(target)`
  - Sort a specific deck following a specific sort order defined in `cardSort`
- `sortAllDecks()`
  - Sort all decks and handle all of the deck storing
- `handleResults()`
  - Function invoked when searching cards
- `makeDescription(id)`
  - Function invoked when hovering over returned cards from search or generated from `drawDeck` or `drawDeckEditor`
- `attachDnDEvent(targetCollection)`
  - Attach Drag'n'Drop handler to selected collection dynamically (see more under D'n'D category)
- `dropHandler(target)`
  - Handle the drop event on target deck (see more under D'n'D category)
- `adjustDeckClass(target)`
  - Handle deck size and adjust class of the respective deck's container to squeeze cards together
- `dropOutHandler(target)` (see more under D'n'D category)
  - Handle the out event on target deck 
- `parseAtkDef(atk, def)`
  - Parse the ATK and DEF of a card and return it in a nice format
- `parseLevelScales(level)`
  - Parse the levels and scales of a card and return it in a nice format
- `cardIs(cat, obj)`
  - Determines if a card is a certain category by checking the type of the card
- `getCardObject(id)`
  - Get the card object from the cards array and return it
- `createCardImage(card)`
  - Create a card image from a card object
- `createDeckList(decks)`
  - Convert an array from `deckStorage` into a valid .ydk file
- `fAttrRace(obj, num, at)`
  - Filter function: Attribute and Race
- `fSetcode(obj, sc)`
  - Filter function: Setcode
- `fLevel(obj, lv, op)`
  - Filter function: Level
- `fScale(obj, sc, op)`
  - Filter function: Scale
- `fType(obj, ty)`
  - Filter function: Type
- `fAtkDef(obj, num, ad, op)`
  - Filter function: ATK and DEF
- `fNameDesc(obj, txt, nd)`
  - Filter function: Name and Description
- `filterName(result, txt)`
  - Filter function: narrow result by Name
- `filterDesc(result, txt)`
  - Filter function: narrow result by Description
- `filterType(result, type)`
  - Filter function: narrow result by Type
- `filterAttribute(result, attribute)`
  - Filter function: narrow result by Attribute
- `filterRace(result, race)`
  - Filter function: narrow result by Race
- `filterSetcode(result, setcode)`
  - Filter function: narrow result by Setcode
- `filterAtk(result, atk, op)`
  - Filter function: narrow result by ATK
- `filterDef(result, def, op)`
  - Filter function: narrow result by DEF
- `filterLevel(result, level, op)`
  - Filter function: narrow result by Level
- `filterScale(result, scale, op)`
  - Filter function: narrow result by Scale
- `filterForbiddenLimited(result, selectedLimitation, placeholder, selectedBanlist, config)`
  - Filter function: narrow result by selected limitation on the selected banlist
- `applyFilters(filterObject, banlist, lflist)`
  - Apply all filters given and return all matching cards
- `generateQueryObject()`
  - Generate the query for `applyFilters`
- `addDeckLegal(id, targetDeck, targetDeckSize, flList, currentList, deck2, deck3)`
  - Determine if a dropped card is able to be legally dropped into the target deck
  
### Drag'n'Drop

By utilizing **jQueryUI**, there are four different drag'n'drop zones:

1. Main Deck
2. Extra Deck
3. Side Deck
4. Search Results

Due to an issue with the code, cards **CANNOT** be moved from one deck to another. Attempting to do so will remove the card from the deck.

Legal drops will be determined through `addDeckLegal`, and until dropped, cards from the search result will be given a specific `data` tag, allowing them to be dragged over any elements without being removed by above code. It's a bit of a hacky solution but is a fine way to work around it.