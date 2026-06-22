import React, { useState, useMemo } from 'react';
import { FOCutInput, FOCutResult, MasterData } from '../types';
import { calculateFOCut } from '../lib/calculator';
import { Plus, Trash2, Calculator, Copy, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  masterData: MasterData | null;
}

interface TableRow extends FOCutInput {
  result?: FOCutResult;
}

export function CalculatorTable({ masterData }: Props) {
  const [rows, setRows] = useState<TableRow[]>([
    { id: crypto.randomUUID(), area_hint: '', cut_lat: null, cut_lng: null, tolerance_m: 30 }
  ]);
  const [calculating, setCalculating] = useState(false);

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), area_hint: '', cut_lat: null, cut_lng: null, tolerance_m: 30 }]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof FOCutInput, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value, result: undefined } : r));
  };

  const runCalculations = () => {
    if (!masterData || masterData.siaEdges.length === 0) return;
    setCalculating(true);
    
    // Slight timeout allows UI to update to 'calculating' state before blocking main thread
    setTimeout(() => {
      const updatedRows = rows.map(row => {
        if (row.cut_lat === null || row.cut_lng === null || isNaN(row.cut_lat) || isNaN(row.cut_lng)) {
          return row;
        }
        const res = calculateFOCut(row, masterData.siaEdges);
        return { ...row, result: res };
      });
      setRows(updatedRows);
      setCalculating(false);
    }, 50);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const newRows: TableRow[] = pastedText.split('\n').filter(line => line.trim() !== '').map(line => {
      const cols = line.split('\t');
      return {
        id: crypto.randomUUID(),
        area_hint: cols[0]?.trim() || '',
        cut_lat: cols[1] && !isNaN(parseFloat(cols[1])) ? parseFloat(cols[1]) : null,
        cut_lng: cols[2] && !isNaN(parseFloat(cols[2])) ? parseFloat(cols[2]) : null,
        tolerance_m: cols[3] && !isNaN(parseFloat(cols[3])) ? parseFloat(cols[3]) : 30
      };
    });
    if (newRows.length > 0) {
      // replace the default row if it's empty
      if (rows.length === 1 && rows[0].cut_lat === null && rows[0].cut_lng === null && rows[0].area_hint === '') {
        setRows(newRows);
      } else {
        setRows(prev => [...prev, ...newRows]);
      }
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return '';
    return num.toString();
  };

  if (!masterData || masterData.siaEdges.length === 0) {
    return (
      <div className="bg-white p-8 border border-slate-200 rounded-lg shadow-sm text-center">
        <Info className="w-8 h-8 text-blue-500 mx-auto mb-3" />
        <h3 className="text-slate-900 font-semibold text-sm">No Master Data</h3>
        <p className="text-slate-500 text-xs mt-1">Please upload the SIA Excel file above to start calculations.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
      <datalist id="area-hint-list">
        {masterData.config?.map((c, i) => (
          <option key={i} value={c.area} />
        ))}
      </datalist>

      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">FO Cut Calculator</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-4 h-8 text-xs font-semibold rounded bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
          <button
            onClick={runCalculations}
            disabled={calculating}
            className={cn(
              "flex items-center gap-1.5 px-4 h-8 bg-blue-600 text-white rounded font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm",
              calculating && "opacity-70 cursor-not-allowed"
            )}
          >
            <Calculator className="w-3.5 h-3.5" />
            {calculating ? "Calculating..." : "Calculate All"}
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-start gap-3 w-full max-w-2xl">
          <Copy className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 w-full">
            <p className="font-semibold text-slate-700 mb-1">Bulk Paste Helper</p>
            <p>You can paste data directly from Excel here. Data should be exactly 4 columns: <span className="font-mono bg-white border border-slate-200 px-1 rounded text-slate-800">Area_hint | lat | lng | tolerance</span></p>
            <textarea 
              className="mt-2 w-full h-10 px-3 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-500 placeholder-slate-400 font-mono shadow-inner resize-none"
              placeholder="Paste from Excel here..."
              onPaste={handlePaste}
              value=""
              onChange={() => {}}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Area Hint</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Lat <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Lng <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 bg-slate-50">Tolerance</th>
              <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/50">Nearest SIA</th>
              <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/50">Distance (m)</th>
              <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/50">Match Status</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white">SIA ORG</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white">SIA DST</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white">PO_ID</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white">PO_Name</th>
              <th className="px-4 py-3 w-10 bg-white"></th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 group">
                <td className="px-4 py-1.5 focus-within:bg-blue-50/30">
                  <div className="relative">
                    <input
                      type="text"
                      list="area-hint-list"
                      value={row.area_hint}
                      onChange={(e) => updateRow(row.id, 'area_hint', e.target.value)}
                      className="w-full min-w-[120px] h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-300 font-semibold text-slate-700"
                      placeholder="Optional"
                    />
                  </div>
                </td>
                <td className="px-4 py-1.5 focus-within:bg-blue-50/30">
                  <input
                    type="number"
                    step="0.000001"
                    value={formatNumber(row.cut_lat)}
                    onChange={(e) => updateRow(row.id, 'cut_lat', parseFloat(e.target.value))}
                    className="w-full min-w-[100px] h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-300 text-slate-700"
                    placeholder="Required"
                  />
                </td>
                <td className="px-4 py-1.5 focus-within:bg-blue-50/30">
                  <input
                    type="number"
                    step="0.000001"
                    value={formatNumber(row.cut_lng)}
                    onChange={(e) => updateRow(row.id, 'cut_lng', parseFloat(e.target.value))}
                    className="w-full min-w-[100px] h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono placeholder-slate-300 text-slate-700"
                    placeholder="Required"
                  />
                </td>
                <td className="px-4 py-1.5 border-r border-slate-200 focus-within:bg-blue-50/30">
                  <input
                    type="number"
                    value={formatNumber(row.tolerance_m)}
                    onChange={(e) => updateRow(row.id, 'tolerance_m', parseFloat(e.target.value))}
                    className="w-full min-w-[60px] h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-center text-slate-700"
                  />
                </td>
                
                {/* Result Columns */}
                <td className="px-4 py-2 font-mono font-bold text-slate-800 bg-blue-50/10">
                  {row.result?.Nearest_SIA || '-'}
                </td>
                <td className="px-4 py-2 font-mono font-bold text-slate-800 bg-blue-50/10">
                  {row.result?.Nearest_Distance_m !== undefined ? row.result.Nearest_Distance_m : '-'}
                </td>
                <td className="px-4 py-2 bg-blue-50/10">
                  {row.result ? (
                    <span className={cn(
                      "px-2.5 py-1 inline-flex text-[10px] font-bold uppercase rounded-md tracking-wide",
                      row.result.Match_Status === 'MATCHED' ? "bg-green-100 text-green-700" :
                      row.result.Match_Status === 'OUT_OF_TOLERANCE' ? "bg-red-100 text-red-700" :
                      row.result.Match_Status === 'REVIEW_MULTIPLE' ? "bg-yellow-100 text-yellow-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {row.result.Match_Status}
                    </span>
                  ) : '-'}
                </td>
                
                <td className="px-4 py-2 font-mono text-slate-600">
                  {row.result?.SIA_ORG || '-'}
                </td>
                <td className="px-4 py-2 font-mono text-slate-600">
                  {row.result?.SIA_DST || '-'}
                </td>
                <td className="px-4 py-2 font-mono text-slate-600">
                  {row.result?.PO_ID || '-'}
                </td>
                <td className="px-4 py-2 font-semibold text-slate-600">
                  {row.result?.PO_Name || '-'}
                </td>

                <td className="px-4 py-2 text-right">
                  <button onClick={() => removeRow(row.id)} className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1.5 rounded hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-xs text-slate-500 font-medium bg-slate-50/50">
                  No input rows. Click "Add Row" or paste from Excel to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

