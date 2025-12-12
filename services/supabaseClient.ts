import { Product, Sale, Expense, Customer, CustomerTransaction } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS } from '../constants';

// This is a local mock service to allow the app to function without a real Supabase backend connection.
// In a real production app, this would use the @supabase/supabase-js client.

const STORAGE_KEYS = {
  PRODUCTS: 'eq_products',
  SALES: 'eq_sales',
  EXPENSES: 'eq_expenses',
  CUSTOMERS: 'eq_customers',
  TRANSACTIONS: 'eq_transactions',
};

const load = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultData;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultData;
  }
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  products: {
    list: async (): Promise<Product[]> => load(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
    upsert: async (product: Product) => {
      const items = load<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const index = items.findIndex(p => p.id === product.id);
      let newItems;
      if (index >= 0) {
        newItems = [...items];
        newItems[index] = product;
      } else {
        newItems = [...items, product];
      }
      save(STORAGE_KEYS.PRODUCTS, newItems);
      return product;
    },
    updateStock: async (id: string, delta: number) => {
       const items = load<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
       const index = items.findIndex(p => p.id === id);
       if (index >= 0) {
         items[index].stock = Math.max(0, items[index].stock + delta);
         save(STORAGE_KEYS.PRODUCTS, items);
       }
    }
  },
  sales: {
    list: async (): Promise<Sale[]> => load(STORAGE_KEYS.SALES, []),
    create: async (sale: Sale) => {
      const items = load<Sale[]>(STORAGE_KEYS.SALES, []);
      const newItems = [sale, ...items];
      save(STORAGE_KEYS.SALES, newItems);
      return sale;
    }
  },
  expenses: {
    list: async (): Promise<Expense[]> => load(STORAGE_KEYS.EXPENSES, []),
    create: async (expense: Expense) => {
      const items = load<Expense[]>(STORAGE_KEYS.EXPENSES, []);
      const newItems = [expense, ...items];
      save(STORAGE_KEYS.EXPENSES, newItems);
      return expense;
    }
  },
  customers: {
    list: async (): Promise<Customer[]> => {
      const customers = load<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      const transactions = load<CustomerTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      
      // Calculate balances on the fly
      return customers.map(c => {
        const txs = transactions.filter(t => t.customerId === c.id);
        const balance = txs.reduce((acc, t) => {
           return t.type === 'CHARGE' ? acc + t.amount : acc - t.amount;
        }, 0);
        return { ...c, balance };
      });
    },
    create: async (customer: Customer) => {
      const items = load<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      const newItems = [...items, customer];
      save(STORAGE_KEYS.CUSTOMERS, newItems);
      return customer;
    }
  },
  transactions: {
    list: async (customerId: string): Promise<CustomerTransaction[]> => {
       const all = load<CustomerTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
       return all.filter(t => t.customerId === customerId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    create: async (tx: CustomerTransaction) => {
      const items = load<CustomerTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      const newItems = [tx, ...items];
      save(STORAGE_KEYS.TRANSACTIONS, newItems);
      return tx;
    }
  }
};
