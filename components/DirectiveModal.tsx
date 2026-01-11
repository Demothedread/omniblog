import React, { useState, useEffect } from 'react';
import { Sliders, X, Save } from 'lucide-react';
import { getAIConfig, saveAIConfig } from '../services/storageService';
import { AIConfig } from '../types';

export const DirectiveModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig>({ tone: '', style: '', sourceMaterial: '' });

  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveAIConfig(config);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-ochre transition border border-gray-200"
      >
        <Sliders size={16} />
        <span className="hidden md:inline">Directives</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-ink p-2 text-white rounded-none"><Sliders size={20} /></div>
                <h2 className="text-xl font-light">AI Directives</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-ink">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 bg-canvas">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tone of Voice</label>
                <input 
                  value={config.tone}
                  onChange={e => setConfig({...config, tone: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-ochre outline-none transition"
                  placeholder="e.g., Professional, Whimsical, Authoritative..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Style Guide</label>
                <textarea 
                  value={config.style}
                  onChange={e => setConfig({...config, style: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-ochre outline-none transition"
                  placeholder="e.g., Short sentences. No jargon. Use metaphors."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Source Material / Inspiration</label>
                <textarea 
                  value={config.sourceMaterial}
                  onChange={e => setConfig({...config, sourceMaterial: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-ochre outline-none transition"
                  placeholder="Paste a sample paragraph to mimic..."
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-ochre hover:bg-ochre-light hover:text-ink text-white font-medium transition"
              >
                <Save size={18} />
                Save Directives
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};