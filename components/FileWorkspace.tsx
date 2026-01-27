
import React, { useState } from 'react';
import { FileWithMetadata } from '../types';
import { TrashIcon, CopyIcon, RegenerateIcon, TitleIcon, TagsIcon, LoadingSpinner, FileIcon } from './icons/Icons';

// Match the list in geminiService.ts exactly
const ADOBE_CATEGORIES = [
  "Animals", "Buildings and Architecture", "Business", "Drinks", "The Environment", 
  "States of Mind", "Food", "Graphic Resources", "Hobbies and Leisure", 
  "Industry", "Landscapes", "Lifestyle", "People", "Plants and Flowers", 
  "Culture and Religion", "Science", "Social Issues", "Sports", "Technology", 
  "Transport", "Travel"
];

// List of common trademarks to watch out for in the UI
const TRADEMARK_WATCHLIST = [
    'iphone', 'ipad', 'apple', 'macbook', 'siri', 'ios', 'airpods',
    'samsung', 'galaxy', 'android', 'google', 'pixel', 'microsoft', 'windows',
    'nike', 'adidas', 'puma', 'reebok', 'gucci', 'prada', 'chanel',
    'bmw', 'mercedes', 'audi', 'ferrari', 'porsche', 'toyota', 'honda', 'jeep',
    'coca-cola', 'pepsi', 'lego', 'disney', 'marvel', 'netflix', 'uber', 'tesla',
    'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'whatsapp'
];

interface FileWorkspaceProps {
  files: FileWithMetadata[];
  onRegenerate: (index: number) => void;
  onDelete: (index: number) => void;
  onCategoryChange: (index: number, newCategory: string) => void;
  onTitleChange: (index: number, type: 'adobe' | 'freepik', newTitle: string) => void;
  onKeywordsChange: (index: number, newKeywordsString: string) => void;
  currentlyProcessingIndex: number | null;
}

// Simple internal component for the Image Modal
const ImageModal: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
            <img src={src} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};

