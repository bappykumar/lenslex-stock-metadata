
import React from 'react';
import { ControlSettings } from '../types';
import { ClearIcon } from './icons/Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ControlSettings;
  onSettingsChange: (settings: ControlSettings) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-all">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">API Configuration</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <ClearIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gemini API Key</label>
                <input 
                    type="password" 
                    value={settings.googleKey || ''}
                    onChange={(e) => onSettingsChange({...settings, googleKey: e.target.value})}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-500">Required for Gemini Flash 2.0 provider.</p>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Groq API Key</label>
                <input 
                    type="password" 
                    value={settings.groqKey || ''}
                    onChange={(e) => onSettingsChange({...settings, groqKey: e.target.value})}
                    placeholder="gsk_..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-500">Required for Llama 3.2 Vision provider.</p>
            </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-900/30 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-wide"
            >
                Save & Close
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ApiKeyModal;
