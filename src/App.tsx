import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './lib/AppContext';
import { PenTool, Tags, ShieldAlert, FileText, ChevronRight, Activity, X, Globe, Layers, Layout } from 'lucide-react';
import ArticleEditor from './components/ArticleEditor';
import TagManagement from './components/TagManagement';
import AuditQueue from './components/AuditQueue';
import TagArticlesView from './components/TagArticlesView';

import TagPageList from './components/TagPageList';
import TagPageGenerator from './components/TagPageGenerator';
import TagPagePreview from './components/TagPagePreview';

export const LOCALES = [
  { id: 'en', label: 'EN' },
  { id: 'tw', label: 'TW' },
  { id: 'hk', label: 'HK' },
  { id: 'jp', label: 'JP' },
  { id: 'kr', label: 'KR' },
  { id: 'th', label: 'TH' },
  { id: 'ru', label: 'RU' },
  { id: 'my', label: 'MY' },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<'editor' | 'management' | 'audit' | 'tag_pages' | 'generate_tag_pages'>('management');
  const [isManualTagModalOpen, setIsManualTagModalOpen] = useState(false);
  const [manualTagForm, setManualTagForm] = useState<{
    name: string;
    type: 'geo' | 'general';
    description: string;
    locales: Record<string, string>;
  }>({ name: '', type: 'general', description: '', locales: {} });
  const { auditQueue, addToAuditQueue, tagPages } = useApp();
  const pendingCount = auditQueue.filter(t => t.status === 'pending').length;

  const handleManualTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTagForm.name.trim()) return;
    
    addToAuditQueue({
      name: manualTagForm.name.trim(),
      type: manualTagForm.type,
      description: manualTagForm.description.trim(),
      locales: manualTagForm.locales,
      sourceArticle: 'Manual Submission',
      confidence: 100
    });
    
    setIsManualTagModalOpen(false);
    setManualTagForm({ name: '', type: 'general', description: '', locales: {} });
  };

  return (
    <div className="h-screen w-full flex bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0F172A] text-slate-400 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white font-black text-xl mb-8 tracking-tighter">
            <Tags className="w-8 h-8 text-trip-600" />
            <span>TagCMS</span>
          </div>
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'editor' ? 'bg-trip-600 text-white shadow-lg shadow-trip-900/30' : 'hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-tight">Article Editor</span>
            </button>
            <button 
              onClick={() => setActiveTab('management')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'management' ? 'bg-trip-600 text-white shadow-lg shadow-trip-900/30' : 'hover:bg-slate-800'
              }`}
            >
              <Tags className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-tight">Tag Management</span>
            </button>
            <div className="pt-6 pb-2 text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 px-3">Publishing</div>
            <button 
              onClick={() => setActiveTab('tag_pages')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'tag_pages' ? 'bg-trip-600 text-white shadow-lg shadow-trip-900/30' : 'hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-tight">Tag Pages</span>
              </div>
              {tagPages.length > 0 && (
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'tag_pages' ? 'bg-white text-trip-600' : 'bg-slate-700 text-slate-300'
                }`}>
                  {tagPages.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('generate_tag_pages')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'generate_tag_pages' ? 'bg-trip-600 text-white shadow-lg shadow-trip-900/30' : 'hover:bg-slate-800'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-tight">Page Generator</span>
            </button>
            <div className="pt-6 pb-2 text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 px-3">Quality</div>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'audit' ? 'bg-trip-600 text-white shadow-lg shadow-trip-900/30' : 'hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-tight">Audit Queue</span>
              </div>
              {pendingCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'audit' ? 'bg-white text-trip-600' : 'bg-accent text-white shadow-sm'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">Engine Status</div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span>AI Suggester Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {activeTab === 'editor' && 'Article Editor'}
              {activeTab === 'management' && 'Tag Management Console'}
              {activeTab === 'audit' && 'Tag Audit Queue'}
              {activeTab === 'tag_pages' && 'Tag Page Dashboard'}
              {activeTab === 'generate_tag_pages' && 'Build New Tag Page'}
            </h2>
            <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter">v2.5.0-DEV</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (activeTab === 'management') {
                  setIsManualTagModalOpen(true);
                }
              }}
              className="px-5 py-2.5 bg-trip-600 text-white rounded-xl text-sm font-bold hover:bg-trip-700 transition-all shadow-lg shadow-trip-500/20 active:scale-95"
            >
              {activeTab === 'editor' && '+ New Article'}
              {activeTab === 'management' && '+ Manual Tag'}
              {activeTab === 'audit' && 'Force Sync'}
              {activeTab === 'tag_pages' && 'Export List'}
              {activeTab === 'generate_tag_pages' && 'View All Pages'}
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </header>

        {/* Page Layout */}
        <div className="flex-1 flex p-6 gap-6 overflow-hidden">
          {activeTab === 'editor' && <ArticleEditor />}
          {activeTab === 'management' && <TagManagement />}
          {activeTab === 'audit' && <AuditQueue />}
          {activeTab === 'tag_pages' && <TagPageList />}
          {activeTab === 'generate_tag_pages' && <TagPageGenerator />}
        </div>
      </main>

      {/* Manual Tag Modal */}
      {isManualTagModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[100dvh] sm:max-h-[90dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Add Manual Tag</h3>
              <button onClick={() => setIsManualTagModalOpen(false)} className="text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleManualTagSubmit} className="flex flex-col min-h-0">
              <div className="p-6 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Name</label>
                  <input 
                    type="text" 
                    value={manualTagForm.name}
                    onChange={e => setManualTagForm({...manualTagForm, name: e.target.value})}
                    placeholder="e.g. Kyoto Temples"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Type</label>
                    <select 
                      value={manualTagForm.type}
                      onChange={e => setManualTagForm({...manualTagForm, type: e.target.value as 'geo' | 'general'})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none transition-all"
                    >
                      <option value="general">General</option>
                      <option value="geo">Geo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Description</label>
                  <textarea 
                    rows={3}
                    value={manualTagForm.description}
                    onChange={e => setManualTagForm({...manualTagForm, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none transition-all" 
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 mt-4">
                  <h4 className="text-xs font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide"><Globe className="w-4 h-4 text-trip-600" /> Localizations</h4>
                  <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {LOCALES.filter(l => l.id !== 'en').map(locale => (
                      <div key={locale.id} className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 mb-1 uppercase">{locale.label}</label>
                        <input 
                          type="text" 
                          value={manualTagForm.locales?.[locale.id] || ''}
                          onChange={e => setManualTagForm({
                            ...manualTagForm, 
                            locales: { ...(manualTagForm.locales || {}), [locale.id]: e.target.value } 
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-trip-500/20 outline-none transition-all" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsManualTagModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={!manualTagForm.name.trim()} className="px-8 py-2.5 text-sm font-black text-white bg-trip-600 hover:bg-trip-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-trip-500/20 active:scale-95">
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/tag/:tagId/:locale/articles" element={<TagArticlesView />} />
          <Route path="/tag-page/:id" element={<TagPagePreview />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

