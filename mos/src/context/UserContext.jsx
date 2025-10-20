import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null); // firebase auth user
  const [profile, setProfile] = useState(null); // Firestore profile doc
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (u) {
        await loadUserProfile(u.uid);
      } else {
        setProfile(null);
        setLoadingProfile(false);
      }
    });
    return () => unsub();
  }, []);

  const loadUserProfile = async (uid) => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      } else {
        // create minimal profile doc for new users
        const data = {
          email: auth.currentUser?.email || null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(ref, data, { merge: true });
        setProfile({ id: uid, ...data });
      }
    } catch (err) {
      console.error("loadUserProfile error:", err);
      setProfileError(err?.message || "Failed to load profile");
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateProfile = async (updates = {}) => {
    if (!user) throw new Error("Not authenticated");
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, updates);
      await loadUserProfile(user.uid);
      return true;
    } catch (err) {
      console.error("updateProfile error:", err);
      throw err;
    }
  };

  const addAddress = async (addressObj) => {
    // addressObj: { label, line1, city, state, postalCode, country }
    if (!user) throw new Error("Not authenticated");
    try {
      const ref = doc(db, "users", user.uid);
      // store addresses as array field 'addresses'
      await updateDoc(ref, { addresses: arrayUnion(addressObj) }).catch(
        async (e) => {
          // if update fails because doc missing, set a doc with addresses array
          await setDoc(
            ref,
            { addresses: [addressObj], email: user.email },
            { merge: true }
          );
        }
      );
      await loadUserProfile(user.uid);
      return true;
    } catch (err) {
      console.error("addAddress error:", err);
      throw err;
    }
  };

  const addOrder = async (orderData) => {
    if (!user) throw new Error("Not authenticated");
    try {
      const ordersRef = collection(db, "orders");
      const docRef = await addDoc(ordersRef, orderData);
      return docRef.id;
    } catch (err) {
      console.error("addOrder error:", err);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        loadingProfile,
        profileError,
        loadUserProfile,
        updateProfile,
        addAddress,
        addOrder,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};