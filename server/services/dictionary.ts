// Simple spell checker service

// Dictionary of common words
const commonWords = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  // Add more common words as needed
]);

/**
 * Check if a word is spelled correctly
 * 
 * @param word The word to check
 * @returns Boolean indicating if the spelling is correct
 */
export async function checkSpelling(word: string): Promise<boolean> {
  if (!word) return true;
  
  // Convert to lowercase for case-insensitive comparison
  const lowerWord = word.toLowerCase();
  
  // Check if the word is in our dictionary
  if (commonWords.has(lowerWord)) {
    return true;
  }
  
  // Placeholder for more sophisticated dictionary check
  // In a real app, this might call an external spelling API
  // or use a more comprehensive dictionary
  
  // For demo purposes, define some common misspellings
  const commonMisspellings = new Set([
    'teh', 'taht', 'recieve', 'thier', 'accomodate', 'seperete',
    'definately', 'occured', 'untill', 'wierd', 'wich', 'ther',
    // Add more misspellings as needed
  ]);
  
  // Return false if the word is a known misspelling
  return !commonMisspellings.has(lowerWord);
}
