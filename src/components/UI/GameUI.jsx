import { useEffect, useState } from "react";
import { EventBus } from "../../game/EventBus";
import { useAuth } from "../../firebase/AuthContext";
import { updateUserScore, getUserProfile } from "../../firebase/userService";

const msgsNegative = ["TOUGH MATCH", "THAT HURT", "BETTER LUCK NEXT ROUND", "SHAKE IT OFF", "OFF DAY", "NOT THE RESULT YOU WANTED", "ROUGH START", "KEEP YOUR HEAD UP", "EVERY PRO LEARNS THIS WAY", "THE COMEBACK STARTS NOW"];
const msgsHigh = ["NEW HIGH SCORE", "NEW PERSONAL BEST", "RECORD BROKEN", "TOP PERFORMANCE", "THAT WAS IMPRESSIVE", "UNSTOPPABLE", "ELITE RUN", "YOU SET THE BAR", "HISTORY MADE", "PEAK PERFORMANCE", "LEGENDARY RUN"];
const msgsAlmost = ["ALMOST HIGH SCORE", "SO CLOSE", "WITHIN REACH", "NEXT RUN IS THE ONE", "ALMOST THERE", "ONE MORE TRY", "CLOSER THAN EVER", "THE RECORD IS SHAKING", "JUST A LITTLE MORE", "YOU'RE GETTING THERE", "THE BEST IS YET TO COME"];
const msgsNormal = ["GOOD EFFORT", "SOLID RUN", "WELL PLAYED", "NICE GAME", "GOOD MATCH", "KEEP PRACTICING", "STRONG EFFORT", "CLEAN RUN", "KEEP THE MOMENTUM", "EVERY MATCH COUNTS", "ON TO THE NEXT ONE"];

