'use strict';

var Elo    = require( './index.js' );
var expect = require( 'chai' ).expect;

describe( 'elo-js', function()
{
    it( 'should only work with new', function()
    {
        expect( new Elo() ).to.be.ok;
        expect( Elo ).to.throw();
        [
            'getMin',
            'setMin',
            'getMax',
            'setMax',
            'getKFactor',
            'setKFactor',
            'odds',
            'ifWins',
            'ifLoses',
            'ifTies'
        ].forEach( function( fn )
        {
            expect( this[fn] ).to.be.a.function;
        }, new Elo() );
    } );

    it( 'can be called without parameters', function()
    {
        var elo = new Elo();

        expect( elo.getKFactor() ).to.be.equal( 32 );
        expect( elo.getMin() ).to.be.equal( -Infinity );
        expect( elo.getMax() ).to.be.equal( Infinity );
    } );

    it( 'can be called with parameters', function()
    {
        var elo = new Elo( 30, 0, 1000000 );

        expect( elo.getKFactor() ).to.be.equal( 30 );
        expect( elo.getMin() ).to.be.equal( 0 );
        expect( elo.getMax() ).to.be.equal( 1000000 );
    } );

    it( 'can be changed with setMax, setMin and setKFactor', function()
    {
        var elo = new Elo( 30, 0, 1000000 );

        expect( elo.setKFactor().getKFactor() ).to.be.equal( 32 );
        expect( elo.setMin().getMin() ).to.be.equal( -Infinity );
        expect( elo.setMax().getMax() ).to.be.equal( Infinity );
    } );

    it( 'can evaluate wins, losses and ties between 2 players', function()
    {
        var elo = new Elo();
        var player1Rating = 1200;
        var player2Rating = 1250;

        expect( elo.ifWins( player1Rating, player2Rating ) ).to.be.a.number;
        expect( elo.ifLoses( player1Rating, player2Rating ) ).to.be.a.number;
        expect( elo.ifTies( player1Rating, player2Rating ) ).to.be.a.number;
    } );


    it( 'can be used to rank players', function()
    {
        var elo = new Elo();
        var player1Rating = 1200;
        var player2Rating = 1250;

        expect( elo.odds( player1Rating, player2Rating ) ).to.be.within( 0, 1 );
        expect( elo.ifWins( player1Rating, player2Rating ) ).to.be.above( player1Rating );
        expect( elo.ifLoses( player1Rating, player2Rating ) ).to.be.below( player1Rating );

        expect( elo.odds( player2Rating, player1Rating ) ).to.be.within( 0, 1 );
        expect( elo.ifWins( player2Rating, player1Rating ) ).to.be.above( player2Rating );
        expect( elo.ifLoses( player2Rating, player1Rating ) ).to.be.below( player2Rating );

        expect( elo.ifWins( player1Rating, player2Rating ) - player1Rating ).to.be.above( elo.ifWins( player2Rating, player1Rating ) - player2Rating );
        expect( player1Rating - elo.ifLoses( player1Rating, player2Rating ) ).to.be.below( player2Rating - elo.ifLoses( player2Rating, player1Rating ) );
        expect( player1Rating - elo.ifTies( player1Rating, player2Rating ) ).to.be.below( player2Rating - elo.ifTies( player2Rating, player1Rating ) );
    } );
} );