
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md transition-all">
      <div 
        className="bg-slate-800 border border-slate-600 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                API Credentials
            </h2>
            <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-all"
            >
                <ClearIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-8 space-y-8">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-indigo-400 uppercase tracking-widest">Gemini API Key (Google)</label>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase font-bold">Recommended</span>
                </div>
                <input 
                    type="password" 
                    value={settings.googleKey || ''}
                    onChange={(e) => onSettingsChange({...settings, googleKey: e.target.value})}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-wide shadow-inner"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Used for the <strong className="text-slate-400">Gemini Flash 2.0</strong> provider. Fast, high limits, and very accurate.
                </p>
            </div>

            <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-orange-400 uppercase tracking-widest">Groq API Key</label>
                </div>
                <input 
                    type="password" 
                    value={settings.groqKey || ''}
                    onChange={(e) => onSettingsChange({...settings, groqKey: e.target.value})}
                    placeholder="gsk_..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono tracking-wide shadow-inner"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Used for <strong className="text-slate-400">Llama 3.2 Vision</strong>. Open source alternative.
                </p>
            </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-900/30 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-wide hover:scale-105 active:scale-95"
            >
                Save Keys
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ApiKeyModal;
