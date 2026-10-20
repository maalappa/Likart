import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
  UserCheck,
  Sparkles,
  Smile
} from 'lucide-react';

interface LiveSelfieCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (selfieDataUrl: string) => void;
  currentSelfieUrl?: string;
}

export const LiveSelfieCaptureModal: React.FC<LiveSelfieCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  currentSelfieUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(currentSelfieUrl || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Start webcam when modal opens if no image captured yet
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser/environment.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user',
        },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera error or permission denied:', err);
      setIsCameraActive(false);
      setCameraError(
        'Unable to access camera (permission denied or no webcam). You can directly upload a clear live selfie photo below!'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCaptureClick = () => {
    // 3-second quick countdown for natural selfie pose
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 800);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw square cropped & mirrored selfie
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleSelfie = () => {
    const sampleSelfie =
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
    setCapturedImage(sampleSelfie);
    stopCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Live Selfie KYC Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Face matching for rider security & fleet badge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Snapshot Viewport */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center relative min-h-[340px]">
          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden File Input for Direct Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {capturedImage ? (
            /* Snapshot Preview */
            <div className="relative flex flex-col items-center">
              <div className="w-56 h-56 rounded-full overflow-hidden ring-4 ring-emerald-500 shadow-2xl relative bg-slate-900">
                <img
                  src={capturedImage}
                  alt="Captured Selfie"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Selfie Photo Captured Successfully</span>
              </div>
            </div>
          ) : isCameraActive ? (
            /* Live Camera Stream with Face Guide */
            <div className="relative flex flex-col items-center">
              <div className="w-60 h-60 rounded-full overflow-hidden ring-4 ring-blue-500/80 shadow-2xl relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Face Framing Oval Overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-full pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border border-white/20 rounded-full flex items-center justify-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 bg-black/40 px-2 py-0.5 rounded-full">
                      Align Face in Center
                    </span>
                  </div>
                </div>

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-6xl font-black text-white animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-3 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-blue-400" />
                Look directly into camera without sunglasses or mask
              </p>
            </div>
          ) : (
            /* Fallback or Camera Disabled */
            <div className="text-center p-6 space-y-3 max-w-xs">
              <div className="w-14 h-14 bg-slate-800 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-white">Live Camera Not Active</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cameraError || 'Camera permissions are required for live face verification.'}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Retry Camera Access
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Selfie Photo from Device</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleUseSampleSelfie}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Use Test Verified Selfie</span>
            </button>

            {!capturedImage && isCameraActive && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Upload File</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Use This Selfie</span>
                </button>
              </>
            ) : isCameraActive ? (
              <button
                type="button"
                onClick={handleCaptureClick}
                disabled={countdown !== null}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>{countdown !== null ? `Capturing in ${countdown}...` : 'Capture Selfie'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
