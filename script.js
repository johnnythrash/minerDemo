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
  
  let player, topLayer, tiles, groundObj, topObj, coinObj, coins, score;
  
  const game = new Phaser.Game(config);
  const gameWidth = game.config.width, gameHeight = game.config.height;
  let generateRandom = (min,max) =>{
    return Math.floor(Math.random() * (max + min) + min);
  };
  
  function preload(){
    this.load.image('gradient', 'assets/retrogradient.png');
    this.load.image('coin','assets/sprites/star-coin.png');
    this.load.spritesheet('man', 'assets/sprites/adventurer-Sheet.png', {frameWidth: 50, frameHeight: 37 });
    this.load.spritesheet('tiles', 'assets/sprites/tiles.png',{frameWidth: 70, frameHeight: 70 });
  }
  
  
  function create(){
    
    // add background image
    this.add.image(224,300,'gradient');
   
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
   
   
    topLayerGroup = this.physics.add.staticGroup();
    dirtLayerGroup = this.physics.add.staticGroup();
    coinGroup = this.physics.add.staticGroup();
     
    // generate coins 
    for (let i = 0; i < 10; i++)
    {
      let x = generateRandom(0,490);
      let y = generateRandom(210,630);
      createSpriteGroup(x,y,'coin',[1],coinGroup, 'coinObj', true);
    }

    // draw top layer
    for (let x = 35; x < 490; x+=35)
    {
      createSpriteGroup(x, 210, 'tiles', [2], topLayerGroup, 'topObj');
    }

    // generate ground layers  
    for (let i = 0, y = 245; i < 11; i++)
    {
      for (let i = 0, x = 0; i < 14; i++)
      {
        createSpriteGroup(x,y,'tiles',[4],dirtLayerGroup,'groundObj');
        x+=35;
      }
      y+=35;
    }
   
    // make the player
    player = this.physics.add.sprite(10,140,'man');
    player.setCollideWorldBounds(true).setScale(2).setSize(15,15).setOffset(15,20);
  
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
    })
  
    // set up cursor
    cursors = this.input.keyboard.createCursorKeys();

    // collider function between player and ground
    function digDirt(player, group) {
      if (cursors.shift.isDown){
      group.disableBody(this, this);
      }
    }
    
    // add colliders
    this.physics.add.collider(player, topLayerGroup, digDirt);
    this.physics.add.collider(player, dirtLayerGroup, digDirt);

  
  }
  
  function update(){
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
    };
    
  
  }
  
  