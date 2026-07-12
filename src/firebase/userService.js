import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc } from "firebase/firestore";
import { GoogleAuthProvider, linkWithPopup, signInWithPopup } from "firebase/auth";
import { db, auth } from "./config";

export const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const checkProfileExists = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

export const updateUserScore = async (uid, currentHighScore, newScore) => {
  const nHighScore = parseInt(currentHighScore);
  const nNewScore = parseInt(newScore);

  if (nNewScore >= nHighScore) {
    const userRef = doc(db, "users", uid);
    try {
      await updateDoc(userRef, {
        highScore: nNewScore
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
  return false;
};

export const isNicknameAvailable = async (nickname) => {
  const q = query(collection(db, "users"), where("nickname", "==", nickname));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

export const createUserProfile = async (uid, nickname) => {
  const code = "MOM-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const userRef = doc(db, "users", uid);
  const userData = {
    nickname: nickname,
    highScore: parseInt(localStorage.getItem("highScore") || 0),
    isLinked: false,
    transferCode: code
  };
  await setDoc(userRef, userData);
  return userData;
};

export const generateTransferCode = async (uid, currentCode) => {
  const code = "MOM-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { transferCode: code });
  return code;
};

export const recoverWithTransferCode = async (nickname, code, newUid) => {
  const q = query(collection(db, "users"), where("nickname", "==", nickname), where("transferCode", "==", code));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const oldDoc = querySnapshot.docs[0];
    const oldData = oldDoc.data();
    const oldUid = oldDoc.id;

    await setDoc(doc(db, "users", newUid), oldData);
    await deleteDoc(doc(db, "users", oldUid));
    return true;
  }
  return false;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const linkGoogleAccount = async () => {
  const provider = new GoogleAuthProvider();
  if (auth.currentUser) {
    await linkWithPopup(auth.currentUser, provider);
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { isLinked: true });
  }
};

export const getLeaderboard = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "users"), 
      orderBy("highScore", "desc"), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
      if (doc.data().highScore > 0) {
        leaderboard.push({ id: doc.id, ...doc.data() });
      }
    });
    return leaderboard;
  } catch (error) {
    return [];
  }
};