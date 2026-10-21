import React from 'react';
import { BotLog } from '../types';
import { Terminal, Sparkles, Send, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

interface LogViewerProps {
  logs: BotLog[];
  onClearLogs: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onClearLogs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 p-4 font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white tracking-wide">
            Jurnal Activitate (Gemini &amp; Pinterest API v5)
          </span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400">
            {logs.length} înregistrări
          </span>
        </div>
        <button
          onClick={onClearLogs}
          title="Golește jurnalul"
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {logs.map((log) => {
          const time = new Date(log.timestamp).toLocaleTimeString();
          return (
            <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 text-[11px]">{time}</span>

              {log.type === 'gemini' && (
                <span className="text-blue-400 font-bold shrink-0 flex items-center">
                  <Sparkles className="w-3 h-3 mr-0.5 inline" /> [Gemini]
                </span>
              )}
              {log.type === 'pinterest' && (
                <span className="text-red-400 font-bold shrink-0 flex items-center">
                  <Send className="w-3 h-3 mr-0.5 inline" /> [Pinterest]
                </span>
              )}
              {log.type === 'success' && (
                <span className="text-emerald-400 font-bold shrink-0 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-0.5 inline" /> [Succes]
                </span>
              )}
              {log.type === 'error' && (
                <span className="text-rose-400 font-bold shrink-0 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-0.5 inline" /> [Eroare]
                </span>
              )}
              {log.type === 'info' && (
                <span className="text-slate-400 font-bold shrink-0">[Info]</span>
              )}

              <span className="text-slate-200 break-all">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
