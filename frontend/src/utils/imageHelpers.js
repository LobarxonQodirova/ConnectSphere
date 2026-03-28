/**
 * Utility functions for client-side image handling.
 */

/**
 * Resize an image file on the client before uploading.
 * Returns a new File object.
 *
 * @param {File} file - Original image file.
 * @param {number} maxWidth - Maximum width in pixels.
 * @param {number} maxHeight - Maximum height in pixels.
 * @param {number} quality - JPEG quality (0-1).
 * @returns {Promise<File>}
 */
export async function resizeImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width <= maxWidth && height <= maxHeight) {
        resolve(file);
        return;
      }

      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          const resizedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Generate a data URL thumbnail from a video file.
 *
 * @param {File} videoFile
 * @param {number} seekTo - Time in seconds to capture the frame.
 * @returns {Promise<string>} Data URL of the thumbnail.
 */
export function generateVideoThumbnail(videoFile, seekTo = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekTo, video.duration);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    };
  });
}

/**
 * Validate that a file is an allowed image type and within size limits.
 *
 * @param {File} file
 * @param {number} maxSizeBytes - Maximum file size in bytes.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateImageFile(file, maxSizeBytes = 5 * 1024 * 1024) {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum: ${maxMB} MB.`,
    };
  }

  return { valid: true, error: null };
}
