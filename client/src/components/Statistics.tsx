import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStatistics } from "@/hooks/use-statistics";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

export default function Statistics() {
  const { 
    statistics, 
    overview, 
    weeklyActivity, 
    topApplications, 
    recentCorrections 
  } = useStatistics() as any; // Using any as a temporary fix for type issues
  
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Prepare data for the correction types chart
  const correctionTypeData = statistics?.correctionsByType ? [
    { name: 'Spelling', value: statistics.correctionsByType.spelling },
    { name: 'Grammar', value: statistics.correctionsByType.grammar },
    { name: 'Style', value: statistics.correctionsByType.style },
    { name: 'Autocomplete', value: statistics.correctionsByType.autocomplete },
  ] : [];

  // Prepare data for the common errors chart
  const commonErrorsData = statistics?.commonErrors ? 
    statistics.commonErrors.map(error => ({
      name: error.word,
      value: error.count
    })) : [];

  // Colors for the pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];
  
  const motivationalTips = [
    "Consistent writing leads to better skills! You've been improving steadily.",
    "Your grammar corrections are down 3% – that's progress!",
    "Try free writing for 10 minutes daily to boost your creativity.",
    "You're most productive on Wednesdays. Plan important writing tasks then!"
  ];

  // Randomly select a motivational tip
  const randomTip = motivationalTips[Math.floor(Math.random() * motivationalTips.length)];
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-2">Usage Statistics</h2>
      <p className="text-muted-foreground mb-6">Track your writing improvements and patterns</p>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="corrections">Corrections</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(overview).map(([key, data]) => (
              <Card key={key} className="overflow-hidden">
                <CardContent className="pt-5">
                  <h3 className="text-sm text-muted-foreground mb-1">{data.label}</h3>
                  <div className="text-3xl font-semibold">{data.value}</div>
                  <div className={`text-xs ${data.change > 0 ? 'text-green-500' : 'text-red-500'} mt-2`}>
                    {data.change > 0 ? '↑' : '↓'} {Math.abs(data.change)}% vs last week
                  </div>
                </CardContent>
                <div 
                  className={`h-1 w-full ${data.change > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
              </Card>
            ))}
          </div>
          
          {/* Motivational tip */}
          <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-none">
            <CardContent className="pt-5 flex items-center">
              <div className="text-lg mr-4">💡</div>
              <p className="text-sm italic">{randomTip}</p>
            </CardContent>
          </Card>
          
          {/* Recent Corrections */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Recent Corrections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCorrections.slice(0, 3).map((correction) => (
                  <div key={correction.id} className="flex items-start space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center 
                      ${correction.type === 'spelling' ? 'bg-blue-100 text-blue-600' : 
                        correction.type === 'grammar' ? 'bg-green-100 text-green-600' :
                        correction.type === 'style' ? 'bg-purple-100 text-purple-600' :
                        'bg-amber-100 text-amber-600'} dark:bg-opacity-20`}>
                      {correction.type === 'spelling' ? 'Sp' : 
                        correction.type === 'grammar' ? 'Gr' :
                        correction.type === 'style' ? 'St' : 'Ac'}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{correction.title}</h4>
                      <p className="text-xs text-muted-foreground">{correction.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{correction.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="corrections" className="space-y-6">
          {/* Correction Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Correction Types</CardTitle>
                <CardDescription>Distribution of corrections by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={correctionTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {correctionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} corrections`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Common Errors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Common Errors</CardTitle>
                <CardDescription>Your most frequent correction needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={commonErrorsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={90} />
                      <Tooltip formatter={(value) => [`${value} occurrences`, 'Count']} />
                      <Bar dataKey="value" fill="#8884d8">
                        {commonErrorsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Writing Improvement Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Writing Improvement Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Common confusion: "their" vs "there" vs "they're"</h4>
                  <p className="text-xs text-muted-foreground">
                    • Their: possessive (Their house is big)<br />
                    • There: location (The book is over there)<br />
                    • They're: contraction of "they are" (They're coming to the party)
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Tip: Use active voice for clearer writing</h4>
                  <p className="text-xs text-muted-foreground">
                    Passive: "The report was written by me"<br />
                    Active: "I wrote the report"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-6">
          {/* Top Applications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Applications Usage</CardTitle>
              <CardDescription>Where you use the writing assistant most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topApplications}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {topApplications.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Applications Detail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Applications Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topApplications.map((app) => (
                <div key={app.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{app.name}</span>
                    <span className="text-xs text-muted-foreground">{app.percentage}%</span>
                  </div>
                  <Progress value={app.percentage} className="h-2" 
                    style={{
                      background: `${COLORS[topApplications.indexOf(app) % COLORS.length]}`,
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Weekly Activity</CardTitle>
              <CardDescription>Your writing assistant usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyActivity.map((value, index) => ({ name: days[index], value }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} actions`, 'Count']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {weeklyActivity.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 2 ? '#00C49F' : '#8884d8'} // Highlight Wednesday (highest activity)
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Daily Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Daily Activity Trend</CardTitle>
              <CardDescription>Pattern of your writing activity (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyActivity.map((value, index) => ({ name: days[index], value }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} actions`, 'Count']} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
