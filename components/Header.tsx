
import React, { useEffect, useState } from 'react';
import { DXMetaDataLogoIcon, SettingsIcon } from './icons/Icons';
import { ControlSettings, APIProvider } from '../types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface HeaderProps {
  settings: ControlSettings;
  onSettingsChange: (settings: ControlSettings) => void;
}

const Header: React.FC<HeaderProps> = ({ settings, onSettingsChange }) => {
  const [hasKey, setHasKey] = useState(false);

  const checkKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  useEffect(() => {
    checkKey();
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleProviderChange = (provider: APIProvider) => {
    onSettingsChange({ ...settings, provider });
  };

  const handleModelChange = (model: string) => {
    onSettingsChange({ ...settings, groqModel: model });
  };

  // Only listing currently active and supported Groq vision models
  const groqModels = [
    { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B (Recommended)' },
    { id: 'llava-v1.5-7b-4096-preview', name: 'Llava v1.5 7B' },
  ];

  return (
    <header className="bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between px-6 py-4 gap-4">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
            <DXMetaDataLogoIcon />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2 uppercase">
              LENSLEX <span className="text-[9px] bg-indigo-600 px-1.5 py-0.5 rounded text-indigo-100 uppercase tracking-widest font-bold">PRO</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Visual Intelligence Engine</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => handleProviderChange('google')}
              className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${settings.provider === 'google' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              GEMINI FLASH
            </button>
            <button 
              onClick={() => handleProviderChange('groq')}
              className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${settings.provider === 'groq' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              GROQ
            </button>
          </div>

          {settings.provider === 'groq' && (
            <div className="flex flex-wrap items-center justify-center gap-2">
               <select 
                value={settings.groqModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-indigo-500 font-bold cursor-pointer"
              >
                {groqModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <input 
                type="password"
                placeholder="Paste Groq Key"
                value={settings.groqKey || ''}
                onChange={(e) => onSettingsChange({ ...settings, groqKey: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-indigo-500 w-32 sm:w-48"
              />
            </div>
          )}

          {settings.provider === 'google' && (
            <button 
              onClick={handleOpenKey}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-[10px] font-bold ${hasKey ? 'text-emerald-400' : 'text-amber-400'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
              {hasKey ? 'GEMINI READY' : 'SETUP GEMINI'}
            </button>
          )}
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
    </header>
  );
};

export default Header;
