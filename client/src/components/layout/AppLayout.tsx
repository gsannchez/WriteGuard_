import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { X } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-0 z-40 bg-black bg-opacity-50">
      <div className="relative w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh]">
        <Sidebar />
        
        <div className="absolute top-4 right-4 sm:hidden">
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
