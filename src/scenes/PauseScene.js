export default class PauseScene extends Phaser.Scene{
  constructor(data)
  {
    super({
      key: 'PauseScene'
    });
    
  }

  init (data)
  {
    this.nowPlaying = data.nowPlaying;
    this.gameState = data.gameState;
    this.time = data.time;
    this.music = data.musicObj;
    this.coinCollectSound = data.coinCollectSound;
    this.score = data.score;
  }

  preload()
  {
    this.load.image('pauseOverlay', 'assets/images/pauseOverlay.png');
    this.load.image('restartButton', 'assets/buttons/restart.png');
    this.load.image('resumeButton', 'assets/buttons/resume.png');
    this.load.image('toggleMusic', 'assets/buttons/toggleMusic.png');
    this.load.image('toggleSounds', 'assets/buttons/toggleSounds.png');
    this.load.image('changeSong', 'assets/buttons/changeSong.png'); 
  }

  create()
  {
      // for positioning things
      let canvas = this.sys.game.canvas;

      // load background image (just a white rectangle)
      this.add.image(0,0, 'pauseOverlay').setOrigin(0,0).setAlpha(0.6);

      let coinCollectSound = this.coinCollectSound;
      let score = this.score;
      // show what song is currently playing
      let songName;
      let nowPlayingText = this.add.text(16, canvas.height-40,"Now Playing: ", { fontFamily: 'monospace', fontSize: '16px', fill:'#000'});
      let songBank = {'bgm1':'falco','bgm2':'africa','bgm3':'bsb','bgm4':'tears4fears','bgm5':'igot5onit'};
      let findName = () =>{
        for (let key in songBank){
          if (this.nowPlaying.key === key){
           songName = songBank[key];
          nowPlayingText.setText("Now Playing: " + songName);
          }
        }
      };
      if (typeof this.nowPlaying !== "undefined"){
      findName();
      }

      // let player know game is paused
      let gameStatusText = this.add.text ( (canvas.width/2)-100, (canvas.height/2)-250, '', { fontFamily: 'verdana', fontSize: '48px', fill: '#000'} );
      if (this.gameState == 'paused'){
        gameStatusText.setText(' Paused');
      }

      // pause menu buttons

      // resume game button
      let resumeButton = this.add.image( canvas.width/2,gameStatusText.y+160, 'resumeButton').setScale(0.25);
      resumeButton.setInteractive();
      resumeButton.on('pointerup', () =>{
        this.scene.resume('MainGame');
        this.scene.sleep();
      });

      // restart game button
      let restartButton = this.add.image(canvas.width/2, resumeButton.y+60, 'restartButton').setScale(0.25);
      restartButton.setInteractive();
      restartButton.on('pointerup', () =>{
        this.nowPlaying.stop();
        this.scene.start('MainGame');
      });

      // toggle background music button
    //  let toggleMusicButton = this.toggleMusicButton; 
      this.toggleMusicButton = this.add.image(restartButton.x,restartButton.y+60, 'toggleMusic').setScale(0.25);
      this.toggleMusicButton.setInteractive();
      this.toggleMusicButton.on('pointerup', () =>{
        if (this.nowPlaying.isPlaying){
          this.nowPlaying.pause();
        } else if (this.nowPlaying.isPaused) {
            this.nowPlaying.resume();
        }
      });

      // toggle sound fx button
     
      this.toggleSoundsButton = this.add.image(this.toggleMusicButton.x,this.toggleMusicButton.y+60,'toggleSounds').setScale(0.25);
      this.toggleSoundsButton.setInteractive();
      this.toggleSoundsButton.on('pointerup', () =>{
       if (coinCollectSound.config.mute){
         coinCollectSound.config.mute = false;
         this.toggleSoundsButton.setTint(0xA0A0A0);
       } else if (!this.coinCollectSound.config.mute){
         coinCollectSound.config.mute = true;
         this.toggleSoundsButton.clearTint();

         }
      });

      // change background music button
      let changeSongButton = this.changeSongButton;
      changeSongButton = this.add.image(this.toggleSoundsButton.x,this.toggleSoundsButton.y+60,'changeSong').setScale(0.25);
      changeSongButton.setInteractive();
      changeSongButton.on('pointerup', () =>{
        this.nowPlaying.stop();
        this.nowPlaying =  this.music['song'+ Phaser.Math.Between(1,5)];
        this.nowPlaying.play();
        console.log("changed song to: " + this.nowPlaying.key);
        findName();
      });


    //  let checkHighScore = (score) =>{
    //   console.log("game won, checking score against database...");
    //     fetch('http://localhost:9999/time')
    //     .then(response =>{
    //         return response.json();
    //       })
    //       .then(json => {
    //         // TODO -- compare this against scores on server 
    //       });

    //   }
      // tell the player how long it took to collect the coins
      let time = this.time;
      let timeText = this.add.text( gameStatusText.x-20, gameStatusText.y+70, 'Your Time: '+time, { fontFamily: 'verdana', fontSize: '24px', fill: '#000'} );
      timeText.visible = false;
      
      // check to see if the player won, lost, or paused and show appropriate text
      if (this.gameState ==='win'){
        
        checkHighScore(score);
        gameStatusText.setText("You Win!");
        timeText.visible = true;
        resumeButton.removeInteractive();
      } else if (this.gameState === 'lose'){
        gameStatusText.setText("You Lose!");   // a relic from a more simple time. Keeping this in just in case.
        resumeButton.removeInteractive();
      } else if (this.gameState === 'crush'){
        gameStatusText.setText("Crushed!");
        this.nowPlaying.stop();
        resumeButton.removeInteractive();
      }
  }

  update () 
  {
    // grey out toggle buttons for music and sound when they are disabled
    if (this.coinCollectSound !== undefined){
      if (this.coinCollectSound.config.mute){
        this.toggleSoundsButton.setTint(0xA0A0A0);
      } else if (!this.coinCollectSound.config.mute){
        this.toggleSoundsButton.clearTint();
        }
    }

    this.nowPlaying.isPlaying?this.toggleMusicButton.clearTint():this.toggleMusicButton.setTint(0xA0A0A0);
    
  }


}