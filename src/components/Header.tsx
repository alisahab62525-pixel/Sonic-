import React from 'react';
import { Cloud, CloudOff, Shield, ShieldAlert, Code2, Globe2, Settings as SettingsIcon, Download } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  isSimulatingGuest: boolean;
  onToggleGuestSimulation: () => void;
  onOpenWeather: () => void;
  onOpenAndroidCode: () => void;
  onOpenDownloadModal: () => void;
  onOpenSettings: () => void;
  onOpenPermissions: () => void;
  ownerName: string;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onToggleOnline,
  isSimulatingGuest,
  onToggleGuestSimulation,
  onOpenWeather,
  onOpenAndroidCode,
  onOpenDownloadModal,
  onOpenSettings,
  onOpenPermissions,
  ownerName,
}) => {
  return (
    <header className="w-full bg-[#0d0d1a]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Sonic Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C63FF] via-[#00D9FF] to-[#FF4FD8] p-[1.5px] shadow-[0_0_15px_rgba(0,217,255,0.4)]">
            <div className="w-full h-full bg-[#0d0d1a] rounded-[10px] flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#FF4FD8] font-black text-sm tracking-tighter">
                S
              </span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00D9FF] animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-white text-base tracking-tight font-sans">
                Sonic <span className="text-[#00D9FF]">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#B0B0C0] font-normal leading-none hidden sm:block">
              Voice Biometric Assistant
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Speaker Identity Test Switch (Owner vs Guest) */}
          <button
            onClick={onToggleGuestSimulation}
            title={isSimulatingGuest ? 'Switch to Owner voice profile' : 'Simulate unknown guest voice to test rejection'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSimulatingGuest
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            }`}
          >
            {isSimulatingGuest ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Guest Speaker</span>
                <span className="xs:hidden">Guest</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Owner: {ownerName}</span>
                <span className="xs:hidden">Owner</span>
              </>
            )}
          </button>

          {/* Online / Offline Status Toggle */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? 'Switch to Offline mode (Local AI + cached data)' : 'Switch to Online mode (Gemini 3.8 Flash)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isOnline
                ? 'bg-[#6C63FF]/15 border-[#6C63FF]/40 text-indigo-200'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            {isOnline ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Offline</span>
              </>
            )}
          </button>

          {/* World Weather & Time */}
          <button
            onClick={onOpenWeather}
            title="World Time & Weather"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
          >
            <Globe2 className="w-4 h-4 text-cyan-300" />
          </button>

          {/* Download & Install App */}
          <button
            onClick={onOpenDownloadModal}
            title="Download or Install Sonic AI on Phone"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/40 hover:to-teal-500/40 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Download App</span>
          </button>

          {/* Android Kotlin Code Export Viewer */}
          <button
            onClick={onOpenAndroidCode}
            title="Android Kotlin & Jetpack Compose Source Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#6C63FF]/30 to-[#00D9FF]/30 hover:from-[#6C63FF]/50 hover:to-[#00D9FF]/50 border border-cyan-400/30 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Android Code</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Assistant Settings"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 text-[#FF4FD8]" />
          </button>
        </div>
      </div>
    </header>
  );
};
