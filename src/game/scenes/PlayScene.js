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
    const globalScale = isMobile ? 1.0 : 1.5;

    this.isGameOver = false;
    this.isPaused = false;
    this.gameStarted = false;
    
    this.score = 0;
    this.lastSavedScore = 0;
    
    this.feverPoints = 0;
    this.feverReq = 500; 
    this.feverReady = false;
    
    this.speedRelief = 0; 
    
    this.initialSpeed = -550;
    this.baseSpeed = this.initialSpeed;
    this.currentSpeed = this.initialSpeed; 
    this.lives = 3;

    const groundOffset = isMobile ? 100 : 70; 
    this.groundY = height - groundOffset;

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
        if (!this.gameStarted || this.isPaused || this.isGameOver) return;

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
      fontSize: '16px', fontFamily: 'sans-serif', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({ targets: this.startText, alpha: 0.3, yoyo: true, repeat: -1, duration: 1000 });

    this.handlePause = (isPausedState) => this.togglePause(isPausedState);
    this.handleTriggerFever = () => this.activateFever();
    this.handleRestart = () => this.scene.restart();
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
    this.startText.destroy();

    this.tweens.add({
      targets: this.player,
      x: this.scale.width * 0.15,
      duration: 1200,
      ease: 'Sine.easeOut',
      onStart: () => this.player.play('run')
    });

    this.time.delayedCall(1200, () => {
        this.scheduleNextObstacle();
    });
  }

  activateFever() {
    if (!this.feverReady) return;
    this.feverReady = false;
    this.feverPoints = 0;
    this.feverReq = Math.floor(this.feverReq * 1.25); 
    
    EventBus.emit("fever-ready", false);
    EventBus.emit("fever-active", true);

    this.player.startCelebration(4500); 

    this.time.delayedCall(4500, () => {
        EventBus.emit("fever-active", false);
        this.speedRelief += 400; 
    });
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    if (!this.gameStarted) {
      if (this.cursors.space.isDown || this.input.activePointer.isDown) this.startGame();
      return; 
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) && this.feverReady) this.activateFever();

    this.score += 0.1;
    
    if (Math.floor(this.score) % 100 === 0 && Math.floor(this.score) !== this.lastSavedScore) {
      this.saveScore();
      this.lastSavedScore = Math.floor(this.score);
    }

    if (!this.feverReady && !this.player.isCelebrating) {
        this.feverPoints += 0.2; 
        let progress = (this.feverPoints / this.feverReq) * 100;
        EventBus.emit("update-fever-progress", Math.min(100, progress));
        
        if (this.feverPoints >= this.feverReq) {
            this.feverReady = true;
            EventBus.emit("fever-ready", true);
        }
    }

    if (this.speedRelief > 0) {
      this.speedRelief -= delta * 0.15;
      if (this.speedRelief < 0) this.speedRelief = 0;
    }

    const speedMultiplier = Math.floor(Math.max(0, this.score) / 50); 
    const calculatedSpeed = (this.baseSpeed - speedMultiplier * 15) + this.speedRelief;
    
    this.currentSpeed = Math.max(-1000, Math.min(this.initialSpeed, calculatedSpeed));

    this.player.setAnimationSpeed(this.currentSpeed / this.initialSpeed);

    this.player.handleInput(this.cursors, this.virtualInput, delta);

    this.obstacleManager.update(this.currentSpeed, this.player.x, () => {
      this.score += 50;
    });

    EventBus.emit("update-score", Math.floor(this.score));
    if (this.score <= -100) this.triggerGameOver();
  }

  hitObstacle(player, obstacle) {
    if (!obstacle.body.enable) return;

    if (player.isCelebrating) {
        this.destroyObstacleAnim(obstacle);
        this.cameras.main.shake(100, 0.01);
        this.score += 100;
        EventBus.emit("show-damage", "+100");
        return;
    }

    if (player.postFeverInvincible) return; 

    obstacle.body.enable = false;
    this.player.takeDamage();

    const isCone = obstacle.frame.name === 0;

    this.destroyObstacleAnim(obstacle);

    if (isCone) {
      this.score -= 100;
      EventBus.emit("show-damage", "-100");

      const originalSpeed = this.baseSpeed;
      this.baseSpeed = this.baseSpeed * 0.5;

      this.time.delayedCall(1500, () => {
        if (!this.isGameOver) this.baseSpeed = originalSpeed;
      });
    } else {
      this.lives--;
      EventBus.emit("update-lives", this.lives);

      if (this.lives === 2) {
        EventBus.emit("show-card", "yellow");
        EventBus.emit("show-damage", "WARNING");
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
  }

  destroyObstacleAnim(obstacle) {
      this.tweens.add({
          targets: obstacle,
          scaleX: 0, 
          scaleY: 0,
          alpha: 0,  
          angle: 180, 
          duration: 250, 
          ease: 'Back.easeIn',
          onComplete: () => {
              if (obstacle) obstacle.destroy();
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
    
    const speedFactor = Math.abs(this.currentSpeed) / 500; 
    const delay = Phaser.Math.Between(800, Math.max(1000, 2000 - (speedFactor * 300))) / (this.player.anims.timeScale || 1);

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
    const high = parseInt(localStorage.getItem("highScore") || "-9999");
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