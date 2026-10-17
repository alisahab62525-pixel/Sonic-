export type VoiceMode = 'Male' | 'Female' | 'Child';

export type AssistantEmotion = 'idle' | 'listening' | 'thinking' | 'speaking' | 'friendly' | 'joyful' | 'caring' | 'supportive' | 'protective' | 'witty' | 'alert' | 'thoughtful';

export interface OwnerVoiceProfile {
  name: string;
  isRegistered: boolean;
  registeredAt: string;
  voiceFingerprint: number[];
  pitchBaselineHz: number;
  voiceGender: 'male' | 'female' | 'child';
  toleranceThreshold: number; // e.g., 0.75
}

export interface MemoryItem {
  id: string;
  category: 'personal' | 'family' | 'preference' | 'date' | 'feeling' | 'plan';
  fact: string;
  timestamp: string;
  encrypted: boolean;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sonic' | 'guest';
  text: string;
  timestamp: string;
  emotion?: AssistantEmotion;
  isOwnerVerified?: boolean;
  similarityScore?: number;
  actionType?: string;
  actionData?: any;
}

export interface WeatherData {
  city: string;
  country?: string;
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
  time: string;
  timezone: string;
  cached?: boolean;
}

export interface PermissionStatus {
  id: string;
  title: string;
  description: string;
  icon: string;
  granted: boolean;
  required: boolean;
  actionName: string;
}
