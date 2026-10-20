import { RestaurantAlertTone, RiderAlertTone } from '../types';

let audioCtxInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtxInstance) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxInstance = new AudioCtx();
      }
    }
    if (audioCtxInstance && audioCtxInstance.state === 'suspended') {
      audioCtxInstance.resume();
    }
    return audioCtxInstance;
  } catch (err) {
    console.warn('AudioContext not supported or blocked:', err);
    return null;
  }
}

// Active ringing instances
let activeRestaurantAudio: HTMLAudioElement | null = null;
let activeRestaurantInterval: any = null;
let isRestaurantRingingActive = false;

let activeRiderAudio: HTMLAudioElement | null = null;
let activeRiderInterval: any = null;
let isRiderRingingActive = false;

let activePreviewAudio: HTMLAudioElement | null = null;

/**
 * Validates and converts an uploaded audio File into a base64 Data URL with metadata.
 */
export async function readAudioFileAsDataUrl(file: File): Promise<{
  dataUrl: string;
  fileName: string;
  fileSizeKb: number;
  durationSecs: number;
}> {
  // Validate file type
  const isAudioType =
    file.type.startsWith('audio/') ||
    /\.(mp3|wav|ogg|m4a|aac|weba|flac)$/i.test(file.name);

  if (!isAudioType) {
    throw new Error('Please upload a valid audio file (.mp3, .wav, .ogg, .m4a, .aac).');
  }

  // Max 8MB limit to ensure safe storage in client settings
  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Audio file size exceeds the 8MB limit. Please upload a shorter audio tune.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the audio file.'));
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const fileSizeKb = Math.round(file.size / 1024);

      // Measure duration via temporary HTMLAudioElement
      const tempAudio = new Audio();
      tempAudio.src = dataUrl;

      tempAudio.addEventListener('loadedmetadata', () => {
        const durationSecs = Math.round(tempAudio.duration || 0);
        resolve({
          dataUrl,
          fileName: file.name,
          fileSizeKb,
          durationSecs,
        });
      });

      tempAudio.addEventListener('error', () => {
        // Still resolve with 0 duration if metadata failed to load
        resolve({
          dataUrl,
          fileName: file.name,
          fileSizeKb,
          durationSecs: 0,
        });
      });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * High-audibility synthesized restaurant bell chime
 */
function playSynthesizedRestaurantChime(volume: number = 0.85) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const safeVol = Math.max(0.01, Math.min(1, volume));
    masterGain.gain.setValueAtTime(safeVol, now);
    masterGain.connect(ctx.destination);

    // Primary bell tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(850, now + 0.8);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1760, now); // Octave harmonic
    osc2.frequency.exponentialRampToValueAtTime(1700, now + 0.6);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);

    // Secondary harmonic strike after 180ms
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1174.66, now + 0.18); // D6
    gain3.gain.setValueAtTime(0.5, now + 0.18);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now + 0.18);
    osc3.stop(now + 1.0);
  } catch (err) {
    console.warn('Synthesized chime error:', err);
  }
}

/**
 * High-audibility synthesized rider trip dispatch sonar chime
 */
function playSynthesizedRiderChime(volume: number = 0.85) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const safeVol = Math.max(0.01, Math.min(1, volume));
    masterGain.gain.setValueAtTime(safeVol, now);
    masterGain.connect(ctx.destination);

    // Sonar sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.16);
    osc.frequency.setValueAtTime(1500, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.5);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.7);

    // High accent ping after 220ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1864.66, now + 0.22);
    gain2.gain.setValueAtTime(0.5, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Synthesized rider chime error:', err);
  }
}

/**
 * Starts continuous ringing for Restaurant Kitchen Orders.
 * RINGS UNTIL ACCEPTED by the restaurant!
 */
export function startRestaurantOrderRinging(customAudioUrl?: string, volume: number = 0.85) {
  const safeVol = Math.max(0.01, Math.min(1, volume));

  // If already ringing and URL/source hasn't changed, just update volume
  if (isRestaurantRingingActive && activeRestaurantAudio) {
    activeRestaurantAudio.volume = safeVol;
    return;
  }

  stopRestaurantOrderRinging();
  isRestaurantRingingActive = true;

  if (customAudioUrl && customAudioUrl.trim()) {
    try {
      const audio = new Audio(customAudioUrl);
      audio.loop = true;
      audio.volume = safeVol;
      activeRestaurantAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Custom restaurant audio playback blocked or error, falling back to synthesizer:', err);
          // If custom audio fails (e.g. invalid format or autoplay policy), fallback to repeating synthesized chime
          if (isRestaurantRingingActive) {
            playSynthesizedRestaurantChime(safeVol);
            activeRestaurantInterval = setInterval(() => {
              if (isRestaurantRingingActive) {
                playSynthesizedRestaurantChime(safeVol);
              }
            }, 2400);
          }
        });
      }
      return;
    } catch (err) {
      console.warn('Failed to initialize custom restaurant audio:', err);
    }
  }

  // Fallback continuous repeating chime (rings every 2.4 seconds until accepted)
  playSynthesizedRestaurantChime(safeVol);
  activeRestaurantInterval = setInterval(() => {
    if (isRestaurantRingingActive) {
      playSynthesizedRestaurantChime(safeVol);
    }
  }, 2400);
}

