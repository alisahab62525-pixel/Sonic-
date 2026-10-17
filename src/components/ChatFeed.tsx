import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Volume2, ShieldCheck, ShieldAlert, Sparkles, Trash2, Bot, User } from 'lucide-react';

interface ChatFeedProps {
  messages: ChatMessage[];
  onPlayVoice: (text: string) => void;
  onClearChats: () => void;
  isSpeaking: boolean;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  onPlayVoice,
  onClearChats,
  isSpeaking,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getEmotionBadge = (emotion?: string) => {
    if (!emotion) return null;
    switch (emotion) {
      case 'caring':
        return <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">💖 Hamdard</span>;
      case 'protective':
        return <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">🛡️ Hifazati Pehra</span>;
      case 'joyful':
        return <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">✨ Pur-Josh</span>;
      case 'thoughtful':
        return <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">💡 Fikarmand</span>;
      case 'witty':
        return <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">⚡ Dilchasp</span>;
      default:
        return <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">🤖 Sonic</span>;
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0d0d1a]/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00D9FF]" />
          <h3 className="text-sm font-semibold text-white">Guftagu ki Tareekh (Chat Feed)</h3>
          <span className="text-xs text-white/50">({messages.length} baatein)</span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChats}
            title="Chat History Saaf Karein"
            className="flex items-center gap-1 text-xs text-white/50 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Feed Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] sm:max-h-[520px]">
        {messages.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-white/40">
            <Bot className="w-10 h-10 mb-2 opacity-40 text-cyan-400" />
            <p className="text-sm">Abhi koi guftagu nahi hui.</p>
            <p className="text-xs text-white/30 mt-1">Mic ka button daba kar Sonic se baat karein!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSonic = msg.sender === 'sonic';
            const isGuest = msg.sender === 'guest';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isSonic ? 'justify-start' : 'justify-end'}`}
              >
                {/* Sonic Avatar */}
                {isSonic && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#00D9FF] flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-xs font-bold text-white">S</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-lg border transition-all ${
                    isSonic
                      ? 'bg-[#15152a]/90 border-white/10 text-white rounded-tl-sm'
                      : isGuest
                      ? 'bg-amber-950/70 border-amber-500/30 text-amber-100 rounded-tr-sm'
                      : 'bg-gradient-to-r from-[#204068] to-[#1e3458] border-cyan-500/30 text-white rounded-tr-sm'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isSonic ? (
                        <>
                          <span className="text-xs font-semibold text-cyan-300">Sonic</span>
                          {getEmotionBadge(msg.emotion)}
                        </>
                      ) : isGuest ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-300">Guest Speaker</span>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            ({((msg.similarityScore || 0.4) * 100).toFixed(0)}% match)
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-300">Owner (Ali)</span>
                          <span className="text-[10px] text-emerald-400/80 font-mono">
                            ({((msg.similarityScore || 0.95) * 100).toFixed(0)}% verified)
                          </span>
                        </>
                      )}
                    </div>

                    <span className="text-[10px] text-white/40">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Body Text */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Actions / Voice playback */}
                  {isSonic && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => onPlayVoice(msg.text)}
                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Awaaz Sunain</span>
                      </button>

                      {msg.actionType && (
                        <span className="text-[10px] font-mono text-white/40 uppercase">
                          Action: {msg.actionType}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isSonic && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                      isGuest ? 'bg-amber-600' : 'bg-cyan-600'
                    }`}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
