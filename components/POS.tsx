import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt } from 'lucide-react';
import { Product } from '../types';

const POS: React.FC = () => {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, processCheckout } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    await processCheckout();
    setShowReceipt(true);
    setTimeout(() => setShowReceipt(false), 3000); // Mock print delay
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
      {/* Product Grid */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
        <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24 md:pb-0">
          {filteredProducts.map((product) => (
            <div key={product.id} 
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase mb-1 tracking-wider">{product.category}</div>
                <h3 className="font-semibold text-gray-800 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">{product.name}</h3>
              </div>
              <div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900">₱{product.price.toLocaleString()}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${product.stock < 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {product.stock} {product.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-[40vh] md:h-full fixed bottom-[64px] md:static md:bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none z-20">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white md:bg-white md:bg-none md:text-gray-800">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Current Sale
          </h2>
          <span className="bg-white/20 md:bg-indigo-50 md:text-indigo-700 px-3 py-1 rounded-full text-sm font-mono font-medium">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                  <div className="text-xs text-gray-500 mt-1">₱{item.price} x {item.quantity}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-red-50 rounded-lg ml-2 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Amount</span>
            <span className="text-3xl font-bold text-indigo-700">₱{cartTotal.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
              ${cart.length === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200'}`}
          >
            <Receipt className="w-5 h-5" /> Pay Now
          </button>
        </div>
      </div>

      {/* Receipt Modal (Mock) */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Success!</h2>
            <p className="text-gray-500 mb-8">Transaction recorded successfully.</p>
            <div className="border-t-2 border-b-2 border-dashed border-gray-100 py-6 mb-6">
               <p className="text-5xl font-extrabold text-gray-900 tracking-tight">₱{cartTotal.toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-400 animate-pulse">Printing receipt...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;