import React, { useState, useEffect } from 'react';
import { X, Volume2, Globe, Shield, Mic, Sliders, Play, RotateCcw, Cloud, CloudOff, Key, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { VoiceMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceMode: VoiceMode;
  onChangeVoiceMode: (mode: VoiceMode) => void;
  selectedLanguage: string;
  onChangeLanguage: (lang: string) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  toleranceThreshold: number;
  onChangeThreshold: (val: number) => void;
  noiseCancellation: boolean;
  onToggleNoiseCancellation: () => void;
  onOpenVoiceEnrollment: () => void;
  onPlaySampleVoice: (mode: VoiceMode) => void;
  ownerName: string;
  userApiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'Auto', name: 'Auto-Detect (Zubaan Khud Pehchane)' },
  { code: 'ur-PK', name: 'Urdu (اردو / Roman Urdu)' },
  { code: 'en-US', name: 'English (US / UK)' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
  { code: 'ar-SA', name: 'Arabic (العربية)' },
  { code: 'tr-TR', name: 'Turkish (Türkçe)' },
  { code: 'zh-CN', name: 'Chinese (Mandarin / 中文)' },
  { code: 'es-ES', name: 'Spanish (Español)' },
  { code: 'fr-FR', name: 'French (Français)' },
  { code: 'de-DE', name: 'German (Deutsch)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  voiceMode,
  onChangeVoiceMode,
  selectedLanguage,
  onChangeLanguage,
  isOnline,
  onToggleOnline,
  toleranceThreshold,
  onChangeThreshold,
  noiseCancellation,
  onToggleNoiseCancellation,
  onOpenVoiceEnrollment,
  onPlaySampleVoice,
  ownerName,
  userApiKey,
  onSaveApiKey,
  onClearApiKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(userApiKey || '');
  const [showKeyText, setShowKeyText] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    setApiKeyInput(userApiKey || '');
  }, [userApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKeyInput.trim()) return;
    onSaveApiKey(apiKeyInput.trim());
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleClear = () => {
    setApiKeyInput('');
    onClearApiKey();
  };

  const isConfigured = Boolean(userApiKey && userApiKey.trim().length > 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-[#FF4FD8]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Sonic AI Settings</h3>
              <p className="text-xs text-white/50">API Key, Awaaz, Zubaan, aur Biometrics Setup</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* 0. API KEY SETTINGS (Assistant Activation) */}
          <section className="p-4 rounded-xl bg-gradient-to-r from-[#6C63FF]/15 via-cyan-500/10 to-transparent border-2 border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    API Key Settings (Assistant Activation)
                  </h4>
                  <p className="text-[11px] text-white/60">
                    Sonic ko activate karne ke liye apni Gemini API Key enter karein.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono border ${
                  isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isConfigured ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>ACTIVE</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>INACTIVE / DISABLED</span>
                  </>
                )}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90">
                Enter your API Key
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKeyText ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key (e.g. AIzaSy...)"
                  className="w-full bg-[#121224] border border-white/20 rounded-xl px-3 py-2 pr-20 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="absolute right-2 text-white/40 hover:text-white p-1"
                  title={showKeyText ? 'Hide Key' : 'Show Key'}
                >
                  {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-white/40">
                Aapki API key aapke device ke secure storage mein save hogi, kisi code mein hardcode nahi hogi.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!apiKeyInput.trim()}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 disabled:opacity-40 text-black text-xs font-bold transition-all shadow-md"
                >
                  Save & Activate Sonic
                </button>
                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-rose-300 text-xs transition-colors"
                  >
                    Clear Key
                  </button>
                )}
              </div>

              {saveFeedback && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Key Saved! Sonic is Active</span>
                </span>
              )}
            </div>
          </section>

          {/* 1. Voice Mode (Male, Female, Child) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                <span>Sonic ki Awaaz (Voice Persona)</span>
              </label>
              <span className="text-[11px] text-white/40">Real-time pitch shift</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(['Female', 'Male', 'Child'] as VoiceMode[]).map((mode) => (
                <div
                  key={mode}
                  className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    voiceMode === mode
                      ? 'bg-gradient-to-b from-[#6C63FF]/30 to-[#00D9FF]/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,217,255,0.2)]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                  onClick={() => onChangeVoiceMode(mode)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{mode}</span>
                      <span className="text-xs">
                        {mode === 'Female' ? '👩' : mode === 'Male' ? '👨' : '🧒'}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 leading-tight">
                      {mode === 'Female'
                        ? 'Melodious & Clear'
                        : mode === 'Male'
                        ? 'Deep & Resonant'
                        : 'Bright & Cheerful'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySampleVoice(mode);
                    }}
                    className="mt-2.5 flex items-center justify-center gap-1 w-full py-1 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-medium text-cyan-300 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Sample Sunain</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Language Selection */}
          <section className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Zubaan (Language Mode)</span>
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="w-full bg-[#121224] border border-white/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-white/40">
              Sonic khud ba khud Roman Urdu, Nastaliq, English ya doosri zubaano mein jawab deta hai.
            </p>
          </section>

          {/* 3. Owner Voice Biometrics & Enrollment */}
          <section className="space-y-2.5 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Owner Voice Biometrics (Awaaz Registration)</span>
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  Registered Owner: <span className="text-emerald-300 font-bold">{ownerName}</span>
                </p>
              </div>

              <button
                onClick={onOpenVoiceEnrollment}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Register Voice</span>
              </button>
            </div>

            {/* Sensitivity Slider */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Speaker Recognition Sensitivity (Threshold):</span>
                <span className="font-mono text-cyan-300 font-bold">{(toleranceThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.90"
                step="0.05"
                value={toleranceThreshold}
                onChange={(e) => onChangeThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40">
                <span>Flexible (60%)</span>
                <span>Balanced (75%)</span>
                <span>Strict Biometric (90%)</span>
              </div>
            </div>
          </section>

          {/* 4. Connectivity & Noise Cancellation Toggles */}
          <section className="space-y-3">
            {/* Online / Offline Mode */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                {isOnline ? (
                  <Cloud className="w-4 h-4 text-cyan-400" />
                ) : (
                  <CloudOff className="w-4 h-4 text-rose-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {isOnline ? 'Online Mode (Gemini 3.8 Flash)' : 'Offline Mode (Local Intelligence)'}
                  </p>
                  <p className="text-[11px] text-white/40">
                    {isOnline
                      ? 'Cloud-powered deep conversations and global intelligence.'
                      : 'Works without internet using local memory and rule engine.'}
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleOnline}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isOnline ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isOnline ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Noise Cancellation */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Background Noise Cancellation</p>
                  <p className="text-[11px] text-white/40">
                    Biquad filter to reject fan noise, traffic, and room echoes.
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleNoiseCancellation}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  noiseCancellation ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    noiseCancellation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#121224]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D9FF] text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Tarteeb Mukammal (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
