export interface GeneratedPin {
  title: string;
  description: string;
  rawOutput?: string;
  generatedAt?: string;
}

export type ProductStatus = 'draft' | 'generating' | 'ready' | 'publishing' | 'published' | 'failed';

export interface ProductItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  linkAfiliat: string;
  price?: string;
  boardId?: string;
  status: ProductStatus;
  generatedPin?: GeneratedPin;
  publishedPinId?: string;
  publishedPinUrl?: string;
  publishedAt?: string;
  errorMessage?: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  privacy?: string;
  pin_count?: number;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'gemini' | 'pinterest' | 'error' | 'success';
  message: string;
  details?: any;
}

export interface BotSettings {
  pinterestAccessToken: string;
  pinterestBoardId: string;
  autoPilotEnabled: boolean;
  autoPilotIntervalHours: number;
  autoGenerateOnAdd: boolean;
}
