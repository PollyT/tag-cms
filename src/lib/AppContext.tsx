import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tag, AuditTag, Article, TagPage, TagPageQuery, evaluateQuery, INITIAL_TAGS, INITIAL_AUDIT_QUEUE } from './store';

interface AppContextType {
  tags: Tag[];
  auditQueue: AuditTag[];
  articles: Article[];
  tagPages: TagPage[];
  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'articleCount'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  addToAuditQueue: (tag: Omit<AuditTag, 'id' | 'createdAt' | 'status'>) => void;
  updateAuditTag: (id: string, updates: Partial<AuditTag>) => void;
  approveAuditTag: (id: string) => void;
  rejectAuditTag: (id: string) => void;
  saveArticle: (article: Article) => void;
  bulkRemoveTagFromArticles: (articleIds: string[], tagId: string) => void;
  bulkApplyTagToArticles: (articleIds: string[], tagId: string) => void;
  addArticlesWithTag: (articleIds: string[], tagId: string) => void;
  generateTagPage: (site: string, params: { tagIds?: string[]; query?: TagPageQuery; name?: string }) => void;
  toggleTagPageStatus: (id: string, updates: { status: TagPage['status'] }) => void;
  deleteTagPage: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate some mock articles for the tags so they show up
const generateMockArticles = (tags: Tag[]): Article[] => {
  const generated: Article[] = [];
  const sites = ['travel-guide.com', 'world-explorer.net', 'discover-now.org'];
  
  const demoTagNames = [
    'China', 'Shenzhen', 'Hong Kong', 'MixC World Shenzhen Bay', 
    'Skyworthland CINITY Cinema', 'CGV Cinema Futian', 'KK MALL', 
    'Huanle Coast', 'Entertainment', 'Tickets', 'Cross-border', 
    'Things to Do', 'Day Trip', 'Tokyo', 'Theme Parks'
  ];
  
  const demoTags = tags.filter(t => demoTagNames.includes(t.name));
  const tokyoTag = tags.find(t => t.name === 'Tokyo');
  const themeParkTag = tags.find(t => t.name === 'Theme Parks');

  if (tokyoTag && themeParkTag) {
    for (let i = 0; i < 8; i++) {
      generated.push({
         id: `tokyo_disney_${i}`,
         title: i % 2 === 0 ? `Ultimate Guide to Tokyo Disneyland & Sea ${i}` : `Where to Find the Best Snacks in Tokyo Disney Resort ${i}`,
         content: 'Detailed guide about Tokyo theme parks...',
         site: sites[i % sites.length],
         url: i % 2 === 0 ? `https://${sites[i % sites.length]}/japan/tokyo-disney-guide-${i}` : `https://${sites[i % sites.length]}/japan/tokyo-disney-food-${i}`,
         keyword: `Tokyo Disneyland guide`,
         tags: [tokyoTag.id, themeParkTag.id]
      });
    }
  }

  const demoTagIds = demoTags.map(t => t.id);

  if (demoTags.length > 0) {
    for (let i = 0; i < 5; i++) {
      generated.push({
         id: `demo_article_${i}`,
         title: `Ultimate Guide to Shenzhen ${i}`,
         content: 'Mock content for Shenzhen getaway...',
         site: sites[i % sites.length],
         url: `https://${sites[i % sites.length]}/shenzhen-getaway/guide-${i}`,
         keyword: `Shenzhen weekend trip`,
         tags: [...demoTagIds]
      });
    }
  }

  tags.forEach((t) => {
    if (demoTagNames.includes(t.name)) return;
    // Generate up to 15 pseudo articles randomly for some tags, or max 10
    const count = Math.min(t.articleCount || Math.floor(Math.random() * 10), 10);
    for (let i = 0; i < count; i++) {
       generated.push({
         id: `article_${t.id}_${i}`,
         title: `A Guide to ${t.name} and Beyond ${i}`,
         content: 'Mock content...',
         site: sites[i % sites.length],
         url: `https://${sites[i % sites.length]}/${t.id}/guide-${i}`,
         keyword: `best ${t.name}`,
         tags: [t.id]
       });
    }
  });
  return generated;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [auditQueue, setAuditQueue] = useState<AuditTag[]>(INITIAL_AUDIT_QUEUE);
  const [articles, setArticles] = useState<Article[]>(() => generateMockArticles(INITIAL_TAGS));
  const [tagPages, setTagPages] = useState<TagPage[]>(() => {
    const tokyo = INITIAL_TAGS.find(t => t.name === 'Tokyo');
    const themePark = INITIAL_TAGS.find(t => t.name === 'Theme Parks');
    
    if (tokyo && themePark) {
      return [{
        id: 'demo_tokyo_page',
        site: 'en',
        tags: [tokyo.id, themePark.id],
        name: 'Tokyo Theme Parks',
        articleCount: 8,
        status: 'published',
        createdAt: new Date().toISOString(),
      }];
    }
    return [];
  });

  const addTag = (newTagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'articleCount'>) => {
    const newTag: Tag = {
      ...newTagData,
      id: Math.random().toString(36).substr(2, 9),
      articleCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTags((prev) => [...prev, newTag]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags((prev) =>
      prev.map((tag) =>
        tag.id === id ? { ...tag, ...updates, updatedAt: new Date().toISOString() } : tag
      )
    );
  };

  const deleteTag = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const addToAuditQueue = (newAudit: Omit<AuditTag, 'id' | 'createdAt' | 'status'>) => {
    // Only add if not already in global tags and not already pending
    const existsGlobally = tags.find((t) => t.name.toLowerCase() === newAudit.name.toLowerCase());
    const existsPending = auditQueue.find((a) => a.name.toLowerCase() === newAudit.name.toLowerCase() && a.status === 'pending');
    
    if (existsGlobally || existsPending) return;

    const auditTag: AuditTag = {
      ...newAudit,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setAuditQueue((prev) => [...prev, auditTag]);
  };

  const updateAuditTag = (id: string, updates: Partial<AuditTag>) => {
    setAuditQueue((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  };

  const approveAuditTag = (id: string) => {
    const auditTag = auditQueue.find((a) => a.id === id);
    if (auditTag) {
      addTag({
        name: auditTag.name,
        slug: auditTag.slug || auditTag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        locales: auditTag.locales || {},
        type: auditTag.type,
        description: auditTag.description || `Auto-approved tag for ${auditTag.name}`,
        h1: auditTag.name,
        status: 'active',
      });
      setAuditQueue((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
      );
    }
  };

  const rejectAuditTag = (id: string) => {
    setAuditQueue((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    );
  };

  const saveArticle = (article: Article) => {
    setArticles((prev) => {
      const existing = prev.findIndex((a) => a.id === article.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = article;
        return next;
      }
      return [...prev, article];
    });
  };

  const bulkRemoveTagFromArticles = (articleIds: string[], tagId: string) => {
    setArticles(prev => prev.map(a => {
      if (articleIds.includes(a.id)) {
        return { ...a, tags: a.tags.filter(t => t !== tagId) };
      }
      return a;
    }));
  };

  const bulkApplyTagToArticles = (articleIds: string[], tagId: string) => {
    setArticles(prev => prev.map(a => {
      if (articleIds.includes(a.id) && !a.tags.includes(tagId)) {
        return { ...a, tags: [...a.tags, tagId] };
      }
      return a;
    }));
  };

  const addArticlesWithTag = (articleIds: string[], tagId: string) => {
    setArticles(prev => {
      const next = [...prev];
      articleIds.forEach((articleId, i) => {
        const existingIndex = next.findIndex(a => a.id === articleId);
        if (existingIndex >= 0) {
          if (!next[existingIndex].tags.includes(tagId)) {
            next[existingIndex] = {
              ...next[existingIndex],
              tags: [...next[existingIndex].tags, tagId]
            };
          }
        } else {
          next.push({
            id: articleId,
            title: `Article ${articleId}`,
            content: '',
            site: 'unknown-site',
            url: `https://example.com/article/${articleId}`,
            keyword: 'manual addition',
            tags: [tagId]
          });
        }
      });
      return next;
    });
  };

  const generateTagPage = (site: string, params: { tagIds?: string[]; query?: TagPageQuery; name?: string }) => {
    const { tagIds = [], query, name: defaultName } = params;
    if (tagIds.length === 0 && !query) return;
    
    let count = 0;
    let fallbackName = '';

    if (query) {
      count = articles.filter(a => evaluateQuery(query, a.tags)).length;
      
      const groupNames = query.groups.map(g => {
        const pNames = g.tags.map(tid => tags.find(t => t.id === tid)?.name || tid);
        return pNames.length > 1 ? `(${pNames.join(` ${g.operator} `)})` : pNames[0];
      }).filter(Boolean);
      
      fallbackName = groupNames.join(` ${query.globalOperator} `) || 'Custom Query Page';
    } else {
      const selectedTags = tags.filter(t => tagIds.includes(t.id));
      fallbackName = selectedTags.map(t => t.name).join(' + ');
      count = articles.filter(a => tagIds.every(tid => a.tags.includes(tid))).length;
    }

    const newPage: TagPage = {
      id: Math.random().toString(36).substr(2, 9),
      site,
      tags: tagIds,
      query,
      name: defaultName || fallbackName,
      articleCount: count,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTagPages(prev => [...prev, newPage]);
  };

  const toggleTagPageStatus = (id: string, updates: { status: TagPage['status'] }) => {
    setTagPages(prev => prev.map(p => 
      p.id === id ? { ...p, status: updates.status || p.status } : p
    ));
  };

  const deleteTagPage = (id: string) => {
    setTagPages(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        tags,
        auditQueue,
        articles,
        tagPages,
        addTag,
        updateTag,
        deleteTag,
        addToAuditQueue,
        updateAuditTag,
        approveAuditTag,
        rejectAuditTag,
        saveArticle,
        bulkRemoveTagFromArticles,
        bulkApplyTagToArticles,
        addArticlesWithTag,
        generateTagPage,
        toggleTagPageStatus,
        deleteTagPage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
