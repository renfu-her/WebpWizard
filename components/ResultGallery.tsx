import React from 'react';
import { GeneratedImages } from '../types';
import { Download, Check, ArrowLeft, Image as ImageIcon, Minimize, Maximize } from 'lucide-react';

interface ResultGalleryProps {
  images: GeneratedImages;
  onReset: () => void;
}

const ResultCard: React.FC<{
  title: string;
  desc: string;
  src: string;
  size: { width: number; height: number };
  icon: React.ReactNode;
}> = ({ title, desc, src, size, icon }) => {
  const [downloaded, setDownloaded] = React.useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `webp-wizard-${title.toLowerCase().replace(' ', '-')}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 flex flex-col group hover:border-gray-600 transition-all duration-300">
      <div className="h-48 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-gray-900 relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4b5563_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <img 
          src={src} 
          alt={title} 
          className="max-w-full max-h-full object-contain shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="p-1.5 bg-gray-700 rounded-md text-indigo-400">{icon}</span>
              {title}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{desc}</p>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">
            {Math.round(size.width)} x {Math.round(size.height)}
          </span>
          
          <button
            onClick={handleDownload}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              downloaded 
                ? 'bg-green-500/10 text-green-400 border border-green-500/50' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
            }`}
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4" /> Saved
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultGallery: React.FC<ResultGalleryProps> = ({ images, onReset }) => {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Conversion Complete</h2>
           <p className="text-gray-400">Your images are ready in WebP format.</p>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Process New Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ResultCard 
          title="Small Size" 
          desc="Scaled down by 50%. Great for thumbnails."
          src={images.small}
          size={images.smallSize}
          icon={<Minimize className="w-4 h-4" />}
        />
        <ResultCard 
          title="Original Crop" 
          desc="The exact crop area you selected."
          src={images.original}
          size={images.originalSize}
          icon={<ImageIcon className="w-4 h-4" />}
        />
        <ResultCard 
          title="Large Size" 
          desc="Upscaled by 200%. Useful for high-res displays."
          src={images.large}
          size={images.largeSize}
          icon={<Maximize className="w-4 h-4" />}
        />
      </div>
      
    </div>
  );
};

export default ResultGallery;
