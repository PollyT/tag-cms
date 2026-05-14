import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { LOCALES } from '../App';
import { ArrowLeft, Tag as TagIcon, Trash2, Plus, MoveRight, ExternalLink, X } from 'lucide-react';

export default function TagArticlesView() {
  const { tagId, locale } = useParams();
  const { tags, articles, bulkRemoveTagFromArticles, bulkApplyTagToArticles, addArticlesWithTag } = useApp();
  
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [targetApplyTagId, setTargetApplyTagId] = useState<string>('');
  const [isAddArticlesModalOpen, setIsAddArticlesModalOpen] = useState(false);
  const [articleIdsInput, setArticleIdsInput] = useState('');

  const currentTag = tags.find(t => t.id === tagId);
  const currentLocale = LOCALES.find(l => l.id === locale) || LOCALES[0];
  
  if (!currentTag) {
    return <div className="p-8 text-slate-500">Tag not found.</div>;
  }

  const tagName = locale === 'en' ? currentTag.name : currentTag.locales[locale as string] || currentTag.name;

  // Find articles that HAVE this tag
  const tagArticles = articles.filter(a => a.tags.includes(currentTag.id));

  const toggleSelectAll = () => {
    if (selectedArticles.size === tagArticles.length && tagArticles.length > 0) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(tagArticles.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedArticles);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelectedArticles(next);
  };

  const handleBulkRemove = () => {
    if (selectedArticles.size === 0) return;
    if (confirm(`Remove the tag "${tagName}" from ${selectedArticles.size} articles?`)) {
      bulkRemoveTagFromArticles(Array.from(selectedArticles), currentTag.id);
      setSelectedArticles(new Set());
    }
  };

  const handleBulkApply = () => {
    if (selectedArticles.size === 0 || !targetApplyTagId) return;
    const targetTag = tags.find(t => t.id === targetApplyTagId);
    if (!targetTag) return;
    if (confirm(`Apply the tag "${targetTag.name}" to ${selectedArticles.size} articles?`)) {
      bulkApplyTagToArticles(Array.from(selectedArticles), targetTag.id);
      setSelectedArticles(new Set());
      setTargetApplyTagId('');
    }
  };

  const handleAddArticles = () => {
    const articleIds = articleIdsInput.split('\n').map(u => u.trim()).filter(Boolean);
    if (articleIds.length > 0) {
      addArticlesWithTag(articleIds, currentTag.id);
    }
    setIsAddArticlesModalOpen(false);
    setArticleIdsInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Articles for Tag: <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">{tagName}</span>
          </h2>
          <span className="text-sm text-slate-500">({currentLocale.label})</span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 shrink-0 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-600">
            {selectedArticles.size} articles selected
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <select 
                value={targetApplyTagId}
                onChange={e => setTargetApplyTagId(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg py-1.5 px-3 w-48 outline-none focus:border-blue-500"
              >
                <option value="">Select tag to apply...</option>
                {tags.filter(t => t.id !== currentTag.id).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button 
                onClick={handleBulkApply}
                disabled={selectedArticles.size === 0 || !targetApplyTagId}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                <Plus className="w-4 h-4" /> Apply Tag
              </button>
            </div>
            
            <button 
              onClick={handleBulkRemove}
              disabled={selectedArticles.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remove "{tagName}"
            </button>

            <div className="w-px h-6 bg-slate-200 mx-2" />

            <button 
              onClick={() => setIsAddArticlesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add new articles
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider sticky top-0 z-10 shadow-sm shadow-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold w-12 text-center select-none">
                  <input type="checkbox" 
                    checked={tagArticles.length > 0 && selectedArticles.size === tagArticles.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                </th>
                <th className="px-6 py-3 font-semibold">Site</th>
                <th className="px-6 py-3 font-semibold">Article ID</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
                <th className="px-6 py-3 font-semibold">Article Title</th>
                <th className="px-6 py-3 font-semibold">URL</th>
                <th className="px-6 py-3 font-semibold">Keyword</th>
                <th className="px-6 py-3 font-semibold">All Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tagArticles.map((article) => {
                const articleTags = article.tags.map(tid => tags.find(t => t.id === tid)).filter(Boolean);
                
                return (
                  <tr key={article.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <input type="checkbox" 
                        checked={selectedArticles.has(article.id)}
                        onChange={() => toggleSelect(article.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-700">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {currentLocale.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-mono text-slate-500">
                      {article.id}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 shadow-sm"
                        title="Open Article"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-6 py-3 text-slate-800 font-medium max-w-[240px] truncate" title={article.title}>
                      {article.title}
                    </td>
                    <td className="px-6 py-3 text-slate-500 max-w-[150px] truncate">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        {article.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs font-medium border border-slate-200">
                        {article.keyword}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                        {articleTags.map(t => (
                          <span key={t!.id} className={`px-2 py-0.5 rounded border text-[11px] font-medium ${t!.id === currentTag.id ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                            {locale === 'en' ? t!.name : t!.locales[locale as string] || t!.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tagArticles.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No articles found for this tag.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Articles Modal */}
      {isAddArticlesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-gray-900">
                Add new articles
              </h3>
              <button onClick={() => setIsAddArticlesModalOpen(false)} className="text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Article IDs (one per line)</label>
                <textarea 
                  value={articleIdsInput}
                  onChange={e => setArticleIdsInput(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-600 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="article_123&#10;article_456"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsAddArticlesModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddArticles}
                  disabled={!articleIdsInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
