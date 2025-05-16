/**
 * Text Cache Service
 * 
 * This service implements a caching system for text processing to improve
 * performance by avoiding redundant analysis of identical or similar text.
 */

import { TextAnalysisResponse } from '../../client/src/lib/openai';

// Maximum size of the cache
const CACHE_SIZE = 100;

// Cache structure
interface CacheItem {
  text: string;
  result: TextAnalysisResponse;
  timestamp: number;
}

class TextCache {
  private cache: Map<string, CacheItem>;
  
  constructor() {
    this.cache = new Map<string, CacheItem>();
  }
  
  /**
   * Generate a hash key for the cache based on text content
   * For privacy, we only use a hash of the text rather than storing the text directly
   */
  private generateKey(text: string): string {
    // Simple hashing function - in a production app, use a proper hashing algorithm
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
  
  /**
   * Store a result in the cache
   */
  public set(text: string, result: TextAnalysisResponse): void {
    // Don't cache extremely short text
    if (text.length < 5) return;
    
    const key = this.generateKey(text);
    
    // If cache is full, remove oldest entry
    if (this.cache.size >= CACHE_SIZE) {
      let oldestKey: string | null = null;
      let oldestTime = Date.now();
      
      this.cache.forEach((item, itemKey) => {
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          oldestKey = itemKey;
        }
      });
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    // Store the new value
    this.cache.set(key, {
      text,
      result,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get a result from the cache
   * Returns null if not found
   */
  public get(text: string): TextAnalysisResponse | null {
    // Don't use cache for extremely short text
    if (text.length < 5) return null;
    
    const key = this.generateKey(text);
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Verify text matches exactly (in case of hash collision)
    if (item.text === text) {
      // Update timestamp to indicate recent use
      item.timestamp = Date.now();
      return item.result;
    }
    
    return null;
  }
  
  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the current size of the cache
   */
  public size(): number {
    return this.cache.size;
  }
}

// Export a singleton instance
export const textCache = new TextCache();