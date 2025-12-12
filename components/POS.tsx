import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, Minus, Trash2, ShoppingBag, Receipt, CreditCard, X, Check, Printer } from 'lucide-react';
import { CartItem } from '../types';

const POS: React.FC = () => {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, processCheckout } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<{items: CartItem[], total: number, date: string, id: string} | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    // Capture state before clearing
    const orderDetails = {
      items: [...cart],
      total: cartTotal,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      id: Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    };
    
    await processCheckout();
    setLastOrder(orderDetails);
    setShowReceipt(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Product Grid Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Sticky Search Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-[#F5F5F7]/90 backdrop-blur-xl border-b border-gray-200/50">
           <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-3 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm text-gray-800 placeholder-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-32 md:pb-12 max-w-7xl mx-auto">
            {filteredProducts.map((product) => (
              <button 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 border border-gray-100 text-left flex flex-col justify-between h-36 btn-haptic relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                      <Plus className="w-3 h-3" />
                   </div>
                </div>
                <div>
                  <div className="inline-block px-1.5 py-0.5 rounded bg-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                    {product.category}
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-snug text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-gray-900 tracking-tight">₱{product.price}</span>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${product.stock < 50 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    {product.stock} {product.unit}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar (Right Panel) */}
      <div className="w-full md:w-[340px] bg-white border-l border-gray-200 flex flex-col h-[40vh] md:h-full fixed bottom-[57px] md:static z-30 shadow-2xl md:shadow-none rounded-t-3xl md:rounded-none">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm tracking-tight text-gray-900 flex items-center gap-2">
              Current Sale
            </h2>
            <div className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
               {cart.length} Items
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <p className="text-gray-900 font-medium text-xs">Cart is empty</p>
                <p className="text-gray-400 text-[10px] mt-0.5">Select items to start sale</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group bg-gray-50/50 p-2 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 font-bold text-[10px] border border-gray-100 shadow-sm">
                   {item.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-xs truncate">{item.name}</h4>
                  <p className="text-gray-400 text-[10px]">₱{item.price.toLocaleString()} ea</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)} 
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-gray-100 hover:shadow-sm text-gray-500 transition-all btn-haptic"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-gray-100 hover:shadow-sm text-gray-500 transition-all btn-haptic"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 bg-white border-t border-gray-100 pb-safe">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Due</span>
            <span className="text-xl font-bold text-gray-900 tracking-tight">₱{cartTotal.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-2 btn-haptic
              ${cart.length === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
          >
            {cart.length === 0 ? 'No Items' : (
              <>
                <CreditCard className="w-3.5 h-3.5" /> 
                Process Payment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invoice Modal - Premium Redesign */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-[340px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            
            {/* Invoice Header */}
            <div className="bg-[#FBFBFD] p-6 text-center border-b border-gray-100">
               <div className="mb-4">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Engr Quilang Hardware</h2>
                 <p className="text-[10px] text-gray-500 font-medium">Cabbo Penablanca, Cagayan</p>
                 <p className="text-[10px] text-gray-400 mt-0.5">+63 995 559 7560</p>
               </div>
               
               <div className="flex flex-col items-center gap-1.5">
                 <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4" />
                 </div>
                 <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Paid Successfully</p>
               </div>

               <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200/50 text-[10px] text-gray-400 font-mono">
                  <span>#{lastOrder.id}</span>
                  <span>{lastOrder.date}</span>
               </div>
            </div>

            {/* Invoice Body */}
            <div className="p-6 bg-white">
              <div className="space-y-2.5 mb-6 max-h-56 overflow-y-auto custom-scrollbar">
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs group">
                    <div className="flex-1 pr-4">
                      <span className="font-medium text-gray-900 block">{item.name}</span>
                      <div className="text-[10px] text-gray-400">
                        {item.quantity} x ₱{item.price.toLocaleString()}
                      </div>
                    </div>
                    <span className="font-medium text-gray-900 tabular-nums">₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 my-4"></div>

              {/* Summary */}
              <div className="space-y-1.5 mb-6">
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums">₱{lastOrder.total.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Tax (12% VAT Inc.)</span>
                    <span className="tabular-nums">₱{(lastOrder.total * 0.12).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                 </div>
                 <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900 tracking-tight tabular-nums">₱{lastOrder.total.toLocaleString()}</span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-xs hover:bg-gray-50 transition-colors btn-haptic"
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowReceipt(false)} 
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-semibold text-xs hover:bg-black transition-colors btn-haptic shadow-lg flex items-center justify-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;