import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import gameConfig from '../game/config';
import { EventBus } from '../game/EventBus';

export default function PhaserGame() {
    const gameRef = useRef(null);

    useEffect(() => {
        if (gameRef.current === null) {
            gameRef.current = new Phaser.Game(gameConfig);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
                EventBus.removeAllListeners();
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