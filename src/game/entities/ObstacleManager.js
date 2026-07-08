import Phaser from 'phaser';

export default class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        // Creamos el grupo físico en la escena
        this.group = scene.physics.add.group();
    }

    spawn(currentSpeed) {
        const width = this.scene.scale.width > 0 ? this.scene.scale.width : window.innerWidth;
        const height = this.scene.scale.height > 0 ? this.scene.scale.height : window.innerHeight;
        const groundTop = height - 32;

        const cone = this.group.create(width + 50, groundTop, 'cone');
        cone.passed = false; 
        cone.setScale(1.2);
        cone.setOrigin(0.5, 1);
        cone.setY(groundTop);
        
        cone.body.setSize(cone.width * 0.6, cone.height * 0.8);
        cone.body.setOffset(cone.width * 0.2, cone.height * 0.2);
        cone.body.updateFromGameObject();
        
        cone.setImmovable(true);
        cone.body.allowGravity = false; 
        cone.setVelocityX(currentSpeed); 
    }

    // Actualiza la posición y destruye los que salen de pantalla
    update(currentSpeed, playerX, onPassObstacle) {
        this.group.getChildren().forEach(obstacle => {
            // Si el jugador lo pasa, ejecutamos el callback para sumar puntos
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