/**
 * Stops the continuous restaurant order ringing immediately (e.g. once order is accepted or rejected).
 */
export function stopRestaurantOrderRinging() {
  isRestaurantRingingActive = false;

  if (activeRestaurantAudio) {
    try {
      activeRestaurantAudio.pause();
      activeRestaurantAudio.currentTime = 0;
      activeRestaurantAudio.src = '';
    } catch {
      // ignore
    }
    activeRestaurantAudio = null;
  }

  if (activeRestaurantInterval) {
    clearInterval(activeRestaurantInterval);
    activeRestaurantInterval = null;
  }
}

export function isRestaurantOrderRinging(): boolean {
  return isRestaurantRingingActive;
}

/**
 * Starts continuous ringing for Delivery Partner Trip Offers.
 * RINGS UNTIL ACCEPTED by the delivery partner!
 */
export function startRiderTripRinging(customAudioUrl?: string, volume: number = 0.85) {
  const safeVol = Math.max(0.01, Math.min(1, volume));

  // If already ringing and URL hasn't changed, just update volume
  if (isRiderRingingActive && activeRiderAudio) {
    activeRiderAudio.volume = safeVol;
    return;
  }

  stopRiderTripRinging();
  isRiderRingingActive = true;

  if (customAudioUrl && customAudioUrl.trim()) {
    try {
      const audio = new Audio(customAudioUrl);
      audio.loop = true;
      audio.volume = safeVol;
      activeRiderAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Custom rider audio playback blocked or error, falling back to synthesizer:', err);
          if (isRiderRingingActive) {
            playSynthesizedRiderChime(safeVol);
            activeRiderInterval = setInterval(() => {
              if (isRiderRingingActive) {
                playSynthesizedRiderChime(safeVol);
              }
            }, 2000);
          }
        });
      }
      return;
    } catch (err) {
      console.warn('Failed to initialize custom rider audio:', err);
    }
  }

  // Fallback continuous repeating chime (rings every 2.0 seconds until accepted)
  playSynthesizedRiderChime(safeVol);
  activeRiderInterval = setInterval(() => {
    if (isRiderRingingActive) {
      playSynthesizedRiderChime(safeVol);
    }
  }, 2000);
}

/**
 * Stops the continuous rider trip ringing immediately (once accepted or rejected).
 */
export function stopRiderTripRinging() {
  isRiderRingingActive = false;

  if (activeRiderAudio) {
    try {
      activeRiderAudio.pause();
      activeRiderAudio.currentTime = 0;
      activeRiderAudio.src = '';
    } catch {
      // ignore
    }
    activeRiderAudio = null;
  }

  if (activeRiderInterval) {
    clearInterval(activeRiderInterval);
    activeRiderInterval = null;
  }
}

export function isRiderTripRinging(): boolean {
  return isRiderRingingActive;
}

/**
 * Preview / Test an audio tune once or briefly.
 * Returns a function to stop the preview anytime.
 */
export function playAudioTunePreview(
  audioUrl?: string,
  category: 'restaurant' | 'rider' = 'restaurant',
  volume: number = 0.85
): () => void {
  // Stop existing preview
  if (activePreviewAudio) {
    try {
      activePreviewAudio.pause();
      activePreviewAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activePreviewAudio = null;
  }

  const safeVol = Math.max(0.01, Math.min(1, volume));

  if (audioUrl && audioUrl.trim()) {
    try {
      const audio = new Audio(audioUrl);
      audio.volume = safeVol;
      audio.loop = false;
      activePreviewAudio = audio;
      audio.play().catch((err) => console.warn('Preview play blocked:', err));

      return () => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore
        }
        if (activePreviewAudio === audio) {
          activePreviewAudio = null;
        }
      };
    } catch (err) {
      console.warn('Could not preview custom audio:', err);
    }
  }

  // If no custom audio, play the synthetic chime once
  if (category === 'restaurant') {
    playSynthesizedRestaurantChime(safeVol);
  } else {
    playSynthesizedRiderChime(safeVol);
  }

  return () => {
    // nothing to pause for synthesized single chime
  };
}

/**
 * Backward compatibility one-shot functions
 */
export function playRestaurantTone(_tone: RestaurantAlertTone = 'kitchen_bell', volume: number = 0.85) {
  playSynthesizedRestaurantChime(volume);
}

export function playRiderTone(_tone: RiderAlertTone = 'radar_pulse', volume: number = 0.85) {
  playSynthesizedRiderChime(volume);
}

/**
 * High-fidelity synthetic sound played when Pay on Delivery payment is received via UPI QR or Cash.
 * Simulates the merchant payment confirmation sound box with ascending celebratory chimes.
 */
export function playPaymentSuccessSound(amount?: number) {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.8, now);
      masterGain.connect(ctx.destination);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.12;
        const duration = 0.45;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.7, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + duration);
      });
    }

    if ('speechSynthesis' in window && amount && amount > 0) {
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(`Payment of ${amount} rupees received`);
          utterance.rate = 1.05;
          utterance.pitch = 1.1;
          utterance.volume = 0.9;
          window.speechSynthesis.speak(utterance);
        } catch {
          // ignore speech synthesis errors
        }
      }, 550);
    }
  } catch (err) {
    console.warn('Could not play payment success sound:', err);
  }
}
