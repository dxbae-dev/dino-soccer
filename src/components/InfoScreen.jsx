import { useEffect } from "react";

export default function InfoScreen({ screen, setScreen }) {
  const getTitle = () => {
    if (screen === "credits" || screen === "info") return "INFO";
    if (screen === "rules") return "RULES";
    if (screen === "howToPlay") return "HOW TO PLAY";
    return "INFO";
  };

  const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  return (
    <div className="flex flex-col items-center w-full max-w-sm p-6 md:p-8 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-[85vh] max-h-[600px]">
      
      <div className="flex flex-col items-center w-full border-b border-white/10 pb-4 mb-4 shrink-0">
        <h2 className="text-xl font-light text-zinc-100 tracking-[0.2em] uppercase text-center">
          {getTitle()}
        </h2>
      </div>

      <div className={`w-full flex-1 overflow-y-auto ${hideScrollbar} mb-6 space-y-6 pr-2`}>
        
        {(screen === "credits" || screen === "info") && (
          <div className="flex flex-col gap-6 text-center mt-2">
            <section>
              <h3 className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-3 drop-shadow-md">About</h3>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Momentum is a fast-paced pixel art endless runner. It is built with a focus on seamless offline capabilities, high-performance rendering, and cross-platform accessibility.
              </p>
            </section>

            <section>
              <h3 className="text-xs font-medium text-amber-400 tracking-widest uppercase mb-3 drop-shadow-md">Development</h3>
              <p className="text-[11px] text-zinc-300 font-light leading-relaxed mb-3">
                Engineered as a Progressive Web App (PWA) using a modern full-stack JavaScript ecosystem.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-md text-[9px] text-zinc-200 tracking-widest shadow-inner">REACT</span>
                <span className="px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-md text-[9px] text-zinc-200 tracking-widest shadow-inner">VITEJS</span>
                <span className="px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-md text-[9px] text-zinc-200 tracking-widest shadow-inner">TAILWIND CSS</span>
                <span className="px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-md text-[9px] text-zinc-200 tracking-widest shadow-inner">PHASER</span>
                <span className="px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-md text-[9px] text-zinc-200 tracking-widest shadow-inner">FIREBASE</span>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-medium text-cyan-400 tracking-widest uppercase mb-3 drop-shadow-md">Credits</h3>
              <div className="text-xs text-zinc-300 font-light leading-relaxed space-y-3">
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block mb-0.5">Lead Developer</span>
                  <span className="font-medium text-white tracking-widest uppercase">Daniel baena</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {screen === "rules" && (
          <div className="flex flex-col gap-4 mt-2">
             <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-lg">
               <h3 className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-2 text-center drop-shadow-md">Objective</h3>
               <p className="text-xs text-zinc-300 font-light leading-relaxed text-center">Survive as long as possible. The game gets progressively faster. Dodge obstacles to keep your momentum.</p>
             </div>
             <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-lg">
               <h3 className="text-xs font-medium text-amber-400 tracking-widest uppercase mb-2 text-center drop-shadow-md">Health System</h3>
               <p className="text-xs text-zinc-300 font-light leading-relaxed text-center">You start with 3 lives (Cards). Hitting an obstacle removes one. Lose all your cards, and it is Game Over.</p>
             </div>
             <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-lg">
               <h3 className="text-xs font-medium text-cyan-400 tracking-widest uppercase mb-2 text-center drop-shadow-md">Scoring</h3>
               <p className="text-xs text-zinc-300 font-light leading-relaxed text-center">Points are awarded continuously as you run. Collecting Yellow Cards grants bonus points and helps build the Fever meter.</p>
             </div>
          </div>
        )}

        {screen === "howToPlay" && (
          <div className="flex flex-col gap-3 mt-2">
             <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-lg">
                <div className="w-12 h-12 shrink-0 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                  <img src="/assets/icons/arrow-up.svg" alt="Jump" className="w-6 h-6 brightness-0 invert opacity-90" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-white tracking-widest uppercase mb-1">Jump</h3>
                  <p className="text-[11px] text-zinc-400 font-light leading-relaxed">Tap the Up button, swipe up, or press SPACE/UP to jump over low obstacles.</p>
                </div>
             </div>

             <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-lg">
                <div className="w-12 h-12 shrink-0 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                  <img src="/assets/icons/arrow-down.svg" alt="Slide" className="w-6 h-6 brightness-0 invert opacity-90" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-white tracking-widest uppercase mb-1">Slide</h3>
                  <p className="text-[11px] text-zinc-400 font-light leading-relaxed">Hold the Down button, swipe down, or press DOWN to slide under high obstacles.</p>
                </div>
             </div>

             <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-red-500/10 shadow-lg">
                <div className="w-12 h-12 shrink-0 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shadow-inner">
                  <img src="/assets/icons/zap.svg" alt="Fever" className="w-6 h-6 brightness-0 invert opacity-90" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-red-400 tracking-widest uppercase mb-1">Fever Mode</h3>
                  <p className="text-[11px] text-zinc-400 font-light leading-relaxed">Fill the meter to unlock Fever. Tap the Lightning button or press F to become invincible!</p>
                </div>
             </div>
          </div>
        )}
        
      </div>

      <button 
        onClick={() => setScreen('menu')}
        className="w-full py-4 shrink-0 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors active:scale-95 shadow-lg flex items-center justify-center gap-3 mt-auto"
      >
        <img src="/assets/icons/arrow-left.svg" alt="Back" className="w-4 h-4 brightness-0" />
        RETURN TO MENU
      </button>
    </div>
  );
}