
class SearchFilter {
    constructor(database) {
        this.currentSearch = [];
        this.currentSearchIndex = 0;
        this.currentSearchPageSize = 60;
        this.currentSearchNumberOfPages = 1;
        this.maxPages = Math.ceil(this.currentSearchPageSize / this.currentSearch.length);
        this.currentFilter = this.getFilter();
        this.render = [];
        this.database = database;
    }


    /**
     * Card Filteration Object
     * @returns {object} [[Description]]
     */
    getFilter() {
        return {
            cardtype: undefined,
            cardname: undefined,
            description: undefined,
            banlist: undefined,
            type: undefined,
            type1: undefined,
            type2: undefined,
            attribute: undefined,
            race: undefined,
            release: undefined,
            setcode: undefined,
            atk: undefined,
            atkop: 0,
            def: undefined,
            defop: 0,
            level: undefined,
            levelop: 0,
            scale: undefined,
            scaleop: 0,
            limit: undefined,
            links: [null, null, null, null, null, null, null, null]
        };
    }

    //-----------------------
    //FILTERS BEIGN HERE

    //Filters either attribute or race, depending on the value of AT.
    //at =1 is attribute, Else it's race.
    // Num is the value in the DB for a given attribute or race.
    fAttrRace(obj, num, at) {

        var val = (at === 1) ? obj.attribute : obj.race;
        if (val === num) {
            return true;
        } else {
            return false;
        }
    }



    //Lv is the level sought. OP is operation.
    //OP =0 is LESS THAN OR EQUAL lv.
    //OP =1 Is EQUALS lv.
    // Else is HIGHER THAN OR EQUAL
    fLevel(obj, lv, op) {
        var val = obj.level.toString(16);
        if (val.length > 2) {
            val = parseInt(val.substr(val.length - 2), 10);
            lv = parseInt(lv.toString(16), 10);
            switch (op) {
                case -2:
                    return val < lv;
                case -1:
                    return val <= lv;
                case 0:
                    return val === lv;
                case -1:
                    return val >= lv;
                case 2:
                    return val > lv;
                default:
                    return val === lv;
            }
        }
        val = Number(val);
        switch (op) {
            case -2:
                return val < lv;
            case -1:
                return val <= lv;
            case 0:
                return val === lv;
            case -1:
                return val >= lv;
            case -2:
                return val > lv;
            default:
                return val === lv;
        }
    }

    // Same as Lv, but with SC as the Scale (Assumes Right=Left)
    fScale(obj, sc, op) {

        var val = obj.level >> 24;
        switch (op) {
            case -2:
                return val < sc;
            case -1:
                return val <= sc;
            case 0:
                return val === sc;
            case -1:
                return val >= sc;
            case -2:
                return val > sc;
            default:
                return val === sc;
        }
    }


    // Uses the monsters full Type value from DB to determine.
    //works  either 1 by 1 or against the sum of Type filters.
    fType(obj, ty) {

        var val = obj.type;
        return (val & ty) > 0;
    }

    //As Level, but for ATK/DEF
    //AD =1 is ATK, Else it's DEF being evaluated.
    // Num is the value to compare against.
    fAtkDef(obj, num, ad, op) {
        if (!ad && cardIs('link', obj)) {
            return false;
        }
        var val = (ad === 1) ? obj.atk : obj.def;
        switch (op) {
            case -2:
                return val < num;
            case -1:
                return val <= num;
            case 0:
                return val === num;
            case -1:
                return val >= num;
            case -2:
                return val > num;
            default:
                return val === num;
        }
    }
    // ND=1 is Name, else Desc. Checks if the TXT string is contained.
    fNameDesc(obj, txt, nd) {

        var val = (nd === 1) ? obj.name.toLowerCase() : obj.desc.toLowerCase();
        if (val.indexOf(txt.toLowerCase()) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    // Filters cards that have 'txt' in their name.
    filterName(cardsf, txt) {
        if (txt !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fNameDesc(item, txt, 1);
            });
            return output;
        }
        return cardsf;
    }

