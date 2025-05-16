import { checkSpelling } from './dictionary';
import { analyzeSentence } from './openai';
import { analyzeTextOffline } from './localSpellChecker';
import { detectLanguage, mapToSupportedLanguage } from './languageDetection';
import { textCache } from './textCache';
import { errorHandler, ErrorType } from './errorHandler';
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
  // Skip processing for very short text
  if (text.length < 3) {
    return { corrections: [], autocompleteSuggestions: [] };
  }
  
  // Check cache first
  const cachedResult = textCache.get(text);
  if (cachedResult) {
    console.log('Using cached analysis result');
    return cachedResult;
  }
  
  // Get user settings to check if offline mode is enabled
  const settings = await storage.getSettings();
  const isOfflineMode = settings.workOffline || false;
  
  // Detect language if needed or use user preference
  let language = settings.language || 'en';
  
  // If language is set to auto, detect the language
  if (language === 'auto' && text.length > 10) {
    const detectedLang = detectLanguage(text);
    language = mapToSupportedLanguage(detectedLang);
    console.log(`Auto-detected language: ${language}`);
  } else {
    // Make sure the language is supported by our dictionaries
    language = mapToSupportedLanguage(language.split('-')[0]);
  }
  
  // Process the text with appropriate method
  let result: AnalysisResult;
  
  if (isOfflineMode) {
    console.log(`Using offline text analysis (language: ${language})`);
    result = await analyzeTextLocal(text, language);
  } else {
    console.log('Using online text analysis (OpenAI)');
    result = await analyzeTextWithAI(text);
  }
  
  // Store the result in cache
  textCache.set(text, result);
  
  return result;
}

/**
 * Analyze text using local processing only (offline mode)
 */
async function analyzeTextLocal(text: string, language: string): Promise<AnalysisResult> {
  try {
    // Use the local spell checker implementation
    const result = await analyzeTextOffline(text, language);
    
    // If we got a successful result, reset error count for the dictionary service
    errorHandler.resetErrorCount(ErrorType.DICTIONARY);
    
    return result;
  } catch (error) {
    console.error('Error in offline text analysis:', error);
    
    // Log the error with our error handler
    const shouldUseFallback = errorHandler.handleError(ErrorType.DICTIONARY, error as Error);
    
    // If dictionaries are failing repeatedly, we might want to try to re-initialize them
    if (shouldUseFallback) {
      // Try to recover dictionary in the background
      errorHandler.startRecovery(ErrorType.DICTIONARY, async () => {
        try {
          // Re-initialize the dictionary
          const { initDictionary } = await import('./localSpellChecker');
          await initDictionary(language);
          return true;
        } catch {
          return false;
        }
      });
    }
    
    // Return an empty result if we can't analyze the text
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
  
  // Check if AI service is in a failing state
  const isAIFailing = errorHandler.isServiceFailing(ErrorType.API);
  if (isAIFailing) {
    console.log('OpenAI service is failing, falling back to offline mode');
    // Try to recover the API service in the background
    errorHandler.startRecovery(ErrorType.API, async () => {
      try {
        // Test API with a simple query
        await analyzeSentence('Hello');
        return true; // Recovery successful
      } catch {
        return false; // Still failing
      }
    });
    
    // Use offline mode as fallback
    const settings = await storage.getSettings();
    const languageCode = mapToSupportedLanguage(settings.language || 'en');
    return analyzeTextLocal(text, languageCode);
  }
  
  // Split text into words for spelling check
  const words = text.split(/\s+/);
  
  // Check each word for spelling errors
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, ''); // Strip punctuation
    if (word.length < 2) continue;
    
    try {
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
    } catch (error) {
      errorHandler.handleError(ErrorType.DICTIONARY, error as Error);
      // Continue with next word
    }
  }
  
  // Check grammar and get autocomplete suggestions using OpenAI
  if (text.length > 10) {
    try {
      const aiAnalysis = await analyzeSentence(text);
      
      // If we get here, the API is working - reset error count
      errorHandler.resetErrorCount(ErrorType.API);
      
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
      const shouldUseFallback = errorHandler.handleError(ErrorType.API, error as Error);
      
      if (shouldUseFallback) {
        console.log('Multiple API failures detected, switching to offline mode');
        // Get the current settings
        const settings = await storage.getSettings();
        
        // If already in offline mode or already falling back, just return current results
        if (!settings.workOffline) {
          // Else, try offline analysis as fallback
          const languageCode = mapToSupportedLanguage(settings.language || 'en');
          const offlineResults = await analyzeTextLocal(text, languageCode);
          
          // Merge any spelling corrections we already found with offline grammar results
          return {
            corrections: [...result.corrections, ...offlineResults.corrections],
            autocompleteSuggestions: offlineResults.autocompleteSuggestions
          };
        }
      }
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
