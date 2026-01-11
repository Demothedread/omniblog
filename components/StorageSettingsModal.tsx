import React, { useState, useEffect } from 'react';
import { Database, X, Save, AlertCircle } from 'lucide-react';
import { getStorageSettings, saveStorageSettings } from '../services/storageService';
import { StorageSettings } from '../types';

export const StorageSettingsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<StorageSettings>({ cloudinaryCloudName: '', cloudinaryUploadPreset: '' });

  useEffect(() => {
    if (isOpen) {
      setSettings(getStorageSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveStorageSettings(settings);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-ochre transition border border-gray-200"
      >
        <Database size={16} />
        <span className="hidden md:inline">Storage</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-ink p-2 text-white rounded-none"><Database size={20} /></div>
                <h2 className="text-xl font-light">Media Storage</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-ink">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 bg-canvas">
              <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-sm flex gap-3">
                <AlertCircle size={20} className="shrink-0" />
                <p>Configure Cloudinary for hosted image URLs. Leave blank to use local Base64 storage (limitations apply).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cloud Name</label>
                <input 
                  value={settings.cloudinaryCloudName}
                  onChange={e => setSettings({...settings, cloudinaryCloudName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-ochre outline-none transition"
                  placeholder="e.g., demo"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Preset (Unsigned)</label>
                <input 
                  value={settings.cloudinaryUploadPreset}
                  onChange={e => setSettings({...settings, cloudinaryUploadPreset: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-ochre outline-none transition"
                  placeholder="e.g., my_blog_upload"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-ochre hover:bg-ochre-light hover:text-ink text-white font-medium transition"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};