import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, AlertTriangle, Package, ChevronRight } from 'lucide-react';
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
    <div className="p-6 md:p-12 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Inventory</h1>
           <p className="text-gray-500 font-medium">Manage stock levels and pricing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all btn-haptic"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
        <input 
          type="text" 
          placeholder="Search by name or category..." 
          className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-800 placeholder-gray-400 font-medium transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-6 font-semibold text-gray-400 text-xs uppercase tracking-widest">Product</th>
                <th className="p-6 font-semibold text-gray-400 text-xs uppercase tracking-widest">Category</th>
                <th className="p-6 font-semibold text-gray-400 text-xs uppercase tracking-widest">Price</th>
                <th className="p-6 font-semibold text-gray-400 text-xs uppercase tracking-widest">Stock Level</th>
                <th className="p-6 font-semibold text-gray-400 text-xs uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-6">
                     <span className="font-bold text-gray-900 block">{item.name}</span>
                     <span className="text-xs text-gray-400 font-mono">{item.id.slice(0,8)}</span>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-bold uppercase tracking-wide">{item.category}</span>
                  </td>
                  <td className="p-6 font-medium text-gray-900">₱{item.price.toLocaleString()}</td>
                  <td className="p-6">
                     <span className="font-bold text-gray-900">{item.stock}</span>
                     <span className="text-gray-400 text-sm ml-1">{item.unit}</span>
                  </td>
                  <td className="p-6">
                    {item.stock < 50 ? (
                      <span className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full w-fit">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full">In Stock</span>
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
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Name</label>
                <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Portland Cement" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                  <input className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="Masonry" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Unit</label>
                  <input className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" placeholder="bag, pc, kg"
                    value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price (₱)</label>
                  <input required type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stock</label>
                  <input required type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 font-semibold transition-colors btn-haptic">Cancel</button>
                <button type="submit" className="flex-1 py-4 text-white bg-blue-600 rounded-2xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-200 transition-all btn-haptic">Save to Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;