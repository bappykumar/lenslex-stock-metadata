
import React, { useCallback, useState } from 'react';
import { UploadIcon, LoadingSpinner, ClearIcon, ExportIcon, RegenerateIcon } from './icons/Icons';
import { ControlSettings } from '../types';

interface ControlsPanelProps {
  onFilesSelect: (files: File[]) => void;
  onProcess: () => void;
  onClearAll: () => void;
  onExportCSV: () => void;
  onRetryFailed: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
  hasProcessedFiles: boolean;
  failedCount: number;
  settings: ControlSettings;
  onSettingsChange: (settings: ControlSettings) => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  onFilesSelect,
  onProcess,
  onClearAll,
  onExportCSV,
  onRetryFailed,
  isProcessing,
  hasFiles,
  hasProcessedFiles,
  failedCount,
  settings,
  onSettingsChange,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) onFilesSelect(Array.from(e.dataTransfer.files));
  }, [onFilesSelect]);

  const handleSettingChange = (name: keyof ControlSettings, value: any) => {
    onSettingsChange({ ...settings, [name]: value });
  };

  const handleMarketplaceChange = (marketplace: 'adobe' | 'freepik') => {
    const newSettings = { ...settings, marketplace };
    // Auto-adjust title length based on marketplace best practices
    if (marketplace === 'freepik') {
      newSettings.titleLength = 95;
    } else {
      newSettings.titleLength = 120;
    }
    onSettingsChange(newSettings);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
      <div className="xl:col-span-2 space-y-6">
        <div 
          onDragOver={handleDrag} onDragEnter={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
          className={`relative group h-48 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
            dragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-900/40'
          }`}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input id="file-upload" type="file" className="hidden" multiple onChange={(e) => e.target.files && onFilesSelect(Array.from(e.target.files))} />
          <UploadIcon className={`w-10 h-10 mb-2 transition-transform group-hover:scale-110 ${dragActive ? 'text-indigo-400' : 'text-slate-500'}`} />
          <p className="text-lg font-medium text-slate-300">Drop files here or <span className="text-indigo-400">browse</span></p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Supports Images & Video Clips</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col justify-center p-5 bg-slate-900/60 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Content Type</p>
            <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-inner">
              <button 
                onClick={() => handleSettingChange('contentType', 'photo')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${settings.contentType === 'photo' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
              >
                Photo / Real
              </button>
              <button 
                onClick={() => handleSettingChange('contentType', 'transparent')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${settings.contentType === 'transparent' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
              >
                Transparent PNG
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center p-5 bg-slate-900/60 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Target Marketplace</p>
            <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-inner">
              <button 
                onClick={() => handleMarketplaceChange('adobe')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${settings.marketplace === 'adobe' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
              >
                Adobe Stock
              </button>
              <button 
                onClick={() => handleMarketplaceChange('freepik')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${settings.marketplace === 'freepik' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
              >
                Freepik
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-700/50 pb-2">Output Params</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Title Length</span>
              <span className="text-indigo-400 font-mono font-bold">{settings.titleLength} ch</span>
            </div>
            <input type="range" min="30" max="200" value={settings.titleLength} onChange={(e) => handleSettingChange('titleLength', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Keywords Count</span>
              <span className="text-indigo-400 font-mono font-bold">{settings.keywordsCount}</span>
            </div>
            <input type="range" min="10" max="50" value={settings.keywordsCount} onChange={(e) => handleSettingChange('keywordsCount', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Main Action Button */}
          {!hasFiles ? (
            <button
              disabled
              className="w-full bg-slate-700/50 py-3.5 rounded-xl font-bold text-slate-500 flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider"
            >
               Waiting for files...
            </button>
          ) : isProcessing ? (
             <button
              disabled
              className="w-full bg-indigo-600/50 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-wait text-indigo-100 uppercase tracking-wider"
            >
              <LoadingSpinner /> Processing...
            </button>
          ) : failedCount > 0 ? (
            <button
              onClick={onRetryFailed}
              className="w-full bg-amber-500 hover:bg-amber-600 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-900/40 text-lg uppercase tracking-wider text-white animate-pulse"
            >
              <RegenerateIcon className="w-5 h-5" /> Retry {failedCount} Failed
            </button>
          ) : (
            <button
              onClick={onProcess}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-900/40 text-lg uppercase tracking-wider"
            >
              Analyze & Generate
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClearAll} disabled={!hasFiles || isProcessing} className="bg-slate-700/50 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-600 flex items-center justify-center gap-2">
              <ClearIcon className="w-4 h-4" /> Reset
            </button>
            <button onClick={onExportCSV} disabled={!hasProcessedFiles} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all border border-emerald-900/30 flex items-center justify-center gap-2">
              <ExportIcon className="w-4 h-4" /> Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;
