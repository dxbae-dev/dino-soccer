// src/components/MainMenu.jsx
export default function MainMenu({ setScreen }) {
    
    // Componente interno para botones minimalistas
    const MenuButton = ({ text, onClick }) => (
        <button 
            onClick={onClick}
            className="w-64 mb-4 px-6 py-3 bg-transparent text-white font-mono text-xl uppercase tracking-widest border-2 border-white hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95"
        >
            {text}
        </button>
    );

    return (
        <div className="flex flex-col items-center">
            
            {/* Título */}
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-10 font-mono tracking-widest uppercase drop-shadow-md text-center leading-tight">
                Dino<br/>Soccer
            </h1>

            {/* Cuadro central del Jugador */}
            <div className="mb-10 p-2 border-4 border-white bg-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <div 
                    style={{
                        width: '48px',
                        height: '48px',
                        backgroundImage: "url('/assets/player-run.png')", // Actualiza el nombre aquí
                        backgroundPosition: 'left center', // Como es una tira horizontal, 'left' toma exactamente el fotograma 0
                        transform: 'scale(2)',
                        transformOrigin: 'top left',
                        imageRendering: 'pixelated'
                    }}
                    className="w-[96px] h-[96px]"
                />
            </div>

            {/* Botones de Navegación */}
            <div className="flex flex-col items-center">
                <MenuButton text="Jugar" onClick={() => setScreen('game')} />
                <MenuButton text="Cómo Jugar" onClick={() => setScreen('howToPlay')} />
                <MenuButton text="Reglas" onClick={() => setScreen('rules')} />
                <MenuButton text="Ajustes" onClick={() => setScreen('settings')} />
            </div>

        </div>
    );
}