import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, scale = 1.5) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseScale = scale;
    this.setScale(this.baseScale);
    
    this.body.setSize(40, 80);
    this.body.setOffset(22, 16);
    this.setCollideWorldBounds(true);

    this.isCelebrating = false;
    this.postFeverInvincible = false;
    this.lastGhost = 0;
    this.wasTouchingDown = false;
    this.lastSpark = 0;

    this.jumpBuffer = 0;
    this.coyoteTime = 0;
    this.slideFlag = false;

    if (!scene.anims.exists("run")) {
      scene.anims.create({
        key: "idle",
        frames: [{ key: "player", frame: 0 }],
        frameRate: 10,
      });
      scene.anims.create({
        key: "run",
        frames: scene.anims.generateFrameNumbers("player", {
          start: 1,
          end: 3,
        }),
        frameRate: 12,
        repeat: -1,
      });
      scene.anims.create({
        key: "slide",
        frames: [{ key: "player", frame: 4 }],
        frameRate: 10,
      });
      scene.anims.create({
        key: "jump",
        frames: [{ key: "player", frame: 5 }],
        frameRate: 10,
      });
      scene.anims.create({
        key: "celebrate",
        frames: [{ key: "player", frame: 6 }],
        frameRate: 10,
      });
    }

    this.play("idle");
  }

  triggerJump() {
    this.jumpBuffer = 150;
  }

  triggerSlide() {
    this.slideFlag = true;
    if (this.slideTimer) this.slideTimer.remove();
    this.slideTimer = this.scene.time.delayedCall(500, () => {
      this.slideFlag = false;
    });
  }

  startCelebration(duration) {
    this.isCelebrating = true;
    this.postFeverInvincible = false;
    this.setTint(0xff3333); 

    this.scene.time.delayedCall(duration, () => {
      this.isCelebrating = false;
      this.clearTint();
      
      this.body.setSize(40, 80);
      this.body.setOffset(22, 16);

      this.postFeverInvincible = true;
      this.scene.tweens.add({
        targets: this,
        alpha: 0.2,
        yoyo: true,
        repeat: 12,
        duration: 100,
        onComplete: () => {
          this.postFeverInvincible = false;
          this.alpha = 1;
        },
      });
    });
  }

  spawnDust() {
    for (let i = 0; i < 4; i++) {
      const dust = this.scene.add.sprite(this.x - 10 + Math.random() * 20, this.y + 40, 'dust');
      this.scene.tweens.add({
        targets: dust,
        y: dust.y - Math.random() * 15,
        x: dust.x - 20 + Math.random() * 10,
        alpha: 0,
        scale: 0.2,
        duration: 300 + Math.random() * 200,
        onComplete: () => dust.destroy()
      });
    }
  }

  spawnSpark() {
    const spark = this.scene.add.sprite(this.x + 15, this.y + 40, 'spark');
    this.scene.tweens.add({
      targets: spark,
      x: spark.x - 30 - Math.random() * 30,
      y: spark.y - Math.random() * 20,
      alpha: 0,
      scale: 0.2,
      duration: 200 + Math.random() * 200,
      onComplete: () => spark.destroy()
    });
  }

  handleInput(cursors, virtualInput, delta) {
    const isTouchingDown = this.body.touching.down;

    if (this.isCelebrating) {
      this.play("celebrate", true);
      this.body.setSize(40, 80);
      this.body.setOffset(22, 16);

      if (this.scene.time.now > this.lastGhost + 60) {
        const ghost = this.scene.add.sprite(this.x, this.y, "player", this.frame.name);
        ghost.setScale(this.scaleX, this.scaleY);
        ghost.setTint(0xff3333);
        ghost.setBlendMode(Phaser.BlendModes.ADD);
        
        this.scene.tweens.add({
            targets: ghost,
            alpha: 0,
            scale: this.baseScale * 0.5,
            x: this.x - 50,
            duration: 350,
            onComplete: () => ghost.destroy()
        });
        this.lastGhost = this.scene.time.now;
      }

      if (isTouchingDown && !this.wasTouchingDown) {
        this.spawnDust();
      }
      this.wasTouchingDown = isTouchingDown;
      
      return;
    }

    if (isTouchingDown) {
      this.coyoteTime = 80;
    } else {
      this.coyoteTime -= delta;
    }

    if (isTouchingDown && !this.wasTouchingDown) {
      this.spawnDust();
    }
    this.wasTouchingDown = isTouchingDown;

    const isUpJustPressed =
      Phaser.Input.Keyboard.JustDown(cursors.space) ||
      Phaser.Input.Keyboard.JustDown(cursors.up) ||
      virtualInput.justUp;
    const isUpHeld =
      cursors.space.isDown || cursors.up.isDown || virtualInput.up;
    const isDownHeld = cursors.down.isDown || virtualInput.down;

    if (isUpJustPressed) {
      this.jumpBuffer = 150;
    } else {
      this.jumpBuffer -= delta;
    }

    virtualInput.justUp = false;

    const isFastFalling = isDownHeld || this.slideFlag;

    if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
      this.setVelocityY(-720);
      this.jumpBuffer = 0;
      this.coyoteTime = 0;
      this.slideFlag = false;
    }

    if (!isTouchingDown && isFastFalling) {
      this.setVelocityY(1800);
    } else if (
      !isUpHeld &&
      this.jumpBuffer <= 0 &&
      this.body.velocity.y < -250 &&
      !isFastFalling
    ) {
      this.setVelocityY(-250);
    }

    if (!isTouchingDown) {
      this.play("jump", true);
      this.body.setSize(40, 80);
      this.body.setOffset(22, 16);
    } else if (isFastFalling) {
      this.play("slide", true);
      this.body.setSize(70, 40);
      this.body.setOffset(7, 56);
      
      if (this.scene.time.now > this.lastSpark + 60) {
        this.spawnSpark();
        this.lastSpark = this.scene.time.now;
      }
    } else {
      this.play("run", true);
      this.body.setSize(40, 80);
      this.body.setOffset(22, 16);
    }
  }

  takeDamage() {
    this.postFeverInvincible = true;
    this.scene.cameras.main.shake(200, 0.025);
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.1 },
      duration: 100,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.postFeverInvincible = false;
        this.alpha = 1;
      }
    });
  }

  setAnimationSpeed(ratio) {
    if (this.anims.currentAnim && this.anims.currentAnim.key === "run") {
      this.anims.timeScale = Math.max(0.7, ratio);
    } else {
      this.anims.timeScale = 1;
    }
  }
}