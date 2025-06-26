
export interface IngredientData {
  name: string;
  name_en: string;
  name_la?: string;
  name_fr?: string;
  name_it?: string;
  name_pt?: string;
  name_zh?: string;
  description: string;
  category: string;
  temporada?: string;
  origen?: string;
  merma?: number;
  rendimiento?: number;
  popularity?: number;
  prices_by_country?: any[];
  price_estimate?: string;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    vitamin_c?: number;
  };
  uses?: string[];
  recipes?: Array<{
    name: string;
    type: string;
    difficulty: string;
    time: string;
  }>;
  varieties?: string[];
}

export interface ProcessingResult {
  id?: string;
  name: string;
  category: string;
  success: boolean;
  reason?: string;
  skipped?: boolean;
  languages_complete?: boolean;
  missing_languages?: string[];
}

export interface ProcessingSummary {
  total_processed: number;
  successfully_created: number;
  duplicates_skipped: number;
  multi_country_pricing_enabled: boolean;
}
