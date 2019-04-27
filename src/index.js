import 'phaser';
import BestTime from './scenes/BestTime.js';
import TitleScene from './scenes/TitleScene.js';
import MainGame from './scenes/MainGame.js';
import PauseScene from './scenes/PauseScene.js';



const config = {
  type: Phaser.Auto,
  width: 490,
  height: 630,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y:300 },
      debug: false
    }
  },
  scene: [TitleScene, MainGame, PauseScene]
};

// game
const game = new Phaser.Game(config);
