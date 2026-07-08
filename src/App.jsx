// src/App.jsx
import { useState } from "react";
import PhaserGame from "./components/PhaserGame";
import MainMenu from "./components/MainMenu";
import InfoScreen from "./components/InfoScreen";
import GameUI from "./components/UI/GameUI";

function App() {
  // Ahora manejamos varias pantallas, no solo un booleano
  const [currentScreen, setCurrentScreen] = useState("menu");

  return (
    <div
      className="min-h-screen w-full overflow-hidden flex flex-col items-center justify-center relative bg-black"
      style={{
        backgroundImage: "url('/assets/fondo.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Oscurecemos un poco más el fondo (bg-black/75) para que el blanco puro resalte mucho más */}
      <div className="absolute inset-0 bg-black/75 z-0"></div>

      <div className="z-10 flex flex-col items-center w-full h-full justify-center">
        {currentScreen === "menu" && <MainMenu setScreen={setCurrentScreen} />}

        {currentScreen === "game" && (
          <div className="absolute inset-0 w-full h-full flex flex-col z-20">
            
            <GameUI onExit={() => setCurrentScreen("menu")} />
            <PhaserGame />
          </div>
        )}

        {/* Pantallas secundarias reutilizables */}
        {["settings", "rules", "howToPlay"].includes(currentScreen) && (
          <InfoScreen screen={currentScreen} setScreen={setCurrentScreen} />
        )}
      </div>
    </div>
  );
}

export default App;
