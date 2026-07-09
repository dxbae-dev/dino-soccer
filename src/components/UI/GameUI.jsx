import { useEffect, useState } from "react";
import { EventBus } from "../../game/EventBus";

export default function GameUI({ onExit, children }) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore') || "0"));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [damageText, setDamageText] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  
  const [feverReady, setFeverReady] = useState(false);
  const [feverActive, setFeverActive] = useState(false);
  const [feverProgress, setFeverProgress] = useState(0);
  const [activeCard, setActiveCard] = useState(null); 

  useEffect(() => {
    const handleScore = (newScore) => {
      setScore(newScore);
      if (newScore > highScore && highScore > 0 && !isNewRecord) {
        setIsNewRecord(true);
      }
    };
    
    const handleLives = (newLives) => setLives(newLives);
    
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

    const handleGameOver = ({ score: finalScore, customMessage }) => {
      setIsGameOver(true);
      if (customMessage) {
        setGameOverMessage(customMessage);
      } else {
        if (finalScore < 0) {
          setGameOverMessage("NEGATIVE SCORE... OUCH");
        } else if (finalScore > highScore && finalScore > 0) {
          setGameOverMessage("NEW HIGH SCORE!");
        } else if (finalScore >= highScore * 0.8 && finalScore > 0) {
          setGameOverMessage("ALMOST BROKE THE RECORD!");
        } else {
          setGameOverMessage("GOOD EFFORT!");
        }
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
  }, [isGameOver, feverReady, isPaused, highScore, isNewRecord]); 

  const togglePause = () => {
    if (isGameOver) return;
    setIsPaused((prev) => {
      const newState = !prev;
      EventBus.emit("toggle-pause", newState);
      return newState;
    });
  };

  const handleRetry = () => {
    setIsGameOver(false);
    setIsNewRecord(false);
    EventBus.emit("restart-game");
  };

  const handleForceQuit = () => {
    setIsPaused(false);
    EventBus.emit("force-game-over", "EXPULSADO POR FALTA DE MOTIVACIÓN");
  };

  const displayScore = Math.floor(score);
  const formattedScore = displayScore < 0 
    ? "-" + Math.abs(displayScore).toString().padStart(4, "0") 
    : displayScore.toString().padStart(5, "0");

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col pointer-events-none touch-none select-none font-sans">
      
      <div className="flex-1 relative w-full h-full pointer-events-auto">
        <div className="absolute inset-0 z-10">
          {children}
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none">
          
          <div className="absolute top-6 left-6 flex flex-col bg-black/50 px-5 py-3 rounded-2xl backdrop-blur-md transition-all duration-500 shadow-lg pointer-events-auto border border-white/10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1 drop-shadow-md">
              {isNewRecord ? <span className="text-amber-400 animate-pulse">New Record!</span> : "Score"}
            </span>
            <span className={`text-3xl md:text-4xl font-light tracking-widest drop-shadow-md ${isNewRecord ? 'text-amber-400' : 'text-white'}`}>
              {formattedScore}
            </span>
          </div>

          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto bg-black/40 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
            <div className={`w-5 h-7 md:w-6 md:h-8 rounded-[4px] border-2 transition-all duration-300 ${lives <= 2 ? 'bg-amber-400 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'bg-transparent border-white/30'}`} />
            <div className={`w-5 h-7 md:w-6 md:h-8 rounded-[4px] border-2 transition-all duration-300 ${lives <= 1 ? 'bg-amber-400 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'bg-transparent border-white/30'}`} />
          </div>

          <div className="absolute top-6 right-6 pointer-events-auto">
            <button
              onClick={togglePause}
              className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md shadow-lg"
            >
              <div className="flex gap-1.5">
                <div className="w-1 h-3.5 bg-current rounded-full" />
                <div className="w-1 h-3.5 bg-current rounded-full" />
              </div>
            </button>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-auto">
            <div className={`w-1.5 h-32 md:h-48 rounded-full bg-black/50 border border-white/10 relative overflow-hidden backdrop-blur-md shadow-lg ${feverReady && !feverActive ? 'shadow-[0_0_15px_rgba(6,182,212,0.5)] border-cyan-400/50' : ''}`}>
              <div 
                className={`absolute bottom-0 w-full transition-all duration-300 ease-out rounded-full ${feverActive ? 'bg-cyan-400' : 'bg-zinc-300'}`}
                style={{ height: `${feverProgress}%` }}
              />
            </div>
          </div>

          {damageText && (
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-lg md:text-xl font-light tracking-widest text-white/90 bg-black/60 px-6 py-2 rounded-full backdrop-blur-md border border-white/20 animate-pulse z-40 shadow-xl whitespace-nowrap">
              {damageText}
            </div>
          )}

          {activeCard === 'yellow' && !isGameOver && (
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none transition-all">
              <div className="w-14 h-20 md:w-16 md:h-24 rounded-md shadow-2xl bg-amber-400 animate-bounce" />
            </div>
          )}

        </div>
      </div>

      <div className="h-32 md:hidden z-30 w-full flex items-center justify-center gap-8 pointer-events-auto pb-6">
        <button 
          onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', true); }}
          onPointerUp={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', false); }}
          onPointerLeave={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', false); }}
          className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-zinc-300 active:bg-white/20 active:text-white backdrop-blur-md transition-colors shadow-lg"
        >
          <span className="text-2xl">▼</span>
        </button>

        <button 
          onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'fever', true); }}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg ${
            feverReady && !feverActive 
              ? 'bg-cyan-900/60 border border-cyan-400/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95' 
              : 'bg-black/30 border border-white/5 text-zinc-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
          </svg>
        </button>

        <button 
          onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', true); }}
          onPointerUp={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', false); }}
          onPointerLeave={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', false); }}
          className="w-16 h-16 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-white active:bg-white/30 backdrop-blur-md transition-colors shadow-xl"
        >
          <span className="text-2xl">▲</span>
        </button>
      </div>

      {(isPaused || isGameOver) && (
        <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center pointer-events-auto backdrop-blur-md z-50 transition-all">
          <div className="flex flex-col items-center w-full max-w-sm p-8">
            <h2 className="text-2xl font-light text-white tracking-[0.3em] uppercase mb-8 text-center">
              {isGameOver ? "Game Over" : "Paused"}
            </h2>

            {isPaused && !isGameOver && (
              <div className="flex justify-between w-full mb-8 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Score</span>
                  <span className="text-2xl font-light text-white">{formattedScore}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Cards</span>
                  <div className="flex gap-2">
                    <div className={`w-3 h-5 rounded-[2px] border ${lives <= 2 ? 'bg-amber-400 border-amber-500' : 'bg-transparent border-white/30'}`} />
                    <div className={`w-3 h-5 rounded-[2px] border ${lives <= 1 ? 'bg-amber-400 border-amber-500' : 'bg-transparent border-white/30'}`} />
                  </div>
                </div>
              </div>
            )}

            {isGameOver && (
              <div className="flex flex-col items-center mb-10">
                <div className="w-14 h-20 rounded-md shadow-[0_0_30px_rgba(244,63,94,0.4)] bg-rose-500 mb-6 animate-bounce" />
                <span className="text-[10px] text-zinc-400 tracking-widest uppercase mb-2 text-center leading-relaxed max-w-[200px]">{gameOverMessage}</span>
                <span className="text-5xl font-extralight text-white">{formattedScore}</span>
              </div>
            )}

            <div className="flex flex-col gap-4 w-full">
              {isGameOver ? (
                <>
                  <button onClick={handleRetry} className="w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors">
                    Retry
                  </button>
                  <button onClick={onExit} className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-light tracking-widest uppercase text-xs hover:bg-white/10 hover:text-white transition-colors">
                    Return to Menu
                  </button>
                </>
              ) : (
                <>
                  <button onClick={togglePause} className="w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors">
                    Resume
                  </button>
                  <button onClick={handleForceQuit} className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-light tracking-widest uppercase text-xs hover:bg-white/10 hover:text-white transition-colors">
                    Quit Match
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