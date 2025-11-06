import cloudinary from '../config/cloudinary.js';
import stream from 'stream';

const uploadToCloudinary = (fileBuffer, folder = 'lostbuddy') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create a readable stream from buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

const uploadMultipleImages = async (files, folder = 'lostbuddy') => {
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.buffer, folder)
  );
  
  return Promise.all(uploadPromises);
};

// Validate image file
const validateImageFile = (file) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size too large: ${file.size} bytes. Maximum size: ${maxSize} bytes`);
  }

  return true;
};

// Process and optimize image before upload
const processImage = async (fileBuffer) => {
  // This is a placeholder for image processing logic
  // In a real implementation, you might use sharp or other libraries
  // to resize, compress, or apply filters to images before upload
  
  // For now, we'll just return the original buffer
  // but you could add image optimization here
  return fileBuffer;
};

// Get image dimensions from Cloudinary response
const getImageDimensions = (cloudinaryResult) => {
  return {
    width: cloudinaryResult.width,
    height: cloudinaryResult.height,
    format: cloudinaryResult.format,
    size: cloudinaryResult.bytes
  };
};

// Generate thumbnail URL
const generateThumbnailUrl = (cloudinaryUrl, width = 200, height = 200) => {
  if (!cloudinaryUrl) return null;
  
  // Extract public ID from Cloudinary URL
  const urlParts = cloudinaryUrl.split('/upload/');
  if (urlParts.length !== 2) return cloudinaryUrl;
  
  // Insert thumbnail transformation
  return `${urlParts[0]}/upload/w_${width},h_${height},c_fill/${urlParts[1]}`;
};

export {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleImages,
  validateImageFile,
  processImage,
  getImageDimensions,
  generateThumbnailUrl
};