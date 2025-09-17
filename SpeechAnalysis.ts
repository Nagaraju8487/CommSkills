export interface SpeechAnalysis {
  wordCount: number;
  fillerWords: string[];
  fillerCount: number;
  speakingRate: number; // words per minute
  pauseCount: number;
  clarity: number; // 0-100 score
  confidence: number; // 0-100 score
  suggestions: string[];
}

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally',
  'kind of', 'sort of', 'i mean', 'well', 'right', 'okay', 'yeah'
];

const WEAK_PHRASES = [
  'i think', 'i guess', 'maybe', 'probably', 'i suppose', 'perhaps',
  'sort of', 'kind of', 'i believe', 'it seems'
];

export function analyzeSpeech(
  transcript: string, 
  duration: number, // in seconds
  confidence: number = 1
): SpeechAnalysis {
  const words = transcript.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Detect filler words
  const detectedFillers: string[] = [];
  words.forEach(word => {
    FILLER_WORDS.forEach(filler => {
      if (word.includes(filler)) {
        detectedFillers.push(filler);
      }
    });
  });
  
  const fillerCount = detectedFillers.length;
  const uniqueFillers = [...new Set(detectedFillers)];
  
  // Calculate speaking rate (words per minute)
  const speakingRate = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;
  
  // Estimate pause count (rough approximation based on punctuation and sentence structure)
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const pauseCount = Math.max(0, sentences.length - 1);
  
  // Calculate clarity score (0-100)
  const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;
  const clarityScore = Math.max(0, Math.round((1 - fillerRatio) * 100));
  
  // Confidence score (based on speech recognition confidence and other factors)
  const confidenceScore = Math.round(confidence * 100);
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (fillerCount > wordCount * 0.1) {
    suggestions.push('Try to reduce filler words like "um", "uh", and "like"');
  }
  
  if (speakingRate < 120) {
    suggestions.push('Consider speaking a bit faster - aim for 120-150 words per minute');
  } else if (speakingRate > 180) {
    suggestions.push('Try speaking more slowly for better clarity - aim for 120-150 words per minute');
  }
  
  // Check for weak phrases
  const weakPhraseCount = WEAK_PHRASES.reduce((count, phrase) => {
    return count + (transcript.toLowerCase().includes(phrase) ? 1 : 0);
  }, 0);
  
  if (weakPhraseCount > 2) {
    suggestions.push('Use more confident language - avoid phrases like "I think" or "maybe"');
  }
  
  if (sentences.length > 0) {
    const avgSentenceLength = wordCount / sentences.length;
    if (avgSentenceLength > 25) {
      suggestions.push('Break up long sentences for better clarity');
    }
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Great job! Your speech shows good clarity and confidence');
  }
  
  return {
    wordCount,
    fillerWords: uniqueFillers,
    fillerCount,
    speakingRate,
    pauseCount,
    clarity: clarityScore,
    confidence: confidenceScore,
    suggestions
  };
}