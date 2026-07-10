export default function InfoScreen({ screen, setScreen }) {
    const titles = {
        credits: 'Credits',
        rules: 'Game Rules',
        howToPlay: 'How to Play'
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm p-8 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <h2 className="text-xl font-light text-zinc-100 tracking-[0.2em] uppercase mb-8 text-center w-full border-b border-white/10 pb-4">
                {titles[screen]}
            </h2>
            
            <div className="text-zinc-300 font-light text-sm leading-relaxed mb-10 w-full min-h-[160px] flex flex-col justify-center">
                
                {screen === 'credits' && (
                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                        <span className="text-sm tracking-widest uppercase text-zinc-200 mb-2">Designed & Developed By</span>
                        <span className="text-2xl text-white font-normal tracking-[0.2em] uppercase">Daniel Baena</span>
                        <div className="w-8 h-0.5 bg-white/20 my-4"></div>
                        <span className="text-xs uppercase tracking-[0.2em] text-zinc-200">Built with React & Phaser.js</span>
                    </div>
                )}

                {screen === 'rules' && (
                    <ul className="flex flex-col gap-5 text-left text-xs tracking-wide">
                        <li>
                            <strong className="block tracking-widest text-white uppercase mb-1">Objective</strong>
                            Survive as long as possible while the speed constantly increases.
                        </li>
                        <li>
                            <strong className="block tracking-widest text-amber-400 uppercase mb-1">Damage</strong>
                            You have 3 lives. Colliding with any obstacle costs 1 life and 30 points.
                        </li>
                        <li>
                            <strong className="block tracking-widest text-red-500 uppercase mb-1">Fever Mode</strong>
                            Fill the gauge to activate a temporary state of invincibility and massive speed.
                        </li>
                    </ul>
                )}

                {screen === 'howToPlay' && (
                    <div className="flex flex-col gap-4 text-left w-full px-2 text-xs uppercase tracking-widest">
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-zinc-300">Jump</span>
                            <span className="text-white text-right">[UP] / ▲</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-zinc-300">Slide</span>
                            <span className="text-white text-right">[Down] / ▼</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-zinc-300">Fever</span>
                            <span className="text-red-400 text-right">[Right] / Fever Btn </span>
                        </div>
                        <div className="flex justify-between items-end pb-2">
                            <span className="text-zinc-300">Pause</span>
                            <span className="text-white text-right">Pause Btn / ESC</span>
                        </div>
                    </div>
                )}

            </div>

            <button 
                onClick={() => setScreen('menu')}
                className="w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors active:scale-95 shadow-lg"
            >
                Return to Menu
            </button>
            
        </div>
    );
}