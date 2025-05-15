import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSettings, type Settings as SettingsType } from "@/hooks/use-settings";
import { useExcludedApps } from "@/hooks/use-excluded-apps";
import ExcludedApps from "./ExcludedApps";

export default function Settings() {
  const { settings, updateSetting } = useSettings();
  const { excludedApps, addExcludedApp, removeExcludedApp } = useExcludedApps();
  
  const toggleFeature = (key: string, value: boolean) => {
    updateSetting(key, value);
  };
  
  const updateSelectOption = (key: string, value: any) => {
    updateSetting(key, value);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="writing">Writing</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">System Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingItem
                title="Start on system boot"
                description="Launch application when your computer starts"
                checked={settings.startOnBoot}
                onChange={(checked) => toggleFeature('startOnBoot', checked)}
                id="startOnBoot"
              />
              
              <SettingItem
                title="Show in system tray"
                description="Keep the app accessible from your system tray"
                checked={settings.showInTray}
                onChange={(checked) => toggleFeature('showInTray', checked)}
                id="showInTray"
              />
              
              <SettingItem
                title="Check for updates automatically"
                description="Periodically check for new versions"
                checked={settings.autoUpdates}
                onChange={(checked) => toggleFeature('autoUpdates', checked)}
                id="autoUpdates"
              />

              <SettingItem
                title="Zen Mode"
                description="Minimalistic interface with fewer distractions"
                checked={settings.zenMode}
                onChange={(checked) => toggleFeature('zenMode', checked)}
                id="zenMode"
              />
            </CardContent>
          </Card>
          
          {/* Application Exclusions */}
          <ExcludedApps 
            excludedApps={excludedApps}
            onAddApp={addExcludedApp}
            onRemoveApp={removeExcludedApp}
          />
        </TabsContent>
        
        <TabsContent value="writing" className="space-y-6">
          {/* Basic Writing Assistant Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Correction Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingItem
                title="Spelling check"
                description="Detect and correct spelling mistakes"
                checked={settings.spellingCheck}
                onChange={(checked) => toggleFeature('spellingCheck', checked)}
                id="spellingCheck"
              />
              
              <SettingItem
                title="Grammar check"
                description="Detect and suggest grammar improvements"
                checked={settings.grammarCheck}
                onChange={(checked) => toggleFeature('grammarCheck', checked)}
                id="grammarCheck"
              />
              
              <SettingItem
                title="Style check"
                description="Suggest improvements for clarity and readability"
                checked={settings.styleCheck}
                onChange={(checked) => toggleFeature('styleCheck', checked)}
                id="styleCheck"
              />
              
              <SettingItem
                title="Autocomplete suggestions"
                description="Suggest completions for sentences as you type"
                checked={settings.autocomplete}
                onChange={(checked) => toggleFeature('autocomplete', checked)}
                id="autocomplete"
              />
            </CardContent>
          </Card>
          
          {/* Language and Style Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Language & Style Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-2 mb-4">
                <Label htmlFor="language" className="font-medium">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSelectOption('language', value)}
                >
                  <SelectTrigger id="language" className="w-full mt-2">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2 mb-4">
                <Label htmlFor="writingStyle" className="font-medium">Writing Style</Label>
                <Select
                  value={settings.writingStyle}
                  onValueChange={(value) => updateSelectOption('writingStyle', value)}
                >
                  <SelectTrigger id="writingStyle" className="w-full mt-2">
                    <SelectValue placeholder="Select writing style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  This affects the style of suggestions and corrections
                </p>
              </div>
              
              <div className="pt-2">
                <Label htmlFor="correctionSensitivity" className="font-medium">Correction Sensitivity</Label>
                <Select
                  value={settings.correctionSensitivity}
                  onValueChange={(value) => updateSelectOption('correctionSensitivity', value)}
                >
                  <SelectTrigger id="correctionSensitivity" className="w-full mt-2">
                    <SelectValue placeholder="Select sensitivity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (More corrections)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="low">Low (Fewer corrections)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher sensitivity means more suggestions but may include false positives
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          {/* Advanced Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Interface Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-2 mb-4">
                <Label htmlFor="notificationStyle" className="font-medium">Notification Style</Label>
                <Select
                  value={settings.notificationStyle}
                  onValueChange={(value) => updateSelectOption('notificationStyle', value)}
                >
                  <SelectTrigger id="notificationStyle" className="w-full mt-2">
                    <SelectValue placeholder="Select notification style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popup">Popup (Standard notifications)</SelectItem>
                    <SelectItem value="inline">Inline (Text underlines with hover)</SelectItem>
                    <SelectItem value="minimal">Minimal (Subtle indicators only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Custom Dictionary would go here in future implementation */}
              <div className="border rounded-md p-4 border-dashed border-gray-300 dark:border-gray-600">
                <h3 className="text-sm font-medium mb-2">Custom Dictionary</h3>
                <p className="text-xs text-muted-foreground">
                  Add custom words to your personal dictionary. Coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Performance Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingItem
                title="Work in offline mode"
                description="Use only local processing, no external API calls"
                checked={settings.workOffline}
                onChange={(checked) => toggleFeature('workOffline', checked)}
                id="workOffline"
              />
              
              <div className="border rounded-md p-4 border-dashed border-gray-300 dark:border-gray-600">
                <h3 className="text-sm font-medium mb-2">Model Selection</h3>
                <p className="text-xs text-muted-foreground">
                  Choose which AI models to use for different tasks. Coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Privacy & Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingItem
                title="Send anonymous usage data"
                description="Help us improve the app with anonymous statistics"
                checked={settings.usageData}
                onChange={(checked) => toggleFeature('usageData', checked)}
                id="usageData"
              />
              
              <SettingItem
                title="Store correction history"
                description="Keep a record of corrections made"
                checked={settings.storeHistory}
                onChange={(checked) => toggleFeature('storeHistory', checked)}
                id="storeHistory"
              />
              
              <div className="border rounded-md p-4 border-dashed border-gray-300 dark:border-gray-600">
                <h3 className="text-sm font-medium mb-2">Data Management</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Manage your stored data and correction history.
                </p>
                <button 
                  className="text-xs text-red-500 hover:text-red-600" 
                  onClick={() => alert('This feature is not yet implemented')}
                >
                  Clear All Data
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SettingItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

function SettingItem({ title, description, checked, onChange, id }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={id} className="font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch 
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}
