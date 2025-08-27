import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Book, OrderItem } from '@/types/api';

interface CartItem extends OrderItem {
  book_title?: string;
  book_price?: string;
  book_stock?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('bookstore_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('bookstore_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (book: Book, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.book === book.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.book === book.id
            ? { 
                ...item, 
                quantity: Math.min(item.quantity + quantity, book.stock)
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          book: book.id,
          quantity: Math.min(quantity, book.stock),
          book_title: book.title,
          book_price: book.price,
          book_stock: book.stock,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (bookId: number) => {
    setItems(prevItems => prevItems.filter(item => item.book !== bookId));
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.book === bookId
          ? { ...item, quantity: Math.min(quantity, item.book_stock || 999) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.book_price || '0');
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}