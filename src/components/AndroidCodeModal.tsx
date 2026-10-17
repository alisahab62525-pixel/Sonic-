import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, FileCode, Smartphone, Terminal, BookOpen } from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Generate a single combined download bundle or package script
    const combined = ANDROID_PROJECT_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ${f.description}\n// ==========================================\n\n${f.content}\n\n`
    ).join('\n\n');

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sonic_ai_android_project_bundle.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#0b0b16] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#101024]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D9FF] text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Sonic AI Android Kotlin Project
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for Android Studio
                </span>
              </div>
              <p className="text-xs text-white/50">
                Jetpack Compose Material 3 • TFLite Speaker Biometrics • Room DB Encrypted with SQLCipher • Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>Download Bundle</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-72 bg-[#080811] border-b md:border-b-0 md:border-r border-white/10 p-3 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2 px-2">
              Android Source Files ({ANDROID_PROJECT_FILES.length})
            </p>
            <div className="space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#6C63FF]/30 to-[#00D9FF]/30 border border-cyan-400/40 text-white font-medium shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-white/40'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[9px] uppercase font-mono text-white/40 ml-1 shrink-0">
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Android Studio tip box */}
            <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200">
              <div className="flex items-center gap-1 font-semibold text-purple-300 mb-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>API Key Setup</span>
              </div>
              <p className="leading-relaxed text-white/60">
                Put your Gemini key inside <code className="text-cyan-300 bg-black/40 px-1 rounded">local.properties</code> as:
                <br />
                <code className="text-emerald-300 font-mono text-[10px] block mt-1">GEMINI_API_KEY=your_key</code>
              </p>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#07070f] overflow-hidden">
            {/* Top Code Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e0e1a] border-b border-white/10 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <span className="font-mono text-cyan-300">{selectedFile.path}</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-white/50 hidden sm:inline">{selectedFile.description}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white/60" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadFile}
                  title="Download File"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-white/85 bg-[#06060c] leading-relaxed selection:bg-cyan-500/30">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
