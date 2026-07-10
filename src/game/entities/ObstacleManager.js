import Phaser from "phaser";

export default class ObstacleManager {
  constructor(scene, scale = 1.5) {
    this.scene = scene;
    this.baseScale = scale;
    this.group = scene.physics.add.group();

    if (!this.scene.anims.exists("drone_fly")) {
      this.scene.anims.create({
        key: "drone_fly",
        frames: this.scene.anims.generateFrameNumbers("obstacles", {
          start: 1,
          end: 3,
        }),
        frameRate: 14,
        repeat: -1, 
      });
    }
  }

  spawn(currentSpeed, groundY) {
    const width = this.scene.scale.width > 0 ? this.scene.scale.width : window.innerWidth;
    const isAerial = Phaser.Math.Between(1, 100) > 60;
    const spawnX = width + 250;

    let obstacle = this.group.getFirstDead(false);

    if (!obstacle) {
      obstacle = this.group.create(spawnX, groundY, "obstacles", 0);
    } else {
      obstacle.setActive(true).setVisible(true);
      obstacle.body.enable = true;
      this.scene.tweens.killTweensOf(obstacle);
      
      obstacle.setAlpha(1);
      obstacle.setAngle(0);
    }

    if (isAerial) {
      const randomHeight = Phaser.Math.Between(35, 55);

      obstacle.setPosition(spawnX, groundY - randomHeight);
      obstacle.setFrame(1);
      obstacle.setOrigin(0.5, 1);
      obstacle.setScale(this.baseScale);
      obstacle.play("drone_fly");

      obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.5);
      obstacle.body.setOffset(obstacle.width * 0.15, obstacle.height * 0.25);

      this.scene.tweens.add({
        targets: obstacle,
        y: obstacle.y - Phaser.Math.Between(8, 15),
        duration: Phaser.Math.Between(600, 1000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      obstacle.setPosition(spawnX, groundY);
      obstacle.setFrame(0);
      obstacle.anims.stop();
      obstacle.setOrigin(0.5, 1);
      obstacle.setScale(this.baseScale * 0.85);

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
      if (!obstacle.active) return;

      if (!obstacle.passed && obstacle.x < playerX) {
        obstacle.passed = true;
        onPassObstacle();
      }

      if (obstacle.x < -100) {
        this.scene.tweens.killTweensOf(obstacle);
        this.group.killAndHide(obstacle);
        obstacle.body.enable = false;
      } else {
        obstacle.setVelocityX(currentSpeed);
      }
    });
  }

  getGroup() {
    return this.group;
  }
}