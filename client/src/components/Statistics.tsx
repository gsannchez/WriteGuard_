import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStatistics } from "@/hooks/use-statistics";

export default function Statistics() {
  const { overview, weeklyActivity, topApplications } = useStatistics();
  
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Usage Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(overview).map(([key, data]) => (
          <Card key={key}>
            <CardContent className="pt-5">
              <h3 className="text-sm text-muted-foreground mb-1">{data.label}</h3>
              <div className="text-3xl font-semibold">{data.value}</div>
              <div className={`text-xs ${data.change > 0 ? 'text-green-500' : 'text-red-500'} mt-2`}>
                {data.change > 0 ? '↑' : '↓'} {Math.abs(data.change)}% vs last week
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Weekly Activity Chart */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between px-2">
            {weeklyActivity.map((value, index) => (
              <div key={index} className="w-1/7 flex flex-col items-center">
                <div 
                  className={`${
                    index === 4 
                      ? 'bg-primary dark:bg-primary-600' 
                      : (index > 4 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary-200 dark:bg-primary-800')
                  } w-12 rounded-t-sm`} 
                  style={{ height: `${value}%` }}
                ></div>
                <div className="text-xs mt-2 text-muted-foreground">{days[index]}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Top Applications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topApplications.map((app) => (
            <div key={app.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{app.name}</span>
                <span className="text-xs text-muted-foreground">{app.percentage}%</span>
              </div>
              <Progress value={app.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
