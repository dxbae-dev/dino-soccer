// src/components/PhaserGame.jsx
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import PlayScene from '../game/scenes/PlayScene';

export default function PhaserGame() {
    const gameRef = useRef(null);

    useEffect(() => {
        const gameConfig = {
            type: Phaser.AUTO,
            parent: 'game-container',
            scale: {
                mode: Phaser.Scale.RESIZE, // Se ajusta al tamaño de la ventana
                width: '100%',
                height: '100%',
            },
            pixelArt: true,
            transparent: true,
            // Agregamos el sistema de físicas para darle peso al personaje
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1200 }, // Gravedad fuerte para saltos precisos
                    debug: false // Cambia a true si quieres ver las "cajas" de colisión
                }
            },
            scene: [PlayScene]
        };

        if (gameRef.current === null) {
            gameRef.current = new Phaser.Game(gameConfig);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div 
            id="game-container" 
            className="w-full h-full flex-1" 
        />
    );
}