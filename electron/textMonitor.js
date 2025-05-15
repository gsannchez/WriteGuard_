const { ipcMain } = require('electron');
const path = require('path');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

/**
 * Text Monitor Class
 * In a real implementation, this would use platform-specific libraries
 * to capture text globally across the system.
 */
class TextMonitor {
  constructor() {
    this.isActive = false;
    this.excludedApps = [];
    this.currentText = '';
    this.lastSentText = '';
    this.textBuffer = '';
    this.currentApplication = '';
    this.mainWindow = null;
  }

  /**
   * Start monitoring text input
   * @param {BrowserWindow} mainWindow - Reference to the main Electron window
   */
  start(mainWindow) {
    this.isActive = true;
    this.mainWindow = mainWindow;
    console.log('Text monitor started');
    
    // Register demo keyboard simulation for testing
    // In a real application, this would use OS-level keyboard hooks
    this._registerSimulationHandlers();
  }

  /**
   * Stop monitoring text input
   */
  stop() {
    this.isActive = false;
    console.log('Text monitor stopped');
  }

  /**
   * Set the list of excluded applications
   * @param {string[]} appList - List of application names to exclude
   */
  setExcludedApps(appList) {
    this.excludedApps = appList;
    console.log('Excluded apps updated:', appList);
  }

  /**
   * Check if current application is excluded
   * @returns {boolean} True if the current application is excluded
   */
  isCurrentAppExcluded() {
    return this.excludedApps.includes(this.currentApplication);
  }

  /**
   * Handle text input
   * @param {string} text - Text to process
   * @param {string} application - Application name where text was entered
   */
  async handleTextInput(text, application) {
    if (!this.isActive || this.isCurrentAppExcluded()) {
      return;
    }

    this.currentApplication = application;
    this.textBuffer += text;
    
    // Send for analysis if enough text is collected and it's different from last analyzed text
    if (this.textBuffer.length > 10 && this.textBuffer !== this.lastSentText) {
      this.lastSentText = this.textBuffer;
      
      try {
        // Analyze text for spelling/grammar issues
        const analysis = await this._analyzeText(this.textBuffer);
        
        // If we have corrections, send them to the renderer
        if (analysis.corrections && analysis.corrections.length > 0) {
          this.mainWindow.webContents.send('correction-suggestion', analysis.corrections);
        }
        
        // If we have autocomplete suggestions, send them to the renderer
        if (analysis.autocompleteSuggestions && analysis.autocompleteSuggestions.length > 0) {
          this.mainWindow.webContents.send('autocomplete-suggestion', analysis.autocompleteSuggestions);
        }
      } catch (error) {
        console.error('Error analyzing text:', error);
      }
    }
  }

  /**
   * Clear the text buffer
   */
  clearBuffer() {
    this.textBuffer = '';
    this.lastSentText = '';
  }

  /**
   * Analyze text for corrections and suggestions
   * @param {string} text - Text to analyze
   * @returns {Promise<object>} Analysis results
   */
  async _analyzeText(text) {
    try {
      // In a real app, this would call the OpenAI API directly from the main process
      // Here we're simulating the response
      
      // Check if OpenAI API key is available for real analysis
      if (process.env.OPENAI_API_KEY) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: 
                  "You are a writing assistant that analyzes text and provides two types of feedback: " +
                  "1. Grammar corrections: identify grammar or style issues with the text. " +
                  "2. Autocomplete suggestions: provide possible ways to complete the text if it seems incomplete. " +
                  "Respond with JSON in this format: { 'grammar': [{'incorrect': string, 'correct': string, 'context': string}], 'autocomplete': [string] }",
              },
              {
                role: "user",
                content: text,
              },
            ],
            response_format: { type: "json_object" },
          });
          
          const result = JSON.parse(response.choices[0].message.content);
          
          // Format for our internal use
          return {
            corrections: (result.grammar || []).map(item => ({
              word: item.incorrect,
              suggestions: [item.correct],
              type: 'grammar',
              context: item.context
            })),
            autocompleteSuggestions: result.autocomplete || []
          };
        } catch (error) {
          console.error("Error with OpenAI analysis:", error);
          return this._getSimulatedResults(text);
        }
      } else {
        // Fallback to simulated results if no API key
        return this._getSimulatedResults(text);
      }
    } catch (error) {
      console.error('Error in text analysis:', error);
      return { corrections: [], autocompleteSuggestions: [] };
    }
  }
  
  /**
   * Get simulated analysis results for testing
   * @param {string} text - Text to simulate analysis for
   * @returns {object} Simulated analysis results
   */
  _getSimulatedResults(text) {
    // Mock some common typos to detect
    const commonTypos = {
      'teh': 'the',
      'taht': 'that',
      'recieve': 'receive',
      'thier': 'their',
      'wiht': 'with',
      'hte': 'the'
    };
    
    // Check for typos in the text
    const corrections = [];
    const words = text.split(/\s+/);
    
    for (const word of words) {
      const lowerWord = word.toLowerCase().replace(/[^\w]/g, '');
      
      if (commonTypos[lowerWord]) {
        corrections.push({
          word: lowerWord,
          suggestions: [commonTypos[lowerWord]],
          type: 'spelling',
          context: text
        });
      }
    }
    
    // Simulate autocomplete suggestions
    let autocompleteSuggestions = [];
    
    // Simple rule-based autocompletion
    if (text.includes('Thank you for your')) {
      autocompleteSuggestions = [
        'Thank you for your consideration.',
        'Thank you for your time.',
        'Thank you for your attention to this matter.'
      ];
    } else if (text.includes('I hope this email')) {
      autocompleteSuggestions = [
        'I hope this email finds you well.',
        'I hope this email finds you in good health.',
        'I hope this email finds you doing great.'
      ];
    } else if (text.includes('Please let me know')) {
      autocompleteSuggestions = [
        'Please let me know if you have any questions.',
        'Please let me know your thoughts on this.',
        'Please let me know at your earliest convenience.'
      ];
    }
    
    return {
      corrections,
      autocompleteSuggestions
    };
  }
  
  /**
   * Register simulation IPC handlers for testing
   * In a real implementation, this would use actual keyboard hooks
   */
  _registerSimulationHandlers() {
    // Simulate typing text
    ipcMain.handle('simulate-typing', (event, { text, application }) => {
      this.handleTextInput(text, application);
      return true;
    });
    
    // Simulate clearing text buffer (like when user changes focus)
    ipcMain.handle('simulate-clear-buffer', () => {
      this.clearBuffer();
      return true;
    });
    
    // Simulate changing the current application
    ipcMain.handle('simulate-change-app', (event, application) => {
      this.currentApplication = application;
      return this.currentApplication;
    });
  }
}

module.exports = new TextMonitor();