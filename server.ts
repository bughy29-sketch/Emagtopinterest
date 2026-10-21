import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory runtime storage for settings if not provided via environment
let runtimeConfig = {
  pinterestAccessToken: process.env.PINTEREST_ACCESS_TOKEN || '',
  pinterestBoardId: process.env.PINTEREST_BOARD_ID || '',
};

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ------------------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------------------

// 1. Health & Config status
app.get('/api/status', (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasPinterestToken = Boolean(
    runtimeConfig.pinterestAccessToken || process.env.PINTEREST_ACCESS_TOKEN
  );
  const boardId =
    runtimeConfig.pinterestBoardId || process.env.PINTEREST_BOARD_ID || '';

  res.json({
    hasGeminiKey,
    hasPinterestToken,
    configuredBoardId: boardId,
    envBoardIdConfigured: Boolean(process.env.PINTEREST_BOARD_ID),
  });
});

// 2. Update runtime settings (Pinterest Access Token / Board ID)
app.post('/api/settings', (req: Request, res: Response) => {
  const { pinterestAccessToken, pinterestBoardId } = req.body;
  if (pinterestAccessToken !== undefined) {
    runtimeConfig.pinterestAccessToken = String(pinterestAccessToken).trim();
  }
  if (pinterestBoardId !== undefined) {
    runtimeConfig.pinterestBoardId = String(pinterestBoardId).trim();
  }
  res.json({
    success: true,
    hasPinterestToken: Boolean(runtimeConfig.pinterestAccessToken),
    configuredBoardId: runtimeConfig.pinterestBoardId,
  });
});

// 3. Generate Pinterest pin content using Gemini 3.8 Flash (equivalent to original bot_pinterest_emag.py)
app.post('/api/generate-pin-details', async (req: Request, res: Response) => {
  try {
    const { productTitle, productCategory } = req.body;

    if (!productTitle) {
      return res.status(400).json({ error: 'Titlul produsului este obligatoriu' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'Cheia GEMINI_API_KEY nu este configurată pe server. Asigură-te că este setată în mediu.',
      });
    }

    const prompt = `Creează conținut optimizat pentru Pinterest în limba română pentru un produs eMAG:
- Titlu produs: ${productTitle}
- Categorie: ${productCategory || 'General'}

Cerințe:
1. Titlu Pin: Atractiv, scurt, cu cuvinte cheie cautate (max 100 caractere).
2. Descriere: 2-3 fraze persuasive, axate pe beneficii, urmate de un Call To Action ("Apasă pentru detalii și preț pe eMAG").
3. Hashtag-uri: 4-5 hashtag-uri relevante la final.

Format răspuns strict:
TITLU: [Titlul tău aici]
DESCRIERE: [Descrierea ta aici]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    let title = '';
    let description = '';

    const lines = text.split('\n');
    let isCollectingDesc = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('TITLU:')) {
        title = trimmed.replace('TITLU:', '').trim();
      } else if (trimmed.startsWith('DESCRIERE:')) {
        description = trimmed.replace('DESCRIERE:', '').trim();
        isCollectingDesc = true;
      } else if (isCollectingDesc && trimmed.length > 0) {
        description += ` ${trimmed}`;
      }
    }

    // Fallbacks if formatting was slightly off
    if (!title && lines.length > 0) {
      title = lines[0].replace(/^(Titlu\s*:|#\s*)/i, '').trim();
    }
    if (!description && lines.length > 1) {
      description = lines.slice(1).join('\n').replace(/^(Descriere\s*:)/i, '').trim();
    }

    // Enforce limits
    title = title.substring(0, 100);
    description = description.substring(0, 800);

    return res.json({
      title,
      description,
      rawOutput: text,
    });
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Eroare la generarea conținutului cu Gemini',
    });
  }
});

// 4. Fetch Pinterest boards via Pinterest API v5
app.get('/api/pinterest/boards', async (req: Request, res: Response) => {
  const token =
    (req.headers['x-pinterest-token'] as string) ||
    runtimeConfig.pinterestAccessToken ||
    process.env.PINTEREST_ACCESS_TOKEN;

  if (!token) {
    return res.status(401).json({
      error: 'Pinterest Access Token lipsește. Adaugă-l în setări sau în variabilele de mediu.',
    });
  }

  try {
    const response = await fetch('https://api.pinterest.com/v5/boards', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || `Eroare Pinterest API (${response.status})`,
        details: data,
      });
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Eroare la contactarea Pinterest API',
    });
  }
});

// 5. Publish pin to Pinterest API v5
app.post('/api/publish-pin', async (req: Request, res: Response) => {
  const { boardId, title, description, linkAfiliat, imageUrl } = req.body;

  const token =
    (req.headers['x-pinterest-token'] as string) ||
    runtimeConfig.pinterestAccessToken ||
    process.env.PINTEREST_ACCESS_TOKEN;

  if (!token) {
    return res.status(401).json({
      error: 'Pinterest Access Token lipsește. Completează tokenul în panoul de configurare.',
    });
  }

  const targetBoardId =
    boardId ||
    runtimeConfig.pinterestBoardId ||
    process.env.PINTEREST_BOARD_ID;

  if (!targetBoardId) {
    return res.status(400).json({
      error: 'Pinterest Board ID lipsește. Specifică board-ul de destinație.',
    });
  }

  if (!imageUrl) {
    return res.status(400).json({ error: 'URL-ul imaginii este obligatoriu' });
  }

  const payload = {
    board_id: targetBoardId,
    title: (title || '').substring(0, 100),
    description: (description || '').substring(0, 800),
    link: linkAfiliat || '',
    media_source: {
      source_type: 'image_url',
      url: imageUrl,
    },
  };

  try {
    const pinterestRes = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resData = await pinterestRes.json();

    if (pinterestRes.status === 201 || pinterestRes.ok) {
      return res.status(201).json({
        success: true,
        pin: resData,
        pinUrl: resData.id ? `https://www.pinterest.com/pin/${resData.id}/` : undefined,
      });
    } else {
      console.error('Pinterest API error:', resData);
      return res.status(pinterestRes.status).json({
        success: false,
        error: resData.message || `Eroare Pinterest API (${pinterestRes.status})`,
        details: resData,
      });
    }
  } catch (error: any) {
    console.error('Pinterest publish error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Eroare la trimiterea pin-ului către Pinterest',
    });
  }
});

