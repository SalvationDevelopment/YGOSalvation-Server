const DataStore = require('nedb'),
    db = new DataStore({ filename: './ailog.nedb', autoload: true });




function cleanTrainingData(query) {
    console.log(query.length);
    return query.map((entry) => {
        return {
            input: [entry.input],
            output: [entry.output[0]]
        };
    });
}

var neataptic = require('neataptic');

db.find({ 'input.command': 'MSG_SELECT_IDLECMD' }, function(error, results) {
    var network = new neataptic.architect.LSTM(1, 5, 10, 1);

    var trainingSet = cleanTrainingData(results);
    console.log(trainingSet[0]);
    network.train(trainingSet, {
        log: 1,
        iterations: 5000,
        error: 0.0001,
        rate: 0.2
    });
    //.then(console.log).catch(console.log);
    network.activate(trainingSet[0]);
});