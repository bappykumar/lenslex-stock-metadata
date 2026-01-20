
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Return only the base64 part, without the data URL prefix
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const compressImage = (file: File, maxWidth = 1024, quality = 0.7): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        // If not an image (e.g. video), fallback to original base64
        if (!file.type.startsWith('image/')) {
             fileToBase64(file).then(b64 => resolve({ base64: b64, mimeType: file.type })).catch(reject);
             return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize logic: Keep aspect ratio but limit max dimension
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width *= maxWidth / height;
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with quality reduction (0.7 is good balance)
                // This drastically reduces base64 size
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, mimeType: 'image/jpeg' });
            };
            img.onerror = (e) => reject(new Error("Failed to load image for compression"));
        };
        reader.onerror = (e) => reject(new Error("Failed to read file for compression"));
    });
};
