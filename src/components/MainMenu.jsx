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

  const MenuButton = ({ text, onClick }) => (
    <button
      onClick={onClick}
      className="w-64 mb-3.5 py-3.5 rounded-full bg-black/40 border border-white/10 text-zinc-300 font-light tracking-[0.2em] uppercase text-sm hover:bg-white hover:text-black hover:border-white transition-all duration-300 active:scale-95 backdrop-blur-md shadow-lg"
    >
      {text}
    </button>
  );

  const displayScore = Math.max(0, parseInt(highScore));
  const formattedScore = displayScore.toString().padStart(5, "0");

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-6 rounded-full w-28 h-28 bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl overflow-hidden">
          <div
            style={{
              width: "84px",
              height: "96px",
              backgroundImage: "url('/icon-512.png')",
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
            }}
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-extralight mb-10 tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 text-center drop-shadow-sm">
          Momentum
        </h1>

        <div className="flex flex-col items-center mb-10 bg-black/40 px-12 py-5 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
          <span className="text-[10px] text-zinc-400 tracking-widest uppercase mb-1.5">
            High Score
          </span>
          <span className="text-3xl md:text-4xl font-light text-white tracking-widest drop-shadow-md">
            {formattedScore}
          </span>
        </div>

        <div className="flex flex-col items-center w-full">
          <MenuButton text="Play" onClick={() => setScreen("game")} />
          <MenuButton text="How to Play" onClick={() => setScreen("howToPlay")} />
          <MenuButton text="Rules" onClick={() => setScreen("rules")} />
          <MenuButton text="Credits" onClick={() => setScreen("credits")} />
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