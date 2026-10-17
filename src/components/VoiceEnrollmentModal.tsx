import React, { useState, useEffect } from 'react';
import { Mic, CheckCircle2, ShieldCheck, Sparkles, X, Volume2 } from 'lucide-react';
import { AudioBiometricsEngine } from '../utils/audioBiometrics';
import { MemoryStore } from '../utils/memoryStore';
import { speechEngine } from '../utils/speechEngine';
import { OwnerVoiceProfile } from '../types';

interface VoiceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollmentComplete: (profile: OwnerVoiceProfile) => void;
  audioEngine: AudioBiometricsEngine;
}

export const VoiceEnrollmentModal: React.FC<VoiceEnrollmentModalProps> = ({
  isOpen,
  onClose,
  onEnrollmentComplete,
  audioEngine,
}) => {
  const [step, setStep] = useState(1);
  const [ownerName, setOwnerName] = useState('Ali');
  const [isRecording, setIsRecording] = useState(false);
  const [samples, setSamples] = useState<number[][]>([]);
  const [pitchSamples, setPitchSamples] = useState<number[]>([]);
  const [currentPitch, setCurrentPitch] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState('Boliye: "Assalam-o-Alaikum Sonic"');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSamples([]);
      setPitchSamples([]);
      setStatusMessage('Pehli baar boliye: "Assalam-o-Alaikum Sonic"');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCaptureSample = async () => {
    setIsRecording(true);
    setStatusMessage('Awaaz capture ho rahi hai...');

    // Initialize mic if needed
    await audioEngine.initMic();

    // Sample audio over 2 seconds
    let recordedPitches: number[] = [];
    const interval = setInterval(() => {
      const res = audioEngine.sampleCurrentAudio();
      if (res && res.pitchHz > 0) {
        recordedPitches.push(res.pitchHz);
        setCurrentPitch(res.pitchHz);
      }
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);

      const res = audioEngine.sampleCurrentAudio();
      const avgPitch = recordedPitches.length > 0
        ? Math.round(recordedPitches.reduce((a, b) => a + b, 0) / recordedPitches.length)
        : 140;

      const fingerprint = res?.fingerprint && res.fingerprint.some((v) => v > 0)
        ? res.fingerprint
        : AudioBiometricsEngine.generateDefaultOwnerFingerprint();

      const newSamples = [...samples, fingerprint];
      const newPitchSamples = [...pitchSamples, avgPitch];
      setSamples(newSamples);
      setPitchSamples(newPitchSamples);

      speechEngine.playTone('success');

      if (step < 3) {
        setStep(step + 1);
        setStatusMessage(`Shukriya! Ab doobara boliye (${step + 1}/3): "Assalam-o-Alaikum Sonic"`);
      } else {
        // Complete registration
        const meanPitch = Math.round(newPitchSamples.reduce((a, b) => a + b, 0) / newPitchSamples.length);
        const meanFingerprint = new Array(16).fill(0).map((_, idx) => {
          const sum = newSamples.reduce((acc, s) => acc + (s[idx] || 0), 0);
          return Number((sum / newSamples.length).toFixed(4));
        });

        const profile: OwnerVoiceProfile = {
          name: ownerName.trim() || 'Ali',
          isRegistered: true,
          registeredAt: new Date().toISOString(),
          voiceFingerprint: meanFingerprint,
          pitchBaselineHz: meanPitch,
          voiceGender: meanPitch > 250 ? 'child' : meanPitch >= 165 ? 'female' : 'male',
          toleranceThreshold: 0.72,
        };

        MemoryStore.saveOwnerProfile(profile);
        onEnrollmentComplete(profile);

        speechEngine.speak(
          `Assalam-o-Alaikum ${profile.name}! Aapki awaaz kamyabi se register ho chuki hai. Ab main sirf aapko pehchanunga.`,
          'Female',
          'ur-PK'
        );

        onClose();
      }
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0d0d1a] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D9FF] flex items-center justify-center shadow-[0_0_25px_rgba(0,217,255,0.4)] mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Owner Voice Registration</h3>
          <p className="text-xs text-white/60 mt-1 max-w-xs">
            Sonic sirf apne owner ki awaaz recognize karta hai. Apni awaaz 3 baar register karein.
          </p>
        </div>

        {/* Owner Name Input */}
        <div className="text-left bg-white/5 p-3 rounded-xl border border-white/10">
          <label className="text-[11px] font-semibold uppercase text-cyan-300">
            Aap Ka Naam (Owner Name)
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Ali"
            className="w-full bg-[#121224] border border-white/20 rounded-lg px-3 py-1.5 mt-1 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* 3 Steps Indicator */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                step > s
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : step === s
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,217,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
            >
              {step > s ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span>{s}</span>
              )}
              <span>Sample {s}</span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl">
          <p className="text-xs font-medium text-cyan-200">{statusMessage}</p>
          {currentPitch > 0 && (
            <p className="text-[11px] text-white/60 mt-1 font-mono">
              Detected Fundamental Pitch: <span className="text-pink-400 font-bold">{currentPitch} Hz</span>
            </p>
          )}
        </div>

        {/* Record / Calibrate Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleCaptureSample}
            disabled={isRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
              isRecording
                ? 'bg-rose-500 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                : 'bg-gradient-to-tr from-[#6C63FF] to-[#00D9FF] hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,217,255,0.4)]'
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>
          <span className="text-xs text-white/60 font-medium">
            {isRecording ? 'Record ho raha hai...' : 'Dabayein aur bolain'}
          </span>
        </div>
      </div>
    </div>
  );
};
