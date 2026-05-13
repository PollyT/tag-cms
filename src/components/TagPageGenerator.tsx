import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { LOCALES } from '../App';
import { Layers, Search, Globe, Plus, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function TagPageGenerator() {
  const { tags, articles, generateTagPage } = useApp();
  
  const [selectedSite, setSelectedSite] = useState(LOCALES[0].id);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'geo' | 'general'>('all');

  const matchingArticlesCount = useMemo(() => {
    if (selectedTagIds.length === 0) return 0;
    return articles.filter(article => 
      selectedTagIds.every(tid => article.tags.includes(tid))
    ).length;
  }, [selectedTagIds, articles]);

  const filteredTags = useMemo(() => {
    return tags.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
        Object.values(t.locales).some(loc => loc.toLowerCase().includes(tagSearchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesSearch && matchesType;
    }).slice(0, 100);
  }, [tags, tagSearchQuery, typeFilter]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleGenerate = () => {
    if (selectedTagIds.length === 0) return;
    generateTagPage(selectedSite, selectedTagIds);
    setSelectedTagIds([]);
    // Optionally redirect or show success
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
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intersection</label>
                <button 
                  onClick={() => setSelectedTagIds([])}
                  className="text-[10px] font-black text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors uppercase"
                >
                  Reset
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {selectedTagIds.map(tid => {
                  const tag = tags.find(t => t.id === tid);
                  return (
                    <button
                      key={tid}
                      onClick={() => handleToggleTag(tid)}
                      className="px-3 py-1.5 bg-trip-50 text-trip-700 rounded-lg text-[10px] font-black border border-trip-100 flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                    >
                      {tag?.name || tid}
                      <Plus className="w-3 h-3 rotate-45 opacity-50" />
                    </button>
                  );
                })}
                {selectedTagIds.length === 0 && (
                  <span className="text-[11px] text-slate-300 font-bold italic uppercase tracking-widest px-1">Choose tags to intersect →</span>
                )}
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

            <div className="bg-trip-50 rounded-xl p-4 border border-trip-100 text-[10px] font-black text-trip-700 flex gap-4 leading-relaxed uppercase tracking-widest">
              <Info className="w-6 h-6 shrink-0 text-trip-500" />
              <div>
                Exclusive AND relationship.
                Matches must have {selectedTagIds.length} tags.
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={selectedTagIds.length === 0}
              className="w-full py-5 bg-trip-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-trip-700 disabled:opacity-20 disabled:grayscale shadow-2xl shadow-trip-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Assemble Page
            </motion.button>
          </div>
        </div>

        {/* Right Column: Tag Selection Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-8 border-b border-slate-50 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tag Selection Pool</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select tags to refine the intersection</p>
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
              {filteredTags.map(tag => (
                <label 
                  key={tag.id} 
                  className={`flex flex-col p-5 rounded-2xl cursor-pointer transition-all border-2 group relative overflow-hidden ${
                    selectedTagIds.includes(tag.id) 
                      ? 'bg-trip-50 border-trip-600 text-trip-700 shadow-lg shadow-trip-500/5' 
                      : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-tight rounded-bl-xl shadow-sm ${
                    tag.type === 'geo' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {tag.type}
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex flex-col max-w-[80%]">
                      <span className="text-sm font-black uppercase tracking-tight truncate leading-tight" title={tag.locales[selectedSite] || tag.name}>
                        {tag.locales[selectedSite] || tag.name}
                      </span>
                      <span className="text-[10px] text-slate-300 font-mono mt-1 group-hover:text-trip-400 transition-colors">#{tag.id}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ml-2 shadow-sm ${
                      selectedTagIds.includes(tag.id) 
                        ? 'bg-trip-600 border-trip-600' 
                        : 'border-slate-200 bg-white group-hover:border-trip-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => handleToggleTag(tag.id)}
                      />
                      {selectedTagIds.includes(tag.id) && <Plus className="w-4 h-4 text-white rotate-45" />}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100/50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{tag.type === 'geo' ? 'Geographic' : 'General'}</span>
                      <span className="text-[9px] font-black text-trip-600 bg-trip-50 px-2 py-0.5 rounded-md border border-trip-100">{tag.articleCount} arts</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 truncate opacity-70">
                      {tag.name}
                    </span>
                  </div>
                </label>
              ))}
              {filteredTags.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300">
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
