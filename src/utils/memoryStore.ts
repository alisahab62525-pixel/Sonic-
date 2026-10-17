import { MemoryItem, OwnerVoiceProfile, ChatMessage } from '../types';
import { AudioBiometricsEngine } from './audioBiometrics';

const STORAGE_KEY_MEMORIES = 'sonic_memories_v1';
const STORAGE_KEY_PROFILE = 'sonic_owner_profile_v1';
const STORAGE_KEY_CHATS = 'sonic_chats_v1';
const STORAGE_KEY_SETTINGS = 'sonic_settings_v1';

export const DEFAULT_OWNER: OwnerVoiceProfile = {
  name: 'Ali',
  isRegistered: true,
  registeredAt: '2026-10-15T12:00:00Z',
  voiceFingerprint: AudioBiometricsEngine.generateDefaultOwnerFingerprint(),
  pitchBaselineHz: 135,
  voiceGender: 'male',
  toleranceThreshold: 0.72,
};

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'personal',
    fact: "Owner ka naam Ali hai aur woh software engineering aur AI projects par kaam karta hai.",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    encrypted: true,
    confidence: 0.98,
  },
  {
    id: 'mem-2',
    category: 'family',
    fact: "Ammi ki tabiyat ka khayal rakhna Ali ke liye sab se zaroori hai. Chhota bhai Ahmed university mein hai.",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    encrypted: true,
    confidence: 0.95,
  },
  {
    id: 'mem-3',
    category: 'preference',
    fact: "Ali ko garam karak chai aur chicken biryani bohot pasand hai. Raat ko late coding karte waqt chai peeta hai.",
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    encrypted: true,
    confidence: 0.99,
  },
  {
    id: 'mem-4',
    category: 'date',
    fact: "Ali ki saalgirah (Birthday) 14 August ko aati hai. Next week project demo scheduled hai.",
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    encrypted: true,
    confidence: 0.96,
  },
  {
    id: 'mem-5',
    category: 'feeling',
    fact: "Jab project deploy ho jata hai to bohot pur-sukoon aur khush mehsoos hota hai.",
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    encrypted: true,
    confidence: 0.92,
  },
];

export const INITIAL_CHATS: ChatMessage[] = [
  {
    id: 'chat-0',
    sender: 'sonic',
    text: "Assalam-o-Alaikum Ali! Main Sonic hoon, aapka mukhlis aur wafaadaar voice assistant. Main aapki awaaz pehchan chuka hoon. Boliye, aaj main aapki kya madad kar sakta hoon?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    emotion: 'friendly',
    isOwnerVerified: true,
    similarityScore: 0.96,
  },
];

export class MemoryStore {
  static getMemories(): MemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MEMORIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load memories:', e);
    }
    return INITIAL_MEMORIES;
  }

  static saveMemories(memories: MemoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.warn('Failed to save memories:', e);
    }
  }

  static addMemory(category: MemoryItem['category'], fact: string): MemoryItem {
    const memories = this.getMemories();
    // Prevent duplicate facts
    const exists = memories.some(m => m.fact.toLowerCase().includes(fact.toLowerCase().slice(0, 20)));
    if (exists) {
      return memories.find(m => m.fact.toLowerCase().includes(fact.toLowerCase().slice(0, 20)))!;
    }

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      category,
      fact,
      timestamp: new Date().toISOString(),
      encrypted: true,
      confidence: 0.95,
    };
    memories.unshift(newItem);
    this.saveMemories(memories);
    return newItem;
  }

  static deleteMemory(id: string): void {
    const memories = this.getMemories().filter((m) => m.id !== id);
    this.saveMemories(memories);
  }

  static clearAllMemories(): void {
    this.saveMemories([]);
  }

  static resetDefaultMemories(): void {
    this.saveMemories(INITIAL_MEMORIES);
  }

  // Owner Voice Profile
  static getOwnerProfile(): OwnerVoiceProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }
    return DEFAULT_OWNER;
  }

  static saveOwnerProfile(profile: OwnerVoiceProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }

  // Chat History
  static getChats(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load chats:', e);
    }
    return INITIAL_CHATS;
  }

  static saveChats(chats: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats.slice(-50)));
    } catch (e) {
      console.warn('Failed to save chats:', e);
    }
  }

  static addChat(chat: ChatMessage): void {
    const chats = this.getChats();
    chats.push(chat);
    this.saveChats(chats);
  }

  static clearChats(): void {
    this.saveChats([]);
  }
}
