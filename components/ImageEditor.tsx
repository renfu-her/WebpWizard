import React, { useState, useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { AspectRatioOption } from '../types';
import { RotateCw, ZoomIn, Grid, CheckCircle2, RotateCcw } from 'lucide-react';

interface ImageEditorProps {
  imageSrc: string;
  onProcessingStart: () => void;
  onCropComplete: (
    croppedBase64: string,
    forcedSize: { width: number | ''; height: number | '' }
  ) => void;
}

const aspectRatios: AspectRatioOption[] = [
  { label: 'Free', value: 'free' },
  { label: '1:1 (Square)', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '9:16', value: 9 / 16 },
];

const ImageEditor: React.FC<ImageEditorProps> = ({
  imageSrc,
  onProcessingStart,
  onCropComplete,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  
  // Settings
  const [selectedAspectLabel, setSelectedAspectLabel] = useState<string>('Free');
  const [keepTransparency, setKeepTransparency] = useState(true);
  const [targetWidth, setTargetWidth] = useState<string>('');
  const [targetHeight, setTargetHeight] = useState<string>('');
  
  // UI State for sliders (just for visual feedback/control)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleAspectChange = (option: AspectRatioOption) => {
    setSelectedAspectLabel(option.label);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      if (option.value === 'free') {
        cropper.setAspectRatio(NaN);
      } else {
        cropper.setAspectRatio(option.value as number);
      }
    }
  };

  const handleRotate = (val: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotateTo(val);
      setRotation(val);
    }
  };

  const handleZoom = (val: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.zoomTo(val);
      setZoomLevel(val);
    }
  };
  
  const handleReset = () => {
     const cropper = cropperRef.current?.cropper;
     if(cropper) {
         cropper.reset();
         setRotation(0);
         setZoomLevel(1);
         cropper.setAspectRatio(NaN);
         setSelectedAspectLabel('Free');
     }
  };

  const handleGenerate = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      onProcessingStart();
      
      // Delay slightly to let UI update
      setTimeout(() => {
        // Get the cropped canvas
        // If transparency is OFF, we need to fill the background
        const canvas = cropper.getCroppedCanvas({
          fillColor: keepTransparency ? 'transparent' : '#ffffff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });

        if (canvas) {
          const base64 = canvas.toDataURL('image/webp', 0.9);
          onCropComplete(
            base64,
            { 
               width: targetWidth === '' ? '' : Number(targetWidth), 
               height: targetHeight === '' ? '' : Number(targetHeight) 
            }
          );
        }
      }, 100);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full max-w-6xl mx-auto">
      {/* Cropper Area */}
      <div className="flex-1 min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl border border-gray-800 flex flex-col">
        <Cropper
          src={imageSrc}
          style={{ height: '100%', minHeight: '500px', width: '100%' }}
          initialAspectRatio={NaN} // Default to Free
          aspectRatio={NaN}
          guides={true}
          viewMode={1} // Restrict crop box to canvas
          dragMode="move"
          ref={cropperRef}
          background={false} // We handle bg in CSS
          autoCropArea={0.8}
          className="flex-1"
        />
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-96 flex flex-col gap-6 p-1">
        
        {/* Aspect Ratio */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Grid className="w-4 h-4" /> Mask Shape</span>
            <button onClick={handleReset} className="text-indigo-400 hover:text-white text-[10px] flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.label}
                onClick={() => handleAspectChange(ratio)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAspectLabel === ratio.label
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transforms */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 space-y-4">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block flex items-center gap-2">
             Adjust Image
          </label>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3"/> Zoom</span>
              <span>{zoomLevel.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              value={zoomLevel}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(e) => handleZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><RotateCw className="w-3 h-3"/> Rotate</span>
              <span>{rotation}°</span>
            </div>
            <input
              type="range"
              value={rotation}
              min={-180}
              max={180}
              step={1}
              onChange={(e) => handleRotate(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Output Config */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 space-y-4">
           <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
             Output Settings
          </label>

          {/* Resize Inputs */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
               <label className="text-xs text-gray-400">Target Width (px)</label>
               <input 
                 type="number" 
                 placeholder="Auto"
                 value={targetWidth}
                 onChange={(e) => setTargetWidth(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs text-gray-400">Target Height (px)</label>
               <input 
                 type="number" 
                 placeholder="Auto"
                 value={targetHeight}
                 onChange={(e) => setTargetHeight(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
               />
             </div>
          </div>
          <p className="text-[10px] text-gray-500">Force the final output size (optional).</p>

          {/* Transparency Toggle */}
          <div 
            onClick={() => setKeepTransparency(!keepTransparency)}
            className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all ${
              keepTransparency 
                ? 'bg-indigo-900/30 border-indigo-500/50' 
                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
              keepTransparency ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'
            }`}>
              {keepTransparency && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-200 block">Preserve Transparency</span>
              <span className="text-xs text-gray-500 block">If off, background becomes white.</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/20 transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
           Generate WebP Images
        </button>

      </div>
    </div>
  );
};

export default ImageEditor;