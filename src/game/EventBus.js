import Phaser from 'phaser';

// Instancia global para emitir y escuchar eventos
export const EventBus = new Phaser.Events.EventEmitter();