import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { TagPageQuery } from '../lib/store';
import { evaluateQuery } from '../lib/store';
import { LOCALES } from '../App';
import { Layers, Search, Globe, Plus, Info, X } from 'lucide-react';
import { motion } from 'motion/react';

export default function TagPageGenerator() {
  const { tags, articles, generateTagPage } = useApp();
  
  const [selectedSite, setSelectedSite] = useState(LOCALES[0].id);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'geo' | 'general'>('all');

  const [query, setQuery] = useState<TagPageQuery>({
    globalOperator: 'AND',
    groups: [{ id: 'g1', operator: 'AND', tags: [] }]
  });
  const [activeGroupId, setActiveGroupId] = useState('g1');

  const activeGroup = useMemo(() => query.groups.find(g => g.id === activeGroupId) || query.groups[0], [query, activeGroupId]);

  const matchingArticlesCount = useMemo(() => {
    return articles.filter(article => evaluateQuery(query, article.tags)).length;
  }, [query, articles]);

  const filteredTags = useMemo(() => {
    return tags.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
        Object.values(t.locales).some(loc => loc.toLowerCase().includes(tagSearchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesSearch && matchesType;
    }).slice(0, 100);
  }, [tags, tagSearchQuery, typeFilter]);

  const handleToggleTag = (tagId: string, groupId?: string) => {
    const gId = groupId || activeGroupId;
    setQuery(q => {
      const gIndex = q.groups.findIndex(g => g.id === gId);
      if (gIndex === -1) return q;
      const group = q.groups[gIndex];
      const nextTags = group.tags.includes(tagId) 
        ? group.tags.filter(t => t !== tagId) 
        : [...group.tags, tagId];
      
      const newGroups = [...q.groups];
      newGroups[gIndex] = { ...group, tags: nextTags };
      return { ...q, groups: newGroups };
    });
  };

  const handleGenerate = () => {
    const validGroups = query.groups.filter(g => g.tags.length > 0);
    if (validGroups.length === 0) return;
    
    generateTagPage(selectedSite, { query });
    setQuery({
      globalOperator: 'AND',
      groups: [{ id: Math.random().toString(), operator: 'AND', tags: [] }]
    });
    alert('Landing page built! View it in the "Tag Pages" archive.');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col md:flex-row gap-6 min-h-0"
      >
        {/* Left Column: Configuration & Status */}
        <div className="md:w-80 lg:w-96 shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Site Selection Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-trip-50 text-trip-600 rounded-2xl shadow-inner border border-trip-100">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-black text-slate-800 uppercase tracking-tight">Locale</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Target Market</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-trip-600 transition-colors" />
                <select 
                   value={selectedSite}
                   onChange={(e) => setSelectedSite(e.target.value)}
                   className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 focus:bg-white transition-all appearance-none cursor-pointer uppercase tracking-tight"
                >
                  {LOCALES.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Plus className="w-3.5 h-3.5 text-slate-300 rotate-45" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logic Builder</label>
                <div className="flex bg-slate-100 rounded p-1">
                  <button 
                    onClick={() => setQuery(q => ({...q, globalOperator: 'AND'}))}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded transition-all ${query.globalOperator === 'AND' ? 'bg-white text-trip-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >AND</button>
                  <button 
                    onClick={() => setQuery(q => ({...q, globalOperator: 'OR'}))}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded transition-all ${query.globalOperator === 'OR' ? 'bg-white text-trip-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >OR</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {query.groups.map((group, index) => (
                  <div key={group.id} className="relative group/group-box">
                    {index > 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-100 px-2 py-0.5 rounded text-[8px] font-black text-slate-500 uppercase">
                        {query.globalOperator}
                      </div>
                    )}
                    <div 
                      className={`relative p-4 rounded-xl border-2 transition-all ${activeGroupId === group.id ? 'border-trip-500 bg-trip-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'} cursor-pointer`}
                      onClick={() => setActiveGroupId(group.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <select 
                          value={group.operator} 
                          onChange={(e) => {
                            e.stopPropagation();
                            setQuery(q => ({...q, groups: q.groups.map(g => g.id === group.id ? {...g, operator: e.target.value as 'AND' | 'OR'} : g)}))
                          }}
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded outline-none border transition-colors ${activeGroupId === group.id ? 'bg-white border-trip-200 text-trip-700' : 'bg-slate-50 border-transparent text-slate-500'}`}
                        >
                          <option value="AND">ALL (AND)</option>
                          <option value="OR">ANY (OR)</option>
                        </select>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setQuery(q => ({...q, groups: q.groups.filter(g => g.id !== group.id)})) }}
                          disabled={query.groups.length === 1}
                          className="opacity-0 group-hover/group-box:opacity-100 transition-opacity disabled:hidden"
                        >
                          <X className="w-4 h-4 text-slate-300 hover:text-red-500"/>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                        {group.tags.map(tid => {
                          const t = tags.find(tag => tag.id === tid);
                          return (
                            <span key={tid} className="px-2 py-1 bg-white border border-slate-200 shadow-sm text-slate-700 rounded text-[10px] font-bold flex items-center gap-1.5 transition-colors">
                              {t?.name || tid}
                              <button onClick={(e) => { e.stopPropagation(); handleToggleTag(tid, group.id) }} className="hover:text-red-500 transition-colors">
                                <Plus className="w-3 h-3 rotate-45 opacity-50 hover:opacity-100" />
                              </button>
                            </span>
                          )
                        })}
                        {group.tags.length === 0 && <span className="text-[10px] text-slate-400 italic">Select tags from pool →</span>}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                     const nid = Math.random().toString();
                     setQuery(q => ({...q, groups: [...q.groups, { id: nid, operator: 'AND', tags: [] }]}));
                     setActiveGroupId(nid);
                  }}
                  className="w-full mt-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-trip-600 hover:border-trip-300 hover:bg-trip-50/50 transition-all flex items-center justify-center gap-2"
                ><Plus className="w-4 h-4" /> Add Group</button>
              </div>
            </div>
          </div>

          {/* Logic & Action Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
              <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Article matches</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black tracking-tighter ${matchingArticlesCount > 0 ? 'text-trip-600' : 'text-slate-200'}`}>
                  {matchingArticlesCount}
                </span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">items found</span>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={query.groups.filter(g => g.tags.length > 0).length === 0}
              className="w-full py-5 bg-trip-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-trip-700 disabled:opacity-20 disabled:grayscale shadow-2xl shadow-trip-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Layers className="w-5 h-5" /> Assemble Page
            </motion.button>
          </div>
        </div>

        {/* Right Column: Tag Selection Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-8 border-b border-slate-50 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tag Selection Pool</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select tags to add to the active logic group</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase border border-slate-100 shadow-inner">
                {filteredTags.length} CANDIDATES
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full group">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-trip-600 transition-colors" />
                  <input 
                     type="text"
                     placeholder="Search master or local tags..."
                     value={tagSearchQuery}
                     onChange={e => setTagSearchQuery(e.target.value)}
                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-trip-500/5 focus:border-trip-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                {(['all', 'general', 'geo'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      typeFilter === type 
                        ? 'bg-white text-trip-600 shadow-lg' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map(tag => {
                // Determine if this tag is in the currently ACTIVE group
                const isActiveGroupSelected = activeGroup?.tags.includes(tag.id) || false;
                // Determine if it is in ANY OTHER group
                const inOtherGroups = query.groups.some(g => g.id !== activeGroupId && g.tags.includes(tag.id));
                
                let borderColor = 'border-transparent';
                let bgColor = 'bg-white';
                let checkColor = 'border-slate-200';
                let icon = null;

                if (isActiveGroupSelected) {
                  borderColor = 'border-trip-600';
                  bgColor = 'bg-trip-50 shadow-lg shadow-trip-500/5';
                  checkColor = 'border-trip-600 bg-trip-600 text-white';
                  icon = <Plus className="w-4 h-4 text-white rotate-45" />;
                } else if (inOtherGroups) {
                  borderColor = 'border-slate-300';
                  bgColor = 'bg-slate-50 opacity-70';
                  checkColor = 'border-slate-300 bg-slate-200 text-slate-500';
                  icon = <div className="w-2 h-2 rounded-full bg-slate-400" />;
                }

                return (
                  <label 
                    key={tag.id} 
                    className={`flex flex-col p-5 rounded-2xl cursor-pointer transition-all border-2 group relative overflow-hidden ${bgColor} ${borderColor} hover:border-trip-300`}
                  >
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-tight rounded-bl-xl shadow-sm ${
                      tag.type === 'geo' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {tag.type}
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex flex-col max-w-[80%]">
                        <span className={`text-sm font-black uppercase tracking-tight truncate leading-tight ${isActiveGroupSelected ? 'text-trip-700' : 'text-slate-700'}`} title={tag.locales[selectedSite] || tag.name}>
                          {tag.locales[selectedSite] || tag.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 group-hover:text-trip-500 transition-colors">#{tag.id}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ml-2 shadow-sm ${checkColor}`}>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={isActiveGroupSelected}
                          onChange={() => handleToggleTag(tag.id)}
                        />
                        {icon}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{tag.type === 'geo' ? 'Geographic' : 'General'}</span>
                        <span className="text-[9px] font-black text-trip-600 bg-trip-50 px-2 py-0.5 rounded-md border border-trip-100">{tag.articleCount} arts</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 truncate mt-1">
                        {tag.name}
                      </span>
                    </div>
                  </label>
                );
              })}
              {filteredTags.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">No candidates matching search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
