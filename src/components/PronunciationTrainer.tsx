import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";  // ✅ FIXED import
import { useUserData } from "../hooks/useUserData";
import { analyzeSpeech } from "../utils/speechAnalysis";

const practiceWords = [
  { word: "pronunciation", difficulty: "Hard", phonetic: "/prəˌnʌnsiˈeɪʃən/" },
  { word: "communication", difficulty: "Medium", phonetic: "/kəˌmjuːnɪˈkeɪʃən/" },
  { word: "articulation", difficulty: "Hard", phonetic: "/ɑːrˌtɪkjʊˈleɪʃən/" },
  { word: "vocabulary", difficulty: "Medium", phonetic: "/vəˈkæbjʊˌleri/" },
  { word: "fluency", difficulty: "Easy", phonetic: "/ˈfluːənsi/" },
  { word: "confidence", difficulty: "Easy", phonetic: "/ˈkɑːnfɪdəns/" },
  { word: "presentation", difficulty: "Medium", phonetic: "/ˌpriːzənˈteɪʃən/" },
  { word: "eloquent", difficulty: "Hard", phonetic: "/ˈeləkwənt/" },
];

const practiceSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "She sells seashells by the seashore.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "Peter Piper picked a peck of pickled peppers.",
  "Red leather, yellow leather, red leather, yellow leather.",
];

export function PronunciationTrainer() {
  const [currentWord, setCurrentWord] = useState(practiceWords[0]);
  const [currentSentence, setCurrentSentence] = useState(practiceSentences[0]);
  const [mode, setMode] = useState<"words" | "sentences">("words");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const { saveSpeechSession } = useUserData();
  const {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      handleAttemptComplete();
    }
  }, [transcript, isListening]);

  const handleAttemptComplete = async () => {
    if (!transcript || !sessionStartTime) return;

    const duration = Math.round((Date.now() - sessionStartTime) / 1000);
    const target = mode === "words" ? currentWord.word : currentSentence;
    const analysis = analyzeSpeech(transcript, duration, confidence);

    const accuracy = calculateAccuracy(transcript.toLowerCase(), target.toLowerCase());

    const attempt = {
      target,
      spoken: transcript,
      accuracy,
      confidence: Math.round(confidence * 100),
      analysis,
      timestamp: new Date().toISOString(),
    };

    setAttempts((prev) => [attempt, ...prev.slice(0, 4)]);

    await saveSpeechSession("pronunciation", transcript, { ...analysis, accuracy, target }, duration);
    setSessionStartTime(null);
  };

  const calculateAccuracy = (spoken: string, target: string) => {
    const spokenWords = spoken.split(" ");
    const targetWords = target.split(" ");

    let matches = 0;
    const maxLength = Math.max(spokenWords.length, targetWords.length);

    for (let i = 0; i < Math.min(spokenWords.length, targetWords.length); i++) {
      if (spokenWords[i] === targetWords[i]) {
        matches++;
      }
    }

    return Math.round((matches / maxLength) * 100);
  };

  const startPractice = () => {
    resetTranscript();
    setSessionStartTime(Date.now());
    startListening();
  };

  const stopPractice = () => {
    stopListening();
  };

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * practiceWords.length);
    setCurrentWord(practiceWords[randomIndex]);
    resetTranscript();
    setAttempts([]);
  };

  const getRandomSentence = () => {
    const randomIndex = Math.floor(Math.random() * practiceSentences.length);
    setCurrentSentence(practiceSentences[randomIndex]);
    resetTranscript();
    setAttempts([]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Practice Speaking</h1>
        <p className="text-gray-600 text-lg">Improve your pronunciation with speech recognition feedback</p>
      </div>

      {!isSupported && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Mode Selection */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={() => setMode("words")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              mode === "words" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Practice Words
          </button>
          <button
            onClick={() => setMode("sentences")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              mode === "sentences" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Practice Sentences
          </button>
        </div>

        {/* Practice Content */}
        <div className="text-center mb-8">
          {mode === "words" ? (
            <div>
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    currentWord.difficulty
                  )} mb-2`}
                >
                  {currentWord.difficulty}
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{currentWord.word}</h2>
              <p className="text-lg text-gray-600 mb-6">{currentWord.phonetic}</p>
              <button
                onClick={getRandomWord}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Word</span>
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentSentence}</h2>
              <button
                onClick={getRandomSentence}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Sentence</span>
              </button>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={isListening ? stopPractice : startPractice}
            disabled={!isSupported}
            className={`flex items-center space-x-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isListening ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isListening ? "Stop Recording" : "Start Practice"}</span>
          </button>

          <button
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(mode === "words" ? currentWord.word : currentSentence);
              utterance.rate = 0.8;
              speechSynthesis.speak(utterance);
            }}
            className="flex items-center space-x-2 px-4 py-4 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Volume2 className="w-5 h-5" />
            <span>Listen</span>
          </button>
        </div>

        {/* Live Transcript */}
        {isListening && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Listening...</span>
            </div>
            <p className="text-blue-900 text-lg">{transcript || "Start speaking..."}</p>
          </div>
        )}
      </div>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Attempts</h3>
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {attempt.accuracy >= 90 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className="font-medium text-gray-900">Target: {attempt.target}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`font-semibold ${getAccuracyColor(attempt.accuracy)}`}>
                      {attempt.accuracy}% accuracy
                    </span>
                    <span className="text-gray-600">{attempt.confidence}% confidence</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-700">You said: "{attempt.spoken}"</p>
                </div>
                {attempt.analysis.suggestions && attempt.analysis.suggestions.length > 0 && (
                  <div className="mt-2 text-sm text-blue-700">💡 {attempt.analysis.suggestions[0]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
