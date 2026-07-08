// src/App.jsx
import { useState } from "react";
import PhaserGame from "./components/PhaserGame";
import MainMenu from "./components/MainMenu";
import InfoScreen from "./components/InfoScreen";

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
          // position absolute y z-20 aseguran que el juego cubra toda la pantalla
          <div className="absolute inset-0 w-full h-full flex flex-col z-20">
            {/* Botón flotante en la esquina superior derecha */}
            <button
              onClick={() => setCurrentScreen("menu")}
              className="absolute top-6 right-6 px-4 py-2 text-white font-mono uppercase text-xs border border-white/50 hover:bg-white/20 transition-colors z-30"
            >
              Salir del partido
            </button>

            {/* El canvas del juego */}
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
