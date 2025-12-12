import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Camera, Upload, CheckCircle, Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

const Accounting: React.FC = () => {
  const { sales, expenses, addExpense } = useStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial Calculations
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const profit = totalRevenue - totalExpenses;

  // Chart Data Preparation (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const daySales = sales.filter(s => s.date.startsWith(date)).reduce((sum, s) => sum + s.total, 0);
    const dayExpenses = expenses.filter(e => e.date.startsWith(date)).reduce((sum, e) => sum + e.amount, 0);
    return {
      date: date.slice(5), // MM-DD
      revenue: daySales,
      expense: dayExpenses
    };
  });

  // Receipt Scanning Logic
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !process.env.API_KEY) return;

    setScanStatus('processing');
    
    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const imagePart = {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: file.type
          }
        };

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = "gemini-3-pro-preview";
        
        const prompt = "Analyze this receipt image. Extract the total amount (number), the merchant/store name (string, use 'Unknown' if not found), and the date (YYYY-MM-DD string).";
        
        const response = await ai.models.generateContent({
          model,
          contents: {
             parts: [imagePart, { text: prompt }]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
               type: Type.OBJECT,
               properties: {
                 merchant: { type: Type.STRING },
                 date: { type: Type.STRING },
                 total: { type: Type.NUMBER }
               },
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
      console.error("Scanning failed", error);
      setScanStatus('idle');
      alert("Failed to scan receipt. Please try again.");
    }
  };

  return (
    <div className="p-4 pb-24 md:pb-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₱{totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Net Profit</span>
          </div>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ₱{profit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
        <h3 className="font-bold text-gray-700 mb-4">7-Day Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Receipt Scanner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">Auto-Expense Scanner</h3>
          <p className="text-indigo-100 text-sm opacity-90">Snap a photo of any receipt to log it automatically.</p>
        </div>
        <div className="flex items-center gap-3">
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
            className="bg-white text-indigo-600 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-50"
          >
            {scanStatus === 'processing' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : scanStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {scanStatus === 'processing' ? 'Scanning...' : 'Scan Receipt'}
          </button>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Expenses</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {expenses.length === 0 ? (
            <p className="p-6 text-center text-gray-400">No expenses recorded yet.</p>
          ) : (
            expenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{exp.description}</p>
                  <p className="text-xs text-gray-500">{exp.date} • {exp.category}</p>
                </div>
                <span className="font-mono text-red-600 font-medium">-₱{exp.amount.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounting;