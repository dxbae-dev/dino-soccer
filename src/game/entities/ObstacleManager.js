import Phaser from "phaser";

export default class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();

    // Creamos la animación del dron una sola vez en el constructor
    if (!this.scene.anims.exists("drone_fly")) {
      this.scene.anims.create({
        key: "drone_fly",
        frames: this.scene.anims.generateFrameNumbers("obstacles", {
          start: 1,
          end: 3,
        }),
        frameRate: 12,
        repeat: -1, // Loop infinito
      });
    }
  }

  spawn(currentSpeed) {
    const width =
      this.scene.scale.width > 0 ? this.scene.scale.width : window.innerWidth;
    const height =
      this.scene.scale.height > 0
        ? this.scene.scale.height
        : window.innerHeight;
    const groundTop = height - 32;

    const isAerial = Phaser.Math.Between(1, 100) > 70;

    let obstacle;

    if (isAerial) {
      // DRON (Volador)
      // Generamos una altura aleatoria entre -45 (muy bajo, ideal para saltar por encima)
      // y -85 (alto, ideal para barrerse por debajo)
      const randomHeight = Phaser.Math.Between(45, 85);

      obstacle = this.group.create(
        width + 50,
        groundTop - randomHeight,
        "obstacles",
        1,
      );
      obstacle.setOrigin(0.5, 1);
      obstacle.setScale(1.5);
      obstacle.play("drone_fly");

      // HITBOX JUSTA Y REAL: Solo cubrimos el cuerpo del dron
      obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.5);

      // Centramos la hitbox en la imagen del dron (quitamos la barrera invisible hacia arriba)
      obstacle.body.setOffset(obstacle.width * 0.15, obstacle.height * 0.25);

      // Animación de flotación (Bobbing) - Hacemos que el movimiento sea sutil
      this.scene.tweens.add({
        targets: obstacle,
        y: obstacle.y - Phaser.Math.Between(10, 20),
        duration: Phaser.Math.Between(800, 1200),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      // CONO (Terrestre) - Forzamos el frame 0 estático
      obstacle = this.group.create(width + 50, groundTop, "obstacles", 0);
      obstacle.setOrigin(0.5, 1);
      obstacle.setScale(1.2);

      obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.8);
      obstacle.body.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);
    }

    obstacle.passed = false;
    obstacle.body.updateFromGameObject();

    obstacle.setImmovable(true);
    obstacle.body.allowGravity = false;
    obstacle.setVelocityX(currentSpeed);
  }

  update(currentSpeed, playerX, onPassObstacle) {
    this.group.getChildren().forEach((obstacle) => {
      if (!obstacle.passed && obstacle.x < playerX) {
        obstacle.passed = true;
        onPassObstacle();
      }

      if (obstacle.x < -50) {
        obstacle.destroy();
      } else {
        obstacle.setVelocityX(currentSpeed);
      }
    });
  }

  getGroup() {
    return this.group;
  }
}
