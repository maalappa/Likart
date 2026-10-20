import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Sparkles,
  Camera,
  Check,
  AlertCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { processAndPersistPhoto, detectPhotoFormat } from '../../utils/storageUtils';

interface PhotoUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  categoryMode?: boolean; // If true, preset suggestions are categories, else food items
  martMode?: boolean; // If true, preset suggestions are tailored for Likart Mart quick groceries
  required?: boolean;
}

export const PhotoUploadInput: React.FC<PhotoUploadInputProps> = ({
  label,
  value,
  onChange,
  helperText = 'Upload high-resolution photo in any format (PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC, BMP)',
  categoryMode = false,
  martMode = false,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [photoFormat, setPhotoFormat] = useState<string>('JPG');

  useEffect(() => {
    if (value) {
      const detected = detectPhotoFormat(value);
      setPhotoFormat(detected.format);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = async (file: File) => {
    setError(null);
    const validExtensions = /\.(jpe?g|png|webp|gif|svg|avif|heic|heif|bmp|tiff)$/i;
    const isImage = file.type.startsWith('image/') || validExtensions.test(file.name);

    if (!isImage) {
      setError('Please select a valid image file (JPG, PNG, WEBP, GIF, SVG, AVIF, HEIC, BMP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Image file size exceeds 25MB limit. Please upload a smaller image.');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const res = await processAndPersistPhoto(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.82,
        preserveTransparency: true,
      });

      if (res && res.dataUrl) {
        onChange(res.dataUrl);
        setPhotoFormat(res.format);
      } else {
        setError('Could not process photo. Please try a different image.');
      }
    } catch {
      setError('Failed to process image file.');
    } finally {
      setIsProcessing(false);
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
      processImageFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          break;
        }
      }
    }
  };

  // Curated High-Definition Food & Category Presets
  const foodPresets = [
    {
      title: 'Dum Biryani Feast',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Wood-fired Pizza',
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Smashed Cheese Burger',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Smoked Chicken Kebabs',
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Paneer Butter Masala',
      url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Steamed Crystal Dim Sums',
      url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Chocolate Ganache Pastry',
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Loaded Belgian Waffle',
      url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'South Indian Dosa Platter',
      url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Artisanal Thick Shakes',
      url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const categoryPresets = [
    {
      title: 'Biryani Special',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Pizzas & Pasta',
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Pure Veg Delights',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'South Indian Tiffin',
      url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Chinese & Wok',
      url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Burgers & Wraps',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Desserts & Cakes',
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Beverages & Shakes',
      url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Kebabs & Charcoal',
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Healthy Salads & Bowls',
      url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const groceryItemPresets = [
    {
      title: 'Amul Taaza Full Cream Milk (500ml)',
      url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Farm Fresh Brown Eggs (Pack of 6)',
      url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Harvest Gold 100% Atta Bread (400g)',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Fresh Hybrid Tomatoes (1 kg)',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Amul Pasteurised Butter (100g)',
      url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Fresh Alphonso Ratnagiri Mangoes (1 kg)',
      url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Lay\'s Magic Masala Potato Chips',
      url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Coca-Cola Zero Sugar Can (300ml)',
      url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Tetley Pure Green Tea (25 Bags)',
      url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Ariel Matic Liquid Detergent (1L)',
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const martCategoryPresets = [
    {
      title: 'Dairy, Bread & Breakfast',
      url: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Farm Fresh Fruits & Veggies',
      url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Chilled Drinks & Juices',
      url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Crispy Munchies & Snacks',
      url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Instant Noodles & Quick Eats',
      url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Tea, Coffee & Beverages',
      url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Home & Cleaning Essentials',
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Personal Care & Hygiene',
      url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const presets = martMode
    ? (categoryMode ? martCategoryPresets : groceryItemPresets)
    : (categoryMode ? categoryPresets : foodPresets);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 block">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Photo Upload (All Formats)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-2 py-1 rounded-md transition ${
              activeTab === 'presets'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            HD Library
          </button>
        </div>
      </div>

      {/* Hidden File Inputs: Standard & Camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.heic,.heif,.bmp,.tiff"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Tab: File Upload (All Formats) */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse photo or drag & drop image here
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Supports all formats: <span className="font-semibold text-slate-700">PNG, JPG, JPEG, WEBP, GIF, SVG, AVIF, HEIC</span> (Up to 20MB)
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
              >
                <Camera className="w-3 h-3 text-emerald-600" />
                <span>Snap Camera Photo</span>
              </button>
              <span className="text-[10px] text-slate-400">or Paste (Ctrl+V)</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Tab: HD Library Presets */}
      {activeTab === 'presets' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Select Gourmet Food Stock Image</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto pr-1">
            {presets.map((item, idx) => {
              const isSelected = value === item.url;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(item.url);
                    setFileName(item.title);
                  }}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-200'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-14 object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[9px] font-bold text-white truncate w-full">
                      {item.title}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Preview Card */}
      {value && (
        <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={value}
              alt="Selected Preview"
              className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 bg-slate-50"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Saved Permanently</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700">
                  {photoFormat}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 truncate max-w-xs mt-1">
                {fileName || (value.startsWith('data:') ? 'Uploaded Photo File' : 'Selected Photo')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Upload Replacement"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setFileName(null);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Remove Photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 italic">
        {helperText}
      </p>
    </div>
  );
};
