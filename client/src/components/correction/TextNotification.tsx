import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TextNotificationProps {
  type: 'correction' | 'autocomplete';
  text: string;
  suggestions: string[];
  position?: {
    x: number;
    y: number;
  };
  onApply: (suggestion: string) => void;
  onDismiss: () => void;
}

export default function TextNotification({
  type,
  text,
  suggestions,
  position,
  onApply,
  onDismiss
}: TextNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in after mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-dismiss after some time for autocomplete suggestions only
  useEffect(() => {
    if (type === 'autocomplete') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [type]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Allow time for animation
  };
  
  const handleApply = (suggestion: string) => {
    setIsVisible(false);
    setTimeout(() => onApply(suggestion), 300); // Allow time for animation
  };
  
  // Default position at bottom-right corner if not provided
  const defaultPosition = {
    x: window.innerWidth - 320,
    y: window.innerHeight - 200
  };
  
  const positionStyle = {
    left: `${(position || defaultPosition).x}px`,
    top: `${(position || defaultPosition).y}px`
  };
  
  return (
    <div 
      className={`fixed transition-all duration-300 ease-in-out z-50 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-4'}`}
      style={positionStyle}
    >
      <Card className="w-64 overflow-hidden shadow-lg border-2 border-primary/20">
        <div className="bg-secondary p-2 flex justify-between items-center">
          <div className="text-sm font-medium">
            {type === 'correction' ? 'Suggested Correction' : 'Autocomplete'}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-3 space-y-3">
          {type === 'correction' && (
            <div className="text-xs text-muted-foreground">
              Did you mean to type:
            </div>
          )}
          
          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant={i === 0 ? "default" : "outline"}
                size="sm"
                className="w-full justify-start overflow-hidden text-ellipsis"
                onClick={() => handleApply(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}