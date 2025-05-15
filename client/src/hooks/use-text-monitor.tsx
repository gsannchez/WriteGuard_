import { useState, useEffect } from 'react';
import { analyzeText, TextAnalysisResponse } from '@/lib/openai';
import { useSettings } from '@/hooks/use-settings';

export function useTextMonitor(text: string) {
  const [processingResult, setProcessingResult] = useState<TextAnalysisResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { settings } = useSettings();
  
  useEffect(() => {
    // Skip processing if text is too short or settings are disabled
    if (
      !text || 
      text.length < 3 || 
      (!settings.spellingCheck && !settings.grammarCheck && !settings.autocomplete)
    ) {
      setProcessingResult(null);
      return;
    }
    
    // Debounce text processing
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      
      try {
        const result = await analyzeText(text);
        
        // Filter results based on settings
        const filteredResult: TextAnalysisResponse = {
          corrections: settings.spellingCheck || settings.grammarCheck 
            ? result.corrections.filter(c => 
                (settings.spellingCheck && c.type === 'spelling') || 
                (settings.grammarCheck && c.type === 'grammar')
              )
            : [],
          autocompleteSuggestions: settings.autocomplete 
            ? result.autocompleteSuggestions 
            : []
        };
        
        setProcessingResult(filteredResult);
      } catch (error) {
        console.error('Error processing text:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [text, settings]);
  
  return {
    processingResult,
    isProcessing
  };
}
