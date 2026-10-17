import React, { useEffect, useRef } from 'react';
import { AssistantEmotion } from '../types';

interface GlowingOrbProps {
  emotion: AssistantEmotion;
  isListening: boolean;
  isSpeaking: boolean;
  isGuest: boolean;
  volumeLevel: number;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  emotion,
  isListening,
  isSpeaking,
  isGuest,
  volumeLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic scale calculation based on volume and state
  const baseScale = isListening || isSpeaking ? 1.0 + Math.min(volumeLevel * 1.5, 0.3) : 1.0;

  // Particle energy simulation inside canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * 260,
      y: Math.random() * 260,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: (Math.random() - 0.5) * 1.2,
      color: Math.random() > 0.5 ? '#00D9FF' : '#FF4FD8',
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, 260, 260);
      const centerX = 130;
      const centerY = 130;

      angle += 0.02;

      // Draw rotating magnetic orbit rings
      const ringRadius = 75 + Math.sin(angle * 2) * 4;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadius, ringRadius * 0.4, angle, 0, Math.PI * 2);
      ctx.strokeStyle = isGuest
        ? 'rgba(255, 180, 0, 0.45)'
        : isListening
        ? 'rgba(0, 217, 255, 0.6)'
        : isSpeaking
        ? 'rgba(255, 79, 216, 0.6)'
        : 'rgba(108, 99, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadius * 0.9, ringRadius * 0.45, -angle * 1.4, 0, Math.PI * 2);
      ctx.strokeStyle = isGuest
        ? 'rgba(255, 100, 0, 0.35)'
        : 'rgba(0, 217, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // Draw floating energetic sparks
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Keep inside bounds
        const dist = Math.hypot(p.x - centerX, p.y - centerY);
        if (dist > 85) {
          p.x = centerX + (p.x - centerX) * 0.9;
          p.y = centerY + (p.y - centerY) * 0.9;
          p.speedX *= -1;
          p.speedY *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isGuest ? `rgba(255, 180, 0, ${p.alpha})` : p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking, isGuest]);

  // Color theme per state
  let primaryGlow = 'from-[#6C63FF] via-[#00D9FF] to-[#FF4FD8]';
  let ambientShadow = 'shadow-[0_0_80px_rgba(108,99,255,0.45)]';
  let coreBg = 'from-[#6C63FF] to-[#00D9FF]';

  if (isGuest) {
    primaryGlow = 'from-[#FFB703] via-[#FB8500] to-[#E63946]';
    ambientShadow = 'shadow-[0_0_80px_rgba(251,133,0,0.45)]';
    coreBg = 'from-[#FB8500] to-[#E63946]';
  } else if (isListening) {
    primaryGlow = 'from-[#00D9FF] via-[#3A86FF] to-[#8338EC]';
    ambientShadow = 'shadow-[0_0_100px_rgba(0,217,255,0.6)]';
    coreBg = 'from-[#00D9FF] to-[#3A86FF]';
  } else if (isSpeaking) {
    primaryGlow = 'from-[#FF4FD8] via-[#8338EC] to-[#00D9FF]';
    ambientShadow = 'shadow-[0_0_100px_rgba(255,79,216,0.6)]';
    coreBg = 'from-[#FF4FD8] to-[#8338EC]';
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64 select-none">
      {/* Outer Diffuse Halo */}
      <div
        style={{ transform: `scale(${baseScale * 1.12})` }}
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${primaryGlow} opacity-35 blur-3xl transition-transform duration-300 pointer-events-none animate-pulse`}
      />

      {/* Middle Atmospheric Glow */}
      <div
        style={{ transform: `scale(${baseScale})` }}
        className={`absolute w-52 h-52 rounded-full bg-gradient-to-tr ${primaryGlow} opacity-70 blur-xl transition-all duration-300 ${ambientShadow}`}
      />

      {/* Glassmorphic Spherical Shell */}
      <div
        style={{ transform: `scale(${baseScale})` }}
        className="relative w-44 h-44 rounded-full p-[2px] bg-gradient-to-b from-white/40 via-white/10 to-transparent shadow-2xl backdrop-blur-md overflow-hidden transition-transform duration-200"
      >
        {/* Core Gradient Orb */}
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${coreBg} opacity-90 relative flex items-center justify-center overflow-hidden`}
        >
          {/* Specular Highlight (Glass 3D reflection) */}
          <div className="absolute top-2 left-6 w-16 h-8 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-[2px] transform -rotate-15 pointer-events-none" />

          {/* Interactive Particle Canvas */}
          <canvas
            ref={canvasRef}
            width={260}
            height={260}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Center Pulsing Nucleus */}
          <div className="relative flex flex-col items-center justify-center text-center z-10">
            {isGuest ? (
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-2xl">🔒</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-200 mt-1 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/40">
                  Guest
                </span>
              </div>
            ) : isListening ? (
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#00D9FF] animate-ping" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-200 mt-2 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-400/40">
                  Listening
                </span>
              </div>
            ) : isSpeaking ? (
              <div className="flex flex-col items-center">
                <div className="flex space-x-1 items-end h-5">
                  <div className="w-1 bg-white rounded-full h-2 animate-[pulse_0.4s_ease-in-out_infinite]" />
                  <div className="w-1 bg-white rounded-full h-5 animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <div className="w-1 bg-white rounded-full h-3 animate-[pulse_0.5s_ease-in-out_infinite]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-pink-200 mt-1.5 bg-pink-950/70 px-2 py-0.5 rounded-full border border-pink-400/40">
                  Speaking
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-white/90 shadow-[0_0_15px_#fff] mb-1" />
                <span className="text-[11px] font-semibold text-white/90 tracking-wide font-mono">
                  SONIC
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
