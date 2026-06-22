import React from 'react';
import { ConfigArea } from '../types';
import { FileCode2, Trash2 } from 'lucide-react';
import { MasterDataUpload } from './MasterDataUpload';

interface Props {
  configData: ConfigArea[];
  onUpdate: (data: ConfigArea[]) => void;
}

export function ConfigView({ configData, onUpdate }: Props) {
  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all config data?")) {
      onUpdate([]);
    }
  };

  const handleRemoveRow = (index: number) => {
    const newData = [...configData];
    newData.splice(index, 1);
    onUpdate(newData);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <MasterDataUpload mode="config" onDataLoaded={(data) => onUpdate(data.config)} />
      
      {configData.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm p-8 text-center flex flex-col items-center justify-center">
          <FileCode2 className="w-8 h-8 text-slate-300 mb-3" />
          <h3 className="text-slate-900 font-semibold text-sm">No Config Data</h3>
          <p className="text-slate-500 text-xs mt-1">Config sheet was not found or is empty.</p>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col min-h-0 shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Config Master</h2>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                {configData.length} Rows
              </div>
              <button onClick={handleClearAll} className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Area</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">First Edge Row</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Edge Row</th>
                  <th className="px-4 py-3 text-[10px] w-10"></th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 bg-white">
                {configData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 group">
                    <td className="px-4 py-3 font-semibold text-slate-700">{row.area}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row.first_edge_row}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{row.last_edge_row}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRemoveRow(i)} className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1.5 rounded hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
