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
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  let player, bottomLayerGroup, sideSprite, topLayer, tiles, groundObj, topObj, coinObj, bottomObj, coins, score = 0, coinsLeft = 0, coinQuantity, timer, elapsed= 0, endText, restartText, counter,bgm;
  
  const game = new Phaser.Game(config);
  const gameWidth = game.config.width, gameHeight = game.config.height;

  function preload(){
    this.load.audio('coin', 'assets/sounds/coin.wav');
    this.load.audio('bgm', 'assets/sounds/bgm.mp3');
    this.load.image('bg', 'assets/backgroundImage.png');
    this.load.image('side','assets/backgroundImage.png');
    this.load.image('coin','assets/sprites/star-coin.png');
    this.load.spritesheet('man', 'assets/sprites/adventurer-Sheet.png', {frameWidth: 50, frameHeight: 37 });
    this.load.spritesheet('tiles', 'assets/sprites/tiles.png',{frameWidth: 70, frameHeight: 70 });
  }
  
  
  function create(){
    // add background music
    bgm = this.sound.add('bgm', {loop: true});
    bgm.play();

    // add background image
    this.add.image(735,630,'bg');
   
    // create timer
    timer = this.time.addEvent({
      delay: 60000,
      // callback: endGame(),
      // callbackScope: this,
      loop: false
    });

    // add side sprites for bounding
    sideSprite = this.physics.add.staticGroup();
    sideSprite.create(-735,630,'side');
    sideSprite.create(2205,630,'side');

    // create sprite groups function
    let createSpriteGroup = (x,y,sprite,frame,objectType,objectGroup, height=false)=>{
      objectGroup = objectType.create(x,y,sprite,frame);
      objectGroup.width = 35; 
      objectGroup.height = 35;
      if (height === true){
        objectGroup.displayHeight = 32;
        objectGroup.displayWidth = 32;
      }
      return objectGroup;
    };
   
    bottomLayerGroup = this.physics.add.staticGroup();
    topLayerGroup = this.physics.add.staticGroup();
    dirtLayerGroup = this.physics.add.staticGroup();
        
    // generate coins 
    coinQuantity = 10;
    /*coinGroup = this.physics.add.group({
      key: 'coin',
      allowGravity: false,
      frameQuantity: coinQuantity
    });*/ 
    coinsLeft = coinQuantity;

    coinGroup = this.physics.add.staticGroup();


   // let rect = new Phaser.Geom.Rectangle(0,140,1470,980);
   //var g1 = this.add.grid(0,175,1470,980,35,35,0xff0000,0.5,0x00b9f2,0.5).setOrigin(0,0); //TODO Align grid with ground tiles
    //TODO Align coins with grid
   //Phaser.Actions.RandomRectangle(coinGroup.getChildren(), rect);
   // Phaser.Actions.GridAlign(coinGroup.getChildren(), g1);

    // draw top layer
    for (let x = 35; x < 1470; x+=35)
    {
      createSpriteGroup(x, 210, 'tiles', [2], topLayerGroup, 'topObj');
    }

    // generate dirt layers  
    for (let i = 0, y = 245; i < 28; i++)
    {
      for (let j = 0, x = 0; j < 42; j++)
      {
       createSpriteGroup(x,y,'tiles',[4],dirtLayerGroup,'groundObj');
        x+=35;
      }
      y+=35;
    }

    // generate lower ground tiles
    for (let j = 0, x = 0; j < 42; j++)
        {
          createSpriteGroup(x,1225,'tiles',[14],bottomLayerGroup,'bottomObj');
          x+=70;
        }
        // for (let i = 0; i < coinQuantity; i++){
        //   let x = Phaser.Math.RND.between(0,294)*5;
        //   let y = Phaser.Math.RND.between(35,196)*5;
        // var newObj = coinGroup.create(x,y,'coin',[0]);
        // }
     //   console.log(dirtLayerGroup.getChildren()[3].x, dirtLayerGroup.getChildren()[3].y);
    
      function generateCoins(coinQuantity){ 
        let max = dirtLayerGroup.getChildren().length;
        
        for (let x = 0; x < coinQuantity; x++){
          let index = Phaser.Math.RND.between(0, max);
          let x = dirtLayerGroup.getChildren()[index].x+17.5;
          let y = dirtLayerGroup.getChildren()[index].y+17.5;
          let newObj = coinGroup.create(x,y,'coin', [0]);
           }
      }
      generateCoins(coinQuantity);
    
    
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
      group.disableBody(this,this);
      this.sound.play('coin');
      score += 10;
      coinsLeft--;
      scoreText.setText('Score: ' + score);
      coinsText.setText('Coins Left: ' + coinsLeft);
    };

    // add colliders and overlaps
    this.physics.add.collider(player, topLayerGroup, digDirt);
    this.physics.add.collider(player, dirtLayerGroup, digDirt);
    this.physics.add.collider(player, sideSprite);
    this.physics.add.collider(player, bottomLayerGroup);
    this.physics.add.overlap(player, coinGroup, collectCoin, null, this);

    // screen text
    scoreText = this.add.text(16, 10, 'Score: 0', { fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
    scoreText.setScrollFactor(0);
    coinsText = this.add.text( 16,40, 'Coins Left: '+ coinsLeft, { fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
    coinsText.setScrollFactor(0);
    timerText = this.add.text( 16,70,'Time Remaining: ' + elapsed, {fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
    timerText.setScrollFactor(0);

  }
  
  function update(){
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

    // timer
    counter = timer.getElapsedSeconds().toString().substr(0,2);
    timerText.setText('Time Remaining: ' + (60 - counter));
  
    if (counter == '60' || coinsLeft == 0){
      bgm.stop();
      this.physics.pause();
      player.alpha = 0;
      endText = this.add.text(16, 315, 'GAME OVER', { fontFamily: 'verdana', fontSize: '36px', fill: '#f44242'});
      endText.setScrollFactor(0);
      if (coinsLeft == 0){
            endText = this.add.text(16, 315, 'GAME OVER: YOU WIN!!', { fontFamily: 'verdana', fontSize: '36px', fill: '#f44242'});
      endText.setScrollFactor(0);
      }
      
      restartText = this.add.text(16, 380, 'click to restart', { fontFamily: 'verdana', fontSize: '36px', fill: '#f44242'});
      restartText.setScrollFactor(0).setInteractive();
      restartText.on('pointerup', () => {
    
        this.scene.restart();
      });
    }


  }
  
  