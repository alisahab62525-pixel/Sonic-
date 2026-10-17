import React from 'react';
import { X, Shield, CheckCircle2, XCircle, Mic, MapPin, Phone, MessageSquare, Users, Calendar, Bell, Database } from 'lucide-react';
import { PermissionStatus } from '../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: PermissionStatus[];
  onTogglePermission: (id: string) => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onTogglePermission,
}) => {
  if (!isOpen) return null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'mic': return <Mic className="w-5 h-5 text-cyan-400" />;
      case 'location': return <MapPin className="w-5 h-5 text-pink-400" />;
      case 'calls': return <Phone className="w-5 h-5 text-emerald-400" />;
      case 'sms': return <MessageSquare className="w-5 h-5 text-amber-400" />;
      case 'contacts': return <Users className="w-5 h-5 text-purple-400" />;
      case 'calendar': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'notifications': return <Bell className="w-5 h-5 text-yellow-400" />;
      case 'storage': return <Database className="w-5 h-5 text-indigo-400" />;
      default: return <Shield className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Android Permissions Manager</h3>
              <p className="text-xs text-white/50">Sonic har action se pehle explicit ijazat maangta hai</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-200">
            🛡️ <strong>Sonic Privacy Protocol:</strong> Sonic aapke phone calls, SMS ya contacts tab tak touch nahi karta jab tak aap khud awaaz se ijazat na dein.
          </div>

          {permissions.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  {getIcon(p.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{p.title}</span>
                    {p.required && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{p.description}</p>
                </div>
              </div>

              <button
                onClick={() => onTogglePermission(p.id)}
                className={`ml-3 shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  p.granted
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/20 text-white/40 hover:text-white'
                }`}
              >
                {p.granted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Granted</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-white/40" />
                    <span>Denied</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#121224]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D9FF] text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Ijazat Mehfooz Karein (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
