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
    const width = this.scene.scale.width > 0 ? this.scene.scale.width : window.innerWidth;
    const isAerial = Phaser.Math.Between(1, 100) > 55;
    const willCrash = isAerial && score > 500 && Phaser.Math.Between(1, 100) > 90;
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
        const isMobile = width < 768;
        const crashX = Phaser.Math.Between(width / 2 + 50, width);
        const distanceToCrash = spawnX - crashX;
        const timeToCrash = (distanceToCrash / Math.abs(currentSpeed)) * 1000;
        
        const fallDuration = 280;
        const triggerTime = Math.max(0, timeToCrash - fallDuration);

        if (isMobile) {
            obstacle.setTint(0xff4444);
            this.scene.tweens.add({
                targets: obstacle,
                alpha: 0.4,
                yoyo: true,
                repeat: -1,
                duration: 70
            });
        } else {
            const warnTime = Math.max(0, triggerTime - 200);
            this.scene.time.delayedCall(warnTime, () => {
                if (obstacle.active) {
                    obstacle.setTint(0xff4444);
                    this.scene.tweens.add({
                        targets: obstacle,
                        alpha: 0.4,
                        yoyo: true,
                        repeat: 2,
                        duration: 60
                    });
                }
            });
        }

        this.scene.time.delayedCall(triggerTime, () => {
            if (obstacle.active) {
                this.scene.tweens.killTweensOf(obstacle);
                obstacle.alpha = 1;
                obstacle.setTint(0xff4444);
                obstacle.anims.stop();
                obstacle.setFrame(2);
                
                obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.8);
                obstacle.body.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);
                
                const crashAngle = Phaser.Math.Between(70, 110) * Phaser.Math.RND.sign();
                
                this.scene.tweens.add({
                    targets: obstacle,
                    y: groundY,
                    angle: crashAngle,
                    duration: fallDuration,
                    ease: "Expo.easeIn"
                });
            }
        });
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