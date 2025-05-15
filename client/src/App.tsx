import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/components/Dashboard";
import Settings from "@/components/Settings";
import Statistics from "@/components/Statistics";
import Demo from "@/components/Demo";
import SystemTray from "@/components/SystemTray";
import NotificationManager from "@/components/correction/NotificationManager";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/demo" component={Demo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AppLayout>
        <Router />
      </AppLayout>
      <SystemTray />
      
      {/* Notification system for text corrections and suggestions */}
      <NotificationManager />
    </TooltipProvider>
  );
}

export default App;
