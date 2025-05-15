import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertCircle, 
  Chrome, 
  Code, 
  FileWarning, 
  Lightbulb, 
  Mail, 
  MessageSquare, 
  Computer, 
  X
} from "lucide-react";

// Import components for the demo
import SuggestionDropdown from "./correction/SuggestionDropdown";

export default function Demo() {
  const [showSpellingSuggestion, setShowSpellingSuggestion] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [spellCorrected, setSpellCorrected] = useState(false);
  const [autocompleteApplied, setAutocompleteApplied] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  
  const handleApplySuggestion = () => {
    setSpellCorrected(true);
    setShowSpellingSuggestion(false);
    
    // Show notification
    setNotificationVisible(true);
    setTimeout(() => {
      setNotificationVisible(false);
    }, 2000);
  };
  
  const handleApplyAutocomplete = () => {
    setAutocompleteApplied(true);
    setShowAutocomplete(false);
  };
  
  const resetDemo = () => {
    setSpellCorrected(false);
    setAutocompleteApplied(false);
    setShowSpellingSuggestion(false);
    setShowAutocomplete(false);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Feature Demonstration</h2>
      
      {/* Success notification */}
      <div 
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 transition-transform duration-300 ease-in-out bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center ${
          notificationVisible ? 'translate-y-0' : 'translate-y-16'
        }`}
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        <span>Correction applied successfully</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Spelling correction demo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Spelling Correction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              As you type, Smart Writer identifies spelling errors and suggests corrections. Try clicking the highlighted word to see the suggestions.
            </p>
            
            <div className="relative bg-muted p-4 rounded-lg border border-border mb-4">
              <p className="focus:outline-none">
                Smart Writer helps you catch mistakes while you type. For example,{' '}
                <span 
                  className={`relative inline-block ${spellCorrected ? '' : 'border-b-2 border-red-500'} cursor-pointer`}
                  onClick={() => setShowSpellingSuggestion(true)}
                >
                  {spellCorrected ? 'the' : 'teh'}
                </span>
                {' '}quick brown fox jumps over the lazy dog.
              </p>
              
              {showSpellingSuggestion && (
                <SuggestionDropdown 
                  suggestions={['the', 'then', 'ten']} 
                  position={{ left: '290px', top: '50px' }}
                  onSelect={handleApplySuggestion}
                  onDismiss={() => setShowSpellingSuggestion(false)}
                />
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {spellCorrected 
                  ? "Correction applied! Click Reset to try again." 
                  : "Try clicking on the underlined word \"teh\""}
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetDemo}
                >
                  Reset
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowSpellingSuggestion(true)}
                  disabled={spellCorrected}
                >
                  Show suggestion
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Autocomplete demo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Smart Autocomplete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Smart Writer suggests appropriate completions based on what you're typing. Click in the field and type to see suggestions appear.
            </p>
            
            <div className="relative bg-muted p-4 rounded-lg border border-border mb-4">
              <Input
                className="w-full bg-transparent border-none focus-visible:ring-0"
                placeholder="Click here and type 'Thank you for your con'"
                value={autocompleteApplied ? "Thank you for your consideration." : "Thank you for your con"}
                onFocus={() => !autocompleteApplied && setShowAutocomplete(true)}
              />
              
              {showAutocomplete && (
                <SuggestionDropdown 
                  suggestions={[
                    "Thank you for your consideration.",
                    "Thank you for your concern.",
                    "Thank you for your contribution."
                  ]} 
                  position={{ left: '0', right: '0', top: 'calc(100% - 8px)' }}
                  onSelect={handleApplyAutocomplete}
                  onDismiss={() => setShowAutocomplete(false)}
                />
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {autocompleteApplied 
                  ? "Autocomplete applied! Click Reset to try again." 
                  : "Click in the field to see autocomplete suggestions"}
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetDemo}
                >
                  Reset
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowAutocomplete(true)}
                  disabled={autocompleteApplied}
                >
                  Show suggestions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Applications compatibility */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Application Compatibility</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Smart Writer works across different applications on your system, providing consistent writing assistance everywhere.
            </p>
            
            <div className="space-y-3">
              <CompatibilityItem icon={<Chrome className="text-blue-500" />} name="Google Chrome" compatible={true} />
              <CompatibilityItem icon={<Computer className="text-blue-700" />} name="Computer Office" compatible={true} />
              <CompatibilityItem icon={<Mail className="text-red-500" />} name="Gmail, Outlook, Mail apps" compatible={true} />
              <CompatibilityItem icon={<MessageSquare className="text-purple-500" />} name="Slack, Discord, Teams" compatible={true} />
              <CompatibilityItem icon={<Code className="text-gray-600 dark:text-gray-400" />} name="VS Code, IDEs" compatible={false} limited={true} />
            </div>
          </CardContent>
        </Card>
        
        {/* How it works */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StepItem
                number={1}
                title="Text Monitoring"
                description="Smart Writer runs in the background listening for text input across applications"
              />
              <StepItem
                number={2}
                title="Real-time Analysis"
                description="The AI engine analyzes text for errors and improvement opportunities"
              />
              <StepItem
                number={3}
                title="Suggestions Overlay"
                description="Non-intrusive overlays appear with suggestions as you type"
              />
              <StepItem
                number={4}
                title="Learning Engine"
                description="The system learns from your writing style and preferences over time"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface CompatibilityItemProps {
  icon: React.ReactNode;
  name: string;
  compatible: boolean;
  limited?: boolean;
}

function CompatibilityItem({ icon, name, compatible, limited }: CompatibilityItemProps) {
  return (
    <div className="flex items-center">
      <div className="w-6 h-6 flex-shrink-0">
        {icon}
      </div>
      <div className="ml-3 text-sm">{name}</div>
      <div className="ml-auto">
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          compatible 
            ? (limited ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300')
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {compatible ? (limited ? 'Limited' : 'Compatible') : 'Not Compatible'}
        </span>
      </div>
    </div>
  );
}

interface StepItemProps {
  number: number;
  title: string;
  description: string;
}

function StepItem({ number, title, description }: StepItemProps) {
  return (
    <div className="flex">
      <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
        {number}
      </div>
      <div className="ml-3">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </div>
    </div>
  );
}
