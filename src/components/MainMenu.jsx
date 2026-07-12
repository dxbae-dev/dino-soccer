import { useEffect, useState } from "react";
import { useAuth } from "../firebase/AuthContext";
import { getUserProfile, isNicknameAvailable, createUserProfile, loginWithGoogle, recoverWithTransferCode, linkGoogleAccount } from "../firebase/userService";

export default function MainMenu({ setScreen }) {
  const { currentUser } = useAuth();
  const [highScore, setHighScore] = useState(0);
  const [playerNickname, setPlayerNickname] = useState("");
  const [needsNickname, setNeedsNickname] = useState(false);
  const [nickInput, setNickInput] = useState("");
  const [nickError, setNickError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoverNick, setRecoverNick] = useState("");
  const [recoverCode, setRecoverCode] = useState("");
  
  const [newProfileData, setNewProfileData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setHighScore(profile.highScore);
          setPlayerNickname(profile.nickname);
          setNeedsNickname(false);
          setRecoveryMode(false);
        } else {
          setNeedsNickname(true);
        }
      }
    };
    loadProfile();
  }, [currentUser]);

  useEffect(() => {
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

  const handleNickSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nickInput.trim();
    if (trimmed.length < 3) {
      setNickError("MUST BE AT LEAST 3 CHARACTERS");
      return;
    }
    
    setIsSubmitting(true);
    setNickError("");
    
    const available = await isNicknameAvailable(trimmed);
    
    if (available) {
      const newProfile = await createUserProfile(currentUser.uid, trimmed);
      setPlayerNickname(newProfile.nickname);
      setHighScore(newProfile.highScore);
      setNewProfileData(newProfile);
    } else {
      setNickError("NICKNAME IS ALREADY TAKEN");
    }
    setIsSubmitting(false);
  };

  const handlePostRegGoogle = async () => {
    setIsSubmitting(true);
    setNickError("");
    try {
      await linkGoogleAccount();
      setNewProfileData(null);
      setNeedsNickname(false);
    } catch (e) {
      setNickError("ERROR LINKING ACCOUNT");
    }
    setIsSubmitting(false);
  };

  const handleContinue = () => {
    setNewProfileData(null);
    setNeedsNickname(false);
  };

  const handleRecoverGoogle = async () => {
    setIsSubmitting(true);
    setNickError("");
    try {
      await loginWithGoogle();
    } catch (e) {
      setNickError("ERROR RECOVERING ACCOUNT");
      setIsSubmitting(false);
    }
  };

  const handleRecoverCode = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNickError("");
    try {
      const success = await recoverWithTransferCode(recoverNick.toUpperCase(), recoverCode.toUpperCase(), currentUser.uid);
      if (success) {
        const profile = await getUserProfile(currentUser.uid);
        setPlayerNickname(profile.nickname);
        setHighScore(profile.highScore);
        setNeedsNickname(false);
        setRecoveryMode(false);
      } else {
        setNickError("INVALID NICKNAME OR CODE");
      }
    } catch (e) {
      setNickError("ERROR RECOVERING ACCOUNT");
    }
    setIsSubmitting(false);
  };

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

  const MenuButton = ({ text, onClick, isPrimary = false, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full max-w-[240px] md:max-w-[280px] mb-3 md:mb-4 py-3 md:py-4 rounded-full font-medium tracking-[0.2em] uppercase text-xs md:text-sm transition-all duration-300 shadow-lg backdrop-blur-md border ${
        disabled 
          ? "opacity-50 cursor-not-allowed bg-black/40 border-white/10 text-zinc-500"
          : isPrimary 
            ? "bg-emerald-500/90 hover:bg-emerald-400 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-95" 
            : "bg-black/40 hover:bg-white hover:text-black hover:border-white border-white/10 text-zinc-300 font-light hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
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
            {playerNickname && (
              <span className="text-sm font-medium text-emerald-400 tracking-widest mb-4 uppercase drop-shadow-md">
                {playerNickname}
              </span>
            )}
            <span className="text-[10px] md:text-xs text-zinc-400 tracking-widest uppercase mb-1 md:mb-2">
              High Score
            </span>
            <span className="text-3xl md:text-5xl font-light text-white tracking-widest drop-shadow-md">
              {formattedScore}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full md:w-1/2 shrink-0 mt-2 md:mt-0">
          <MenuButton text="Play" onClick={() => setScreen("game")} isPrimary={true} disabled={needsNickname || !currentUser} />
          <MenuButton text="Account" onClick={() => setScreen("account")} disabled={needsNickname || !currentUser} />
          <MenuButton text="How to Play" onClick={() => setScreen("howToPlay")} disabled={needsNickname || !currentUser} />
          <MenuButton text="Rules" onClick={() => setScreen("rules")} disabled={needsNickname || !currentUser} />
          <MenuButton text="Credits" onClick={() => setScreen("credits")} disabled={needsNickname || !currentUser} />
          {installPrompt && (
            <MenuButton text="Install App" onClick={handleInstallClick} disabled={needsNickname || !currentUser} />
          )}
        </div>

      </div>

      {showInstallModal && installPrompt && !needsNickname && (
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

      {needsNickname && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center w-full max-w-sm p-8 rounded-3xl bg-black/60 border border-white/10 shadow-2xl text-center animate-in zoom-in-95 duration-500">
            
            {newProfileData ? (
              <div className="flex flex-col items-center w-full">
                <h3 className="text-lg font-light text-emerald-400 tracking-[0.2em] uppercase mb-4">
                  ACCOUNT CREATED
                </h3>
                <p className="text-white font-medium text-xs leading-relaxed tracking-wide px-2 mb-2">
                  Please take a screenshot of this code.
                </p>
                <p className="text-zinc-400 font-light text-xs leading-relaxed tracking-wide px-2 mb-4">
                  You will need it to recover your data if you clear your browser.
                </p>
                
                <div className="bg-white/5 border border-white/20 p-4 rounded-xl w-full mb-6">
                  <span className="text-emerald-400 text-lg tracking-widest font-mono">{newProfileData.transferCode}</span>
                </div>

                <div className="h-4 mb-2">
                  {nickError && <span className="text-red-400 text-[10px] uppercase tracking-widest block animate-in fade-in">{nickError}</span>}
                </div>

                <button 
                  onClick={handlePostRegGoogle}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-blue-600/90 text-white font-medium tracking-widest uppercase text-xs hover:bg-blue-500 transition-colors shadow-lg disabled:opacity-50 mb-3"
                >
                  {isSubmitting ? "WAIT..." : "SECURE WITH GOOGLE INSTEAD"}
                </button>
                <button 
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors active:scale-95 shadow-lg"
                >
                  CONTINUE TO GAME
                </button>
              </div>
            ) : !recoveryMode ? (
              <form onSubmit={handleNickSubmit} className="flex flex-col items-center w-full">
                <h3 className="text-lg font-light text-white tracking-[0.2em] uppercase mb-4">
                  Create Nickname
                </h3>
                <p className="text-zinc-400 font-light text-xs leading-relaxed mb-6 tracking-wide px-2">
                  This name will represent you on the leaderboard. It cannot be changed later.
                </p>
                <input
                  type="text"
                  value={nickInput}
                  onChange={(e) => setNickInput(e.target.value.replace(/[^a-zA-Z0-9_.]/g, "").toUpperCase())}
                  maxLength={12}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-400 transition-colors mb-2"
                  placeholder="YOUR_NAME"
                  autoFocus
                />
                <div className="h-4 mb-4">
                  {nickError && <span className="text-red-400 text-[10px] uppercase tracking-widest block animate-in fade-in">{nickError}</span>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || nickInput.trim().length < 3}
                  className="w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors active:scale-95 shadow-lg mb-4"
                >
                  {isSubmitting ? "SAVING..." : "CONFIRM"}
                </button>
                <button
                  type="button"
                  onClick={() => { setRecoveryMode(true); setNickError(""); }}
                  className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest transition-colors underline underline-offset-4"
                >
                  Already have an account?
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center w-full">
                <h3 className="text-lg font-light text-white tracking-[0.2em] uppercase mb-6">
                  Recover Account
                </h3>
                
                <button 
                  onClick={handleRecoverGoogle} 
                  disabled={isSubmitting} 
                  className="w-full py-3 rounded-full bg-blue-600/90 text-white font-medium tracking-widest uppercase text-xs hover:bg-blue-500 transition-colors shadow-lg disabled:opacity-50 mb-4"
                >
                  {isSubmitting ? "WAIT..." : "RECOVER WITH GOOGLE"}
                </button>

                <div className="flex items-center gap-2 my-2 w-full opacity-50">
                  <div className="flex-1 h-px bg-white"></div>
                  <span className="text-[10px] uppercase tracking-widest text-white">OR</span>
                  <div className="flex-1 h-px bg-white"></div>
                </div>

                <form onSubmit={handleRecoverCode} className="flex flex-col gap-3 w-full mt-2">
                  <input
                    type="text"
                    placeholder="NICKNAME"
                    value={recoverNick}
                    onChange={(e) => setRecoverNick(e.target.value.replace(/[^a-zA-Z0-9_.]/g, "").toUpperCase())}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center tracking-widest uppercase focus:outline-none focus:border-amber-400 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="TRANSFER CODE"
                    value={recoverCode}
                    onChange={(e) => setRecoverCode(e.target.value.toUpperCase())}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center tracking-widest uppercase focus:outline-none focus:border-amber-400 text-xs"
                    required
                  />
                  <div className="h-4">
                    {nickError && <span className="text-red-400 text-[10px] uppercase tracking-widest block animate-in fade-in">{nickError}</span>}
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full py-3 rounded-full bg-amber-500/90 text-black font-medium tracking-widest uppercase text-xs hover:bg-amber-400 transition-colors disabled:opacity-50 mb-4"
                  >
                    {isSubmitting ? "SEARCHING..." : "RECOVER WITH CODE"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => { setRecoveryMode(false); setNickError(""); }}
                  className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest transition-colors underline underline-offset-4"
                >
                  Create new account instead
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}
