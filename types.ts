
export type Marketplace = 'adobe' | 'freepik';
export type ContentType = 'photo' | 'transparent';

export interface UploadedFile {
  file: File;
  base64: string;
  mimeType: string;
}

export interface MetaData {
  adobe_title?: string;    // Stored Adobe version
  freepik_title?: string;  // Stored Freepik version
  description?: string;
  keywords?: string[];
  category?: string;
  [key: string]: any;
}

export interface FileWithMetadata {
  fileInfo: UploadedFile;
  metadata?: MetaData;
  error?: string;
  isStreaming?: boolean;
  lastProviderUsed?: string;
}

export interface ControlSettings {
    adobeTitleLength: number;   // Adjustable length for Adobe
    freepikTitleLength: number; // Adjustable length for Freepik
    keywordsCount: number;
    contentType: ContentType;
}
