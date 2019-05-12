# minerDemo

run through the map, dig up dirt, and collect the coins hidden behind them. see how fast you can collect all of the coins. avoid being crushed by the boulders.

## about

- currently in development.
- developed with [thequietriot](https://github.com/thequietriot).
- made with [phaser 3](https://www.phaser.io/phaser3).
- this is our first game and we're doing this in our spare time so it may take forever to finish.

## getting started

### prerequisites

- node & npm [https://nodejs.org/en](https://nodejs.org/en)
- a web browser

this works best using MacOS or Linux.  If you need to run this on a Windows machine you should use WSL.

### installing

(this will allow you to run a local development version of the game)

#### 1. clone the repo:

move to your workspace directory  
run:  
`$ git clone https://github.com/johnnythrash/bitcoinminer`

#### 2. install dependencies  

  move to cloned repo directory and install dependencies with npm  
  run:  
 `$ cd bitcoinminer`  
 `$ npm install`

#### 3. start development server

   run:  
  `$ npm start run:dev`
  
  you can now access the game from a browser at `http://localhost:8082` or `http://your.computers.ip:8082`

## how to play

key | function
----|----
`arrow keys` | move the character
`shift` + `arrow key` | remove dirt tile in the direction you are facing
`q` | build ladder when below ground level
`x` | ping for coins (if any coins are close, the dirt tile over the coin will turn red)
`ctrl` | collect coin

## todo

- new art
- animations for ~~digging~~ and climbing
- store best times
- fix lots of bugs