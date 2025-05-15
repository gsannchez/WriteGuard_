import { Link, useLocation } from "wouter";
import { BarChart3, FileText, Home, Settings } from "lucide-react";
import { PenLine } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const navItems = [
    { href: "/", icon: <Home className="mr-3 h-4 w-4" />, label: "Dashboard" },
    { href: "/settings", icon: <Settings className="mr-3 h-4 w-4" />, label: "Settings" },
    { href: "/statistics", icon: <BarChart3 className="mr-3 h-4 w-4" />, label: "Statistics" },
    { href: "/demo", icon: <FileText className="mr-3 h-4 w-4" />, label: "Demo" },
  ];
  
  return (
    <div className="w-full sm:w-64 bg-gray-50 dark:bg-gray-900 p-4 flex flex-col border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
          <PenLine className="h-5 w-5" />
        </div>
        <h1 className="ml-3 font-semibold text-lg">Smart Writer</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "w-full flex items-center py-2 px-3 rounded-md",
                  location === item.href 
                    ? "bg-primary/10 text-primary dark:bg-primary/20" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="text-sm text-gray-500 dark:text-gray-400">Dark Mode</Label>
          <Switch
            id="dark-mode"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </div>
    </div>
  );
}
