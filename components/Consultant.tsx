import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { GoogleGenAI } from '@google/genai';
import { CONSULTANT_SYSTEM_PROMPT } from '../constants';
import { Send, BrainCircuit, Bot } from 'lucide-react';

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
      
      // Construct context from store state
      const inventoryContext = products.map(p => `${p.name}: ${p.stock} ${p.unit} (₱${p.price})`).join('\n');
      const salesContext = `Total Sales Count: ${sales.length}. Revenue: ₱${sales.reduce((a,b) => a+b.total, 0)}`;

      const fullPrompt = `
      CURRENT STORE DATA:
      Inventory:
      ${inventoryContext}
      
      Sales Summary:
      ${salesContext}

      USER QUESTION:
      ${userMsg}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: fullPrompt,
        config: {
          systemInstruction: CONSULTANT_SYSTEM_PROMPT,
          thinkingConfig: { thinkingBudget: 2048 } // Utilizing Thinking for strategy
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I couldn't generate a strategy at this moment." }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI Consultant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
             <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Business Strategy Consultant</h2>
            <p className="text-indigo-200 text-xs">Powered by Gemini 3 Pro (Reasoning)</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
           {messages.length === 0 && (
             <div className="text-center text-gray-400 mt-20">
               <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>Ask me about inventory optimization, pricing strategies, or sales trends.</p>
               <p className="text-sm mt-2">Example: "How can I optimize cement stock based on sales?"</p>
             </div>
           )}
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] p-4 rounded-2xl ${
                 msg.role === 'user' 
                 ? 'bg-indigo-600 text-white rounded-br-none' 
                 : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
               }`}>
                 <p className="whitespace-pre-wrap">{msg.text}</p>
               </div>
             </div>
           ))}
           {loading && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-gray-500">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 <span className="text-sm">Analyzing market data...</span>
               </div>
             </div>
           )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input 
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ask for strategic advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple loader icon component for local use if needed, though Lucide has Loader2
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default Consultant;
