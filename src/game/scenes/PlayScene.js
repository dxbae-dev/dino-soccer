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

    this.isGameOver = false;
    this.isPaused = false;
    this.gameStarted = false;
    
    this.score = 0;
    this.lastSavedScore = 0;
    
    // FIEBRE: Ahora la meta inicial es más baja (500) para que sea rápido activarla
    this.feverPoints = 0;
    this.feverReq = 500; 
    this.feverReady = false;
    
    this.speedRelief = 0; 
    this.brakeCooldown = 0;
    
    // VELOCIDAD: Juego más dinámico desde el inicio (-550 en vez de -400)
    this.initialSpeed = -550;
    this.baseSpeed = this.initialSpeed;
    this.currentSpeed = this.initialSpeed; 
    this.lives = 2;

    const groundY = height;
    this.ground = this.add.rectangle(width, groundY, width * 2, 64, 0xffffff);
    this.physics.add.existing(this.ground, true);
    this.ground.body.updateFromGameObject();
    this.ground.setVisible(false);

    this.player = new Player(this, width * 0.1, groundY - 100);
    this.player.x = width / 2; 
    this.player.body.allowGravity = false;

    this.obstacleManager = new ObstacleManager(this);

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
        } else if (action === 'brake' && isPressed && this.brakeCooldown <= 0) {
            this.activateBrake();
        } else if (action === 'fever' && isPressed && this.feverReady) {
            this.activateFever();
        }
    };
    EventBus.on("virtual-input", this.handleVirtualInput);

    this.startText = this.add.text(width / 2, height / 2 - 50, 'TOCA LA PANTALLA PARA JUGAR', {
      fontSize: '20px', fontFamily: 'monospace', fill: '#000000', backgroundColor: '#ffffff', padding: { x: 15, y: 10 }
    }).setOrigin(0.5);

    this.tweens.add({ targets: this.startText, alpha: 0.2, yoyo: true, repeat: -1, duration: 800 });

    this.handlePause = (isPausedState) => this.togglePause(isPausedState);
    this.handleTriggerFever = () => this.activateFever();
    
    EventBus.on("toggle-pause", this.handlePause);
    EventBus.on("trigger-fever", this.handleTriggerFever);

    this.events.on("shutdown", () => {
      this.saveScore();
      EventBus.off("toggle-pause", this.handlePause);
      EventBus.off("trigger-fever", this.handleTriggerFever);
      EventBus.off("virtual-input", this.handleVirtualInput); // Limpiar evento
    });

    EventBus.emit("update-lives", this.lives);
    EventBus.emit("update-score", this.score);
    EventBus.emit("update-fever-progress", 0);
  }

  startGame() {
    this.gameStarted = true;
    this.startText.destroy();
    this.player.body.allowGravity = true;

    this.tweens.add({
      targets: this.player,
      x: this.scale.width * 0.1,
      duration: 800,
      ease: 'Power2',
      onStart: () => this.player.play('run')
    });

    this.time.delayedCall(800, () => {
        this.scheduleNextObstacle();
    });
  }

  activateBrake() {
      this.brakeCooldown = 5000; 
      this.speedRelief += 300; 
      EventBus.emit("show-damage", "¡FRENO!");
      
      const emitter = this.add.particles(this.player.x, this.player.y + 40, 'pixel', {
          speedX: { min: 200, max: 400 },
          speedY: { min: -50, max: 0 },
          lifespan: 400,
          quantity: 20,
          tint: 0xffffff
      });
      this.time.delayedCall(150, () => emitter.stop());
  }

  activateFever() {
    if (!this.feverReady) return;
    this.feverReady = false;
    this.feverPoints = 0;
    // La meta crece menos agresivamente (25% extra cada vez en lugar de 50%)
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
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) && this.brakeCooldown <= 0) this.activateBrake();

    if (this.brakeCooldown > 0) this.brakeCooldown -= delta;

    this.score += 0.1;
    
    if (Math.floor(this.score) % 100 === 0 && Math.floor(this.score) !== this.lastSavedScore) {
      this.saveScore();
      this.lastSavedScore = Math.floor(this.score);
    }

    if (!this.feverReady && !this.player.isCelebrating) {
        this.feverPoints += 0.2; // La fiebre se llena más rápido
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

    // Progresión de velocidad: Aumenta más frecuentemente, pero en menor escala.
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
    // Si el obstáculo ya está siendo destruido, no hacemos nada
    if (!obstacle.body.enable) return;

    if (player.isCelebrating) {
        this.destroyObstacleAnim(obstacle);
        this.cameras.main.shake(100, 0.01);
        this.score += 100;
        EventBus.emit("show-damage", "+100 FIEBRE");
        return;
    }

    if (player.postFeverInvincible) return; 

    // Apagamos la colisión instantáneamente para no recibir daño múltiple
    obstacle.body.enable = false;
    this.player.takeDamage();

    // Como ambos usan "obstacles", verificamos por el frame (0 es el cono, 1-3 es el dron)
    const isCone = obstacle.frame.name === 0;

    // Ejecutamos la nueva animación de destrucción
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

      if (this.lives === 1) {
        EventBus.emit("show-card", "yellow");
        player.setTint(0xffff00); 
        this.time.delayedCall(800, () => player.clearTint());
      } else if (this.lives <= 0) {
        EventBus.emit("show-card", "red");
        this.triggerGameOver();
      }
    }
  }

  // NUEVA FUNCIÓN: Añádela justo debajo de hitObstacle
  destroyObstacleAnim(obstacle) {
      this.tweens.add({
          targets: obstacle,
          scaleX: 0, // Se encoje
          scaleY: 0,
          alpha: 0,  // Se vuelve transparente
          angle: 180, // Da media vuelta (efecto de volcar)
          duration: 250, // Muy rápido (250ms)
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
        if (!this.isPaused) this.obstacleManager.spawn(this.currentSpeed);
        this.scheduleNextObstacle();
      },
    });
  }

  saveScore() {
    const finalScore = Math.floor(this.score);
    const high = parseInt(localStorage.getItem("highScore") || "-9999");
    const low = parseInt(localStorage.getItem("lowScore") || "9999");
    if (!isNaN(finalScore)) {
      if (finalScore > high) localStorage.setItem("highScore", finalScore);
      if (finalScore < low) localStorage.setItem("lowScore", finalScore);
    }
  }

  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.saveScore();
    this.physics.pause();
    this.player.anims.stop();
    this.player.setTint(0x000000); 
    this.player.alpha = 1;
    EventBus.emit("game-over");
  }
}