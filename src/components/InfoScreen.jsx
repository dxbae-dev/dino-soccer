export default function InfoScreen({ screen, setScreen }) {
    const titles = {
        settings: 'Settings',
        rules: 'Game Rules',
        howToPlay: 'How to Play'
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm p-8 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-2xl">
            
            <h2 className="text-xl font-light text-zinc-100 tracking-[0.2em] uppercase mb-8 text-center w-full">
                {titles[screen]}
            </h2>
            
            <div className="text-zinc-400 font-light text-sm leading-relaxed mb-10 w-full text-center min-h-[120px]">
                {screen === 'settings' && <p>Volume and difficulty adjustments will appear here.</p>}
                {screen === 'rules' && <p>Avoid obstacles. Colliding with cones reduces your speed. Colliding with drones costs a life.</p>}
                {screen === 'howToPlay' && <p>Tap or press [SPACE] to jump.<br/>Swipe down or use [DOWN] to slide.</p>}
            </div>

            <button 
                onClick={() => setScreen('menu')}
                className="w-full py-3 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors"
            >
                Return
            </button>
            
        </div>
    );
}