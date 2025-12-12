import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { products, addProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: 'General', price: 0, stock: 0, unit: 'pc'
  });

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      await addProduct({
        id: crypto.randomUUID(),
        ...newProduct as Product
      });
      setIsModalOpen(false);
      setNewProduct({ name: '', category: 'General', price: 0, stock: 0, unit: 'pc' });
    }
  };

  return (
    <div className="p-6 md:p-10 pb-32 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Inventory</h1>
           <p className="text-xs text-gray-500 font-medium">Manage stock levels and pricing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all btn-haptic"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="relative mb-6 group">
        <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-blue-500" />
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none text-sm text-gray-800 placeholder-gray-400 font-medium transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-4 font-semibold text-gray-400 text-[10px] uppercase tracking-widest">Product</th>
                <th className="p-4 font-semibold text-gray-400 text-[10px] uppercase tracking-widest">Category</th>
                <th className="p-4 font-semibold text-gray-400 text-[10px] uppercase tracking-widest">Price</th>
                <th className="p-4 font-semibold text-gray-400 text-[10px] uppercase tracking-widest">Stock Level</th>
                <th className="p-4 font-semibold text-gray-400 text-[10px] uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4">
                     <span className="font-semibold text-gray-900 text-sm block">{item.name}</span>
                     <span className="text-[10px] text-gray-400 font-mono">{item.id.slice(0,6)}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-bold uppercase tracking-wide">{item.category}</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900 text-sm">₱{item.price.toLocaleString()}</td>
                  <td className="p-4">
                     <span className="font-bold text-gray-900 text-sm">{item.stock}</span>
                     <span className="text-gray-400 text-xs ml-1">{item.unit}</span>
                  </td>
                  <td className="p-4">
                    {item.stock < 50 ? (
                      <span className="flex items-center gap-1.5 text-red-600 text-[10px] font-bold bg-red-50 px-2.5 py-1 rounded-full w-fit">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 text-[10px] font-bold bg-green-50 px-2.5 py-1 rounded-full">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Product Name</label>
                <input required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm" 
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Portland Cement" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                  <input className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm" 
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="Masonry" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Unit</label>
                  <input className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm" placeholder="bag, pc, kg"
                    value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Price (₱)</label>
                  <input required type="number" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm" 
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Stock</label>
                  <input required type="number" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm" 
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-colors btn-haptic">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-semibold text-sm shadow-lg shadow-blue-200 transition-all btn-haptic">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;