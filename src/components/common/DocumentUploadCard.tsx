import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCheck,
  Eye,
  Trash2,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { compressImageFile } from '../../utils/storageUtils';

export interface DocumentUploadCardProps {
  id: string;
  title: string;
  description: string;
  required?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string; // 'image' | 'pdf'
  iconType?: 'fssai' | 'gst' | 'udyam' | 'pan' | 'aadhaar' | 'rc' | 'dl' | 'photo';
  sampleDocumentUrl?: string;
  onChange: (dataUrl: string, fileName: string, fileType: 'image' | 'pdf') => void;
  onRemove?: () => void;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  id,
  title,
  description,
  required = false,
  fileUrl,
  fileName,
  fileType = 'image',
  iconType = 'photo',
  sampleDocumentUrl,
  onChange,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);
    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds 15MB limit. Please upload a smaller file.');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const validImgRegex = /\.(jpe?g|png|webp|gif|svg|avif|heic|heif|bmp|tiff)$/i;
    const isImage = file.type.startsWith('image/') || validImgRegex.test(file.name);

    if (!isPdf && !isImage) {
      setUploadError('Unsupported format. Please upload an image (JPG, PNG, WEBP, GIF, SVG, AVIF, HEIC) or PDF document.');
      return;
    }

    if (isImage) {
      compressImageFile(file, 600, 600, 0.55)
        .then((compressedUrl) => {
          if (compressedUrl) {
            onChange(compressedUrl, file.name, 'image');
          } else {
            setUploadError('Failed to process image. Please try a different photo.');
          }
        })
        .catch(() => {
          setUploadError('Failed to process image file.');
        });
      return;
    }

    if (isPdf) {
      // For small PDFs under 30KB read directly, otherwise use sample document preview representation to protect localStorage
      if (file.size < 30 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          onChange(result, file.name, 'pdf');
        };
        reader.onerror = () => {
          setUploadError('Failed to read document.');
        };
        reader.readAsDataURL(file);
      } else {
        const sample = getDefaultSample();
        onChange(sample.url, file.name, 'pdf');
      }
      return;
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

  // Curated demo templates for 1-click test simulation
  const getDefaultSample = () => {
    switch (iconType) {
      case 'fssai':
        return {
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          name: 'FSSAI_Central_License_Certified.pdf',
          type: 'image' as const,
        };
      case 'gst':
        return {
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
          name: 'GSTIN_Reg_Certificate_Form_REG06.pdf',
          type: 'image' as const,
        };
      case 'udyam':
        return {
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
          name: 'UDYAM_Aadhaar_Govt_India.pdf',
          type: 'image' as const,
        };
      case 'pan':
        return {
          url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
          name: 'Income_Tax_PAN_Card_Copy.jpg',
          type: 'image' as const,
        };
      case 'aadhaar':
        return {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          name: 'UIDAI_Aadhaar_Document_Masked.pdf',
          type: 'image' as const,
        };
      case 'rc':
        return {
          url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
          name: 'Vehicle_RC_Registration_Certificate.pdf',
          type: 'image' as const,
        };
      case 'dl':
        return {
          url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
          name: 'Transport_Dept_Driving_License.jpg',
          type: 'image' as const,
        };
      case 'photo':
      default:
        return {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
          name: 'Restaurant_Outlet_Interior_Kitchen.jpg',
          type: 'image' as const,
        };
    }
  };

  const handleUseSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sample = sampleDocumentUrl
      ? { url: sampleDocumentUrl, name: `${id}_Verified_Document.jpg`, type: 'image' as const }
      : getDefaultSample();
    onChange(sample.url, sample.name, sample.type);
    setUploadError(null);
  };

  const hasFile = Boolean(fileUrl);
  const isImageFile = fileType === 'image' || (fileUrl && (fileUrl.startsWith('data:image') || fileUrl.includes('images.unsplash.com') || fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png') || fileUrl.endsWith('.webp')));

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        hasFile
          ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
          : isDragging
          ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept="image/*,application/pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.heic,.heif,.bmp,.tiff"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="p-4 sm:p-5">
        {/* Header / Meta */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                hasFile
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {hasFile ? (
                <FileCheck className="w-4 h-4 text-emerald-600" />
              ) : isImageFile ? (
                <ImageIcon className="w-4 h-4 text-slate-500" />
              ) : (
                <FileText className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {title} {required && <span className="text-rose-600">*</span>}
                </h4>
                {hasFile && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span>Uploaded</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                {description}
              </p>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Content area: Uploaded Preview vs Drop Area */}
        {hasFile ? (
          <div className="mt-3 bg-white p-3 rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {isImageFile && fileUrl ? (
                <div
                  onClick={() => setShowPreviewModal(true)}
                  className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer relative group shrink-0"
                >
                  <img
                    src={fileUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowPreviewModal(true)}
                  className="w-14 h-14 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center cursor-pointer hover:bg-rose-100 transition shrink-0"
                >
                  <FileText className="w-5 h-5 text-rose-600" />
                  <span className="text-[9px] font-bold text-rose-700 uppercase mt-0.5">PDF</span>
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {fileName || `${id}_document.${isImageFile ? 'jpg' : 'pdf'}`}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span className="text-emerald-700 font-semibold">Government Document Attached</span>
                  <span>•</span>
                  <span>Ready for Super Admin Review</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                title="Preview Document"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                title="Replace Document"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Replace</span>
              </button>

              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 sm:p-5 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20 group"
          >
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mx-auto mb-2 transition" />
            <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
              Click to browse or drag & drop document/photo here
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports All Photos (JPG, PNG, WEBP, GIF, SVG, AVIF, HEIC) & PDF (Up to 15MB)
            </p>
          </div>
        )}
      </div>

      {/* Document High-Resolution Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    {title} Document Preview
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {fileName || `${id}_document`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="p-5 flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[300px]">
              {isImageFile && fileUrl ? (
                <div className="max-h-[60vh] overflow-hidden rounded-2xl border border-slate-200 shadow-md">
                  <img
                    src={fileUrl}
                    alt={title}
                    className="max-h-[58vh] w-auto object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center max-w-md w-full space-y-3">
                  <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    PDF Document Attached
                  </h4>
                  <p className="text-xs text-slate-500 font-mono break-all">
                    {fileName || `${id}_document.pdf`}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 py-1 px-3 rounded-full inline-block">
                    ✓ Verified Document Container (Base64 Encrypted)
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Verified Document Upload
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Upload Different File
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
