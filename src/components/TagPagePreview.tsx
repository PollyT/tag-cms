import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { LOCALES } from '../App';
import { Globe, ArrowLeft, ArrowUpRight, Clock, User, Printer, CheckCircle, XCircle, Activity, Play, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function TagPagePreview() {
  const { id } = useParams<{ id: string }>();
  const { tagPages, articles, tags } = useApp();

  const page = useMemo(() => tagPages.find(p => p.id === id), [tagPages, id]);
  
  const matchingArticles = useMemo(() => {
    if (!page) return [];
    return articles.filter(a => 
      page.tags.every(tid => a.tags.includes(tid))
    );
  }, [page, articles]);

  const pageLocale = useMemo(() => LOCALES.find(l => l.id === page?.site), [page]);

  const { toggleTagPageStatus } = useApp();

  const handlePublish = () => {
    if (!page) return;
    toggleTagPageStatus(page.id, { status: 'published' });
  };

  const handleUnpublish = () => {
    if (!page) return;
    toggleTagPageStatus(page.id, { status: 'unpublished' });
  };

  const handleStartRender = () => {
    if (!page) return;
    toggleTagPageStatus(page.id, { status: 'rendering' });
    setTimeout(() => {
      toggleTagPageStatus(page.id, { status: 'published' });
    }, 3000);
  };

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
          <p className="text-slate-500 mb-6">The tag page you are looking for does not exist or has been deleted.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-indigo-200">
            <ArrowLeft className="w-5 h-5" /> Back to CMS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 border-t-8 border-indigo-600">
      {/* CMS Badge */}
      <div className="fixed top-4 left-4 z-50 pointer-events-none">
        <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 shadow-xl backdrop-blur-sm opacity-80 rotate-[-5deg]">
          Preview Mode
        </div>
      </div>

      {/* Navigation Simulation */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight italic">TravelNexus</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <span className="text-indigo-600">Destinations</span>
            <span>Hotels</span>
            <span>Flights</span>
            <span>Trips</span>
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400">
              {pageLocale?.label || page.site}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center gap-2">
            {page.tags.map(tid => {
              const tag = tags.find(t => t.id === tid);
              return (
                <span key={tid} className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider">
                  #{tag?.name || tid}
                </span>
              );
            })}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            The Essential Guide to {page.name}
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Discover the best hand-picked selections for your next big adventure. Expert insights, local tips, and curated itineraries.
          </p>
          <div className="flex items-center justify-center gap-6 pt-4 text-slate-400">
             <div className="flex items-center gap-2">
               <Clock className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">Updated Today</span>
             </div>
             <div className="flex items-center gap-2">
               <User className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">TravelNexus Editorial</span>
             </div>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <main className="max-w-6xl mx-auto py-20 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Latest from {page.name}
          </h2>
          <div className="flex gap-2">
            <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"><Printer className="w-5 h-5 text-slate-500" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {matchingArticles.map((article, i) => (
            <article key={article.id} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-slate-100 rounded-3xl mb-6 overflow-hidden relative">
                <img 
                  src={`https://picsum.photos/seed/${article.id}/600/800`} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                    Top Choice
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  <span>{article.site}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-slate-400 italic">5 min read</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-slate-500 line-clamp-3 text-sm font-medium leading-relaxed">
                  Exploring the hidden gems and local secrets in the heart of {page.name}. Experience travel like never before with our deep-dive guide.
                </p>
                <div className="pt-2 flex items-center gap-2 text-indigo-600 group-hover:gap-4 transition-all">
                  <span className="text-xs font-black uppercase tracking-widest">Read Article</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </article>
          ))}
          {matchingArticles.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Contents Yet</h3>
              <p className="text-slate-500 max-w-sm">We are currently curating the best stories for this collection. Please check back soon.</p>
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-900 py-20 px-6 text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight italic">TravelNexus</span>
          </div>
          <p className="text-slate-500 text-sm font-bold">
            © 2026 NexusCore Publishing Engine. Curated with AI Precision.
          </p>
        </div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </footer>

      {/* Floating CMS Control Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/50 p-2 flex items-center gap-4 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-700/50">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Settings className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Status</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  page.status === 'published' ? 'bg-emerald-500' : 
                  page.status === 'rendering' ? 'bg-blue-500 animate-pulse' : 
                  page.status === 'pending' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />
                <span className="text-xs font-bold uppercase tracking-tight">{page.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-2">
            {page.status === 'pending' && (
              <button 
                onClick={handleStartRender}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4" /> Publish Now
              </button>
            )}
            {page.status === 'unpublished' && (
              <button 
                onClick={handlePublish}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> Publish
              </button>
            )}
            {page.status === 'published' && (
              <button 
                onClick={handleUnpublish}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <XCircle className="w-4 h-4" /> Unpublish
              </button>
            )}
            <Link 
              to="/" 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to CMS
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
