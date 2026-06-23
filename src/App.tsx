/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CalculatorTable } from './components/CalculatorTable';
import { MasterData, ConfigArea, SIAEdge } from './types';
import { Network, Loader2 } from 'lucide-react';
import { cn } from './lib/utils';
import { ConfigView } from './components/ConfigView';
import { SIASheetView } from './components/SIASheetView';
import { PinProtection } from './components/PinProtection';

type Tab = 'FO_Cut_Input' | 'Config' | 'SIA_Master';

export default function App() {
  const [masterData, setMasterData] = useState<MasterData>({ config: [], siaEdges: [] });
  const [activeTab, setActiveTab] = useState<Tab>('FO_Cut_Input');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Get base path properly
  const basePath = import.meta.env.BASE_PATH || '';

  useEffect(() => {
    async function initData() {
      try {
        const response = await fetch(`${basePath}/api/master-data`);
        if (response.ok) {
          const data = await response.json();
          setMasterData({
            config: data.config || [],
            siaEdges: data.siaEdges || []
          });
        }
      } catch (err) {
        console.error("Failed to load from server", err);
      } finally {
        setIsLoaded(true);
      }
    }
    initData();
  }, [basePath]);

  const saveToServer = async (data: MasterData) => {
    try {
      await fetch(`${basePath}/api/master-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error("Failed to save to server", err);
    }
  };

  const updateConfig = async (config: ConfigArea[]) => {
    const newData = { ...masterData, config };
    setMasterData(newData);
    await saveToServer(newData);
  };

  const updateSIA = async (siaEdges: SIAEdge[]) => {
    const newData = { ...masterData, siaEdges };
    setMasterData(newData);
    await saveToServer(newData);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading Master Data...</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    if (activeTab !== 'FO_Cut_Input' && !isUnlocked) {
      return <PinProtection onUnlock={() => setIsUnlocked(true)} />;
    }

    switch (activeTab) {
      case 'FO_Cut_Input':
        return <CalculatorTable masterData={masterData} />;
      case 'Config':
        return <ConfigView configData={masterData.config} onUpdate={updateConfig} />;
      case 'SIA_Master':
        return <SIASheetView siaEdges={masterData.siaEdges} onUpdate={updateSIA} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-sm">
            <Network className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">ALPACA</h1>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('FO_Cut_Input')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded transition-colors", activeTab === 'FO_Cut_Input' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
          >
            Locator Widget
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
      
      <main className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col gap-6 items-center">
        <div className="flex-1 flex flex-col min-h-[500px] w-full max-w-6xl">
          {renderActiveTab()}
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
