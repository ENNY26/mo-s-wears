import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadUserProfile = async (uid) => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      if (!uid) {
        setUserProfile(null);
        return;
      }
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserProfile({ id: snap.id, ...snap.data() });
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      // handle permission-denied specifically
      if (err?.code === "permission-denied") {
        setProfileError(
          "Permission denied: your Firestore rules currently block reading user profiles. Update rules to allow reads as needed."
        );
      } else {
        setProfileError("Failed to load profile. See console for details.");
      }
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // ...existing auth listener that calls loadUserProfile(user.uid)...
    // example:
    // const unsub = onAuthStateChanged(auth, (u) => { if (u) loadUserProfile(u.uid); else setUserProfile(null); });
    // return () => unsub();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        loadUserProfile,
        profileError,
        loadingProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};