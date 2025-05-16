import nspell from 'nspell';
import en from 'dictionary-en';
import es from 'dictionary-es';

// Dictionary cache
let dictionaries: { [key: string]: any } = {};

/**
 * Initialize a dictionary for a specific language
 * 
 * @param language Language code (en, es, etc)
 */
export async function initDictionary(language: string = 'en'): Promise<any> {
  if (dictionaries[language]) {
    return dictionaries[language];
  }

  return new Promise((resolve, reject) => {
    try {
      const dictionary = language === 'es' ? es : en;
      
      dictionary((err: Error | null, dict: any) => {
        if (err) {
          console.error(`Error loading dictionary for ${language}:`, err);
          reject(err);
          return;
        }
        
        const spell = nspell(dict);
        dictionaries[language] = spell;
        resolve(spell);
      });
    } catch (error) {
      console.error(`Error initializing dictionary for ${language}:`, error);
      reject(error);
    }
  });
}

/**
 * Check if a word is spelled correctly
 * 
 * @param word Word to check
 * @param language Language code
 * @returns Boolean indicating if the word is correct
 */
export async function checkSpelling(word: string, language: string = 'en'): Promise<boolean> {
  try {
    const spell = await initDictionary(language);
    return spell.correct(word);
  } catch (error) {
    console.error('Error checking spelling:', error);
    return true; // Assume correct in case of error
  }
}

/**
 * Get suggestions for a misspelled word
 * 
 * @param word Word to get suggestions for
 * @param language Language code
 * @returns Array of suggestions
 */
export async function getSuggestions(word: string, language: string = 'en'): Promise<string[]> {
  try {
    const spell = await initDictionary(language);
    return spell.suggest(word);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return []; // Return empty array in case of error
  }
}

/**
 * Basic grammar checks using pattern matching 
 * Note: This is a very basic implementation
 */
export function checkGrammarBasic(text: string): { incorrect: string, correct: string, context: string }[] {
  const issues: { incorrect: string, correct: string, context: string }[] = [];
  
  // Basic grammar rules
  const grammarRules = [
    { pattern: /\b(i|we|they|you|he|she) was\b/i, issue: 'subject-verb agreement', exclude: /\b(he|she) was\b/i },
    { pattern: /\b(a) ([aeiou]\w+)/i, issue: 'a/an' },
    { pattern: /\b(their|there|they're)\b/i, issue: 'homophones' },
    { pattern: /\b(your|you're)\b/i, issue: 'homophones' },
    { pattern: /\b(its|it's)\b/i, issue: 'homophones' },
    { pattern: /\b(affect|effect)\b/i, issue: 'homophones' },
    { pattern: /\b(to|too|two)\b/i, issue: 'homophones' }
  ];
  
  // Simple checks for demonstration
  for (const rule of grammarRules) {
    const matches = text.match(new RegExp(rule.pattern, 'g'));
    
    if (matches) {
      for (const match of matches) {
        if (rule.exclude && match.match(rule.exclude)) {
          continue;
        }
        
        // Get context - find a few words before and after
        const matchIndex = text.indexOf(match);
        const start = Math.max(0, matchIndex - 20);
        const end = Math.min(text.length, matchIndex + match.length + 20);
        const context = text.substring(start, end);
        
        // Simple suggestion based on rule type
        let suggestion = match;
        
        if (rule.issue === 'subject-verb agreement' && match.toLowerCase().includes(' was')) {
          suggestion = match.replace(/was/i, 'were');
        } else if (rule.issue === 'a/an' && match.match(/\ba [aeiou]/i)) {
          suggestion = match.replace(/\ba /i, 'an ');
        }
        
        issues.push({
          incorrect: match,
          correct: suggestion,
          context
        });
      }
    }
  }
  
  return issues;
}

/**
 * Offline analysis of text - combines spelling and grammar
 * 
 * @param text Text to analyze
 * @param language Language code
 */
export async function analyzeTextOffline(text: string, language: string = 'en'): Promise<{
  corrections: Array<{
    word: string;
    suggestions: string[];
    type: 'spelling' | 'grammar';
    context: string;
  }>;
  autocompleteSuggestions: string[];
}> {
  // Split text into words for spelling check
  const wordRegex = /\b[\w']+\b/g;
  const words = text.match(wordRegex) || [];
  
  const corrections: Array<{
    word: string;
    suggestions: string[];
    type: 'spelling' | 'grammar';
    context: string;
  }> = [];
  
  // Spelling check
  for (const word of words) {
    // Skip words that are too short or contain numbers
    if (word.length < 3 || /\d/.test(word)) {
      continue;
    }
    
    const isCorrect = await checkSpelling(word, language);
    
    if (!isCorrect) {
      const suggestions = await getSuggestions(word, language);
      
      // Get word context
      const wordIndex = text.indexOf(word);
      const start = Math.max(0, wordIndex - 20);
      const end = Math.min(text.length, wordIndex + word.length + 20);
      const context = text.substring(start, end);
      
      corrections.push({
        word,
        suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
        type: 'spelling',
        context
      });
    }
  }
  
  // Grammar check
  const grammarIssues = checkGrammarBasic(text);
  
  for (const issue of grammarIssues) {
    corrections.push({
      word: issue.incorrect,
      suggestions: [issue.correct],
      type: 'grammar',
      context: issue.context
    });
  }
  
  // Very basic autocomplete
  // Just provide a few common endings for the last word
  let autocompleteSuggestions: string[] = [];
  
  const lastWord = words[words.length - 1] || '';
  if (lastWord.length > 3) {
    const commonEndings = [
      'ing', 'ed', 'ly', 'tion', 'ment', 'ness', 
      's', 'es', 'er', 'est', 'ity', 'ful', 'less'
    ];
    
    // Simple completion: add common endings or common phrases
    if (text.trim().endsWith(lastWord)) {
      autocompleteSuggestions = [
        lastWord + 's',
        lastWord + 'ing',
        lastWord + 'ed',
        lastWord + 'ly'
      ];
    }
  }
  
  return {
    corrections,
    autocompleteSuggestions
  };
}