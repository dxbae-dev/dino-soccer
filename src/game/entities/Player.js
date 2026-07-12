import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, scale = 1.5) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseScale = scale * 0.5;
    this.setScale(this.baseScale);
    
    this.body.setSize(80, 160);
    this.body.setOffset(44, 32);
    this.setCollideWorldBounds(true);
    
    this.setVelocity(0, 0);

    this.isCelebrating = false;
    this.postFeverInvincible = false;
    this.isHit = false;
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
        key: "hit_air",
        frames: [{ key: "player", frame: 6 }],
        frameRate: 10,
      });
      scene.anims.create({
        key: "hit_ground",
        frames: [{ key: "player", frame: 7 }],
        frameRate: 10,
      });
    }

    this.dustEmitter = scene.add.particles(0, 0, 'dust', {
      lifespan: 300,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.5, end: 0 },
      speedY: { min: -30, max: -10 },
      speedX: { min: -20, max: 20 },
      emitting: false
    });

    this.sparkEmitter = scene.add.particles(0, 0, 'spark', {
      lifespan: 250,
      scale: { start: 0.2, end: 0 },
      alpha: { start: 1, end: 0 },
      speedY: { min: -30, max: 0 },
      speedX: { min: -60, max: -20 },
      emitting: false
    });

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
      
      this.body.setSize(80, 160);
      this.body.setOffset(44, 32);

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
    this.dustEmitter.emitParticleAt(this.x, this.y + 40, 2);
  }

  spawnSpark() {
    this.sparkEmitter.emitParticleAt(this.x + 15, this.y + 40, 1);
  }

  handleInput(cursors, virtualInput, delta) {
    const isTouchingDown = this.body.touching.down;

    if (this.isCelebrating) {
      this.play("run", true);
      this.body.setSize(80, 160);
      this.body.setOffset(44, 32);

      if (this.scene.time.now > this.lastGhost + 60) {
        const ghost = this.scene.add.sprite(this.x, this.y, "player", this.frame.name);
        ghost.setScale(this.scaleX, this.scaleY);
        ghost.setTint(0xff3333);
        ghost.setBlendMode(Phaser.BlendModes.ADD);
        
        this.scene.tweens.add({
            targets: ghost,
            alpha: 0,
            scale: this.baseScale,
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

    if (!this.isHit) {
      if (!isTouchingDown) {
        this.play("jump", true);
        this.body.setSize(80, 160);
        this.body.setOffset(44, 32);
      } else if (isFastFalling) {
        this.play("slide", true);
        this.body.setSize(140, 80);
        this.body.setOffset(14, 112);
        
        if (this.scene.time.now > this.lastSpark + 60) {
          this.spawnSpark();
          this.lastSpark = this.scene.time.now;
        }
      } else {
        this.play("run", true);
        this.body.setSize(80, 160);
        this.body.setOffset(44, 32);
      }
    }
  }

  takeDamage(isAerial = false) {
    this.isHit = true;
    this.play(isAerial ? "hit_air" : "hit_ground", true);
    
    this.scene.time.delayedCall(400, () => {
      this.isHit = false;
    });

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