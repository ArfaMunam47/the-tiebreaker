import React, { useState } from 'react';
import { DecisionAnalysis } from '../types';
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  Award,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface DecisionHistoryProps {
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string) => void;
  onClose: () => void;
  onNewDecision: () => void;
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClose,
  onNewDecision,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'analyzed' | 'decided'>('all');

  const filteredDecisions = savedDecisions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.originalPrompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#111111] border-l border-[#222222] h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Drawer Header */}
        <div className="p-6 border-b border-[#222222] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 bg-[#1A1A1A] flex items-center justify-center text-[#D4AF37]">
              <History className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif italic font-light text-xl text-[#F5F5F0]">
                Decision History
              </h2>
              <p className="text-xs text-[#A0A0A0]">
                {savedDecisions.length} saved decision analyses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A0A0A0] hover:text-[#F5F5F0] rounded-sm bg-[#1A1A1A] hover:bg-[#222222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-[#222222] bg-[#0A0A0A] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search decisions or keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-sm bg-[#111111] border border-[#222222] text-[#F5F5F0] placeholder:text-[#666666] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex gap-1">
            {(['all', 'analyzed', 'decided'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                  statusFilter === st
                    ? 'bg-[#D4AF37] text-[#0A0A0A]'
                    : 'bg-[#111111] text-[#A0A0A0] border border-[#222222] hover:text-[#F5F5F0]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* List of Saved Decisions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredDecisions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-[#666666] mx-auto" />
              <p className="text-sm font-medium text-[#A0A0A0]">
                No saved decisions found.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewDecision();
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#e0be48] rounded-sm shadow transition-all inline-block"
              >
                Start a New Decision
              </button>
            </div>
          ) : (
            filteredDecisions.map((dec) => {
              const recommendedOpt = dec.options.find(
                (o) => o.id === dec.recommendation?.recommendedOptionId
              ) || dec.options[0];

              return (
                <div
                  key={dec.id}
                  className="p-5 rounded-sm bg-[#0A0A0A] border border-[#222222] hover:border-[#D4AF37]/40 transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-[#1A1A1A] text-[#D4AF37] border border-[#222222]">
                          {dec.status || 'analyzed'}
                        </span>
                        <span className="text-[11px] text-[#666666] flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(dec.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-serif italic text-base font-light text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors">
                        {dec.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          onSelectDecision(dec);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-sm bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDeleteDecision(dec.id)}
                        className="p-1.5 text-[#666666] hover:text-rose-400 hover:bg-[#1A1A1A] rounded-sm transition-colors"
                        title="Delete decision"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <p className="text-xs text-[#A0A0A0] line-clamp-2">
                    {dec.originalPrompt}
                  </p>

                  <div className="pt-2 border-t border-[#222222] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#666666]">
                      Options: <strong className="text-[#F5F5F0]">{dec.options.length}</strong>
                    </span>

                    {recommendedOpt && (
                      <span className="text-[#D4AF37] font-medium flex items-center gap-1 text-[11px]">
                        <Award className="w-3 h-3 text-[#D4AF37]" />
                        {recommendedOpt.title}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
