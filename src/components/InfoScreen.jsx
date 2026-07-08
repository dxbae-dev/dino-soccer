// src/components/InfoScreen.jsx
export default function InfoScreen({ screen, setScreen }) {
    
    // Diccionario simple para los títulos
    const titles = {
        settings: 'Ajustes',
        rules: 'Reglas del Juego',
        howToPlay: 'Cómo Jugar'
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg p-6 bg-black border-4 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
            
            <h2 className="text-white text-3xl font-mono uppercase tracking-widest mb-6 border-b-2 border-white pb-2 w-full text-center">
                {titles[screen]}
            </h2>
            
            <div className="text-white font-mono text-sm leading-relaxed mb-8 w-full text-left min-h-[200px]">
                {screen === 'settings' && <p>Aquí pondremos controles de volumen y dificultad.</p>}
                {screen === 'rules' && <p>Faltas, sistema de puntuación y tarjetas.</p>}
                {screen === 'howToPlay' && <p>Presiona [ESPACIO] para saltar.</p>}
            </div>

            <button 
                onClick={() => setScreen('menu')}
                className="px-8 py-2 bg-white text-black font-mono uppercase tracking-widest hover:bg-neutral-300 transition-colors"
            >
                Regresar
            </button>
            
        </div>
    );
}