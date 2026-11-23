/**
 * Client-side image compression and clipboard utilities for Question Bank.
 * Resizes large camera photos and screenshots into lightweight, crisp data URLs.
 */

export function compressImageFile(file, maxDimension = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into memory.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas is not supported
          return resolve({
            dataUrl: e.target.result,
            width: img.width,
            height: img.height,
            sizeKb: Math.round(file.size / 1024),
          });
        }

        // Draw image smoothed
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP or JPEG for strong compression with sharp text
        let outputFormat = 'image/jpeg';
        let compressedDataUrl = canvas.toDataURL(outputFormat, quality);

        // Approximate size
        const head = 'data:' + outputFormat + ';base64,';
        const sizeBytes = Math.round(((compressedDataUrl.length - head.length) * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          width,
          height,
          sizeKb: Math.round(sizeBytes / 1024),
          originalSizeKb: Math.round(file.size / 1024),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to extract an image File from clipboard paste event
 */
export function extractImageFromClipboard(event) {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      return items[i].getAsFile();
    }
  }
  return null;
}
