// context/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('fashionStore_cart');
    return savedCart ? JSON.parse(savedCart) : { items: [] };
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return { items: [] };
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('fashionStore_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const cartReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;
    
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.selectedSize === action.payload.selectedSize
      );
      
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.selectedSize === action.payload.selectedSize
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, action.payload]
        };
      }
      break;
    
    case 'REMOVE_FROM_CART':
      newState = {
        ...state,
        items: state.items.filter(item => 
          !(item.id === action.payload.id && item.selectedSize === action.payload.selectedSize)
        )
      };
      break;
    
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        newState = {
          ...state,
          items: state.items.filter(item => 
            !(item.id === action.payload.id && item.selectedSize === action.payload.selectedSize)
          )
        };
      } else {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.selectedSize === action.payload.selectedSize
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        };
      }
      break;
    
    case 'CLEAR_CART':
      newState = {
        ...state,
        items: []
      };
      break;
    
    default:
      return state;
  }

  // Save to localStorage after every action
  if (newState) {
    saveCartToStorage(newState);
  }
  
  return newState || state;
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    dispatch({ type: 'LOAD_CART', payload: savedCart });
  }, []);

  const addToCart = (product, selectedSize, quantity = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrls: product.imageUrls,
        selectedSize,
        quantity
      }
    });
  };

  const removeFromCart = (productId, selectedSize) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id: productId, selectedSize }
    });
  };

  const updateQuantity = (productId, selectedSize, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, selectedSize, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};