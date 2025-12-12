import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { ViewState } from './types';
import { LayoutGrid, Package, TrendingUp, Users, BrainCircuit, Menu } from 'lucide-react';

import POS from './components/POS';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import Customers from './components/Customers';
import Consultant from './components/Consultant';
import VoiceHardy from './components/VoiceHardy';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('POS');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (view) {
      case 'POS': return <POS />;
      case 'INVENTORY': return <Inventory />;
      case 'ACCOUNTING': return <Accounting />;
      case 'CUSTOMERS': return <Customers />;
      case 'CONSULTANT': return <Consultant />;
      default: return <POS />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => { setView(id); setMobileMenuOpen(false); }}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full btn-haptic
        ${view === id 
          ? 'bg-blue-500 text-white font-semibold shadow-md shadow-blue-200' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}
    >
      <Icon className={`w-5 h-5 ${view === id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
        
        {/* Desktop Sidebar (Apple Sidebar Style) */}
        <aside className="hidden md:flex flex-col w-[280px] bg-[#FBFBFD]/80 backdrop-blur-xl border-r border-gray-200/50 h-screen sticky top-0 z-30">
          <div className="p-8 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
              Hardware<span className="text-blue-500">POS</span>
            </h1>
            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Engr Quilang • Cabbo</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 mt-4">
            <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Store</div>
            <NavItem id="POS" icon={LayoutGrid} label="Point of Sale" />
            <NavItem id="INVENTORY" icon={Package} label="Inventory" />
            
            <div className="mt-8 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Management</div>
            <NavItem id="ACCOUNTING" icon={TrendingUp} label="Financials" />
            <NavItem id="CUSTOMERS" icon={Users} label="Builders Ledger" />
            
            <div className="mt-8 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Intelligence</div>
            <NavItem id="CONSULTANT" icon={BrainCircuit} label="Ask Consultant" />
          </nav>

          <div className="p-6 bg-gradient-to-t from-white to-transparent">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Powered By</p>
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <span className="text-xs font-semibold text-gray-700">Aitek & Gemini</span>
               </div>
               <div className="h-px bg-gray-100 w-full my-2"></div>
               <p className="text-[10px] text-gray-400">Created by <span className="text-blue-600 font-semibold">Emilio AI</span></p>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-40 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Engr Quilang Hardware</h1>
            <p className="text-[10px] text-gray-500 font-medium">Powered by Aitek & Gemini</p>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-100 rounded-full">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-xl p-6 animate-in slide-in-from-top-10 fade-in duration-200">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 font-medium">Close</button>
             </div>
             <nav className="space-y-2">
                <NavItem id="POS" icon={LayoutGrid} label="Point of Sale" />
                <NavItem id="INVENTORY" icon={Package} label="Inventory" />
                <NavItem id="ACCOUNTING" icon={TrendingUp} label="Finance" />
                <NavItem id="CUSTOMERS" icon={Users} label="Builders Ledger" />
                <NavItem id="CONSULTANT" icon={BrainCircuit} label="AI Consultant" />
             </nav>
             <div className="mt-12 text-center text-xs text-gray-400">
               <p>Created by Emilio AI</p>
             </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full w-full overflow-y-auto">
             {renderView()}
          </div>
          
          {/* Floating Voice Assistant */}
          <VoiceHardy />
        </main>

      </div>
    </StoreProvider>
  );
};

export default App;