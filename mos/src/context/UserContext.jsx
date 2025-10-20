import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null); // firebase auth user
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

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
        // create a minimal profile
        const data = {
          email: auth.currentUser?.email || null,
          createdAt: new Date().toISOString(),
          addresses: [],
        };
        await setDoc(ref, data, { merge: true });
        setUserProfile({ id: uid, ...data });
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setProfileError(err?.message || "Failed to load profile");
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (u) {
        await loadUserProfile(u.uid);
      } else {
        setUserProfile(null);
        setLoadingProfile(false);
      }
    });
    return () => unsub();
  }, []);

  // Helpers for addresses
  const addAddress = async (address) => {
    if (!user) return false;
    try {
      const ref = doc(db, "users", user.uid);
      const id = Date.now().toString();
      const addressObj = { id, ...address, isDefault: !!address.isDefault };
      // if this is the first address, make it default
      if (!userProfile?.addresses || userProfile.addresses.length === 0) {
        addressObj.isDefault = true;
      }
      await updateDoc(ref, {
        addresses: arrayUnion(addressObj),
      }).catch(async (e) => {
        // create doc if missing
        await setDoc(ref, { addresses: [addressObj], email: user.email }, { merge: true });
      });
      await loadUserProfile(user.uid);
      return true;
    } catch (err) {
      console.error("addAddress error:", err);
      return false;
    }
  };

  const updateAddress = async (addressId, updates) => {
    if (!user) return false;
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const data = snap.data();
      const addresses = Array.isArray(data.addresses) ? data.addresses : [];
      const newAddresses = addresses.map((a) => (a.id === addressId ? { ...a, ...updates } : a));
      await updateDoc(ref, { addresses: newAddresses });
      await loadUserProfile(user.uid);
      return true;
    } catch (err) {
      console.error("updateAddress error:", err);
      return false;
    }
  };

  const setDefaultAddress = async (addressId) => {
    if (!user) return false;
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const data = snap.data();
      const addresses = Array.isArray(data.addresses) ? data.addresses : [];
      const newAddresses = addresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
      await updateDoc(ref, { addresses: newAddresses });
      await loadUserProfile(user.uid);
      return true;
    } catch (err) {
      console.error("setDefaultAddress error:", err);
      return false;
    }
  };

  const deleteAddress = async (addressId) => {
    if (!user) return false;
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const data = snap.data();
      const addresses = Array.isArray(data.addresses) ? data.addresses : [];
      const newAddresses = addresses.filter((a) => a.id !== addressId);
      // if removed default, make first address default
      if (!newAddresses.some((a) => a.isDefault) && newAddresses.length > 0) {
        newAddresses[0].isDefault = true;
      }
      await updateDoc(ref, { addresses: newAddresses });
      await loadUserProfile(user.uid);
      return true;
    } catch (err) {
      console.error("deleteAddress error:", err);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userProfile,
        loadingProfile,
        profileError,
        loadUserProfile,
        addAddress,
        updateAddress,
        setDefaultAddress,
        deleteAddress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};