import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Phone, MessageSquare, CloudSun, Brain, Music, Volume2 } from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isGuest: boolean;
  onToggleMic: () => void;
  onSendMessage: (text: string) => void;
  detectedPitchHz: number;
  detectedVoiceType: 'male' | 'female' | 'child';
  similarityScore: number;
  ownerName: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isGuest,
  onToggleMic,
  onSendMessage,
  detectedPitchHz,
  detectedVoiceType,
  similarityScore,
  ownerName,
}) => {
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    { label: 'Tokyo ka mausam aur time?', icon: CloudSun, query: 'Tokyo ka live time aur mausam kya hai?' },
    { label: 'Mujhe yaad hai kya?', icon: Brain, query: 'Mujhe yaad hai tum ne kal kya kaha tha? Meri pasand batao.' },
    { label: 'Call Mom (Ammi)', icon: Phone, query: 'Sonic, Ammi ko phone call milao' },
    { label: 'SMS Ahmed', icon: MessageSquare, query: "Ahmed ko SMS bhejo: 'Main raste mein hoon, 10 min mein pohonch raha hoon'" },
    { label: 'Dua / Motivation', icon: Sparkles, query: 'Sonic, koi pyari dua aur motivational baat sunao' },
    { label: 'Switch to Female Voice', icon: Volume2, query: 'Sonic, female voice mein baat karo' },
    { label: 'Koi mazaqiya joke', icon: Music, query: 'Sonic, mujhe ek zabardast funny joke sunao' },
  ];

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      {/* Biometric Verification Badge */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isGuest ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="text-white/70">Biometric:</span>
          <span className={isGuest ? 'text-amber-300 font-semibold' : 'text-emerald-300 font-semibold'}>
            {isGuest ? 'Unknown Speaker (42% match)' : `Owner Verified (${(similarityScore * 100).toFixed(0)}% match)`}
          </span>
        </div>

        {detectedPitchHz > 0 && (
          <div className="flex items-center gap-1 text-white/50 border-l border-white/10 pl-2">
            <span>Pitch:</span>
            <span className="text-cyan-300 font-bold">{detectedPitchHz} Hz</span>
            <span className="capitalize text-white/80">({detectedVoiceType})</span>
          </div>
        )}
      </div>

      {/* Main Mic Button */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring when mic listening */}
        {isListening && (
          <div className="absolute w-24 h-24 rounded-full bg-[#00D9FF]/25 animate-ping pointer-events-none" />
        )}

        <button
          onClick={onToggleMic}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 ${
            isListening
              ? 'bg-gradient-to-tr from-[#FF4FD8] to-[#E63946] text-white shadow-[0_0_40px_rgba(255,79,216,0.6)] scale-105'
              : 'bg-gradient-to-tr from-[#6C63FF] via-[#00D9FF] to-[#6C63FF] text-white shadow-[0_0_35px_rgba(0,217,255,0.4)] hover:shadow-[0_0_45px_rgba(108,99,255,0.6)] hover:scale-102'
          }`}
          title={isListening ? 'Stop listening' : 'Tap to speak to Sonic'}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 animate-pulse text-white" />
          ) : (
            <Mic className="w-9 h-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
          )}
        </button>
      </div>

      <p className="text-xs text-[#B0B0C0] font-medium flex items-center gap-1.5">
        {isListening ? (
          <span className="text-cyan-300 animate-pulse font-semibold">Sonic sun raha hai... Bolain</span>
        ) : isSpeaking ? (
          <span className="text-[#FF4FD8] font-semibold">Sonic bol raha hai...</span>
        ) : (
          <span>Mic dabayein ya &quot;Sonic&quot; bolain</span>
        )}
      </p>

      {/* Quick Prompts Carousel */}
      <div className="w-full max-w-xl overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 px-1">
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSendMessage(item.query)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white/80 hover:text-white text-xs font-medium whitespace-nowrap transition-all shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text fallback input */}
      <form
        onSubmit={handleSend}
        className="w-full max-w-xl flex items-center gap-2 bg-[#121224]/80 backdrop-blur-md rounded-2xl p-1.5 pl-4 border border-white/10 shadow-lg focus-within:border-cyan-400/50 transition-colors"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Boliye ya type karein (e.g. "Sonic, Tokyo ka time?")`}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D9FF] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