    filterRelease(cardsf, set) {
        if (set === undefined) {
            return cardsf;
        }

        function check(card, region) {
            if (!card[region]) {
                return false;
            }
            return card[region].pack;


        }
        return cardsf.filter((card) => {
            return (check(card, 'ocg') === set || check(card, 'tcg') === set);
        });

    }
    //Filters effect or flavor texts for the txt string
    filterDesc(cardsf, txt) {
        if (txt !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fNameDesc(item, txt, 0);
            });
            return output;
        }
        return cardsf;
    }

    // Returns all cards that have all the types input.
    filterType(cardsf, type) {
        if (type !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fType(item, type);
            });
            return output;
        }
        return cardsf;
    }

    //Attribute must matcht he arg.
    filterAttribute(cardsf, attribute) {
        if (attribute !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fAttrRace(item, attribute, 1);
            });
            return output;
        }
        return cardsf;
    }

    //Returns Cards whose race matches the arg.
    filterRace(cardsf, race) {
        if (race !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fAttrRace(item, race, 0);
            });
            return output;
        }
        return cardsf;
    }

    //SC is setcode in decimal. This handles all possible combinations.
    fSetcode(obj, sc) {

        var val = obj.setcode,
            hexA = val.toString(16),
            hexB = sc.toString(16);
        if (val === sc || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16) || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16) || (val >> 16).toString(16) === hexB) {
            return true;
        } else {
            return false;
        }
    }
    //All cards that share at least 1 setcode with the arg.
    filteSetcode(cardsf, setcode) {
        if (setcode !== undefined) {
            var output = cardsf.filter((item) => {
                return this.fSetcode(item, setcode);
            });
            return output;
        }
        return cardsf;
    }

    //OP here s just as in the previous .
    //OP=0 is LOWER THAN OR EQUAL to 
    //OP=1 is EQUALS to 
    //Else it's HIGHER THAN OR EQUAL
    filterAtk(cardsf, atk, op) {
        if (atk !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fAtkDef(item, atk, 1, op);
            });
            return output;
        }
        return cardsf;
    }



    //As above, but DEF
    filterDef(cardsf, def, op, links) {
        if (def !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fAtkDef(item, def, 0, op);
            });
            return output;
        }

        if (!links.length) {
            return cardsf;
        }

        console.log('checking agaisnt links', links);
        var output = cardsf.filter((item) => {
            return links.every((pointer) => {
                return item.links.includes(pointer);
            });
        });
        return output;
    }
    //Just Level.. Zzz as Atk/Def
    filterLevel(cardsf, level, op) {
        if (level !== undefined) {
            var output = cardsf.filter((item) => {
                return this.fLevel(item, level, op);
            });
            return output;
        }
        return cardsf;
    }

    filterSetcode(result, setcode) {
        if (setcode) {
            return result.filter((item) => {
                return this.fSetcode(item, setcode);
            });
        } else {
            return result;
        }

    }

    filterLimit(result, limit) {
        if (limit !== undefined) {
            return result.filter((item) => {
                return item.limit === limit;
            });
        } else {
            return result;
        }
    }

    filterScale(result, scale, op) {
        if (scale !== undefined) {
            return result.filter((item) => {
                return this.fScale(item, scale, op);
            });
        } else {
            return result;
        }
    }

    filterExactType(result, type) {
        if (type !== undefined) {
            return result.filter((item) => {
                return item.type === type;
            });
        } else {
            return result;
        }
    }

    filterToken(result) {
        return result.filter((item) => {
            //item is not a token
            return item.type !== 16401;
        });
    }

    filterAll(cards, filter) {
        var cardsf = cards,
            links = filter.links.reduce((list, item) => {
                if (Number.isInteger(item)) {
                    list.push(item);
                }
                return list;
            }, []);
        console.log(filter.banlist);
        cardsf = this.filterToken(cardsf) || cardsf;
        cardsf = this.filterLimit(cardsf, filter.limit) || cardsf;
        cardsf = this.filterExactType(cardsf, filter.exacttype) || cardsf;
        cardsf = this.filterName(cardsf, filter.cardname) || cardsf;
        cardsf = this.filterDesc(cardsf, filter.description) || cardsf;
        cardsf = this.filterType(cardsf, filter.type) || cardsf;
        cardsf = this.filterType(cardsf, filter.type1) || cardsf;
        cardsf = this.filterType(cardsf, filter.type2) || cardsf;
        cardsf = this.filterAttribute(cardsf, filter.attribute) || cardsf;
        cardsf = this.filterRace(cardsf, filter.race) || cardsf;
        cardsf = this.filterSetcode(cardsf, filter.setcode) || cardsf;
        cardsf = this.filterAtk(cardsf, filter.atk, filter.atkop) || cardsf;
        cardsf = this.filterDef(cardsf, filter.def, filter.defop, links) || cardsf;
        cardsf = this.filterLevel(cardsf, filter.level, filter.levelop) || cardsf;
        cardsf = this.filterScale(cardsf, filter.scale, filter.scaleop) || cardsf;
        cardsf = this.filterRelease(cardsf, filter.release) || cardsf;
        return cardsf;
    }


    preformSearch() {
        this.currentSearch = this.filterAll(this.database, this.currentFilter);
        this.currentSearchPageSize= 60;
        this.currentSearchIndex = 0;
    }

    renderSearch() {
        this.render = this.currentSearch.slice(this.currentSearchIndex, this.currentSearchPageSize + this.currentSearchIndex);
        this.currentSearchNumberOfPages = Math.ceil(this.currentSearchIndex / this.currentSearchPageSize) || 1;
        this.maxPages = Math.ceil(this.currentSearch.length / this.currentSearchPageSize);
        return this.render;
    }

    pageForward() {
        var attempted = this.currentSearchIndex + this.currentSearchPageSize;

        if (attempted > this.currentSearch.length) {
            this.currentSearchIndex = this.currentSearch.length - this.currentSearchPageSize;
            this.renderSearch();
            return;
        }
        this.currentSearchIndex = attempted;
        this.renderSearch();
    }

    pageBack() {
        var attempted = this.currentSearchIndex - this.currentSearchPageSize;
        if (attempted < 0) {
            this.currentSearchIndex = 0;
            this.renderSearch();
            return;
        }
        this.currentSearchIndex = attempted;
        this.renderSearch();
    }

    setFilter(prop, value) {
        if (!value && value !== 0) {
            return;
        }
        this.currentFilter[prop] = value;
        this.preformSearch();
    }

    clearFilter() {
        this.currentFilter = this.getFilter();
        this.currentSearchIndex = 0;
        this.preformSearch();
    }

    getRender(newSearch) {
        if (newSearch || this.currentSearch.length === 0) {
            this.preformSearch();
        }
        return this.currentSearch.slice(this.currentSearchIndex, this.currentSearchIndex + this.currentSearchPageSize);
    }
}