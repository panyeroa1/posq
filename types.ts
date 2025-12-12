export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string; // ISO String
  items: CartItem[];
  total: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  receiptUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  address: string;
  balance: number; // Derived from transactions
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  type: 'CHARGE' | 'DEPOSIT';
  amount: number;
  description: string;
  date: string;
}

export type ViewState = 'POS' | 'INVENTORY' | 'ACCOUNTING' | 'CUSTOMERS' | 'CONSULTANT';
