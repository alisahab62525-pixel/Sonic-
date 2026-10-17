import React, { useState } from 'react';
import { MemoryItem } from '../types';
import { Brain, Lock, ShieldCheck, Plus, Trash2, Search, Heart, Calendar, Compass, UserCheck, RotateCcw } from 'lucide-react';

interface MemoryVaultProps {
  memories: MemoryItem[];
  onAddMemory: (category: MemoryItem['category'], fact: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearAll: () => void;
  onResetDefaults: () => void;
  onAskSonicAboutMemory: (fact: string) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAll,
  onResetDefaults,
  onAskSonicAboutMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('preference');
  const [newFact, setNewFact] = useState('');

  const categories = [
    { id: 'all', label: 'Sab (All)', icon: Brain },
    { id: 'personal', label: 'Zaati (Personal)', icon: UserCheck },
    { id: 'family', label: 'Khandan (Family)', icon: Heart },
    { id: 'preference', label: 'Pasand (Likes)', icon: Heart },
    { id: 'date', label: 'Auqat (Dates)', icon: Calendar },
    { id: 'feeling', label: 'Jazbaat (Feelings)', icon: Heart },
    { id: 'plan', label: 'Iraday (Plans)', icon: Compass },
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesQuery = m.fact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    onAddMemory(newCategory, newFact.trim());
    setNewFact('');
    setIsAdding(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'personal': return <UserCheck className="w-3.5 h-3.5 text-cyan-400" />;
      case 'family': return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      case 'preference': return <Heart className="w-3.5 h-3.5 text-amber-400" />;
      case 'date': return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      case 'feeling': return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'plan': return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Brain className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#0d0d1a]/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00D9FF]" />
            <h2 className="text-lg font-bold text-white">Sonic ki Yaaddasht (Memory Vault)</h2>
          </div>
          <p className="text-xs text-[#B0B0C0] mt-0.5">
            Sonic aapki tamam baatein, pasand-napand aur rishte AES-256 encrypted database mein yaad rakhta hai.
          </p>
        </div>

        {/* Security badge & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>AES-256 Encrypted</span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#00D9FF] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nayi Baat Yaad Karwayein</span>
          </button>
        </div>
      </div>

      {/* Add Memory Form */}
      {isAdding && (
        <form onSubmit={handleCreateMemory} className="mt-4 p-4 rounded-xl bg-white/5 border border-cyan-500/30 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Nayi Yaaddasht (Add Memory)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="bg-[#121224] border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="personal">Zaati (Personal)</option>
              <option value="family">Khandan (Family)</option>
              <option value="preference">Pasand / Na-pasand</option>
              <option value="date">Tareekh / Birthday</option>
              <option value="feeling">Jazbaat / Feelings</option>
              <option value="plan">Mustaqbil ka Plan</option>
            </select>
            <input
              type="text"
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="Maslan: Mujhe cricket khelna bohot pasand hai..."
              className="sm:col-span-2 bg-[#121224] border border-white/20 rounded-lg p-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newFact.trim()}
              className="px-4 py-1.5 bg-[#00D9FF] text-black font-semibold text-xs rounded-lg disabled:opacity-50 hover:bg-cyan-300"
            >
              Mehfooz Karein
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yaaddasht talash karein..."
            className="w-full bg-[#121224] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Category Pills */}
        <div className="w-full flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-10 text-center text-white/40">
            <Brain className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="text-sm">Koi yaaddasht nahi mili.</p>
          </div>
        ) : (
          filteredMemories.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(m.category)}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                      {m.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">
                    {new Date(m.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{m.fact}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => onAskSonicAboutMemory(m.fact)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span>Sonic se poocho</span>
                  <span>→</span>
                </button>

                <button
                  onClick={() => onDeleteMemory(m.id)}
                  title="Delete memory"
                  className="text-white/30 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
        <span>Kul Mehfooz Yaadein: {memories.length}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Samples</span>
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
