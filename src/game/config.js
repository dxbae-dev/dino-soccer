import Phaser from 'phaser';
import PlayScene from './scenes/PlayScene';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container', // El ID del contenedor HTML donde se inyectará el juego
    scale: {
        mode: Phaser.Scale.RESIZE, // Se adapta al tamaño del contenedor de forma responsiva
        width: '100%',
        height: '100%',
    },
    pixelArt: true, // Mantiene los bordes de los píxeles nítidos (indie aesthetic)
    transparent: true, // Permite que se vea el fondo CSS de tu aplicación
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 }, // Gravedad ideal para el salto dinámico del jugador
            debug: true // Cambia a true si necesitas volver a calibrar alguna hitbox
        }
    },
    scene: [PlayScene] // Tu lista de escenas ordenadas
};

export default config;