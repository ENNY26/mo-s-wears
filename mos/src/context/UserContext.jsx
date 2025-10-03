// context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        // Create initial user profile
        const initialProfile = {
          uid: user.uid,
          email: user.email,
          firstName: '',
          lastName: '',
          phone: '',
          addresses: [],
          orders: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(doc(db, 'users', user.uid), initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
      // keep local state in sync; if prev is null, replace with updates
      setUserProfile(prev => ({ ...(prev || {}), ...updates }));
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const addAddress = async (address) => {
    if (!user) return false;
    
    try {
      // ensure we have the latest profile from Firestore in case userProfile is null
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const current = userSnap.exists() ? userSnap.data() : {};
      const currentAddresses = Array.isArray(current.addresses) ? current.addresses : [];

      const newAddress = {
        id: Date.now().toString(),
        ...address,
        isDefault: currentAddresses.length === 0
      };

      const updatedAddresses = [...currentAddresses, newAddress];
      await updateDoc(userRef, { addresses: updatedAddresses, updatedAt: new Date() });
      setUserProfile(prev => ({ ...(prev || current), addresses: updatedAddresses }));
      return true;
    } catch (error) {
      console.error('Error adding address:', error);
      return false;
    }
  };

  const updateAddress = async (addressId, updates) => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const current = userSnap.exists() ? userSnap.data() : {};
      const currentAddresses = Array.isArray(current.addresses) ? current.addresses : [];

      const updatedAddresses = currentAddresses.map(addr =>
        addr.id === addressId ? { ...addr, ...updates } : addr
      );
      await updateDoc(userRef, { addresses: updatedAddresses, updatedAt: new Date() });
      setUserProfile(prev => ({ ...(prev || current), addresses: updatedAddresses }));
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      return false;
    }
  };

  const setDefaultAddress = async (addressId) => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const current = userSnap.exists() ? userSnap.data() : {};
      const currentAddresses = Array.isArray(current.addresses) ? current.addresses : [];

      const updatedAddresses = currentAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      await updateDoc(userRef, { addresses: updatedAddresses, updatedAt: new Date() });
      setUserProfile(prev => ({ ...(prev || current), addresses: updatedAddresses }));
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      return false;
    }
  };

  const deleteAddress = async (addressId) => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const current = userSnap.exists() ? userSnap.data() : {};
      const currentAddresses = Array.isArray(current.addresses) ? current.addresses : [];

      const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
      await updateDoc(userRef, { addresses: updatedAddresses, updatedAt: new Date() });
      setUserProfile(prev => ({ ...(prev || current), addresses: updatedAddresses }));
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      return false;
    }
  };

  const addOrder = async (order) => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const current = userSnap.exists() ? userSnap.data() : {};
      const currentOrders = Array.isArray(current.orders) ? current.orders : [];

      const newOrder = {
        id: Date.now().toString(),
        ...order,
        createdAt: new Date()
      };

      const updatedOrders = [newOrder, ...currentOrders];
      await updateDoc(userRef, { orders: updatedOrders, updatedAt: new Date() });
      setUserProfile(prev => ({ ...(prev || current), orders: updatedOrders }));
      return true;
    } catch (error) {
      console.error('Error adding order:', error);
      return false;
    }
  };

  const getDefaultAddress = () => {
    return userProfile?.addresses.find(addr => addr.isDefault) || userProfile?.addresses[0];
  };

  return (
    <UserContext.Provider value={{
      userProfile,
      loading,
      updateProfile,
      addAddress,
      updateAddress,
      setDefaultAddress,
      deleteAddress,
      addOrder,
      getDefaultAddress
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};