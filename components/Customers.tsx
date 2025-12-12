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
      // Logic would go here in full implementation
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
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-800 text-lg">Builders & Contractors</h2>
          <button onClick={() => setShowAddCustomer(true)} className="p-2 bg-white rounded-full shadow-sm text-indigo-600 hover:bg-indigo-50 transition-colors">
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              className={`p-5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all ${selectedCustomer?.id === c.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-semibold ${selectedCustomer?.id === c.id ? 'text-indigo-900' : 'text-gray-800'}`}>{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{c.contact}</p>
                </div>
                <div className={`text-right ${c.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  <span className="block text-sm font-bold">₱{Math.abs(c.balance).toLocaleString()}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">{c.balance > 0 ? 'Debt' : 'Credit'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Detail / Ledger */}
      <div className={`flex-1 bg-gray-50/30 flex flex-col ${!selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
        {selectedCustomer ? (
          <>
            <div className="bg-white p-8 shadow-sm border-b border-gray-200">
              <button onClick={() => setSelectedCustomer(null)} className="md:hidden text-sm text-gray-500 mb-4">← Back to list</button>
              <div className="flex justify-between items-start">
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 mb-1">{selectedCustomer.name}</h1>
                   <p className="text-gray-500 flex items-center gap-1.5"><User className="w-4 h-4" /> {selectedCustomer.address}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-500 font-medium mb-1">Current Balance</p>
                   <p className={`text-4xl font-extrabold ${selectedCustomer.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                     ₱{selectedCustomer.balance.toLocaleString()}
                   </p>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => { setNewTx(prev => ({...prev, type: 'CHARGE'})); setShowTransaction(true); }}
                  className="flex-1 bg-rose-50 text-rose-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors shadow-sm"
                >
                  <ArrowUpRight className="w-5 h-5" /> Add Charge
                </button>
                <button 
                  onClick={() => { setNewTx(prev => ({...prev, type: 'DEPOSIT'})); setShowTransaction(true); }}
                  className="flex-1 bg-emerald-50 text-emerald-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors shadow-sm"
                >
                  <ArrowDownLeft className="w-5 h-5" /> Add Payment
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 text-gray-500">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Transaction History</span>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-400">Select "Add Charge" or "Add Payment" to update the ledger.</p>
                <p className="text-xs text-gray-300 mt-2">Historical transaction list hidden for demo brevity.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
               <User className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg font-medium">Select a builder or contractor</p>
            <p className="text-sm opacity-60">View ledger and add transactions</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-800">New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <input required placeholder="Name" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              <input required placeholder="Phone" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newCustomer.contact} onChange={e => setNewCustomer({...newCustomer, contact: e.target.value})} />
              <input required placeholder="Address" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddCustomer(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-600 hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              {newTx.type === 'CHARGE' ? 'Record Charge (Debt)' : 'Record Payment (Deposit)'}
            </h3>
            <form onSubmit={handleAddTx} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Amount</label>
                <input required type="number" placeholder="0.00" className="w-full p-3 border border-gray-300 rounded-xl text-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Description</label>
                <input required placeholder="e.g., 50 bags cement" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowTransaction(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-600 hover:bg-gray-200">Cancel</button>
                <button type="submit" className={`flex-1 py-3 text-white rounded-xl font-medium shadow-md ${newTx.type === 'CHARGE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;