// Copy Button Component with feedback state
const CopyButton: React.FC<{ text: string, className?: string, label?: string }> = ({ text, className, label }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy} 
            className={`${className} transition-all duration-300 ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : ''}`}
            title="Copy to clipboard"
        >
            {copied ? (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    {label && <span>Copied!</span>}
                </>
            ) : (
                <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    {label && <span>{label}</span>}
                </>
            )}
        </button>
    );
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileCard: React.FC<{ 
  fileItem: FileWithMetadata; 
  index: number; 
  onRegenerate: (index: number) => void; 
  onDelete: (index: number) => void;
  onCategoryChange: (index: number, newCategory: string) => void;
  onTitleChange: (index: number, type: 'adobe' | 'freepik', newTitle: string) => void;
  onKeywordsChange: (index: number, newKeywordsString: string) => void;
  isCurrentlyProcessing: boolean;
}> = ({ fileItem, index, onRegenerate, onDelete, onCategoryChange, onTitleChange, onKeywordsChange, isCurrentlyProcessing }) => {
  const { fileInfo, metadata, error, isStreaming } = fileItem;
  const [showImageModal, setShowImageModal] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState("");

  const hasImage = !!fileInfo.base64;
  const adobeCount = metadata?.adobe_title?.length || 0;
  const freepikCount = metadata?.freepik_title?.length || 0;
  
  // Keyword Management Logic
  const keywords = metadata?.keywords || [];
  const keywordCount = keywords.length;

  const removeKeyword = (keywordToRemove: string) => {
      const updated = keywords.filter(k => k !== keywordToRemove);
      onKeywordsChange(index, updated.join(', '));
  };

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newKeywordInput.trim()) {
          e.preventDefault();
          const updated = [...keywords, newKeywordInput.trim()];
          onKeywordsChange(index, updated.join(', '));
          setNewKeywordInput("");
      }
  };

  // Retrieve limits from localStorage
  const savedSettings = localStorage.getItem('lenslex_settings');
  const settings = savedSettings ? JSON.parse(savedSettings) : { adobeTitleLength: 120, freepikTitleLength: 100 };
  
  const isAdobeOver = adobeCount > settings.adobeTitleLength;
  const isFreepikOver = freepikCount > settings.freepikTitleLength;

  // --- TRADEMARK CHECKER LOGIC ---
  const allText = `${metadata?.adobe_title || ''} ${metadata?.freepik_title || ''} ${keywords.join(' ')}`.toLowerCase();
  const foundTrademarks = TRADEMARK_WATCHLIST.filter(tm => {
      // Use regex to find whole words only, avoiding false positives (e.g., 'apple' in 'pineapple')
      const regex = new RegExp(`\\b${tm}\\b`, 'i');
      return regex.test(allText);
  });
  const isSafe = foundTrademarks.length === 0;

  return (
    <>
        {showImageModal && hasImage && (
            <ImageModal src={`data:${fileInfo.mimeType};base64,${fileInfo.base64}`} onClose={() => setShowImageModal(false)} />
        )}

        <div 
        className={`relative group bg-slate-800/40 border rounded-[2rem] overflow-hidden transition-all duration-500 animate-[slideUp_0.4s_ease-out_forwards] shadow-xl ${
            isCurrentlyProcessing ? 'border-indigo-500/50 ring-4 ring-indigo-500/10 scale-[1.01]' : 'border-slate-700/50 hover:border-slate-600'
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
        >
        {/* Scanning Effect Overlay */}
        {isCurrentlyProcessing && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_25px_rgba(99,102,241,1)] animate-[scan_2s_linear_infinite]" />
                <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
            </div>
        )}

        {/* Main Horizontal Container */}
        <div className="flex flex-col xl:flex-row h-full relative z-10">
            
            {/* LEFT COLUMN: Image & Core Info */}
            <div className="w-full xl:w-80 bg-slate-900/50 border-b xl:border-b-0 xl:border-r border-slate-700/50 p-6 flex flex-col gap-6">
                
                {/* Thumbnail - Clickable for Zoom */}
                <div 
                    className={`w-full aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-inner bg-slate-950 relative flex items-center justify-center transition-all ${hasImage ? 'cursor-zoom-in hover:shadow-2xl hover:border-indigo-500/30' : ''}`}
                    onClick={() => hasImage && setShowImageModal(true)}
                >
                {isCurrentlyProcessing && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse z-10"></div>}
                {hasImage ? (
                    <img src={`data:${fileInfo.mimeType};base64,${fileInfo.base64}`} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 gap-3 bg-slate-900 w-full h-full">
                        <FileIcon className="w-12 h-12 opacity-30" />
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">CSV File</span>
                    </div>
                )}
                </div>

                {/* File Details */}
                <div className="space-y-5">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Filename</p>
                        <p className="text-xs font-bold text-slate-300 truncate font-mono select-all" title={fileInfo.file.name}>{fileInfo.file.name}</p>
                    </div>

                    {/* Category Selector */}
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category</p>
                        <div className="relative group/cat w-full">
                            <select
                            value={metadata?.category || ""}
                            onChange={(e) => onCategoryChange(index, e.target.value)}
                            disabled={!metadata}
                            className="w-full appearance-none bg-emerald-950/30 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-8 transition-all disabled:opacity-50"
                            >
                            <option value="" disabled>Select Category</option>
                            {ADOBE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="bg-slate-900 text-slate-200 text-xs font-medium">{cat}</option>
                            ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500/50">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Asset Specs & Safety Monitor */}
                    <div className="bg-slate-950/40 rounded-xl border border-slate-800/50 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="p-1 bg-slate-800 rounded">
                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">File & Safety</span>
                             </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase mb-0.5">Size / Type</p>
                                    <p className="text-xs font-mono text-slate-300 font-medium">{formatFileSize(fileInfo.file.size)} <span className="text-slate-600">/</span> {fileInfo.file.name.split('.').pop()?.toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase mb-0.5">Modified</p>
                                    <p className="text-xs font-mono text-slate-300 font-medium">{new Date(fileInfo.file.lastModified).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            {/* Smart Safety Check */}
                            <div className="pt-3 border-t border-slate-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Safety Monitor</p>
                                    {metadata && (
                                        isSafe 
                                        ? <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded border border-emerald-500/20 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> Clean</span>
                                        : <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider rounded border border-amber-500/20 flex items-center gap-1 animate-pulse"><span className="w-1 h-1 rounded-full bg-amber-500"></span> Risk</span>
                                    )}
                                </div>
                                
                                {metadata ? (
                                    isSafe ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span className="opacity-80">No trademarks detected.</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 text-xs bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                            <div className="flex items-center gap-2 text-amber-300">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                <span className="font-bold">Potential Issues:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {foundTrademarks.map((tm, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-amber-500/20 text-amber-200 rounded text-[10px] uppercase font-bold tracking-wide border border-amber-500/20">{tm}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-[10px] text-slate-600 italic">Waiting for metadata...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-2 flex gap-2">
                    <button onClick={() => onDelete(index)} className="flex-1 py-3 rounded-xl text-slate-400 bg-slate-800/80 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-slate-700/80 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <TrashIcon /> Delete
                    </button>
                    <button 
                    onClick={() => onRegenerate(index)} 
                    disabled={isCurrentlyProcessing || !hasImage} 
                    className={`px-4 rounded-xl transition-all disabled:opacity-30 border ${
                        metadata 
                            ? 'bg-slate-800/80 text-slate-400 hover:bg-indigo-600 hover:text-white border-slate-700/80' 
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-500'
                    }`}
                    >
                    <RegenerateIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* RIGHT COLUMN: Editors */}
            <div className="flex-1 p-6 space-y-5 bg-slate-800/20">
            
                {/* Status Header */}
                <div className="flex items-center gap-2 mb-2">
                    {isCurrentlyProcessing ? (
                        <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                        <LoadingSpinner className="w-3 h-3" /> Analyzing content...
                        </div>
                    ) : error ? (
                        <div className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">Error: {error}</div>
                    ) : (
                        <div className="flex items-center gap-2 opacity-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metadata Ready</span>
                        </div>
                    )}
                </div>

                {/* ADOBE TITLE FIELD */}
                <div className="relative group/field bg-slate-900/30 p-5 rounded-2xl border border-slate-700/30 hover:border-indigo-500/30 focus-within:border-indigo-500/50 focus-within:bg-slate-900/50 transition-all duration-300">
                <div className="flex items-end justify-between mb-3">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span> Adobe Title
                    </label>
                    <div className={`flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-md border ${isAdobeOver ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-900/50 border-slate-700/50 text-slate-500'} transition-colors`}>
                        <span className="text-xs font-bold font-mono">
                            {adobeCount}
                        </span>
                    </div>
                </div>
                <div className="relative">
                    <textarea
                    value={metadata?.adobe_title || (isCurrentlyProcessing ? `Generating Adobe title...` : '')}
                    onChange={(e) => onTitleChange(index, 'adobe', e.target.value)}
                    readOnly={!metadata} 
                    className={`w-full h-14 bg-transparent border-none p-0 text-sm resize-none focus:ring-0 transition-colors leading-relaxed font-medium ${
                        isStreaming ? 'animate-pulse text-indigo-400' : 'text-slate-200 placeholder:text-slate-600'
                    } ${!metadata ? 'cursor-default' : 'cursor-text'}`}
                    placeholder="Waiting for analysis..."
                    spellCheck={false}
                    />
                    {metadata?.adobe_title && (
                        <CopyButton 
                            text={metadata.adobe_title} 
                            className="absolute -top-10 right-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover/field:opacity-100 group-focus-within/field:opacity-100" 
                        />
                    )}
                </div>
                </div>

                {/* FREEPIK TITLE FIELD */}
                <div className="relative group/field bg-slate-900/30 p-5 rounded-2xl border border-slate-700/30 hover:border-emerald-500/30 focus-within:border-emerald-500/50 focus-within:bg-slate-900/50 transition-all duration-300">
                <div className="flex items-end justify-between mb-3">
                    <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Freepik Title
                    </label>
                    <div className={`flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-md border ${isFreepikOver ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-900/50 border-slate-700/50 text-slate-500'} transition-colors`}>
                        <span className="text-xs font-bold font-mono">
                            {freepikCount}
                        </span>
                    </div>
                </div>
                <div className="relative">
                    <textarea
                    value={metadata?.freepik_title || (isCurrentlyProcessing ? `Generating Freepik title...` : '')}
                    onChange={(e) => onTitleChange(index, 'freepik', e.target.value)}
                    readOnly={!metadata} 
                    className={`w-full h-14 bg-transparent border-none p-0 text-sm resize-none focus:ring-0 transition-colors leading-relaxed font-medium ${
                        isStreaming ? 'animate-pulse text-emerald-400' : 'text-slate-200 placeholder:text-slate-600'
                    } ${!metadata ? 'cursor-default' : 'cursor-text'}`}
                    placeholder="Waiting for analysis..."
                    spellCheck={false}
                    />
                    {metadata?.freepik_title && (
                        <CopyButton 
                            text={metadata.freepik_title} 
                            className="absolute -top-10 right-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover/field:opacity-100 group-focus-within/field:opacity-100" 
                        />
                    )}
                </div>
                </div>

                {/* INTERACTIVE KEYWORDS FIELD */}
                <div className="relative group/field bg-gradient-to-b from-slate-900/40 to-slate-900/60 p-6 rounded-2xl border border-slate-700/30 hover:border-indigo-500/20 focus-within:border-indigo-500/40 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                            <TagsIcon className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Keywords
                        </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {metadata?.keywords?.length && (
                            <CopyButton 
                                text={metadata.keywords.join(', ')} 
                                label="Copy All"
                                className="text-[9px] font-bold text-slate-500 hover:text-white bg-slate-900 hover:bg-indigo-600 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-indigo-500 transition-all flex items-center gap-1.5 uppercase tracking-wide shadow-sm"
                            />
                        )}
                        <div className="bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800 min-w-[2rem] text-center">
                            <span className="text-xs font-bold text-indigo-300 font-mono">
                                {keywordCount}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Keywords Chips Container */}
                <div className="relative min-h-[100px] flex flex-wrap gap-2 content-start">
                    {metadata ? (
                        <>
                            {keywords.map((keyword, kIndex) => (
                                <div key={kIndex} className="group/tag inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 cursor-default">
                                    <span>{keyword}</span>
                                    <button 
                                        onClick={() => removeKeyword(keyword)}
                                        className="text-slate-500 hover:text-red-400 p-0.5 rounded-md hover:bg-red-500/10 transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            ))}
                            {/* Input for adding new keywords */}
                            <input 
                                type="text"
                                value={newKeywordInput}
                                onChange={(e) => setNewKeywordInput(e.target.value)}
                                onKeyDown={addKeyword}
                                placeholder="+ Add tag"
                                className="inline-flex w-24 px-3 py-1.5 bg-transparent border border-dashed border-slate-700 rounded-lg text-xs text-slate-400 focus:text-white focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:w-32 transition-all placeholder:text-slate-600"
                            />
                        </>
                    ) : (
                        <p className="text-sm text-slate-600 font-mono leading-loose w-full">Keywords generated here...</p>
                    )}
                </div>
                </div>
            </div>
        </div>
        </div>
    </>
  );
};

const FileWorkspace: React.FC<FileWorkspaceProps> = ({ files, onRegenerate, onDelete, onCategoryChange, onTitleChange, onKeywordsChange, currentlyProcessingIndex }) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20 animate-[fadeIn_0.5s_ease-out]">
        <div className="p-6 bg-slate-800/50 rounded-full mb-6">
            <TitleIcon className="w-10 h-10 text-slate-700" />
        </div>
        <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em]">Workspace Empty</h3>
        <p className="text-slate-500 mt-2 text-sm font-medium">Upload images or import CSV to begin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {files.map((fileItem, index) => (
        <FileCard 
            key={index} 
            fileItem={fileItem} 
            index={index}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
            onCategoryChange={onCategoryChange}
            onTitleChange={onTitleChange}
            onKeywordsChange={onKeywordsChange}
            isCurrentlyProcessing={currentlyProcessingIndex === index}
        />
      ))}
    </div>
  );
};

export default FileWorkspace;
