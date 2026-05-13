import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { LOCALES } from '../App';
import { Search, Filter, Globe, Trash2, CheckCircle, XCircle, Layout, LayoutGrid, List, Eye, ExternalLink, X, Activity, Play, Check, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TagPage } from '../lib/store';

export default function TagPageList() {
  const { tags, tagPages, toggleTagPageStatus, deleteTagPage } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [minArticleCount, setMinArticleCount] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const handleSimulateRender = (id: string) => {
    toggleTagPageStatus(id, { status: 'rendering' });
    setTimeout(() => {
      toggleTagPageStatus(id, { status: 'published' });
    }, 3000);
  };

  const handlePublish = (id: string) => {
    toggleTagPageStatus(id, { status: 'published' });
  };

  const handleOpenPreview = (id: string) => {
    window.open(`/tag-page/${id}`, '_blank');
  };

  const getStatusConfig = (status: TagPage['status']) => {
    switch (status) {
      case 'published':
        return { label: 'Live', color: 'emerald', icon: CheckCircle };
      case 'unpublished':
        return { label: 'Internal', color: 'slate', icon: XCircle };
      case 'rendering':
        return { label: 'Building', color: 'trip', icon: Loader2, animate: true };
      case 'pending':
        return { label: 'Draft', color: 'amber', icon: Clock };
      default:
        return { label: status, color: 'slate', icon: Activity };
    }
  };

  const filteredTagPages = useMemo(() => {
    return tagPages.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCount = minArticleCount === '' || p.articleCount >= minArticleCount;
      return matchesSearch && matchesCount;
    });
  }, [tagPages, searchQuery, minArticleCount]);

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0 bg-slate-50/50">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-trip-50 text-trip-600 rounded-2xl border border-trip-100 shadow-inner">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tag Pages</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Cross-referenced landing pages</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none w-64 transition-all"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-trip-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-trip-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Page Entity / Tags</th>
                  <th className="px-8 py-5">Site</th>
                  <th className="px-8 py-5 text-center">Articles</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredTagPages.map(page => {
                    const pageLocale = LOCALES.find(l => l.id === page.site);
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={page.id} 
                        className="hover:bg-trip-50/20 transition-all group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-base font-black text-slate-800 uppercase tracking-tight group-hover:text-trip-600 transition-colors">
                              {page.name}
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {page.tags.map(tid => {
                                const tag = tags.find(t => t.id === tid);
                                return (
                                  <span key={tid} className="px-2 py-0.5 bg-white text-slate-400 rounded-md text-[9px] font-black uppercase border border-slate-100 shadow-sm">
                                    #{tag?.name || tid}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100">
                            <Globe className="w-3 h-3 text-trip-600" /> {pageLocale?.label || page.site}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[2.5rem] h-8 rounded-xl text-xs font-black shadow-sm border ${
                            page.articleCount > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            page.articleCount > 0 ? 'bg-trip-50 text-trip-600 border-trip-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                          }`}>
                            {page.articleCount}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {(() => {
                            const config = getStatusConfig(page.status);
                            const Icon = config.icon;
                            const isTrip = config.color === 'trip';
                            return (
                              <div 
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 ${
                                  isTrip ? 'bg-trip-50 text-trip-600 border-trip-100' : 
                                  config.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  config.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-slate-50 text-slate-400 border-slate-100'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
                                {config.label}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {(page.status === 'pending' || page.status === 'unpublished') && (
                              <button 
                                onClick={() => page.status === 'pending' ? handleSimulateRender(page.id) : handlePublish(page.id)}
                                className="px-6 py-2.5 bg-trip-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-trip-700 transition-all flex items-center gap-2 shadow-lg shadow-trip-500/20 active:scale-95"
                              >
                                {page.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                {page.status === 'pending' ? 'Build' : 'Go Live'}
                              </button>
                            )}
                            <button 
                              onClick={() => handleOpenPreview(page.id)}
                              className="p-2.5 text-slate-300 hover:text-trip-600 hover:bg-trip-50 rounded-xl transition-all"
                              title="Preview"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteTagPage(page.id)}
                              className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filteredTagPages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-5 bg-slate-50 rounded-full text-slate-200">
                          <Layout className="w-12 h-12" />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No matches found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <AnimatePresence mode="popLayout">
            {filteredTagPages.map(page => (
              <motion.div 
                layout
                key={page.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-5 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight group-hover:text-trip-600 transition-colors leading-tight">{page.name}</h4>
                    <span className="text-[9px] text-slate-300 font-mono mt-1.5 block tracking-tighter uppercase opacity-0 group-hover:opacity-100 transition-opacity">UID: {page.id}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {page.tags.map(tid => (
                    <span key={tid} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] font-black text-slate-400 uppercase">
                      #{tags.find(t => t.id === tid)?.name || tid}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  {(() => {
                    const config = getStatusConfig(page.status);
                    const isTrip = config.color === 'trip';
                    return (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                        isTrip ? 'bg-trip-50 text-trip-600' : 
                        config.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                        config.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-400'
                      }`}>
                        {config.label}
                      </div>
                    );
                  })()}
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenPreview(page.id)} className="p-2 text-slate-300 hover:text-trip-600 hover:bg-trip-50 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => deleteTagPage(page.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
}
