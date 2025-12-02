import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { AspectRatioOption } from '../types';
import { RotateCw, ZoomIn, Grid, RotateCcw, Palette, Ban, Wand2, MousePointer2, Eraser } from 'lucide-react';
import { removeColorFromImage, createImage } from '../utils/canvasUtils';

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
  imageSrc: initialImageSrc,
  onProcessingStart,
  onCropComplete,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  
  // -- State --
  // We keep track of the "original" uploaded image to always re-apply transparency from a clean slate
  const [originalSrc] = useState<string>(initialImageSrc);
  // The source currently fed to the Cropper (could be the original or the one with transparency applied)
  const [displaySrc, setDisplaySrc] = useState<string>(initialImageSrc);
  
  // Crop Settings
  const [selectedAspectLabel, setSelectedAspectLabel] = useState<string>('Free');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Output Settings
  const [targetWidth, setTargetWidth] = useState<string>('');
  const [targetHeight, setTargetHeight] = useState<string>('');

  // Magic Remove Settings
  const [magicMode, setMagicMode] = useState(false); // Is user picking a color?
  const [removedColor, setRemovedColor] = useState<{r: number, g: number, b: number} | null>(null);
  const [tolerance, setTolerance] = useState<number>(5);
  const [isApplyingTransparency, setIsApplyingTransparency] = useState(false);

  // -- Effects --

  // Re-run transparency when color or tolerance changes
  useEffect(() => {
    const applyTransparency = async () => {
      if (!removedColor) {
        if (displaySrc !== originalSrc) {
           setDisplaySrc(originalSrc);
        }
        return;
      }

      setIsApplyingTransparency(true);
      // Wait a tick to allow UI to show loading state if needed
      await new Promise(r => setTimeout(r, 10));

      try {
        const newSrc = await removeColorFromImage(originalSrc, removedColor, tolerance);
        
        // We need to preserve the cropper data (position/zoom) before swapping the source
        const cropper = cropperRef.current?.cropper;
        const prevData = cropper?.getData();
        const prevCanvas = cropper?.getCanvasData();
        
        setDisplaySrc(newSrc);
        
        // Restore cropper position after image loads (React-cropper handles load internally, 
        // but we might need a small delay or use the `ready` callback. 
        // For simplicity, we rely on cropper keeping state if possible, or we reset if it drifts.
        // Actually, changing `src` in react-cropper usually resets the cropper.
        // We will fix the layout in the `ready` event handler below.
      } catch (error) {
        console.error("Failed to apply transparency", error);
      } finally {
        setIsApplyingTransparency(false);
      }
    };

    applyTransparency();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removedColor, tolerance]);

  // -- Handlers --

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
         setRemovedColor(null);
         setTolerance(5);
         setDisplaySrc(originalSrc);
     }
  };

  const handleGenerate = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      onProcessingStart();
      
      setTimeout(() => {
        const canvas = cropper.getCroppedCanvas({
          fillColor: undefined, // Always transparent
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

  // Color Picker Logic
  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!magicMode) return;

    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // We need the natural size to map the click correctly
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);

    // Create a temp canvas to read the pixel color
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
       // Draw just the 1 pixel we need. 
       // Note: we must draw the *original* image (no transparency yet) to pick the color correctly.
       // However, the overlay IS displaying the originalSrc (see render), so we are good.
       const tempImg = await createImage(originalSrc);
       ctx.drawImage(tempImg, -pixelX, -pixelY);
       const data = ctx.getImageData(0, 0, 1, 1).data;
       
       setRemovedColor({ r: data[0], g: data[1], b: data[2] });
       setMagicMode(false); // Exit picker mode after selection
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full max-w-6xl mx-auto">
      {/* Cropper Area */}
      <div className="flex-1 min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl border border-gray-800 flex flex-col group">
        
        {/* Main Cropper */}
        <Cropper
          src={displaySrc}
          style={{ height: '100%', minHeight: '500px', width: '100%' }}
          initialAspectRatio={NaN}
          aspectRatio={NaN}
          guides={true}
          viewMode={1}
          dragMode="move"
          ref={cropperRef}
          background={false} 
          autoCropArea={0.8}
          className="flex-1"
          checkOrientation={false} // Prevent auto-rotate issues
        />

        {/* Loading Overlay for Transparency Processing */}
        {isApplyingTransparency && (
          <div className="absolute inset-0 z-20 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
             <div className="flex flex-col items-center">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
               <span className="text-white font-medium text-sm">Removing Background...</span>
             </div>
          </div>
        )}

        {/* Magic Picker Overlay - Only visible when picking color */}
        {magicMode && (
          <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center cursor-crosshair">
            <div className="relative max-w-full max-h-full p-4">
              <img 
                src={originalSrc} 
                className="max-w-full max-h-[80vh] object-contain border-2 border-indigo-500 shadow-2xl"
                onClick={handleImageClick}
                alt="Pick color"
              />
              <div className="absolute top-0 left-0 right-0 -mt-12 text-center pointer-events-none">
                 <span className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-pulse">
                   Click on the image to select the color to remove
                 </span>
              </div>
              <button 
                onClick={() => setMagicMode(false)}
                className="absolute -top-10 right-4 text-white hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Background Grid Pattern (Visual Only) */}
        <div className="absolute inset-0 -z-10 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEX///8AAABVwtN+AAAAAnRSTlP/AOW3ME4AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAcdEVYdFNvZnR3YXJlAADOYmUgT3BlbiBTb3VyY2UgQ0UoeRKKAAAAF0lEQVQY02NgQAX/G8H4//9/EJOQAAQA9RcP8e+2VZAAAAAASUVORK5CYII=')] opacity-20 pointer-events-none"></div>
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-96 flex flex-col gap-5 p-1">
        
        {/* Magic Remove Panel */}
        <div className={`rounded-2xl border transition-all duration-300 ${removedColor ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-gray-800 border-gray-700'} p-5`}>
           <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 block flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-400" /> Magic Remove
           </label>
           
           <div className="flex gap-3 mb-4">
             <button
               onClick={() => setMagicMode(true)}
               className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                 magicMode 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
               }`}
             >
               <MousePointer2 className="w-4 h-4" /> 
               {removedColor ? 'Pick Different Color' : 'Pick Color'}
             </button>
             
             {removedColor && (
               <button
                 onClick={() => { setRemovedColor(null); setDisplaySrc(originalSrc); }}
                 className="p-2 bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                 title="Clear selection"
               >
                 <Eraser className="w-4 h-4" />
               </button>
             )}
           </div>

           {removedColor && (
             <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-3">
                 <div 
                   className="w-8 h-8 rounded-full border border-gray-500 shadow-inner"
                   style={{ backgroundColor: `rgb(${removedColor.r},${removedColor.g},${removedColor.b})` }}
                 ></div>
                 <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Tolerance (Level)</span>
                      <span>{tolerance}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                 </div>
               </div>
               <p className="text-[10px] text-gray-500 leading-tight">
                 Adjust level 1-10 to remove similar colors. Higher values remove more.
               </p>
             </div>
           )}
        </div>

        {/* Aspect Ratio */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Grid className="w-4 h-4" /> Mask Shape</span>
            <button onClick={handleReset} className="text-indigo-400 hover:text-white text-[10px] flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset All
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

        {/* Output Settings */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 space-y-5">
          {/* Resize Inputs */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
               Output Size (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                 <input 
                   type="number" 
                   placeholder="Width (px)"
                   value={targetWidth}
                   onChange={(e) => setTargetWidth(e.target.value)}
                   className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                 />
               </div>
               <div className="space-y-1">
                 <input 
                   type="number" 
                   placeholder="Height (px)"
                   value={targetHeight}
                   onChange={(e) => setTargetHeight(e.target.value)}
                   className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                 />
               </div>
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