
import React from 'react';
import { FileWithMetadata } from '../types';
import { TrashIcon, CopyIcon, RegenerateIcon, TitleIcon, TagsIcon, LoadingSpinner } from './icons/Icons';

// Match the list in geminiService.ts exactly
const ADOBE_CATEGORIES = [
  "Animals", "Buildings and Architecture", "Business", "Drinks", "The Environment", 
  "States of Mind", "Food", "Graphic Resources", "Hobbies and Leisure", 
  "Industry", "Landscapes", "Lifestyle", "People", "Plants and Flowers", 
  "Culture and Religion", "Science", "Social Issues", "Sports", "Technology", 
  "Transport", "Travel"
];

interface FileWorkspaceProps {
  files: FileWithMetadata[];
  onRegenerate: (index: number) => void;
  onDelete: (index: number) => void;
  onCategoryChange: (index: number, newCategory: string) => void;
  currentlyProcessingIndex: number | null;
}

const FileCard: React.FC<{ 
  fileItem: FileWithMetadata; 
  index: number; 
  onRegenerate: (index: number) => void; 
  onDelete: (index: number) => void;
  onCategoryChange: (index: number, newCategory: string) => void;
  isCurrentlyProcessing: boolean;
}> = ({ fileItem, index, onRegenerate, onDelete, onCategoryChange, isCurrentlyProcessing }) => {
  const { fileInfo, metadata, error, isStreaming, lastProviderUsed } = fileItem;

  const handleCopy = (text: string | undefined) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const handleCopyKeywords = (keywords: string[] | undefined) => {
    if (keywords?.length) navigator.clipboard.writeText(keywords.join(', '));
  }

  return (
    <div className={`relative group bg-slate-800/30 border rounded-3xl overflow-hidden transition-all duration-500 ${
      isCurrentlyProcessing ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.01]' : 'border-slate-700/50 hover:border-slate-600'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header Bar with 100x100px Preview */}
        <div className="flex items-start justify-between px-6 py-5 bg-slate-900/40 border-b border-slate-700/30">
          <div className="flex gap-4 min-w-0 flex-1">
            {/* Strict 100x100px Thumbnail */}
            <div className="w-[100px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-900">
              <img src={`data:${fileInfo.mimeType};base64,${fileInfo.base64}`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex flex-col justify-center flex-1 pr-4">
              <p className="text-[10px] font-black text-slate-400 truncate uppercase tracking-widest mb-3">
                {fileInfo.file.name}
              </p>
               <div className="flex flex-wrap gap-2 items-center">
                 {lastProviderUsed && (
                  <span className={`px-2.5 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                    lastProviderUsed === 'google' ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20' : 'bg-orange-600/20 text-orange-400 border-orange-500/20'
                  }`}>
                    {lastProviderUsed}
                  </span>
                )}
                
                {/* Editable Category Dropdown */}
                {metadata && (
                  <div className="relative group/cat">
                    <select
                      value={metadata.category || ""}
                      onChange={(e) => onCategoryChange(index, e.target.value)}
                      className="appearance-none bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-md px-3 py-1 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-6 transition-all"
                    >
                      <option value="" disabled>Select Category</option>
                      {ADOBE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-800 text-slate-200 text-xs font-medium">{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-2.5 h-2.5 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                )}
               </div>
            </div>
          </div>
          <button onClick={() => onDelete(index)} className="p-2 rounded-lg text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-all flex-shrink-0">
            <TrashIcon />
          </button>
        </div>

        <div className="p-6 space-y-6 flex flex-col flex-1">
          {/* Quick Stats Row - Side by Side, Large */}
          <div className="grid grid-cols-2 gap-4">
             <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-colors ${
                (metadata?.title?.length || 0) > 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900/40 border-slate-700/50'
             }`}>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Title Chars</span>
                <span className={`text-2xl font-black ${metadata?.title ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {metadata?.title?.length || 0}
                </span>
             </div>
             <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-colors ${
                (metadata?.keywords?.length || 0) > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-900/40 border-slate-700/50'
             }`}>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Keywords</span>
                <span className={`text-2xl font-black ${metadata?.keywords ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {metadata?.keywords?.length || 0}
                </span>
             </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="relative group/field">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5"><TitleIcon className="w-3.5 h-3.5" /> Commercial Title</span>
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  value={metadata?.title || (isCurrentlyProcessing ? `Analyzing...` : '')}
                  className={`w-full h-20 bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:border-indigo-500/50 transition-colors leading-relaxed ${
                    isStreaming ? 'animate-pulse text-indigo-400' : 'text-slate-200'
                  }`}
                  placeholder="Waiting for analysis..."
                />
                {metadata?.title && (
                  <button onClick={() => handleCopy(metadata.title)} className="absolute bottom-3 right-3 p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors opacity-0 group-hover/field:opacity-100 shadow-lg">
                    <CopyIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="relative group/field">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <TagsIcon className="w-3.5 h-3.5" /> Keywords <span className="text-[8px] text-slate-600 ml-2">(Sorted by Relevance)</span>
              </label>
              <div className="relative">
                <div className="w-full min-h-[120px] bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 flex flex-wrap gap-2 content-start">
                  {metadata?.keywords?.length ? (
                    metadata.keywords.map((kw, i) => (
                      <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-tight transition-colors ${
                        i < 5 
                        ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm shadow-indigo-500/30' // Top 5 Priority
                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500 hover:text-white'
                      }`}>
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600 italic">No keywords extracted</span>
                  )}
                </div>
                {metadata?.keywords?.length && (
                  <button onClick={() => handleCopyKeywords(metadata.keywords)} className="absolute bottom-3 right-3 p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors opacity-0 group-hover/field:opacity-100 shadow-lg">
                    <CopyIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-700/30">
            <div className="flex items-center gap-2">
              {isCurrentlyProcessing ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  <LoadingSpinner className="w-3.5 h-3.5" /> Engine Running...
                </div>
              ) : error ? (
                <div className="text-[9px] font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 uppercase tracking-tight max-w-[220px] whitespace-normal leading-tight" title={error}>
                  {error}
                </div>
              ) : (
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
                  {metadata ? 'Analysis Complete' : 'Ready'}
                </div>
              )}
            </div>
            <button 
              onClick={() => onRegenerate(index)} 
              disabled={isCurrentlyProcessing} 
              className={`p-2.5 rounded-xl transition-all disabled:opacity-30 ${
                metadata ? 'bg-slate-700/30 text-slate-400 hover:bg-indigo-600 hover:text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              <RegenerateIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileWorkspace: React.FC<FileWorkspaceProps> = ({ files, onRegenerate, onDelete, onCategoryChange, currentlyProcessingIndex }) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-700/50 rounded-[40px] bg-slate-900/20">
        <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em]">Workspace Empty</h3>
        <p className="text-slate-500 mt-2 text-sm">Upload images to begin metadata generation</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {files.map((fileItem, index) => (
        <FileCard 
            key={index} 
            fileItem={fileItem} 
            index={index}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
            onCategoryChange={onCategoryChange}
            isCurrentlyProcessing={currentlyProcessingIndex === index}
        />
      ))}
    </div>
  );
};

export default FileWorkspace;
