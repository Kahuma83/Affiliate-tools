export interface ProductAnalysis {
  sellingPoints: string[];
  audienceAnalysis: string;
}

export interface HookContent {
  title: string;
  hookLine: string;
  voiceover: string;
  tipsDirector: string;
  postTitle?: string;
  postDescription?: string;
  hashtags?: string;
}

export interface AffiliateContentPack {
  productAnalysis: ProductAnalysis;
  hooks: {
    fomo: HookContent;
    problemSolution: HookContent;
    reviewSpill: HookContent;
    promoRacun: HookContent;
    sillyAbsurd?: HookContent;
    outOfTheBox?: HookContent;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  productLink?: string;
  productName: string;
  category: string;
  productDescription: string;
  targetAudience: string;
  extraInfo?: string;
  duration?: string;
  platform?: string;
  contentPack: AffiliateContentPack;
}
