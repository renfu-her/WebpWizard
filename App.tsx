import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageEditor from './components/ImageEditor';
import ResultGallery from './components/ResultGallery';
import { resizeImage, createImage } from './utils/canvasUtils';
import { GeneratedImages } from './types';
import { Wand2, Loader2, ImagePlus } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'crop' | 'result'>('upload');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<GeneratedImages | null>(null);

  const handleImageSelected = (src: string) => {
    setImageSrc(src);
    setStep('crop');
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  const handleCropComplete = async (
    croppedBase64: string,
    forcedSize: { width: number | ''; height: number | '' }
  ) => {
    try {
      if (!imageSrc) return;

      // 1. Process Original (Cropped)
      // Determine actual dimensions of the crop result
      const img = await createImage(croppedBase64);
      let baseWidth = img.width;
      let baseHeight = img.height;
      let baseImage = croppedBase64;

      // If user provided a forced size (target width/height), resize base image
      const hasForcedWidth = forcedSize.width !== '';
      const hasForcedHeight = forcedSize.height !== '';

      if (hasForcedWidth || hasForcedHeight) {
         // Calculate aspect ratio of the crop
         const aspectRatio = baseWidth / baseHeight;
         
         let finalWidth = baseWidth;
         let finalHeight = baseHeight;

         if (hasForcedWidth && hasForcedHeight) {
            // User forced both - strict resize
            finalWidth = Number(forcedSize.width);
            finalHeight = Number(forcedSize.height);
         } else if (hasForcedWidth) {
            finalWidth = Number(forcedSize.width);
            finalHeight = finalWidth / aspectRatio;
         } else if (hasForcedHeight) {
            finalHeight = Number(forcedSize.height);
            finalWidth = finalHeight * aspectRatio;
         }

         // Use the simpler resizeImage which just resizes what it gets
         baseImage = await resizeImage(croppedBase64, finalWidth, finalHeight);
         baseWidth = finalWidth;
         baseHeight = finalHeight;
      }

      // 2. Generate Small (50%)
      const smallWidth = Math.max(1, Math.floor(baseWidth * 0.5));
      const smallHeight = Math.max(1, Math.floor(baseHeight * 0.5));
      const smallImage = await resizeImage(baseImage, smallWidth, smallHeight);

      // 3. Generate Large (200%)
      const largeWidth = Math.floor(baseWidth * 2);
      const largeHeight = Math.floor(baseHeight * 2);
      const largeImage = await resizeImage(baseImage, largeWidth, largeHeight);

      setResults({
        original: baseImage,
        small: smallImage,
        large: largeImage,
        originalSize: { width: baseWidth, height: baseHeight },
        smallSize: { width: smallWidth, height: smallHeight },
        largeSize: { width: largeWidth, height: largeHeight }
      });
      
      setStep('result');
    } catch (e) {
      console.error(e);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setResults(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              WebP<span className="text-indigo-400">Wizard</span>
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            High Performance Image Processor
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
             <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-4">
                  Transform Your Images
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Crop, resize, and convert your photos to ultra-efficient WebP format instantly in your browser. No server uploads, 100% private.
                </p>
             </div>
             <div className="w-full max-w-xl">
               <ImageUploader onImageSelected={handleImageSelected} />
             </div>
             
             {/* Features Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center w-full max-w-4xl">
               <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <ImagePlus className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white">Smart Resizing</h3>
                  <p className="text-sm text-gray-500 mt-1">Scale your images to any dimension while maintaining quality.</p>
               </div>
               <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="w-8 h-8 mx-auto mb-3 text-indigo-400 font-bold text-xl">50%</div>
                  <h3 className="font-semibold text-white">Auto Variations</h3>
                  <p className="text-sm text-gray-500 mt-1">Automatically generates thumbnails and upscaled versions.</p>
               </div>
               <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="w-8 h-8 mx-auto mb-3 text-indigo-400 font-bold text-xl">.webp</div>
                  <h3 className="font-semibold text-white">Modern Format</h3>
                  <p className="text-sm text-gray-500 mt-1">Convert instantly to WebP for faster loading websites.</p>
               </div>
             </div>
          </div>
        )}

        {step === 'crop' && imageSrc && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Image</h2>
              <button 
                onClick={handleReset} 
                className="text-sm text-gray-400 hover:text-white transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
            
            <div className="relative">
               <ImageEditor 
                  imageSrc={imageSrc} 
                  onProcessingStart={handleProcessingStart}
                  onCropComplete={handleCropComplete} 
               />
               
               {isProcessing && (
                 <div className="absolute inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white">Processing...</h3>
                    <p className="text-gray-400">Optimizing and generating sizes</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {step === 'result' && results && (
          <ResultGallery images={results} onReset={handleReset} />
        )}

      </main>
    </div>
  );
};

export default App;