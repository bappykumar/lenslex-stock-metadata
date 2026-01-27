
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ControlsPanel from './components/ControlsPanel';
import StatusDashboard from './components/StatusDashboard';
import FileWorkspace from './components/FileWorkspace';
import { UploadedFile, FileWithMetadata, ControlSettings } from './types';
import { compressImage } from './utils/fileUtils';
import { parseCSVImport } from './utils/csvUtils';
import { extractMetadataStream } from './services/geminiService';
// @ts-ignore
import JSZip from 'jszip';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileWithMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
  const [currentlyProcessingIndex, setCurrentlyProcessingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage or default
  const [settings, setSettings] = useState<ControlSettings>(() => {
    const saved = localStorage.getItem('lenslex_settings');
    const defaultSettings: ControlSettings = {
      adobeTitleLength: 120, 
      freepikTitleLength: 100,
      keywordsCount: 46,
      contentType: 'photo',
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // clean up old keys if they exist in localstorage
        const { provider, groqModel, isAI, aiModel, marketplace, titleLength, ...cleanSettings } = parsed;
        
        // Ensure new keys exist if loading old config
        return { 
            ...defaultSettings, 
            ...cleanSettings,
            adobeTitleLength: cleanSettings.adobeTitleLength || 120,
            freepikTitleLength: cleanSettings.freepikTitleLength || 100
        };
      } catch (e) {
        console.error("Failed to parse settings", e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lenslex_settings', JSON.stringify(settings));
  }, [settings]);

  const handleFileSelect = async (files: File[]) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const newFiles: UploadedFile[] = [];
      const total = files.length;
      
      for (let i = 0; i < total; i++) {
        const file = files[i];
        try {
            const { base64, mimeType } = await compressImage(file);
            newFiles.push({ file, base64, mimeType });
        } catch (e) {
            console.error(`Failed to read file ${file.name}`, e);
        }
        setUploadProgress(Math.round(((i + 1) / total) * 100));
        await new Promise(r => setTimeout(r, 10));
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setProcessedFiles(prev => [...prev, ...newFiles.map(fileInfo => ({ fileInfo }))]);
    } catch (err) {
      setError('Error reading files.');
    } finally {
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCsvImport = async (file: File) => {
      setIsUploading(true);
      setError(null);
      try {
          const importedData = await parseCSVImport(file);
          if (importedData.length === 0) {
              setError("No valid data found in CSV.");
          } else {
              setProcessedFiles(prev => [...prev, ...importedData]);
              const dummyUploads = importedData.map(d => d.fileInfo);
              setUploadedFiles(prev => [...prev, ...dummyUploads]);
          }
      } catch (e) {
          setError("Failed to parse CSV file.");
      } finally {
          setIsUploading(false);
      }
  };

  const processSingleFile = async (index: number) => {
    const fileInfo = uploadedFiles[index];
    if (!fileInfo || !fileInfo.base64) {
        return; 
    }

    setProcessedFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { 
        ...newFiles[index], 
        metadata: undefined, 
        error: undefined, 
        isStreaming: true
      };
      return newFiles;
    });

    try {
      const metadata = await extractMetadataStream(fileInfo, settings, (partial) => {
        // Just triggers UI update, actual data is set at end for cleaner stream
        if (partial.adobe_title) {
            setProcessedFiles(prev => {
                const newFiles = [...prev];
                // Only initialize if not already set, to show "Analyzing"
                if (!newFiles[index].metadata) {
                    newFiles[index] = {
                        ...newFiles[index],
                        metadata: { 
                            adobe_title: "Analyzing...", 
                            freepik_title: "Analyzing...",
                            keywords: [], 
                            category: ""
                        }
                    };
                }
                return newFiles;
            });
        }
      });

      setProcessedFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], metadata, isStreaming: false };
        return newFiles;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setProcessedFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], error: errorMessage, isStreaming: false };
        return newFiles;
      });
    }
  };

  const handleProcessFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    for (let i = 0; i < uploadedFiles.length; i++) {
        if (processedFiles[i]?.metadata) continue;
        if (!uploadedFiles[i].base64) continue;

        setCurrentlyProcessingIndex(i);
        await processSingleFile(i);
        
        if (i < uploadedFiles.length - 1) {
             await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    setCurrentlyProcessingIndex(null);
    setIsProcessing(false);
  };

  const handleRetryFailed = async () => {
    setIsProcessing(true);
    setError(null);

    const failedIndices = processedFiles
      .map((file, index) => (file.error ? index : -1))
      .filter(index => index !== -1);
    
    for (let j = 0; j < failedIndices.length; j++) {
        const i = failedIndices[j];
        if (!uploadedFiles[i].base64) continue;

        setCurrentlyProcessingIndex(i);
        await processSingleFile(i);
        
        if (j < failedIndices.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    setCurrentlyProcessingIndex(null);
    setIsProcessing(false);
  };
  
  const handleRegenerateFile = async (index: number) => {
    if (!uploadedFiles[index].base64) return;
    setCurrentlyProcessingIndex(index);
    await processSingleFile(index);
    setCurrentlyProcessingIndex(null);
  };

  const handleDeleteFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setProcessedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index: number, newCategory: string) => {
    setProcessedFiles(prev => {
        const newFiles = [...prev];
        const currentFile = newFiles[index];
        if (currentFile && currentFile.metadata) {
            newFiles[index] = {
                ...currentFile,
                metadata: {
                    ...currentFile.metadata,
                    category: newCategory
                }
            };
        }
        return newFiles;
    });
  };

  const handleTitleChange = (index: number, type: 'adobe' | 'freepik', newTitle: string) => {
    setProcessedFiles(prev => {
        const newFiles = [...prev];
        const currentFile = newFiles[index];
        if (currentFile && currentFile.metadata) {
            const updatedMetadata = { ...currentFile.metadata };
            if (type === 'adobe') updatedMetadata.adobe_title = newTitle;
            if (type === 'freepik') updatedMetadata.freepik_title = newTitle;
            
            newFiles[index] = {
                ...currentFile,
                metadata: updatedMetadata
            };
        }
        return newFiles;
    });
  };

  const handleKeywordsChange = (index: number, newKeywordsString: string) => {
      const newKeywords = newKeywordsString.split(',').map(k => k.trim()).filter(k => k !== "");
      setProcessedFiles(prev => {
        const newFiles = [...prev];
        const currentFile = newFiles[index];
        if (currentFile && currentFile.metadata) {
            newFiles[index] = {
                ...currentFile,
                metadata: {
                    ...currentFile.metadata,
                    keywords: newKeywords
                }
            };
        }
        return newFiles;
    });
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setProcessedFiles([]);
    setError(null);
  };

  const downloadBlob = (content: string, prefix: string) => {
      const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // 12-Hour Time Format
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(now.getMinutes()).padStart(2, '0');
      const secondsStr = String(now.getSeconds()).padStart(2, '0');
      
      const timeStr = `${hoursStr}-${minutesStr}-${secondsStr}${ampm}`;
      
      link.download = `${prefix}_CSV_${dateStr}_${timeStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const generateCSVContent = (type: 'adobe' | 'freepik') => {
      const filesWithMetadata = processedFiles.filter(f => f.metadata);
      if (filesWithMetadata.length === 0) return null;

      const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

      if (type === 'freepik') {
        const headers = ["File name", "Title", "Keywords"];
        const rows = filesWithMetadata.map(item => {
            const filename = item.fileInfo.file.name;
            const title = item.metadata!.freepik_title || item.metadata!.adobe_title || ""; 
            const keywords = (item.metadata!.keywords || []).join(', '); 
            
            return [
                escape(filename),
                escape(title),
                escape(keywords)
            ].join(';');
        });
        return [headers.join(';'), ...rows].join('\n');
    } else {
        const headers = ["Filename", "Title", "Keywords", "Category"];
        const rows = filesWithMetadata.map(item => {
            const filename = item.fileInfo.file.name;
            const title = item.metadata!.adobe_title || item.metadata!.freepik_title || ""; 
            const keywords = (item.metadata!.keywords || []).join(', ');
            const category = item.metadata!.category || "1";
            
            return [
                escape(filename), 
                escape(title), 
                escape(keywords), 
                escape(category)
            ].join(',');
        });
        return [headers.join(','), ...rows].join('\n');
    }
  };

  const handleExportCSV = async (type: 'adobe' | 'freepik' | 'both') => {
    if (type === 'both') {
        // Zip Logic to avoid multiple download permission prompt
        const adobeContent = generateCSVContent('adobe');
        const freepikContent = generateCSVContent('freepik');
        
        if (!adobeContent && !freepikContent) return;

        const zip = new JSZip();
        
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        // 12-Hour Time Format
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const timeStr = `${String(hours).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}${ampm}`;

        if (adobeContent) zip.file(`Adobe_CSV_${dateStr}_${timeStr}.csv`, "\uFEFF" + adobeContent);
        if (freepikContent) zip.file(`Freepik_CSV_${dateStr}_${timeStr}.csv`, "\uFEFF" + freepikContent);

        try {
            const zipContent = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipContent);
            const link = document.createElement("a");
            link.href = url;
            link.download = `LensLex_Export_${dateStr}_${timeStr}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to create zip", e);
            // Fallback to individual if zip fails (unlikely)
            if (adobeContent) downloadBlob(adobeContent, 'Adobe');
            if (freepikContent) downloadBlob(freepikContent, 'Freepik');
        }

    } else {
        const content = generateCSVContent(type);
        if (content) downloadBlob(content, type === 'adobe' ? 'Adobe' : 'Freepik');
    }
  };

  const completedCount = processedFiles.filter(f => f.metadata).length;
  const failedCount = processedFiles.filter(f => f.error).length;
  
  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes scan {
            0% { top: -10%; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { top: 110%; opacity: 0; }
        }
      `}</style>
      <Header 
        settings={settings} 
        onSettingsChange={setSettings} 
      />
      
      {/* 2-Column Split Layout */}
      <main className="flex-grow container mx-auto p-4 md:p-6 max-w-[1920px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Controls Only (Span 4 = 1/3) */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-6 sticky top-24 z-30">
                <ControlsPanel
                    onFilesSelect={handleFileSelect}
                    onCsvSelect={handleCsvImport}
                    onProcess={handleProcessFiles}
                    onClearAll={handleClearAll}
                    onExportCSV={handleExportCSV}
                    onRetryFailed={handleRetryFailed}
                    isProcessing={isProcessing}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    hasFiles={uploadedFiles.length > 0}
                    hasProcessedFiles={processedFiles.some(f => f.metadata)}
                    failedCount={failedCount}
                    settings={settings}
                    onSettingsChange={setSettings}
                />
            </aside>

            {/* Right Workspace: Status & Generated Files (Span 8 = 2/3) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                <StatusDashboard 
                    total={uploadedFiles.length}
                    completed={completedCount}
                    failed={failedCount}
                    isProcessing={isProcessing}
                />

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl backdrop-blur-sm font-bold text-center animate-pulse">{error}</div>}
                
                <FileWorkspace 
                    files={processedFiles}
                    onRegenerate={handleRegenerateFile}
                    onDelete={handleDeleteFile}
                    onCategoryChange={handleCategoryChange}
                    onTitleChange={handleTitleChange}
                    onKeywordsChange={handleKeywordsChange}
                    currentlyProcessingIndex={currentlyProcessingIndex}
                />
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
