import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { HARDY_SYSTEM_INSTRUCTION } from '../constants';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';
import { useStore } from '../context/StoreContext';

const VoiceHardy: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0); 
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  const { products, customers } = useStore();

  const stop = () => {
    setIsActive(false);
    setIsConnecting(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
  };

  const start = async () => {
    if (!process.env.API_KEY) {
      alert("API Key missing");
      return;
    }

    setIsConnecting(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: HARDY_SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
          },
          tools: [{ 
             functionDeclarations: [
               {
                 name: 'checkInventory',
                 description: 'Check stock level and price of a product',
                 parameters: {
                   type: Type.OBJECT,
                   properties: {
                     productName: { type: Type.STRING, description: 'Name of the product' }
                   },
                   required: ['productName']
                 }
               },
               {
                 name: 'checkCustomerBalance',
                 description: 'Check the balance of a customer',
                 parameters: {
                   type: Type.OBJECT,
                   properties: {
                     customerName: { type: Type.STRING, description: 'Name of the customer' }
                   },
                   required: ['customerName']
                 }
               }
             ]
          }]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length));
              const blob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: blob }));
            };
            source.connect(processor);
            processor.connect(audioCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData) {
               const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
               const source = outputCtx.createBufferSource();
               source.buffer = buffer;
               source.connect(outputCtx.destination);
               const now = outputCtx.currentTime;
               const startTime = Math.max(now, nextStartTimeRef.current);
               source.start(startTime);
               nextStartTimeRef.current = startTime + buffer.duration;
             }
             if (msg.toolCall) {
               for (const fc of msg.toolCall.functionCalls) {
                 let result = "Not found";
                 if (fc.name === 'checkInventory') {
                   const name = (fc.args as any).productName.toLowerCase();
                   const item = products.find(p => p.name.toLowerCase().includes(name));
                   if (item) {
                     result = `${item.name}: Price is ${item.price} pesos, Stock is ${item.stock} ${item.unit}.`;
                   } else {
                     result = `Product ${name} not found.`;
                   }
                 } else if (fc.name === 'checkCustomerBalance') {
                   const name = (fc.args as any).customerName.toLowerCase();
                   const cust = customers.find(c => c.name.toLowerCase().includes(name));
                   if (cust) {
                     result = `${cust.name} has a balance of ${cust.balance} pesos.`;
                   } else {
                     result = `Customer ${name} not found.`;
                   }
                 }
                 sessionPromise.then(session => {
                   session.sendToolResponse({
                     functionResponses: { id: fc.id, name: fc.name, response: { result } }
                   });
                 });
               }
             }
          },
          onclose: () => stop(),
          onerror: (err) => { console.error(err); stop(); }
        }
      });
      sessionPromise.then(sess => sessionRef.current = sess);
    } catch (e) {
      console.error("Failed to connect", e);
      stop();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 flex flex-col items-end gap-3">
      {isActive && (
        <div className="bg-white/90 backdrop-blur-xl text-gray-900 p-5 rounded-[24px] shadow-2xl w-72 mb-2 animate-in slide-in-from-bottom-5 border border-white/50">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
               <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
               <div>
                  <span className="font-bold text-sm block leading-none">Hardy</span>
                  <span className="text-[10px] text-gray-500 font-medium">Powered by Aitek</span>
               </div>
             </div>
             <button onClick={stop} className="p-1 rounded-full hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
           </div>
           <div className="h-12 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
              <div className="flex gap-1 items-center h-full z-10">
                 {[...Array(5)].map((_,i) => (
                   <div key={i} 
                     className="w-1.5 bg-gray-900 rounded-full transition-all duration-75"
                     style={{ height: `${Math.min(100, Math.max(20, volume * 500 * (Math.random() + 0.5)))}%` }}
                   />
                 ))}
              </div>
           </div>
           <p className="text-xs text-gray-400 mt-3 text-center font-medium">"Tanungin mo lang ako Boss!"</p>
        </div>
      )}

      <button
        onClick={isActive ? stop : start}
        className={