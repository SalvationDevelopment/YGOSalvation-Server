# Elo-js [![Build Status](https://travis-ci.org/nicolasbrugneaux/elo-js.svg?branch=master)](https://travis-ci.org/nicolasbrugneaux/elo-js)

This is a small implemention of the [Elo system](http://en.wikipedia.org/wiki/Elo_rating_system). Based on wikipeda's information.

Trying to use ES6 features such as class to be fancy.

## Installation

```
npm install elo-js
```

## Usage

#### Browser

requireJS and browserify compatible.

```html
<script src="elo-js/index.js"></script>

<script>
  var elo = new Elo();

  var player1Rating = 1200;
  var player2Rating = 1250;

  var newPlayer1Rating  = elo.ifWins( player1Rating, player2Rating );
  newPlayer1Rating      = elo.ifLoses( player1Rating, player2Rating );
  newPlayer1Rating      = elo.ifTies( player1Rating, player2Rating );
</script>
```

#### Node

```js
  var Elo = require( 'elo-js' );
  var elo = new Elo();

  var player1Rating = 1200;
  var player2Rating = 1250;

  var newPlayer1Rating  = elo.ifWins( player1Rating, player2Rating );
  newPlayer1Rating      = elo.ifLoses( player1Rating, player2Rating );
  newPlayer1Rating      = elo.ifTies( player1Rating, player2Rating );
```

## Contribute

Any idea, remarks? Fill an issue, drop a mail, feel free! :heart:

## Build from source

```sh
git clone https://github.com/nicolasbrugneaux/elo-js.git
cd elo-js
npm install
gulp # watch src and runs tests
```
