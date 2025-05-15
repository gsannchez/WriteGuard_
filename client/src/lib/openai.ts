import { apiRequest } from './queryClient';

// Interface for text analysis response
export interface TextAnalysisResponse {
  corrections: {
    word: string;
    suggestions: string[];
    type: 'spelling' | 'grammar';
    context: string;
  }[];
  autocompleteSuggestions: string[];
}

// Function to analyze text and get suggestions
export async function analyzeText(text: string): Promise<TextAnalysisResponse> {
  try {
    const response = await apiRequest('POST', '/api/analyze-text', { text });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      corrections: [],
      autocompleteSuggestions: []
    };
  }
}

// Function to get autocomplete suggestions
export async function getAutocompleteSuggestions(text: string): Promise<string[]> {
  try {
    const response = await apiRequest('POST', '/api/autocomplete', { text });
    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    return [];
  }
}

// Function to log a correction for statistics
export async function logCorrection(correction: {
  type: 'spelling' | 'grammar' | 'autocomplete';
  original: string;
  corrected: string;
  application: string;
}): Promise<void> {
  try {
    await apiRequest('POST', '/api/log-correction', correction);
  } catch (error) {
    console.error('Error logging correction:', error);
  }
}
