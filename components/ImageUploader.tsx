import React, { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      onImageSelected(imageDataUrl);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const imageDataUrl = await readFile(file);
      onImageSelected(imageDataUrl);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer group ${
        isDragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="bg-gray-700 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
        <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-400' : 'text-gray-400'}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">Upload Image</h3>
      <p className="text-gray-400 text-center max-w-sm">
        Drag & drop your image here, or click to browse. <br />
        <span className="text-sm text-gray-500 mt-1 block">Supports JPG, PNG, WEBP</span>
      </p>
    </div>
  );
};

export default ImageUploader;
