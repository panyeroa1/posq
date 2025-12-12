import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { ViewState } from './types';
import { LayoutGrid, Package, TrendingUp, Users, BrainCircuit } from 'lucide-react';

import POS from './components/POS';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import Customers from './components/Customers';
import Consultant from './components/Consultant';
import VoiceHardy from './components/VoiceHardy';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('POS');

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
      onClick={() => setView(id)}
      className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-6 md:py-3 rounded-xl transition-all
        ${view === id 
          ? 'text-blue-600 bg-blue-50 font-bold' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
    >
      <Icon className="w-6 h-6 md:w-5 md:h-5" />
      <span className="text-[10px] md:text-sm">{label}</span>
    </button>
  );

  return (
    <StoreProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-30">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-blue-900 leading-tight">Engr Quilang<br/>Hardware POS</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavItem id="POS" icon={LayoutGrid} label="Point of Sale" />
            <NavItem id="INVENTORY" icon={Package} label="Inventory" />
            <NavItem id="ACCOUNTING" icon={TrendingUp} label="Accounting" />
            <NavItem id="CUSTOMERS" icon={Users} label="Builders Ledger" />
            <div className="pt-4 border-t border-gray-100 mt-4">
              <NavItem id="CONSULTANT" icon={BrainCircuit} label="AI Strategy" />
            </div>
          </nav>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-center text-gray-400">v1.0.0 • Cabbo, Peñablanca</p>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
          <h1 className="text-lg font-extrabold text-blue-900">Engr Quilang Hardware</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          {renderView()}
          
          {/* Floating Voice Assistant */}
          <VoiceHardy />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-40">
          <NavItem id="POS" icon={LayoutGrid} label="POS" />
          <NavItem id="INVENTORY" icon={Package} label="Stocks" />
          <NavItem id="ACCOUNTING" icon={TrendingUp} label="Finance" />
          <NavItem id="CUSTOMERS" icon={Users} label="Ledger" />
          <NavItem id="CONSULTANT" icon={BrainCircuit} label="AI" />
        </nav>

      </div>
    </StoreProvider>
  );
};

export default App;
