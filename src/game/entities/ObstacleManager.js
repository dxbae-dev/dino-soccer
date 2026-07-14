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

  spawn(currentSpeed, groundY, score = 0) {
    const width =
      this.scene.scale.width > 0 ? this.scene.scale.width : window.innerWidth;
    const isAerial = Phaser.Math.Between(1, 100) > 55;
    const willCrash =
      isAerial && score > 500 && Phaser.Math.Between(1, 100) > 90;
    const spawnX = width + 250;

    let obstacle = this.group.getFirstDead(false);

    if (!obstacle) {
      obstacle = this.group.create(spawnX, groundY, "obstacles", 0);
    } else {
      obstacle.setActive(true).setVisible(true);
      obstacle.body.enable = true;
      this.scene.tweens.killTweensOf(obstacle);

      obstacle.clearTint();
      obstacle.setAlpha(1);
      obstacle.setAngle(0);
    }

    obstacle.passed = false;
    obstacle.isCrashingDrone = false;
    obstacle.body.checkCollision.none = false;

    if (isAerial) {
      const randomHeight = Phaser.Math.Between(40, 80);

      obstacle.setPosition(spawnX, groundY - randomHeight);
      obstacle.setFrame(1);
      obstacle.setOrigin(0.5, 1);
      obstacle.setScale(this.baseScale * 0.9);
      obstacle.play("drone_fly");

      obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.4);
      obstacle.body.setOffset(obstacle.width * 0.2, obstacle.height * 0.3);

      if (willCrash) {
        obstacle.isCrashingDrone = true;
        obstacle.crashFired = false;
        obstacle.warnFired = false;
        obstacle.targetGroundY = groundY;

        const crashX = Phaser.Math.Between(width / 2 + 50, width);
        const fallDistance = Math.abs(currentSpeed) * 0.28;

        obstacle.triggerX = crashX + fallDistance;
        obstacle.warnX = obstacle.triggerX + Math.abs(currentSpeed) * 0.2;
      } else {
        this.scene.tweens.add({
          targets: obstacle,
          y: obstacle.y - Phaser.Math.Between(10, 20),
          duration: Phaser.Math.Between(600, 1000),
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    } else {
      obstacle.setPosition(spawnX, groundY);
      obstacle.setFrame(0);
      obstacle.anims.stop();
      obstacle.setOrigin(0.5, 1);
      obstacle.setScale(this.baseScale * 0.85);

      obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.8);
      obstacle.body.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);
    }

    obstacle.body.updateFromGameObject();
    obstacle.setImmovable(true);
    obstacle.body.allowGravity = false;
    obstacle.setVelocityX(currentSpeed);
  }

  update(currentSpeed, playerX, onPassObstacle) {
    const isMobile = this.scene.scale.width < 768;

    this.group.getChildren().forEach((obstacle) => {
      if (!obstacle.active) return;

      if (obstacle.isCrashingDrone) {
        if (!obstacle.warnFired && obstacle.x <= obstacle.warnX) {
          obstacle.warnFired = true;
          obstacle.setTint(0xff4444);

          this.scene.tweens.add({
            targets: obstacle,
            alpha: 0.4,
            yoyo: true,
            repeat: isMobile ? -1 : 2,
            duration: isMobile ? 70 : 60,
          });
        }

        if (!obstacle.crashFired && obstacle.x <= obstacle.triggerX) {
          obstacle.crashFired = true;

          this.scene.tweens.killTweensOf(obstacle);
          obstacle.alpha = 1;
          obstacle.setTint(0xff4444);
          obstacle.anims.stop();
          obstacle.setFrame(2);

          obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.8);
          obstacle.body.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);

          const crashAngle =
            Phaser.Math.Between(70, 110) * Phaser.Math.RND.sign();

          this.scene.tweens.add({
            targets: obstacle,
            y: obstacle.targetGroundY,
            angle: crashAngle,
            duration: 280,
            ease: "Expo.easeIn",
          });
        }
      }

      if (!obstacle.passed && obstacle.x < playerX) {
        obstacle.passed = true;
        obstacle.body.checkCollision.none = true;
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
