import React, { useState } from 'react';
import { ProductItem, PinterestBoard } from '../types';
import {
  Sparkles,
  Send,
  ExternalLink,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  Copy,
  Tag,
  Loader2,
  BookmarkCheck,
} from 'lucide-react';

interface PinPreviewCardProps {
  product: ProductItem;
  boards: PinterestBoard[];
  configuredBoardId: string;
  hasPinterestToken: boolean;
  onGenerateAI: (product: ProductItem) => Promise<void>;
  onPublishPin: (product: ProductItem, boardId: string) => Promise<void>;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (product: ProductItem) => void;
}

export const PinPreviewCard: React.FC<PinPreviewCardProps> = ({
  product,
  boards,
  configuredBoardId,
  hasPinterestToken,
  onGenerateAI,
  onPublishPin,
  onDeleteProduct,
  onUpdateProduct,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(
    product.generatedPin?.title || product.title
  );
  const [editedDescription, setEditedDescription] = useState(
    product.generatedPin?.description || ''
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    product.boardId || configuredBoardId || ''
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const isGenerating = product.status === 'generating';
  const isPublishing = product.status === 'publishing';
  const isPublished = product.status === 'published';

  const handleSaveEdit = () => {
    onUpdateProduct({
      ...product,
      generatedPin: {
        title: editedTitle.substring(0, 100),
        description: editedDescription.substring(0, 800),
        generatedAt: product.generatedPin?.generatedAt || new Date().toISOString(),
      },
      status: product.status === 'draft' ? 'ready' : product.status,
    });
    setIsEditing(false);
  };

  const handleCopyAffiliate = () => {
    navigator.clipboard.writeText(product.linkAfiliat);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const extractDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return 'emag.ro';
    }
  };

  // Extract hashtags from description
  const extractHashtags = (text: string) => {
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    return matches || [];
  };

  const hashtags = product.generatedPin?.description
    ? extractHashtags(product.generatedPin.description)
    : [];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Top Banner / Status header */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 truncate max-w-[180px]">
          {product.category}
        </span>
        <div className="flex items-center space-x-1.5">
          {isPublished ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
              <Check className="w-3 h-3 mr-1" /> Publicat
            </span>
          ) : product.status === 'ready' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
              Gata de Pin
            </span>
          ) : isGenerating ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Gemini AI...
            </span>
          ) : isPublishing ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-800">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Trimitere...
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-slate-200 text-slate-700">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Pinterest-like Preview Canvas */}
      <div className="relative p-3 bg-slate-100/70">
        <div className="relative rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200/80 aspect-[4/3] flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // fallback image if broken link
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Pinterest Save Button overlay */}
          <div className="absolute top-2 right-2">
            <button
              onClick={() => onPublishPin(product, selectedBoardId || configuredBoardId)}
              disabled={isPublishing || !product.generatedPin}
              title={
                !product.generatedPin
                  ? 'Generează mai întâi textul cu Gemini AI'
                  : 'Publică acest Pin pe Pinterest'
              }
              className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center space-x-1 shadow-md transition-transform active:scale-95 ${
                !product.generatedPin
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : isPublished
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Trimit...</span>
                </>
              ) : isPublished ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Salvat!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.365-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>Salvează</span>
                </>
              )}
            </button>
          </div>

          {/* Destination Link Pill */}
          <div className="absolute bottom-2 left-2 max-w-[80%]">
            <a
              href={product.linkAfiliat}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-slate-800 shadow-sm hover:bg-white transition-colors truncate"
            >
              <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{extractDomain(product.linkAfiliat)}</span>
            </a>
          </div>

          {product.price && (
            <div className="absolute bottom-2 right-2">
              <span className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white font-bold text-xs shadow-sm">
                {product.price}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pin Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                <label className="font-medium text-slate-700">Titlu Pin (max 100 char)</label>
                <span className={editedTitle.length > 100 ? 'text-red-500 font-bold' : ''}>
                  {editedTitle.length}/100
                </span>
              </div>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                maxLength={100}
                className="w-full text-sm font-semibold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                <label className="font-medium text-slate-700">Descriere &amp; Hashtag-uri (max 800 char)</label>
                <span className={editedDescription.length > 800 ? 'text-red-500 font-bold' : ''}>
                  {editedDescription.length}/800
                </span>
              </div>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
                maxLength={800}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvează Modificările</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Anulează
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Pin Title */}
            <div>
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {product.generatedPin?.title || product.title}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Editează conținutul Pin-ului"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              {!product.generatedPin && (
                <p className="text-[11px] text-amber-600 font-medium mt-0.5 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 inline" /> Necesită generare Gemini AI
                </p>
              )}
            </div>

            {/* Pin Description */}
            {product.generatedPin?.description ? (
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {product.generatedPin.description}
              </p>
            ) : (
              <p className="text-xs italic text-slate-400">
                Apasă pe "Generează cu Gemini" pentru a crea titlul atractiv și descrierea optimizată în limba română cu CTA și hashtag-uri.
              </p>
            )}

            {/* Hashtag Badges */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {hashtags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-[10px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100"
                  >
                    <Tag className="w-2.5 h-2.5 mr-0.5 opacity-60" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Board Selection */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Pinterest Board:</span>
            {boards.length > 0 ? (
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500 max-w-[140px] truncate"
              >
                <option value="">(Implicit)</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-mono text-[10px] text-slate-400">
                {configuredBoardId ? `ID: ${configuredBoardId.slice(0, 8)}...` : 'Nespecificat'}
              </span>
            )}
          </div>

          {/* Published Pin URL if available */}
          {product.publishedPinUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-800 truncate">
                Pin publicat cu succes!
              </span>
              <a
                href={product.publishedPinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center ml-2 shrink-0"
              >
                Vezi Pin <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          )}

          {product.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-[11px] text-red-700 flex items-start space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
              <span className="break-all">{product.errorMessage}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center space-x-2 pt-1">
            {/* Generate Gemini AI button */}
            <button
              onClick={() => onGenerateAI(product)}
              disabled={isGenerating || isPublishing}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini scrie...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{product.generatedPin ? 'Re-generează' : 'Generează cu Gemini'}</span>
                </>
              )}
            </button>

            {/* Direct Publish button */}
            <button
              onClick={() => onPublishPin(product, selectedBoardId || configuredBoardId)}
              disabled={isPublishing || isGenerating || !product.generatedPin}
              title={
                !product.generatedPin
                  ? 'Generează mai întâi textul cu Gemini AI'
                  : 'Trimite pe Pinterest API'
              }
              className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                product.generatedPin
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>

            {/* Copy Affiliate link */}
            <button
              onClick={handleCopyAffiliate}
              title="Copiază link afiliat"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Delete button */}
            <button
              onClick={() => onDeleteProduct(product.id)}
              title="Șterge din listă"
              className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
