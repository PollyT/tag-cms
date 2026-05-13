import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { Tag } from '../lib/store';
import { Search, Plus, Edit2, Trash2, ArrowRightLeft, Check, X, ShieldAlert, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function TagManagement() {
  const { tags, articles, updateTag, deleteTag } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [typeFilter, setTypeFilter] = useState<'all' | 'geo' | 'general'>('all');

  // Filter tags
  const filteredTags = tags.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Object.values(t.locales || {}) as string[]).some(l => 
        l && l.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const toggleSelectAll = () => {
    if (selectedTags.size === filteredTags.length) {
      setSelectedTags(new Set());
    } else {
      setSelectedTags(new Set(filteredTags.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedTags);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTags(next);
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    updateTag(id, { status: currentStatus === 'active' ? 'disabled' : 'active' });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      updateTag(editingTag.id, editingTag);
      setEditingTag(null);
    }
  };

  // Mock batch delete
  const handleBatchDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedTags.size} tags?`)) {
      selectedTags.forEach(id => deleteTag(id));
      setSelectedTags(new Set());
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search existing tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-trip-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-trip-500/20 py-2 px-3 outline-none transition-all"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="geo">Geo</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-trip-500/20 block w-full py-2 px-3 outline-none transition-all"
            >
              {LOCALES.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedTags.size > 0 && (
            <>
              <button className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50">
                Batch Replace
              </button>
              <button 
                onClick={handleBatchDelete}
                className="px-3 py-1.5 text-xs bg-white border border-red-200 rounded-lg font-medium text-red-600 hover:bg-red-50"
              >
                Delete Selected ({selectedTags.size})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-semibold w-12">
                <input type="checkbox" 
                  checked={filteredTags.length > 0 && selectedTags.size === filteredTags.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
              </th>
              <th className="px-6 py-4 font-black">Master</th>
              <th className="px-6 py-4 font-black">Tag Name</th>
              <th className="px-6 py-4 font-black">Type</th>
              <th className="px-6 py-4 font-black">Site</th>
              <th className="px-6 py-4 font-black">Articles</th>
              <th className="px-6 py-4 font-black">Status</th>
              <th className="px-6 py-4 font-black">Updated</th>
              <th className="px-6 py-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {filteredTags.map((tag) => (
              <tr key={tag.id} className="hover:bg-trip-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <input type="checkbox" 
                    checked={selectedTags.has(tag.id)}
                    onChange={() => toggleSelect(tag.id)}
                    className="rounded border-slate-300 text-trip-600 focus:ring-trip-500" 
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-slate-800 uppercase tracking-tight">{tag.name}</div>
                  <div className="text-[10px] text-trip-400 font-mono mt-0.5">{tag.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">
                    {selectedLocale === 'en' ? tag.name : (tag.locales?.[selectedLocale] || <span className="text-slate-200 italic font-normal text-xs">—</span>)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${tag.type === 'geo' ? 'bg-trip-100 text-trip-700' : 'bg-amber-50 text-amber-600'}`}>
                    {tag.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200 shadow-sm uppercase">
                    {LOCALES.find(l => l.id === selectedLocale)?.label || selectedLocale.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <Link
                    to={`/tag/${tag.id}/${selectedLocale}/articles`}
                    target="_blank"
                    className="flex items-center gap-2 text-trip-600 font-black hover:text-trip-700 transition-colors"
                  >
                    <span className="bg-trip-50 px-2 rounded-md">{articles.filter(a => a.tags.includes(tag.id)).length}</span>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleStatusToggle(tag.id, tag.status)}
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border-2 ${
                      tag.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    {tag.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-slate-400 text-[11px] font-medium">
                  {new Date(tag.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingTag(tag)} className="p-2 text-slate-400 hover:text-trip-600 hover:bg-trip-50 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTag(tag.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTags.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No tags found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog Drawer/Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[100dvh] sm:max-h-[90dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Edit Tag</h3>
              <button onClick={() => setEditingTag(null)} className="text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} className="flex flex-col min-h-0">
              <div className="p-6 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Name</label>
                  <input 
                    type="text" 
                    value={editingTag.name}
                    onChange={e => setEditingTag({...editingTag, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 outline-none transition-all" 
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Type</label>
                    <select 
                      value={editingTag.type}
                      onChange={e => setEditingTag({...editingTag, type: e.target.value as 'geo' | 'general'})}
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
                    value={editingTag.description}
                    onChange={e => setEditingTag({...editingTag, description: e.target.value})}
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
                          value={editingTag.locales?.[locale.id] || ''}
                          onChange={e => setEditingTag({
                            ...editingTag, 
                            locales: { ...(editingTag.locales || {}), [locale.id]: e.target.value } 
                          })}
                          placeholder={`e.g. Translation...`}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-trip-500/20 outline-none transition-all" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 mt-6 shadow-sm">
                  <div className="flex items-center gap-3">
                     <ShieldAlert className="w-5 h-5 text-red-600" />
                     <div className="text-[10px] font-black text-red-900 uppercase tracking-widest leading-none">Danger Zone</div>
                  </div>
                  <button type="button" onClick={() => { deleteTag(editingTag.id); setEditingTag(null); }} className="text-[10px] font-black text-red-700 bg-white border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-all shadow-sm">
                    Delete Tag
                  </button>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setEditingTag(null)} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2.5 text-sm font-black text-white bg-trip-600 hover:bg-trip-700 rounded-xl transition-all shadow-lg shadow-trip-500/20 active:scale-95">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
