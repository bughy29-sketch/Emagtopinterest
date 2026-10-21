import React, { useState } from 'react';
import { ProductItem } from '../types';
import { X, Globe, Link as LinkIcon, Image, Sparkles, Loader2, Plus, Zap } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<ProductItem, 'id' | 'status'>, autoGenerate: boolean) => void;
}

const PRESET_PRODUCTS = [
  {
    title: 'Aspirator fara sac Rowenta Compact Power XXL 550W',
    category: 'Electrocasnice & Curățenie',
    imageUrl: 'https://s13emagst.akamaized.net/products/32812/32811451/images/res_6df4598440530ed5845c22ee3a6cb6e7.jpg',
    linkAfiliat: 'https://l.profitshare.ro/l/16706445',
    price: '389.99 Lei',
  },
  {
    title: 'Espressor automat Philips Seria 2200 EP2220/10',
    category: 'Electrocasnice & Bucătărie',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    linkAfiliat: 'https://l.profitshare.ro/l/philips-espressor-2200',
    price: '1.499 Lei',
  },
  {
    title: 'Căști Wireless Sony WH-1000XM5 Noise Cancelling',
    category: 'Audio & Hi-Fi',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    linkAfiliat: 'https://l.profitshare.ro/l/sony-xm5-emag',
    price: '1.699 Lei',
  },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electrocasnice & Curățenie');
  const [imageUrl, setImageUrl] = useState('');
  const [linkAfiliat, setLinkAfiliat] = useState('');
  const [price, setPrice] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);

  if (!isOpen) return null;

  const handleFetchMetadata = async () => {
    if (!urlInput.trim()) {
      setFetchError('Introdu un link de produs eMAG sau link afiliat');
      return;
    }

    setIsFetchingUrl(true);
    setFetchError('');

    try {
      const res = await fetch('/api/fetch-product-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nu s-au putut extrage informațiile');
      }

      if (data.title) setTitle(data.title);
      if (data.image) setImageUrl(data.image);
      if (data.category) setCategory(data.category);
      if (!linkAfiliat) setLinkAfiliat(urlInput);
    } catch (err: any) {
      setFetchError(err.message || 'Eroare la extragerea datelor');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleLoadPreset = (preset: typeof PRESET_PRODUCTS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setImageUrl(preset.imageUrl);
    setLinkAfiliat(preset.linkAfiliat);
    setPrice(preset.price);
    setFetchError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !linkAfiliat.trim()) {
      setFetchError('Titlul, imaginea și linkul afiliat sunt obligatorii');
      return;
    }

    onAddProduct(
      {
        title: title.trim(),
        category: category.trim(),
        imageUrl: imageUrl.trim(),
        linkAfiliat: linkAfiliat.trim(),
        price: price.trim() || undefined,
      },
      autoGenerate
    );

    // Reset
    setTitle('');
    setImageUrl('');
    setLinkAfiliat('');
    setUrlInput('');
    setPrice('');
    onClose();
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
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Adaugă Produs Nou</h2>
            <p className="text-xs text-slate-500">
              Introdu datele produsului eMAG / Profitshare pentru a genera Pinul
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Exemple rapide (1-click):
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_PRODUCTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50/50 text-[11px] transition-colors group"
              >
                <div className="font-semibold text-slate-800 line-clamp-1 group-hover:text-red-700">
                  {p.title.split(' ')[0]} {p.title.split(' ')[1]}
                </div>
                <div className="text-slate-400 text-[10px] truncate">{p.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Auto fetch from URL section */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 space-y-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center">
              <Globe className="w-3.5 h-3.5 mr-1 text-blue-600" /> Autofill din URL eMAG / Profitshare
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Opțional</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              placeholder="https://www.emag.ro/... sau https://l.profitshare.ro/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleFetchMetadata}
              disabled={isFetchingUrl}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0 disabled:opacity-50"
            >
              {isFetchingUrl ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>Extrage</span>
            </button>
          </div>
          {fetchError && <p className="text-[11px] text-red-600 font-medium">{fetchError}</p>}
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Titlu Produs <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Aspirator fara sac Rowenta Compact Power XXL 550W"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categorie Produs
              </label>
              <input
                type="text"
                placeholder="Ex: Electrocasnice & Curățenie"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preț (Opțional)
              </label>
              <input
                type="text"
                placeholder="Ex: 389.99 Lei"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              URL Imagine Produs <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Image className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="url"
                required
                placeholder="https://s13emagst.akamaized.net/... sau https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Link Afiliat / Destinație Pin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="url"
                required
                placeholder="https://l.profitshare.ro/l/... sau link 2Performant / eMAG"
                value={linkAfiliat}
                onChange={(e) => setLinkAfiliat(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Auto-generate with Gemini toggle */}
          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1" /> Generează automat cu Gemini AI la adăugare
              </span>
            </label>
          </div>

          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20"
            >
              Adaugă în Coadă
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
