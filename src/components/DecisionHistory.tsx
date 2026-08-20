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
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#F7F4EE] border-l border-[#E0D9CC] h-full flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Modal Drawer Header */}
        <div className="p-6 border-b border-[#E0D9CC] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl skeuo-btn-primary text-[#D4A338] flex items-center justify-center">
              <History className="w-4 h-4 text-[#D4A338]" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl text-[#2C221E] font-bold">
                Saved Decisions
              </h2>
              <p className="text-xs text-stone-500">
                {savedDecisions.length} decisions saved
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-[#E0D9CC] bg-[#FAF7F2] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved decisions..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl skeuo-input text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#B88E3D]"
            />
          </div>

          <div className="flex gap-1.5 p-1 skeuo-well rounded-xl self-start sm:self-auto">
            {(['all', 'analyzed', 'decided'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'skeuo-btn-primary text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
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
              <FileSpreadsheet className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-medium text-stone-600">
                No saved decisions match your query.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewDecision();
                }}
                className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white skeuo-btn-primary rounded-xl transition-all inline-block cursor-pointer"
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
                  className="p-5 rounded-2xl skeuo-card hover:border-[#B88E3D] transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-amber-100/80 text-amber-900 border border-amber-300 shadow-2xs">
                          {dec.status || 'analyzed'}
                        </span>
                        <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(dec.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-serif italic text-base font-bold text-[#2C221E] group-hover:text-[#B88E3D] transition-colors">
                        {dec.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onSelectDecision(dec);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl skeuo-btn-primary text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="text-[#D4A338]">Open</span>
                        <ExternalLink className="w-3 h-3 text-[#D4A338]" />
                      </button>

                      <button
                        onClick={() => onDeleteDecision(dec.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-lg transition-colors cursor-pointer"
                        title="Delete decision"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {dec.originalPrompt}
                  </p>

                  <div className="pt-2 border-t border-[#E0D9CC] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-stone-500">
                      Options: <strong className="text-stone-900">{dec.options.length}</strong>
                    </span>

                    {recommendedOpt && (
                      <span className="text-[#B88E3D] font-bold flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-[#B88E3D]" />
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