const getRandomMsg = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function GameUI({ onExit, children }) {
  const { currentUser } = useAuth();
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore') || "0"));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [damageText, setDamageText] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [scoreTier, setScoreTier] = useState("normal");
  
  const [feverReady, setFeverReady] = useState(false);
  const [feverActive, setFeverActive] = useState(false);
  const [feverProgress, setFeverProgress] = useState(0);
  const [activeCard, setActiveCard] = useState(null); 

  useEffect(() => {
    if (currentUser) {
      const isGuest = localStorage.getItem("isGuest") === "true";
      if (!isGuest) {
        getUserProfile(currentUser.uid).then(profile => {
          if (profile && profile.highScore !== undefined) {
            setHighScore(profile.highScore);
            localStorage.setItem("highScore", profile.highScore);
          }
        });
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused((prev) => {
          if (!prev && !isGameOver) {
            EventBus.emit("toggle-pause", true);
            return true;
          }
          return prev;
        });
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isGameOver]);

  useEffect(() => {
    const handleScore = (newScore) => {
      setScore(newScore);
      const currentHigh = parseInt(localStorage.getItem('highScore') || "0");
      if (newScore > currentHigh && !isNewRecord) {
        setIsNewRecord(true);
      }
    };
    
    const handleLives = (newLives) => setLives(newLives);
    
    const handleDamage = (text) => {
      setDamageText(text);
      setTimeout(() => setDamageText(null), 1000);
    };
    
    const handleFeverReady = (state) => {
      setFeverReady(state);
      if (state) {
        handleShowCard("fever");
      }
    };

    const handleFeverActive = (state) => setFeverActive(state);
    const handleFeverProgress = (progress) => setFeverProgress(progress);
    
    const handleShowCard = (color) => {
      setActiveCard(color);
      if (color === "yellow" || color === "fever") {
        setTimeout(() => setActiveCard(null), 1500); 
      }
    };

    const handleGameOver = async (payload) => {
      setIsGameOver(true);
      
      const finalScore = payload?.score !== undefined ? payload.score : 0;
      const customMessage = payload?.customMessage || null;
      
      const numericFinalScore = Math.floor(finalScore);
      const currentHigh = parseInt(localStorage.getItem('highScore') || "0");
      const isGuest = localStorage.getItem('isGuest') === 'true';
      
      const isActuallyNewRecord = isNewRecord || (numericFinalScore > currentHigh && numericFinalScore > 0);

      if (numericFinalScore >= currentHigh && numericFinalScore > 0) {
        setHighScore(numericFinalScore);
        localStorage.setItem('highScore', numericFinalScore);
        
        if (currentUser && !isGuest) {
          try {
            await updateUserScore(currentUser.uid, currentHigh, numericFinalScore);
          } catch (error) {
            console.error(error);
          }
        }
      }

      if (customMessage) {
        setGameOverMessage(customMessage);
        setScoreTier("normal");
      } else {
        if (isActuallyNewRecord) {
          setGameOverMessage(getRandomMsg(msgsHigh));
          setScoreTier("high");
        } else if (numericFinalScore <= 50) {
          setGameOverMessage(getRandomMsg(msgsNegative));
          setScoreTier("low");
        } else if (numericFinalScore >= currentHigh * 0.8 && numericFinalScore > 0) {
          setGameOverMessage(getRandomMsg(msgsAlmost));
          setScoreTier("almost");
        } else {
          setGameOverMessage(getRandomMsg(msgsNormal));
          setScoreTier("normal");
        }
      }
    };

    const togglePauseFromEvent = () => togglePause();

    EventBus.on("update-score", handleScore);
    EventBus.on("update-lives", handleLives);
    EventBus.on("game-over", handleGameOver);
    EventBus.on("show-damage", handleDamage);
    EventBus.on("fever-ready", handleFeverReady);
    EventBus.on("fever-active", handleFeverActive);
    EventBus.on("update-fever-progress", handleFeverProgress);
    EventBus.on("show-card", handleShowCard);
    EventBus.on("request-pause-toggle", togglePauseFromEvent);

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
      EventBus.off("request-pause-toggle", togglePauseFromEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameOver, feverReady, isPaused, isNewRecord, currentUser]);

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
    setActiveCard(null); 
    EventBus.emit("restart-game");
  };

  const handleForceQuit = () => {
    setIsPaused(false);
    setTimeout(() => {
      EventBus.emit("force-game-over", "EVERY CHAMPION TAKES A BREAK...");
    }, 10);
  };

  const displayScore = Math.max(0, Math.floor(score));
  const formattedScore = displayScore.toString().padStart(5, "0");

  let scoreColor = "text-white";
  if (scoreTier === "high") scoreColor = "text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]";
  else if (scoreTier === "low") scoreColor = "text-zinc-600";
  else if (scoreTier === "almost") scoreColor = "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]";

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col pointer-events-none font-sans" style={{ WebkitTouchCallout: 'none' }}>
      
      <div className="flex-1 relative w-full h-full pointer-events-auto">
        <div className="absolute inset-0 z-10">
          {children}
        </div>

        <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 ease-in-out ${isPaused || isGameOver ? 'opacity-0' : 'opacity-100'}`}>
          
          <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 flex justify-between items-start z-40">
            
            <div className="flex flex-col gap-3 pointer-events-auto">
              <div className="flex flex-col bg-black/50 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg min-w-[120px]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1 drop-shadow-md">
                  {isNewRecord ? <span className="text-amber-400 animate-pulse">New Record!</span> : "Score"}
                </span>
                <span className={`text-3xl md:text-4xl font-light tracking-widest drop-shadow-md ${isNewRecord ? 'text-amber-400' : 'text-white'}`}>
                  {formattedScore}
                </span>
              </div>
              
              <div className="flex gap-3 bg-black/40 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg self-start">
                <div className={`w-4 h-6 md:w-5 md:h-7 rounded-[4px] border-2 transition-all duration-300 ${lives <= 2 ? 'bg-amber-400 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'bg-transparent border-white/30'}`} />
                <div className={`w-4 h-6 md:w-5 md:h-7 rounded-[4px] border-2 transition-all duration-300 ${lives <= 1 ? 'bg-amber-400 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'bg-transparent border-white/30'}`} />
              </div>
            </div>

            <div className="pointer-events-auto">
              <button
                onClick={togglePause}
                onContextMenu={(e) => e.preventDefault()}
                style={{ WebkitTouchCallout: 'none' }}
                className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md shadow-lg group"
              >
                <img src="/assets/icons/pause.svg" alt="Pause" draggable="false" className="w-5 h-5 brightness-0 invert group-active:scale-95 transition-transform pointer-events-none select-none" />
              </button>
            </div>
          </div>

          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-auto">
            <div className={`w-3 md:w-4 h-40 md:h-64 rounded-full bg-black/50 border border-white/10 relative overflow-hidden backdrop-blur-md transition-all duration-500 ${feverReady && !feverActive ? 'shadow-[0_0_25px_rgba(6,182,212,0.9)] border-cyan-500 scale-105 animate-pulse' : 'shadow-lg'}`}>
              <div 
                className={`absolute bottom-0 w-full transition-all duration-300 ease-out rounded-full ${feverActive ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,1)]' : feverReady ? 'bg-cyan-500' : 'bg-cyan-400/50'}`}
                style={{ height: `${feverProgress}%` }}
              />
            </div>
          </div>

          {damageText && (
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-xl md:text-2xl font-light tracking-widest text-amber-400 bg-black/80 px-8 py-3 rounded-full backdrop-blur-md border border-amber-400/30 animate-bounce z-50 shadow-2xl whitespace-nowrap">
              {damageText}
            </div>
          )}

          {activeCard && (
            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none transition-all">
              {activeCard === 'yellow' && (
                <div className="w-14 h-20 md:w-16 md:h-24 rounded-md shadow-[0_0_30px_rgba(251,191,36,0.6)] bg-amber-400 animate-bounce border border-white/20" />
              )}
              {activeCard === 'red' && (
                <div className="w-14 h-20 md:w-16 md:h-24 rounded-md shadow-[0_0_30px_rgba(239,68,68,0.6)] bg-red-500 animate-bounce border border-white/20" />
              )}
              {activeCard === 'fever' && (
                <div className="w-14 h-20 md:w-16 md:h-24 rounded-md shadow-[0_0_30px_rgba(6,182,212,0.8)] bg-cyan-500 border-2 border-cyan-400 animate-bounce flex items-center justify-center">
                  <img src="/assets/icons/zap.svg" alt="Fever" className="w-8 h-8 brightness-0 invert animate-pulse" />
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-0 left-0 w-full h-28 md:hidden z-30 flex items-center justify-center gap-8 pointer-events-auto pb-4">
            <button 
              onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', true); }}
              onPointerUp={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', false); }}
              onPointerLeave={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'slide', false); }}
              onContextMenu={(e) => e.preventDefault()}
              style={{ WebkitTouchCallout: 'none' }}
              className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center active:bg-white/20 backdrop-blur-md transition-colors shadow-lg group select-none"
            >
              <img src="/assets/icons/arrow-down.svg" alt="Slide" draggable="false" className="w-8 h-8 brightness-0 invert opacity-80 group-active:opacity-100 transition-opacity pointer-events-none select-none" />
            </button>

            <button 
              onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'fever', true); }}
              onContextMenu={(e) => e.preventDefault()}
              style={{ WebkitTouchCallout: 'none' }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg select-none ${
                feverReady && !feverActive 
                  ? 'bg-cyan-500/80 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-pulse scale-110' 
                  : 'bg-black/30 border border-white/5'
              }`}
            >
              <img src="/assets/icons/zap.svg" alt="Fever" draggable="false" className={`w-8 h-8 brightness-0 invert pointer-events-none select-none ${!(feverReady && !feverActive) && 'opacity-30'}`} />
            </button>

            <button 
              onPointerDown={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', true); }}
              onPointerUp={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', false); }}
              onPointerLeave={(e) => { e.preventDefault(); EventBus.emit('virtual-input', 'jump', false); }}
              onContextMenu={(e) => e.preventDefault()}
              style={{ WebkitTouchCallout: 'none' }}
              className="w-16 h-16 rounded-full bg-black/60 border border-white/30 flex items-center justify-center active:bg-white/30 backdrop-blur-md transition-colors shadow-xl group select-none"
            >
              <img src="/assets/icons/arrow-up.svg" alt="Jump" draggable="false" className="w-8 h-8 brightness-0 invert opacity-90 group-active:opacity-100 transition-opacity pointer-events-none select-none" />
            </button>
          </div>
        </div>

      </div>

      {(isPaused || isGameOver) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 bg-zinc-800/50 backdrop-blur-md transition-all duration-300">
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
                <div className="w-14 h-20 rounded-md shadow-[0_0_50px_rgba(244,63,94,0.6)] bg-rose-600 mb-6 animate-pulse" />
                <span className="text-xs md:text-sm text-zinc-400 tracking-widest uppercase mb-2 text-center leading-relaxed max-w-[250px]">{gameOverMessage}</span>
                <span className={`text-5xl font-extralight ${scoreColor}`}>{formattedScore}</span>
              </div>
            )}

            <div className="flex flex-col gap-4 w-full">
              {isGameOver ? (
                <>
                  <button onClick={handleRetry} onContextMenu={(e) => e.preventDefault()} style={{ WebkitTouchCallout: 'none' }} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors select-none">
                    <img src="/assets/icons/refresh-ccw.svg" alt="Retry" draggable="false" className="w-4 h-4 brightness-0 pointer-events-none" />
                    RETRY
                  </button>
                  <button onClick={onExit} onContextMenu={(e) => e.preventDefault()} style={{ WebkitTouchCallout: 'none' }} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-light tracking-widest uppercase text-xs hover:bg-white/10 hover:text-white transition-colors select-none">
                    <img src="/assets/icons/home.svg" alt="Menu" draggable="false" className="w-4 h-4 brightness-0 invert pointer-events-none" />
                    RETURN TO MENU
                  </button>
                </>
              ) : (
                <>
                  <button onClick={togglePause} onContextMenu={(e) => e.preventDefault()} style={{ WebkitTouchCallout: 'none' }} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors select-none">
                    <img src="/assets/icons/play.svg" alt="Resume" draggable="false" className="w-4 h-4 brightness-0 pointer-events-none" />
                    RESUME
                  </button>
                  <button onClick={handleForceQuit} onContextMenu={(e) => e.preventDefault()} style={{ WebkitTouchCallout: 'none' }} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-light tracking-widest uppercase text-xs hover:bg-white/10 hover:text-white transition-colors select-none">
                    <img src="/assets/icons/x.svg" alt="Quit" draggable="false" className="w-4 h-4 brightness-0 invert pointer-events-none" />
                    QUIT MATCH
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