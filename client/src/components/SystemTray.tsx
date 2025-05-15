import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PenLine } from "lucide-react";

export default function SystemTray() {
  const [isVisible, setIsVisible] = useState(true);
  const [, setLocation] = useLocation();
  
  // Monitor for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const openApp = () => {
    setIsVisible(true);
    setLocation('/');
  };
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center shadow-lg rounded-full bg-white dark:bg-gray-800 p-1">
        <Button onClick={openApp} size="icon" className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90">
          <PenLine className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex items-center px-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
          Smart Writing Assistant <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">Active</span>
        </div>
      </div>
    );
  }
  
  return null;
}
