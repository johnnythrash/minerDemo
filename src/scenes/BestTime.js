export default class BestTime extends Phaser.Scene {
    constructor()
    {
        super({
            key: 'BestTime'
        });

        this.newTime = data.newTime;
    }

    preload()
    {
        this.load.image('pauseOverlay', 'assets/images/pauseOverlay.png');
    }

    create()
    {
        pauseOverlay = this.add.image(0,0,'pauseOverlay').setOrigin(0,0);
        
    }
}