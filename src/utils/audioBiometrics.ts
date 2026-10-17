/**
 * Audio Biometrics & Voice Fingerprinting Engine
 * Analyzes audio streams, extracts acoustic features (MFCC proxy, spectral centroid, pitch F0),
 * and calculates speaker similarity against the registered owner's voice profile.
 */

export interface VoiceAnalysisResult {
  fingerprint: number[];
  pitchHz: number;
  detectedType: 'male' | 'female' | 'child';
  spectralCentroid: number;
  volumeLevel: number;
}

export class AudioBiometricsEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isListening: boolean = false;

  async initMic(): Promise<boolean> {
    try {
      if (this.mediaStream) {
        return true;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);

      // Noise gate / bandpass filter for voice frequencies (80Hz to 3800Hz)
      this.filterNode = this.audioContext.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.value = 1800;
      this.filterNode.Q.value = 0.7;

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;

      source.connect(this.filterNode);
      this.filterNode.connect(this.analyser);

      this.isListening = true;
      return true;
    } catch (err) {
      console.warn('Microphone access not granted or failed:', err);
      return false;
    }
  }

  stopMic(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isListening = false;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Samples current audio and calculates real-time acoustic fingerprint + pitch
   */
  sampleCurrentAudio(): VoiceAnalysisResult | null {
    if (!this.analyser || !this.audioContext) return null;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Float32Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    this.analyser.getFloatTimeDomainData(timeData);
    this.analyser.getByteFrequencyData(freqData);

    // Calculate RMS volume level
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      sumSquares += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sumSquares / timeData.length);

    // If practically silent, return low-energy fallback
    if (rms < 0.01) {
      return {
        fingerprint: new Array(16).fill(0),
        pitchHz: 0,
        detectedType: 'male',
        spectralCentroid: 0,
        volumeLevel: rms,
      };
    }

    // 1. Fundamental Pitch Detection using Autocorrelation
    const sampleRate = this.audioContext.sampleRate;
    const pitchHz = this.detectPitchAutocorrelation(timeData, sampleRate);

    // 2. Classify voice type based on pitch
    let detectedType: 'male' | 'female' | 'child' = 'female';
    if (pitchHz > 0) {
      if (pitchHz > 250) {
        detectedType = 'child';
      } else if (pitchHz >= 165) {
        detectedType = 'female';
      } else {
        detectedType = 'male';
      }
    }

    // 3. 16-band Filter Bank Energy (MFCC Acoustic features proxy)
    const bandSize = Math.floor(bufferLength / 16);
    const bands: number[] = [];
    let weightedFreqSum = 0;
    let totalMagnitude = 0;

    for (let b = 0; b < 16; b++) {
      let bandEnergy = 0;
      const start = b * bandSize;
      const end = start + bandSize;
      for (let i = start; i < end; i++) {
        const mag = freqData[i] / 255;
        bandEnergy += mag;
        const freq = (i * sampleRate) / (2 * bufferLength);
        weightedFreqSum += freq * mag;
        totalMagnitude += mag;
      }
      bands.push(bandEnergy / bandSize);
    }

    // 4. Spectral Centroid
    const spectralCentroid = totalMagnitude > 0 ? weightedFreqSum / totalMagnitude : 0;

    // Normalize fingerprint vector
    const norm = Math.sqrt(bands.reduce((acc, val) => acc + val * val, 0)) || 1;
    const normalizedFingerprint = bands.map((v) => Number((v / norm).toFixed(4)));

    return {
      fingerprint: normalizedFingerprint,
      pitchHz: Math.round(pitchHz),
      detectedType,
      spectralCentroid: Math.round(spectralCentroid),
      volumeLevel: rms,
    };
  }

  /**
   * Autocorrelation Pitch Detector
   */
  private detectPitchAutocorrelation(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let maxSamples = Math.floor(SIZE / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.015) return 0; // Not enough signal

    let lastCorrelation = 1;
    for (let offset = 1; offset < maxSamples; offset++) {
      let correlation = 0;
      for (let i = 0; i < maxSamples; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }
      correlation = 1 - correlation / maxSamples;

      if (correlation > 0.88 && correlation > lastCorrelation) {
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }
      lastCorrelation = correlation;
    }

    if (bestCorrelation > 0.8 && bestOffset > 0) {
      const fundamentalFreq = sampleRate / bestOffset;
      // Filter out unreasonable frequencies for human voice (60Hz to 600Hz)
      if (fundamentalFreq >= 65 && fundamentalFreq <= 650) {
        return fundamentalFreq;
      }
    }
    return 0;
  }

  /**
   * Cosine Similarity between two voice fingerprint vectors
   * Range: 0.0 to 1.0 (1.0 = identical)
   */
  static compareFingerprints(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, Number(similarity.toFixed(3))));
  }

  /**
   * Generates a calibrated baseline fingerprint for simulated owner enrollment
   */
  static generateDefaultOwnerFingerprint(): number[] {
    // Realistic standard acoustic curve
    return [0.08, 0.22, 0.35, 0.42, 0.38, 0.31, 0.26, 0.21, 0.18, 0.15, 0.12, 0.09, 0.07, 0.05, 0.04, 0.02];
  }
}
