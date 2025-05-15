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
  
  const updateLanguage = (value: string) => {
    updateSetting('language', value);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">General Settings</CardTitle>
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
          </CardContent>
        </Card>
        
        {/* Writing Assistant Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Writing Assistant</CardTitle>
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
              title="Autocomplete suggestions"
              description="Suggest completions for sentences as you type"
              checked={settings.autocomplete}
              onChange={(checked) => toggleFeature('autocomplete', checked)}
              id="autocomplete"
            />
            
            <div className="pt-2">
              <Label htmlFor="language" className="font-medium">Language</Label>
              <Select
                value={settings.language}
                onValueChange={updateLanguage}
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
          </CardContent>
        </Card>
        
        {/* Application Exclusions */}
        <ExcludedApps 
          excludedApps={excludedApps}
          onAddApp={addExcludedApp}
          onRemoveApp={removeExcludedApp}
        />
        
        {/* Privacy Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Privacy</CardTitle>
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
          </CardContent>
        </Card>
      </div>
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
