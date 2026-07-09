import { useEffect, useState } from "react";
import { EventBus } from "../../game/EventBus";

export default function GameUI({ onExit, children }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [damageText, setDamageText] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [feverReady, setFeverReady] = useState(false);
  const [feverActive, setFeverActive] = useState(false);
  const [feverProgress, setFeverProgress] = useState(0);

  const [activeCard, setActiveCard] = useState(null); 

  useEffect(() => {
    const handleScore = (newScore) => setScore(newScore);
    const handleLives = (newLives) => setLives(newLives);
    const handleGameOver = () => setIsGameOver(true);
    const handleDamage = (text) => {
      setDamageText(text);
      setTimeout(() => setDamageText(null), 800);
    };

    const handleFeverReady = (state) => setFeverReady(state);
    const handleFeverActive = (state) => setFeverActive(state);
    const handleFeverProgress = (progress) => setFeverProgress(progress);

    const handleShowCard = (color) => {
      setActiveCard(color);
      if (color === "yellow") {
        setTimeout(() => setActiveCard(null), 1500); 
      }
    };

    EventBus.on("update-score", handleScore);
    EventBus.on("update-lives", handleLives);
    EventBus.on("game-over", handleGameOver);
    EventBus.on("show-damage", handleDamage);
    EventBus.on("fever-ready", handleFeverReady);
    EventBus.on("fever-active", handleFeverActive);
    EventBus.on("update-fever-progress", handleFeverProgress);
    EventBus.on("show-card", handleShowCard);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") togglePause();
      if ((e.key === "f" || e.key === "F") && feverReady && !isPaused && !isGameOver) {
        EventBus.emit("trigger-fever");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      EventBus.off("update-score", handleScore);
      EventBus.off("update-lives", handleLives);
      EventBus.off("game-over", handleGameOver);
      EventBus.off("show-damage", handleDamage);
      EventBus.off("fever-ready", handleFeverReady);
      EventBus.off("fever-active", handleFeverActive);
      EventBus.off("update-fever-progress", handleFeverProgress);
      EventBus.off("show-card", handleShowCard);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameOver, feverReady, isPaused]); 

  const togglePause = () => {
    if (isGameOver) return;
    setIsPaused((prev) => {
      const newState = !prev;
      EventBus.emit("toggle-pause", newState);
      return newState;
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col pointer-events-none touch-none select-none">
      
      {/* SECCIÓN SUPERIOR: Juego y HUD */}
      <div className="flex-1 relative w-full h-full pointer-events-auto">
        
        {/* El canvas de Phaser se inyecta aquí */}
        <div className="absolute inset-0 z-10">
          {children}
        </div>

        {/* HUD Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          <div className="flex justify-between items-start p-4 md:p-6 pointer-events-auto">
            <div className="bg-white text-black px-4 py-2 border-2 border-black font-mono text-xl md:text-2xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              {score.toString().padStart(5, "0")}
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={togglePause}
                className="bg-white text-black w-10 h-10 md:w-12 md:h-12 border-2 border-black font-mono text-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {isPaused ? "▶" : "||"}
              </button>

              {/* HISTORIAL DE TARJETAS */}
              <div className="flex gap-2 mt-1 h-6 items-center">
                {lives === 2 && (
                  <span className="text-black font-mono text-xs font-bold uppercase bg-white px-1 border border-black">
                    JUEGO LIMPIO
                  </span>
                )}
                {lives === 1 && (
                  <div className="w-4 h-6 bg-yellow-400 border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse" />
                )}
                {lives <= 0 && (
                  <div className="w-4 h-6 bg-red-600 border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                )}
              </div>

            </div>
          </div>

          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-auto">
            <div className="text-black font-mono text-xs md:text-sm font-bold bg-white px-1 border border-black uppercase text-center">
              {feverActive ? 'FIEBRE' : 'ENERGÍA'}
            </div>
            
            <div className={`w-6 md:w-8 h-48 md:h-64 border-4 border-black bg-white flex flex-col justify-end shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${feverReady && !feverActive ? 'animate-pulse border-dashed' : ''}`}>
              <div 
                className="w-full bg-black transition-all duration-300 ease-out"
                style={{ height: `${feverProgress}%` }}
              />
            </div>
          </div>

          {damageText && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 font-mono text-4xl font-bold animate-bounce text-black bg-white px-2 border-2 border-black z-40">
              {damageText}
            </div>
          )}

          {/* ANIMACIÓN DE TARJETA (ÁRBITRO) */}
          {activeCard && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center z-40 pointer-events-none animate-bounce">
              <div 
                className={`w-16 h-24 border-4 border-black rounded-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                  activeCard === 'yellow' ? 'bg-yellow-400' : 'bg-red-600'
                }`} 
              />
              <span className="text-black font-mono text-xl font-black mt-4 bg-white px-3 py-1 border-2 border-black uppercase text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {activeCard === 'yellow' ? '¡AMARILLA!' : '¡ROJA DIRECTA!'}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* SECCIÓN INFERIOR: Consola de Controles (Abajo del piso del juego) */}
      <div className="h-36 md:hidden bg-black border-t-4 border-white z-30 w-full flex items-center justify-between px-6 sm:px-12 pointer-events-auto">
        
        {/* Cruceta Izquierda (Freno y Barrida) */}
        <div className="flex gap-4">
          <button 
            onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'brake', true); }}
            className="w-16 h-16 rounded-full bg-black border-4 border-white flex items-center justify-center text-white font-bold text-2xl active:bg-white active:text-black transition-colors"
          >
            <span className="leading-none -ml-1">◄</span>
          </button>
          <button 
            onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', true); }}
            onPointerUp={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', false); }}
            onPointerLeave={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', false); }}
            className="w-16 h-16 rounded-full bg-black border-4 border-white flex items-center justify-center text-white font-bold text-2xl active:bg-white active:text-black transition-colors"
          >
            <span className="leading-none mt-1">▼</span>
          </button>
        </div>

        {/* Botones de Acción Derechos (Fiebre y Salto) */}
        <div className="flex gap-4 items-center">
          { feverReady && !feverActive && (
            <button 
              onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'fever', true); }}
              className="w-14 h-14 rounded-full bg-white border-2 border-black flex items-center justify-center text-black font-bold text-2xl active:scale-95 animate-bounce"
            >
              <span className="leading-none">⚡</span>
            </button>
          )}
          <button 
            onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', true); }}
            onPointerUp={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', false); }}
            onPointerLeave={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', false); }}
            className="w-20 h-20 rounded-full bg-black border-4 border-white flex items-center justify-center text-white font-bold text-3xl active:bg-white active:text-black transition-colors"
          >
            <span className="leading-none -mt-1">▲</span>
          </button>
        </div>

      </div>

      {/* MODALES: Pausa / Game Over (Cubre toda la pantalla) */}
      {(isPaused || isGameOver) && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center pointer-events-auto backdrop-blur-sm z-50">
          <div className="bg-white p-8 border-4 border-black text-center flex flex-col items-center max-w-sm w-11/12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-black text-4xl font-mono font-black mb-6 uppercase">
              {isGameOver ? "Fin del Juego" : "Pausa"}
            </h2>

            {isGameOver && (
              <div className="bg-black text-white w-full py-3 mb-8 font-mono text-2xl border-2 border-black">
                SCORE: {Math.floor(score)}
              </div>
            )}

            <div className="flex flex-col gap-4 w-full">
              {isGameOver ? (
                <button onClick={onExit} className="w-full py-3 bg-white text-black font-mono text-lg font-bold border-2 border-black hover:bg-black hover:text-white transition-colors">
                  SALIR AL MENÚ
                </button>
              ) : (
                <>
                  <button onClick={togglePause} className="w-full py-3 bg-black text-white font-mono text-lg font-bold border-2 border-black hover:bg-white hover:text-black transition-colors">
                    REANUDAR
                  </button>
                  <button onClick={onExit} className="w-full py-3 bg-white text-black font-mono text-lg font-bold border-2 border-black hover:bg-gray-100 transition-colors">
                    SALIR AL MENÚ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}