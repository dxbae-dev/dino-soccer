import { useState, useEffect } from "react";
import { getLeaderboard } from "../firebase/userService";
import { useAuth } from "../firebase/AuthContext";

export default function LeaderboardScreen({ setScreen }) {
  const { currentUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard(10);
      setLeaders(data);
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const getMedalColor = (index) => {
    switch (index) {
      case 0: return "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"; // Oro
      case 1: return "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.6)]"; // Plata
      case 2: return "text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.6)]"; // Bronce
      default: return "text-zinc-400";
    }
  };

  const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  return (
    <div className="flex flex-col items-center w-full max-w-sm p-6 md:p-8 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-[85vh] max-h-[600px]">
      
      <div className="flex flex-col items-center w-full border-b border-white/10 pb-4 mb-4 shrink-0">
        <img src="/assets/icons/trophy.svg" alt="Trophy" className="w-8 h-8 opacity-80 mb-2 brightness-0 invert" />
        <h2 className="text-xl font-light text-zinc-100 tracking-[0.2em] uppercase text-center">
          Top Runners
        </h2>
      </div>

      <div className={`w-full flex-1 overflow-y-auto ${hideScrollbar} mb-6 flex flex-col gap-2`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-xs tracking-widest uppercase">
            No records found
          </div>
        ) : (
          leaders.map((leader, index) => {
            const isMe = currentUser && currentUser.uid === leader.id;
            const scoreStr = leader.highScore.toString().padStart(5, "0");
            
            return (
              <div 
                key={leader.id} 
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isMe 
                    ? "bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                    : "bg-black/40 border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-bold text-lg ${getMedalColor(index)}`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm font-medium tracking-widest uppercase ${isMe ? "text-emerald-400" : "text-zinc-200"}`}>
                    {leader.nickname}
                  </span>
                </div>
                <span className="text-lg font-light text-white tracking-widest">
                  {scoreStr}
                </span>
              </div>
            );
          })
        )}
      </div>

      <button 
        onClick={() => setScreen('menu')}
        className="w-full py-4 shrink-0 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors active:scale-95 shadow-lg flex items-center justify-center gap-3"
      >
        <img src="/assets/icons/arrow-left.svg" alt="Back" className="w-4 h-4 brightness-0" />
        RETURN TO MENU
      </button>

    </div>
  );
}