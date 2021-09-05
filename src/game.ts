import 'phaser';

export default class Home extends Phaser.Scene {
    readonly IS_COMPLETED = false;
    readonly NUM_COINS_START = 0;
    readonly PLAYER_AABB = [30, 30, 2, 2];
    readonly PLAYER_BOUNCE = 0.001;
    readonly PLAYER_JUMP_AIR_TIME = 100;
    readonly PLAYER_JUMP_DOWN_TIME = 0;
    readonly PLAYER_SPEED_X = 200;
    readonly PLAYER_SPEED_Y = 300;

    map;
    player;
    floor;
    coin;
    positions;
    cursors;
    isCompleted;
    numCoins;
    playerJumpAirTime;
    playerJumpDownTime;

    constructor() {
        super('home');
        this.isCompleted = this.IS_COMPLETED;
        this.numCoins = this.NUM_COINS_START;
        this.playerJumpAirTime = this.PLAYER_JUMP_AIR_TIME;
        this.playerJumpDownTime = this.PLAYER_JUMP_DOWN_TIME;
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
        this.player.setBounce(this.PLAYER_BOUNCE);
        this.player.body.setSize(...this.PLAYER_AABB);
        this.physics.add.collider(this.player, this.floor);
        this.physics.add.overlap(this.player, this.coin, this._handleCoin, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.cursors.left.on('down', () => {
            this.player.body.setVelocityX(-this.PLAYER_SPEED_X);
        });

        this.cursors.right.on('down', () => {
            this.player.body.setVelocityX(this.PLAYER_SPEED_X);
        });

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBackgroundColor('#ccccff');
    }

    update(time, delta) {
        if (!this.isCompleted &&
            this.player.x > this.positions.endPosition.x &&
            this.player.x < this.positions.endPosition.x + this.positions.endPosition.width &&
            this.player.y > this.positions.endPosition.y &&
            this.player.y < this.positions.endPosition.y + this.positions.endPosition.height) {
            this.isCompleted = true;
        }

        if (!this.isCompleted) {
            if (!this.player.body.onFloor()) {
                if (this.cursors.left.isDown) {
                    this.player.body.setVelocityX(-this.PLAYER_SPEED_X);
                }

                if (this.cursors.right.isDown) {
                    this.player.body.setVelocityX(this.PLAYER_SPEED_X);
                }
            }

            if (!(this.cursors.left.isDown || this.cursors.right.isDown)) {
                this.player.body.setVelocityX(0);
            }

            if (this.playerJumpDownTime <= 0) {
                if ((this.cursors.space.isDown || this.cursors.up.isDown)) {
                    if (this.player.body.onFloor()) {
                        this.player.body.setVelocityY(-this.PLAYER_SPEED_Y);
                        this.playerJumpAirTime = this.PLAYER_JUMP_AIR_TIME;
                    } else if (this.playerJumpAirTime > 0) {
                        this.player.body.setVelocityY(-this.PLAYER_SPEED_Y);
                        this.playerJumpAirTime -= delta;
                    } else {
                        this.playerJumpDownTime = this.PLAYER_JUMP_DOWN_TIME;
                    }
                }
            } else if (this.playerJumpDownTime > 0 && this.player.body.onFloor()) {
                this.playerJumpDownTime -= delta;
                console.log(this.playerJumpDownTime, delta);
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
