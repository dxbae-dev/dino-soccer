import Phaser from 'phaser';

export default class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.group = scene.physics.add.group();
    }

    spawn(currentSpeed) {
        const width = this.scene.scale.width > 0 ? this.scene.scale.width : window.innerWidth;
        const height = this.scene.scale.height > 0 ? this.scene.scale.height : window.innerHeight;
        const groundTop = height - 32;

        const isAerial = Phaser.Math.Between(1, 100) > 70;

        let obstacle;

        if (isAerial) {
            // AJUSTE: Lo ponemos exactamente a 75px del suelo. La barrida del jugador mide 60px, así que pasas raspando.
            obstacle = this.group.create(width + 50, groundTop - 75, 'cone');
            obstacle.setOrigin(0.5, 1);
            obstacle.setTint(0x000000); 
            // AJUSTE: Lo hacemos estirado hacia arriba (escala Y = 3) para que NO puedas saltar sobre él.
            obstacle.setScale(1.2, 3); 
            
            // Cubrimos bien el obstáculo alargado con el hitbox
            obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.95);
            obstacle.body.setOffset(obstacle.width * 0.2, obstacle.height * 0.05);
        } else {
            obstacle = this.group.create(width + 50, groundTop, 'cone');
            obstacle.setOrigin(0.5, 1);
            obstacle.clearTint(); 
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
        this.group.getChildren().forEach(obstacle => {
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