import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, AlertTriangle, Package } from 'lucide-react';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { products, addProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
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
    <div className="p-4 pb-24 md:pb-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          Inventory
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Item
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search inventory..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Product Name</th>
                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Category</th>
                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{item.category}</span>
                  </td>
                  <td className="p-4 font-mono text-gray-700">₱{item.price}</td>
                  <td className="p-4 text-gray-700 font-medium">{item.stock} <span className="text-gray-400 text-xs font-normal">{item.unit}</span></td>
                  <td className="p-4">
                    {item.stock < 50 ? (
                      <span className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-50 px-2.5 py-1 rounded-full w-fit">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full">Good</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="pc, kg, bag"
                    value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                  <input required type="number" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input required type="number" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 font-medium shadow-md">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;