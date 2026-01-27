
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { UploadIcon, LoadingSpinner, ClearIcon, ExportIcon, RegenerateIcon, ImportIcon } from './icons/Icons';
import { ControlSettings } from '../types';

interface ControlsPanelProps {
  onFilesSelect: (files: File[]) => void;
  onCsvSelect: (file: File) => void;
  onProcess: () => void;
  onClearAll: () => void;
  onExportCSV: (type: 'adobe' | 'freepik' | 'both') => void;
  onRetryFailed: () => void;
  isProcessing: boolean;
  isUploading: boolean;
  uploadProgress: number;
  hasFiles: boolean;
  hasProcessedFiles: boolean;
  failedCount: number;
  settings: ControlSettings;
  onSettingsChange: (settings: ControlSettings) => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  onFilesSelect,
  onCsvSelect,
  onProcess,
  onClearAll,
  onExportCSV,
  onRetryFailed,
  isProcessing,
  isUploading,
  uploadProgress,
  hasFiles,
  hasProcessedFiles,
  failedCount,
  settings,
  onSettingsChange,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }
  }, [isUploading]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!isUploading && e.dataTransfer.files?.length) {
        const files: File[] = Array.from(e.dataTransfer.files);
        if (files.length === 1 && files[0].name.toLowerCase().endsWith('.csv')) {
            onCsvSelect(files[0]);
        } else {
            onFilesSelect(files);
        }
    }
  }, [onFilesSelect, onCsvSelect, isUploading]);

  const handleSettingChange = (name: keyof ControlSettings, value: any) => {
    onSettingsChange({ ...settings, [name]: value });
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-[2rem] backdrop-blur-xl shadow-2xl flex flex-col gap-6 relative z-10 transition-all hover:border-slate-600/50">
      
        {/* Header with Import */}
        <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Assets</h2>
            <div>
                 <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={(e) => e.target.files?.[0] && onCsvSelect(e.target.files[0])} />
                 <button 
                    onClick={() => document.getElementById('csv-upload')?.click()} 
                    className="group flex items-center gap-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-all py-1.5 px-3 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/15 border border-transparent hover:border-indigo-500/20"
                    title="Import existing CSV to edit"
                 >
                    <ImportIcon className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                    Import CSV
                 </button>
            </div>
        </div>

        {/* Upload Box */}
        <div 
          onDragOver={handleDrag} onDragEnter={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
          className={`relative group h-44 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
            dragActive 
                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' 
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/30 hover:bg-slate-900/50'
          }`}
          onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
        >
          {isUploading ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                  <LoadingSpinner className="w-8 h-8 text-indigo-500 mb-3" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider animate-pulse mb-3">Uploading...</p>
                  
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                  </div>
              </div>
          ) : (
            <>
                <input id="file-upload" type="file" className="hidden" multiple onChange={(e) => {
                    if (!e.target.files?.length) return;
                    const files: File[] = Array.from(e.target.files);
                     if (files.length === 1 && files[0].name.toLowerCase().endsWith('.csv')) {
                        onCsvSelect(files[0]);
                    } else {
                        onFilesSelect(files);
                    }
                }} disabled={isUploading} />
                <div className="p-4 bg-slate-800/50 rounded-full mb-3 group-hover:bg-slate-800 transition-colors group-hover:scale-110 duration-300 border border-slate-700/50">
                    <UploadIcon className={`w-6 h-6 ${dragActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`} />
                </div>
                <p className="text-sm font-bold text-slate-300 text-center px-4">Drop files to start</p>
                <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wide">or click to browse</p>
            </>
          )}
        </div>

        {/* Settings Section */}
        <div className="bg-slate-900/30 rounded-2xl p-5 border border-slate-700/30 space-y-5">
            {/* Content Type Toggle */}
            <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</p>
                <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800 shadow-inner">
                  <button 
                    onClick={() => handleSettingChange('contentType', 'photo')}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${settings.contentType === 'photo' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    PHOTO
                  </button>
                  <button 
                    onClick={() => handleSettingChange('contentType', 'transparent')}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${settings.contentType === 'transparent' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    TRANSPARENT
                  </button>
                </div>
            </div>

            <div className="h-px bg-slate-800 w-full"></div>

            {/* Sliders */}
            <div className="space-y-5">
                {/* Keywords */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-400">Keywords Limit</span>
                    <span className="text-indigo-300 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{settings.keywordsCount}</span>
                  </div>
                  <input type="range" min="10" max="50" value={settings.keywordsCount} onChange={(e) => handleSettingChange('keywordsCount', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                {/* Adobe Title */}
                <div className="space-y-2.5">
                   <div className="flex justify-between text-[10px]">
                      <span className="font-bold text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Adobe Max
                      </span>
                      <span className="text-indigo-300 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{settings.adobeTitleLength}</span>
                   </div>
                   <input type="range" min="50" max="200" step="5" value={settings.adobeTitleLength} onChange={(e) => handleSettingChange('adobeTitleLength', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                {/* Freepik Title */}
                <div className="space-y-2.5">
                   <div className="flex justify-between text-[10px]">
                      <span className="font-bold text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Freepik Max
                      </span>
                      <span className="text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{settings.freepikTitleLength}</span>
                   </div>
                   <input type="range" min="50" max="200" step="5" value={settings.freepikTitleLength} onChange={(e) => handleSettingChange('freepikTitleLength', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          {!hasFiles ? (
            <button
              disabled
              className="w-full bg-slate-800/50 py-3.5 rounded-xl font-bold text-slate-500 flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider text-[10px] border border-slate-700/50"
            >
               Waiting for files...
            </button>
          ) : isProcessing ? (
             <button
              disabled
              className="w-full bg-indigo-600/20 border border-indigo-500/30 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-wait text-indigo-300 uppercase tracking-wider text-[10px]"
            >
              <LoadingSpinner className="w-4 h-4" /> Processing Batch...
            </button>
          ) : failedCount > 0 ? (
            <button
              onClick={onRetryFailed}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/40 text-[10px] uppercase tracking-wider text-white animate-pulse"
            >
              <RegenerateIcon className="w-4 h-4" /> Retry Failed
            </button>
          ) : (
            <button
              onClick={onProcess}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 text-[10px] uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] text-white"
            >
              Start Analysis
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 relative z-50" ref={exportMenuRef}>
            <button onClick={onClearAll} disabled={!hasFiles || isProcessing || isUploading} className="bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 py-3 rounded-xl text-[10px] font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 text-slate-400">
              <ClearIcon className="w-3.5 h-3.5" /> Reset
            </button>
            
            <div className="relative w-full">
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)} 
                    disabled={!hasProcessedFiles} 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ExportIcon className="w-3.5 h-3.5" /> Export
                </button>

                {/* Export Dropdown - Positioned Top Right */}
                {showExportMenu && (
                    <div className="absolute bottom-full right-0 mb-3 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-[slideUp_0.1s_ease-out] ring-1 ring-black/20">
                        <div className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50">Choose Format</div>
                        <button onClick={() => { onExportCSV('adobe'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-indigo-300 hover:bg-slate-700/50 hover:text-white transition-colors border-b border-slate-700/50 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Adobe Stock CSV
                        </button>
                        <button onClick={() => { onExportCSV('freepik'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-emerald-300 hover:bg-slate-700/50 hover:text-white transition-colors border-b border-slate-700/50 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Freepik CSV
                        </button>
                        <button onClick={() => { onExportCSV('both'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white bg-indigo-600/10 hover:bg-indigo-600 transition-colors flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white"></span> Download Both
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default ControlsPanel;
