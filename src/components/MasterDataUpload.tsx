import React, { useState } from 'react';
import * as xlsx from 'xlsx';
import { SIAEdge, MasterData, ConfigArea } from '../types';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  mode: 'config' | 'sia';
  onDataLoaded: (data: MasterData) => void;
}

export function MasterDataUpload({ mode, onDataLoaded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        
        let siaEdges: SIAEdge[] = [];
        let configData: ConfigArea[] = [];
        
        if (mode === 'sia') {
          // Try to find the SIA or SIA_Edges sheet
          const siaSheetName = wb.SheetNames.find(n => n.toLowerCase().includes('sia')) || wb.SheetNames.find(n => !n.toLowerCase().includes('config') && !n.toLowerCase().includes('input'));
          
          if (siaSheetName) {
             const ws = wb.Sheets[siaSheetName];
             const data = xlsx.utils.sheet_to_json<any>(ws);
             
             siaEdges = data.map((row: any, index: number) => {
               return {
                 rowNum: row.No || index + 1,
                 area: row.Area || '',
                 po_id: row.PO_ID || '',
                 po_name: row.PO_Name || '',
                 segment_po_id: row.Segment_PO_ID || '',
                 sub_segment: row.Sub_Segment || '',
                 sia: row.SIA || '',
                 org_lat: parseFloat(row.org_lat) || parseFloat(row.SIA_ORG?.split(',')[0]) || 0,
                 org_lng: parseFloat(row.org_lng) || parseFloat(row.SIA_ORG?.split(',')[1]) || 0,
                 dst_lat: parseFloat(row.dst_lat) || parseFloat(row.SIA_DST?.split(',')[0]) || 0,
                 dst_lng: parseFloat(row.dst_lng) || parseFloat(row.SIA_DST?.split(',')[1]) || 0,
                 length_sia: parseFloat(row.length_SIA) || 0,
                 
                 min_lat: Math.min(parseFloat(row.org_lat) || 0, parseFloat(row.dst_lat) || 0),
                 max_lat: Math.max(parseFloat(row.org_lat) || 0, parseFloat(row.dst_lat) || 0),
                 min_lng: Math.min(parseFloat(row.org_lng) || 0, parseFloat(row.dst_lng) || 0),
                 max_lng: Math.max(parseFloat(row.org_lng) || 0, parseFloat(row.dst_lng) || 0),

                 merge_status: row.merge_status || '',
                 source_segment_count: parseInt(row.source_segment_count) || 0,
                 source_segment_ids: row.source_segment_ids || '',
                 source_segment_parts: row.source_segment_parts || '',
                 virtual_connection_count: parseInt(row.virtual_connection_count) || 0,
                 max_virtual_gap_m: parseFloat(row.max_virtual_gap_m) || 0,
                 length_rule_status: row.length_rule_status || '',
                 geometry_wkt: row.geometry_wkt || '',
                 SIA_ORG: row.SIA_ORG || '',
                 SIA_DST: row.SIA_DST || ''
               };
             }).filter((e) => e.sia); // filter out empty rows
          }
          if (siaEdges.length === 0) {
            throw new Error("No valid SIA data found. Please ensure the sheet has SIA, org_lat, org_lng columns.");
          }
          onDataLoaded({ config: [], siaEdges });
          setSuccess(`Successfully loaded ${siaEdges.length} SIA records.`);
        } 
        else if (mode === 'config') {
          const configSheetName = wb.SheetNames.find(n => n.toLowerCase().includes('config')) || wb.SheetNames[0];
          if (configSheetName) {
             const wsConfig = wb.Sheets[configSheetName];
             const rawConfig = xlsx.utils.sheet_to_json<any>(wsConfig);
             configData = rawConfig.map((row: any) => ({
               area: row.Area || row.Area_hint || '',
               first_edge_row: parseInt(row.First_Edge_Row) || 0,
               last_edge_row: parseInt(row.Last_Edge_Row) || 0
             })).filter((c) => c.area);
          }
          if (configData.length === 0) {
            throw new Error("No valid Config data found. Please ensure the sheet has Area, First_Edge_Row, Last_Edge_Row.");
          }
          onDataLoaded({ config: configData, siaEdges: [] });
          setSuccess(`Successfully loaded ${configData.length} Config records.`);
        }

      } catch (err: any) {
        setError(err.message || "Failed to parse the Excel file.");
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setLoading(false);
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const title = mode === 'config' ? 'Upload Config Data' : 'Upload SIA Master Data';
  const desc = mode === 'config' 
    ? 'Upload Config sheet with headers: Area, First_Edge_Row, Last_Edge_Row.'
    : 'Upload SIA Master sheet with headers: Area, PO_ID, PO_Name, Segment_PO_ID, SIA, org_lat, org_lng...';

  return (
    <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm mb-6 shrink-0">
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          {title}
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl">{desc}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <label className={cn(
          "relative cursor-pointer h-10 px-6 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm",
          loading && "opacity-50 cursor-not-allowed"
        )}>
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {loading ? "Processing..." : "Select Excel File"}
          </span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="sr-only"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
