import React, { useState } from 'react';
import { FOCutInput, FOCutResult, MasterData } from '../types';
import { calculateFOCut } from '../lib/calculator';
import { Search, Info, MapPin, Gauge } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  masterData: MasterData | null;
}

export function CalculatorTable({ masterData }: Props) {
  const [form, setForm] = useState<FOCutInput>({
    id: 'search',
    area_hint: '',
    cut_lat: null,
    cut_lng: null,
    tolerance_m: 30
  });

  const [result, setResult] = useState<FOCutResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterData || masterData.siaEdges.length === 0) return;
    if (form.cut_lat === null || form.cut_lng === null || isNaN(form.cut_lat) || isNaN(form.cut_lng)) return;

    setCalculating(true);
    setTimeout(() => {
      const res = calculateFOCut(form, masterData.siaEdges);
      setResult(res);
      setCalculating(false);
    }, 50);
  };

  const updateField = (field: keyof FOCutInput, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const formatNullable = (val: number | null) => (val === null || isNaN(val) ? '' : val.toString());

  if (!masterData || masterData.siaEdges.length === 0) {
    return (
      <div className="bg-white p-8 border border-slate-200 rounded-lg shadow-sm text-center max-w-2xl mx-auto w-full mt-10">
        <Info className="w-8 h-8 text-blue-500 mx-auto mb-3" />
        <h3 className="text-slate-900 font-semibold text-base">No Master Data Loaded</h3>
        <p className="text-slate-500 text-sm mt-1">Please upload the SIA Master Data to start using the FO Cut Locator.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-6 gap-8 pb-12">
      <datalist id="area-hint-list">
        {masterData.config?.map((c, i) => (
          <option key={i} value={c.area} />
        ))}
      </datalist>

      {/* SEARCH WIDGET */}
      <form 
        onSubmit={handleSearch}
        className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-6"
      >
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Find Nearest SIA
          </h2>
          <p className="text-slate-500 text-sm mt-1">Enter coordinates to locate the closest fiber cut.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Area Hint (Opt)</label>
            <input
              type="text"
              list="area-hint-list"
              value={form.area_hint}
              onChange={(e) => updateField('area_hint', e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 font-medium text-slate-800 shadow-inner"
              placeholder="e.g. JB1"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Latitude *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.000001"
                required
                value={formatNullable(form.cut_lat)}
                onChange={(e) => updateField('cut_lat', parseFloat(e.target.value))}
                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono placeholder-slate-400 text-slate-800 shadow-inner"
                placeholder="-6.200000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Longitude *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.000001"
                required
                value={formatNullable(form.cut_lng)}
                onChange={(e) => updateField('cut_lng', parseFloat(e.target.value))}
                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono placeholder-slate-400 text-slate-800 shadow-inner"
                placeholder="106.816666"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tolerance (m)</label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={formatNullable(form.tolerance_m)}
                onChange={(e) => updateField('tolerance_m', parseFloat(e.target.value))}
                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono placeholder-slate-400 text-slate-800 shadow-inner"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={calculating || form.cut_lat === null || form.cut_lng === null}
          className={cn(
            "mt-2 w-full md:w-auto md:self-center h-12 px-10 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5",
            (calculating || form.cut_lat === null || form.cut_lng === null) && "opacity-70 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
          )}
        >
          {calculating ? "Locating..." : "Locate Nearest Cut"}
        </button>
      </form>

      {/* RESULT CARD */}
      {result && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={cn(
            "p-6 border-b",
            result.Match_Status === 'MATCHED' ? "bg-green-50 border-green-100" :
            result.Match_Status === 'OUT_OF_TOLERANCE' ? "bg-red-50 border-red-100" :
            "bg-yellow-50 border-yellow-100"
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={cn(
                    "px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider border",
                    result.Match_Status === 'MATCHED' ? "bg-green-100 text-green-700 border-green-200" :
                    result.Match_Status === 'OUT_OF_TOLERANCE' ? "bg-red-100 text-red-700 border-red-200" :
                    "bg-yellow-100 text-yellow-700 border-yellow-200"
                  )}>
                    {result.Match_Status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-3">
                  {result.Nearest_SIA || <span className="text-slate-400">Not Found</span>}
                </h3>
              </div>
              
              <div className="flex flex-col md:items-end text-left md:text-right gap-1">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Distance</span>
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {result.Nearest_Distance_m !== undefined ? `${result.Nearest_Distance_m.toFixed(2)} m` : '-'}
                </span>
                {result.within_count > 0 && (
                  <span className="text-xs font-medium text-slate-500">
                    Found {result.within_count} segment(s) in tolerance
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8 p-6 md:p-8 bg-white">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matched Area</span>
              <span className="text-sm font-semibold text-slate-800">{result.Matched_Area || '-'}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PO ID</span>
              <span className="text-sm font-semibold text-slate-800">{result.PO_ID || '-'}</span>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PO Name</span>
              <span className="text-sm font-semibold text-slate-800">{result.PO_Name || '-'}</span>
            </div>
            
            <div className="col-span-full h-px bg-slate-100 my-2" />

            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Segment PO ID</span>
              <span className="text-sm font-semibold text-slate-800">{result.Segment_PO_ID || '-'}</span>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-2 md:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub Segment</span>
              <span className="text-sm font-semibold text-slate-800">{result.Sub_Segment || '-'}</span>
            </div>
            
            <div className="col-span-full h-px bg-slate-100 my-2" />

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SIA Length</span>
              <span className="text-sm font-mono text-slate-700">{result.length_SIA ? `${result.length_SIA} m` : '-'}</span>
            </div>
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SIA ORG</span>
              <span className="text-xs font-mono text-slate-500 truncate" title={result.SIA_ORG}>{result.SIA_ORG || '-'}</span>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SIA DST</span>
              <span className="text-xs font-mono text-slate-500 truncate" title={result.SIA_DST}>{result.SIA_DST || '-'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

