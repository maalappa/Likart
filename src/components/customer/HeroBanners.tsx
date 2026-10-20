import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
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
  Percent,
  Volume2,
  VolumeX,
  Film,
} from 'lucide-react';

const SLIDE_INTERVAL_MS = 5000; // 5 seconds per slide as requested

export const HeroBanners: React.FC = () => {
  const { banners, applyCoupon, setIsCartOpen, addNotification } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Touch and drag swipe state
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const totalSlides = banners?.length || 0;

  // Next Slide handler
  const goToNextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  // Previous Slide handler
  const goToPrevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  // Jump to specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // 5-second auto side slide timer & progress bar
  useEffect(() => {
    if (totalSlides <= 1) return;
    if (isPaused || isManualPaused) return;

    const tickInterval = 50; // update progress every 50ms for smooth bar animation
    const progressStep = (tickInterval / SLIDE_INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextSlide();
          return 0;
        }
        return prev + progressStep;
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, isManualPaused, goToNextSlide]);

  // Reset progress when index changes manually
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Pause when window or document is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle applying coupon
  const handleApplyCouponFromBanner = (code: string) => {
    const res = applyCoupon(code);
    addNotification('Coupon Applied', res.message, res.success ? 'system' : 'system');
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
    setIsCartOpen(true);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Slide
      goToNextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Slide
      goToPrevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Mouse Drag handlers for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || touchStartXRef.current === null) return;
    const distance = touchStartXRef.current - e.clientX;
    const minSwipeDistance = 60;
    if (distance > minSwipeDistance) {
      goToNextSlide();
    } else if (distance < -minSwipeDistance) {
      goToPrevSlide();
    }
    isDraggingRef.current = false;
    touchStartXRef.current = null;
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="py-2 sm:py-3 select-none">
      {/* Banner Carousel Container */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-950 border border-slate-800/80 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          if (!isManualPaused) setIsPaused(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') goToPrevSlide();
          if (e.key === 'ArrowRight') goToNextSlide();
        }}
      >
        {/* Horizontal Sliding Track */}
        <div
          className="flex transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={banner.id}
                className={`relative min-w-full w-full shrink-0 min-h-[220px] sm:min-h-[240px] md:min-h-[260px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-r ${banner.bgColor} text-white`}
              >
                {/* Background Food Image / Video Backdrop with Parallax/Zoom */}
                <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10" />
                  {banner.videoUrl ? (
                    <video
                      key={banner.videoUrl}
                      src={banner.videoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className={`w-full h-full object-cover object-center transition duration-1000 ${
                        isActive ? 'scale-105 opacity-90' : 'scale-100 opacity-60'
                      }`}
                    />
                  ) : (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className={`w-full h-full object-cover object-center transition duration-1000 ${
                        isActive ? 'scale-105 opacity-90' : 'scale-100 opacity-60'
                      }`}
                    />
                  )}
                </div>

                {/* Ambient glow accent */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Row: Tags & Controls Info */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-white shadow-xs border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>Featured Promo</span>
                    </span>

                    {banner.videoUrl && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/20 shadow-xs animate-pulse">
                        <Film className="w-3 h-3" />
                        <span>Live Video</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/10">
                      <Clock className="w-3 h-3 text-orange-300" />
                      <span>5s Auto Slide</span>
                    </span>
                  </div>

                  {/* Right side controls: Sound toggle if video & Slide Counter Badge */}
                  <div className="flex items-center gap-2">
                    {banner.videoUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted((prev) => !prev);
                        }}
                        className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 transition active:scale-95"
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

                    <span className="text-[11px] font-mono font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90 border border-white/10">
                      {index + 1} / {totalSlides}
                    </span>
                  </div>
                </div>

                {/* Middle Content: Title & Subtitle */}
                <div className="relative z-10 max-w-xl my-3">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight leading-tight drop-shadow-sm text-white">
                    {banner.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-relaxed drop-shadow-xs max-w-lg line-clamp-2 sm:line-clamp-3">
                    {banner.subtitle}
                  </p>
                </div>

                {/* Bottom Row: Action Button & Coupon Chip */}
                <div className="relative z-10 pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApplyCouponFromBanner(banner.code)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-amber-50 text-slate-900 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-black/20 hover:shadow-2xl transition duration-200 active:scale-95 group/btn"
                    >
                      <Tag className="w-4 h-4 text-orange-600" />
                      <span>{copiedCode === banner.code ? 'Applied to Cart!' : `Use ${banner.code}`}</span>
                      {copiedCode === banner.code ? (
                        <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover/btn:translate-x-1 transition duration-200" />
                      )}
                    </button>

                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-300" />
                      <span>{banner.linkText || 'Instant Discount'}</span>
                    </span>
                  </div>

                  <span className="hidden sm:inline-block text-[11px] text-white/75 font-semibold">
                    Swipe or use arrows to navigate
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Side Slide Navigation Arrows (Left & Right) */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevSlide();
              }}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition duration-200 hover:scale-110 active:scale-95 z-20 opacity-80 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNextSlide();
              }}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition duration-200 hover:scale-110 active:scale-95 z-20 opacity-80 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Bottom Bar: Progress Indicator & Dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 z-20 px-6 flex items-center justify-between pointer-events-none">
            {/* Dots navigation */}
            <div className="flex items-center gap-2 pointer-events-auto bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 mx-auto sm:mx-0">
              {banners.map((_, i) => {
                const isSelected = i === currentIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(i);
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'w-7 bg-white shadow-xs'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  ></button>
                );
              })}

              {/* Pause / Play Auto-Slide Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsManualPaused((prev) => !prev);
                }}
                title={isManualPaused ? 'Resume 5s auto-slide' : 'Pause auto-slide'}
                aria-label={isManualPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
                className="ml-1 p-1 text-white/70 hover:text-white transition"
              >
                {isManualPaused ? (
                  <Play className="w-3 h-3 text-amber-300" />
                ) : (
                  <Pause className="w-3 h-3 text-white/80" />
                )}
              </button>
            </div>

            {/* Auto slide timing badge with progress on larger screens */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-auto">
              <span>{isPaused || isManualPaused ? 'Paused on hover' : 'Next slide in 5s'}</span>
            </div>
          </div>
        )}

        {/* 5-Second Linear Progress Bar across the very bottom */}
        {totalSlides > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 z-30 overflow-hidden">
            <div
              className={`h-full bg-white/90 shadow-sm transition-all ${
                isPaused || isManualPaused ? 'opacity-50' : 'opacity-100'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                transition: 'width 50ms linear',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
