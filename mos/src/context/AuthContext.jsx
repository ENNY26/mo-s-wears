// context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth as firebaseAuth } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const auth = firebaseAuth || getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  const signInWithEmail = async (email) => {
    // Generate a random password for email-only login
    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
    
    try {
      // Try to sign in first
      return await signInWithEmailAndPassword(auth, email, tempPassword);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // If user doesn't exist, create account
        return await createUserWithEmailAndPassword(auth, email, tempPassword);
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signInWithGoogle,
        signOutUser,
        logout: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};