import React, { useState } from 'react';
import { SIAEdge } from '../types';
import { Database, Trash2, Edit2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MasterDataUpload } from './MasterDataUpload';
import { cn } from '../lib/utils';

interface Props {
  siaEdges: SIAEdge[];
  onUpdate: (data: SIAEdge[]) => void;
}

export function SIASheetView({ siaEdges, onUpdate }: Props) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 100;
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<SIAEdge>>({});

  const filteredEdges = React.useMemo(() => {
    if (!searchTerm) return siaEdges;
    const lower = searchTerm.toLowerCase();
    return siaEdges.filter(edge => 
      edge.po_id?.toLowerCase().includes(lower) || 
      edge.po_name?.toLowerCase().includes(lower) ||
      edge.sia?.toLowerCase().includes(lower) ||
      edge.segment_po_id?.toLowerCase().includes(lower) ||
      edge.SIA_ORG?.toLowerCase().includes(lower) ||
      edge.SIA_DST?.toLowerCase().includes(lower) ||
      edge.area?.toLowerCase().includes(lower)
    );
  }, [searchTerm, siaEdges]);

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredEdges.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const limitedEdges = filteredEdges.slice(startIndex, startIndex + rowsPerPage);

  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = () => {
    if (confirmClear) {
      onUpdate([]);
      setPage(1);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000); // Reset after 3 seconds
    }
  };

  const handleRemoveRow = (globalIndex: number) => {
    const newData = [...siaEdges];
    newData.splice(globalIndex, 1);
    onUpdate(newData);
    if (limitedEdges.length === 1 && page > 1) {
      setPage(page - 1);
    }
  };

  const handleEditClick = (globalIndex: number, row: SIAEdge) => {
    setEditingIndex(globalIndex);
    setEditForm(row);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const handleSaveEdit = (globalIndex: number) => {
    const newData = [...siaEdges];
    newData[globalIndex] = { ...newData[globalIndex], ...editForm } as SIAEdge;
    onUpdate(newData);
    setEditingIndex(null);
  };

  const inputClass = "w-full min-w-[80px] h-7 px-2 bg-white border border-slate-300 rounded text-[10px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";

  return (
    <div className="flex flex-col h-full gap-4">
      <MasterDataUpload mode="sia" onDataLoaded={(data) => {
        onUpdate(data.siaEdges);
        setPage(1);
      }} />

      {siaEdges.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm p-8 text-center flex flex-col items-center justify-center">
          <Database className="w-8 h-8 text-slate-300 mb-3" />
          <h3 className="text-slate-900 font-semibold text-sm">No SIA Master Data</h3>
          <p className="text-slate-500 text-xs mt-1">Please upload the master dataset to view records.</p>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col min-h-0 shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[140px]">SIA Master Table</h2>
            <div className="flex-1 max-w-sm">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-8 px-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 outline-none transition-colors"
               />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                Total: {filteredEdges.length} Rows
              </div>
              <button onClick={handleClearAll} className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                {confirmClear ? "Click again to confirm" : "Clear All"}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">No</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Area</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">PO_ID</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">PO_Name</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Segment_PO_ID</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sub_Segment</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIA</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">org_lat</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">org_lng</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">dst_lat</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">dst_lng</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">length_SIA</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">merge_status</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">source_segment_count</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">source_segment_ids</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">source_segment_parts</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">virtual_connection_count</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">max_virtual_gap_m</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">length_rule_status</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">geometry_wkt</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIA_ORG</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIA_DST</th>
                  <th className="px-3 py-2 text-[10px] w-14 bg-slate-50 sticky right-0">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 bg-white">
                {limitedEdges.map((row, i) => {
                  const globalIndex = startIndex + i;
                  const isEditing = editingIndex === globalIndex;
                  return (
                  <tr key={globalIndex} className={cn("group hover:bg-slate-50", isEditing && "bg-blue-50/30")}>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input disabled value={row.rowNum} className={inputClass} /> : row.rowNum}
                    </td>
                    <td className="px-3 py-1.5 font-semibold text-slate-700">
                      {isEditing ? <input value={editForm.area || ''} onChange={e => setEditForm({...editForm, area: e.target.value})} className={inputClass} /> : row.area}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {isEditing ? <input value={editForm.po_id || ''} onChange={e => setEditForm({...editForm, po_id: e.target.value})} className={inputClass} /> : row.po_id}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {isEditing ? <input value={editForm.po_name || ''} onChange={e => setEditForm({...editForm, po_name: e.target.value})} className={inputClass} /> : row.po_name}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {isEditing ? <input value={editForm.segment_po_id || ''} onChange={e => setEditForm({...editForm, segment_po_id: e.target.value})} className={inputClass} /> : row.segment_po_id}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {isEditing ? <input value={editForm.sub_segment || ''} onChange={e => setEditForm({...editForm, sub_segment: e.target.value})} className={inputClass} /> : row.sub_segment}
                    </td>
                    <td className="px-3 py-1.5 font-mono font-bold text-blue-600">
                      {isEditing ? <input value={editForm.sia || ''} onChange={e => setEditForm({...editForm, sia: e.target.value})} className={inputClass} /> : row.sia}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" step="any" value={editForm.org_lat || ''} onChange={e => setEditForm({...editForm, org_lat: parseFloat(e.target.value)})} className={inputClass} /> : row.org_lat}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" step="any" value={editForm.org_lng || ''} onChange={e => setEditForm({...editForm, org_lng: parseFloat(e.target.value)})} className={inputClass} /> : row.org_lng}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" step="any" value={editForm.dst_lat || ''} onChange={e => setEditForm({...editForm, dst_lat: parseFloat(e.target.value)})} className={inputClass} /> : row.dst_lat}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" step="any" value={editForm.dst_lng || ''} onChange={e => setEditForm({...editForm, dst_lng: parseFloat(e.target.value)})} className={inputClass} /> : row.dst_lng}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" step="any" value={editForm.length_sia || ''} onChange={e => setEditForm({...editForm, length_sia: parseFloat(e.target.value)})} className={inputClass} /> : row.length_sia}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {isEditing ? <input value={editForm.merge_status || ''} onChange={e => setEditForm({...editForm, merge_status: e.target.value})} className={inputClass} /> : row.merge_status}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" value={editForm.source_segment_count || ''} onChange={e => setEditForm({...editForm, source_segment_count: parseInt(e.target.value)})} className={inputClass} /> : row.source_segment_count}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input value={editForm.source_segment_ids || ''} onChange={e => setEditForm({...editForm, source_segment_ids: e.target.value})} className={inputClass} /> : row.source_segment_ids}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input value={editForm.source_segment_parts || ''} onChange={e => setEditForm({...editForm, source_segment_parts: e.target.value})} className={inputClass} /> : row.source_segment_parts}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" value={editForm.virtual_connection_count || ''} onChange={e => setEditForm({...editForm, virtual_connection_count: parseInt(e.target.value)})} className={inputClass} /> : row.virtual_connection_count}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500">
                      {isEditing ? <input type="number" step="any" value={editForm.max_virtual_gap_m || ''} onChange={e => setEditForm({...editForm, max_virtual_gap_m: parseFloat(e.target.value)})} className={inputClass} /> : row.max_virtual_gap_m}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {isEditing ? <input value={editForm.length_rule_status || ''} onChange={e => setEditForm({...editForm, length_rule_status: e.target.value})} className={inputClass} /> : row.length_rule_status}
                    </td>
                    <td className="px-3 py-1.5 text-slate-500 max-w-[100px] truncate">
                      {isEditing ? <input value={editForm.geometry_wkt || ''} onChange={e => setEditForm({...editForm, geometry_wkt: e.target.value})} className={inputClass} /> : row.geometry_wkt}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500 max-w-[100px] truncate" title={row.SIA_ORG}>
                      {isEditing ? <input value={editForm.SIA_ORG || ''} onChange={e => setEditForm({...editForm, SIA_ORG: e.target.value})} className={inputClass} /> : row.SIA_ORG}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500 max-w-[100px] truncate" title={row.SIA_DST}>
                      {isEditing ? <input value={editForm.SIA_DST || ''} onChange={e => setEditForm({...editForm, SIA_DST: e.target.value})} className={inputClass} /> : row.SIA_DST}
                    </td>
                    <td className="px-3 py-1.5 text-right w-16 bg-white sticky right-0 group-hover:bg-slate-50 border-l border-slate-100">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleSaveEdit(globalIndex)} className="text-green-600 hover:bg-green-100 p-1 rounded transition-colors bg-green-50"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={handleCancelEdit} className="text-slate-500 hover:bg-slate-200 p-1 rounded transition-colors bg-slate-100"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(globalIndex, row)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleRemoveRow(globalIndex)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredEdges.length)} of {filteredEdges.length}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-semibold px-2">Page {page} / {totalPages}</div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
