function saveFileRequest (decks, name) {
    // assume we have an already defined private server action called "saveFileRequest"
    sendRequest({
        action: "saveFileRequest",
        data: [decks, name]
    }).success(function () {
        alert("Deck saved successfully.");
    }).fail(function () {
        alert("An error occurred while saving your deck.\n\nYour deck has not been saved, please try again.");
    });
}

function handleSaveFileRequest (decks, name) {
    var generatedYDK = "#Created by YGOPro.us' deck editor\n",
        deck;
    for(deck in decks) {
        generatedYDK += (deck === "side") ? "!" : "#" + deck +"\n";
        generatedYDK += decks[deck].join("\n") + "\n";
    }
    generatedYDK = generatedYDK.split("\n").filter(function (line) {
        return !!line;
    }).join("\n");
    fs.writeFile('./ygopro/deck/' + name + '.ydk', generatedYDK, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log("File saved successfully.");
        }
    });
}