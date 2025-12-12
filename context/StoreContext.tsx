import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Sale, Expense, CartItem, Customer, CustomerTransaction } from '../types';
import { api } from '../services/supabaseClient';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  cart: CartItem[];
  refreshData: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  processCheckout: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  addTransaction: (tx: CustomerTransaction) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const refreshData = useCallback(async () => {
    try {
      const [p, s, e, c] = await Promise.all([
        api.products.list(),
        api.sales.list(),
        api.expenses.list(),
        api.customers.list(),
      ]);
      setProducts(p);
      setSales(s);
      setExpenses(e);
      setCustomers(c);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => setCart([]);

  const processCheckout = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const sale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: [...cart],
      total
    };

    // Update stocks
    for (const item of cart) {
      await api.products.updateStock(item.id, -item.quantity);
    }

    await api.sales.create(sale);
    setCart([]);
    await refreshData();
  };

  const addProduct = async (product: Product) => {
    await api.products.upsert(product);
    await refreshData();
  };

  const addExpense = async (expense: Expense) => {
    await api.expenses.create(expense);
    await refreshData();
  };

  const addCustomer = async (customer: Customer) => {
    await api.customers.create(customer);
    await refreshData();
  };

  const addTransaction = async (tx: CustomerTransaction) => {
    await api.transactions.create(tx);
    await refreshData();
  };

  return (
    <StoreContext.Provider value={{
      products, sales, expenses, customers, cart,
      refreshData, addToCart, removeFromCart, updateCartQuantity, clearCart,
      processCheckout, addProduct, addExpense, addCustomer, addTransaction
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
