import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle } from 'lucide-react';
import { BannerPromo } from '../../../types';
import { PhotoUploadInput } from '../../common/PhotoUploadInput';
import { VideoUploadInput } from '../../common/VideoUploadInput';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  banner?: BannerPromo | null;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  banner,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [code, setCode] = useState('');
  const [bgColor, setBgColor] = useState('from-amber-600 via-orange-600 to-rose-600');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [linkText, setLinkText] = useState('Claim Offer');

  useEffect(() => {
    if (banner && mode === 'edit') {
      setTitle(banner.title);
      setSubtitle(banner.subtitle);
      setCode(banner.code);
      setBgColor(banner.bgColor);
      setImageUrl(banner.imageUrl);
      setVideoUrl(banner.videoUrl || '');
      setLinkText(banner.linkText || 'Claim Offer');
    } else {
      setTitle('');
      setSubtitle('');
      setCode('');
      setBgColor('from-amber-600 via-orange-600 to-rose-600');
      setImageUrl('');
      setVideoUrl('');
      setLinkText('Claim Offer');
    }
  }, [banner, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      subtitle,
      code: code.trim().toUpperCase(),
      bgColor,
      imageUrl,
      videoUrl: videoUrl.trim() || undefined,
      linkText,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Create Promo Banner' : `Edit Banner: ${banner?.title}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Design hero carousel banners with video auto-play & discount tags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Banner Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 50% FLAT OFF"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:bg-white focus:outline-orange-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Subtitle / Promo Description *</label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. On your first 3 gourmet feasts with code LIKART50"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Coupon Tag / Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LIKART50"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:bg-white focus:outline-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CTA Button Text</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Claim Offer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-orange-500"
              />
            </div>
          </div>

          <div>
            <PhotoUploadInput
              label="Banner Promotional Image"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              helperText="Upload banner creative in all formats (PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC)"
              required={true}
            />
          </div>

          <div>
            <VideoUploadInput
              label="Banner Video Reel (Auto-plays on Home Carousel)"
              value={videoUrl}
              onChange={setVideoUrl}
              helperText="Upload MP4/WebM video or pick sample reel. Seamlessly auto-plays as animated hero background on customer home page."
              categoryMode={false}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Gradient Theme</label>
            <select
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-orange-500"
            >
              <option value="from-amber-600 via-orange-600 to-rose-600">Sunset Orange & Rose</option>
              <option value="from-emerald-700 via-teal-700 to-cyan-800">Emerald Mint & Teal</option>
              <option value="from-purple-900 via-indigo-900 to-blue-900">Royal Purple & Midnight</option>
              <option value="from-rose-600 via-pink-600 to-purple-700">Pink & Crimson Berry</option>
            </select>
          </div>

          {/* Visual Preview */}
          <div className="pt-2">
            <span className="font-bold text-slate-500 block mb-1 text-[11px]">Live Card Preview:</span>
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${bgColor} text-white flex items-center justify-between gap-3 relative overflow-hidden`}>
              <div className="relative z-10">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                  {code || 'PROMO'}
                </span>
                <h4 className="font-black text-base mt-1">{title || 'Banner Title'}</h4>
                <p className="text-[11px] text-white/80 line-clamp-1">{subtitle || 'Banner Subtitle'}</p>
              </div>
              {videoUrl ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-white/30 shrink-0 relative">
                  <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 right-1 bg-red-600 text-[8px] font-black px-1 rounded text-white animate-pulse">
                    LIVE
                  </span>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="preview"
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/30 shrink-0"
                />
              ) : null}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md shadow-orange-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Publish Banner' : 'Update Banner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
