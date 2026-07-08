import { useEffect, useState } from "react";
import { EventBus } from "../../game/EventBus";

export default function GameUI({ onExit }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [damageText, setDamageText] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const handleScore = (newScore) => setScore(newScore);
    const handleLives = (newLives) => setLives(newLives);
    const handleGameOver = () => setIsGameOver(true);
    const handleDamage = (text) => {
      setDamageText(text);
      setTimeout(() => setDamageText(null), 800);
    };

    EventBus.on("update-score", handleScore);
    EventBus.on("update-lives", handleLives);
    EventBus.on("game-over", handleGameOver);
    EventBus.on("show-damage", handleDamage);

    // SOLO React controla la pausa con el teclado
    const handleKeyDown = (e) => {
      if (e.key === "Escape") togglePause();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      EventBus.off("update-score", handleScore);
      EventBus.off("update-lives", handleLives);
      EventBus.off("game-over", handleGameOver);
      EventBus.off("show-damage", handleDamage);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameOver]); // Añadimos isGameOver a las dependencias

  const togglePause = () => {
    if (isGameOver) return;

    setIsPaused((prev) => {
      const newState = !prev;
      EventBus.emit("toggle-pause", newState);
      return newState;
    });
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between">
      {/* --- BARRA SUPERIOR RESPONSIVA --- */}
      <div className="flex justify-between items-center p-4 md:p-6 pointer-events-auto">
        {/* Score (Izquierda) */}
        <div className="bg-white text-black px-3 py-1 md:px-6 md:py-2 border-2 border-black font-mono text-lg md:text-2xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {score.toString().padStart(5, "0")}
        </div>

        {/* Estado/Tarjetas (Centro) */}
        <div className="flex gap-2">
          {lives === 2 ? (
            <div className="bg-black text-white px-3 py-1 md:px-4 md:py-2 border-2 border-white font-mono text-xs md:text-sm tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              Juego Limpio
            </div>
          ) : lives === 1 ? (
            <div className="bg-yellow-400 text-black px-3 py-1 md:px-4 md:py-2 border-2 border-black font-mono text-xs md:text-sm tracking-widest uppercase font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              Amonestado
            </div>
          ) : (
            <div className="bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 border-2 border-black font-mono text-xs md:text-sm tracking-widest uppercase font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Expulsado
            </div>
          )}
        </div>

        {/* Botón de Pausa (Derecha) */}
        <button
          onClick={togglePause}
          className="bg-black text-white w-10 h-10 md:w-14 md:h-12 border-2 border-white font-mono text-xl hover:bg-white hover:text-black hover:border-black transition-colors flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          {isPaused ? "▶" : "||"}
        </button>
      </div>

      {/* --- TEXTO DE DAÑO FLOTANTE --- */}
      {damageText && (
        <div className="absolute top-1/3 left-1/4 md:left-1/3 text-red-500 font-mono text-5xl font-bold animate-bounce drop-shadow-lg">
          {damageText}
        </div>
      )}

      {/* --- MENÚ DE PAUSA / GAME OVER SUPERPUESTO --- */}
      {(isPaused || isGameOver) && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto backdrop-blur-md">
          <div className="bg-white p-6 md:p-10 border-4 border-black text-center flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)] max-w-sm w-11/12">
            <h2 className="text-black text-4xl md:text-5xl font-mono font-black mb-4 tracking-tighter uppercase">
              {isGameOver ? "Fin del Juego" : "Pausa"}
            </h2>

            {isGameOver && (
              <div className="bg-black text-white w-full py-4 mb-6 font-mono text-2xl">
                SCORE: {score}
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              {isGameOver ? (
                <button
                  onClick={onExit}
                  className="w-full py-3 bg-black text-white font-mono text-lg hover:bg-red-600 border-2 border-black transition-colors"
                >
                  SALIR AL MENÚ
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="w-full py-3 bg-black text-white font-mono text-lg hover:bg-gray-800 border-2 border-black transition-colors"
                  >
                    REANUDAR
                  </button>
                  <button
                    onClick={onExit}
                    className="w-full py-3 bg-white text-black font-mono text-lg hover:bg-red-100 hover:text-red-700 border-2 border-black transition-colors"
                  >
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
