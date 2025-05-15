import { checkSpelling } from './dictionary';
import { analyzeSentence } from './openai';
import { analyzeTextOffline } from './localSpellChecker';
import { storage } from '../storage';

interface CorrectionItem {
  word: string;
  suggestions: string[];
  type: 'spelling' | 'grammar';
  context: string;
}

interface AnalysisResult {
  corrections: CorrectionItem[];
  autocompleteSuggestions: string[];
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  // Get user settings to check if offline mode is enabled
  const settings = await storage.getSettings();
  const isOfflineMode = settings.workOffline || false;
  const language = settings.language || 'en';
  
  // Use different analysis approach based on settings
  if (isOfflineMode) {
    console.log('Using offline text analysis');
    return analyzeTextLocal(text, language);
  } else {
    console.log('Using online text analysis (OpenAI)');
    return analyzeTextWithAI(text);
  }
}

/**
 * Analyze text using local processing only (offline mode)
 */
async function analyzeTextLocal(text: string, language: string): Promise<AnalysisResult> {
  try {
    // Use the local spell checker implementation
    return await analyzeTextOffline(text, language);
  } catch (error) {
    console.error('Error in offline text analysis:', error);
    return {
      corrections: [],
      autocompleteSuggestions: []
    };
  }
}

/**
 * Analyze text using OpenAI API (online mode)
 */
async function analyzeTextWithAI(text: string): Promise<AnalysisResult> {
  // Initialize the result object
  const result: AnalysisResult = {
    corrections: [],
    autocompleteSuggestions: []
  };
  
  // Split text into words for spelling check
  const words = text.split(/\s+/);
  
  // Check each word for spelling errors
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, ''); // Strip punctuation
    if (word.length < 2) continue;
    
    const isCorrect = await checkSpelling(word);
    
    if (!isCorrect) {
      // Get some context around the word (up to 5 words before and after)
      const startIdx = Math.max(0, i - 5);
      const endIdx = Math.min(words.length, i + 6);
      const context = words.slice(startIdx, endIdx).join(' ');
      
      // Get spelling suggestions
      const suggestions = await getSuggestions(word);
      
      result.corrections.push({
        word,
        suggestions,
        type: 'spelling',
        context
      });
    }
  }
  
  // Check grammar and get autocomplete suggestions using OpenAI
  if (text.length > 10) {
    try {
      const aiAnalysis = await analyzeSentence(text);
      
      // Add grammar corrections
      if (aiAnalysis.grammar && aiAnalysis.grammar.length > 0) {
        aiAnalysis.grammar.forEach(item => {
          result.corrections.push({
            word: item.incorrect,
            suggestions: [item.correct],
            type: 'grammar',
            context: item.context
          });
        });
      }
      
      // Add autocomplete suggestions
      if (aiAnalysis.autocomplete && aiAnalysis.autocomplete.length > 0) {
        result.autocompleteSuggestions = aiAnalysis.autocomplete;
      }
    } catch (error) {
      console.error('Error in AI analysis:', error);
    }
  }
  
  return result;
}

// Helper function to get spelling suggestions
async function getSuggestions(word: string): Promise<string[]> {
  // For common misspellings, return hardcoded suggestions
  const commonMisspellings: Record<string, string[]> = {
    'teh': ['the', 'then', 'ten'],
    'taht': ['that', 'tag', 'taut'],
    'recieve': ['receive', 'relieve', 'reprieve'],
    // Add more common misspellings as needed
  };
  
  if (word.toLowerCase() in commonMisspellings) {
    return commonMisspellings[word.toLowerCase()];
  }
  
  // Otherwise, generate suggestions
  return ['example', 'suggestion', word + 's'];
}
