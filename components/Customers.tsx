import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, FileText, PlusCircle, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { Customer, CustomerTransaction } from '../types';

const Customers: React.FC = () => {
  const { customers, addCustomer, addTransaction } = useStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', address: '' });
  const [newTx, setNewTx] = useState({ type: 'CHARGE', amount: '', description: '' });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCustomer({ id: crypto.randomUUID(), ...newCustomer, balance: 0 });
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
    setSelectedCustomer(prev => prev ? {
        ...prev, 
        balance: newTx.type === 'CHARGE' ? prev.balance + Number(newTx.amount) : prev.balance - Number(newTx.amount)
    } : null);
    setShowTransaction(false);
    setNewTx({ type: 'CHARGE', amount: '', description: '' });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F5F7] overflow-hidden">
      {/* Sidebar List */}
      <div className={`w-full md:w-[320px] bg-white border-r border-gray-200 flex flex-col h-full ${selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <h2 className="font-bold text-lg tracking-tight">Builders</h2>
          <button onClick={() => setShowAddCustomer(true)} className="text-blue-600 hover:text-blue-700 btn-haptic">
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              className={`p-5 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 group ${selectedCustomer?.id === c.id ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-semibold text-sm ${selectedCustomer?.id === c.id ? 'text-blue-600' : 'text-gray-900'}`}>{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{c.contact}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className={`flex-1 flex flex-col ${!selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
        {selectedCustomer ? (
          <>
            <div className="bg-white/80 backdrop-blur-xl p-8 border-b border-gray-200 shadow-sm z-10 sticky top-0">
              <button onClick={() => setSelectedCustomer(null)} className="md:hidden text-blue-600 font-medium mb-4 flex items-center gap-1 text-sm">← Back</button>
              <div className="flex justify-between items-end">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{selectedCustomer.name}</h1>
                   <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <User className="w-3 h-3" />
                      <span className="font-medium">{selectedCustomer.address}</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Balance Due</p>
                   <p className={`text-4xl font-extrabold tracking-tighter ${selectedCustomer.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                     ₱{selectedCustomer.balance.toLocaleString()}
                   </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
                <button 
                  onClick={() => { setNewTx(prev => ({...prev, type: 'CHARGE'})); setShowTransaction(true); }}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center gap-2 transition-all btn-haptic group"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                     <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-gray-900">Add Charge</span>
                </button>
                <button 
                  onClick={() => { setNewTx(prev => ({...prev, type: 'DEPOSIT'})); setShowTransaction(true); }}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center gap-2 transition-all btn-haptic group"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-100 transition-colors">
                     <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-gray-900">Record Payment</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                 <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-500 font-medium text-sm">Detailed history available in database.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-[#F5F5F7]">
            <p className="text-sm font-medium">Select a contractor to view ledger</p>
          </div>
        )}
      </div>

      {/* Modal Reusable Style */}
      {(showAddCustomer || showTransaction) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
             {showAddCustomer && (
               <form onSubmit={handleAddCustomer} className="space-y-4">
                 <h3 className="text-xl font-bold text-gray-900">New Profile</h3>
                 <input required placeholder="Full Name" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                 <input required placeholder="Mobile Number" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={newCustomer.contact} onChange={e => setNewCustomer({...newCustomer, contact: e.target.value})} />
                 <input required placeholder="Address" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                 <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddCustomer(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 text-sm">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200">Save</button>
                 </div>
               </form>
             )}
             {showTransaction && (
               <form onSubmit={handleAddTx} className="space-y-4">
                 <h3 className="text-xl font-bold text-gray-900">{newTx.type === 'CHARGE' ? 'Add Charge' : 'Receive Payment'}</h3>
                 <div className="relative">
                   <span className="absolute left-4 top-3 text-gray-400 font-bold text-lg">₱</span>
                   <input required type="number" placeholder="0.00" className="w-full pl-9 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xl font-bold" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
                 </div>
                 <input required placeholder="Description" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} />
                 <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowTransaction(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 text-sm">Cancel</button>
                    <button type="submit" className={`flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-lg ${newTx.type === 'CHARGE' ? 'bg-red-500 shadow-red-200' : 'bg-green-500 shadow-green-200'}`}>Confirm</button>
                 </div>
               </form>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;