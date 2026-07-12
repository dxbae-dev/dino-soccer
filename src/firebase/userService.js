import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { GoogleAuthProvider, linkWithPopup, signInWithPopup } from "firebase/auth";
import { db, auth } from "./config";

export const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
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
    highScore: 0,
    isLinked: false,
    transferCode: code
  };
  await setDoc(userRef, userData);
  return userData;
};

export const updateUserScore = async (uid, currentHighScore, newScore) => {
  console.log("Intentando guardar...", { uid, currentHighScore, newScore });
  
  const nHighScore = parseInt(currentHighScore);
  const nNewScore = parseInt(newScore);

  if (nNewScore >= nHighScore) {
    const userRef = doc(db, "users", uid);
    try {
      console.log("Comparación exitosa, escribiendo en Firestore...");
      await updateDoc(userRef, {
        highScore: nNewScore
      });
      console.log("¡Guardado exitoso!");
      return true;
    } catch (error) {
      console.error("ERROR CRÍTICO EN FIRESTORE:", error); // Esto debería salir si las reglas fallan
      throw error;
    }
  } else {
    console.log("El score no es mayor al récord, no se guarda.");
  }
  return false;
};

export const linkGoogleAccount = async () => {
  const provider = new GoogleAuthProvider();
  const result = await linkWithPopup(auth.currentUser, provider);
  const userRef = doc(db, "users", result.user.uid);
  await updateDoc(userRef, { isLinked: true });
  return result.user;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const generateTransferCode = async (uid) => {
  const code = "MOM-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { transferCode: code });
  return code;
};

export const recoverWithTransferCode = async (nickname, code, currentUid) => {
  const q = query(collection(db, "users"), where("nickname", "==", nickname), where("transferCode", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  
  const oldDoc = snap.docs[0];
  const oldData = oldDoc.data();
  const oldUid = oldDoc.id;

  await setDoc(doc(db, "users", currentUid), {
    ...oldData,
    transferCode: null
  });

  await deleteDoc(doc(db, "users", oldUid));
  
  return true;
};