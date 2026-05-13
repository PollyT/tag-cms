import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { Loader2, Plus, Sparkles, Tag as TagIcon, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag } from '../lib/store';

interface SuggestedTag {
  name: string;
  confidence: number;
  isNew: boolean;
  type: 'general' | 'geo';
  matchedTag?: Tag;
}

export default function ArticleEditor() {
  const { tags, addToAuditQueue } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Array<Tag | SuggestedTag>>([]);
  const [manualTagInput, setManualTagInput] = useState('');

  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteTags, setAutocompleteTags] = useState<Tag[]>([]);
  const [showNewTagModal, setShowNewTagModal] = useState<{ isOpen: boolean, tagName: string }>({ isOpen: false, tagName: '' });
  
  React.useEffect(() => {
    if (manualTagInput.trim()) {
      const term = manualTagInput.toLowerCase();
      setAutocompleteTags(tags.filter(t => t.name.toLowerCase().includes(term) && !selectedTags.some(st => st.name.toLowerCase() === t.name.toLowerCase())));
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, [manualTagInput, tags, selectedTags]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);

    // Simulate AI loading and response
    setTimeout(() => {
      const mockSuggestions: SuggestedTag[] = [
        { name: 'Japan', confidence: 1.0, isNew: !tags.some(t => t.name.toLowerCase() === 'japan'), type: 'geo', matchedTag: tags.find(t=>t.name.toLowerCase() === 'japan') },
        { name: 'Okinawa', confidence: 1.0, isNew: !tags.some(t => t.name.toLowerCase() === 'okinawa'), type: 'geo' },
        { name: 'Okinawa Churaumi Aquarium', confidence: 1.0, isNew: !tags.some(t => t.name.toLowerCase() === 'okinawa churaumi aquarium'), type: 'geo' },
        { name: 'Attractions', confidence: 1.0, isNew: !tags.some(t => t.name.toLowerCase() === 'attractions'), type: 'general' },
        { name: 'Family-Friendly', confidence: 1.0, isNew: !tags.some(t => t.name.toLowerCase() === 'family-friendly'), type: 'general' },
        { name: 'Tickets', confidence: 0.9, isNew: !tags.some(t => t.name.toLowerCase() === 'tickets'), type: 'general' },
        { name: 'Things to Do', confidence: 0.9, isNew: !tags.some(t => t.name.toLowerCase() === 'things to do'), type: 'general' },
        { name: 'City Transportation', confidence: 0.7, isNew: !tags.some(t => t.name.toLowerCase() === 'city transportation'), type: 'general' },
        { name: 'Nature', confidence: 0.7, isNew: !tags.some(t => t.name.toLowerCase() === 'nature'), type: 'general' }
      ];

      const filtered = mockSuggestions.filter(s => !selectedTags.some(st => st.name.toLowerCase() === s.name.toLowerCase()));
      const sorted = filtered.sort((a,b) => b.confidence - a.confidence);
      
      setSelectedTags(prev => [...prev, ...sorted]);
      
      sorted.forEach(suggestion => {
        if (suggestion.isNew && suggestion.type === 'general') {
          addToAuditQueue({
            name: suggestion.name,
            confidence: suggestion.confidence,
            type: suggestion.type,
            sourceArticle: title || 'Draft Article',
          });
        }
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t.name !== tagName));
  };

  const handleAddManualTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && manualTagInput.trim()) {
      e.preventDefault();
      const inputName = manualTagInput.trim();
      const existingTag = tags.find(t => t.name.toLowerCase() === inputName.toLowerCase());
      
      if (existingTag) {
        if (!selectedTags.find(t => t.name.toLowerCase() === inputName.toLowerCase())) {
          setSelectedTags([...selectedTags, { ...existingTag, confidence: 1, isNew: false, type: 'general', matchedTag: existingTag }]);
        }
        setManualTagInput('');
        setShowAutocomplete(false);
      } else {
        setShowNewTagModal({ isOpen: true, tagName: inputName });
      }
    }
  };

  const handleConfirmNewTag = (type: 'general' | 'geo') => {
    const tagName = showNewTagModal.tagName;
    const newSuggestion: SuggestedTag = {
      name: tagName,
      confidence: 1,
      isNew: true,
      type: type
    };
    setSelectedTags([...selectedTags, newSuggestion]);
    if (type === 'general') {
      addToAuditQueue({
        name: tagName,
        confidence: 1,
        type: type,
        sourceArticle: title || 'Draft Article',
      });
    }
    setShowNewTagModal({ isOpen: false, tagName: '' });
    setManualTagInput('');
    setShowAutocomplete(false);
  };


  return (
    <div className="flex flex-col flex-1 min-w-0 gap-6 w-full h-full">
      {/* Selected Tags (Moved to top) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 shrink-0">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-slate-500" />
          Applied Tags
        </h3>
        
        <div 
          className="relative flex flex-wrap items-center gap-2 min-h-[56px] p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-trip-500/20 focus-within:border-trip-500 transition-all cursor-text shadow-inner"
          onClick={() => document.getElementById('tag-input')?.focus()}
        >
          <AnimatePresence>
            {selectedTags.map((tag) => {
              const tagType = 'type' in tag ? tag.type : 'general';
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={tag.name}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight shadow-sm border ${
                    tagType === 'geo'
                      ? 'bg-trip-50 text-trip-700 border-trip-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}
                >
                  {tag.name}
                  {'confidence' in tag && <span className="opacity-50 text-[9px] font-mono">{(tag.confidence * 100).toFixed(0)}%</span>}
                  {tagType === 'geo' && <MapPin className="w-3 h-3 ml-0.5 opacity-50" />}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag.name);
                    }}
                    className="hover:bg-black/5 rounded-full p-0.5 ml-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <input 
            id="tag-input"
            type="text" 
            value={manualTagInput}
            onChange={(e) => setManualTagInput(e.target.value)}
            onKeyDown={handleAddManualTag}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            placeholder={selectedTags.length === 0 ? "Add tag and press Enter..." : ""}
            className="flex-1 min-w-[140px] bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-700 py-1 px-1"
          />

          <AnimatePresence>
            {showAutocomplete && autocompleteTags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 max-h-56 overflow-y-auto custom-scrollbar p-1"
              >
                {autocompleteTags.map(t => (
                  <div 
                    key={t.id} 
                    className="px-4 py-2.5 hover:bg-trip-50 cursor-pointer text-sm font-bold text-slate-700 rounded-lg transition-colors flex items-center justify-between group"
                    onClick={() => {
                       setSelectedTags([...selectedTags, { ...t, confidence: 1, isNew: false, type: 'general', matchedTag: t }]);
                       setManualTagInput('');
                       setShowAutocomplete(false);
                    }}
                  >
                    <span>{t.name}</span>
                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-trip-600" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auto-suggest powered by AI</p>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2 bg-trip-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-trip-700 transition-all shadow-lg shadow-trip-500/20 disabled:opacity-50 active:scale-95"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isAnalyzing ? 'Analyzing...' : 'Smart Tagging'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {/* Editor Main Content */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col p-6 overflow-hidden">
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Article Draft</h2>
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-2xl outline-none focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 transition-all px-4 py-3 font-black text-slate-800 placeholder-slate-300"
            />
          </div>
          <div className="flex-1 flex flex-col min-h-0 relative">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your masterpiece..."
              className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-trip-500/20 focus:border-trip-500 transition-all px-6 py-6 text-slate-700 placeholder-slate-300 resize-none font-serif leading-relaxed"
            />
          </div>
          
        </div>
      </section>
      </div>
      <AnimatePresence>
        {showNewTagModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tag Not Found</h3>
                 <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                    The tag <strong className="text-trip-600">'{showNewTagModal.tagName}'</strong> doesn't exist yet. Would you like to suggest it for approval?
                 </p>
              </div>
              <div className="p-6 flex flex-col gap-3">
                 <button 
                    onClick={() => handleConfirmNewTag('general')}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                 >
                    Request General Tag
                 </button>
                 <button 
                    onClick={() => handleConfirmNewTag('geo')}
                    className="w-full py-3 bg-trip-600 hover:bg-trip-700 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-trip-500/20 active:scale-95"
                 >
                    Request Geo Tag
                 </button>
                 <button 
                    onClick={() => setShowNewTagModal({ isOpen: false, tagName: '' })}
                    className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-xl text-sm font-bold transition-all mt-2"
                 >
                    Cancel
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
