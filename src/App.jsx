import { useState } from "react";
import PhaserGame from "./components/PhaserGame";
import MainMenu from "./components/MainMenu";
import InfoScreen from "./components/InfoScreen";
import GameUI from "./components/UI/GameUI";

function App() {
  const [currentScreen, setCurrentScreen] = useState("menu");

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
        className={`absolute inset-0 z-0 transition-all duration-700 ease-in-out pointer-events-none ${
          currentScreen === "game" 
            ? "bg-zinc-950/50 backdrop-blur-[1px]" 
            : "bg-zinc-950/75 backdrop-blur-[4px]"
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
      </div>
    </div>
  );
}

export default App;