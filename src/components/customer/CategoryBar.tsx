import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Check, X, Flame, Film } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerVideoReelModal, VideoReelData } from './CustomerVideoReelModal';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory }) => {
  const { cuisines } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeReel, setActiveReel] = useState<VideoReelData | null>(null);

  const activeCuisines = cuisines ? cuisines.filter((c) => c.isActive !== false) : [];

  const displayList = [
    {
      id: 'all',
      name: 'All Cuisines',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
      emoji: '🍽️',
      isPopular: false,
      videoUrl: '',
      description: 'Explore all mouth-watering cuisines from top verified kitchens',
    },
    ...activeCuisines.map((c) => ({
      id: c.slug || c.id,
      name: c.name,
      image: c.image || '',
      videoUrl: c.videoUrl || '',
      emoji: c.emoji || '🍽️',
      isPopular: !!c.isPopular,
      description: c.description || '',
    })),
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const selectedCuisineObj = displayList.find((c) => c.id === selectedCategory);

  return (
    <div className="py-4 bg-white/80 backdrop-blur-xs rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-orange-100 text-orange-600">
              <Sparkles className="w-4 h-4 fill-orange-500" />
            </span>
            <h3 className="text-lg sm:text-xl font-heading font-black text-slate-900 tracking-tight">
              What's on your mind?
            </h3>
            <span className="hidden sm:inline-block text-[11px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200/80 px-2 py-0.5 rounded-full">
              Explore Cuisines
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
              <Film className="w-2.5 h-2.5" />
              <span>Live Video Reels</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-8 sm:ml-0">
            Hand-crafted recipes, local cravings & signature regional specialties with auto-playing video reels
          </p>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 flex items-center justify-center transition active:scale-95 shadow-2xs border border-slate-200 hover:border-orange-500"
            title="Scroll left"
            aria-label="Scroll cuisines left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 flex items-center justify-center transition active:scale-95 shadow-2xs border border-slate-200 hover:border-orange-500"
            title="Scroll right"
            aria-label="Scroll cuisines right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Large Cuisines Cards Horizontal Showcase */}
      <div
        ref={scrollContainerRef}
        className="flex items-start gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-2 px-1 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayList.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              className="group flex flex-col items-center shrink-0 text-center"
            >
              {/* Large Image / Video Avatar Container */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="focus:outline-hidden block rounded-full sm:rounded-3xl transition-all active:scale-95 text-center"
                  title={`Filter by ${cat.name}`}
                >
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full sm:rounded-3xl overflow-hidden p-0.5 transition-all duration-300 relative shadow-xs ${
                      isSelected
                        ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-white scale-105 shadow-lg shadow-orange-500/25 bg-orange-500'
                        : 'border-2 border-slate-200/90 group-hover:border-orange-400 group-hover:shadow-md group-hover:scale-105 bg-slate-100'
                    }`}
                  >
                    {cat.videoUrl ? (
                      <video
                        key={cat.videoUrl}
                        src={cat.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-full sm:rounded-3xl transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full sm:rounded-3xl transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full sm:rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl">{cat.emoji || '🍽️'}</span>
                      </div>
                    )}

                    {/* Gradient Overlay on Hover / Active */}
                    <div
                      className={`absolute inset-0 rounded-full sm:rounded-3xl transition-opacity pointer-events-none ${
                        isSelected
                          ? 'bg-orange-600/15'
                          : 'bg-black/0 group-hover:bg-black/10'
                      }`}
                    />
                  </div>
                </button>

                {/* Video Reel Badge - Sibling, not nested inside another button */}
                {cat.videoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReel({
                        title: cat.name,
                        videoUrl: cat.videoUrl,
                        type: 'category',
                        description: cat.description,
                        actionButtonText: `Browse ${cat.name}`,
                        onViewDetails: () => onSelectCategory(cat.id),
                      });
                    }}
                    className="absolute -top-1 -left-1 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 border border-white animate-pulse z-10 transition active:scale-90"
                    title="Watch live category reel with sound"
                  >
                    <Film className="w-2.5 h-2.5" />
                    <span>REEL</span>
                  </button>
                )}

                {/* Popular Badge */}
                {cat.isPopular && !isSelected && !cat.videoUrl && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 border border-white pointer-events-none">
                    <Flame className="w-2.5 h-2.5 fill-white" />
                    <span>HOT</span>
                  </span>
                )}

                {/* Active Checkmark Pill */}
                {isSelected && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border-2 border-white animate-in zoom-in-75 duration-150 pointer-events-none">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>ACTIVE</span>
                  </span>
                )}
              </div>

              {/* Large Cuisine Title */}
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="mt-2.5 px-0.5 focus:outline-hidden text-center cursor-pointer transition active:scale-95"
              >
                <span
                  className={`block text-xs sm:text-sm font-heading font-black tracking-tight max-w-[84px] sm:max-w-[108px] md:max-w-[116px] truncate transition-colors ${
                    isSelected
                      ? 'text-orange-600 font-black'
                      : 'text-slate-800 group-hover:text-orange-600'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            </div>
        );
      })}
      </div>

      {/* Active Filter Notice Bar when filtered by specific cuisine */}
      {selectedCategory !== 'all' && selectedCuisineObj && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-slate-600">
              Showing restaurants specializing in{' '}
              <strong className="text-slate-900 font-black">{selectedCuisineObj.name}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-orange-600 hover:text-orange-700 font-black flex items-center gap-1 hover:underline"
          >
            <span>Show All Cuisines</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Customer Video Reel Modal */}
      <CustomerVideoReelModal
        isOpen={Boolean(activeReel)}
        onClose={() => setActiveReel(null)}
        data={activeReel}
      />
    </div>
  );
};
