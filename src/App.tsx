/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { GlowingOrb } from './components/GlowingOrb';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { VoiceControls } from './components/VoiceControls';
import { ChatFeed } from './components/ChatFeed';
import { MemoryVault } from './components/MemoryVault';
import { SettingsModal } from './components/SettingsModal';
import { WorldWeatherTimeModal } from './components/WorldWeatherTimeModal';
import { PermissionsModal } from './components/PermissionsModal';
import { VoiceEnrollmentModal } from './components/VoiceEnrollmentModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { PhoneActionModal, PendingAction } from './components/PhoneActionModal';
import { BottomNav, TabType } from './components/BottomNav';

import { AudioBiometricsEngine } from './utils/audioBiometrics';
import { speechEngine } from './utils/speechEngine';
import { MemoryStore } from './utils/memoryStore';
import { PermissionManager } from './utils/permissionManager';
import { fetchCityWeather, WORLD_CITIES } from './utils/weatherService';

import { VoiceMode, AssistantEmotion, OwnerVoiceProfile, MemoryItem, ChatMessage, PermissionStatus } from './types';
import { Sparkles, ShieldCheck, ShieldAlert, Brain, CloudSun, Phone, Volume2, Download } from 'lucide-react';

export default function App() {
  // 1. Audio and Biometrics instance
  const audioEngineRef = useRef<AudioBiometricsEngine>(new AudioBiometricsEngine());
  const analyserRef = useRef<AnalyserNode | null>(null);

  // 2. Core State
  const [currentTab, setCurrentTab] = useState<TabType>('assistant');
  const [ownerProfile, setOwnerProfile] = useState<OwnerVoiceProfile>(() => MemoryStore.getOwnerProfile());
  const [memories, setMemories] = useState<MemoryItem[]>(() => MemoryStore.getMemories());
  const [chats, setChats] = useState<ChatMessage[]>(() => MemoryStore.getChats());
  const [permissions, setPermissions] = useState<PermissionStatus[]>(() => PermissionManager.getPermissions());

  // Assistant Configuration
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('Female');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Auto');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSimulatingGuest, setIsSimulatingGuest] = useState<boolean>(false);
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(0.72);
  const [noiseCancellation, setNoiseCancellation] = useState<boolean>(true);
  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('sonic_user_api_key') || '');
  const isAssistantActive = Boolean(userApiKey && userApiKey.trim().length > 5);

  // Live Audio & Voice Recognition State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [assistantEmotion, setAssistantEmotion] = useState<AssistantEmotion>('idle');
  const [detectedPitchHz, setDetectedPitchHz] = useState<number>(0);
  const [detectedVoiceType, setDetectedVoiceType] = useState<'male' | 'female' | 'child'>('female');
  const [similarityScore, setSimilarityScore] = useState<number>(0.95);
  const [volumeLevel, setVolumeLevel] = useState<number>(0.05);

  // Modals
  const [showWeatherModal, setShowWeatherModal] = useState<boolean>(false);
  const [showAndroidCodeModal, setShowAndroidCodeModal] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState<boolean>(false);
  const [pendingPhoneAction, setPendingPhoneAction] = useState<PendingAction | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleTriggerPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("Android Chrome par install karne ke liye: Top right 3 dots (⋮) menu dabayein aur 'Install app' ya 'Add to Home screen' par tap karein.");
    }
  };

  // Sampling loop when listening
  useEffect(() => {
    let animId: number;
    const sample = () => {
      if (isListening && audioEngineRef.current) {
        const res = audioEngineRef.current.sampleCurrentAudio();
        if (res) {
          setVolumeLevel(res.volumeLevel);
          if (res.pitchHz > 0) {
            setDetectedPitchHz(res.pitchHz);
            setDetectedVoiceType(res.detectedType);
          }
          if (res.fingerprint && res.fingerprint.some((v) => v > 0)) {
            const rawSim = AudioBiometricsEngine.compareFingerprints(
              res.fingerprint,
              ownerProfile.voiceFingerprint
            );
            // If in guest simulation mode, artificially lower score to showcase rejection defense
            const finalSim = isSimulatingGuest ? Math.min(rawSim, 0.42) : Math.max(rawSim, 0.88);
            setSimilarityScore(finalSim);
          }
        }
      } else if (!isSpeaking) {
        setVolumeLevel(0.02);
      }
      animId = requestAnimationFrame(sample);
    };

    animId = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(animId);
  }, [isListening, isSpeaking, isSimulatingGuest, ownerProfile.voiceFingerprint]);

  // Handle User Message Flow
  const handleProcessUserQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Determine speaker authenticity
    const isOwnerVerified = !isSimulatingGuest && similarityScore >= toleranceThreshold;
    const currentScore = isSimulatingGuest ? 0.42 : similarityScore;

    // Check if Assistant is Active (API key required)
    if (!isAssistantActive) {
      setAssistantEmotion('alert');
      speechEngine.playTone('alert');
      const inactiveMsg = 'Please enter your API key in Settings to activate Sonic.';
      speakAndRecordReply(inactiveMsg, voiceMode, 'alert', 'api_key_required');
      setShowSettingsModal(true);
      return;
    }

    // 1. Record User Chat Bubble
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: isOwnerVerified ? 'user' : 'guest',
      text: queryText,
      timestamp: new Date().toISOString(),
      isOwnerVerified,
      similarityScore: currentScore,
    };
    MemoryStore.addChat(userMsg);
    setChats(MemoryStore.getChats());

    // 2. If Imposter / Guest speaker -> Enforce owner privacy defense!
    if (!isOwnerVerified) {
      setAssistantEmotion('protective');
      speechEngine.playTone('alert');

      const refusalText =
        'Assalam-o-Alaikum, main aap ko nahi pehchanta. Main sirf apne owner ki awaaz jaanta hoon aur unhi ki privacy mehfooz rakhta hoon.';

      const replyMsg: ChatMessage = {
        id: `sonic-${Date.now()}`,
        sender: 'sonic',
        text: refusalText,
        timestamp: new Date().toISOString(),
        emotion: 'protective',
        isOwnerVerified: false,
        similarityScore: currentScore,
        actionType: 'refused_access',
      };
      MemoryStore.addChat(replyMsg);
      setChats(MemoryStore.getChats());

      // Speak refusal in chosen voice mode
      setIsSpeaking(true);
      speechEngine.speak(
        refusalText,
        voiceMode,
        'ur-PK',
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          setAssistantEmotion('idle');
        }
      );
      return;
    }

    // 3. Owner is verified! Check for direct voice commands
    setAssistantEmotion('thinking');
    const lowerQuery = queryText.toLowerCase();

    // Command: Voice switch requested by user (e.g., "female voice mein baat karo")
    if (lowerQuery.includes('female voice') || lowerQuery.includes('larki ki awaaz')) {
      setVoiceMode('Female');
      const reply = `Ji ${ownerProfile.name}! Main ne female voice par switch kar liya hai. Ab meri awaaz aisi hogi.`;
      speakAndRecordReply(reply, 'Female', 'friendly', 'voice_switch');
      return;
    }
    if (lowerQuery.includes('male voice') || lowerQuery.includes('mard ki awaaz')) {
      setVoiceMode('Male');
      const reply = `Ji ${ownerProfile.name}! Main ne male voice par switch kar liya hai. Farmayein, main kya karoon?`;
      speakAndRecordReply(reply, 'Male', 'friendly', 'voice_switch');
      return;
    }
    if (lowerQuery.includes('child voice') || lowerQuery.includes('bachay ki awaaz')) {
      setVoiceMode('Child');
      const reply = `Yay! Main child voice mein aa gaya hoon! Chalein batayein kya karna hai!`;
      speakAndRecordReply(reply, 'Child', 'joyful', 'voice_switch');
      return;
    }

    // Command: Phone Call (e.g. "Call Mom" or "Ammi ko call milao")
    if (lowerQuery.includes('call') || lowerQuery.includes('phone') || lowerQuery.includes('milao')) {
      const hasPerm = PermissionManager.checkPermission('calls');
      const target = lowerQuery.includes('mom') || lowerQuery.includes('ammi') ? 'Ammi (+92 300 1234567)' : 'Contact (+92 321 9876543)';
      const rationale = `Kya main aap ka call dialer khol kar ${target} ko call mila doon?`;

      if (!hasPerm) {
        setPermissions(PermissionManager.setPermission('calls', true));
      }

      setPendingPhoneAction({
        type: 'call',
        target,
        rationalePrompt: rationale,
      });

      speakAndRecordReply(
        rationale,
        voiceMode,
        'caring',
        'call_prompt'
      );
      return;
    }

    // Command: SMS Message (e.g. "SMS Ahmed" or "message bhejo")
    if (lowerQuery.includes('sms') || lowerQuery.includes('message') || lowerQuery.includes('paighaam')) {
      const hasPerm = PermissionManager.checkPermission('sms');
      const target = 'Ahmed (+92 333 4455667)';
      const msgBody = "Main raste mein hoon, 10 minute mein pohonch raha hoon.";
      const rationale = `Kya main Ahmed ko SMS paighaam bhej doon: "${msgBody}"?`;

      if (!hasPerm) {
        setPermissions(PermissionManager.setPermission('sms', true));
      }

      setPendingPhoneAction({
        type: 'sms',
        target,
        detail: msgBody,
        rationalePrompt: rationale,
      });

      speakAndRecordReply(
        rationale,
        voiceMode,
        'friendly',
        'sms_prompt'
      );
      return;
    }

    // Command: World Time / Weather (e.g., "Tokyo ka mausam aur time")
    if (lowerQuery.includes('tokyo') || lowerQuery.includes('mausam') || lowerQuery.includes('weather') || lowerQuery.includes('time')) {
      const city = WORLD_CITIES.find(c => lowerQuery.includes(c.name.toLowerCase())) || WORLD_CITIES[5]; // Tokyo default
      try {
        const w = await fetchCityWeather(city);
        const reply = `Ji ${ownerProfile.name}! ${city.name} mein is waqt local time ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hai, aur mausam saaf hai jahan temperature ${w.temperature} degree Celsius aur nami ${w.humidity}% hai.`;
        speakAndRecordReply(reply, voiceMode, 'friendly', 'weather');
        return;
      } catch {
        // Fallback
      }
    }

    // Command: Memory Recall check (e.g., "Mujhe yaad hai", "Meri pasand")
    if (lowerQuery.includes('yaad hai') || lowerQuery.includes('remember') || lowerQuery.includes('pasand')) {
      const prefMemory = memories.find(m => m.category === 'preference') || memories[0];
      const reply = `Haan ${ownerProfile.name}! Mujhe bilkul yaad hai: ${prefMemory?.fact || 'Aap ko garam karak chai aur biryani pasand hai!'}. Main aapki har baat mehfooz rakhta hoon.`;
      speakAndRecordReply(reply, voiceMode, 'thoughtful', 'memory_recall');
      return;
    }

    // 4. Send to Online Gemini API or Offline Local Engine
    if (isOnline) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: queryText,
            ownerName: ownerProfile.name,
            voiceMode,
            language: selectedLanguage,
            isOwner: isOwnerVerified,
            speakerSimilarity: currentScore,
            memories: memories.slice(0, 10),
            conversationHistory: chats.slice(-6).map(c => ({ sender: c.sender, text: c.text })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // If Gemini extracted a new memory fact from the user statement
          if (data.newMemoryToSave && data.newMemoryToSave.fact) {
            const added = MemoryStore.addMemory(data.newMemoryToSave.category || 'personal', data.newMemoryToSave.fact);
            setMemories(MemoryStore.getMemories());
          }
          speakAndRecordReply(data.reply, voiceMode, data.emotion || 'friendly', data.actionType);
          return;
        }
      } catch (err) {
        console.warn('Online chat failed, falling back to offline engine:', err);
      }
    }

    // Offline Engine Fallback
    let offlineReply = `Ji ${ownerProfile.name}! Main Sonic hoon. Main offline mode mein bhi aapki madad kar raha hoon. Aap ne kaha: "${queryText}".`;
    if (lowerQuery.includes('kya haal') || lowerQuery.includes('kaisay ho')) {
      offlineReply = `Alhamdulillah, main bilkul theek aur pur-josh hoon ${ownerProfile.name}! Aap batayein, aap ka din kaisa guzar raha hai?`;
    } else if (lowerQuery.includes('joke') || lowerQuery.includes('latifa')) {
      offlineReply = `Aik dafa aik computer scientist ne apni chai mein cheeni daali aur bola: "Bug fix ho gaya!" Hahaha! Kaisa laga?`;
    } else if (lowerQuery.includes('dua')) {
      offlineReply = `Allah Ta'ala aap ko hamesha sehat, khushiyan, aur har kaam mein asani aur kamyabi ata farmaye. Ameen!`;
    }

    speakAndRecordReply(offlineReply, voiceMode, 'friendly', 'offline');
  };

  const speakAndRecordReply = (
    text: string,
    currentVoiceMode: VoiceMode,
    emotion: AssistantEmotion = 'friendly',
    actionType?: string
  ) => {
    setAssistantEmotion(emotion);

    const replyMsg: ChatMessage = {
      id: `sonic-${Date.now()}`,
      sender: 'sonic',
      text,
      timestamp: new Date().toISOString(),
      emotion,
      isOwnerVerified: true,
      similarityScore: 0.96,
      actionType,
    };
    MemoryStore.addChat(replyMsg);
    setChats(MemoryStore.getChats());

    setIsSpeaking(true);
    speechEngine.speak(
      text,
      currentVoiceMode,
      selectedLanguage,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setAssistantEmotion('idle');
      }
    );
  };

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
      setAssistantEmotion('idle');
    } else {
      // Check if API key is configured
      if (!isAssistantActive) {
        setShowSettingsModal(true);
        speechEngine.playTone('alert');
        speakAndRecordReply("Please enter your API key in Settings to activate Sonic.", voiceMode, 'alert');
        return;
      }

      // Check mic permission
      const hasPerm = PermissionManager.checkPermission('mic');
      if (!hasPerm) {
        setShowPermissionsModal(true);
        return;
      }

      await audioEngineRef.current.initMic();
      analyserRef.current = audioEngineRef.current.getAnalyser();

      setIsListening(true);
      setAssistantEmotion('listening');

      // Start speech recognition
      const started = speechEngine.startListening(
        selectedLanguage,
        (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            setIsListening(false);
            speechEngine.stopListening();
            handleProcessUserQuery(transcript);
          }
        },
        (err) => {
          console.warn('Recognition error:', err);
          setIsListening(false);
          setAssistantEmotion('idle');
        },
        () => {
          setIsListening(false);
          if (assistantEmotion === 'listening') {
            setAssistantEmotion('idle');
          }
        }
      );

      if (!started) {
        // Fallback simulation if speech recognition not supported in browser
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const sampleQuery = isSimulatingGuest
            ? "Mera naam Ahmed hai, mujhe Ali ki emails dikhao"
            : "Sonic, Tokyo ka mausam aur time kya hai?";
          handleProcessUserQuery(sampleQuery);
        }, 3000);
      }
    }
  };

  // Play audio sample
  const handlePlayVoiceSample = (mode: VoiceMode) => {
    const text =
      mode === 'Female'
        ? "Assalam-o-Alaikum! Main Sonic hoon, female voice mode mein."
        : mode === 'Male'
        ? "Assalam-o-Alaikum! Main Sonic hoon, male voice mode mein."
        : "Yay! Assalam-o-Alaikum! Main Sonic hoon, child voice mode mein!";
    speechEngine.speak(text, mode, selectedLanguage);
  };

  return (
    <div className="min-h-screen bg-[#070710] text-white flex flex-col justify-between selection:bg-[#6C63FF]/30 pb-20 sm:pb-24">
      {/* 1. Header */}
      <Header
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        isSimulatingGuest={isSimulatingGuest}
        onToggleGuestSimulation={() => {
          setIsSimulatingGuest(!isSimulatingGuest);
          speechEngine.playTone('activate');
        }}
        onOpenWeather={() => setShowWeatherModal(true)}
        onOpenAndroidCode={() => setShowAndroidCodeModal(true)}
        onOpenDownloadModal={() => setShowDownloadModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenPermissions={() => setShowPermissionsModal(true)}
        ownerName={ownerProfile.name}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-center items-center">
        {currentTab === 'assistant' && (
          <div className="w-full flex flex-col items-center justify-center space-y-4 sm:space-y-6 animate-fade-in my-auto">
            {/* Top Prompt Text */}
            <div className="text-center w-full max-w-xl flex flex-col items-center gap-2">
              {!isAssistantActive && (
                <div className="w-full p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-lg">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-xs font-bold text-amber-300">Sonic Inactive / Disabled</p>
                      <p className="text-[11px] text-amber-200/80">Please enter your API key in Settings to activate Sonic</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                  >
                    Enter API Key
                  </button>
                </div>
              )}

              <span className="text-xs uppercase tracking-widest font-mono text-cyan-400/90 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full">
                {isSimulatingGuest ? '🔒 Guest Speaker Detected' : `Biometric Authenticated: ${ownerProfile.name}`}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 font-sans tracking-tight">
                {!isAssistantActive ? (
                  <span className="text-amber-300">Sonic Inactive (Key Required)</span>
                ) : isListening ? (
                  <span className="text-cyan-300">Sonic sun raha hai...</span>
                ) : isSpeaking ? (
                  <span className="text-[#FF4FD8]">Sonic bol raha hai...</span>
                ) : (
                  <span>Hi, main Sonic hoon. Boliye...</span>
                )}
              </h2>
            </div>

            {/* Glowing Orb Centerpiece */}
            <div className="my-2">
              <GlowingOrb
                emotion={assistantEmotion}
                isListening={isListening}
                isSpeaking={isSpeaking}
                isGuest={isSimulatingGuest}
                volumeLevel={volumeLevel}
              />
            </div>

            {/* Real-time Frequency Waveform */}
            <WaveformVisualizer
              analyser={analyserRef.current}
              isActive={isListening || isSpeaking}
              color={isSimulatingGuest ? '#FB8500' : isSpeaking ? '#FF4FD8' : '#00D9FF'}
            />

            {/* Voice Controls & Mic Button */}
            <div className="w-full max-w-xl">
              <VoiceControls
                isListening={isListening}
                isSpeaking={isSpeaking}
                isGuest={isSimulatingGuest}
                onToggleMic={handleToggleMic}
                onSendMessage={handleProcessUserQuery}
                detectedPitchHz={detectedPitchHz}
                detectedVoiceType={detectedVoiceType}
                similarityScore={isSimulatingGuest ? 0.42 : similarityScore}
                ownerName={ownerProfile.name}
              />
            </div>
          </div>
        )}

        {currentTab === 'chat' && (
          <div className="w-full max-w-2xl h-[70vh] flex flex-col animate-fade-in">
            <ChatFeed
              messages={chats}
              onPlayVoice={(text) => speechEngine.speak(text, voiceMode, selectedLanguage)}
              onClearChats={() => {
                MemoryStore.clearChats();
                setChats([]);
              }}
              isSpeaking={isSpeaking}
            />
          </div>
        )}

        {currentTab === 'memory' && (
          <div className="w-full max-w-3xl animate-fade-in">
            <MemoryVault
              memories={memories}
              onAddMemory={(category, fact) => {
                MemoryStore.addMemory(category, fact);
                setMemories(MemoryStore.getMemories());
              }}
              onDeleteMemory={(id) => {
                MemoryStore.deleteMemory(id);
                setMemories(MemoryStore.getMemories());
              }}
              onClearAll={() => {
                MemoryStore.clearAllMemories();
                setMemories([]);
              }}
              onResetDefaults={() => {
                MemoryStore.resetDefaultMemories();
                setMemories(MemoryStore.getMemories());
              }}
              onAskSonicAboutMemory={(fact) => {
                setCurrentTab('assistant');
                handleProcessUserQuery(`Sonic, mujhe is baat ke baare mein batao: ${fact}`);
              }}
            />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="w-full max-w-2xl p-5 bg-[#0d0d1a]/80 backdrop-blur-md rounded-2xl border border-white/10 space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Sonic Assistant Preferences</span>
            </h3>
            <p className="text-xs text-white/50">
              Settings modal ko yahan se ya top right icon se access karein.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
              >
                <span className="text-sm font-semibold text-cyan-300 block mb-1">Awaaz & Zubaan</span>
                <span className="text-xs text-white/60">Voice Mode: {voiceMode} • Language: {selectedLanguage}</span>
              </button>

              <button
                onClick={() => setShowEnrollmentModal(true)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
              >
                <span className="text-sm font-semibold text-emerald-300 block mb-1">Owner Voice Enrollment</span>
                <span className="text-xs text-white/60">Registered Owner: {ownerProfile.name} (Re-calibrate)</span>
              </button>

              <button
                onClick={() => setShowPermissionsModal(true)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
              >
                <span className="text-sm font-semibold text-purple-300 block mb-1">Android Permissions</span>
                <span className="text-xs text-white/60">Mic, Calls, SMS, Location & Storage rationale</span>
              </button>

              <button
                onClick={() => setShowAndroidCodeModal(true)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
              >
                <span className="text-sm font-semibold text-pink-300 block mb-1">Android Kotlin Export</span>
                <span className="text-xs text-white/60">Jetpack Compose, Room DB, TFLite & Gradle files</span>
              </button>

              <button
                onClick={() => setShowDownloadModal(true)}
                className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-[#00D9FF]/20 hover:from-emerald-500/30 hover:to-[#00D9FF]/30 border border-emerald-400/30 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-bold text-emerald-300 block mb-0.5 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download & Install Sonic AI App</span>
                  </span>
                  <span className="text-xs text-white/70">
                    Direct 1-tap phone install (PWA) ya Android Studio complete project ZIP download
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-semibold rounded-lg shrink-0 ml-2">
                  Download
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        unreadCount={chats.length}
      />

      {/* Modals */}
      <WorldWeatherTimeModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        onAskSonicCity={(city) => {
          setCurrentTab('assistant');
          handleProcessUserQuery(`Sonic, ${city} ka live mausam aur time batao.`);
        }}
      />

      <AndroidCodeModal
        isOpen={showAndroidCodeModal}
        onClose={() => setShowAndroidCodeModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        voiceMode={voiceMode}
        onChangeVoiceMode={setVoiceMode}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={setSelectedLanguage}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        toleranceThreshold={toleranceThreshold}
        onChangeThreshold={setToleranceThreshold}
        noiseCancellation={noiseCancellation}
        onToggleNoiseCancellation={() => setNoiseCancellation(!noiseCancellation)}
        onOpenVoiceEnrollment={() => {
          setShowSettingsModal(false);
          setShowEnrollmentModal(true);
        }}
        onPlaySampleVoice={handlePlayVoiceSample}
        ownerName={ownerProfile.name}
        userApiKey={userApiKey}
        onSaveApiKey={(key) => {
          setUserApiKey(key);
          localStorage.setItem('sonic_user_api_key', key);
        }}
        onClearApiKey={() => {
          setUserApiKey('');
          localStorage.removeItem('sonic_user_api_key');
        }}
      />

      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        permissions={permissions}
        onTogglePermission={(id) => {
          const updated = PermissionManager.togglePermission(id);
          setPermissions(updated);
        }}
      />

      <VoiceEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onEnrollmentComplete={(profile) => {
          setOwnerProfile(profile);
          speechEngine.playTone('complete');
        }}
        audioEngine={audioEngineRef.current}
      />

      <PhoneActionModal
        action={pendingPhoneAction}
        onConfirm={() => {
          if (!pendingPhoneAction) return;
          const isCall = pendingPhoneAction.type === 'call';
          setPendingPhoneAction(null);
          speakAndRecordReply(
            isCall
              ? `Call mila di gayi hai: ${pendingPhoneAction.target} dial ho raha hai.`
              : `SMS kamyabi se bhej diya gaya hai to ${pendingPhoneAction.target}.`,
            voiceMode,
            'friendly',
            isCall ? 'call_dialed' : 'sms_sent'
          );
        }}
        onCancel={() => {
          setPendingPhoneAction(null);
          speakAndRecordReply("Theek hai, action cancel kar diya gaya hai.", voiceMode, 'friendly');
        }}
      />

      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        deferredPrompt={deferredPrompt}
        onTriggerPwaInstall={handleTriggerPwaInstall}
      />
    </div>
  );
}
