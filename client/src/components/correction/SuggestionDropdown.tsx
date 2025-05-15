import React from "react";

interface SuggestionDropdownProps {
  suggestions: string[];
  position: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  onSelect: (suggestion: string) => void;
  onDismiss: () => void;
}

export default function SuggestionDropdown({ 
  suggestions, 
  position, 
  onSelect, 
  onDismiss 
}: SuggestionDropdownProps) {
  return (
    <div 
      className="absolute flex-col bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-10"
      style={{
        left: position.left,
        right: position.right,
        top: position.top,
        bottom: position.bottom,
      }}
    >
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Did you mean:
      </div>
      <div className="max-h-40 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button 
            key={index}
            onClick={() => onSelect(suggestion)}
            className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${index === 0 ? 'font-medium' : ''}`}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={onDismiss}
          className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
