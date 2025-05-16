/**
 * Error Handler Service
 * 
 * Provides error management and recovery strategies for the application.
 * Helps maintain system robustness and graceful degradation when services fail.
 */

// Types of errors for tracking and recovery
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  DATABASE = 'database',
  DICTIONARY = 'dictionary',
  MEMORY = 'memory',
  UNKNOWN = 'unknown'
}

// Error tracking for service health monitoring
interface ErrorState {
  count: number;
  lastOccurred: Date;
  recoveryAttempts: number;
  isRecovering: boolean;
}

class ErrorHandler {
  private errorStates: Map<string, ErrorState>;
  private readonly MAX_ERRORS = 5;
  private readonly RECOVERY_INTERVAL = 60000; // 1 minute
  
  constructor() {
    this.errorStates = new Map<string, ErrorState>();
    
    // Initialize states for all error types
    Object.values(ErrorType).forEach(type => {
      this.errorStates.set(type, {
        count: 0,
        lastOccurred: new Date(0), // 1970-01-01
        recoveryAttempts: 0,
        isRecovering: false
      });
    });
  }
  
  /**
   * Record an error occurrence and determine if fallback strategy should be used
   * @param type Type of error
   * @param error The actual error object
   * @returns Whether the service should use a fallback strategy
   */
  public handleError(type: ErrorType, error: Error): boolean {
    console.error(`[ErrorHandler] ${type} error:`, error.message);
    
    const state = this.errorStates.get(type) || {
      count: 0,
      lastOccurred: new Date(0),
      recoveryAttempts: 0,
      isRecovering: false
    };
    
    // Update error state
    state.count++;
    state.lastOccurred = new Date();
    this.errorStates.set(type, state);
    
    // Determine if we should use fallback strategy
    return state.count >= this.MAX_ERRORS;
  }
  
  /**
   * Start recovery process for a service
   * @param type The service type to recover
   * @param recoveryFunc Function to attempt recovery
   */
  public async startRecovery(type: ErrorType, recoveryFunc: () => Promise<boolean>): Promise<void> {
    const state = this.errorStates.get(type);
    if (!state || state.isRecovering) return;
    
    state.isRecovering = true;
    this.errorStates.set(type, state);
    
    try {
      console.log(`[ErrorHandler] Attempting recovery for ${type} service...`);
      state.recoveryAttempts++;
      
      const success = await recoveryFunc();
      
      if (success) {
        console.log(`[ErrorHandler] Recovery successful for ${type} service`);
        // Reset error count on successful recovery
        state.count = 0;
      } else {
        console.log(`[ErrorHandler] Recovery failed for ${type} service`);
      }
    } catch (error) {
      console.error(`[ErrorHandler] Error during recovery:`, error);
    } finally {
      state.isRecovering = false;
      this.errorStates.set(type, state);
      
      // Schedule another recovery attempt if needed
      if (state.count >= this.MAX_ERRORS) {
        setTimeout(() => {
          this.startRecovery(type, recoveryFunc);
        }, this.RECOVERY_INTERVAL);
      }
    }
  }
  
  /**
   * Check if a service is in a failing state
   * @param type Service type to check
   * @returns Whether the service is currently failing
   */
  public isServiceFailing(type: ErrorType): boolean {
    const state = this.errorStates.get(type);
    if (!state) return false;
    
    return state.count >= this.MAX_ERRORS;
  }
  
  /**
   * Get a report of all service errors
   * @returns Summary of error states
   */
  public getErrorReport(): Record<string, { count: number, lastOccurred: Date }> {
    const report: Record<string, { count: number, lastOccurred: Date }> = {};
    
    this.errorStates.forEach((state, type) => {
      report[type] = {
        count: state.count,
        lastOccurred: state.lastOccurred
      };
    });
    
    return report;
  }
  
  /**
   * Reset error counts for a specific service
   * @param type Service type to reset
   */
  public resetErrorCount(type: ErrorType): void {
    const state = this.errorStates.get(type);
    if (state) {
      state.count = 0;
      state.recoveryAttempts = 0;
      this.errorStates.set(type, state);
    }
  }
  
  /**
   * Reset all error counts
   */
  public resetAllErrorCounts(): void {
    Object.values(ErrorType).forEach(type => {
      this.resetErrorCount(type);
    });
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();