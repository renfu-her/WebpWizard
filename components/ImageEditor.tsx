import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { PixelCrop, AspectRatioOption } from '../types';
import { RotateCw, ZoomIn, Lock, Unlock, Grid, CheckCircle2 } from 'lucide-react';
import { Point } from '../types';

interface ImageEditorProps {
  imageSrc: string;
  onProcessingStart: () => void;
  onCropComplete: (
    pixelCrop: PixelCrop, 
    rotation: number, 
    keepTransparency: boolean,
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
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [selectedAspectLabel, setSelectedAspectLabel] = useState<string>('Free');
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  
  // Settings
  const [keepTransparency, setKeepTransparency] = useState(true);
  const [targetWidth, setTargetWidth] = useState<string>('');
  const [targetHeight, setTargetHeight] = useState<string>('');

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((_: PixelCrop, croppedAreaPixels: PixelCrop) => {
    setCompletedCrop(croppedAreaPixels);
  }, []);

  const handleGenerate = () => {
    if (completedCrop) {
      onProcessingStart();
      // Add a small delay to allow UI to show loading state
      setTimeout(() => {
        onCropComplete(
          completedCrop, 
          rotation, 
          keepTransparency, 
          { 
             width: targetWidth === '' ? '' : Number(targetWidth), 
             height: targetHeight === '' ? '' : Number(targetHeight) 
          }
        );
      }, 100);
    }
  };

  const handleAspectChange = (option: AspectRatioOption) => {
    setSelectedAspectLabel(option.label);
    if (option.value === 'free') {
      setAspect(undefined);
    } else {
      setAspect(option.value as number);
    }
  };

  // Helper to sync dimensions if user inputs one, we could calculate the other, 
  // but for "arbitrary" resize logic requested, we'll let them input whatever or leave blank for auto.

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full max-w-6xl mx-auto">
      {/* Cropper Area */}
      <div className="flex-1 min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl border border-gray-800">
        <div className="absolute inset-0 bg-black/50 pointer-events-none z-10 flex items-center justify-center">
            {/* Grid overlay pattern could go here if needed, but react-easy-crop has one */}
        </div>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
          onRotationChange={setRotation}
          classes={{
            containerClassName: 'bg-gray-950',
            cropAreaClassName: 'border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]',
          }}
        />
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-96 flex flex-col gap-6 p-1">
        
        {/* Aspect Ratio */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block flex items-center gap-2">
            <Grid className="w-4 h-4" /> Aspect Ratio
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
             Adjust
          </label>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3"/> Zoom</span>
              <span>{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => onZoomChange(Number(e.target.value))}
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
              min={0}
              max={360}
              step={1}
              aria-labelledby="Rotation"
              onChange={(e) => setRotation(Number(e.target.value))}
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
                 placeholder={completedCrop ? Math.round(completedCrop.width).toString() : 'Auto'}
                 value={targetWidth}
                 onChange={(e) => setTargetWidth(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs text-gray-400">Target Height (px)</label>
               <input 
                 type="number" 
                 placeholder={completedCrop ? Math.round(completedCrop.height).toString() : 'Auto'}
                 value={targetHeight}
                 onChange={(e) => setTargetHeight(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
               />
             </div>
          </div>
          <p className="text-[10px] text-gray-500">Leave blank to use crop dimensions.</p>

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
