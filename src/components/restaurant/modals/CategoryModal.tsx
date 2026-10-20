import React, { useState, useEffect } from 'react';
import { X, Layers, CheckCircle } from 'lucide-react';
import { RestaurantCategory } from '../../../types';
import { PhotoUploadInput } from '../../common/PhotoUploadInput';
import { VideoUploadInput } from '../../common/VideoUploadInput';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<RestaurantCategory, 'id'> | Partial<RestaurantCategory>) => void;
  mode: 'add' | 'edit';
  category?: RestaurantCategory | null;
  restaurantId?: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  category,
  restaurantId,
}) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80'
  );
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (category && mode === 'edit') {
      setName(category.name);
      setImage(category.image);
      setVideoUrl(category.videoUrl || '');
    } else {
      setName('');
      setImage('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80');
      setVideoUrl('');
    }
  }, [category, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      image: image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
      videoUrl: videoUrl.trim() || undefined,
      restaurantId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-heading text-slate-900">
                {mode === 'add' ? 'Add New Menu Category' : 'Edit Category Details'}
              </h3>
              <p className="text-xs text-slate-400">
                Organize dishes for fast customer browsing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Category Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Biryani Specials, Charcoal Tandoor, Desserts"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500 font-medium"
            />
          </div>

          {/* Photo Upload Option */}
          <div className="pt-1">
            <PhotoUploadInput
              label="Category Header Photo Upload"
              value={image}
              onChange={setImage}
              categoryMode={true}
              helperText="Upload category card banner or pick from category presets"
              required={true}
            />
          </div>

          {/* Video Upload Option */}
          <div className="pt-1">
            <VideoUploadInput
              label="Category Video Clip / Reel (Optional)"
              value={videoUrl}
              onChange={setVideoUrl}
              categoryMode={true}
              helperText="Upload category clip or select sample food reel. Auto-plays in category views."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Create Category' : 'Update Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
