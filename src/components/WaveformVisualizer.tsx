import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  color?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  analyser,
  isActive,
  color = '#00D9FF',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isActive && analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle wave animation
        const time = Date.now() * 0.003;
        for (let i = 0; i < 32; i++) {
          dataArray[i] = 15 + Math.sin(time + i * 0.3) * 12;
        }
      }

      const barCount = 36;
      const barWidth = 3;
      const gap = (width - barCount * barWidth) / (barCount - 1);
      const halfHeight = height / 2;

      for (let i = 0; i < barCount; i++) {
        // Mirrored frequency visualization from center
        const index = Math.abs(i - barCount / 2);
        const value = dataArray[Math.floor((index / (barCount / 2)) * 28)] || 10;
        const normalized = value / 255;
        const barHeight = Math.max(4, normalized * (halfHeight - 4));

        const x = i * (barWidth + gap);
        const yTop = halfHeight - barHeight;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, yTop, 0, halfHeight + barHeight);
        gradient.addColorStop(0, '#FF4FD8');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#6C63FF');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, yTop, barWidth, barHeight * 2, [3]);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyser, isActive, color]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={340}
        height={48}
        className="w-full max-w-[340px] h-12 rounded-lg opacity-90"
      />
    </div>
  );
};
