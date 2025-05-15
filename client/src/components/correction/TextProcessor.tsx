import { useEffect, useState } from 'react';
import SuggestionDropdown from './SuggestionDropdown';
import { useTextMonitor } from '@/hooks/use-text-monitor';

interface TextProcessorProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function TextProcessor({ text, onTextChange }: TextProcessorProps) {
  const [suggestions, setSuggestions] = useState<{
    text: string;
    position: { left: number; top: number };
    word: string;
    alternatives: string[];
  } | null>(null);
  
  const { processingResult } = useTextMonitor(text);
  
  // Process text for errors and suggestions
  useEffect(() => {
    if (processingResult && processingResult.corrections.length > 0) {
      const firstCorrection = processingResult.corrections[0];
      
      // Calculate position (this would be more complex in a real app)
      // Here we're just setting a fixed position for the demo
      setSuggestions({
        text,
        position: { left: 100, top: 20 },
        word: firstCorrection.word,
        alternatives: firstCorrection.suggestions
      });
    } else {
      setSuggestions(null);
    }
  }, [processingResult, text]);
  
  const applySuggestion = (suggestion: string) => {
    if (!suggestions) return;
    
    // Replace the incorrect word with the selected suggestion
    const newText = text.replace(suggestions.word, suggestion);
    onTextChange(newText);
    setSuggestions(null);
  };
  
  const dismissSuggestion = () => {
    setSuggestions(null);
  };
  
  return (
    <div className="relative">
      {suggestions && (
        <SuggestionDropdown
          suggestions={suggestions.alternatives}
          position={{
            left: `${suggestions.position.left}px`,
            top: `${suggestions.position.top}px`
          }}
          onSelect={applySuggestion}
          onDismiss={dismissSuggestion}
        />
      )}
    </div>
  );
}
