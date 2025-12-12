import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Camera, Upload, CheckCircle, Loader2, TrendingUp, TrendingDown, DollarSign, ScanLine } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

const Accounting: React.FC = () => {
  const { sales, expenses, addExpense } = useStore();
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const daySales = sales.filter(s => s.date.startsWith(date)).reduce((sum, s) => sum + s.total, 0);
    const dayExpenses = expenses.filter(e => e.date.startsWith(date)).reduce((sum, e) => sum + e.amount, 0);
    return {
      date: date.slice(5), 
      revenue: daySales,
      expense: dayExpenses
    };
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !process.env.API_KEY) return;
    setScanStatus('processing');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: {
             parts: [{ inlineData: { data: base64Data.split(',')[1], mimeType: file.type }}, { text: "Extract total (number), merchant (string), date (YYYY-MM-DD)." }]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
               type: Type.OBJECT,
               properties: { merchant: { type: Type.STRING }, date: { type: Type.STRING }, total: { type: Type.NUMBER } },
               required: ["merchant", "total"]
            }
          }
        });
        const result = JSON.parse(response.text || "{}");
        if (result.total) {
          await addExpense({
            id: crypto.randomUUID(),
            date: result.date || new Date().toISOString().split('T')[0],
            description: `Receipt from ${result.merchant}`,
            amount: result.total,
            category: 'receipt_scan'
          });
          setScanStatus('success');
          setTimeout(() => setScanStatus('idle'), 3000);
        }
      };
    } catch (error) {
      console.error(error);
      setScanStatus('idle');
      alert("Failed to scan receipt.");
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Financial Overview</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-green-500" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">₱{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Expenses</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">₱{totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Net Profit</p>
          <p className={`text-4xl font-bold tracking-tight ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ₱{profit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-lg text-gray-900 mb-6">Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#F3F4F6'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '12px' }}
              />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 6, 6]} barSize={32} />
              <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 6, 6]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scanner Widget */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Smart Scan</h3>
            <p className="text-blue-100 opacity-90 text-sm leading-relaxed">
              Use Gemini Vision to instantly digitize paper receipts. Just snap and we handle the data entry.
            </p>
          </div>

          <div className="mt-8">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={scanStatus === 'processing'}
              className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors shadow-lg btn-haptic disabled:opacity-70"
            >
              {scanStatus === 'processing' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : scanStatus === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              {scanStatus === 'processing' ? 'Processing...' : 'Capture Receipt'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Expenses List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100">
           <h3 className="font-bold text-gray-900">Recent Transactions</h3>
         </div>
         <div className="divide-y divide-gray-100">
            {expenses.slice(0,5).map(exp => (
               <div key={exp.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                     <p className="font-semibold text-gray-900">{exp.description}</p>
                     <p className="text-xs text-gray-500 mt-1">{exp.date} • {exp.category}</p>
                  </div>
                  <span className="font-mono font-medium text-red-600">-₱{exp.amount.toLocaleString()}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Accounting;