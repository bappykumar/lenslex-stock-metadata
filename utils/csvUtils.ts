
import { FileWithMetadata } from '../types';

// Helper to parse a single CSV line handling quotes
const parseCSVLine = (text: string, separator: string): string[] => {
  const result: string[] = [];
  let curVal = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (inQuote) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          curVal += '"'; // Handle escaped quotes
          i++;
        } else {
          inQuote = false;
        }
      } else {
        curVal += char;
      }
    } else {
      if (char === '"') {
        inQuote = true;
      } else if (char === separator) {
        result.push(curVal);
        curVal = '';
      } else {
        curVal += char;
      }
    }
  }
  result.push(curVal);
  return result;
};

export const parseCSVImport = async (file: File): Promise<FileWithMetadata[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return resolve([]);

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) return resolve([]); // Header only or empty

      // Detect separator based on header
      const header = lines[0];
      const isFreepik = header.includes(';');
      const separator = isFreepik ? ';' : ',';

      const parsedFiles: FileWithMetadata[] = [];

      // Skip header (i=1)
      for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i], separator);
        
        // Basic validation depending on format
        // Adobe: Filename, Title, Keywords, Category (4 cols)
        // Freepik: Filename, Title, Keywords (3 cols)
        
        if (columns.length < 3) continue;

        let filename = columns[0].trim();
        let title = columns[1].trim();
        let keywordsRaw = columns[2].trim();
        let category = columns.length > 3 ? columns[3].trim() : "";

        // Remove quotes if parser missed them or double clean
        filename = filename.replace(/^"|"$/g, '');
        title = title.replace(/^"|"$/g, '');
        keywordsRaw = keywordsRaw.replace(/^"|"$/g, '');
        category = category.replace(/^"|"$/g, '');

        const keywords = keywordsRaw.split(',').map(k => k.trim()).filter(k => k);

        // Create a Mock File Object since we don't have the real file
        // We use a special flag in FileWithMetadata to indicate it's CSV-only
        const mockFile = {
            name: filename,
            type: 'text/csv-placeholder', // Custom type to detect in UI
            size: 0,
            lastModified: Date.now()
        } as unknown as File;

        parsedFiles.push({
            fileInfo: {
                file: mockFile,
                base64: '', // No image data
                mimeType: 'image/placeholder'
            },
            metadata: {
                // Map title ONLY to the relevant field
                adobe_title: isFreepik ? '' : title,
                freepik_title: isFreepik ? title : '',
                keywords,
                category
            },
            isStreaming: false
        });
      }
      resolve(parsedFiles);
    };
    reader.onerror = () => reject(new Error("Failed to read CSV file"));
    reader.readAsText(file);
  });
};
