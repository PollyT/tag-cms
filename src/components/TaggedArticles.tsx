import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { FileText, MapPin, Tag as TagIcon, Globe, Search, Filter, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOCALES } from '../App';

function FilterDropdown({ 
  label, 
  icon: Icon, 
  options, 
  selected, 
  toggleOption 
}: { 
  label: string; 
  icon: React.ElementType; 
  options: { id: string; name: string }[]; 
  selected: Set<string>; 
  toggleOption: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all min-w-[160px] justify-between shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <span>{label} {selected.size > 0 && <span className="ml-1 px-1.5 py-0.5 bg-trip-100 text-trip-700 rounded-md text-[10px]">{selected.size}</span>}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full left-0 mt-2 w-64 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-20 custom-scrollbar p-2 flex flex-col gap-1"
            >
              {options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className="flex items-center gap-3 px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {selected.has(opt.id) ? (
                    <CheckSquare className="w-4 h-4 text-trip-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className="truncate">{opt.name}</span>
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">No options available</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TaggedArticles() {
  const { articles, tags } = useApp();
  
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [selectedCitiesTags, setSelectedCitiesTags] = useState<Set<string>>(new Set());
  const [selectedCountryRegionTags, setSelectedCountryRegionTags] = useState<Set<string>>(new Set());
  const [selectedPOIsTags, setSelectedPOIsTags] = useState<Set<string>>(new Set());
  const [selectedGeneralTags, setSelectedGeneralTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const citiesTags = useMemo(() => tags.filter(t => t.type === 'geo' && t.category === 'cities').sort((a, b) => a.name.localeCompare(b.name)), [tags]);
  const countryRegionTags = useMemo(() => tags.filter(t => t.type === 'geo' && t.category === 'country_region').sort((a, b) => a.name.localeCompare(b.name)), [tags]);
  const poisTags = useMemo(() => tags.filter(t => t.type === 'geo' && t.category === 'pois').sort((a, b) => a.name.localeCompare(b.name)), [tags]);
  const generalTags = useMemo(() => tags.filter(t => t.type === 'general' || (t.type === 'geo' && !t.category)).sort((a, b) => a.name.localeCompare(b.name)), [tags]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Filter by Site
      if (selectedSites.size > 0 && !selectedSites.has(article.site)) return false;

      // Filter by Tags (AND across all)
      const selectedTags = new Set([
        ...selectedCitiesTags, 
        ...selectedCountryRegionTags, 
        ...selectedPOIsTags, 
        ...selectedGeneralTags
      ]);
      if (selectedTags.size > 0) {
        const hasAllSelectedTags = Array.from(selectedTags).every(tId => article.tags.includes(tId));
      if (!hasAllSelectedTags) return false;
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!article.title.toLowerCase().includes(query) && !article.content.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [articles, selectedSites, selectedCitiesTags, selectedCountryRegionTags, selectedPOIsTags, selectedGeneralTags, searchQuery]);

  const toggleSet = (set: Set<string>, value: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
            <FileText className="w-5 h-5 text-trip-600" />
            Tagged Articles
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 transition-all w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <FilterDropdown
            label="Sites"
            icon={Globe}
            options={LOCALES.map(loc => ({ id: loc.id, name: loc.label }))}
            selected={selectedSites}
            toggleOption={(val) => toggleSet(selectedSites, val, setSelectedSites)}
          />
          <FilterDropdown
            label="Cities"
            icon={MapPin}
            options={citiesTags.map(t => ({ id: t.id, name: t.name }))}
            selected={selectedCitiesTags}
            toggleOption={(val) => toggleSet(selectedCitiesTags, val, setSelectedCitiesTags)}
          />
          <FilterDropdown
            label="Country / Region"
            icon={MapPin}
            options={countryRegionTags.map(t => ({ id: t.id, name: t.name }))}
            selected={selectedCountryRegionTags}
            toggleOption={(val) => toggleSet(selectedCountryRegionTags, val, setSelectedCountryRegionTags)}
          />
          <FilterDropdown
            label="POIs"
            icon={MapPin}
            options={poisTags.map(t => ({ id: t.id, name: t.name }))}
            selected={selectedPOIsTags}
            toggleOption={(val) => toggleSet(selectedPOIsTags, val, setSelectedPOIsTags)}
          />
          <FilterDropdown
            label="General Tags"
            icon={TagIcon}
            options={generalTags.map(t => ({ id: t.id, name: t.name }))}
            selected={selectedGeneralTags}
            toggleOption={(val) => toggleSet(selectedGeneralTags, val, setSelectedGeneralTags)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
          {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'} Found
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-4 w-32">Article ID</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4 w-32">Site</th>
                <th className="px-5 py-4">Tags</th>
                <th className="px-5 py-4 w-24 text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredArticles.map(article => (
                  <motion.tr 
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">{article.id}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{article.title}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-bold tracking-wider">
                        {LOCALES.find(loc => loc.id === article.site)?.label || article.site}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {article.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {article.tags.map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <span 
                                key={tagId} 
                                className={`px-2 py-0.5 border rounded-md text-[9px] font-black uppercase tracking-wider ${
                                  tag.type === 'geo' 
                                    ? 'bg-trip-50 border-trip-100 text-trip-600' 
                                    : 'bg-amber-50 border-amber-100 text-amber-600'
                                }`}
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No tags</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex p-2 bg-slate-100 text-slate-500 hover:text-trip-600 hover:bg-trip-50 rounded-lg transition-colors"
                        title="Open article"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center text-slate-400">
                    <Filter className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                    <p className="font-medium">No articles found matching all selected criteria.</p>
                    <button 
                      onClick={() => {
                        setSelectedSites(new Set());
                        setSelectedGeoTags(new Set());
                        setSelectedGeneralTags(new Set());
                        setSearchQuery('');
                      }}
                      className="mt-4 text-trip-600 text-sm font-bold hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