// 6. Helper: Fetch metadata from eMAG or affiliate product URL
app.post('/api/fetch-product-metadata', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL-ul este obligatoriu' });
  }

  try {
    // Follow redirects and fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });

    const html = await response.text();

    // Extract OpenGraph tags
    const extractMeta = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta[^>]*property=["']og:${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${prop}["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*name=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i'));
      return match ? match[1] : '';
    };

    let title = extractMeta('title');
    if (!title) {
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      title = titleMatch ? titleMatch[1] : '';
    }
    // Clean eMAG suffixes like " - eMAG.ro"
    title = title.replace(/\s*-\s*eMAG\.ro.*$/i, '').trim();

    const image = extractMeta('image');
    let description = extractMeta('description');

    // Guess category from breadcrumbs or title keywords if available
    let category = 'Electronice & Tehnologie';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('aspirator') || lowerTitle.includes('fier de calcat') || lowerTitle.includes('cuptor')) {
      category = 'Electrocasnice & Curățenie';
    } else if (lowerTitle.includes('telefon') || lowerTitle.includes('iphone') || lowerTitle.includes('samsung') || lowerTitle.includes('casti')) {
      category = 'Telefoane & Gadgeturi';
    } else if (lowerTitle.includes('laptop') || lowerTitle.includes('pc') || lowerTitle.includes('monitor')) {
      category = 'Laptopuri & IT';
    } else if (lowerTitle.includes('crema') || lowerTitle.includes('parfum') || lowerTitle.includes('sampon')) {
      category = 'Frumusețe & Îngrijire Personală';
    } else if (lowerTitle.includes('ceas') || lowerTitle.includes('geanta') || lowerTitle.includes('pantofi')) {
      category = 'Modă & Accesorii';
    } else if (lowerTitle.includes('canapea') || lowerTitle.includes('dulap') || lowerTitle.includes('birou') || lowerTitle.includes('mobila')) {
      category = 'Casă & Grădină';
    }

    return res.json({
      title,
      image,
      description,
      category,
      finalUrl: response.url,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `Nu s-au putut prelua metadatele: ${error?.message || 'Eroare rețea'}`,
    });
  }
});

// ------------------------------------------------------------------------------
// Vite / Static Files Middleware
// ------------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 eMAG to Pinterest Bot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
