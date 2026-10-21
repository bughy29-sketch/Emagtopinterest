import React from 'react';
import { Clock, Play, Pause, FastForward, CheckCircle2, AlertCircle } from 'lucide-react';

interface SchedulePanelProps {
  autoPilotEnabled: boolean;
  intervalHours: number;
  onToggleAutoPilot: () => void;
  onChangeInterval: (hours: number) => void;
  onTriggerRunNow: () => void;
  isRunningNow: boolean;
  queueCount: number;
  readyCount: number;
}

export const SchedulePanel: React.FC<SchedulePanelProps> = ({
  autoPilotEnabled,
  intervalHours,
  onToggleAutoPilot,
  onChangeInterval,
  onTriggerRunNow,
  isRunningNow,
  queueCount,
  readyCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left info: Equivalent to GitHub Action cron */}
        <div className="flex items-start space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
              autoPilotEnabled
                ? 'bg-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-slate-400'
            }`}
          >
            <Clock className={`w-5 h-5 ${autoPilotEnabled ? 'animate-pulse' : ''}`} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">
                Auto-Pilot Scheduler (Cron)
              </h2>
              <span
                className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                  autoPilotEnabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {autoPilotEnabled ? 'Pornit (Activ)' : 'Oprit'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Replică cron-ul GitHub Actions (<code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-700">0 */{intervalHours} * * *</code>). Publică automat următorul produs gata din coadă.
            </p>
          </div>
        </div>

        {/* Right actions: Frequency, Toggle, Trigger Now */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Frequency selector */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-slate-400 font-medium">Interval:</span>
            <select
              value={intervalHours}
              onChange={(e) => onChangeInterval(Number(e.target.value))}
              disabled={!autoPilotEnabled}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={1}>La 1 oră</option>
              <option value={2}>La 2 ore</option>
              <option value={4}>La 4 ore (implicit GitHub)</option>
              <option value={6}>La 6 ore</option>
              <option value={12}>La 12 ore</option>
              <option value={24}>La 24 ore</option>
            </select>
          </div>

          {/* Run Now Trigger (Equivalent to workflow_dispatch) */}
          <button
            onClick={onTriggerRunNow}
            disabled={isRunningNow || readyCount === 0}
            title={readyCount === 0 ? 'Nu există produse cu status "Gata" în coadă' : 'Rulează imediat pasul următor (workflow_dispatch)'}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors disabled:opacity-40"
          >
            <FastForward className="w-3.5 h-3.5 text-blue-600" />
            <span>Rulează Acum ({readyCount})</span>
          </button>

          {/* Toggle Button */}
          <button
            onClick={onToggleAutoPilot}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 ${
              autoPilotEnabled
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {autoPilotEnabled ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pauză Auto-Pilot</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Activează Auto-Pilot</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
