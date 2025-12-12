import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, Minus, Trash2, ShoppingBag, Receipt, CreditCard } from 'lucide-react';

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
    setTimeout(() => setShowReceipt(false), 3000); 
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Product Grid Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Sticky Search Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-gray-200/50">
           <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search for cement, wood, or tools..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-32 md:pb-12 max-w-7xl mx-auto">
            {filteredProducts.map((product) => (
              <button 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-gray-100 text-left flex flex-col justify-between h-48 btn-haptic relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                      <Plus className="w-4 h-4" />
                   </div>
                </div>
                <div>
                  <div className="inline-block px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                    {product.category}
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight text-lg group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="flex flex-col">
                     <span className="text-gray-400 text-xs font-medium mb-0.5">Price</span>
                     <span className="text-xl font-bold text-gray-900 tracking-tight">₱{product.price}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${product.stock < 50 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    {product.stock} {product.unit}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar (Right Panel) */}
      <div className="w-full md:w-[400px] bg-white border-l border-gray-200 flex flex-col h-[40vh] md:h-full fixed bottom-[57px] md:static z-30 shadow-2xl md:shadow-none rounded-t-3xl md:rounded-none">
        
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-2xl tracking-tight text-gray-900 flex items-center gap-2">
              Current Sale
            </h2>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               {cart.length} Items
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Select items from the inventory to start.</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-100">
                   x{item.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                  <p className="text-gray-500 text-xs">₱{item.price.toLocaleString()} per unit</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)} 
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 transition-all btn-haptic"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 transition-all btn-haptic"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-6 bg-white border-t border-gray-100 pb-safe">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-medium">Total</span>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">₱{cartTotal.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all flex items-center justify-center gap-3 btn-haptic
              ${cart.length === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
          >
            {cart.length === 0 ? 'Add Items' : (
              <>
                <CreditCard className="w-5 h-5" /> 
                Charge Payment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white p-10 rounded-[32px] w-full max-w-sm shadow-2xl text-center transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Receipt className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Complete</h2>
            <p className="text-gray-500 mb-8">Recorded in Sales History</p>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 border-dashed">
               <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Paid</p>
               <p className="text-4xl font-extrabold text-gray-900 tracking-tight">₱{cartTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;