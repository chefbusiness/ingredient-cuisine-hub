
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

export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  temperature: number;
  max_tokens: number;
  top_p?: number;
  return_images?: boolean;
  return_related_questions?: boolean;
  search_domain_filter?: string[];
  search_recency_filter?: string;
  frequency_penalty?: number;
  presence_penalty?: number;
}
