import React from 'react';
import { Phone, MessageSquare, AlertCircle, Check, X, PhoneCall } from 'lucide-react';

export interface PendingAction {
  type: 'call' | 'sms' | 'calendar';
  target: string;
  detail?: string;
  rationalePrompt: string;
}

interface PhoneActionModalProps {
  action: PendingAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PhoneActionModal: React.FC<PhoneActionModalProps> = ({
  action,
  onConfirm,
  onCancel,
}) => {
  if (!action) return null;

  const isCall = action.type === 'call';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#0e0e1c] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
        {/* Animated Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#00D9FF] flex items-center justify-center shadow-[0_0_30px_rgba(0,217,255,0.4)] animate-bounce">
          {isCall ? (
            <PhoneCall className="w-8 h-8 text-white" />
          ) : (
            <MessageSquare className="w-8 h-8 text-white" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            {isCall ? 'Phone Call Confirmation' : 'SMS Message Confirmation'}
          </h3>
          <p className="text-xs text-cyan-300 font-medium mt-1">
            Sonic: &quot;{action.rationalePrompt}&quot;
          </p>
        </div>

        {/* Action Details Card */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Target:</span>
            <span className="text-white font-semibold">{action.target}</span>
          </div>
          {action.detail && (
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Paighaam:</span>
              <span className="text-cyan-200 font-mono italic max-w-[180px] truncate">
                {action.detail}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Nahi (Cancel)</span>
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Haan (Confirm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
