/**
 * Language Detection Service
 * 
 * This service provides language detection capabilities for better text processing.
 * It uses simple heuristics and common word patterns to identify languages.
 */

// Common words by language for identification
const languagePatterns: Record<string, string[]> = {
  'en': [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
  ],
  'es': [
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se',
    'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le',
    'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir',
    'otro', 'ese', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'muy',
  ],
  'fr': [
    'le', 'la', 'de', 'et', 'à', 'en', 'un', 'être', 'avoir', 'que',
    'pour', 'dans', 'ce', 'il', 'qui', 'ne', 'sur', 'se', 'pas', 'plus',
    'par', 'je', 'avec', 'tout', 'faire', 'son', 'mettre', 'autre', 'on', 'mais',
    'nous', 'comme', 'ou', 'si', 'leur', 'y', 'dire', 'elle', 'devoir', 'avant',
  ],
  'de': [
    'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich',
    'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als',
    'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach',
    'bei', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'wenn',
  ]
};

// Special character patterns that may indicate a specific language
const specialPatterns: Record<string, RegExp[]> = {
  'es': [/[áéíóúñü]/i],
  'fr': [/[àâçéèêëîïôùûüÿ]/i],
  'de': [/[äöüß]/i],
};

/**
 * Detect the language of a given text
 * 
 * @param text The text to analyze
 * @returns Language code (en, es, fr, de) or 'unknown'
 */
export function detectLanguage(text: string): string {
  if (!text || text.length < 5) {
    return 'unknown';
  }
  
  // Convert to lowercase and remove special characters for word analysis
  const normalizedText = text.toLowerCase();
  
  // First check for special characters that are language-specific
  for (const [lang, patterns] of Object.entries(specialPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedText)) {
        return lang;
      }
    }
  }
  
  // Split into words for analysis
  const words = normalizedText.split(/\s+/);
  
  // Count occurrences of language-specific common words
  const scores: Record<string, number> = {
    'en': 0,
    'es': 0,
    'fr': 0,
    'de': 0,
  };
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zäöüßáéíóúñüàâçèêëîïôùûÿ]/g, '');
    if (cleanWord.length < 2) continue;
    
    for (const [lang, commonWords] of Object.entries(languagePatterns)) {
      if (commonWords.includes(cleanWord)) {
        scores[lang] += 1;
      }
    }
  }
  
  // Find language with highest score
  let highestScore = 0;
  let detectedLanguage = 'unknown';
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      detectedLanguage = lang;
    }
  }
  
  // If the text has enough words and we have a clear winner
  if (words.length >= 5 && highestScore >= 2) {
    return detectedLanguage;
  }
  
  // Default to 'en' if we couldn't determine confidently
  return 'en';
}

/**
 * Map a detected language to a supported dictionary language
 * @param language The detected language code
 * @returns The supported dictionary language code
 */
export function mapToSupportedLanguage(language: string): string {
  const supportedLanguages = ['en', 'es'];
  
  if (supportedLanguages.includes(language)) {
    return language;
  }
  
  // If the language variant is supported (e.g., 'en-US' -> 'en')
  const baseLang = language.split('-')[0];
  if (supportedLanguages.includes(baseLang)) {
    return baseLang;
  }
  
  // Default to English if language not supported
  return 'en';
}