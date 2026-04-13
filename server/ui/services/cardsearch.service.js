
export default class SearchFilter {
            /**
     * Initializes a new Cardsearch.service instance and prepares its internal state.
     * @param {Array} database The database value provides an input used by the cardsearch.service module.
     * @returns {void} Does not return a value.
     */
    constructor(database) {
        console.log('create search',database);
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
     * Gets filter used by the cardsearch.service module.
     * @returns {Object} Returns the value produced by the cardsearch.service module.
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
            /**
     * Executes the f attr race helper used by the cardsearch.service module.
     * @param {Object} obj The obj object supplies the structured input used by the cardsearch.service module, including the `attribute` and `race` properties.
     * @param {string} obj.attribute The `attribute` property supplies structured input used by the cardsearch.service module.
     * @param {string} obj.race The `race` property supplies structured input used by the cardsearch.service module.
     * @param {number} num The num value provides an input used by the cardsearch.service module.
     * @param {number} at The at value provides an input used by the cardsearch.service module.
     * @returns {boolean} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Executes the f level helper used by the cardsearch.service module.
     * @param {Object} obj The obj object supplies the structured input used by the cardsearch.service module, including the `level` property.
     * @param {(string|number)} obj.level The `level` property supplies structured input used by the cardsearch.service module.
     * @param {(string|number)} lv The lv value provides an input used by the cardsearch.service module.
     * @param {number} op The op value provides an input used by the cardsearch.service module.
     * @returns {boolean} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Executes the f scale helper used by the cardsearch.service module.
     * @param {Object} obj The obj object supplies the structured input used by the cardsearch.service module, including the `level` property.
     * @param {number} obj.level The `level` property supplies structured input used by the cardsearch.service module.
     * @param {number} sc The sc value provides an input used by the cardsearch.service module.
     * @param {number} op The op value provides an input used by the cardsearch.service module.
     * @returns {boolean} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Executes the f type helper used by the cardsearch.service module.
     * @param {Object} obj The obj object supplies the structured input used by the cardsearch.service module, including the `type` property.
     * @param {(string|number)} obj.type The `type` property supplies structured input used by the cardsearch.service module.
     * @param {number} ty The ty value provides an input used by the cardsearch.service module.
     * @returns {boolean} Returns the value produced by the cardsearch.service module.
     */
    fType(obj, ty) {

        var val = obj.type;
        return (val & ty) > 0;
    }

    //As Level, but for ATK/DEF
    //AD =1 is ATK, Else it's DEF being evaluated.
    // Num is the value to compare against.
            /**
     * Executes the f atk def helper used by the cardsearch.service module.
     * @param {Object} obj The obj object supplies the structured input used by the cardsearch.service module, including the `atk` and `def` properties.
     * @param {number} obj.atk The `atk` property supplies structured input used by the cardsearch.service module.
     * @param {number} obj.def The `def` property supplies structured input used by the cardsearch.service module.
     * @param {number} num The num value provides an input used by the cardsearch.service module.
     * @param {number} ad The ad value provides an input used by the cardsearch.service module.
     * @param {number} op The op value provides an input used by the cardsearch.service module.
     * @returns {boolean} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Executes the f name desc helper used by the cardsearch.service module.
     * @param {Object} obj The obj object supplies the structured input used by the cardsearch.service module, including the `desc` and `name` properties.
     * @param {string} obj.desc The `desc` property supplies structured input used by the cardsearch.service module.
     * @param {string} obj.name The `name` property supplies structured input used by the cardsearch.service module.
     * @param {string} txt The txt value provides an input used by the cardsearch.service module.
     * @param {number} nd The nd value provides an input used by the cardsearch.service module.
     * @returns {boolean} Returns the value produced by the cardsearch.service module.
     */
    fNameDesc(obj, txt, nd) {

        var val = (nd === 1) ? obj.name.toLowerCase() : obj.desc.toLowerCase();
        if (val.indexOf(txt.toLowerCase()) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    // Filters cards that have 'txt' in their name.
            /**
     * Filters name used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {string} txt The txt value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterName(cardsf, txt) {
        if (txt !== undefined) {

            var output = cardsf.filter((item) => {
                return this.fNameDesc(item, txt, 1);
            });
            return output;
        }
        return cardsf;
    }

            /**
     * Filters release used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {string} set The set value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterRelease(cardsf, set) {
        if (set === undefined) {
            return cardsf;
        }

                        /**
         * Executes the check helper used by the cardsearch.service module.
         * @param {Object} card The card value provides an input used by the cardsearch.service module.
         * @param {string} region The region value provides an input used by the cardsearch.service module.
         * @returns {boolean} Returns the value produced by the cardsearch.service module.
         */
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
            /**
     * Filters desc used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {string} txt The txt value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Filters type used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {string} type The type value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Filters attribute used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {string} attribute The attribute value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Filters race used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {string} race The race value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Executes the f setcode helper used by the cardsearch.service module.
     * @param {Object} obj The obj object supplies the structured input used by the cardsearch.service module, including the `setcode` property.
     * @param {(string|number)} obj.setcode The `setcode` property supplies structured input used by the cardsearch.service module.
     * @param {string} sc The sc value provides an input used by the cardsearch.service module.
     * @returns {boolean} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Executes the filte setcode helper used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {string} setcode The setcode value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Filters atk used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {number} atk The atk value provides an input used by the cardsearch.service module.
     * @param {number} op The op value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Filters def used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf array supplies the ordered values used by the cardsearch.service module, each item uses the `links` property.
     * @param {Array} cardsf[].links The `[].links` property describes data read from each item used by the cardsearch.service module.
     * @param {number} def The def value provides an input used by the cardsearch.service module.
     * @param {number} op The op value provides an input used by the cardsearch.service module.
     * @param {Array} links The links value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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
            /**
     * Filters level used by the cardsearch.service module.
     * @param {Array} cardsf The cardsf value provides an input used by the cardsearch.service module.
     * @param {number} level The level value provides an input used by the cardsearch.service module.
     * @param {number} op The op value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterLevel(cardsf, level, op) {
        if (level !== undefined) {
            var output = cardsf.filter((item) => {
                return this.fLevel(item, level, op);
            });
            return output;
        }
        return cardsf;
    }

            /**
     * Filters setcode used by the cardsearch.service module.
     * @param {Array} result The result value provides an input used by the cardsearch.service module.
     * @param {string} setcode The setcode value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterSetcode(result, setcode) {
        if (setcode) {
            return result.filter((item) => {
                return this.fSetcode(item, setcode);
            });
        } else {
            return result;
        }

    }

            /**
     * Filters limit used by the cardsearch.service module.
     * @param {Array} result The result array supplies the ordered values used by the cardsearch.service module, each item uses the `limit` property.
     * @param {number} result[].limit The `[].limit` property describes data read from each item used by the cardsearch.service module.
     * @param {number} limit The limit value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterLimit(result, limit) {
        if (limit !== undefined) {
            return result.filter((item) => {
                return item.limit === limit;
            });
        } else {
            return result;
        }
    }

            /**
     * Filters scale used by the cardsearch.service module.
     * @param {Array} result The result value provides an input used by the cardsearch.service module.
     * @param {number} scale The scale value provides an input used by the cardsearch.service module.
     * @param {number} op The op value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterScale(result, scale, op) {
        if (scale !== undefined) {
            return result.filter((item) => {
                return this.fScale(item, scale, op);
            });
        } else {
            return result;
        }
    }

            /**
     * Filters exact type used by the cardsearch.service module.
     * @param {Array} result The result array supplies the ordered values used by the cardsearch.service module, each item uses the `type` property.
     * @param {string} result[].type The `[].type` property describes data read from each item used by the cardsearch.service module.
     * @param {string} type The type value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterExactType(result, type) {
        if (type !== undefined) {
            return result.filter((item) => {
                return item.type === type;
            });
        } else {
            return result;
        }
    }

            /**
     * Filters token used by the cardsearch.service module.
     * @param {Array} result The result array supplies the ordered values used by the cardsearch.service module, each item uses the `type` property.
     * @param {string} result[].type The `[].type` property describes data read from each item used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    filterToken(result) {
        return result.filter((item) => {
            //item is not a token
            return item.type !== 16401;
        });
    }

            /**
     * Filters all used by the cardsearch.service module.
     * @param {Array} cards The cards value provides an input used by the cardsearch.service module.
     * @param {Object} filter The filter object supplies the structured input used by the cardsearch.service module, including the `atk`, `atkop`, `attribute`, `banlist`, `cardname`, `def`, `defop`, `description`, `exacttype`, `level`, `levelop`, `limit`, `links`, `race`, `release`, `scale`, `scaleop`, `setcode`, `type`, `type1`, and `type2` properties.
     * @param {number} filter.atk The `atk` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.atkop The `atkop` property supplies structured input used by the cardsearch.service module.
     * @param {string} filter.attribute The `attribute` property supplies structured input used by the cardsearch.service module.
     * @param {Array} filter.banlist The `banlist` property supplies structured input used by the cardsearch.service module.
     * @param {string} filter.cardname The `cardname` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.def The `def` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.defop The `defop` property supplies structured input used by the cardsearch.service module.
     * @param {string} filter.description The `description` property supplies structured input used by the cardsearch.service module.
     * @param {boolean} filter.exacttype The `exacttype` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.level The `level` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.levelop The `levelop` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.limit The `limit` property supplies structured input used by the cardsearch.service module.
     * @param {Array} filter.links The `links` property supplies structured input used by the cardsearch.service module.
     * @param {string} filter.race The `race` property supplies structured input used by the cardsearch.service module.
     * @param {string} filter.release The `release` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.scale The `scale` property supplies structured input used by the cardsearch.service module.
     * @param {number} filter.scaleop The `scaleop` property supplies structured input used by the cardsearch.service module.
     * @param {string} filter.setcode The `setcode` property supplies structured input used by the cardsearch.service module.
     * @param {string} filter.type The `type` property supplies structured input used by the cardsearch.service module.
     * @param {(string|number)} filter.type1 The `type1` property supplies structured input used by the cardsearch.service module.
     * @param {(string|number)} filter.type2 The `type2` property supplies structured input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
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


            /**
     * Executes the preform search helper used by the cardsearch.service module.
     * @returns {void} Does not return a value.
     */
    preformSearch() {
        this.currentSearch = this.filterAll(this.database, this.currentFilter);
        this.currentSearchPageSize= 60;
        this.currentSearchIndex = 0;
    }

            /**
     * Renders search used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    renderSearch() {
        this.render = this.currentSearch.slice(this.currentSearchIndex, this.currentSearchPageSize + this.currentSearchIndex);
        this.currentSearchNumberOfPages = Math.ceil(this.currentSearchIndex / this.currentSearchPageSize) || 1;
        this.maxPages = Math.ceil(this.currentSearch.length / this.currentSearchPageSize);
        return this.render;
    }

            /**
     * Executes the page forward helper used by the cardsearch.service module.
     * @returns {void} Does not return a value.
     */
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

            /**
     * Executes the page back helper used by the cardsearch.service module.
     * @returns {void} Does not return a value.
     */
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

            /**
     * Sets filter used by the cardsearch.service module.
     * @param {string} prop The prop value provides an input used by the cardsearch.service module.
     * @param {(string|number)} value The value value provides an input used by the cardsearch.service module.
     * @returns {void} Does not return a value.
     */
    setFilter(prop, value) {
        if (!value && value !== 0) {
            return;
        }
        this.currentFilter[prop] = value;
        this.preformSearch();
    }

            /**
     * Clears filter used by the cardsearch.service module.
     * @returns {void} Does not return a value.
     */
    clearFilter() {
        this.currentFilter = this.getFilter();
        this.currentSearchIndex = 0;
        this.preformSearch();
    }

            /**
     * Gets render used by the cardsearch.service module.
     * @param {boolean} newSearch The newSearch value provides an input used by the cardsearch.service module.
     * @returns {Array} Returns the value produced by the cardsearch.service module.
     */
    getRender(newSearch) {
        if (newSearch || this.currentSearch.length === 0) {
            this.preformSearch();
        }
        return this.currentSearch.slice(this.currentSearchIndex, this.currentSearchIndex + this.currentSearchPageSize);
    }
}
