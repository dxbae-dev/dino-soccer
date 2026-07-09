import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1.5);
        this.body.setSize(40, 80);
        this.body.setOffset(22, 16);
        this.setCollideWorldBounds(true);

        this.isCelebrating = false;
        this.postFeverInvincible = false;
        
        this.jumpBuffer = 0; 
        this.coyoteTime = 0; 
        this.slideFlag = false; 

        if (!scene.anims.exists('run')) {
            scene.anims.create({ key: 'idle', frames: [{ key: 'player', frame: 0 }], frameRate: 10 });
            scene.anims.create({ key: 'run', frames: scene.anims.generateFrameNumbers('player', { start: 1, end: 3 }), frameRate: 12, repeat: -1 });
            scene.anims.create({ key: 'slide', frames: [{ key: 'player', frame: 4 }], frameRate: 10 });
            scene.anims.create({ key: 'jump', frames: [{ key: 'player', frame: 5 }], frameRate: 10 });
            scene.anims.create({ key: 'celebrate', frames: [{ key: 'player', frame: 6 }], frameRate: 10 });
        }
        
        this.play('idle'); 
    }

    triggerJump() {
        this.jumpBuffer = 150; 
    }

    triggerSlide() {
        this.slideFlag = true;
        if (this.slideTimer) this.slideTimer.remove();
        this.slideTimer = this.scene.time.delayedCall(600, () => {
            this.slideFlag = false;
        });
    }

    startCelebration(duration) {
        this.isCelebrating = true;
        this.postFeverInvincible = false;
        this.clearTint();

        this.scene.tweens.add({
            targets: this,
            scale: 1.6,
            yoyo: true,
            repeat: -1,
            duration: 300
        });
        
        this.scene.time.delayedCall(duration, () => {
            this.isCelebrating = false;
            this.scene.tweens.killTweensOf(this); 
            this.setScale(1.5);
            
            this.postFeverInvincible = true;
            this.scene.tweens.add({
                targets: this,
                alpha: 0.2,
                yoyo: true,
                repeat: 8, 
                duration: 100,
                onComplete: () => {
                    this.postFeverInvincible = false;
                    this.alpha = 1;
                }
            });
        });
    }

    handleInput(cursors, delta) {
        if (this.isCelebrating) {
            this.play('celebrate', true);
            this.body.setSize(40, 80);
            this.body.setOffset(22, 16);
            return;
        }

        if (this.body.touching.down) {
            this.coyoteTime = 100; 
        } else {
            this.coyoteTime -= delta;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.space) || Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.jumpBuffer = 150; 
        } else {
            this.jumpBuffer -= delta;
        }

        const isFastFalling = cursors.down.isDown || this.slideFlag;

        if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
            this.setVelocityY(-800);
            this.jumpBuffer = 0;
            this.coyoteTime = 0;
            this.slideFlag = false; 
        }

        if (!this.body.touching.down && isFastFalling) {
            this.setVelocityY(1500); 
        } else if (!cursors.space.isDown && !cursors.up.isDown && this.jumpBuffer <= 0 && this.body.velocity.y < -350 && !isFastFalling) {
            this.setVelocityY(-350);
        }

        if (!this.body.touching.down) {
            this.play('jump', true);
            this.body.setSize(40, 80);
            this.body.setOffset(22, 16);
        } else if (isFastFalling) {
            this.play('slide', true);
            this.body.setSize(70, 40);
            this.body.setOffset(7, 56);
        } else {
            this.play('run', true);
            this.body.setSize(40, 80);
            this.body.setOffset(22, 16);
        }
    }

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

    setAnimationSpeed(ratio) {
        if (this.anims.currentAnim && this.anims.currentAnim.key === 'run') {
            this.anims.timeScale = Math.max(0.3, ratio);
        } else {
            this.anims.timeScale = 1;
        }
    }
}