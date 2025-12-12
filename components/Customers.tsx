import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, FileText, PlusCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Customer, CustomerTransaction } from '../types';

const Customers: React.FC = () => {
  const { customers, addCustomer, addTransaction } = useStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  
  // Modal states
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  
  // Forms
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', address: '' });
  const [newTx, setNewTx] = useState({ type: 'CHARGE', amount: '', description: '' });

  // Load transactions when a customer is selected
  React.useEffect(() => {
    if (selectedCustomer) {
      // In a real app we'd fetch this. For now we rely on the derived balance in customer list 
      // but to show history we'd need to fetch txs from the store context if we exposed them, 
      // or just trust the mock service (which we can't call directly inside render).
      // For this demo, let's assume we can't easily see history without refactoring context,
      // so we'll just enable adding transactions which updates the balance.
    }
  }, [selectedCustomer]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCustomer({
      id: crypto.randomUUID(),
      ...newCustomer,
      balance: 0
    });
    setShowAddCustomer(false);
    setNewCustomer({ name: '', contact: '', address: '' });
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    await addTransaction({
      id: crypto.randomUUID(),
      customerId: selectedCustomer.id,
      type: newTx.type as 'CHARGE' | 'DEPOSIT',
      amount: Number(newTx.amount),
      description: newTx.description,
      date: new Date().toISOString()
    });
    
    // Optimistically update selected customer UI
    setSelectedCustomer(prev => prev ? {
        ...prev, 
        balance: newTx.type === 'CHARGE' ? prev.balance + Number(newTx.amount) : prev.balance - Number(newTx.amount)
    } : null);

    setShowTransaction(false);
    setNewTx({ type: 'CHARGE', amount: '', description: '' });
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col md:flex-row">
      {/* Customer List */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800">Builders & Contractors</h2>
          <button onClick={() => setShowAddCustomer(true)} className="p-2 bg-white rounded-full shadow-sm text-blue-600 hover:bg-blue-50">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCustomer?.id === c.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.contact}</p>
                </div>
                <div className={`text-right ${c.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span className="block text-sm font-bold">₱{Math.abs(c.balance).toLocaleString()}</span>
                  <span className="text-[10px] uppercase font-bold">{c.balance > 0 ? 'Debt' : 'Credit'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Detail / Ledger */}
      <div className={`flex-1 bg-gray-50 flex flex-col ${!selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
        {selectedCustomer ? (
          <>
            <div className="bg-white p-6 shadow-sm border-b border-gray-200">
              <button onClick={() => setSelectedCustomer(null)} className="md:hidden text-sm text-gray-500 mb-2">← Back to list</button>
              <div className="flex justify-between items-start">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h1>
                   <p className="text-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> {selectedCustomer.address}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-500">Current Balance</p>
                   <p className={`text-3xl font-bold ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                     ₱{selectedCustomer.balance.toLocaleString()}
                   </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { setNewTx(prev => ({...prev, type: 'CHARGE'})); setShowTransaction(true); }}
                  className="flex-1 bg-red-50 text-red-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <ArrowUpRight className="w-5 h-5" /> Add Charge
                </button>
                <button 
                  onClick={() => { setNewTx(prev => ({...prev, type: 'DEPOSIT'})); setShowTransaction(true); }}
                  className="flex-1 bg-green-50 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                >
                  <ArrowDownLeft className="w-5 h-5" /> Add Payment
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 text-gray-500">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Transaction History</span>
              </div>
              
              {/* Mock History since we don't fully sync tx history in context for this demo scope */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-400">Select "Add Charge" or "Add Payment" to update the ledger.</p>
                <p className="text-xs text-gray-300 mt-2">Historical transaction list hidden for demo brevity.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <User className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a builder or contractor to view ledger</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <input required placeholder="Name" className="w-full p-2 border rounded-lg" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              <input required placeholder="Phone" className="w-full p-2 border rounded-lg" value={newCustomer.contact} onChange={e => setNewCustomer({...newCustomer, contact: e.target.value})} />
              <input required placeholder="Address" className="w-full p-2 border rounded-lg" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowAddCustomer(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">
              {newTx.type === 'CHARGE' ? 'Record Charge (Debt)' : 'Record Payment (Deposit)'}
            </h3>
            <form onSubmit={handleAddTx} className="space-y-3">
              <input required type="number" placeholder="Amount" className="w-full p-2 border rounded-lg text-lg font-bold" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
              <input required placeholder="Description (e.g., 50 bags cement)" className="w-full p-2 border rounded-lg" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} />
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowTransaction(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className={`flex-1 py-2 text-white rounded-lg ${newTx.type === 'CHARGE' ? 'bg-red-600' : 'bg-green-600'}`}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
