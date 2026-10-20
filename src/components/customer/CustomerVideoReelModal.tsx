import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Star,
  Zap,
  Tag,
  ArrowRight,
} from 'lucide-react';

export interface VideoReelData {
  title: string;
  subtitle?: string;
  videoUrl: string;
  posterImage?: string;
  type: 'category' | 'banner' | 'restaurant' | 'food_item' | 'store_product';
  badge?: string;
  price?: number;
  originalPrice?: number;
  discountLabel?: string;
  description?: string;
  rating?: number;
  isVeg?: boolean;
  onAddToCart?: () => void;
  onViewDetails?: () => void;
  actionButtonText?: string;
}

interface CustomerVideoReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: VideoReelData | null;
}

export const CustomerVideoReelModal: React.FC<CustomerVideoReelModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default when intentionally opening reel
  const [progress, setProgress] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay with sound might be blocked initially; fallback to muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
      setIsPlaying(true);
    }
  }, [isOpen, data?.videoUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && isOpen) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !data || !data.videoUrl) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onAddToCart) {
      data.onAddToCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2500);
    }
  };

  const getTypeBadge = () => {
    switch (data.type) {
      case 'food_item':
        return 'Signature Dish Reel';
      case 'store_product':
        return '10-Min Mart Reel';
      case 'restaurant':
        return 'Live Kitchen Sizzle';
      case 'banner':
        return 'Featured Offer Reel';
      case 'category':
        return 'Category Showcase';
      default:
        return 'Live Video Reel';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md sm:max-w-lg h-[86vh] sm:h-[82vh] max-h-[780px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/15"
      >
        {/* Main Video Background Player */}
        <div
          className="absolute inset-0 z-0 bg-black cursor-pointer flex items-center justify-center"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={data.videoUrl}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover object-center"
          />

          {/* Gradients for high contrast text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

          {/* Big Pause/Play Indicator overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/20 animate-in zoom-in-75 shadow-2xl">
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Top Header Bar */}
        <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>LIVE</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
              {getTypeBadge()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition active:scale-90"
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-amber-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition active:scale-90"
              title="Close reel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-10 p-5 sm:p-6 space-y-3.5 text-white pointer-events-auto">
          {/* Tags & Price Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {data.isVeg !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                    data.isVeg
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      data.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <span>{data.isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
                </span>
              )}

              {data.rating && (
                <span className="px-2 py-0.5 rounded-md bg-black/60 text-amber-300 text-[10px] font-black flex items-center gap-1 border border-white/10">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>{data.rating.toFixed(1)}</span>
                </span>
              )}

              {data.discountLabel && (
                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {data.discountLabel}
                </span>
              )}
            </div>

            {data.price !== undefined && (
              <div className="flex items-baseline gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  ₹{data.price}
                </span>
                {data.originalPrice && data.originalPrice > data.price && (
                  <span className="text-xs text-white/50 line-through">
                    ₹{data.originalPrice}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-lg sm:text-xl font-heading font-black tracking-tight drop-shadow-md text-white line-clamp-2">
              {data.title}
            </h3>
            {data.description && (
              <p className="text-xs sm:text-sm text-white/80 font-medium mt-1 leading-relaxed line-clamp-2 sm:line-clamp-3 drop-shadow-xs">
                {data.description}
              </p>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-2 flex items-center gap-3">
            {data.onAddToCart && (
              <button
                type="button"
                onClick={handleAddToCartClick}
                className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isAdded
                    ? 'bg-emerald-500 text-slate-950 scale-102'
                    : 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:brightness-110 text-white shadow-orange-500/30'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Order • {data.price ? `₹${data.price}` : 'Select'}</span>
                  </>
                )}
              </button>
            )}

            {data.onViewDetails && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  data.onViewDetails?.();
                }}
                className="py-3 px-4 rounded-2xl font-bold text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition active:scale-95 border border-white/20 flex items-center gap-1.5"
              >
                <span>{data.actionButtonText || 'Explore'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
