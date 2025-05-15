import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExcludedAppsProps {
  excludedApps: string[];
  onAddApp: (appName: string) => void;
  onRemoveApp: (appName: string) => void;
}

export default function ExcludedApps({ excludedApps, onAddApp, onRemoveApp }: ExcludedAppsProps) {
  const [newApp, setNewApp] = useState('');
  
  const handleAddApp = () => {
    if (newApp.trim() && !excludedApps.includes(newApp.trim())) {
      onAddApp(newApp.trim());
      setNewApp('');
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Excluded Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Add applications where Smart Writer should not monitor text or provide suggestions
        </p>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Application name"
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddApp()}
          />
          <Button onClick={handleAddApp} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {excludedApps.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No applications excluded. Smart Writer will work in all applications.
            </p>
          ) : (
            excludedApps.map((app) => (
              <Badge key={app} variant="secondary" className="group">
                {app}
                <button 
                  className="ml-1 opacity-50 group-hover:opacity-100"
                  onClick={() => onRemoveApp(app)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}