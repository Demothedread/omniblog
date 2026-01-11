import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, Clock, LayoutGrid, Rows } from 'lucide-react';
import { BlogPost, Site } from '../types';
import { format, isValid } from 'date-fns';

interface PublicBlogProps {
  site: Site;
  posts: BlogPost[];
  onBack: () => void;
}

// UDD-0: INTL+PRR Fusion
// Template A: "The International" - Strict vertical rhythm, list-based.
// Template B: "The Prairie" - Horizontal spread, card-based.

export const PublicBlog: React.FC<PublicBlogProps> = ({ site, posts, onBack }) => {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [template, setTemplate] = useState<'international' | 'prairie'>('prairie');

  // Filter only published posts for the public view
  const publishedPosts = posts.filter(p => p.status === 'Published');

  if (activePost) {
    return (
      <ReadingPane post={activePost} onClose={() => setActivePost(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Navigation / Datum Line */}
      <nav className="border-b border-gray-200 sticky top-0 bg-canvas/95 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-gray-400 hover:text-ochre transition-colors duration-200"
              aria-label="Return to CMS"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <h1 className="text-xl font-light tracking-tight">{site.name}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Layout Switcher */}
             <div className="flex bg-gray-100 p-1 rounded-none">
                <button 
                  onClick={() => setTemplate('international')}
                  className={`p-1.5 transition-all duration-200 ${template === 'international' ? 'bg-white shadow-sm text-ink' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Rows size={16} />
                </button>
                <button 
                  onClick={() => setTemplate('prairie')}
                  className={`p-1.5 transition-all duration-200 ${template === 'prairie' ? 'bg-white shadow-sm text-ink' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid size={16} />
                </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        
        {/* Hero Area (UDD: Minimal Mass, Maximum Light) */}
        <header className="mb-24 mt-12 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 leading-tight">
              Design is <span className="text-ochre font-normal">intelligence</span><br/> 
              made visible.
            </h2>
            <p className="text-lg text-concrete max-w-xl font-light leading-relaxed border-l-2 border-ochre pl-6">
              A collection of thoughts, structures, and architectural programming for the digital age.
            </p>
          </div>
        </header>

        {/* Post Grid */}
        {template === 'prairie' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {publishedPosts.map(post => (
              <PrairieCard key={post.id} post={post} onClick={() => setActivePost(post)} />
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto divide-y divide-gray-100">
            {publishedPosts.map(post => (
              <InternationalRow key={post.id} post={post} onClick={() => setActivePost(post)} />
            ))}
          </div>
        )}
        
        {publishedPosts.length === 0 && (
          <div className="text-center py-20 text-gray-400 font-light">
            No structures built yet.
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 mt-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm text-gray-400">
           <span>© 2024 {site.name}</span>
           <span>Powered by OmniBlog</span>
        </div>
      </footer>
    </div>
  );
};

// ------------------------------------------------------------------
// Sub-Components
// ------------------------------------------------------------------

const PrairieCard: React.FC<{ post: BlogPost; onClick: () => void }> = ({ post, onClick }) => (
  <article 
    className="group cursor-pointer flex flex-col h-full"
    onClick={onClick}
  >
    {/* Image: Rectilinear, no radius */}
    <div className="aspect-[16/10] bg-gray-100 mb-6 overflow-hidden relative">
      {post.coverImage ? (
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
          <LayoutGrid size={48} strokeWidth={1} />
        </div>
      )}
      {/* Paywall Badge as Architectural Detail */}
      {post.paywall !== 'Free' && (
        <div className="absolute top-0 right-0 bg-ink text-white text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
          {post.paywall}
        </div>
      )}
    </div>

    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 text-xs text-ochre uppercase tracking-widest mb-3 font-medium">
        {isValid(new Date(post.createdAt)) ? format(new Date(post.createdAt), 'MMMM d, yyyy') : ''}
      </div>
      <h3 className="text-2xl font-normal leading-tight mb-3 group-hover:underline decoration-1 underline-offset-4 decoration-gray-300 transition-all">
        {post.title}
      </h3>
      <p className="text-concrete font-light leading-relaxed line-clamp-3 mb-4 flex-1">
        {post.summary}
      </p>
      <div className="text-xs font-medium text-gray-400 flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
        <User size={12} /> {post.author}
      </div>
    </div>
  </article>
);

const InternationalRow: React.FC<{ post: BlogPost; onClick: () => void }> = ({ post, onClick }) => (
  <article 
    className="group cursor-pointer py-10 grid grid-cols-12 gap-8 items-start"
    onClick={onClick}
  >
    <div className="col-span-3 text-sm text-gray-400 font-mono pt-1">
      {isValid(new Date(post.createdAt)) ? format(new Date(post.createdAt), 'yyyy.MM.dd') : ''}
    </div>
    <div className="col-span-9">
      <h3 className="text-3xl font-light mb-3 group-hover:text-ochre transition-colors duration-200">
        {post.title}
      </h3>
      <p className="text-concrete font-light leading-relaxed max-w-2xl">
         {post.summary}
      </p>
      <div className="mt-4 flex items-center gap-4">
        {post.paywall !== 'Free' && (
           <span className="text-[10px] uppercase tracking-widest border border-gray-200 px-2 py-0.5 text-gray-500">
             {post.paywall}
           </span>
        )}
      </div>
    </div>
  </article>
);

const ReadingPane: React.FC<{ post: BlogPost; onClose: () => void }> = ({ post, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-white h-full shadow-2xl overflow-y-auto slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 px-8 h-20 flex items-center justify-between z-10">
           <button 
             onClick={onClose}
             className="group flex items-center gap-2 text-sm text-gray-500 hover:text-ink transition"
           >
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             Back to Index
           </button>
           <div className="flex gap-4 text-gray-400">
             <button className="hover:text-ink"><Calendar size={18} /></button>
           </div>
        </div>

        <article className="px-8 py-16 md:px-16">
           <header className="mb-12 border-b border-gray-100 pb-12">
              <div className="flex items-center gap-4 text-sm text-ochre mb-6 font-medium uppercase tracking-widest">
                <span>{post.author}</span>
                <span className="w-1 h-1 bg-ochre rounded-full"></span>
                <span>{isValid(new Date(post.createdAt)) ? format(new Date(post.createdAt), 'MMMM d, yyyy') : ''}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-light leading-tight text-ink mb-8">
                {post.title}
              </h1>
              {post.coverImage && (
                <div className="aspect-video w-full bg-gray-50 mb-8 overflow-hidden">
                   <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
           </header>
           
           {/* Content Renderer - UDD Typography Overrides */}
           <div 
             className="prose prose-lg max-w-none prose-headings:font-light prose-headings:tracking-tight prose-p:text-concrete prose-p:leading-loose prose-a:text-ochre prose-a:no-underline hover:prose-a:underline prose-img:rounded-none"
             dangerouslySetInnerHTML={{ __html: post.content }}
           />
        </article>
      </div>
    </div>
  )
}