import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UtensilsCrossed,
  Image as ImageIcon,
  Check,
  Star,
  CheckCircle2,
  ShieldCheck,
  Database,
  UploadCloud,
  Trash2,
  RefreshCw,
  Camera,
  Sparkles,
} from 'lucide-react';
import { Cuisine } from '../../../types';
import { processAndPersistPhoto, detectPhotoFormat } from '../../../utils/storageUtils';
import { VideoUploadInput } from '../../common/VideoUploadInput';

interface CuisineModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  cuisine?: Cuisine | null;
  onClose: () => void;
  onSave: (cuisineData: Omit<Cuisine, 'id' | 'createdAt'>) => void;
}

export const CuisineModal: React.FC<CuisineModalProps> = ({
  isOpen,
  mode,
  cuisine,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [featurePhoto, setFeaturePhoto] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [photoFormat, setPhotoFormat] = useState<string>('JPG');
  const [photoDimensions, setPhotoDimensions] = useState<string>('');
  const [isSavedPermanently, setIsSavedPermanently] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (cuisine && mode === 'edit') {
      setName(cuisine.name);
      setSlug(cuisine.slug || '');
      setFeaturePhoto(cuisine.image || '');
      setVideoUrl(cuisine.videoUrl || '');
      setDescription(cuisine.description || '');
      setIsPopular(cuisine.isPopular || false);
      setIsActive(cuisine.isActive !== false);
      setUploadFileName(cuisine.image ? 'Current Feature Photo' : '');
      const fmt = cuisine.image ? detectPhotoFormat(cuisine.image).format : 'JPG';
      setPhotoFormat(fmt);
      setIsSavedPermanently(true);
    } else {
      setName('');
      setSlug('');
      setFeaturePhoto('');
      setVideoUrl('');
      setDescription('');
      setIsPopular(false);
      setIsActive(true);
      setUploadFileName('');
      setPhotoFormat('JPG');
      setPhotoDimensions('');
      setIsSavedPermanently(true);
    }
    setErrorMsg('');
    setIsDragging(false);
    setIsUploading(false);
  }, [cuisine, mode, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (mode === 'add') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const processFile = async (file: File) => {
    const validImgRegex = /\.(jpe?g|png|webp|gif|svg|avif|heic|heif|bmp|tiff)$/i;
    const isImage = file.type.startsWith('image/') || validImgRegex.test(file.name);

    if (!isImage) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, JPEG, WebP, GIF, SVG, AVIF, HEIC, BMP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Feature photo must be under 25MB in size.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);

    try {
      const res = await processAndPersistPhoto(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.85,
        preserveTransparency: true,
      });

      if (res && res.dataUrl) {
        setFeaturePhoto(res.dataUrl);
        setUploadFileName(res.name || file.name);
        setPhotoFormat(res.format);
        if (res.width && res.height) {
          setPhotoDimensions(`${res.width}×${res.height}px`);
        }
        setIsSavedPermanently(true);
      } else {
        setErrorMsg('Failed to process image file. Please try a different photo.');
      }
    } catch (err: any) {
      console.error('Photo processing error:', err);
      setErrorMsg('Failed to process image. Please try another format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
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
      processFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setFeaturePhoto('');
    setUploadFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Cuisine name is required.');
      return;
    }

    const cleanSlug =
      slug.trim() ||
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    onSave({
      name: name.trim(),
      slug: cleanSlug,
      emoji: cuisine?.emoji || '🍽️',
      image: featurePhoto.trim(),
      videoUrl: videoUrl.trim() || undefined,
      description: description.trim(),
      isPopular,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-heading text-slate-900">
                  {mode === 'add' ? 'Add New Master Cuisine' : 'Edit Cuisine Details'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  Super Admin
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Permanent Save Access</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cuisine categories empower customer search tags, category filters, and restaurant classification.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Name and Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Cuisine Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Mughlai & Kebabs"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                URL Slug / Identifier
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. mughlai"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:bg-white focus:outline-orange-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Used in category URL filters (e.g., /category/{slug || 'name'})
              </span>
            </div>
          </div>

          {/* Row 2: FEATURE PHOTO UPLOAD OPTION (Replaces Cuisine Emoji Icon & Cuisine Cover Photo URL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Camera className="w-4 h-4 text-orange-600" />
                <span>Feature Photo Upload</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700">
                  All Formats
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                Supports PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC, BMP
              </span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.heic,.heif,.bmp,.tiff"
              onChange={handleFileChange}
              className="hidden"
            />

            {featurePhoto ? (
              /* Uploaded Preview Card */
              <div className="relative p-3.5 bg-gradient-to-r from-orange-50/70 via-amber-50/60 to-emerald-50/40 rounded-2xl border border-orange-200 flex items-center gap-4 group">
                <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden border border-orange-200 shadow-xs shrink-0 bg-white">
                  <img
                    src={featurePhoto}
                    alt="Feature preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 bg-white/95 text-slate-800 rounded-lg hover:bg-white transition text-[10px] font-bold shadow-xs"
                      title="Replace Photo"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Saved Permanently</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                      {photoFormat || 'IMAGE'}
                    </span>
                    {photoDimensions && (
                      <span className="text-[10px] font-medium text-slate-500 font-mono">
                        {photoDimensions}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 font-semibold truncate">
                    {uploadFileName || 'Cuisine Feature Photo'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Saved permanently into the platform database vault. Preserved across all refreshes, browser reloads, and sessions.
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-bold text-orange-700 bg-white hover:bg-orange-100 rounded-lg border border-orange-200 transition flex items-center gap-1"
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload Another</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-rose-200 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Dropzone / Upload Trigger */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-orange-500 bg-orange-50 scale-[1.01]'
                    : 'border-slate-300 hover:border-orange-400 bg-slate-50/60 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                    {isUploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isUploading ? (
                        'Processing and permanently encrypting photo...'
                      ) : (
                        <>
                          <span className="text-orange-600 underline">Click to upload photo in any format</span>{' '}
                          or drag & drop here
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supports PNG, JPG, JPEG, WEBP, GIF, SVG, AVIF, HEIC, BMP (Permanently saved)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-medium">
                      <ImageIcon className="w-3 h-3" />
                      All Formats Supported
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Permanent Storage
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Upload Option for Cuisine / Category */}
          <div className="pt-1">
            <VideoUploadInput
              label="Cuisine / Category Video Reel (Optional)"
              value={videoUrl}
              onChange={setVideoUrl}
              categoryMode={true}
              helperText="Upload category clip or select high-definition sample reel. Auto-plays on customer home page category bar & exploration feeds."
            />
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Short Description / Taste Profile
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Royal Mughlai gravies, mutton rogan josh, seekh kebabs, and rumali rotis."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 leading-relaxed"
            />
          </div>

          {/* Row 4: Flags (Popular & Active) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <div>
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Popular / Featured Cuisine</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Highlighted with badge in customer top category filters
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Active & Discoverable</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Customers can see and filter restaurants by this cuisine
                </span>
              </div>
            </label>
          </div>

          {/* Permanent Save Access Indicator */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block flex items-center gap-1.5">
                  <span>Permanent Master Catalog Save</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                <span className="text-[10px] text-emerald-700 block">
                  New and edited cuisine data is permanently persisted to local database & browser storage immediately upon saving.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 shrink-0">
              Permanent Sync
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 hover:from-orange-500 hover:to-amber-600 text-white font-black rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{mode === 'add' ? 'Create & Permanently Save' : 'Save & Persist Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
