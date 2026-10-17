import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

function createIcon(size, outputPath) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * 0.42;
  const innerRadius = size * 0.28;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Dark background with rounded corners
      const cornerRadius = size * 0.22;
      const inBoxX = Math.abs(dx) <= center - cornerRadius;
      const inBoxY = Math.abs(dy) <= center - cornerRadius;
      let inCard = false;

      if (inBoxX || inBoxY) {
        inCard = Math.abs(dx) <= center && Math.abs(dy) <= center;
      } else {
        const cornerDx = Math.abs(dx) - (center - cornerRadius);
        const cornerDy = Math.abs(dy) - (center - cornerRadius);
        inCard = (cornerDx * cornerDx + cornerDy * cornerDy) <= (cornerRadius * cornerRadius);
      }

      if (!inCard) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0; // Transparent
        continue;
      }

      // Base card dark blue-purple
      let r = 13;
      let g = 13;
      let b = 26;
      let a = 255;

      // Outer glow aura
      if (dist < radius * 1.3) {
        const glowFactor = Math.max(0, 1 - dist / (radius * 1.3));
        r = Math.min(255, r + 108 * glowFactor * 0.5);
        g = Math.min(255, g + 99 * glowFactor * 0.4);
        b = Math.min(255, b + 255 * glowFactor * 0.8);
      }

      // Main gradient orb
      if (dist <= radius) {
        const orbFactor = 1 - (dist / radius);
        // Gradient from Purple (#6C63FF) to Cyan (#00D9FF) to Pink (#FF4FD8)
        const t = (dx + dy) / (2 * radius) + 0.5;
        const orbR = Math.floor(108 * (1 - t) + 255 * t);
        const orbG = Math.floor(99 * (1 - t) + 79 * t + 100 * (1 - Math.abs(t - 0.5)));
        const orbB = Math.floor(255 * (1 - t) + 216 * t);

        r = Math.floor(r * (1 - orbFactor) + orbR * orbFactor);
        g = Math.floor(g * (1 - orbFactor) + orbG * orbFactor);
        b = Math.floor(b * (1 - orbFactor) + orbB * orbFactor);

        // Core bright nucleus
        if (dist <= innerRadius) {
          const coreFactor = Math.pow(1 - dist / innerRadius, 1.8);
          r = Math.min(255, Math.floor(r + (255 - r) * coreFactor * 0.85));
          g = Math.min(255, Math.floor(g + (255 - g) * coreFactor * 0.95));
          b = Math.min(255, Math.floor(b + (255 - b) * coreFactor));
        }

        // Specular 3D highlight top-left
        const specDx = x - (center - size * 0.12);
        const specDy = y - (center - size * 0.12);
        const specDist = Math.sqrt(specDx * specDx + specDy * specDy);
        if (specDist < size * 0.1) {
          const specFactor = (1 - specDist / (size * 0.1)) * 0.6;
          r = Math.min(255, r + 255 * specFactor);
          g = Math.min(255, g + 255 * specFactor);
          b = Math.min(255, b + 255 * specFactor);
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath} (${size}x${size})`);
}

createIcon(192, path.resolve(process.cwd(), 'public/icon-192.png'));
createIcon(512, path.resolve(process.cwd(), 'public/icon-512.png'));
createIcon(192, path.resolve(process.cwd(), 'public/icon-maskable-192.png'));
createIcon(512, path.resolve(process.cwd(), 'public/icon-maskable-512.png'));
