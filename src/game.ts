import 'phaser';

export default class Home extends Phaser.Scene {
    map;
    player;
    floor;
    coin;
    positions;
    cursors;
    isComplete;
    numCoins;

    constructor() {
        super('home');
        this.isComplete = false;
        this.numCoins = 0;
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'assets/hello-tiled.json');
        this.load.image('floor', 'assets/floor.png');
        this.load.image('player', 'assets/squarey.png');
        this.load.image('coin', 'assets/coin.png');
    }

    create() {
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const floorTileset = this.map.addTilesetImage('floor', 'floor');
        this.floor = this.map.createLayer('floor', floorTileset, 0, 0);
        this.floor.setCollisionByExclusion(-1, true);

        const coinTileset = this.map.addTilesetImage('coin', 'coin');
        this.coin = this.map.createLayer('coin', coinTileset, 0, 0);

        const objLayer = this.map.getObjectLayer('positions');
        this.positions = objLayer.objects.reduce((hash, position) => {
            hash[position.name] = position;
            return hash;
        }, {});

        this.player = this.physics.add.sprite(this.positions.startPosition.x, this.positions.startPosition.y, 'player');
        this.player.setBounce(0.001);
        this.player.body.setSize(30, 30, 2, 2);
        this.physics.add.collider(this.player, this.floor);
        this.physics.add.overlap(this.player, this.coin, this._handleCoin, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.cursors.left.on('down', () => {
            this.player.body.setVelocityX(-200);
        });

        this.cursors.right.on('down', () => {
            this.player.body.setVelocityX(200);
        });

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBackgroundColor('#ccccff');
    }

    update(time, delta) {
        if (!this.isComplete &&
            this.player.x > this.positions.endPosition.x &&
            this.player.x < this.positions.endPosition.x + this.positions.endPosition.width &&
            this.player.y > this.positions.endPosition.y &&
            this.player.y < this.positions.endPosition.y + this.positions.endPosition.height) {
            this.isComplete = true;
        }

        if (!this.isComplete) {
            if (!(this.cursors.left.isDown || this.cursors.right.isDown)) {
                this.player.body.setVelocityX(0);
            }

            if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
                this.player.body.setVelocityY(-350);
            }
        } else {
            console.log('Level complete!');
        }
    }

    _handleCoin(player, coin) {
        if (coin.index === 2) {
            this.map.removeTile(coin);
            coin.destroy(coin.x, coin.y);
            this.numCoins += 1;
            console.log(this.numCoins);
        }
        return false;
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: Home
};

const game = new Phaser.Game(config);
