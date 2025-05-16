import { 
  type Settings, 
  type InsertSettings,
  type Correction, 
  type InsertCorrection,
  type Statistics,
  type InsertStatistics,
  type User,
  type InsertUser,
  type RecentCorrection,
  type StatisticsOverview,
  type TopApplication
} from "@shared/schema";

// Extend the storage interface with the additional methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Settings methods
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Correction methods
  saveCorrection(correction: InsertCorrection): Promise<Correction>;
  getRecentCorrections(limit: number): Promise<RecentCorrection[]>;
  
  // Statistics methods
  getStatistics(): Promise<any>;
  updateStatistics(data: Partial<InsertStatistics>): Promise<Statistics>;
  getStatisticsOverview(): Promise<StatisticsOverview>;
  getWeeklyActivity(): Promise<number[]>;
  getTopApplications(): Promise<TopApplication[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private settings: Map<number, Settings>;
  private corrections: Correction[];
  private statistics: Map<number, Statistics>;
  private userId: number;
  
  constructor() {
    this.users = new Map();
    this.settings = new Map();
    this.corrections = [];
    this.statistics = new Map();
    this.userId = 1; // Default user ID
    
    // Initialize with default settings
    this.settings.set(this.userId, {
      id: 1,
      userId: this.userId,
      // System options
      startOnBoot: true,
      showInTray: true,
      autoUpdates: true,
      // Correction options
      spellingCheck: true,
      grammarCheck: true,
      styleCheck: false,
      autocomplete: true,
      // Style preferences
      language: "en-US",
      writingStyle: "standard",
      correctionSensitivity: "medium",
      // Privacy options
      usageData: true,
      storeHistory: true,
      workOffline: false,
      // UI preferences
      notificationStyle: "popup",
      zenMode: false,
      // System
      globalShortcut: "Control+Shift+Space",
      updatedAt: new Date()
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Settings methods
  async getSettings(): Promise<Settings> {
    return (
      this.settings.get(this.userId) || {
        id: 1,
        userId: this.userId,
        // System options
        startOnBoot: true,
        showInTray: true,
        autoUpdates: true,
        // Correction options
        spellingCheck: true,
        grammarCheck: true,
        styleCheck: false,
        autocomplete: true,
        // Style preferences
        language: "en-US",
        writingStyle: "standard",
        correctionSensitivity: "medium",
        // Privacy options
        usageData: true,
        storeHistory: true,
        workOffline: false,
        // UI preferences
        notificationStyle: "popup",
        zenMode: false,
        // System
        globalShortcut: "Control+Shift+Space",
        updatedAt: new Date(),
      }
    );
  }
  
  async updateSettings(updateData: Partial<InsertSettings>): Promise<Settings> {
    const currentSettings = await this.getSettings();
    const updatedSettings = {
      ...currentSettings,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.settings.set(this.userId, updatedSettings);
    return updatedSettings;
  }
  
  // Correction methods
  async saveCorrection(correction: InsertCorrection): Promise<Correction> {
    const newCorrection: Correction = {
      id: this.corrections.length + 1,
      createdAt: new Date(),
      ...correction,
    };
    
    this.corrections.push(newCorrection);
    return newCorrection;
  }
  
  async getRecentCorrections(limit: number): Promise<RecentCorrection[]> {
    // For now, return mock data that matches the UI design
    return [
      {
        id: 1,
        type: "spelling",
        title: "Spelling correction",
        description: 'Changed "teh" to "the" in Google Chrome',
        time: "10 minutes ago",
      },
      {
        id: 2,
        type: "grammar",
        title: "Grammar suggestion",
        description: 'Changed "they was" to "they were" in Microsoft Word',
        time: "25 minutes ago",
      },
      {
        id: 3,
        type: "autocomplete",
        title: "Autocomplete suggestion",
        description: 'Completed "Thank you for your cons..." in Gmail',
        time: "42 minutes ago",
      },
    ];
  }
  
  // Statistics methods
  async getStatistics(): Promise<any> {
    // Return mock statistics data that matches the UI design
    return {
      memoryUsage: 48,
      memoryUsagePercent: 15,
      cpuUsage: 2,
      today: {
        Corrections: 37,
        Suggestions: 82,
        "Words Analyzed": 4286,
        "Time Saved": "12 min",
      },
    };
  }
  
  async updateStatistics(data: Partial<InsertStatistics>): Promise<Statistics> {
    const currentStats = this.statistics.get(this.userId);
    
    const updatedStats: Statistics = {
      id: 1,
      userId: this.userId,
      date: new Date(),
      wordsProcessed: 0,
      correctionsApplied: 0,
      suggestionsMade: 0,
      timeSaved: 0,
      applicationUsage: {},
      ...currentStats,
      ...data,
    };
    
    this.statistics.set(this.userId, updatedStats);
    return updatedStats;
  }
  
  async getStatisticsOverview(): Promise<StatisticsOverview> {
    // Return mock overview data that matches the UI design
    return {
      wordsProcessed: {
        label: "Total Words Processed",
        value: "142,853",
        change: 12,
      },
      spellingCorrections: {
        label: "Spelling Corrections",
        value: "1,247",
        change: -3,
      },
      timeSaved: {
        label: "Estimated Time Saved",
        value: "3.8 hrs",
        change: 8,
      },
    };
  }
  
  async getWeeklyActivity(): Promise<number[]> {
    // Return mock weekly activity data that matches the UI design
    return [40, 65, 90, 75, 60, 25, 10];
  }
  
  async getTopApplications(): Promise<TopApplication[]> {
    // Return mock top applications data that matches the UI design
    return [
      { name: "Google Chrome", percentage: 45 },
      { name: "Microsoft Word", percentage: 30 },
      { name: "Gmail", percentage: 15 },
      { name: "Slack", percentage: 10 },
    ];
  }
}

export const storage = new MemStorage();
