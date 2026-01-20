
export type Marketplace = 'adobe' | 'freepik';
export type APIProvider = 'google' | 'groq';
export type ContentType = 'photo' | 'transparent';

export interface UploadedFile {
  file: File;
  base64: string;
  mimeType: string;
}

export interface MetaData {
  title?: string;
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
  lastProviderUsed?: APIProvider;
}

export interface ControlSettings {
    titleLength: number;
    keywordsCount: number;
    provider: APIProvider;
    marketplace: Marketplace;
    contentType: ContentType;
    groqModel: string;
}
