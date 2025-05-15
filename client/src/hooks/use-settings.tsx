import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface Settings {
  // Opciones generales
  startOnBoot: boolean;
  showInTray: boolean;
  autoUpdates: boolean;
  
  // Opciones de corrección
  spellingCheck: boolean;
  grammarCheck: boolean;
  styleCheck: boolean;
  autocomplete: boolean;
  
  // Preferencias de estilo
  language: string;
  writingStyle: 'formal' | 'informal' | 'technical' | 'creative' | 'standard';
  correctionSensitivity: 'high' | 'medium' | 'low';
  
  // Privacidad
  usageData: boolean;
  storeHistory: boolean;
  workOffline: boolean;
  
  // Interfaz
  notificationStyle: 'popup' | 'inline' | 'minimal';
  zenMode: boolean;
}

export function useSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Fetch settings from the API
  const { data: settings = defaultSettings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    staleTime: 60000, // 1 minute
  });
  
  // Mutation to update settings
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await apiRequest('PATCH', '/api/settings', {
        [key]: value,
      });
      return response.json();
    },
    onMutate: ({ key, value }) => {
      setLoading(true);
      
      // Optimistically update the settings
      queryClient.setQueryData(['/api/settings'], (old: Settings) => ({
        ...old,
        [key]: value,
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Settings updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
      
      // Invalidate to get the correct data
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
  
  const updateSetting = (key: string, value: any) => {
    updateSettingMutation.mutate({ key, value });
  };
  
  return {
    settings,
    updateSetting,
    isLoading: isLoading || loading,
  };
}

// Default settings when data is loading or not available
const defaultSettings: Settings = {
  // Opciones generales
  startOnBoot: true,
  showInTray: true,
  autoUpdates: true,
  
  // Opciones de corrección
  spellingCheck: true,
  grammarCheck: true,
  styleCheck: false,
  autocomplete: true,
  
  // Preferencias de estilo
  language: 'es',
  writingStyle: 'standard',
  correctionSensitivity: 'medium',
  
  // Privacidad
  usageData: false,
  storeHistory: true,
  workOffline: false,
  
  // Interfaz
  notificationStyle: 'popup',
  zenMode: false
};
