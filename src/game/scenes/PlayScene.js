// src/game/scenes/PlayScene.js
import Phaser from 'phaser';

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    preload() {
        this.load.spritesheet('player', '/assets/player-run.png', {
            frameWidth: 48,  
            frameHeight: 48  
        });
    }

    create() {
        const width = this.scale.width > 0 ? this.scale.width : window.innerWidth;
        const height = this.scale.height > 0 ? this.scale.height : window.innerHeight;

        const groundY = height; 
        
        this.ground = this.add.rectangle(width, groundY, width * 2, 64, 0xffffff);
        this.physics.add.existing(this.ground, true); 
        this.ground.body.updateFromGameObject(); 
        
        // 1. Ocultamos el suelo nuevamente
        this.ground.setVisible(false); 

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 12, 
            repeat: -1 
        });

        this.player = this.physics.add.sprite(width * 0.1, groundY - 200, 'player');
        this.player.setScale(3); 
        this.physics.world.setBounds(0, 0, width, height);
        this.player.setCollideWorldBounds(true);
        this.player.play('run');

        this.physics.add.collider(this.player, this.ground);

        // --- NUEVO: CONTROLES ---
        // 2. Activamos la detección del teclado
        this.cursors = this.input.keyboard.createCursorKeys();

        // 3. Activamos el salto tocando la pantalla (o haciendo clic)
        this.input.on('pointerdown', () => {
            // Solo saltamos si el jugador está tocando el suelo
            if (this.player.body.touching.down) {
                this.player.setVelocityY(-700); // El impulso hacia arriba
            }
        });
    }

    update() {
        // --- NUEVO: LÓGICA DE SALTO CON TECLADO ---
        // Si presionas la barra espaciadora y estás tocando el suelo
        if (this.cursors.space.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-700);
        }
    }
}