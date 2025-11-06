import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';

const ImageUpload = ({ 
  files, 
  onFilesChange, 
  maxFiles = 4, 
  maxSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setErrors([]);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => ({
        fileName: file.name,
        errors: errors.map(error => error.message)
      }));
      setErrors(newErrors);
    }

    // Handle accepted files
    const newFiles = acceptedFiles.slice(0, maxFiles - files.length);
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize,
    maxFiles
  });

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const previews = files.map((file, index) => (
    <div key={index} className="relative group">
      <img
        src={URL.createObjectURL(file)}
        alt={`Preview ${index + 1}`}
        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
      />
      <button
        type="button"
        onClick={() => removeFile(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  ));

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        } ${
          files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input {...getInputProps()} disabled={files.length >= maxFiles} />
        
        <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Up to {maxFiles} images (max {maxSize / 1024 / 1024}MB each)
            </p>
            <p className="text-sm text-gray-500">
              Supported: JPEG, PNG, GIF, WebP
            </p>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Upload Errors:</h4>
          {errors.map((error, index) => (
            <div key={index} className="text-red-700 text-sm">
              <strong>{error.fileName}:</strong> {error.errors.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div>
          <h4 className="text-gray-700 font-medium mb-3">
            Selected Images ({files.length}/{maxFiles})
          </h4>
          <div className="flex flex-wrap gap-4">
            {previews}
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-gray-700 font-medium mb-2">Files to upload:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaImage className="w-4 h-4 text-gray-400" />
                  <span>{file.name}</span>
                  <span className="text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;