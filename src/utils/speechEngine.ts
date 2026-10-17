import { VoiceMode } from '../types';

export class SpeechEngine {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Futuristic Chimes & Cues
  playTone(type: 'activate' | 'success' | 'alert' | 'complete'): void {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'activate') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.setValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio cue fail-safe
    }
  }

  isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  startListening(
    language: string,
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser.');
      return false;
    }

    try {
      this.playTone('activate');
      this.recognition.lang = language === 'Auto' ? 'en-US' : language;
      
      this.recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }
        if (finalText) {
          onResult(finalText, true);
        } else if (interimText) {
          onResult(interimText, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        onError(event.error);
      };

      this.recognition.onend = () => {
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      onError(err.message || 'Failed to start listening');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Safe to ignore if already stopped
      }
    }
  }

  /**
   * Multi-Voice Text-to-Speech Output
   */
  speak(
    text: string,
    voiceMode: VoiceMode,
    language: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.synth) return;

    this.stopSpeaking();

    // Clean text of markdown/asterisks for natural speech
    const cleanText = text.replace(/[*#_`~>]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Apply pitch & rate tailored for Male / Female / Child voice
    switch (voiceMode) {
      case 'Male':
        utterance.pitch = 0.85;
        utterance.rate = 0.98;
        break;
      case 'Female':
        utterance.pitch = 1.25;
        utterance.rate = 1.05;
        break;
      case 'Child':
        utterance.pitch = 1.65;
        utterance.rate = 1.15;
        break;
      default:
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
    }

    // Language selection
    if (language && language !== 'Auto') {
      utterance.lang = language;
    } else {
      // Auto-detect Urdu/Hindi vs English
      const hasUrduArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(cleanText);
      const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
      if (hasUrduArabic) {
        utterance.lang = 'ur-PK';
      } else if (hasDevanagari) {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }
    }

    // Try finding a matching native voice
    const voices = this.synth.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = utterance.lang.split('-')[0].toLowerCase();
      let matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      
      // If voice gender can be matched in name
      if (voiceMode === 'Male') {
        const maleVoice = voices.find((v) => 
          v.lang.toLowerCase().startsWith(langPrefix) && 
          (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('guy'))
        );
        if (maleVoice) matchedVoice = maleVoice;
      } else if (voiceMode === 'Female') {
        const femaleVoice = voices.find((v) => 
          v.lang.toLowerCase().startsWith(langPrefix) && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'))
        );
        if (femaleVoice) matchedVoice = femaleVoice;
      }
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechEngine = new SpeechEngine();
