import React from 'react';
import { Sparkles, Settings, Plus, RefreshCw, Radio, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenAddModal: () => void;
  onRefreshStatus: () => void;
  hasGeminiKey: boolean;
  hasPinterestToken: boolean;
  configuredBoardId: string;
  autoPilotEnabled: boolean;
  totalProducts: number;
  publishedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenAddModal,
  onRefreshStatus,
  hasGeminiKey,
  hasPinterestToken,
  configuredBoardId,
  autoPilotEnabled,
  totalProducts,
  publishedCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-500/20">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.365-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[9px] font-black text-white ring-2 ring-white">
                e
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  eMAG to Pinterest Bot
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  v2.0 Full-Stack
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Gemini 3.8 Flash Pin Generator &amp; Pinterest API v5 Publisher
              </p>
            </div>
          </div>

          {/* Center Badges / Status */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Gemini Status */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                hasGeminiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                hasGeminiKey
                  ? 'Gemini 3.8 Flash conectat prin @google/genai'
                  : 'Cheia GEMINI_API_KEY lipsește din variabilele de mediu'
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI {hasGeminiKey ? 'Activ' : 'Offline'}</span>
            </div>

            {/* Pinterest API Status */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                hasPinterestToken && configuredBoardId
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Apasă pentru setări Pinterest API"
            >
              {hasPinterestToken ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>
                Pinterest API {hasPinterestToken ? 'Conectat' : 'Necesită Token'}
              </span>
            </button>

            {/* Auto-pilot cron pill */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                autoPilotEnabled
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoPilotEnabled ? 'animate-pulse text-blue-600' : ''}`} />
              <span>Cron 4h: {autoPilotEnabled ? 'Activ' : 'Pauză'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onRefreshStatus}
              title="Reîmprospătează starea"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Setări &amp; API</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm shadow-red-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă Produs</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
