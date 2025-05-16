import { useState } from 'react';
import { useNavigate } from 'wouter';
import { motion } from 'framer-motion';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ChevronRight, Globe, Lock, Settings, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { settings, updateSetting, isLoading } = useSettings();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // Controla el progreso a través de los pasos
  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Finalizar onboarding y redirigir al dashboard
      navigate('/');
    }
  };
  
  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Animación para cambio de pasos
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            Bienvenido al Asistente de Escritura Inteligente
          </h1>
          <p className="text-muted-foreground mt-2">
            Configuremos tu experiencia en unos simples pasos
          </p>
        </div>
        
        {/* Pasos de progreso */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div 
                  className={`rounded-full h-10 w-10 flex items-center justify-center transition-colors 
                    ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {step > i ? <Check size={18} /> : i}
                </div>
                {i < 4 && (
                  <div 
                    className={`h-1 w-10 mx-2 transition-colors ${step > i ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Paso 1: Introducción */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">¿Qué puede hacer este asistente?</h2>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <FeatureCard 
                    icon={<Sparkles className="h-5 w-5 text-indigo-500" />}
                    title="Corrección ortográfica"
                    description="Detecta y corrige errores ortográficos automáticamente mientras escribes."
                  />
                  <FeatureCard 
                    icon={<Settings className="h-5 w-5 text-amber-500" />}
                    title="Gramática avanzada"
                    description="Mejora tu escritura con sugerencias gramaticales contextuales."
                  />
                  <FeatureCard 
                    icon={<Globe className="h-5 w-5 text-emerald-500" />}
                    title="Multilenguaje"
                    description="Compatible con español, inglés y otros idiomas."
                  />
                  <FeatureCard 
                    icon={<Lock className="h-5 w-5 text-rose-500" />}
                    title="Modo privado"
                    description="Trabaja sin conexión para mayor privacidad y seguridad."
                  />
                </div>
                
                <p className="text-muted-foreground text-sm mt-4">
                  El asistente funciona en segundo plano, detectando y mejorando tu texto mientras escribes en cualquier aplicación.
                </p>
              </motion.div>
            )}
            
            {/* Paso 2: Preferencias principales */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Settings className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Configura tus preferencias</h2>
                    <p className="text-muted-foreground">Personaliza cómo funciona el asistente</p>
                  </div>
                </div>
                
                <div className="grid gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Idioma principal</h3>
                    <div className="w-full max-w-xs">
                      <Select
                        value={settings.language}
                        onValueChange={(value) => updateSetting('language', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="auto">Autodetectar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Estilo de escritura</h3>
                    <div className="w-full max-w-xs">
                      <Select
                        value={settings.writingStyle}
                        onValueChange={(value) => updateSetting('writingStyle', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="informal">Informal</SelectItem>
                          <SelectItem value="technical">Técnico</SelectItem>
                          <SelectItem value="creative">Creativo</SelectItem>
                          <SelectItem value="standard">Estándar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tema visual</h3>
                    <div className="flex gap-4">
                      <button
                        className={`px-4 py-3 rounded-lg border ${theme === 'light' ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'}`}
                        onClick={() => setTheme('light')}
                      >
                        Claro
                      </button>
                      <button
                        className={`px-4 py-3 rounded-lg border ${theme === 'dark' ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'}`}
                        onClick={() => setTheme('dark')}
                      >
                        Oscuro
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Paso 3: Privacidad y rendimiento */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Privacidad y rendimiento</h2>
                    <p className="text-muted-foreground">Controla cómo se procesan tus datos</p>
                  </div>
                </div>
                
                <div className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="work-offline">Modo sin conexión</Label>
                      <p className="text-sm text-muted-foreground">
                        El texto nunca sale de tu dispositivo. Se usa procesamiento local.
                      </p>
                    </div>
                    <Switch
                      id="work-offline"
                      checked={settings.workOffline}
                      onCheckedChange={(checked) => updateSetting('workOffline', checked)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="store-history">Guardar historial de correcciones</Label>
                      <p className="text-sm text-muted-foreground">
                        Almacena un registro de tus correcciones para análisis y mejoras.
                      </p>
                    </div>
                    <Switch
                      id="store-history"
                      checked={settings.storeHistory}
                      onCheckedChange={(checked) => updateSetting('storeHistory', checked)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="usage-data">Enviar datos anónimos de uso</Label>
                      <p className="text-sm text-muted-foreground">
                        Ayuda a mejorar el asistente con estadísticas anónimas.
                      </p>
                    </div>
                    <Switch
                      id="usage-data"
                      checked={settings.usageData}
                      onCheckedChange={(checked) => updateSetting('usageData', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="text-sm">
                    <strong>Nota:</strong> Tus datos siempre te pertenecen. Puedes exportar o eliminar
                    todos tus datos en cualquier momento desde la configuración.
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Paso 4: Inicio y acceso */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">¡Casi listo!</h2>
                    <p className="text-muted-foreground">Configura cómo acceder al asistente</p>
                  </div>
                </div>
                
                <div className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="start-on-boot">Iniciar con Windows</Label>
                      <p className="text-sm text-muted-foreground">
                        El asistente se ejecutará automáticamente al encender tu equipo.
                      </p>
                    </div>
                    <Switch
                      id="start-on-boot"
                      checked={settings.startOnBoot}
                      onCheckedChange={(checked) => updateSetting('startOnBoot', checked)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-in-tray">Mostrar en bandeja del sistema</Label>
                      <p className="text-sm text-muted-foreground">
                        Mantén el asistente accesible desde el área de notificaciones.
                      </p>
                    </div>
                    <Switch
                      id="show-in-tray"
                      checked={settings.showInTray}
                      onCheckedChange={(checked) => updateSetting('showInTray', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-2">Atajo global</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Usa <code className="bg-muted px-1 py-0.5 rounded">Control + Shift + Space</code> para abrir el asistente desde cualquier aplicación.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Puedes personalizar este atajo en la configuración más adelante.
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Botones de navegación */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={step === 1}
              >
                Atrás
              </Button>
              
              <Button onClick={nextStep}>
                {step < 4 ? (
                  <>
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Comenzar a usar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Componente para tarjetas de características
function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="bg-muted/40 rounded-lg p-4 flex gap-4 hover:bg-muted/60 transition-colors">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}