import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProductItem, PinterestBoard, BotLog, BotSettings } from './types';
import { INITIAL_PRODUCTS } from './sampleData';
import { Header } from './components/Header';
import { PinPreviewCard } from './components/PinPreviewCard';
import { ProductFormModal } from './components/ProductFormModal';
import { SettingsModal } from './components/SettingsModal';
import { SchedulePanel } from './components/SchedulePanel';
import { LogViewer } from './components/LogViewer';
import {
  Sparkles,
  Send,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('emag_pinterest_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [settings, setSettings] = useState<BotSettings>(() => {
    const saved = localStorage.getItem('emag_pinterest_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return {
      pinterestAccessToken: '',
      pinterestBoardId: '',
      autoPilotEnabled: false,
      autoPilotIntervalHours: 4,
      autoGenerateOnAdd: true,
    };
  });

  const [serverStatus, setServerStatus] = useState({
    hasGeminiKey: true,
    hasPinterestToken: false,
    configuredBoardId: '',
    envBoardIdConfigured: false,
  });

  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'ready' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Auto-pilot timer ref
  const autoPilotTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback(
    (type: BotLog['type'], message: string, details?: any) => {
      const newLog: BotLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        type,
        message,
        details,
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    },
    []
  );

  // Save products to localStorage
  useEffect(() => {
    localStorage.setItem('emag_pinterest_products', JSON.stringify(products));
  }, [products]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('emag_pinterest_settings', JSON.stringify(settings));
  }, [settings]);

  // Check server status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
        if (data.configuredBoardId && !settings.pinterestBoardId) {
          setSettings((prev) => ({ ...prev, pinterestBoardId: data.configuredBoardId }));
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
    }
  }, [settings.pinterestBoardId]);

  useEffect(() => {
    fetchStatus();
    addLog('info', 'Aplicația eMAG to Pinterest a fost pornită.');
  }, [fetchStatus, addLog]);

  // Fetch Pinterest boards
  const handleFetchBoards = async (tokenToUse?: string) => {
    const token = tokenToUse || settings.pinterestAccessToken;
    try {
      const res = await fetch('/api/pinterest/boards', {
        headers: token ? { 'x-pinterest-token': token } : {},
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Eroare la preluarea board-urilor');
      }
      if (data.items) {
        setBoards(data.items);
        addLog('pinterest', `S-au încărcat ${data.items.length} board-uri Pinterest.`);
        if (data.items.length > 0 && !settings.pinterestBoardId) {
          setSettings((prev) => ({ ...prev, pinterestBoardId: data.items[0].id }));
        }
      }
    } catch (err: any) {
      addLog('error', `Eroare preluare board-uri: ${err.message}`);
      throw err;
    }
  };

  // Save settings to server & local state
  const handleSaveSettings = async (token: string, boardId: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinterestAccessToken: token,
          pinterestBoardId: boardId,
        }),
      });
      if (res.ok) {
        setSettings((prev) => ({
          ...prev,
          pinterestAccessToken: token,
          pinterestBoardId: boardId,
        }));
        await fetchStatus();
        addLog('info', 'Setările Pinterest API au fost actualizate.');
      }
    } catch (err: any) {
      addLog('error', `Eroare salvare setări: ${err.message}`);
    }
  };

  // Generate Pin Content with Gemini
  const handleGenerateAI = async (product: ProductItem) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: 'generating', errorMessage: undefined } : p))
    );
    addLog('gemini', `Generare text optimizat Pinterest pentru "${product.title}"...`);

    try {
      const res = await fetch('/api/generate-pin-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: product.title,
          productCategory: product.category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Eroare la generarea textului cu Gemini');
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                status: 'ready',
                generatedPin: {
                  title: data.title,
                  description: data.description,
                  rawOutput: data.rawOutput,
                  generatedAt: new Date().toISOString(),
                },
              }
            : p
        )
      );
      addLog('success', `Gemini a generat titlul și descrierea pentru "${data.title}"`);
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: 'failed', errorMessage: err.message || 'Eroare Gemini' }
            : p
        )
      );
      addLog('error', `Eșec generare Gemini pentru "${product.title}": ${err.message}`);
    }
  };

  // Publish Pin to Pinterest API v5
  const handlePublishPin = async (product: ProductItem, boardId: string) => {
    if (!product.generatedPin) {
      addLog('error', 'Nu se poate publica fără titlu și descriere generate.');
      return;
    }

    const targetBoardId =
      boardId ||
      product.boardId ||
      settings.pinterestBoardId ||
      serverStatus.configuredBoardId;

    if (!targetBoardId) {
      addLog('error', 'Selectează un Pinterest Board ID înainte de publicare.');
      setIsSettingsModalOpen(true);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: 'publishing', errorMessage: undefined } : p))
    );
    addLog(
      'pinterest',
      `Trimitere Pin pe Pinterest API v5 [Board: ${targetBoardId}] pentru "${product.generatedPin.title}"...`
    );

    try {
      const res = await fetch('/api/publish-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.pinterestAccessToken
            ? { 'x-pinterest-token': settings.pinterestAccessToken }
            : {}),
        },
        body: JSON.stringify({
          boardId: targetBoardId,
          title: product.generatedPin.title,
          description: product.generatedPin.description,
          linkAfiliat: product.linkAfiliat,
          imageUrl: product.imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Eroare la crearea Pin-ului pe Pinterest');
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                status: 'published',
                publishedPinId: data.pin?.id,
                publishedPinUrl: data.pinUrl,
                publishedAt: new Date().toISOString(),
              }
            : p
        )
      );
      addLog('success', `Pin creat cu succes pe Pinterest! ID: ${data.pin?.id || 'OK'}`);
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                status: 'failed',
                errorMessage: err.message || 'Eroare Pinterest API',
              }
            : p
        )
      );
      addLog('error', `Eșec publicare Pinterest pentru "${product.title}": ${err.message}`);
    }
  };

  // Add Product
  const handleAddProduct = (
    newProdData: Omit<ProductItem, 'id' | 'status'>,
    autoGenerate: boolean
  ) => {
    const newProduct: ProductItem = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      status: 'draft',
    };

    setProducts((prev) => [newProduct, ...prev]);
    addLog('info', `Produs adăugat în coadă: "${newProduct.title}"`);

    if (autoGenerate) {
      handleGenerateAI(newProduct);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addLog('info', 'Produs șters din coadă.');
  };

  const handleUpdateProduct = (updated: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addLog('info', `Produs actualizat: "${updated.title}"`);
  };

  // Batch action: Generate AI for all drafts
  const handleBatchGenerate = async () => {
    const drafts = products.filter((p) => p.status === 'draft' || !p.generatedPin);
    if (drafts.length === 0) return;

    setIsBatchProcessing(true);
    addLog('info', `Pornire generare în masă cu Gemini pentru ${drafts.length} produse...`);

    for (const item of drafts) {
      await handleGenerateAI(item);
    }
    setIsBatchProcessing(false);
  };

  // Trigger Run Now (workflow_dispatch equivalent)
  const handleTriggerRunNow = async () => {
    const nextReady = products.find((p) => p.status === 'ready');
    if (!nextReady) {
      addLog('info', 'Niciun produs cu status "Gata" nu este disponibil pentru publicare.');
      return;
    }
    setIsBatchProcessing(true);
    await handlePublishPin(nextReady, nextReady.boardId || settings.pinterestBoardId);
    setIsBatchProcessing(false);
  };

  // Auto-pilot scheduler effect (simulates the 4-hour GitHub actions cron)
  useEffect(() => {
    if (settings.autoPilotEnabled) {
      addLog(
        'info',
        `Auto-Pilot activat. Verificare automată a cozii la fiecare ${settings.autoPilotIntervalHours} ore.`
      );

      // Interval in milliseconds (for test convenience, we also allow the user to trigger immediately)
      const intervalMs = settings.autoPilotIntervalHours * 3600 * 1000;
      autoPilotTimerRef.current = setInterval(() => {
        const nextReady = products.find((p) => p.status === 'ready');
        if (nextReady) {
          handlePublishPin(nextReady, nextReady.boardId || settings.pinterestBoardId);
        }
      }, intervalMs);

      return () => {
        if (autoPilotTimerRef.current) clearInterval(autoPilotTimerRef.current);
      };
    }
  }, [settings.autoPilotEnabled, settings.autoPilotIntervalHours, products, settings.pinterestBoardId]);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'ready'
        ? p.status === 'ready'
        : filter === 'published'
        ? p.status === 'published'
        : p.status === 'draft';

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.generatedPin?.title && p.generatedPin.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const readyCount = products.filter((p) => p.status === 'ready').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const publishedCount = products.filter((p) => p.status === 'published').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefreshStatus={fetchStatus}
        hasGeminiKey={serverStatus.hasGeminiKey}
        hasPinterestToken={serverStatus.hasPinterestToken || Boolean(settings.pinterestAccessToken)}
        configuredBoardId={settings.pinterestBoardId || serverStatus.configuredBoardId}
        autoPilotEnabled={settings.autoPilotEnabled}
        totalProducts={products.length}
        publishedCount={publishedCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Top Schedule & Bot Action Banner */}
        <SchedulePanel
          autoPilotEnabled={settings.autoPilotEnabled}
          intervalHours={settings.autoPilotIntervalHours}
          onToggleAutoPilot={() =>
            setSettings((prev) => ({ ...prev, autoPilotEnabled: !prev.autoPilotEnabled }))
          }
          onChangeInterval={(hours) =>
            setSettings((prev) => ({ ...prev, autoPilotIntervalHours: hours }))
          }
          onTriggerRunNow={handleTriggerRunNow}
          isRunningNow={isBatchProcessing}
          queueCount={products.length}
          readyCount={readyCount}
        />

        {/* Dashboard Bar: Stats, Search, Filters, Batch actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Tabs / Filters */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Toate ({products.length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'ready'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Gata de Pin ({readyCount})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'draft'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ciorne ({draftCount})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'published'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Publicate ({publishedCount})
            </button>
          </div>

          {/* Search & Batch Actions */}
          <div className="flex items-center space-x-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Caută după titlu sau categorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {draftCount > 0 && (
              <button
                onClick={handleBatchGenerate}
                disabled={isBatchProcessing}
                className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                title="Generează titluri și descrieri pentru toate ciornele"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Generează Tot ({draftCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Nu s-a găsit niciun produs</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Adaugă un produs nou manual sau extrage metadatele direct dintr-un link eMAG / Profitshare.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă Primul Produs</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <PinPreviewCard
                key={product.id}
                product={product}
                boards={boards}
                configuredBoardId={settings.pinterestBoardId || serverStatus.configuredBoardId}
                hasPinterestToken={
                  serverStatus.hasPinterestToken || Boolean(settings.pinterestAccessToken)
                }
                onGenerateAI={handleGenerateAI}
                onPublishPin={handlePublishPin}
                onDeleteProduct={handleDeleteProduct}
                onUpdateProduct={handleUpdateProduct}
              />
            ))}
          </div>
        )}

        {/* Live Activity Log Stream */}
        <LogViewer logs={logs} onClearLogs={() => setLogs([])} />
      </main>

      {/* Modals */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        token={settings.pinterestAccessToken}
        boardId={settings.pinterestBoardId || serverStatus.configuredBoardId}
        boards={boards}
        hasGeminiKey={serverStatus.hasGeminiKey}
        onSaveSettings={handleSaveSettings}
        onFetchBoards={handleFetchBoards}
      />
    </div>
  );
}
