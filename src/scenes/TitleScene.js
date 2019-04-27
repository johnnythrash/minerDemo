export default class TitleScene extends Phaser.Scene {
    constructor(){
        super({
            key: 'TitleScene'
        });
    }

    preload()
    {
      this.load.image('pauseOverlay', 'assets/images/pauseOverlay.png');
      this.load.image('startButton', 'assets/buttons/start.png');                        
    }

    create()
    {
      // load overlay background
      this.add.image(0,0,'pauseOverlay').setOrigin(0,0).setAlpha(0.6);       
      
      // game name text
      let canvas = this.sys.game.canvas;     
      let titleText = this.add.text ( (canvas.width/2)-150, (canvas.height/2)-250, 'bitcoinMiner', { fontFamily: 'verdana', fontSize: '48px', fill: '#000'} );
   
      // start game button
      let startButton = this.add.image((canvas.width/2)-10, titleText.y+160, 'startButton').setScale(0.25);
      startButton.setInteractive();
      startButton.on('pointerup', () =>{
        this.scene.start('MainGame');
      });
   
    }
}