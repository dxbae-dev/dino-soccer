import { useState, useEffect } from "react";
import PhaserGame from "./components/PhaserGame";
import MainMenu from "./components/MainMenu";
import InfoScreen from "./components/InfoScreen";
import GameUI from "./components/UI/GameUI";
import AccountScreen from "./components/AccountScreen";
import { EventBus } from "./game/EventBus";

function App() {
  const [currentScreen, setCurrentScreen] = useState("menu");
  const [gameDarken, setGameDarken] = useState(false);

  useEffect(() => {
    const handlePause = (paused) => setGameDarken(paused);
    const handleGameOver = () => setGameDarken(true);
    const handleRestart = () => setGameDarken(false);

    EventBus.on("toggle-pause", handlePause);
    EventBus.on("game-over", handleGameOver);
    EventBus.on("restart-game", handleRestart);

    return () => {
      EventBus.off("toggle-pause", handlePause);
      EventBus.off("game-over", handleGameOver);
      EventBus.off("restart-game", handleRestart);
    };
  }, []);

  useEffect(() => {
    if (currentScreen !== "game") {
      setGameDarken(false);
    }
  }, [currentScreen]);

  const isDark = currentScreen !== "game" || gameDarken;

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-sans select-none touch-none antialiased"
      style={{
        backgroundImage: "url('/assets/fondo.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div 
        className={`absolute inset-0 z-0 pointer-events-none transition-all duration-500 ease-in-out ${
          isDark 
            ? "bg-zinc-800/50 backdrop-blur-md" 
            : "bg-zinc-800/50 backdrop-blur-[1px]"
        }`}
      ></div>

      <div className="z-10 flex flex-col items-center w-full h-full justify-center relative">
        {currentScreen === "menu" && <MainMenu setScreen={setCurrentScreen} />}

        {currentScreen === "game" && (
          <GameUI onExit={() => setCurrentScreen("menu")}>
            <PhaserGame />
          </GameUI>
        )}

        {["credits", "rules", "howToPlay"].includes(currentScreen) && (
          <InfoScreen screen={currentScreen} setScreen={setCurrentScreen} />
        )}

        {currentScreen === "account" && <AccountScreen setScreen={setCurrentScreen} />}
      </div>
    </div>
  );
}

export default App;