//$('.descInput, .nameInput').on('input', deckEditor.doNewSearch);


$('.descInput, .nameInput').keypress('input', function(event) {
    'use strict';
    if (event.which === 13) {
        deckEditor.doNewSearch();
    }

});
$('.typeSelect, .monsterCardSelect, .monsterTypeSelect, .spellSelect, .trapSelect, .attributeSelect, .raceSelect, .setcodeSelect, .forbiddenLimitedSelect, .packSelect').on('change', deckEditor.doNewSearch);

$('.atkInput, .defInput, .levelInput, .scaleInput, .searchrange').on('change', deckEditor.doNewSearch);
$('.typeSelect').on('change', function() {
    'use strict';
    var target = $('.typeSelect option:selected').text();
    $('.monsterCardSelect, .monsterTypeSelect, .spellSelect, .trapSelect, .attributeSelect, .raceSelect').css('display', 'none');
    $('.attributeSelectl, .raceSelectl').css('display', 'none');
    switch (target) {
        case 'Monster':
            $('.monsterCardSelect, .monsterTypeSelect, .attributeSelect, .raceSelect').css('display', 'block');
            $('.attributeSelectl, .raceSelectl').css('display', 'block');
            break;
        case 'Spells':
            $('.spellSelect').css('display', 'block');
            break;
        case 'Traps':
            $('.trapSelect').css('display', 'block');
            break;
        default:
            break;
    }
});


$('.databaseSelect').on('change', function() {
    'use strict';
    var newDB = $('.databaseSelect').val();
    databaseSystem.setDatabase([newDB]);
    deckEditor.doNewSearch();
});

$('.banlistSelect').on('change', function() {
    'use strict';
    var newList = $('.banlistSelect').val();
    databaseSystem.setBanlist(newList);
    deckEditor.doNewSearch();
});

$('.deckSelect, #lobbycurrentdeck select').on('change', function() {
    'use strict';
    deckEditor.switchDecks(parseInt($('.deckSelect').val(), 10));
});


function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    'use strict';
    var f = evt.target.files[0],
        r;

    if (f) {
        r = new FileReader();
        r.onload = function(e) {
            var contents = e.target.result,
                action = false;

            action = confirm('Upload Deck?');
            if (action) {
                deckEditor.upload(contents);
            }

        };
        r.readAsText(f);
    } else {
        alertmodal('Failed to load file');
    }
}

$('#deckupload').on('change', readSingleFile);


$(' .mainDeck, .extraDeck, .sideDeck').on('dragover dragleave', function(event) {
    'use strict';
    event.preventDefault();
    event.stopPropagation();
});

$(' .mainDeck, .extraDeck, .sideDeck').on('drop', function(event) {
    'use strict';
    event.preventDefault();
    event.stopPropagation();

    var from = deckEditorReference.zone,
        target = $(this).data('dragzone'),
        sameIndex = $(this).data('dropindex');

    if (from === 'search' && ((target === 'main' && !isExtra(deckEditorReference)) || (target === 'extra' && isExtra(deckEditorReference)))) {
        deckEditor.addCardFromSearch(target);

    } else if (target === from) {
        deckEditor.moveInSameZone(from, deckEditorReference.index, sameIndex);
    } else if (target === 'main' && isExtra(deckEditorReference)) {
        return;
    } else if (target === 'extra' && !isExtra(deckEditorReference)) {
        return;
    } else {
        deckEditor.deckEditorMoveTo(target);
    }

    deckEditor.doSearch();
});

deckEditor.loadDecks([deckEditor.makeNewDeck('New Deck')]);