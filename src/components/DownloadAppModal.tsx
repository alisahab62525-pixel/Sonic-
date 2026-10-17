import React, { useState } from 'react';
import { X, Download, Smartphone, Laptop, CheckCircle2, ArrowRight, Sparkles, FolderArchive, Terminal, ExternalLink, HelpCircle } from 'lucide-react';
import { generateAndDownloadAndroidZip } from '../utils/zipExporter';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerPwaInstall: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerPwaInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'guide'>('pwa');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await generateAndDownloadAndroidZip();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0c18] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#101024]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D9FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,217,255,0.4)] text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                How to Download & Install Sonic AI
              </h3>
              <p className="text-xs text-white/50">
                Phone par chalane ke do asaan tareeqay (PWA Install ya Android APK Build)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-[#070712] p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'pwa'
                ? 'bg-gradient-to-r from-[#6C63FF]/30 to-[#00D9FF]/30 border border-cyan-400/40 text-cyan-300 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. Direct Phone Install (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'apk'
                ? 'bg-gradient-to-r from-[#6C63FF]/30 to-[#00D9FF]/30 border border-cyan-400/40 text-cyan-300 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-pink-400" />
            <span>2. Download Android ZIP</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-[#6C63FF]/30 to-[#00D9FF]/30 border border-cyan-400/40 text-cyan-300 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>3. APK Build Guide</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Direct APK Download & Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-fade-in">
              {/* Direct APK Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-[#00D9FF]/20 border-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.25)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/30 text-emerald-300">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Direct Download SonicAI.apk
                      </h4>
                      <p className="text-xs text-emerald-300/80">
                        Compiled, aligned, and signed Android Package ready for immediate install
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                    2.8 MB • Signed
                  </span>
                </div>

                <div className="pt-1 flex flex-wrap gap-2.5">
                  <a
                    href="/download/SonicAI.apk"
                    download="SonicAI.apk"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black text-xs font-black shadow-[0_0_25px_rgba(52,211,153,0.5)] flex items-center justify-center gap-2 transition-all transform hover:scale-102 active:scale-98"
                  >
                    <Download className="w-4 h-4 stroke-[3]" />
                    <span>Download SonicAI.apk Abhi (2.8 MB)</span>
                  </a>

                  <button
                    onClick={onTriggerPwaInstall}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Chrome 1-Tap Install (WebAPK)</span>
                  </button>
                </div>
              </div>

              {/* Step by step Android instructions */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Phone Par APK Install Karne Ka Tareeqa (30 Seconds):
                </h5>
                <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Ooper diye gaye green button <strong>&quot;Download SonicAI.apk Abhi&quot;</strong> par tap karein.
                  </li>
                  <li>
                    Download complete hone ke baad phone ke <strong>Notifications</strong> ya <strong>Files &gt; Downloads</strong> folder mein ja kar <code>SonicAI.apk</code> par tap karein.
                  </li>
                  <li>
                    Agar Android pooche <em>&quot;Install unknown apps&quot;</em>, to <strong>Settings</strong> par tap kar ke <strong>&quot;Allow from this source&quot;</strong> on karein.
                  </li>
                  <li>
                    <strong>&quot;Install&quot;</strong> par click karein.
                  </li>
                  <li>
                    Sonic AI aapke phone ke home screen aur apps drawer mein install ho kar tayar ho jayegi!
                  </li>
                </ol>
              </div>


              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Install hone ke baad Sonic AI offline bhi chalegi, microphone se biometric awaaz pehchanegi, aur poori screen par display hogi!
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Android ZIP Download */}
          {activeTab === 'apk' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <FolderArchive className="w-4 h-4 text-pink-400" />
                  <span>Download Complete Android Studio Project (.ZIP)</span>
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Agar aap Android Studio se APK banana chahte hain, to yahan se poora Kotlin + Jetpack Compose project aik zip file mein download karein:
                </p>

                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4FD8] via-[#6C63FF] to-[#00D9FF] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_20px_rgba(255,79,216,0.3)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isZipping ? 'Creating ZIP file...' : 'Download SonicAI_Android_Project.zip'}
                    </span>
                  </button>

                  {downloadSuccess && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ZIP file downloaded successfully!</span>
                    </span>
                  )}
                </div>
              </div>

              {/* What is inside the zip */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  ZIP File Ke Andar Kya Kya Shamil Hai:
                </h5>
                <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                  <li><code>app/src/main/java/com/sonic/ai/MainActivity.kt</code> (Jetpack Compose UI & Orb)</li>
                  <li><code>VoiceEmbeddingHelper.kt</code> (TFLite Speaker Biometrics & Cosine similarity)</li>
                  <li><code>SonicGeminiRepository.kt</code> (Gemini 3.8 Flash + Offline Fallback)</li>
                  <li><code>SonicDatabase.kt</code> (Encrypted Room DB with SQLCipher)</li>
                  <li><code>SonicTTSManager.kt</code> (Multi-Voice Male/Female/Child engine)</li>
                  <li><code>WeatherTimeService.kt</code> (Open-Meteo worldwide weather client)</li>
                  <li><code>AndroidManifest.xml</code> (All required permissions)</li>
                  <li><code>build.gradle.kts</code>, <code>settings.gradle.kts</code> & <code>local.properties.example</code></li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: APK Build Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Android Studio se APK Kaise Banayein (Step-by-Step Guide)</span>
                </h4>
                <div className="space-y-3 text-xs text-white/80 leading-relaxed">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <p className="font-semibold text-cyan-300 mb-1">Step 1: ZIP File Extract Karein</p>
                    <p className="text-white/60">
                      Download ki hui <code>SonicAI_Android_Project.zip</code> ko apne computer par extract / unzip karein.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <p className="font-semibold text-cyan-300 mb-1">Step 2: Android Studio Mein Kholein</p>
                    <p className="text-white/60">
                      Android Studio open karein aur <strong>Open an Existing Project</strong> par click kar ke extract kiya hua folder select karein.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <p className="font-semibold text-cyan-300 mb-1">Step 3: local.properties Mein Gemini Key Daalein</p>
                    <p className="text-white/60">
                      Project ke root folder mein <code>local.properties</code> file kholein aur yeh line add karein:
                    </p>
                    <code className="block mt-1 text-emerald-300 bg-black/60 p-2 rounded font-mono text-[11px]">
                      GEMINI_API_KEY=your_gemini_api_key_here
                    </code>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <p className="font-semibold text-cyan-300 mb-1">Step 4: APK Build Karein</p>
                    <p className="text-white/60">
                      Android Studio ke top menu se click karein:
                      <br />
                      <strong>Build</strong> &gt; <strong>Build Bundle(s) / APK(s)</strong> &gt; <strong>Build APK(s)</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <p className="font-semibold text-cyan-300 mb-1">Step 5: Phone Par Install Karein</p>
                    <p className="text-white/60">
                      Android Studio notification dega: <em>&quot;APK(s) generated successfully&quot;</em>. <strong>locate</strong> par click karein aur <code>app-debug.apk</code> ko apne phone par bhej kar install kar lein!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0c0c18] flex items-center justify-between">
          <span className="text-[11px] text-white/50">
            Android 8.0+ (API 26+) compatible
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
