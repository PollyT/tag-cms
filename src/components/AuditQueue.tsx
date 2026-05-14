import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { Check, X, Clock, MapPin, Tag as TagIcon, ShieldAlert, Eye, Info, Globe, FileText, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditTag } from '../lib/store';
import { LOCALES } from '../App';

export default function AuditQueue() {
  const { auditQueue, approveAuditTag, rejectAuditTag, updateAuditTag } = useApp();
  const [selectedTagInfo, setSelectedTagInfo] = useState<AuditTag | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'geo' | 'general'>('all');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  
  const pendingTags = useMemo(() => {
    return auditQueue.filter(t => t.status === 'pending' && (typeFilter === 'all' || t.type === typeFilter));
  }, [auditQueue, typeFilter]);

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedTagIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTagIds(next);
  };
  
  const handleSelectAll = () => {
    if (selectedTagIds.size === pendingTags.length && pendingTags.length > 0) {
      setSelectedTagIds(new Set());
    } else {
      setSelectedTagIds(new Set(pendingTags.map(t => t.id)));
    }
  };

  const handleBulkApprove = () => {
    if (selectedTagIds.size === 0) return;
    Array.from(selectedTagIds).forEach(id => {
      approveAuditTag(id);
    });
    setSelectedTagIds(new Set());
  };

  if (auditQueue.filter(t => t.status === 'pending').length === 0) {
    return (
      <div className="flex flex-col flex-1 min-w-0 w-full h-full items-center justify-center text-slate-400 space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner">
          <Check className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Queue Clear</h2>
          <p className="mt-2 text-sm max-w-sm font-medium">All suggested tags have been processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
          <ShieldAlert className="w-5 h-5 text-trip-600" />
          Audit Candidates
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['all', 'general', 'geo'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  typeFilter === type 
                    ? 'bg-white text-trip-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-trip-600 transition-colors"
          >
            {selectedTagIds.size === pendingTags.length && pendingTags.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-trip-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Select All
          </button>

          <button
            onClick={handleBulkApprove}
            disabled={selectedTagIds.size === 0}
            className="px-4 py-2 bg-trip-600 hover:bg-trip-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve Selected ({selectedTagIds.size})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="divide-y divide-slate-50">
          <AnimatePresence>
            {pendingTags.map((tag) => (
              <motion.li 
                key={tag.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`hover:bg-trip-50/20 transition-all group ${selectedTagIds.has(tag.id) ? 'bg-trip-50/10' : ''}`}
              >
                <div className="px-8 py-6 flex items-center justify-between">
                  {/* Info */}
                  <div className="flex items-center gap-6 flex-1">
                    <button 
                      onClick={() => handleToggleSelect(tag.id)}
                      className="text-slate-300 hover:text-trip-600 transition-colors"
                    >
                      {selectedTagIds.has(tag.id) ? (
                        <CheckSquare className="w-5 h-5 text-trip-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div className={`p-4 rounded-2xl border ${tag.type === 'geo' ? 'bg-trip-100 border-trip-200 text-trip-700' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                      {tag.type === 'geo' ? <MapPin className="w-6 h-6" /> : <TagIcon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800 uppercase leading-none tracking-tight">{tag.name}</h4>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          <FileText className="w-3 h-3" /> {tag.sourceArticle}
                        </span>
                        <span className="text-[10px] font-black text-trip-600 flex items-center gap-1 bg-trip-50 px-2.5 py-1 rounded-lg leading-none shadow-sm shadow-trip-100 uppercase">
                           Confidence: {(tag.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedTagInfo(tag)}
                      className="p-2.5 text-slate-300 hover:text-trip-600 hover:bg-trip-50 rounded-xl transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => rejectAuditTag(tag.id)}
                      className="px-6 py-2.5 text-xs font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={() => approveAuditTag(tag.id)}
                      className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
            {pendingTags.length === 0 && typeFilter !== 'all' && (
               <li className="px-8 py-12 text-center text-slate-400 text-sm font-medium">
                 No {typeFilter} tags in the queue right now.
               </li>
            )}
          </AnimatePresence>
        </ul>
      </div>

      {/* Tag Info / Edit Modal */}
      {selectedTagInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[100dvh] sm:max-h-[90dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50 shrink-0">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                <Info className="w-5 h-5 text-trip-600" /> Tag Details
              </h3>
              <button 
                onClick={() => setSelectedTagInfo(null)} 
                className="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Master Name</label>
                <input 
                  type="text" 
                  value={selectedTagInfo.name}
                  onChange={e => setSelectedTagInfo({...selectedTagInfo, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Type</label>
                  <select 
                    value={selectedTagInfo.type}
                    onChange={e => setSelectedTagInfo({...selectedTagInfo, type: e.target.value as 'geo' | 'general'})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none transition-all"
                  >
                    <option value="general">General Topic</option>
                    <option value="geo">Geographic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Base Description</label>
                <textarea 
                  rows={3}
                  value={selectedTagInfo.description || ''}
                  onChange={e => setSelectedTagInfo({...selectedTagInfo, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none transition-all" 
                />
              </div>

              <div className="pt-6 border-t border-slate-100 mt-4">
                <h4 className="text-xs font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide"><Globe className="w-4 h-4 text-trip-600" /> Localizations</h4>
                <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {LOCALES.filter(l => l.id !== 'en').map(locale => (
                    <div key={locale.id} className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">{locale.label}</label>
                      <input 
                        type="text" 
                        value={selectedTagInfo.locales?.[locale.id] || ''}
                        onChange={e => setSelectedTagInfo({
                          ...selectedTagInfo, 
                          locales: { ...(selectedTagInfo.locales || {}), [locale.id]: e.target.value } 
                        })}
                        placeholder={`Translation...`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-trip-500/20 outline-none transition-all" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => {
                  rejectAuditTag(selectedTagInfo.id);
                  setSelectedTagInfo(null);
                }} 
                className="px-6 py-2.5 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase lg:mr-auto"
              >
                Discard Proposal
              </button>
              <button 
                type="button" 
                onClick={() => {
                  updateAuditTag(selectedTagInfo.id, selectedTagInfo);
                  setSelectedTagInfo(null);
                }} 
                className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
              >
                Save Draft
              </button>
              <button 
                type="button" 
                onClick={() => {
                  updateAuditTag(selectedTagInfo.id, selectedTagInfo);
                  approveAuditTag(selectedTagInfo.id);
                  setSelectedTagInfo(null);
                }} 
                className="px-10 py-3 text-sm font-black text-white bg-trip-600 hover:bg-trip-700 rounded-2xl transition-all shadow-xl shadow-trip-500/20 active:scale-95 uppercase tracking-widest"
              >
                Approve & Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
