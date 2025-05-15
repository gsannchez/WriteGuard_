import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStatistics } from "@/hooks/use-statistics";
import { AlertCircle, FileWarning, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { statistics, recentCorrections } = useStatistics();
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Welcome to Smart Writer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">System Status</CardTitle>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Running
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                <span className="text-sm font-medium">{statistics.memoryUsage} MB</span>
              </div>
              <Progress value={statistics.memoryUsagePercent} className="h-2" />
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                <span className="text-sm font-medium">{statistics.cpuUsage}%</span>
              </div>
              <Progress value={statistics.cpuUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statistics.today).map(([key, value]) => (
                <div key={key} className="bg-muted p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">{key}</div>
                  <div className="text-xl font-semibold mt-1">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Corrections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
          <CardTitle className="text-base font-medium">Recent Corrections</CardTitle>
          <Button variant="link" size="sm" className="text-primary hover:text-primary/90">
            View All
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <div className="divide-y divide-border">
            {recentCorrections.map((correction, index) => {
              let Icon = AlertCircle;
              let iconClass = "text-red-600 dark:text-red-400";
              let bgClass = "bg-red-100 dark:bg-red-900/30";
              
              if (correction.type === "grammar") {
                Icon = FileWarning;
                iconClass = "text-yellow-600 dark:text-yellow-400";
                bgClass = "bg-yellow-100 dark:bg-yellow-900/30";
              } else if (correction.type === "autocomplete") {
                Icon = Lightbulb;
                iconClass = "text-blue-600 dark:text-blue-400";
                bgClass = "bg-blue-100 dark:bg-blue-900/30";
              }
              
              return (
                <div key={index} className="p-4 flex items-start">
                  <div className={`w-8 h-8 rounded-full ${bgClass} flex items-center justify-center ${iconClass} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium">{correction.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{correction.description}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{correction.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
