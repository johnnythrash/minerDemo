/*jshint esversion: 6 */


  // sprites and terrain
  let player, bottomLayerGroup, sideSprite, topLayer, tiles, groundObj, topObj, bottomObj;

  // coins 
  let coinObj, coins, coinQuantity, coinsLeft = 0;
  
  // keyboard keys
  let ctrl, xKey, distToCoin;
  
  // text, music, score, and timer
  let score = 0, timer, elapsed = 0, endText, counter, coinCollectSound, pauseText; 

  // background music
  let music = {};
  
  var MainGame = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function MainGame (){
      Phaser.Scene.call(this, { key: 'mainGame'});
    },

    init: function (){

    },

    preload: function(){
      let width = this.cameras.main.width;
      let height = this.cameras.main.height; 
      let progressBar = this.add.graphics();
      let progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(80, 270, 320, 50);
      let loadingText = this.make.text({
        x: width/2,
        y: height/2 -50,
        text: 'Loading...',
        style: {
          font: '20px monospace',
          fill: '#ffffff'
        }
      });
      loadingText.setOrigin(0.5,0.5);
      let percentText = this.make.text({
        x: width/2,
        y: height/2 +20,
        text: "0%",
        style: {
          font: '18px monospace',
          fill: '#ffffff'
        }
      });
      percentText.setOrigin(0.5,0.5);
      let assetText = this.make.text({
        x: width/2,
        y: height/2+50,
        text: '',
        style: {
          font: '18px monospace',
          fill: '#ffffff'
        }
      });
      assetText.setOrigin(0.5,0.5);

      this.load.on('progress', function(value){
        percentText.setText(parseInt(value*100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect((80), 280,300*value, 30);
      });

      this.load.on('fileprogress', function(file){
        assetText.setText('Loading asset: ' + file.key);
      });

      this.load.on('complete', function(){
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
      });

      this.load.audio('coinCollectSound', 'assets/sounds/coin.wav');
      this.load.audio('bgm1', 'assets/music/falco.mp3');
      this.load.audio('bgm2', 'assets/music/africa.mp3');
      this.load.audio('bgm3', 'assets/music/bsbiwantit.mp3');
      this.load.audio('bgm4', 'assets/music/everybody_wants.mp3');
      this.load.audio('bgm5', 'assets/music/fiveonit.mp3');
      this.load.image('bg', 'assets/backgroundImage.png');
      this.load.image('side','assets/backgroundImage.png');
      this.load.image('coin','assets/sprites/star-coin.png');
      this.load.spritesheet('man', 'assets/sprites/adventurer-Sheet.png', {frameWidth: 50, frameHeight: 37 });
      this.load.spritesheet('tiles', 'assets/sprites/tiles.png',{frameWidth: 70, frameHeight: 70 });
    },
    
  
    create: function(){

      // keyboard listeners
      ctrl = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
      xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      
      // add background music
      for (let i = 1; i < 6; i++){
        music['song'+i] = this.sound.add('bgm'+i, {loop: true});
      }

      //play random song on start 
      music.nowPlaying = music['song'+ Phaser.Math.Between(1,5)];
      music.nowPlaying.play();
      
      // add sound fx
      coinCollectSound = this.sound.add('coinCollectSound');

      // add background image
      this.add.image(735,630,'bg');
    
      // create timer
      timer = this.time.addEvent({
        delay: 60000,
        loop: false
      });

      // add side sprites for bounding
      sideSprite = this.physics.add.staticGroup();
      sideSprite.create(-735,630,'side');
      sideSprite.create(2205,630,'side');

      // create sprite groups function
      let createSpriteGroup = (x,y,sprite,frame,objectType,objectGroup, height=false, depth= 0)=>{
        objectGroup = objectType.create(x,y,sprite,frame);
        objectGroup.width = 35; 
        objectGroup.height = 35;
        if (height === true){
          objectGroup.displayHeight = 32;
          objectGroup.displayWidth = 32;
        }
    
        if (depth !==0){
          objectGroup.setDepth(depth);
        }
        return objectGroup;
      };
    
      bottomLayerGroup = this.physics.add.staticGroup();
      topLayerGroup = this.physics.add.staticGroup();
      dirtLayerGroup = this.physics.add.staticGroup();
          
      // draw top layer
      for (let x = 35; x < 1470; x+=35)
      {
        createSpriteGroup(x, 210, 'tiles', [2], topLayerGroup, 'topObj',false,1);
      }

      // generate dirt layers  
      for (let i = 0, y = 245; i < 28; i++)
      {
        for (let j = 0, x = 0; j < 42; j++)
        {
        createSpriteGroup(x,y,'tiles',[4],dirtLayerGroup,'groundObj',false,1);
          x+=35;
        }
        y+=35;
      }

      // generate lower ground tiles
      for (let j = 0, x = 0; j < 42; j++)
          {
            createSpriteGroup(x,1225,'tiles',[14],bottomLayerGroup,'bottomObj',false,1);
            x+=70;
          }

      // generate coins 
      coinQuantity = 10;
      coinsLeft = coinQuantity;
      coinGroup = this.physics.add.staticGroup();
      function generateCoins(coinQuantity){ 
        let max = dirtLayerGroup.getChildren().length-1;
        for (let x = 0; x < coinQuantity; x++){
          let index = Phaser.Math.RND.between(0, max);
          let x = dirtLayerGroup.getChildren()[index].x+17.5;
          let y = dirtLayerGroup.getChildren()[index].y+17.5;
          let newObj = coinGroup.create(x,y,'coin');
          newObj.setDepth(0);
            }
      }
    
      generateCoins(coinQuantity);
      
      // ping for coins
      distToCoin = (x,y,distance) => {
        let coins = coinGroup.getChildren();
        let dirt = dirtLayerGroup.getChildren();
        for (let i = 0; i < coins.length; i++){
          if(coins[i].active && Phaser.Math.Distance.Between(x,y, coins[i].x,coins[i].y) <= distance){
            let closestX = coins[i].x, closestY = coins[i].y;
            for (let i = 0; i < dirt.length; i++){
            if (dirt[i].x === closestX+17.5 && dirt[i].y === closestY+17.5){
                dirt[i].setTint(0xff0000);
              }
            }
          }
        }
      };
      
      // make the player
      player = this.physics.add.sprite(45,140,'man');
      player.setCollideWorldBounds(false).setScale(2).setSize(15,15).setOffset(15,20);
    
      // player animations
      this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('man', { start: 0, end: 3 }),
        frameRate: 10,
      });
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('man', { start: 8, end: 12}),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: 'swipe',
        frames: this.anims.generateFrameNumbers('man', { start: 26, end: 29}),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: 'crouch',
        frames: [{key:'man', frame: 59}],
        frameRate: 20
      });
      this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('man', { start:14, end: 21 }),
        frameRate: 10,
        repeat: -1
      });
    
      // camera views
      this.cameras.main.setViewport(0,0,490,630);
      this.cameras.main.startFollow(player);
      this.cameras.main.setBounds(0,0,1470,1260);

      // set up cursor
      cursors = this.input.keyboard.createCursorKeys();

      // collider function between player and ground
      let digDirt = (player, group) => {
        let touching = group.body.touching;
        if (cursors.shift.isDown){
          if (touching.left === true && cursors.right.isDown) {
              group.disableBody(this,this);
          } else if (touching.up === true && cursors.down.isDown){
              group.disableBody(this,this);
          } else if (touching.right === true && cursors.left.isDown){
              group.disableBody(this,this);
          } else if (touching.down === true && cursors.up.isDown){
              group.disableBody(this,this);
          }
          }    
        };

          
      // collect coin function
      let collectCoin = (player,group) => {
        if (ctrl.isDown){
        group.disableBody(this,this);
        coinCollectSound.play();
        score += 10;
        coinsLeft--;
        scoreText.setText('Score: ' + score);
        coinsText.setText('Coins Left: ' + coinsLeft);
        }
      };

      // add colliders and overlaps
      this.physics.add.collider(player, topLayerGroup, digDirt);
      this.physics.add.collider(player, dirtLayerGroup, digDirt);
      this.physics.add.collider(player, sideSprite);
      this.physics.add.collider(player, bottomLayerGroup);
      this.physics.add.overlap(player, coinGroup, collectCoin, null, this);

      // screen text
      scoreText = this.add.text(16, 10, 'Score: 0', { fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
      scoreText.setScrollFactor(0).setDepth(2);
      coinsText = this.add.text( 16,40, 'Coins Left: '+ coinsLeft, { fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
      coinsText.setScrollFactor(0).setDepth(2);
      timerText = this.add.text( 16,70,'Time Remaining: ' + elapsed, {fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
      timerText.setScrollFactor(0).setDepth(2);
      pauseText = this.add.text( 425, 10, 'Pause', {fontFamily: 'verdana', fontSize: '18px', fill: '#fff', 'align': 'right'});
      pauseText.setScrollFactor(0).setDepth(3).setInteractive();
      

      // pause the game on click
      pauseText.on('pointerup', () => {
        pauseText.visible = false;
        this.scene.pause();
        this.scene.launch('pauseScene', { nowPlaying: music.nowPlaying, gameState: 'paused' });
      });
      
      // resume handler
      //  events.on('resume', (data) => {
      //   console.log(data);
      //   music.nowPlaying = data.nowPlaying;
      //   console.log("resumed... " + music.nowPlaying);
      // });

    },
    
    update: function(){


      // controls
      if (cursors.left.isDown && player.body.onFloor()){
        player.body.setVelocityX(-200);
        player.anims.play('walk',true);
        player.flipX = true;
      } else if (cursors.left.isDown){
        player.body.setVelocityX(-200);
        player.flipX = true;
      } else if (cursors.right.isDown && player.body.onFloor()){
        player.body.setVelocityX(200);
        player.anims.play('walk',true);
        player.flipX = false;
      } else if (cursors.right.isDown){
        player.body.setVelocityX(200);
        player.flipX = false;
      } else if (cursors.down.isDown){
        player.anims.play('crouch',true);
      } else{
      player.body.setVelocityX(0);
      player.anims.play('idle', true);
      }
      if (( cursors.space.isDown || cursors.up.isDown) && player.body.onFloor()){
        player.setVelocityY(-300);
        player.anims.play('jump',true);
      }
      if (!player.body.onFloor()){
        player.anims.play('jump',true);
      }
      
      // ping for coin locations
      if (xKey.isDown){
        distToCoin(player.x,player.y,250);
      }

      // show pause text when returning from pause screen
      if (!pauseText.visible){
        pauseText.visible = true;
      }

      // timer
      counter = timer.getElapsedSeconds().toString().substr(0,2);
      timerText.setText('Time Remaining: ' + (60 - counter));

      // end game when time is up or coins are collected
      if (counter == '60' || coinsLeft == 0){
        this.scene.launch("pauseScene", { gameState: 'lose'});
        // music.nowPlaying.stop();
        // this.physics.pause();
        // player.alpha = 0;
        // endText = this.add.text(16, 315, 'GAME OVER', { fontFamily: 'verdana', fontSize: '36px', fill: '#f44242'});
        // endText.setScrollFactor(0).setDepth(2);
        if (coinsLeft == 0){
          this.scene.launch("pauseScene", { gameState: 'win'})
          //       endText = this.add.text(16, 315, 'GAME OVER: YOU WIN!!', { fontFamily: 'verdana', fontSize: '36px', fill: '#f44242'});
        // endText.setScrollFactor(0).setDepth(2);
        }
        
        // restartText = this.add.text(16, 380, 'click to restart', { fontFamily: 'verdana', fontSize: '36px', fill: '#f44242'});
        // restartText.setScrollFactor(0).setDepth(2).setInteractive();
        // restartText.on('pointerup', () => {
        //   this.scene.restart();
        // });
      }
    } 
  });

  var PauseScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function PauseScene(){
      Phaser.Scene.call(this, { key: 'pauseScene'});
    },

    init: function (data){
      this.nowPlaying = data.nowPlaying;
      this.gameState = data.gameState;
    },

    preload: function(){
      this.load.image('pauseOverlay', 'assets/images/pauseOverlay.png');
    },

    create: function(){
      pauseOverlay = this.add.image(0,0, 'pauseOverlay').setOrigin(0,0).setAlpha(0.6);
    
      let resumeText = this.add.text( 343, 10, 'Resume', { fontFamily: 'verdana', fontSize: '18px', fill: '#000'});
      resumeText.setInteractive();
      resumeText.on('pointerup', () =>{
      this.scene.resume('mainGame', { nowPlaying : this.nowPlaying});
      this.nowPlaying.resume();
      this.scene.sleep();
      });
      let canvas = this.sys.game.canvas;
      if (this.gameState === 'win'){
        let gameWinText = this.add.text ( (canvas.width/2)-100, canvas.height/2, ' You Win!', { fontFamily: 'verdana', fontSize: '48px', fill: '#000'} );
        let restartText = this.add.text(gameWinText.x+100, gameWinText.y+130, "Restart",  { fontFamily: 'verdana', fontSize: '18px', fill: '#000'});
        restartText.setInteractive();
        restartText.on('pointerup', () =>{
          this.nowPlaying.stop();
          this.scene.start('mainGame');
        });
      } else if (this.gameState === 'lose'){
        let gameWinText = this.add.text ( (canvas.width/2)-100, canvas.height/2, ' You Lose!', { fontFamily: 'verdana', fontSize: '48px', fill: '#000'} );
        let restartText = this.add.text(gameWinText.x+100, gameWinText.y+130, "Restart",  { fontFamily: 'verdana', fontSize: '18px', fill: '#000'});
        restartText.setInteractive();
        restartText.on('pointerup', () =>{
          this.nowPlaying.stop();
          this.scene.start('mainGame');
        });
      } else if (this.gameState === 'paused'){
      let gamePausedText = this.add.text ( (canvas.width/2)-100, canvas.height/2, ' Paused', { fontFamily: 'verdana', fontSize: '48px', fill: '#000'} );
      }
      let restartText = this.add.text(343, resumeText.y+30, "Restart",  { fontFamily: 'verdana', fontSize: '18px', fill: '#000'});
      restartText.setInteractive();
      restartText.on('pointerup', () =>{
        this.nowPlaying.stop();
        this.scene.start('mainGame');
      });
      let pauseMusicToggleText = this.add.text(343, restartText.y+30, "Music: Playing" ,  { fontFamily: 'verdana', fontSize: '18px', fill: '#000'});
      pauseMusicToggleText.setInteractive();
      pauseMusicToggleText.on('pointerup', () =>{
        console.log(this.nowPlaying.key, this.nowPlaying);
        if (this.nowPlaying.isPlaying){
          console.log("pausing music...");
          this.nowPlaying.pause();
          pauseMusicToggleText.setText("Music: Paused");        
        } else if (this.nowPlaying.isPaused) {
            console.log("unpausing music...");
            this.nowPlaying.resume();
            pauseMusicToggleText.setText("Music: Playing");
        }
      });
      let muteSoundsToggleText = this.add.text(343, pauseMusicToggleText.y+30, "Sounds: On" ,  { fontFamily: 'verdana', fontSize: '18px', fill: '#000'});
      muteSoundsToggleText.setInteractive();
      muteSoundsToggleText.on('pointerup', () =>{
       if (coinCollectSound.config.mute){
         coinCollectSound.config.mute = false;
         muteSoundsToggleText.setText("Sounds: Off");
       } else if (!coinCollectSound.config.mute){
         coinCollectSound.config.mute = true;
         muteSoundsToggleText.setText("Sounds: On");
         }
      });
      let changeSongText = this.add.text(343, muteSoundsToggleText.y+30, "Change Song" ,  { fontFamily: 'verdana', fontSize: '18px', fill: '#000'});
      changeSongText.setInteractive();
      changeSongText.on('pointerup', () =>{
        this.nowPlaying.stop();
        this.nowPlaying =  music['song'+ Phaser.Math.Between(1,5)];
        this.nowPlaying.play();
        console.log("changed song to: " + this.nowPlaying.key);
      });
    }
  });
  


const config = {
  type: Phaser.Auto,
  width: 490,
  height: 630,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y:300 },
      debug: true
    }
  },
  scene: [MainGame, PauseScene]
};

// game
const game = new Phaser.Game(config);