/* @flow */
'use strict';

const CHANCES = Object.freeze(
{
    lost    : 0,
    tied    : 0.5,
    won     : 1
} );

// lol magic http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
const MAGIC = 400;

// http://en.wikipedia.org/wiki/Elo_rating_system#Most_accurate_K-factor
// USCF k-factors
const DEFAULT_KFACTOR = 32;

const DEFAULT_KFACTORS = ( rating ) =>
{
    if ( rating <= 2100 )
    {
        return DEFAULT_KFACTOR;
    }
    else if ( 2100 < rating && rating <= 2400 )
    {
        return 24;
    }
    else if ( 2400 < rating )
    {
        return 16;
    }
};

const processRating = Symbol();
const _kFactor      = Symbol();
const _min          = Symbol();
const _max          = Symbol();

class Elo
{
    constructor( kFactor=DEFAULT_KFACTOR, min=-Infinity, max=Infinity )
    {
        this[_kFactor] = kFactor;
        this[_min] = min;
        this[_max] = max;
    }


    getMin()
    {
        return this[_min];
    }


    setMin( minimum=-Infinity )
    {
        this[_min] = minimum;

        return this;
    }


    getMax()
    {
        return this[_max];
    }


    setMax( maximum=Infinity )
    {
        this[_max] = maximum;

        return this;
    }


    getKFactor( rating=0 )
    {
        if ( !isNaN( this[_kFactor] ) )
        {
            return this[_kFactor];
        }

        return DEFAULT_KFACTORS( rating );
    }

    setKFactor( kFactor=DEFAULT_KFACTOR )
    {
        this[_kFactor] = kFactor;

        return this;
    }


    odds( rating, opponentRating )
    {
        var difference = opponentRating - rating;

        return 1 / ( 1 + Math.pow( 10, difference / MAGIC ) );
    }


    ifWins( rating, opponentRating )
    {
        var odds = this.odds( rating, opponentRating );

        return this[processRating]( odds, CHANCES.won, rating );
    }


    ifLoses( rating, opponentRating )
    {
        var odds = this.odds( rating, opponentRating );

        return this[processRating]( odds, CHANCES.lost, rating );
    }


    ifTies( rating, opponentRating )
    {
        var odds = this.odds( rating, opponentRating );

        return this[processRating]( odds, CHANCES.tied, rating );
    }


    [processRating]( odds, actualScore, previousRating )
    {
        var difference  = actualScore - odds;
        var rating      = Math.round( previousRating +
                            this.getKFactor( previousRating ) * difference );

        if ( rating < this[_min] )
        {
            rating = this[_min];
        }
        else if ( rating > this[_max] )
        {
            rating = this[_max];
        }

        return rating;
    }
}

export default Elo;
