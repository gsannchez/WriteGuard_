import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeText } from "./services/textProcessor";
import { getAutocompleteSuggestions } from "./services/openai";
import { z } from "zod";
import { settingsSchema, correctionSchema, statisticsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Text analysis endpoint
  app.post("/api/analyze-text", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const result = await analyzeText(text);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing text:", error);
      res.status(500).json({ message: "Failed to analyze text" });
    }
  });
  
  // Autocomplete suggestions endpoint
  app.post("/api/autocomplete", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const suggestions = await getAutocompleteSuggestions(text);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting autocomplete suggestions:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });
  
  // Log a correction for statistics
  app.post("/api/log-correction", async (req: Request, res: Response) => {
    try {
      const correction = correctionSchema.parse(req.body);
      await storage.saveCorrection(correction);
      res.json({ success: true });
    } catch (error) {
      console.error("Error logging correction:", error);
      res.status(500).json({ message: "Failed to log correction" });
    }
  });
  
  // Get current statistics
  app.get("/api/statistics", async (req: Request, res: Response) => {
    try {
      const statistics = await storage.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Get recent corrections
  app.get("/api/corrections/recent", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const corrections = await storage.getRecentCorrections(limit);
      res.json(corrections);
    } catch (error) {
      console.error("Error fetching recent corrections:", error);
      res.status(500).json({ message: "Failed to fetch recent corrections" });
    }
  });
  
  // Get statistics overview
  app.get("/api/statistics/overview", async (req: Request, res: Response) => {
    try {
      const overview = await storage.getStatisticsOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching statistics overview:", error);
      res.status(500).json({ message: "Failed to fetch statistics overview" });
    }
  });
  
  // Get weekly activity
  app.get("/api/statistics/weekly", async (req: Request, res: Response) => {
    try {
      const weeklyActivity = await storage.getWeeklyActivity();
      res.json(weeklyActivity);
    } catch (error) {
      console.error("Error fetching weekly activity:", error);
      res.status(500).json({ message: "Failed to fetch weekly activity" });
    }
  });
  
  // Get top applications
  app.get("/api/statistics/applications", async (req: Request, res: Response) => {
    try {
      const applications = await storage.getTopApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching top applications:", error);
      res.status(500).json({ message: "Failed to fetch top applications" });
    }
  });
  
  // Get user settings
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // Update user settings
  app.patch("/api/settings", async (req: Request, res: Response) => {
    try {
      const updateData = req.body;
      
      // Validate that all properties in the update exist in the schema
      Object.keys(updateData).forEach(key => {
        if (!(key in settingsSchema.shape)) {
          throw new Error(`Invalid setting: ${key}`);
        }
      });
      
      const updatedSettings = await storage.updateSettings(updateData);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
