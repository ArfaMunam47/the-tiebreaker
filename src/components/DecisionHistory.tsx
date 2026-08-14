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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
              <History className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl text-white font-bold">
                Saved Decision Library
              </h2>
              <p className="text-xs text-slate-400">
                {savedDecisions.length} stored analyses in memory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved decisions..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-1">
            {(['all', 'analyzed', 'decided'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800'
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
              <FileSpreadsheet className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                No saved decisions match your query.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewDecision();
                }}
                className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow transition-all inline-block cursor-pointer"
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
                  className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 transition-all space-y-3 shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-slate-900 text-amber-400 border border-amber-500/30">
                          {dec.status || 'analyzed'}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(dec.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-serif italic text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {dec.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          onSelectDecision(dec);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-400 text-xs uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3 text-slate-950" />
                      </button>

                      <button
                        onClick={() => onDeleteDecision(dec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                        title="Delete decision"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {dec.originalPrompt}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">
                      Options: <strong className="text-white">{dec.options.length}</strong>
                    </span>

                    {recommendedOpt && (
                      <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
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

