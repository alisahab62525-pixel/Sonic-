import React from 'react';
import { Mic, MessageSquare, Brain, Settings, ShieldCheck } from 'lucide-react';

export type TabType = 'assistant' | 'chat' | 'memory' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  unreadCount = 0,
}) => {
  const tabs = [
    { id: 'assistant' as TabType, label: 'Assistant', icon: Mic },
    { id: 'chat' as TabType, label: 'Chat History', icon: MessageSquare, badge: unreadCount },
    { id: 'memory' as TabType, label: 'Memory Vault', icon: Brain },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d1a]/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 sm:py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-300 font-bold'
                  : 'text-white/50 hover:text-white/80 font-medium'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00D9FF] shadow-[0_0_10px_#00D9FF]" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]' : ''} transition-transform`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#FF4FD8] text-white text-[9px] font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
