import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Video as VideoIcon,
  Trash2,
  RefreshCw,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Check,
  AlertCircle,
  FileCheck,
  Film,
  Zap,
  ExternalLink,
} from 'lucide-react';

interface VideoUploadInputProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  helperText?: string;
  categoryMode?: boolean; // If true, preset suggestions are categories
  martMode?: boolean; // If true, preset suggestions are tailored for Likart Mart
  restaurantMode?: boolean; // If true, suggestions are restaurant ambiance/kitchen
  required?: boolean;
}

export const VideoUploadInput: React.FC<VideoUploadInputProps> = ({
  label,
  value = '',
  onChange,
  helperText = 'Upload MP4/WebM video or select high-definition sample reels. Videos auto-play seamlessly on customer home pages.',
  categoryMode = false,
  martMode = false,
  restaurantMode = false,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  const processVideoFile = (file: File) => {
    setError(null);
    const validExtensions = /\.(mp4|webm|ogg|mov|m4v|mkv)$/i;
    const isVideo = file.type.startsWith('video/') || validExtensions.test(file.name);

    if (!isVideo) {
      setError('Please select a valid video file (MP4, WebM, OGG, MOV).');
      return;
    }

    // Size limit: 45MB for local video upload
    if (file.size > 45 * 1024 * 1024) {
      setError('Video file exceeds 45MB. Please upload a shorter clip or use a video URL.');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange(dataUrl);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setError('Failed to read video file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  // Curated High-Definition Royalty-Free Sample Video Reels
  const foodVideoPresets = [
    {
      title: 'Sizzling Pepperoni Pizza & Cheese Pull',
      category: 'Pizza',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-slice-of-pizza-42805-large.mp4',
    },
    {
      title: 'Gourmet Flame-Grilled Burger & Fries',
      category: 'Burgers',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-table-with-burgers-and-french-fries-41865-large.mp4',
    },
    {
      title: 'Chef Wok Flambe & Steaming Biryani',
      category: 'Indian / Chinese',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-wok-pan-43093-large.mp4',
    },
    {
      title: 'Crispy Crunchy Snacks & Finger Food',
      category: 'Snacks',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-french-fries-on-a-wooden-board-42790-large.mp4',
    },
    {
      title: 'Refreshing Chilled Beverage Pouring',
      category: 'Beverages',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-refreshing-soda-drink-with-ice-and-mint-42838-large.mp4',
    },
    {
      title: 'Delicious Dessert & Chocolate Drizzle',
      category: 'Desserts',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-chocolate-sauce-on-pancakes-42845-large.mp4',
    },
  ];

  const martVideoPresets = [
    {
      title: 'Fresh Farm Crisp Vegetables & Greens',
      category: 'Vegetables',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-picking-fresh-vegetables-in-a-garden-42993-large.mp4',
    },
    {
      title: 'Fresh Juicy Fruits & Citrus Slice',
      category: 'Fruits',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-cutting-an-orange-in-half-on-a-wooden-board-42808-large.mp4',
    },
    {
      title: 'Dairy Milk Pouring & Fresh Cream',
      category: 'Dairy',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-with-cookies-42843-large.mp4',
    },
    {
      title: 'Chilled Cold Drink & Sparkling Bubbles',
      category: 'Cold Drinks',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-refreshing-soda-drink-with-ice-and-mint-42838-large.mp4',
    },
    {
      title: 'Snacks, Munchies & Chocolate Unboxing',
      category: 'Munchies',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-chocolate-sauce-on-pancakes-42845-large.mp4',
    },
    {
      title: '10-Minute Rapid Delivery Motion Reel',
      category: 'Speed',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-delivery-man-riding-a-motorcycle-41908-large.mp4',
    },
  ];

  const restaurantVideoPresets = [
    {
      title: 'Live Kitchen Sizzle & Chef Wok Toss',
      category: 'Kitchen Live',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-wok-pan-43093-large.mp4',
    },
    {
      title: 'Cozy Restaurant Dining & Ambiance',
      category: 'Ambiance',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-table-with-burgers-and-french-fries-41865-large.mp4',
    },
    {
      title: 'Artisanal Pizza Baking in Stone Oven',
      category: 'Pizza Baking',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-slice-of-pizza-42805-large.mp4',
    },
    {
      title: 'Cocktail Bar Tender & Pouring Reel',
      category: 'Bar & Drinks',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-refreshing-soda-drink-with-ice-and-mint-42838-large.mp4',
    },
  ];

  const activePresets = martMode
    ? martVideoPresets
    : restaurantMode
    ? restaurantVideoPresets
    : foodVideoPresets;

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setError(null);
  };

  const handleClearVideo = () => {
    onChange('');
    setUrlInput('');
    setFileName(null);
    setError(null);
  };

  const togglePlay = () => {
    if (!videoPreviewRef.current) return;
    if (isPlaying) {
      videoPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      videoPreviewRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoPreviewRef.current) return;
    const nextMuted = !isMuted;
    videoPreviewRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className="space-y-2">
      {/* Label and Autoplay Tag */}
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-purple-600" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-purple-600" />
          <span>Auto-Plays in Customer Feed</span>
        </span>
      </div>

      {/* Main Container */}
      <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-3">
        {/* If video is selected: show rich preview with player controls */}
        {value ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
            <div className="relative aspect-video max-h-56 w-full flex items-center justify-center bg-black">
              <video
                ref={videoPreviewRef}
                src={value}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Video Overlay Badges */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Auto-Play Video Active</span>
                </span>
                {fileName && (
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded-full truncate max-w-[140px]">
                    {fileName}
                  </span>
                )}
              </div>

              {/* Player Floating Controls */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition active:scale-95"
                  title={isPlaying ? 'Pause preview' : 'Play preview'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition active:scale-95"
                  title={isMuted ? 'Unmute sound' : 'Mute sound'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearVideo}
                  className="p-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white backdrop-blur-xs transition active:scale-95 flex items-center gap-1 px-2 text-[10px] font-bold"
                  title="Remove video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Video Footer Info */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-white flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-300 truncate max-w-[280px]">
                {value.startsWith('data:') ? 'Local uploaded video file' : value}
              </span>
              <button
                type="button"
                onClick={handleClearVideo}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline"
              >
                Change Video
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs: Upload File | Enter URL | Sample Presets */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'url'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Video URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sample Reels</span>
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD DROPZONE */}
            {activeTab === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50/70 scale-[0.99]'
                    : 'border-slate-300 bg-white hover:border-purple-400 hover:bg-purple-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Film className="w-5 h-5" />
                  )}
                </div>

                <div className="text-xs font-black text-slate-800">
                  {isProcessing
                    ? 'Processing video file...'
                    : 'Click to select or drag & drop video'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports MP4, WebM, MOV clips up to 45MB
                </p>
              </div>
            )}

            {/* TAB 2: ENTER VIDEO URL */}
            {activeTab === 'url' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/videos/delicious-food.mp4"
                    className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-purple-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    disabled={!urlInput.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Direct link to MP4 or WebM video file on Cloud CDN or hosting.
                </p>
              </div>
            )}

            {/* TAB 3: HIGH-DEFINITION SAMPLE REELS PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Select a ready-to-test 1080p sample video reel:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {activePresets.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onChange(preset.url);
                        setError(null);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer transition flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                          {preset.category}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 truncate mt-0.5">
                          {preset.title}
                        </h5>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Helper Note */}
        <p className="text-[10px] text-slate-500 leading-snug">{helperText}</p>
      </div>
    </div>
  );
};

export default VideoUploadInput;
