import Phaser from "phaser";
import { EventBus } from "../EventBus";
import Player from "../entities/Player";
import ObstacleManager from "../entities/ObstacleManager";

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
  }

  preload() {
    this.load.spritesheet("player", "/assets/player.png", { frameWidth: 84, frameHeight: 96 });
    this.load.spritesheet("obstacles", "/assets/obstacles.png", { frameWidth: 64, frameHeight: 64 });
  }

  create() {
    const width = this.scale.width > 0 ? this.scale.width : window.innerWidth;
    const height = this.scale.height > 0 ? this.scale.height : window.innerHeight;
    
    const isMobile = width < 768;
    const globalScale = isMobile ? 0.8 : 1.3;

    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(0, 0, 6, 6);
    g.generateTexture('dust', 6, 6);
    g.clear();
    g.fillStyle(0xfcd34d, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('spark', 4, 4);
    g.destroy();

    this.isGameOver = false;
    this.isPaused = false;
    this.gameStarted = false;
    this.isStarting = false;
    
    this.score = 0;
    this.lastSavedScore = 0;
    
    this.feverPoints = 0;
    this.feverReq = 500; 
    this.feverReady = false;
    
    this.speedRelief = 0; 
    
    this.initialSpeed = -380;
    this.baseSpeed = this.initialSpeed;
    this.currentSpeed = this.initialSpeed; 
    this.lives = 3;

    this.groundY = height - (isMobile ? 140 : 70);

    this.ground = this.add.rectangle(width / 2, this.groundY + 32, width * 2, 64, 0xffffff);
    this.physics.add.existing(this.ground, true);
    this.ground.setVisible(false);

    this.player = new Player(this, width / 2, this.groundY - 100, globalScale);
    this.player.body.allowGravity = true; 

    this.obstacleManager = new ObstacleManager(this, globalScale);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.obstacleManager.getGroup(), this.ground);
    this.physics.add.overlap(this.player, this.obstacleManager.getGroup(), this.hitObstacle, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.virtualInput = { up: false, down: false, justUp: false };
    
    this.input.on('pointerdown', () => {
        if (!this.gameStarted && !this.isPaused && !this.isGameOver) {
            this.startGame();
        }
    });

    this.handleVirtualInput = (action, isPressed) => {
        if (!this.gameStarted && !this.isPaused && !this.isGameOver && isPressed) {
            this.startGame();
            return;
        }

        if (!this.gameStarted || this.isPaused || this.isGameOver || this.isStarting) return;

        if (action === 'jump') {
            this.virtualInput.up = isPressed;
            if (isPressed) this.virtualInput.justUp = true;
        } else if (action === 'slide') {
            this.virtualInput.down = isPressed;
        } else if (action === 'fever' && isPressed && this.feverReady) {
            this.activateFever();
        }
    };
    EventBus.on("virtual-input", this.handleVirtualInput);

    this.startText = this.add.text(width / 2, height / 2 - 50, 'TAP TO START', {
      fontSize: '18px', fontFamily: 'sans-serif', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({ targets: this.startText, alpha: 0.2, yoyo: true, repeat: -1, duration: 800 });

    this.handlePause = (isPausedState) => this.togglePause(isPausedState);
    this.handleTriggerFever = () => this.activateFever();
    this.handleRestart = () => {
        this.scene.restart();
    };
    this.handleForceGameOver = (msg) => this.triggerGameOver(msg);
    
    EventBus.on("toggle-pause", this.handlePause);
    EventBus.on("trigger-fever", this.handleTriggerFever);
    EventBus.on("restart-game", this.handleRestart);
    EventBus.on("force-game-over", this.handleForceGameOver);

    this.events.on("shutdown", () => {
      this.saveScore();
      EventBus.off("toggle-pause", this.handlePause);
      EventBus.off("trigger-fever", this.handleTriggerFever);
      EventBus.off("restart-game", this.handleRestart);
      EventBus.off("force-game-over", this.handleForceGameOver);
      EventBus.off("virtual-input", this.handleVirtualInput); 
    });

    EventBus.emit("update-lives", this.lives);
    EventBus.emit("update-score", this.score);
    EventBus.emit("update-fever-progress", 0);
  }

  startGame() {
    this.gameStarted = true;
    this.isStarting = true;
    this.startText.destroy();
    
    this.virtualInput.up = false;
    this.virtualInput.down = false;
    this.virtualInput.justUp = false;

    this.tweens.add({
      targets: this.player,
      x: this.scale.width * 0.15,
      duration: 1200,
      ease: 'Sine.easeOut',
      onStart: () => {
          this.player.play('run');
      },
      onComplete: () => {
          this.isStarting = false;
      }
    });

    this.time.delayedCall(1200, () => {
        this.scheduleNextObstacle();
    });
  }

  activateFever() {
    if (!this.feverReady) return;
    this.feverReady = false;
    this.feverPoints = 0;
    
    EventBus.emit("fever-ready", false);
    EventBus.emit("fever-active", true);

    this.player.startCelebration(4500); 

    this.tweens.addCounter({
        from: 100,
        to: 0,
        duration: 4500,
        onUpdate: (tween) => {
            EventBus.emit("update-fever-progress", tween.getValue());
        },
        onComplete: () => {
            this.feverReq = Math.floor(this.feverReq * 1.85);
            EventBus.emit("fever-active", false);
            this.speedRelief += 350; 
        }
    });
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    if (!this.gameStarted) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || this.input.activePointer.justDown || this.virtualInput.justUp) {
          this.startGame();
      }
      return; 
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) && this.feverReady) this.activateFever();

    this.score += delta * 0.008;
    
    if (Math.floor(this.score) % 100 === 0 && Math.floor(this.score) !== this.lastSavedScore && this.score > 0) {
      this.saveScore();
      this.lastSavedScore = Math.floor(this.score);
    }

    if (!this.feverReady && !this.player.isCelebrating) {
        this.feverPoints += delta * 0.025;
        let progress = (this.feverPoints / this.feverReq) * 100;
        EventBus.emit("update-fever-progress", Math.min(100, progress));
        
        if (this.feverPoints >= this.feverReq) {
            this.feverReady = true;
            EventBus.emit("fever-ready", true);
        }
    }

    if (this.speedRelief > 0) {
      this.speedRelief -= delta * 0.2;
      if (this.speedRelief < 0) this.speedRelief = 0;
    }

    const speedMultiplier = this.score * 0.08; 
    const calculatedSpeed = (this.baseSpeed - speedMultiplier) + this.speedRelief;
    
    this.currentSpeed = Math.max(-900, Math.min(this.initialSpeed, calculatedSpeed));

    this.player.setAnimationSpeed(Math.abs(this.currentSpeed) / Math.abs(this.initialSpeed));

    if (this.isStarting) {
        this.player.play("run", true);
        this.player.jumpBuffer = 0;
    } else {
        this.player.handleInput(this.cursors, this.virtualInput, delta);
    }

    this.obstacleManager.update(this.currentSpeed, this.player.x, () => {
      this.score += 10;
    });

    EventBus.emit("update-score", Math.max(0, Math.floor(this.score)));
  }

  hitObstacle(player, obstacle) {
    if (!obstacle.body.enable) return;

    if (player.isCelebrating) {
        this.destroyObstacleAnim(obstacle);
        this.cameras.main.shake(100, 0.015);
        this.score += 10;
        return;
    }

    if (player.postFeverInvincible) return; 

    obstacle.body.enable = false;
    this.player.takeDamage();
    this.destroyObstacleAnim(obstacle);

    this.lives--;
    this.score = Math.max(0, this.score - 30);
    this.speedRelief += 300;
    
    EventBus.emit("update-lives", this.lives);
    EventBus.emit("update-score", Math.floor(this.score));

    if (this.lives === 2) {
      EventBus.emit("show-card", "yellow");
      EventBus.emit("show-damage", "WARNING!");
      player.setTint(0xfcd34d); 
      this.time.delayedCall(800, () => player.clearTint());
    } else if (this.lives === 1) {
      EventBus.emit("show-card", "yellow");
      EventBus.emit("show-damage", "LAST CHANCE!");
      player.setTint(0xf59e0b); 
      this.time.delayedCall(800, () => player.clearTint());
    } else if (this.lives <= 0) {
      EventBus.emit("show-card", "red");
      this.triggerGameOver();
    }
  }

  destroyObstacleAnim(obstacle) {
      this.tweens.add({
          targets: obstacle,
          scaleX: 0, 
          scaleY: 0,
          alpha: 0,  
          angle: 180, 
          duration: 200, 
          ease: 'Back.easeIn',
          onComplete: () => {
              if (obstacle) {
                  this.tweens.killTweensOf(obstacle);
                  this.obstacleManager.getGroup().killAndHide(obstacle);
              }
          }
      });
  }

  togglePause(isPausedState) {
    if (this.isGameOver || !this.physics || !this.physics.world) return;
    this.isPaused = isPausedState;
    if (this.isPaused) {
      this.physics.pause();
      if (this.player && this.player.anims) this.player.anims.pause();
    } else {
      this.physics.resume();
      if (this.player && this.player.anims) this.player.anims.resume();
    }
  }

  scheduleNextObstacle() {
    if (this.isGameOver) return;
    
    const speedFactor = 460 / Math.abs(this.currentSpeed); 
    const delay = Phaser.Math.Between(800, 1600) * speedFactor;

    this.time.addEvent({
      delay: delay,
      callback: () => {
        if (!this.isPaused) this.obstacleManager.spawn(this.currentSpeed, this.groundY);
        this.scheduleNextObstacle();
      },
    });
  }

  saveScore() {
    const finalScore = Math.floor(this.score);
    const high = parseInt(localStorage.getItem("highScore") || "0");
    if (!isNaN(finalScore)) {
      if (finalScore > high) localStorage.setItem("highScore", finalScore);
    }
  }

  triggerGameOver(customMessage = null) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.saveScore();
    this.physics.pause();
    this.player.anims.stop();
    this.player.setTint(0x3f3f46); 
    this.player.alpha = 1;
    EventBus.emit("game-over", { score: this.score, customMessage });
  }
}