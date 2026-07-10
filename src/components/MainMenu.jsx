import { useEffect, useState } from "react";

export default function MainMenu({ setScreen }) {
  const [highScore, setHighScore] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const high = localStorage.getItem("highScore") || "0";
    setHighScore(high);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
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
    }
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
        {installPrompt && (
          <MenuButton text="Install App" onClick={handleInstallClick} />
        )}
      </div>
    </div>
  );
}