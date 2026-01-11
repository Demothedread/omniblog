import React, { useState } from 'react';
import { X, Sparkles, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { BlogPost, MOCK_SITES, PostStatus, PaywallStatus } from '../types';
import { createPost, getAIConfig } from '../services/storageService';
import { generatePostTemplate } from '../services/geminiService';
import { uploadImage } from '../services/mediaService';

interface PostWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: BlogPost) => void;
  selectedSiteId: string;
}

export const PostWizard: React.FC<PostWizardProps> = ({ isOpen, onClose, onPostCreated, selectedSiteId }) => {
  const [step, setStep] = useState<'topic' | 'details'>('topic');
  const [topic, setTopic] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: 'Me', // Default
    summary: '',
    content: '',
    coverImage: '',
    paywall: PaywallStatus.FREE
  });

  if (!isOpen) return null;

  const handleAiGenerate = async () => {
    if (!topic) return;
    setIsLoadingAi(true);
    try {
      const aiConfig = getAIConfig();
      const generated = await generatePostTemplate(topic, formData.author, aiConfig);
      setFormData(prev => ({
        ...prev,
        title: generated.title,
        summary: generated.summary,
        content: generated.content
      }));
      setStep('details');
    } catch (e) {
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleManual = () => {
    setFormData(prev => ({ ...prev, title: topic }));
    setStep('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = createPost({
      ...formData,
      siteId: selectedSiteId,
      status: PostStatus.DRAFT,
      paywall: formData.paywall
    });
    onPostCreated(newPost);
    handleClose();
  };

  const handleClose = () => {
    setStep('topic');
    setTopic('');
    setFormData({ title: '', author: 'Me', summary: '', content: '', coverImage: '', paywall: PaywallStatus.FREE });
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setFormData(prev => ({ ...prev, coverImage: imageUrl }));
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Blog Post</h2>
            <p className="text-sm text-gray-500">
              Site: {MOCK_SITES.find(s => s.id === selectedSiteId)?.name}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === 'topic' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to write about?
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., The best coffee shops in Seattle..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleManual}
                  disabled={!topic}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-white transition">
                    <FileText className="text-gray-600" size={24} />
                  </div>
                  <span className="font-semibold text-gray-900">Start from Scratch</span>
                  <span className="text-xs text-gray-500 mt-1">Empty template</span>
                </button>

                <button
                  onClick={handleAiGenerate}
                  disabled={!topic || isLoadingAi}
                  className="flex flex-col items-center justify-center p-6 border-2 border-brand-100 bg-brand-50 rounded-xl hover:border-brand-300 hover:bg-brand-100 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoadingAi ? (
                    <Loader2 className="animate-spin text-brand-600 mb-3" size={24} />
                  ) : (
                    <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                      <Sparkles className="text-brand-600" size={24} />
                    </div>
                  )}
                  <span className="font-semibold text-brand-900">Generate with AI</span>
                  <span className="text-xs text-brand-600 mt-1">Auto-fill template</span>
                </button>
              </div>
            </div>
          ) : (
            <form id="post-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title Header</label>
                  <input
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Author</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-500 outline-none"
                    value={formData.author}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bullet Point Summary</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-500 outline-none font-mono text-sm"
                  placeholder="• Point 1&#10;• Point 2"
                  value={formData.summary}
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Featured Picture</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                  <label className={`cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Paywall Settings</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none bg-white"
                  value={formData.paywall}
                  onChange={(e) => setFormData({...formData, paywall: e.target.value as PaywallStatus})}
                >
                  {Object.values(PaywallStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {step === 'details' && (
            <>
              <button
                type="button"
                onClick={() => setStep('topic')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                type="submit"
                form="post-form"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm"
              >
                Create Draft
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};