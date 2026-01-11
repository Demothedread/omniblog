import React, { useState, useEffect } from 'react';
import { 
  Layout, Plus, Globe, Calendar, FileText, 
  Archive, Edit3, Trash2, ExternalLink, ChevronDown, CheckCircle, Clock,
  ArrowUpDown, ArrowUp, ArrowDown, Lightbulb, X
} from 'lucide-react';
import { RichTextEditor } from './components/RichTextEditor';
import { PostWizard } from './components/PostWizard';
import { PublicBlog } from './components/PublicBlog';
import { BlogPost, PostStatus, PaywallStatus, MOCK_SITES, Site } from './types';
import { getPosts, updatePost, deletePost } from './services/storageService';
import { format, isValid, compareAsc } from 'date-fns';
import { DirectiveModal } from './components/DirectiveModal';
import { StorageSettingsModal } from './components/StorageSettingsModal';

type ViewMode = 'cms' | 'public';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: keyof BlogPost;
  direction: SortDirection;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentSite, setCurrentSite] = useState<Site>(MOCK_SITES[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('cms');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Initialize data
  useEffect(() => {
    setPosts(getPosts());
  }, []);

  const refreshPosts = () => {
    setPosts(getPosts());
  };

  const handleCreatePost = (newPost: BlogPost) => {
    refreshPosts();
    setEditingPost(newPost);
  };

  const handleUpdateField = (id: string, field: keyof BlogPost, value: any) => {
    const updated = updatePost(id, { [field]: value });
    setPosts(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const updated = deletePost(id);
      setPosts(updated);
    }
  };

  const handleArchive = (id: string) => {
    handleUpdateField(id, 'status', PostStatus.ARCHIVED);
  };

  // Sorting Logic
  const handleSort = (key: keyof BlogPost) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data: BlogPost[]) => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof BlogPost }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-ochre" /> : <ArrowDown size={14} className="text-ochre" />;
  };

  const SortHeader = ({ label, columnKey, align = 'left' }: { label: string, columnKey: keyof BlogPost, align?: 'left' | 'right' }) => (
    <th 
      className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition group select-none`}
      onClick={() => handleSort(columnKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  // Derived State
  const sitePosts = posts.filter(p => p.siteId === currentSite.id);
  
  let publishedPosts = sitePosts.filter(p => p.status === PostStatus.PUBLISHED);
  if (sortConfig) {
    publishedPosts = sortData(publishedPosts);
  } else {
    // Default sort by Date DESC
    publishedPosts.sort((a, b) => compareAsc(new Date(b.createdAt), new Date(a.createdAt)));
  }

  let scheduledPosts = sitePosts.filter(p => p.status === PostStatus.SCHEDULED);
  if (sortConfig) {
    scheduledPosts = sortData(scheduledPosts);
  } else {
    // Default sort by Publish Date ASC
    scheduledPosts.sort((a, b) => {
      if (!a.publishDate) return 1;
      if (!b.publishDate) return -1;
      return compareAsc(new Date(a.publishDate), new Date(b.publishDate));
    });
  }

  const draftPosts = sitePosts.filter(p => p.status === PostStatus.DRAFT);

  // --------------------------------------------------------------------------
  // Public View
  // --------------------------------------------------------------------------
  if (viewMode === 'public') {
    return (
      <PublicBlog 
        site={currentSite} 
        posts={sitePosts} 
        onBack={() => setViewMode('cms')} 
      />
    );
  }

  // --------------------------------------------------------------------------
  // CMS View
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-ink p-2 rounded-none">
              <Layout className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">OmniBlog <span className="font-light text-gray-400">Manager</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <DirectiveModal />
            <StorageSettingsModal />

            {/* Site Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-none hover:bg-gray-100 transition border border-gray-200">
                <Globe size={16} />
                {currentSite.name}
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-none shadow-xl border border-gray-100 hidden group-hover:block p-0 z-50">
                {MOCK_SITES.map(site => (
                  <button
                    key={site.id}
                    onClick={() => setCurrentSite(site)}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 ${currentSite.id === site.id ? 'bg-gray-50 text-ochre font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {site.name}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsRoadmapOpen(true)}
              className="text-gray-400 hover:text-ochre px-2 transition"
              title="System Roadmap"
            >
              <Lightbulb size={20} />
            </button>

            <button 
              onClick={() => setViewMode('public')}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-ochre px-3 py-2 text-sm font-medium transition"
            >
              <ExternalLink size={18} />
              View Live Site
            </button>

            <button 
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 bg-ink hover:bg-black text-white px-4 py-2 rounded-none text-sm font-medium transition shadow-sm"
            >
              <Plus size={18} />
              New Post
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Section 1: Published Posts */}
        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
            <div className="text-moss">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Published History</h2>
            <span className="ml-auto text-xs text-gray-400 font-mono">
              {publishedPosts.length} ITEMS
            </span>
          </div>
          
          <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader label="Title" columnKey="title" />
                  <SortHeader label="Author" columnKey="author" />
                  <SortHeader label="Date" columnKey="createdAt" />
                  <SortHeader label="Paywall" columnKey="paywall" />
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {publishedPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No published posts yet.</td>
                  </tr>
                ) : (
                  publishedPosts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 transition group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {post.coverImage && <img src={post.coverImage} className="h-8 w-8 object-cover mr-3 grayscale group-hover:grayscale-0 transition" alt="" />}
                          <span className="font-medium text-gray-900">{post.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input 
                          value={post.author}
                          onChange={(e) => handleUpdateField(post.id, 'author', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-ochre outline-none w-32"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {isValid(new Date(post.createdAt)) ? format(new Date(post.createdAt), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <PaywallSelect 
                          value={post.paywall} 
                          onChange={(val) => handleUpdateField(post.id, 'paywall', val)} 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleArchive(post.id)} className="text-gray-400 hover:text-clay mx-2" title="Archive">
                          <Archive size={16} />
                        </button>
                        <button onClick={() => setViewMode('public')} className="text-ochre hover:text-ochre-light mx-2" title="View Live">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Scheduled Queue */}
        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
            <div className="text-ochre">
              <Calendar size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Scheduled Queue</h2>
            <span className="ml-auto text-xs text-gray-400 font-mono">
              {scheduledPosts.length} ITEMS
            </span>
          </div>

          <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader label="Scheduled For" columnKey="publishDate" />
                  <SortHeader label="Title" columnKey="title" />
                  <SortHeader label="Paywall" columnKey="paywall" />
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduledPosts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">Nothing in the queue.</td>
                  </tr>
                ) : (
                  scheduledPosts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                         <input 
                            type="datetime-local"
                            value={post.publishDate ? post.publishDate.substring(0, 16) : ''}
                            onChange={(e) => handleUpdateField(post.id, 'publishDate', new Date(e.target.value).toISOString())}
                            className="text-ochre font-medium bg-yellow-50 px-2 py-1 border border-transparent hover:border-ochre focus:border-ochre outline-none cursor-pointer"
                         />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{post.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <PaywallSelect 
                          value={post.paywall} 
                          onChange={(val) => handleUpdateField(post.id, 'paywall', val)} 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setEditingPost(post)} className="text-gray-400 hover:text-ink mx-2" title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleUpdateField(post.id, 'status', PostStatus.DRAFT)} 
                          className="text-gray-400 hover:text-ochre mx-2"
                          title="Move to Drafts"
                        >
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Drafts */}
        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
            <div className="text-concrete">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Work in Progress</h2>
             <span className="ml-auto text-xs text-gray-400 font-mono">
              {draftPosts.length} ITEMS
            </span>
          </div>

          <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-200">
              {draftPosts.length === 0 ? (
                 <div className="px-6 py-12 text-center text-gray-400 text-sm">No drafts working. Start a new post!</div>
              ) : (
                draftPosts.map(post => (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition group flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => setEditingPost(post)}>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-ochre transition">
                          {post.title || 'Untitled Draft'}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {post.paywall}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl font-mono bg-canvas p-2 border border-gray-100">
                        {post.summary || 'No summary provided...'}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-mono">
                        <span>EDITED {isValid(new Date(post.updatedAt)) ? format(new Date(post.updatedAt), 'MMM d, h:mm a') : '-'}</span>
                        <span>//</span>
                        <span>{post.author}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-4">
                       <button 
                          onClick={() => setEditingPost(post)}
                          className="p-2 text-gray-400 hover:text-ink hover:bg-gray-100 transition"
                          title="Open Editor"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            handleUpdateField(post.id, 'publishDate', new Date(Date.now() + 86400000).toISOString());
                            handleUpdateField(post.id, 'status', PostStatus.SCHEDULED);
                          }}
                          className="p-2 text-gray-400 hover:text-ochre hover:bg-yellow-50 transition"
                          title="Schedule"
                        >
                          <Clock size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-clay hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Editor Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-6xl h-full md:h-[95vh] rounded-none md:rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-canvas">
               <div className="flex items-center gap-4 flex-1">
                 <input 
                    value={editingPost.title}
                    onChange={(e) => {
                      setEditingPost({...editingPost, title: e.target.value});
                      handleUpdateField(editingPost.id, 'title', e.target.value);
                    }}
                    className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 w-full"
                    placeholder="Post Title"
                 />
                 <span className="px-2 py-1 text-xs font-mono border border-gray-300 text-gray-500 whitespace-nowrap">
                    {editingPost.status}
                 </span>
               </div>
               <div className="flex items-center gap-3">
                 <button 
                    onClick={() => {
                      handleUpdateField(editingPost.id, 'status', PostStatus.PUBLISHED);
                      handleUpdateField(editingPost.id, 'publishDate', new Date().toISOString());
                      setEditingPost(null);
                    }}
                    className="px-6 py-2 bg-ink hover:bg-black text-white rounded-none text-sm font-medium transition"
                  >
                    Publish
                 </button>
                 <button 
                    onClick={() => setEditingPost(null)}
                    className="p-2 text-gray-500 hover:text-ink hover:bg-gray-200 transition"
                  >
                    <Layout size={20} className="rotate-45" />
                 </button>
               </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex">
               <div className="flex-1 flex flex-col p-8 max-w-4xl mx-auto w-full">
                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-canvas border border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Author</label>
                      <input 
                        value={editingPost.author}
                        onChange={(e) => {
                           setEditingPost({...editingPost, author: e.target.value});
                           handleUpdateField(editingPost.id, 'author', e.target.value);
                        }}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-ochre outline-none text-sm py-1 font-mono"
                      />
                    </div>
                     <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Paywall</label>
                       <PaywallSelect 
                          value={editingPost.paywall} 
                          onChange={(val) => {
                            setEditingPost({...editingPost, paywall: val});
                            handleUpdateField(editingPost.id, 'paywall', val);
                          }}
                          className="bg-transparent border-b border-gray-300 w-full text-sm py-1"
                        />
                    </div>
                     <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Summary</label>
                      <textarea 
                        value={editingPost.summary}
                        onChange={(e) => {
                           setEditingPost({...editingPost, summary: e.target.value});
                           handleUpdateField(editingPost.id, 'summary', e.target.value);
                        }}
                        rows={2}
                        className="w-full bg-transparent border border-gray-200 p-2 focus:border-ochre outline-none text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div className="flex-1 min-h-[500px] flex flex-col">
                    <RichTextEditor 
                      value={editingPost.content}
                      onChange={(val) => {
                         setEditingPost({...editingPost, content: val});
                         handleUpdateField(editingPost.id, 'content', val);
                      }}
                      className="flex-1 flex flex-col"
                      placeholder="Structure your thoughts..."
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* New Post Wizard */}
      <PostWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onPostCreated={handleCreatePost}
        selectedSiteId={currentSite.id}
      />

      {/* Roadmap Modal */}
      {isRoadmapOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-ochre p-2 text-white"><Lightbulb size={20} /></div>
                <h2 className="text-xl font-light">System Roadmap</h2>
              </div>
              <button onClick={() => setIsRoadmapOpen(false)} className="text-gray-400 hover:text-ink">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 bg-canvas">
              <p className="text-gray-500 mb-6 font-light">
                Proposed architectural extensions to enhance the OmniBlog ecosystem.
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: "Analytics & Engagement Metrics",
                    desc: "Visualize post views, scroll depth, and reader retention to inform content strategy."
                  },
                  {
                    title: "SEO & Social Meta-Tagging",
                    desc: "Dedicated fields for Open Graph images, Twitter cards, and meta descriptions per post."
                  },
                  {
                    title: "Collaborative Workflow",
                    desc: "Multi-user roles (Editor vs. Writer) with comment threads on drafts."
                  },
                  {
                    title: "Version History & Rollbacks",
                    desc: "Save immutable snapshots of posts at each edit to prevent data loss."
                  },
                  {
                    title: "Integrated Asset Library",
                    desc: "A visual media manager for dragging-and-dropping assets across multiple posts."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="text-ochre font-mono text-sm">0{idx + 1}</div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
              <button 
                onClick={() => setIsRoadmapOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Component for Paywall Select
const PaywallSelect = ({ value, onChange, className }: { value: PaywallStatus, onChange: (val: PaywallStatus) => void, className?: string }) => {
  const getBadgeColor = (status: PaywallStatus) => {
    switch (status) {
      case PaywallStatus.FREE: return 'text-moss bg-green-50/50';
      case PaywallStatus.SUBSCRIPTION: return 'text-ochre bg-yellow-50/50';
      case PaywallStatus.PREVIEW: return 'text-clay bg-red-50/50';
    }
  };

  return (
    <div className="relative inline-block w-full">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value as PaywallStatus)}
        className={`appearance-none w-full pl-3 pr-8 py-1 text-xs font-medium cursor-pointer border-transparent hover:border-gray-300 focus:ring-0 focus:border-ochre outline-none transition rounded-none ${getBadgeColor(value)} ${className}`}
      >
        {Object.values(PaywallStatus).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
};

export default App;