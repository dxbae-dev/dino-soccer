import { useEffect, useState } from 'react';

export default function MainMenu({ setScreen }) {
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        const high = localStorage.getItem('highScore') || '0';
        setHighScore(high);
    }, []);

    const MenuButton = ({ text, onClick }) => (
        <button 
            onClick={onClick}
            className="w-56 mb-3 py-3 rounded-full bg-black/40 border border-white/10 text-zinc-300 font-light tracking-[0.2em] uppercase text-sm hover:bg-white hover:text-black hover:border-white transition-all duration-300 active:scale-95 backdrop-blur-md"
        >
            {text}
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
            
            <div className="relative mb-6 rounded-full w-28 h-28 bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-xl">
                <div 
                    style={{
                        width: '84px', 
                        height: '96px',
                        backgroundImage: "url('/assets/player.png')",
                        backgroundPosition: '0px 0px',
                        transform: 'scale(0.8)',
                        imageRendering: 'pixelated'
                    }}
                />
            </div>

            <h1 className="text-4xl md:text-5xl font-extralight mb-10 tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 text-center">
                Momentum
            </h1>

            <div className="flex flex-col items-center mb-10 bg-black/40 px-10 py-4 rounded-3xl border border-white/10 backdrop-blur-md shadow-lg">
                <span className="text-[10px] text-zinc-400 tracking-widest uppercase mb-1">High Score</span>
                <span className="text-3xl font-light text-white">{highScore}</span>
            </div>

            <div className="flex flex-col items-center w-full">
                <MenuButton text="Play" onClick={() => setScreen('game')} />
                <MenuButton text="How to Play" onClick={() => setScreen('howToPlay')} />
                <MenuButton text="Rules" onClick={() => setScreen('rules')} />
                <MenuButton text="Settings" onClick={() => setScreen('settings')} />
            </div>
        </div>
    );
}