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
          <Package className="w-6 h-6 text-blue-600" /> Inventory
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search inventory..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Product Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Price</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Stock</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded-md">{item.category}</span>
                  </td>
                  <td className="p-4 font-mono text-gray-700">₱{item.price}</td>
                  <td className="p-4 text-gray-700">{item.stock} <span className="text-gray-400 text-xs">{item.unit}</span></td>
                  <td className="p-4">
                    {item.stock < 50 ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full w-fit">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">Good</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full p-2 border rounded-lg" 
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" className="w-full p-2 border rounded-lg" 
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" className="w-full p-2 border rounded-lg" placeholder="pc, kg, bag"
                    value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                  <input required type="number" className="w-full p-2 border rounded-lg" 
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input required type="number" className="w-full p-2 border rounded-lg" 
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
