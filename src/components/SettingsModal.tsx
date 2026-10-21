import React, { useState } from 'react';
import { PinterestBoard } from '../types';
import {
  X,
  Key,
  FolderPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  boardId: string;
  boards: PinterestBoard[];
  hasGeminiKey: boolean;
  onSaveSettings: (token: string, boardId: string) => Promise<void>;
  onFetchBoards: (tokenToUse?: string) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  token,
  boardId,
  boards,
  hasGeminiKey,
  onSaveSettings,
  onFetchBoards,
}) => {
  const [localToken, setLocalToken] = useState(token);
  const [localBoardId, setLocalBoardId] = useState(boardId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [boardsError, setBoardsError] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveSettings(localToken, localBoardId);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAndFetch = async () => {
    setIsLoadingBoards(true);
    setBoardsError('');
    try {
      await onFetchBoards(localToken);
    } catch (err: any) {
      setBoardsError(err.message || 'Nu s-au putut prelua board-urile');
    } finally {
      setIsLoadingBoards(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Setări API &amp; Conexiuni</h2>
            <p className="text-xs text-slate-500">
              Configurează token-ul Pinterest API v5 și verifică starea Gemini
            </p>
          </div>
        </div>

        {/* Gemini Status Banner */}
        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Google Gemini 3.8 Flash AI</span>
              {hasGeminiKey ? (
                <span className="inline-flex items-center text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activ
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-600 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> GEMINI_API_KEY
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-0.5">
              Generarea de titluri și descrieri persuasive se face complet server-side prin SDK-ul oficial <span className="font-mono text-slate-700">@google/genai</span>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Pinterest Token */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center">
                <span>Pinterest Access Token</span>
                <span className="ml-1 text-red-500">*</span>
              </label>
              <a
                href="https://developers.pinterest.com/apps/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center"
              >
                Developer Portal <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="pina_... sau Token din Pinterest Developers"
                value={localToken}
                onChange={(e) => setLocalToken(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Scopes necesare în Pinterest App: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">pins:write</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">boards:read</code>.
            </p>
          </div>

          {/* Pinterest Board ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Pinterest Board ID (Destinație)
              </label>
              <button
                type="button"
                onClick={handleTestAndFetch}
                disabled={isLoadingBoards || !localToken}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingBoards ? 'animate-spin' : ''}`} />
                Încarcă Board-urile mele
              </button>
            </div>

            {boards.length > 0 ? (
              <select
                value={localBoardId}
                onChange={(e) => setLocalBoardId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="">-- Alege un board din contul tău --</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Ex: 1111111111111111111 sau încarcă automat mai sus"
                value={localBoardId}
                onChange={(e) => setLocalBoardId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            )}

            {boardsError && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{boardsError}</p>
            )}
          </div>

          {/* Instructions collapse / notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
            <div className="flex items-center font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 mr-1 text-amber-600" />
              <span>Ghid Rapid de Conectare:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-800">
              <li>Mergi la <b>developers.pinterest.com</b> și creează o aplicație v5.</li>
              <li>Generează un <b>User Access Token</b> cu permisiunea <code className="bg-amber-100 px-1 rounded">pins:write</code>.</li>
              <li>Lipește token-ul mai sus și apasă <b>Încarcă Board-urile mele</b> pentru a alege board-ul.</li>
            </ol>
          </div>

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Setările au fost salvate cu succes!</span>
            </div>
          )}

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Închide
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all"
            >
              {isSaving ? 'Se salvează...' : 'Salvează Setările'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
