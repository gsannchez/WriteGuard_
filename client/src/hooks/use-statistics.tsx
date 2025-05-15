import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Statistics {
  memoryUsage: number;
  memoryUsagePercent: number;
  cpuUsage: number;
  today: {
    Corrections: number;
    Suggestions: number;
    'Words Analyzed': number;
    'Time Saved': string;
  };
}

export interface RecentCorrection {
  id: number;
  type: 'spelling' | 'grammar' | 'autocomplete';
  title: string;
  description: string;
  time: string;
}

export interface StatisticsOverview {
  [key: string]: {
    label: string;
    value: string;
    change: number;
  }
}

export interface TopApplication {
  name: string;
  percentage: number;
}

export function useStatistics() {
  // Get current statistics
  const { data: statistics = defaultStatistics } = useQuery({
    queryKey: ['/api/statistics'],
    staleTime: 30000, // Refresh every 30 seconds
  });
  
  // Get recent corrections
  const { data: recentCorrections = defaultRecentCorrections } = useQuery({
    queryKey: ['/api/corrections/recent'],
    staleTime: 30000,
  });
  
  // Get statistics overview for the statistics page
  const { data: overview = defaultOverview } = useQuery({
    queryKey: ['/api/statistics/overview'],
    staleTime: 60000,
  });
  
  // Get weekly activity data
  const { data: weeklyActivity = defaultWeeklyActivity } = useQuery({
    queryKey: ['/api/statistics/weekly'],
    staleTime: 60000,
  });
  
  // Get top applications data
  const { data: topApplications = defaultTopApplications } = useQuery({
    queryKey: ['/api/statistics/applications'],
    staleTime: 60000,
  });
  
  return {
    statistics,
    recentCorrections,
    overview,
    weeklyActivity,
    topApplications,
  };
}

// Default values for statistics when data is loading or not available
const defaultStatistics: Statistics = {
  memoryUsage: 48,
  memoryUsagePercent: 15,
  cpuUsage: 2,
  today: {
    Corrections: 37,
    Suggestions: 82,
    'Words Analyzed': 4286,
    'Time Saved': '12 min',
  },
};

const defaultRecentCorrections: RecentCorrection[] = [
  {
    id: 1,
    type: 'spelling',
    title: 'Spelling correction',
    description: 'Changed "teh" to "the" in Google Chrome',
    time: '10 minutes ago',
  },
  {
    id: 2,
    type: 'grammar',
    title: 'Grammar suggestion',
    description: 'Changed "they was" to "they were" in Microsoft Word',
    time: '25 minutes ago',
  },
  {
    id: 3,
    type: 'autocomplete',
    title: 'Autocomplete suggestion',
    description: 'Completed "Thank you for your cons..." in Gmail',
    time: '42 minutes ago',
  },
];

const defaultOverview: StatisticsOverview = {
  wordsProcessed: {
    label: 'Total Words Processed',
    value: '142,853',
    change: 12,
  },
  spellingCorrections: {
    label: 'Spelling Corrections',
    value: '1,247',
    change: -3,
  },
  timeSaved: {
    label: 'Estimated Time Saved',
    value: '3.8 hrs',
    change: 8,
  },
};

const defaultWeeklyActivity: number[] = [40, 65, 90, 75, 60, 25, 10];

const defaultTopApplications: TopApplication[] = [
  { name: 'Google Chrome', percentage: 45 },
  { name: 'Microsoft Word', percentage: 30 },
  { name: 'Gmail', percentage: 15 },
  { name: 'Slack', percentage: 10 },
];
