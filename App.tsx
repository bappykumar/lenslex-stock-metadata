
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ControlsPanel from './components/ControlsPanel';
import StatusDashboard from './components/StatusDashboard';
import FileWorkspace from './components/FileWorkspace';
import ApiKeyModal from './components/ApiKeyModal';
import { UploadedFile, FileWithMetadata, ControlSettings } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { extractMetadataStream } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileWithMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyProcessingIndex, setCurrentlyProcessingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load settings from localStorage or default
  const [settings, setSettings] = useState<ControlSettings>(() => {
    const saved = localStorage.getItem('lenslex_settings');
    const defaultSettings: ControlSettings = {
      titleLength: 120,
      keywordsCount: 46,
      provider: 'google', // Default to Google as it is the most stable free option
      marketplace: 'adobe',
      contentType: 'photo',
      groqKey: '',
      googleKey: '',
      groqModel: 'llama-3.2-11b-vision-preview', 
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // RECOVERY FIX:
        // If the user was using Groq (which is broken/retired), force switch them to Google Gemini
        if (parsed.provider === 'groq') {
            parsed.provider = 'google';
        }

        // Fix decommissioned Groq models if they are still selected
        if (parsed.groqModel === 'llama-3.2-90b-vision-preview') {
            parsed.groqModel = 'llama-3.2-11b-vision-preview';
        }
        
        return { ...defaultSettings, ...parsed };
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
    try {
      const filePromises = files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return { file, base64, mimeType: file.type };
      });
      const newFiles = await Promise.all(filePromises);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setProcessedFiles(prev => [...prev, ...newFiles.map(fileInfo => ({ fileInfo }))]);
    } catch (err) {
      setError('Error reading files.');
    }
  };

  const processSingleFile = async (index: number) => {
    const fileInfo = uploadedFiles[index];
    if (!fileInfo) return;

    setProcessedFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { 
        ...newFiles[index], 
        metadata: undefined, 
        error: undefined, 
        isStreaming: true,
        lastProviderUsed: settings.provider
      };
      return newFiles;
    });

    try {
      const metadata = await extractMetadataStream(fileInfo, settings, (partial) => {
        // Status updates can be handled here
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
    
    // Validate Keys before starting (Checking trimmed values)
    if (settings.provider === 'google' && !settings.googleKey?.trim()) {
        setIsSettingsOpen(true);
        setError("Please enter your Gemini API Key in the settings.");
        return;
    }
    if (settings.provider === 'groq' && !settings.groqKey?.trim()) {
        setIsSettingsOpen(true);
        setError("Please enter your Groq API Key in the settings.");
        return;
    }

    setIsProcessing(true);
    setError(null);
    
    for (let i = 0; i < uploadedFiles.length; i++) {
        // Skip already successfully processed files
        if (processedFiles[i]?.metadata) continue;
        
        setCurrentlyProcessingIndex(i);
        await processSingleFile(i);
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
    
    for (const i of failedIndices) {
        setCurrentlyProcessingIndex(i);
        await processSingleFile(i);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentlyProcessingIndex(null);
    setIsProcessing(false);
  };
  
  const handleRegenerateFile = async (index: number) => {
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

  const handleClearAll = () => {
    setUploadedFiles([]);
    setProcessedFiles([]);
    setError(null);
  };

  const handleExportCSV = () => {
    const filesWithMetadata = processedFiles.filter(f => f.metadata);
    if (filesWithMetadata.length === 0) return;

    let headers: string[] = [];
    let rows: string[] = [];

    const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

    if (settings.marketplace === 'freepik') {
        headers = ["file", "description", "keywords"];
        rows = filesWithMetadata.map(item => {
            const filename = item.fileInfo.file.name;
            const title = item.metadata!.title || "";
            const keywords = (item.metadata!.keywords || []).join(', '); 
            
            return [
                escape(filename),
                escape(title),
                escape(keywords)
            ].join(',');
        });
    } else {
        headers = ["Filename", "Title", "Keywords", "Category"];
        rows = filesWithMetadata.map(item => {
            const filename = item.fileInfo.file.name;
            const title = item.metadata!.title || "";
            const keywords = (item.metadata!.keywords || []).join(', ');
            const category = item.metadata!.category || "1";
            
            return [
                escape(filename), 
                escape(title), 
                escape(keywords), 
                escape(category)
            ].join(',');
        });
    }

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lenslex_${settings.marketplace}_${new Date().getTime()}.csv`;
    link.click();
  };

  const completedCount = processedFiles.filter(f => f.metadata).length;
  const failedCount = processedFiles.filter(f => f.error).length;
  
  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-slate-200">
      <Header 
        settings={settings} 
        onSettingsChange={setSettings} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <ApiKeyModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <main className="flex-grow container mx-auto p-4 md:p-10 max-w-7xl">
        <div className="space-y-8">
          <ControlsPanel
            onFilesSelect={handleFileSelect}
            onProcess={handleProcessFiles}
            onClearAll={handleClearAll}
            onExportCSV={handleExportCSV}
            onRetryFailed={handleRetryFailed}
            isProcessing={isProcessing}
            hasFiles={uploadedFiles.length > 0}
            hasProcessedFiles={processedFiles.some(f => f.metadata)}
            failedCount={failedCount}
            settings={settings}
            onSettingsChange={setSettings}
          />
          
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
            currentlyProcessingIndex={currentlyProcessingIndex}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
