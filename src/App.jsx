import { useState } from "react";
import PhaserGame from "./components/PhaserGame";
import MainMenu from "./components/MainMenu";
import InfoScreen from "./components/InfoScreen";
import GameUI from "./components/UI/GameUI";

function App() {
  const [currentScreen, setCurrentScreen] = useState("menu");

  return (
    <div
      // CLAVES AQUÍ: fixed, inset-0, h-[100dvh] y overflow-hidden bloquean cualquier scroll
      className="fixed inset-0 w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center bg-black select-none touch-none"
      style={{
        backgroundImage: "url('/assets/fondo.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/75 z-0"></div>

      <div className="z-10 flex flex-col items-center w-full h-full justify-center relative">
        {currentScreen === "menu" && <MainMenu setScreen={setCurrentScreen} />}

        {currentScreen === "game" && (
          // GameUI ahora envuelve al juego para separar el layout
          <GameUI onExit={() => setCurrentScreen("menu")}>
            <PhaserGame />
          </GameUI>
        )}

        {["settings", "rules", "howToPlay"].includes(currentScreen) && (
          <InfoScreen screen={currentScreen} setScreen={setCurrentScreen} />
        )}
      </div>
    </div>
  );
}

export default App;