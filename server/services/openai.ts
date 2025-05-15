import OpenAI from "openai";

interface GrammarItem {
  incorrect: string;
  correct: string;
  context: string;
}

interface AnalysisResult {
  grammar: GrammarItem[];
  autocomplete: string[];
}

// Create OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || '' 
});

// Analyze a sentence for grammar issues and autocomplete suggestions
export async function analyzeSentence(text: string): Promise<AnalysisResult> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    return {
      grammar: Array.isArray(result.grammar) ? result.grammar : [],
      autocomplete: Array.isArray(result.autocomplete) ? result.autocomplete : []
    };
  } catch (error) {
    console.error("Error analyzing with OpenAI:", error);
    return { grammar: [], autocomplete: [] };
  }
}

// Get autocomplete suggestions for text
export async function getAutocompleteSuggestions(text: string): Promise<string[]> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a writing assistant that provides intelligent autocompletions for text. " +
            "Given the partial text, provide 3-5 natural, contextually appropriate ways to complete the text. " +
            "Return just an array of strings with the complete sentences (including the original text).",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error getting autocomplete suggestions:", error);
    return [];
  }
}
