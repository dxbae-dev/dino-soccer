import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Inicializamos el Sprite usando la textura 'player'
        super(scene, x, y, 'player');
        
        // Lo añadimos a la escena y le habilitamos las físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuración visual e hitboxes
        this.setScale(3);
        this.body.setSize(20, 40);
        this.body.setOffset(14, 8);
        this.setCollideWorldBounds(true);

        // Creamos la animación si no existe
        if (!scene.anims.exists('run')) {
            scene.anims.create({
                key: 'run',
                frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 12,
                repeat: -1
            });
        }
        this.play('run');
    }

    // Método para manejar los controles en cada frame
    handleInput(cursors, isPointerDown) {
        const isJumping = cursors.space.isDown || cursors.up.isDown || isPointerDown;
        const isFastFalling = cursors.down.isDown;

        // Iniciar salto
        if (isJumping && this.body.touching.down) {
            this.setVelocityY(-800);
        }

        // Caída rápida
        if (!this.body.touching.down && isFastFalling) {
            this.setVelocityY(1500); 
        } 
        // Cortar el salto
        else if (!isJumping && this.body.velocity.y < -350 && !isFastFalling) {
            this.setVelocityY(-350);
        }
    }

    // Método para animar el daño (I-Frames y Screen Shake)
    takeDamage() {
        this.scene.cameras.main.shake(150, 0.015);
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.2 },
            duration: 150,
            yoyo: true,
            repeat: 4
        });
    }

    // Ajusta la velocidad de la animación
    setAnimationSpeed(ratio) {
        this.anims.timeScale = Math.max(0.3, ratio);
    }
}