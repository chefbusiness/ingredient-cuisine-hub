
export interface GenerateContentParams {
  type: 'ingredient' | 'category' | 'market_research' | 'weather_impact' | 'cultural_variants' | 'trend_analysis' | 'supply_chain';
  category?: string;
  region?: string;
  count?: number;
  ingredient?: string;
  search_query?: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  temperature: number;
  max_tokens: number;
}
