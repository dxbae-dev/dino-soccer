import { useEffect, useState } from 'react';

export default function MainMenu({ setScreen }) {
    const [stats, setStats] = useState({ high: 0, low: 0 });

    useEffect(() => {
        // Obtenemos los valores guardados
        const high = localStorage.getItem('highScore') || '0';
        const low = localStorage.getItem('lowScore') || '0';
        setStats({ high, low });
    }, []);

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
            
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-8 font-mono tracking-widest uppercase drop-shadow-md text-center">
                Dino Soccer
            </h1>

            {/* --- PANEL DE RÉCORDS --- */}
            <div className="flex gap-4 mb-10">
                <div className="bg-white text-black p-3 font-mono text-xs text-center border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-bold">MEJOR</p>
                    <p className="text-xl">{stats.high}</p>
                </div>
                <div className="bg-black text-white p-3 font-mono text-xs text-center border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <p className="font-bold">PEOR</p>
                    <p className="text-xl">{stats.low}</p>
                </div>
            </div>

            <div className="mb-10 p-2 border-4 border-white bg-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <div 
                    style={{
                        width: '48px', height: '48px',
                        backgroundImage: "url('/assets/player-run.png')",
                        backgroundPosition: 'left center',
                        transform: 'scale(2)', transformOrigin: 'top left',
                        imageRendering: 'pixelated'
                    }}
                    className="w-[96px] h-[96px]"
                />
            </div>

            <div className="flex flex-col items-center">
                <MenuButton text="Jugar" onClick={() => setScreen('game')} />
                <MenuButton text="Cómo Jugar" onClick={() => setScreen('howToPlay')} />
                <MenuButton text="Reglas" onClick={() => setScreen('rules')} />
                <MenuButton text="Ajustes" onClick={() => setScreen('settings')} />
            </div>
        </div>
    );
}