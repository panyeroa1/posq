import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { GoogleGenAI } from '@google/genai';
import { CONSULTANT_SYSTEM_PROMPT } from '../constants';
import { Send, BrainCircuit, Sparkles } from 'lucide-react';

const Consultant: React.FC = () => {
  const { products, sales } = useStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !process.env.API_KEY) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inventoryContext = products.map(p => `${p.name}: ${p.stock} ${p.unit} (₱${p.price})`).join('\n');
      const salesContext = `Total Sales Count: ${sales.length}. Revenue: ₱${sales.reduce((a,b) => a+b.total, 0)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Store Data:\n${inventoryContext}\n${salesContext}\nUser Query:\n${userMsg}`,
        config: { systemInstruction: CONSULTANT_SYSTEM_PROMPT, thinkingConfig: { thinkingBudget: 2048 } }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "Strategy generation failed." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen max-w-5xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-6 flex items-center gap-4 z-10 sticky top-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
             <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 tracking-tight">Strategy Consultant</h2>
            <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
               <Sparkles className="w-3 h-3 text-purple-500" /> Powered by AitekPH
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
           {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <BrainCircuit className="w-8 h-8 text-gray-300" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">How can I help you grow?</h3>
               <p className="text-gray-500 max-w-xs text-sm">I can analyze your inventory and sales to suggest pricing, stocking, and sales strategies.</p>
             </div>
           )}
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                 msg.role === 'user' 
                 ? 'bg-blue-600 text-white rounded-br-none' 
                 : 'bg-[#F2F2F7] text-gray-900 rounded-bl-none'
               }`}>
                 <p className="whitespace-pre-wrap">{msg.text}</p>
               </div>
             </div>
           ))}
           {loading && (
             <div className="flex justify-start">
               <div className="bg-[#F2F2F7] p-4 rounded-3xl rounded-bl-none flex gap-2 items-center">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
           )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="bg-gray-100 p-1 rounded-full flex items-center gap-2 pr-2 shadow-inner">
            <input 
              className="flex-1 bg-transparent border-none px-5 py-3 focus:ring-0 outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
              placeholder="Ask for strategic advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all btn-haptic"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultant;