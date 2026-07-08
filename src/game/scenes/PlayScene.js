import Phaser from "phaser";
import { EventBus } from "../EventBus";
import Player from "../entities/Player";
import ObstacleManager from "../entities/ObstacleManager";

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
  }

  preload() {
    this.load.spritesheet("player", "/assets/player-run.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.image("cone", "/assets/obstaculo-1.png");
  }

  create() {
    const width = this.scale.width > 0 ? this.scale.width : window.innerWidth;
    const height =
      this.scale.height > 0 ? this.scale.height : window.innerHeight;

    // Estado
    this.isGameOver = false;
    this.isPaused = false;
    this.score = 0;
    this.initialSpeed = -400;
    this.baseSpeed = this.initialSpeed;
    this.lives = 2;

    // Entorno (Suelo)
    const groundY = height;
    this.ground = this.add.rectangle(width, groundY, width * 2, 64, 0xffffff);
    this.physics.add.existing(this.ground, true);
    this.ground.body.updateFromGameObject();
    this.ground.setVisible(false);

    // Instanciar Entidades
    this.player = new Player(this, width * 0.1, groundY - 200);
    this.obstacleManager = new ObstacleManager(this);

    // Colisiones
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.obstacleManager.getGroup(), this.ground);
    this.physics.add.overlap(
      this.player,
      this.obstacleManager.getGroup(),
      this.hitObstacle,
      null,
      this,
    );

    this.handlePause = (isPausedState) => this.togglePause(isPausedState);
    EventBus.on("toggle-pause", this.handlePause);

    this.events.on('shutdown', () => {
        this.saveScore(); 
        EventBus.off("toggle-pause", this.handlePause); // Limpieza segura
    });

    EventBus.emit("update-lives", this.lives);
    EventBus.emit("update-score", this.score);

    this.events.on('shutdown', () => {
        this.saveScore(); // Guardado de emergencia al salir
        EventBus.off('toggle-pause', handlePause);
    });

    // Controles y Generación
    this.cursors = this.input.keyboard.createCursorKeys();
    this.scheduleNextObstacle();

    // Conexión con React
    const handlePause = (isPausedState) => this.togglePause(isPausedState);
    EventBus.on("toggle-pause", handlePause);
    this.events.on("shutdown", () => EventBus.off("toggle-pause", handlePause));

    EventBus.emit("update-lives", this.lives);
    EventBus.emit("update-score", this.score);
  }

  update() {
    if (this.isGameOver || this.isPaused) return;

    // Progresión de Puntaje y Velocidad
    this.score += 0.1;
    const speedMultiplier = Math.floor(Math.max(0, this.score) / 100);
    this.currentSpeed = this.baseSpeed - speedMultiplier * 25;

    // Actualizar Jugador
    this.player.setAnimationSpeed(this.currentSpeed / this.initialSpeed);
    this.player.handleInput(this.cursors, this.input.activePointer.isDown);

    // Actualizar Obstáculos (y sumar puntos si se esquivan)
    this.obstacleManager.update(this.currentSpeed, this.player.x, () => {
      this.score += 50;
    });

    EventBus.emit("update-score", Math.floor(this.score));

    if (this.score <= -100) {
      this.triggerGameOver();
    }
  }

  togglePause(isPausedState) {
    if (this.isGameOver || !this.physics || !this.physics.world) return;

    this.isPaused = isPausedState;

    if (this.isPaused) {
      this.physics.pause();
      if (this.player && this.player.anims) {
        this.player.anims.pause();
      }
    } else {
      this.physics.resume();
      if (this.player && this.player.anims) {
        this.player.anims.resume();
      }
    }
  }

  scheduleNextObstacle() {
    if (this.isGameOver) return;
    const delay =
      Phaser.Math.Between(1000, 2500) / (this.player.anims.timeScale || 1);

    this.time.addEvent({
      delay: delay,
      callback: () => {
        if (!this.isPaused) this.obstacleManager.spawn(this.currentSpeed);
        this.scheduleNextObstacle();
      },
    });
  }

  hitObstacle(player, obstacle) {
    obstacle.body.enable = false;
    this.player.takeDamage();

    if (obstacle.texture.key === "cone") {
      obstacle.destroy();
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
        player.setTint(0xffff00);
        this.time.delayedCall(800, () => player.clearTint());
      } else if (this.lives <= 0) {
        this.triggerGameOver();
      }
    }
  }

saveScore() {
    const finalScore = Math.floor(this.score);
    const high = parseInt(localStorage.getItem('highScore') || '-9999');
    const low = parseInt(localStorage.getItem('lowScore') || '9999');

    // Solo guardamos si el score es un número válido
    if (!isNaN(finalScore)) {
        if (finalScore > high) localStorage.setItem('highScore', finalScore);
        if (finalScore < low) localStorage.setItem('lowScore', finalScore);
    }
  }

  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    
    this.saveScore(); // Reutilizamos la lógica única
    
    this.physics.pause();
    this.player.anims.stop();
    this.player.setTint(0xff0000);
    this.player.alpha = 1;

    EventBus.emit("game-over");
  }

}
