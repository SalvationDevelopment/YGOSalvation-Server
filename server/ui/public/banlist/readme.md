```JavaScript
module.exports =
{
    bannedCards : {
        //[Forbidden card ID]: 0,
        //[Limited card ID]: 1,
        //[Semi-Limited card ID]: 2,
    },
     bannedTypes : [], //datas.type values banned in this F&L Lists, such as Fusions, Synchro, etc
     exceptions : [], //card IDs that ignore the bannedTypes array
     startDate : new Date('YYYY-MM-DD'), //legal start date
     endDate : new Date('YYYY-MM-DD'), //legal end date, or 'null' if date is unknown
     primary : false, // if the banlist is the default of the host and deck editor
     modern : true, // if the banlist is commonly planned and should be on the condensed ban list listings.
     name : ' ',
}
```