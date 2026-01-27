import React from 'react';
import { DXMetaDataLogoIcon } from './icons/Icons';
import { ControlSettings } from '../types';

interface HeaderProps {
  settings: ControlSettings;
  onSettingsChange: (settings: ControlSettings) => void;
}

const Header: React.FC<HeaderProps> = ({ settings, onSettingsChange }) => {
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
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 text-[10px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-xl select-none flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
               System: Gemini 3.0 Flash
           </div>
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
    </header>
  );
};

export default Header;