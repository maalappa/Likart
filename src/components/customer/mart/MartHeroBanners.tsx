import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Tag,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Clock,
  Check,
  Zap,
  ShoppingBag,
  Sliders,
  Volume2,
  VolumeX,
  Film,
} from 'lucide-react';
import { BannerPromo } from '../../../types';

interface MartHeroBannersProps {
  onSelectCategory?: (categoryId: string) => void;
  onSearchTerm?: (term: string) => void;
}

export const MartHeroBanners: React.FC<MartHeroBannersProps> = ({
  onSelectCategory,
  onSearchTerm,
}) => {
  const {
    martBanners,
    martBannerConfig,
    applyCoupon,
    setIsCartOpen,
    addNotification,
  } = useApp();

  // Active banners (only isActive !== false)
  const activeBanners = (martBanners || []).filter((b) => b.isActive !== false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Local user preference for auto-slide (initialized from global config)
  const [isAutoSlideEnabled, setIsAutoSlideEnabled] = useState<boolean>(
    martBannerConfig?.autoSlide !== false
  );

  // Slide duration in ms
  const intervalMs = martBannerConfig?.intervalMs || 4000;
  const totalSlides = activeBanners.length;

  // Touch and drag swipe state
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const goToNextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Auto-slide timer with smooth progress bar
  useEffect(() => {
    if (totalSlides <= 1) return;
    if (!isAutoSlideEnabled) {
      setProgress(0);
      return;
    }
    if (isHovered && martBannerConfig?.pauseOnHover !== false) {
      return; // paused on hover
    }

    const tickMs = 40; // update progress every 40ms for buttery smooth bar
    const step = (tickMs / intervalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [totalSlides, isAutoSlideEnabled, isHovered, intervalMs, martBannerConfig?.pauseOnHover, goToNextSlide]);

  // Reset progress when index changes manually
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 50) {
      // Swiped left
      goToNextSlide();
    } else if (distance < -50) {
      // Swiped right
      goToPrevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevSlide();
    } else if (e.key === 'ArrowRight') {
      goToNextSlide();
    }
  };

  // Apply Coupon code
  const handleApplyCoupon = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard?.writeText(code);
    } catch {}

    const res = applyCoupon(code);
    setCopiedCode(code);
    addNotification(
      'Coupon Applied & Copied',
      res.message || `Code ${code} activated for Likart Mart 10-minute delivery.`,
      res.success ? 'order' : 'system'
    );
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Banner action button click (navigate to category or apply coupon)
  const handleBannerAction = (banner: BannerPromo) => {
    if (banner.targetCategory && onSelectCategory) {
      onSelectCategory(banner.targetCategory);
      const catalogEl = document.getElementById('mart-products-catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (banner.targetSearch && onSearchTerm) {
      onSearchTerm(banner.targetSearch);
    } else if (banner.code) {
      handleApplyCoupon(banner.code);
    }
  };

  if (totalSlides === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  return (
    <div
      className="relative group rounded-3xl overflow-hidden shadow-md border border-slate-200/90 transition-all select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Likart Mart Promotional Banners"
    >
      {/* Top Banner Control Bar: Auto Slide Toggle, Sound Toggle & Slide Counter */}
      <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-2">
        {/* Sound Toggle for Video Banners */}
        {activeBanners[currentIndex]?.videoUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((prev) => !prev);
            }}
            className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition active:scale-95 flex items-center justify-center shadow-md"
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            aria-label="Toggle banner audio"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
        )}

        {/* Auto Slide Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsAutoSlideEnabled((prev) => !prev);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md border shadow-md transition-all active:scale-95 ${
            isAutoSlideEnabled
              ? 'bg-black/50 hover:bg-black/70 text-emerald-300 border-emerald-400/50'
              : 'bg-black/60 hover:bg-black/80 text-amber-300 border-amber-400/50'
          }`}
          title={isAutoSlideEnabled ? 'Pause auto-slide' : 'Resume auto-slide'}
          aria-label={isAutoSlideEnabled ? 'Pause auto-slide' : 'Resume auto-slide'}
        >
          {isAutoSlideEnabled ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-emerald-300" />
              <span className="hidden sm:inline">Auto Slide: ON</span>
              <span className="sm:hidden">Auto</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-amber-300" />
              <span className="hidden sm:inline">Auto Slide: PAUSED</span>
              <span className="sm:hidden">Paused</span>
            </>
          )}
          <span className="text-[10px] opacity-75 font-mono">
            {intervalMs / 1000}s
          </span>
        </button>

        {/* Slide Counter */}
        <div className="bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full text-[11px] font-mono font-bold text-white/90 border border-white/20 hidden sm:flex items-center gap-1">
          <span>{currentIndex + 1}</span>
          <span className="text-white/40">/</span>
          <span>{totalSlides}</span>
        </div>
      </div>

      {/* Main Banner Slide Container */}
      <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[300px] w-full overflow-hidden">
        {activeBanners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          const bgGrad = banner.bgColor || 'from-emerald-700 via-teal-800 to-slate-900';

          const effect = martBannerConfig?.transitionEffect || 'slide';
          let transitionClasses = 'absolute inset-0 transition-all duration-700 ease-out flex flex-col justify-between';
          if (effect === 'slide') {
            transitionClasses += isActive
              ? ' opacity-100 translate-x-0 z-10 pointer-events-auto'
              : idx < currentIndex
              ? ' opacity-0 -translate-x-full pointer-events-none z-0'
              : ' opacity-0 translate-x-full pointer-events-none z-0';
          } else if (effect === 'zoom') {
            transitionClasses += isActive
              ? ' opacity-100 scale-100 z-10 pointer-events-auto'
              : ' opacity-0 scale-108 pointer-events-none z-0';
          } else if (effect === 'flip') {
            transitionClasses += isActive
              ? ' opacity-100 rotate-0 scale-100 z-10 pointer-events-auto'
              : ' opacity-0 -rotate-2 scale-95 pointer-events-none z-0';
          } else {
            // 'fade'
            transitionClasses += isActive
              ? ' opacity-100 z-10 pointer-events-auto'
              : ' opacity-0 pointer-events-none z-0';
          }

          return (
            <div
              key={banner.id}
              className={transitionClasses}
            >
              {/* Background Video / Image with Ambient Glow */}
              <div className="absolute inset-0 z-0">
                {banner.videoUrl ? (
                  <video
                    key={banner.videoUrl}
                    src={banner.videoUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-105 group-hover:scale-100"
                  />
                ) : (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-105 group-hover:scale-100"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                )}
                {/* Gradient Overlays for High-Contrast Text Legibility */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${bgGrad} opacity-90 mix-blend-multiply`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
              </div>

              {/* Banner Foreground Content */}
              <div className="relative z-20 p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full max-w-2xl text-white space-y-3">
                {/* Header Pills & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-xs">
                    <Zap className="w-3 h-3 fill-emerald-300 text-emerald-300 animate-pulse" />
                    <span>Likart Mart Express</span>
                  </span>

                  {banner.videoUrl && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs animate-pulse border border-white/20">
                      <Film className="w-3 h-3" />
                      <span>Live Video</span>
                    </span>
                  )}

                  {banner.badge && (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full shadow-xs">
                      {banner.badge}
                    </span>
                  )}

                  {banner.discountText && (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{banner.discountText}</span>
                    </span>
                  )}

                  <span className="text-[10px] sm:text-xs font-bold bg-white/15 backdrop-blur-md text-emerald-200 px-2.5 py-1 rounded-full border border-white/10 hidden md:inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>10-12 Mins Guaranteed</span>
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-black text-white tracking-tight leading-tight drop-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed max-w-xl line-clamp-2 drop-shadow-xs">
                    {banner.subtitle}
                  </p>
                </div>

                {/* Call-to-Action Buttons & Promo Code Card */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {/* Primary Action Button */}
                  <button
                    type="button"
                    onClick={() => handleBannerAction(banner)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center gap-2 group/btn"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-950" />
                    <span>{banner.linkText || 'Shop Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  {/* Coupon Code Pill */}
                  {banner.code && (
                    <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/25 rounded-xl p-1 pr-1.5 shadow-md">
                      <div className="px-2.5 py-1 text-xs font-mono font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>{banner.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleApplyCoupon(banner.code, e)}
                        className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all active:scale-95 flex items-center gap-1 ${
                          copiedCode === banner.code
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                        title="Copy code and apply discount to cart"
                      >
                        {copiedCode === banner.code ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Prev / Next) */}
      {totalSlides > 1 && martBannerConfig?.showArrows !== false && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevSlide();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-lg"
            title="Previous Banner Slide"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNextSlide();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-lg"
            title="Next Banner Slide"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Bar: Animated Progress Bar + Interactive Dot Indicators */}
      <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 flex flex-col items-center gap-2">
        {/* Continuous Auto-Slide Progress Bar (fills during the interval) */}
        {isAutoSlideEnabled && totalSlides > 1 && martBannerConfig?.showProgressBar !== false && (
          <div className="w-36 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Interactive Dots Pagination */}
        {totalSlides > 1 && martBannerConfig?.showDots !== false && (
          <div className="flex items-center gap-1.5">
            {activeBanners.map((b, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  className={`transition-all duration-300 rounded-full h-2 ${
                    isSelected
                      ? 'w-6 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-sm'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Slide ${idx + 1}: ${b.title}`}
                  aria-label={`Go to slide ${idx + 1}`}
                ></button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
