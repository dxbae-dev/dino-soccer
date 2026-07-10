import { useEffect, useState } from "react";

export default function MainMenu({ setScreen }) {
  const [highScore, setHighScore] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const high = localStorage.getItem("highScore") || "0";
    setHighScore(high);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      if (!sessionStorage.getItem("installDismissed")) {
        setShowInstallModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallModal(false);
    }
  };

  const handleDismissInstall = () => {
    sessionStorage.setItem("installDismissed", "true");
    setShowInstallModal(false);
  };

  const MenuButton = ({ text, onClick, isPrimary = false }) => (
    <button
      onClick={onClick}
      className={`w-full max-w-[240px] md:max-w-[280px] mb-3 md:mb-4 py-3 md:py-4 rounded-full font-medium tracking-[0.2em] uppercase text-xs md:text-sm transition-all duration-300 active:scale-95 shadow-lg backdrop-blur-md border ${
        isPrimary 
          ? "bg-emerald-500/90 hover:bg-emerald-400 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]" 
          : "bg-black/40 hover:bg-white hover:text-black hover:border-white border-white/10 text-zinc-300 font-light hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      }`}
    >
      {text}
    </button>
  );

  const displayScore = Math.max(0, parseInt(highScore));
  const formattedScore = displayScore.toString().padStart(5, "0");

  const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  return (
    <>
      <div className={`flex flex-col md:flex-row items-center justify-center md:justify-evenly gap-6 md:gap-8 w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 h-full overflow-y-auto md:overflow-visible animate-in fade-in zoom-in-95 duration-500 ${hideScrollbar}`}>
        
        {/* Columna Izquierda: Branding y Score */}
        <div className="flex flex-col items-center w-full md:w-1/2 shrink-0">
          <div className="relative mb-4 md:mb-6 rounded-full w-24 h-24 md:w-36 md:h-36 bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl overflow-hidden shrink-0">
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: "url('/icon-512.png')",
                backgroundPosition: "center",
                backgroundSize: "70%",
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
              }}
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-extralight mb-6 md:mb-8 tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 text-center drop-shadow-sm shrink-0">
            Momentum
          </h1>

          <div className="flex flex-col items-center bg-black/40 px-10 py-4 md:px-14 md:py-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl shrink-0">
            <span className="text-[10px] md:text-xs text-zinc-400 tracking-widest uppercase mb-1 md:mb-2">
              High Score
            </span>
            <span className="text-3xl md:text-5xl font-light text-white tracking-widest drop-shadow-md">
              {formattedScore}
            </span>
          </div>
        </div>

        {/* Columna Derecha: Botones */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 shrink-0 mt-2 md:mt-0">
          <MenuButton text="Play" onClick={() => setScreen("game")} isPrimary={true} />
          <MenuButton text="How to Play" onClick={() => setScreen("howToPlay")} />
          <MenuButton text="Rules" onClick={() => setScreen("rules")} />
          <MenuButton text="Credits" onClick={() => setScreen("credits")} />
          {installPrompt && (
            <MenuButton text="Install App" onClick={handleInstallClick} />
          )}
        </div>

      </div>

      {showInstallModal && installPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center w-full max-w-sm p-8 rounded-3xl bg-black/60 border border-white/10 shadow-2xl text-center animate-in zoom-in-95 duration-500">
            <h3 className="text-lg font-light text-white tracking-[0.2em] uppercase mb-4">
              Install Game
            </h3>
            <p className="text-zinc-400 font-light text-xs leading-relaxed mb-8 tracking-wide px-2">
              Install Momentum on your device to play offline anytime, anywhere. Experience faster load times and fullscreen gameplay.
            </p>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleInstallClick}
                className="w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors active:scale-95 shadow-lg"
              >
                Install Now
              </button>
              <button
                onClick={handleDismissInstall}
                className="w-full py-4 rounded-full bg-transparent border border-white/10 text-zinc-300 font-light tracking-widest uppercase text-xs hover:bg-white/10 hover:text-white transition-colors active:scale-95"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}