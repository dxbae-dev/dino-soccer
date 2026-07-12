import { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthContext";
import { getUserProfile, linkGoogleAccount, loginWithGoogle, generateTransferCode, recoverWithTransferCode, isNicknameAvailable, createUserProfile, updateUserScore } from "../firebase/userService";

export default function AccountScreen({ setScreen }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [view, setView] = useState("menu");
  const [recoverNick, setRecoverNick] = useState("");
  const [recoverCode, setRecoverCode] = useState("");
  
  const [nickInput, setNickInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then((p) => {
        setProfile(p);
        setIsLoadingProfile(false);
      });
    }
  }, [currentUser]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const trimmed = nickInput.trim();
    if (trimmed.length < 3) {
      setStatusMsg("MUST BE AT LEAST 3 CHARACTERS");
      return;
    }
    setIsLoading(true);
    setStatusMsg("");
    try {
      const available = await isNicknameAvailable(trimmed);
      if (available) {
        const newProfile = await createUserProfile(currentUser.uid, trimmed);
        const localHighScore = parseInt(localStorage.getItem("highScore") || "0");
        if (localHighScore > 0) {
          await updateUserScore(currentUser.uid, 0, localHighScore);
          newProfile.highScore = localHighScore;
        }
        setProfile(newProfile);
        localStorage.removeItem("isGuest");
        localStorage.setItem("playerNickname", newProfile.nickname);
        setStatusMsg("ACCOUNT CREATED");
        setView("code");
      } else {
        setStatusMsg("NICKNAME IS ALREADY TAKEN");
      }
    } catch (e) {
      setStatusMsg("ERROR CREATING ACCOUNT");
    }
    setIsLoading(false);
  };

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setStatusMsg("");
    try {
      const code = await generateTransferCode(currentUser.uid, profile.transferCode);
      setProfile({...profile, transferCode: code});
      setStatusMsg("CODE IS READY");
    } catch (e) {
      setStatusMsg("ERROR ACCESSING CODE");
    }
    setIsLoading(false);
  };

  const handleLinkGoogle = async () => {
    setIsLoading(true);
    setStatusMsg("");
    try {
      await linkGoogleAccount();
      const updatedProfile = await getUserProfile(currentUser.uid);
      setProfile(updatedProfile);
      setStatusMsg("ACCOUNT SECURED WITH GOOGLE");
    } catch (e) {
      setStatusMsg("ERROR LINKING ACCOUNT");
    }
    setIsLoading(false);
  };

  const handleRecoverGoogle = async () => {
    setIsLoading(true);
    setStatusMsg("");
    try {
      await loginWithGoogle();
      setStatusMsg("ACCOUNT RECOVERED SUCCESSFULLY");
      setTimeout(() => setScreen("menu"), 1500);
    } catch (e) {
      setStatusMsg("ERROR RECOVERING ACCOUNT");
    }
    setIsLoading(false);
  };

  const handleRecoverCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg("");
    try {
      const success = await recoverWithTransferCode(recoverNick.toUpperCase(), recoverCode.toUpperCase(), currentUser.uid);
      if (success) {
        setStatusMsg("ACCOUNT RECOVERED SUCCESSFULLY");
        localStorage.removeItem("isGuest");
        setTimeout(() => setScreen("menu"), 1500);
      } else {
        setStatusMsg("INVALID NICKNAME OR CODE");
      }
    } catch (e) {
      setStatusMsg("ERROR RECOVERING ACCOUNT");
    }
    setIsLoading(false);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-sm p-8 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in duration-500 min-h-[400px]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm p-8 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center w-full border-b border-white/10 pb-4 mb-6">
        <img src="/assets/icons/user.svg" alt="Account" className="w-8 h-8 opacity-80 mb-2 brightness-0 invert" />
        <h2 className="text-xl font-light text-zinc-100 tracking-[0.2em] uppercase text-center">
          {profile ? "Account" : "Guest"}
        </h2>
      </div>

      <div className="w-full min-h-[220px] flex flex-col justify-center gap-4 mb-6">
        {statusMsg && (
          <div className="text-center text-xs tracking-widest text-emerald-400 uppercase bg-emerald-500/10 py-2 rounded border border-emerald-500/20 mb-2">
            {statusMsg}
          </div>
        )}

        {!profile && view === "menu" && (
          <div className="flex flex-col gap-3 items-center text-center">
            <p className="text-xs text-zinc-400 font-light tracking-wide mb-2">
              You are playing as a Guest. Create an account to save your high score to the cloud.
            </p>
            <button onClick={() => setView("create")} className="w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors shadow-lg">
              CREATE ACCOUNT
            </button>
            <div className="h-px bg-white/10 my-2 w-full"></div>
            <button onClick={() => setView("recover")} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-amber-500/90 text-black font-medium tracking-widest uppercase text-xs hover:bg-amber-400 transition-colors shadow-lg">
              <img src="/assets/icons/refresh-ccw.svg" alt="Recover" className="w-4 h-4 brightness-0" />
              RECOVER EXISTING ACCOUNT
            </button>
          </div>
        )}

        {!profile && view === "create" && (
          <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
            <p className="text-xs text-zinc-400 font-light tracking-wide text-center">
              Your local score will be transferred automatically.
            </p>
            <input type="text" placeholder="YOUR_NAME" value={nickInput} onChange={(e) => setNickInput(e.target.value.replace(/[^a-zA-Z0-9_.]/g, "").toUpperCase())} maxLength={12} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-400 text-xs" required autoFocus />
            <button type="submit" disabled={isLoading || nickInput.trim().length < 3} className="w-full py-3 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50">
              {isLoading ? "SAVING..." : "CREATE"}
            </button>
          </form>
        )}

        {profile && view === "menu" && (
          <div className="flex flex-col gap-3">
            {!profile.isLinked && (
              <button onClick={handleLinkGoogle} disabled={isLoading} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-blue-600/90 text-white font-medium tracking-widest uppercase text-xs hover:bg-blue-500 transition-colors shadow-lg disabled:opacity-50">
                <img src="/assets/icons/google.svg" alt="Google" className="w-4 h-4 brightness-0 invert" />
                {isLoading ? "WAIT..." : "SECURE WITH GOOGLE"}
              </button>
            )}
            <button onClick={() => setView("code")} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-black/60 border border-white/20 text-zinc-300 font-medium tracking-widest uppercase text-xs hover:bg-white/10 hover:text-white transition-colors">
              <img src="/assets/icons/key.svg" alt="Key" className="w-4 h-4 brightness-0 invert" />
              TRANSFER CODE
            </button>
            <div className="h-px bg-white/10 my-2 w-full"></div>
            <button onClick={() => setView("recover")} className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-amber-500/90 text-black font-medium tracking-widest uppercase text-xs hover:bg-amber-400 transition-colors shadow-lg">
              <img src="/assets/icons/refresh-ccw.svg" alt="Recover" className="w-4 h-4 brightness-0" />
              RECOVER ACCOUNT
            </button>
          </div>
        )}

        {profile && view === "code" && (
          <div className="flex flex-col items-center text-center gap-4">
            <p className="text-xs text-zinc-400 font-light tracking-wide">
              {profile.transferCode ? "Your recovery code:" : "Generate a unique code to recover your progress later."}
            </p>
            {profile.transferCode ? (
              <div className="bg-white/5 border border-white/20 p-4 rounded-xl w-full">
                <span className="text-emerald-400 text-lg tracking-widest font-mono">{profile.transferCode}</span>
              </div>
            ) : (
              <button onClick={handleGenerateCode} disabled={isLoading} className="flex items-center justify-center gap-3 w-full py-3 rounded-full bg-white/10 border border-white/20 text-white text-xs tracking-widest uppercase hover:bg-white/20 transition-colors disabled:opacity-50">
                <img src="/assets/icons/key.svg" alt="Generate" className="w-4 h-4 brightness-0 invert" />
                {isLoading ? "GENERATING..." : "GENERATE CODE"}
              </button>
            )}
          </div>
        )}

        {view === "recover" && (
          <div className="flex flex-col gap-4">
            {(!profile || !profile.isLinked) && (
              <button onClick={handleRecoverGoogle} disabled={isLoading} className="flex items-center justify-center gap-3 w-full py-3 rounded-full bg-blue-600/90 text-white font-medium tracking-widest uppercase text-xs hover:bg-blue-500 transition-colors shadow-lg disabled:opacity-50">
                <img src="/assets/icons/google.svg" alt="Google" className="w-4 h-4 brightness-0 invert" />
                {isLoading ? "WAIT..." : "RECOVER WITH GOOGLE"}
              </button>
            )}
            
            <form onSubmit={handleRecoverCode} className="flex flex-col gap-3">
              <input type="text" placeholder="NICKNAME" value={recoverNick} onChange={(e) => setRecoverNick(e.target.value.replace(/[^a-zA-Z0-9_.]/g, "").toUpperCase())} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center tracking-widest uppercase focus:outline-none focus:border-amber-400 text-xs" required />
              <input type="text" placeholder="TRANSFER CODE" value={recoverCode} onChange={(e) => setRecoverCode(e.target.value.toUpperCase())} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center tracking-widest uppercase focus:outline-none focus:border-amber-400 text-xs" required />
              <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-3 w-full py-3 rounded-full bg-amber-500/90 text-black font-medium tracking-widest uppercase text-xs hover:bg-amber-400 transition-colors disabled:opacity-50">
                <img src="/assets/icons/refresh-ccw.svg" alt="Recover" className="w-4 h-4 brightness-0" />
                {isLoading ? "SEARCHING..." : "RECOVER WITH CODE"}
              </button>
            </form>
          </div>
        )}
      </div>

      <button 
        onClick={() => view === "menu" ? setScreen('menu') : setView("menu")}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-white text-black font-medium tracking-widest uppercase text-xs hover:bg-zinc-200 transition-colors active:scale-95 shadow-lg"
      >
        {view !== "menu" && <img src="/assets/icons/arrow-left.svg" alt="Back" className="w-4 h-4 brightness-0" />}
        {view === "menu" ? "RETURN TO MENU" : "BACK"}
      </button>
    </div>
  );
}