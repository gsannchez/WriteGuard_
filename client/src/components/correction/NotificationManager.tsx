import React, { useState, useEffect } from 'react';
import TextNotification from './TextNotification';
import { logCorrection } from '@/lib/openai';

// This component manages the display of correction and autocomplete notifications
export default function NotificationManager() {
  const [corrections, setCorrections] = useState<any[]>([]);
  const [autocompletes, setAutocompletes] = useState<string[]>([]);
  const [currentCorrection, setCurrentCorrection] = useState<any | null>(null);
  const [currentAutocomplete, setCurrentAutocomplete] = useState<string[]>([]);
  const [isElectron, setIsElectron] = useState(false);
  
  // Check if running in Electron
  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && 'electron' in window);
  }, []);
  
  // Listen for correction suggestions from Electron main process
  useEffect(() => {
    if (!isElectron) return;
    
    let removeListener: (() => void) | undefined;
    
    try {
      if (typeof window !== 'undefined' && 'electron' in window) {
        removeListener = window.electron?.on('correction-suggestion', (data) => {
          // Add new corrections to the queue
          setCorrections(prev => [...prev, ...data]);
        });
      }
    } catch (error) {
      console.error('Error setting up correction listener:', error);
    }
    
    return () => {
      if (removeListener) removeListener();
    };
  }, [isElectron]);
  
  // Listen for autocomplete suggestions from Electron main process
  useEffect(() => {
    if (!isElectron) return;
    
    let removeListener: (() => void) | undefined;
    
    try {
      if (typeof window !== 'undefined' && 'electron' in window) {
        removeListener = window.electron?.on('autocomplete-suggestion', (data) => {
          setAutocompletes(data);
        });
      }
    } catch (error) {
      console.error('Error setting up autocomplete listener:', error);
    }
    
    return () => {
      if (removeListener) removeListener();
    };
  }, [isElectron]);
  
  // Process the queue of corrections
  useEffect(() => {
    if (corrections.length > 0 && !currentCorrection) {
      // Take the first correction from the queue
      const nextCorrection = corrections[0];
      setCurrentCorrection(nextCorrection);
      setCorrections(prev => prev.slice(1));
    }
  }, [corrections, currentCorrection]);
  
  // Process autocomplete suggestions
  useEffect(() => {
    if (autocompletes.length > 0 && currentAutocomplete.length === 0) {
      setCurrentAutocomplete(autocompletes);
      setAutocompletes([]);
    }
  }, [autocompletes, currentAutocomplete]);
  
  const handleApplyCorrection = (suggestion: string) => {
    if (!currentCorrection) return;
    
    // In a real desktop app, this would communicate with the text monitor
    // to replace the text in the current application
    if (isElectron) {
      // Log correction for statistics
      logCorrection({
        type: currentCorrection.type,
        original: currentCorrection.word,
        corrected: suggestion,
        application: 'Current Application' // This would be the actual app name in the real app
      });
      
      // For demonstration, we'd use an IPC call to apply the correction
      console.log(`Applied correction: ${currentCorrection.word} -> ${suggestion}`);
    }
    
    setCurrentCorrection(null);
  };
  
  const handleDismissCorrection = () => {
    setCurrentCorrection(null);
  };
  
  const handleApplyAutocomplete = (suggestion: string) => {
    // In a real desktop app, this would communicate with the text monitor
    // to apply the autocomplete suggestion in the current application
    if (isElectron) {
      // Log for statistics
      logCorrection({
        type: 'autocomplete',
        original: '', // The partial text would be here
        corrected: suggestion,
        application: 'Current Application' // This would be the actual app name in the real app
      });
      
      // For demonstration, we'd use an IPC call to apply the autocomplete
      console.log(`Applied autocomplete: ${suggestion}`);
    }
    
    setCurrentAutocomplete([]);
  };
  
  const handleDismissAutocomplete = () => {
    setCurrentAutocomplete([]);
  };
  
  // For demonstration purpose, let's add some mock corrections and autocompletes in web mode
  useEffect(() => {
    if (isElectron) return; // Skip in Electron mode
    
    // Demo corrections for web version
    const demoInterval = setInterval(() => {
      // Randomly decide to show a correction or autocomplete
      const showCorrection = Math.random() > 0.5;
      
      if (showCorrection && !currentCorrection) {
        const demoCorrections = [
          {
            word: 'teh',
            suggestions: ['the', 'then', 'ten'],
            type: 'spelling',
            context: 'I want teh book'
          },
          {
            word: 'there',
            suggestions: ['their', 'they\'re', 'there'],
            type: 'grammar',
            context: 'I need there help'
          }
        ];
        
        setCurrentCorrection(demoCorrections[Math.floor(Math.random() * demoCorrections.length)]);
      } else if (!showCorrection && currentAutocomplete.length === 0) {
        const demoAutocompletes = [
          ['Thank you for your consideration.', 'Thank you for your time.'],
          ['I hope this email finds you well.', 'I hope this email finds you in good health.'],
          ['Please let me know if you have any questions.', 'Please let me know your thoughts.']
        ];
        
        setCurrentAutocomplete(demoAutocompletes[Math.floor(Math.random() * demoAutocompletes.length)]);
      }
    }, 15000); // Show a demo every 15 seconds
    
    return () => clearInterval(demoInterval);
  }, [isElectron, currentCorrection, currentAutocomplete]);
  
  return (
    <>
      {currentCorrection && (
        <TextNotification
          type="correction"
          text={currentCorrection.word}
          suggestions={currentCorrection.suggestions}
          onApply={handleApplyCorrection}
          onDismiss={handleDismissCorrection}
        />
      )}
      
      {currentAutocomplete.length > 0 && (
        <TextNotification
          type="autocomplete"
          text=""
          suggestions={currentAutocomplete}
          onApply={handleApplyAutocomplete}
          onDismiss={handleDismissAutocomplete}
          position={{ x: 100, y: 100 }} // Position this differently than corrections
        />
      )}
    </>
  );
}