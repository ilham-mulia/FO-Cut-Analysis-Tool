/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CalculatorTable } from './components/CalculatorTable';
import { MasterData, ConfigArea, SIAEdge } from './types';
import { Network } from 'lucide-react';
import { cn } from './lib/utils';
import { ConfigView } from './components/ConfigView';
import { SIASheetView } from './components/SIASheetView';

type Tab = 'FO_Cut_Input' | 'Config' | 'SIA_Master';

export default function App() {
  const [masterData, setMasterData] = useState<MasterData>({ config: [], siaEdges: [] });
  const [activeTab, setActiveTab] = useState<Tab>('FO_Cut_Input');

  const updateConfig = (config: ConfigArea[]) => {
    setMasterData(prev => ({ ...prev, config }));
  };

  const updateSIA = (siaEdges: SIAEdge[]) => {
    setMasterData(prev => ({ ...prev, siaEdges }));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight uppercase text-slate-900">FO Cut Analysis Tool</h1>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('FO_Cut_Input')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded transition-colors", activeTab === 'FO_Cut_Input' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
          >
            FO_Cut_Input
          </button>
          <button 
            onClick={() => setActiveTab('Config')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded transition-colors", activeTab === 'Config' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
          >
            Config
          </button>
          <button 
            onClick={() => setActiveTab('SIA_Master')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded transition-colors", activeTab === 'SIA_Master' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
          >
            SIA Master
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col gap-6">
        <div className="flex-1 flex flex-col min-h-[500px]">
          {activeTab === 'FO_Cut_Input' && <CalculatorTable masterData={masterData} />}
          {activeTab === 'Config' && <ConfigView configData={masterData.config} onUpdate={updateConfig} />}
          {activeTab === 'SIA_Master' && <SIASheetView siaEdges={masterData.siaEdges} onUpdate={updateSIA} />}
        </div>
      </main>

      <footer className="h-8 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <span className="text-[10px] font-medium text-slate-400">Formula Mode: <span className="text-green-600">Active</span></span>
          <span className="text-[10px] font-medium text-slate-400">Config: <span className="text-slate-900">{masterData.config.length} Rows</span></span>
          <span className="text-[10px] font-medium text-slate-400">SIA Master: <span className="text-slate-900">{masterData.siaEdges.length} Rows</span></span>
        </div>
        <div className="text-[10px] text-slate-400">
          LatLong Precision Enabled | Auto-Tolerance: 30m
        </div>
      </footer>
    </div>
  );
}
