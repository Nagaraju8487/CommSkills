import React, { useState, useEffect } from 'react';
import { MessageSquare, Play, Pause, RotateCcw, Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useUserData } from '../hooks/useUserData';
import { analyzeSpeech } from '../utils/speechAnalysis';

interface Question {
  id: number;
  category: string;
  question: string;
  tips: string[];
}

const questions: Question[] = [
  {
    id: 1,
    category: 'Interview',
    question: 'Tell me about yourself.',
    tips: ['Keep it professional and relevant', 'Structure: Present → Past → Future', 'Highlight key achievements']
  },
  {
    id: 2,
    category: 'Interview',
    question: 'What are your greatest strengths?',
    tips: ['Choose strengths relevant to the role', 'Provide specific examples', 'Connect to business value']
  },
  {
    id: 3,
    category: 'Small Talk',
    question: 'How was your weekend?',
    tips: ['Keep it brief and positive', 'Ask a follow-up question', 'Find common interests']
  },
  {
    id: 4,
    category: 'Group Discussion',
    question: 'What do you think about remote work?',
    tips: ['Present both sides of the argument', 'Use personal experience if relevant', 'Acknowledge other viewpoints']
  },
  {
    id: 5,
    category: 'Public Speaking',
    question: 'How do you stay motivated?',
    tips: ['Start with a personal story', 'Connect to a larger purpose', 'End with a strong call to action']
  },
  {
    id: 6,
    category: 'Small Talk',
    question: 'What do you do for fun?',
    tips: ['Share a hobby or interest', 'Keep it light and engaging', 'Ask a similar question back to them']
  },
  {
    id: 7,
    category: 'Group Discussion',
    question: 'What are the pros and cons of AI in the workplace?',
    tips: ['State your opinion clearly', 'Provide a specific example', 'Acknowledge opposing viewpoints gracefully']
  },
  {
    id: 8,
    category: 'Interview',
    question: 'Where do you see yourself in five years?',
    tips: ['Align your goals with the company’s vision', 'Show ambition and a plan', 'Be realistic and focused']
  }
];


export function ConversationSimulator() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0]);
  const [userResponse, setUserResponse] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
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
    isSupported
  } = useSpeechRecognition();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (transcript) {
      setUserResponse(transcript);
      const speechAnalysis = analyzeSpeech(transcript, timer, confidence);
      setAnalysis(speechAnalysis);
    }
  }, [transcript, timer, confidence]);

  const handleResponseChange = (text: string) => {
    setUserResponse(text);
    if (text.trim()) {
      const speechAnalysis = analyzeSpeech(text, timer, confidence);
      setAnalysis(speechAnalysis);
    } else {
      setAnalysis(null);
    }
  };

  const handleStartRecording = () => {
    resetTranscript();
    setUserResponse('');
    setAnalysis(null);
    setSessionStartTime(Date.now());
    startListening();
    setIsTimerRunning(true);
  };

  const handleStopRecording = async () => {
    stopListening();
    setIsTimerRunning(false);
    
    if (transcript && sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000);
      const speechAnalysis = analyzeSpeech(transcript, duration, confidence);
      
      // Call the saveSpeechSession function with the analysis data
      await saveSpeechSession({
        sessionType: 'conversation',
        transcript: transcript,
        analysis: speechAnalysis,
        duration: duration
      });
    }
  };
  const nextQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
    setUserResponse('');
    setAnalysis(null);
    resetTimer();
    resetTranscript();
  };

  const startTimer = () => {
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
    setSessionStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Conversation Simulator</h1>
        <p className="text-gray-600 text-lg">Practice your responses and get real-time feedback</p>
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

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Question</h2>
              <p className="text-sm text-blue-600 font-medium">{currentQuestion.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatTime(timer)}</div>
              <div className="text-sm text-gray-500">Response time</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-xl text-gray-800 font-medium">{currentQuestion.question}</p>
        </div>

        {/* Tips */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">💡 Tips for a great response:</h3>
          <ul className="space-y-2">
            {currentQuestion.tips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={isListening ? handleStopRecording : handleStartRecording}
            disabled={!isSupported}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? 'Stop Recording' : 'Start Recording'}</span>
          </button>

          <button
            onClick={isTimerRunning ? pauseTimer : startTimer}
            className="flex items-center space-x-2 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isTimerRunning ? 'Pause' : 'Start'} Timer</span>
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center space-x-2 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Live Transcript */}
        {isListening && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Recording...</span>
            </div>
            <p className="text-blue-900">{transcript || 'Start speaking...'}</p>
          </div>
        )}

        {/* Response Input */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">Your Response:</label>
          <textarea
            value={userResponse}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Type your response here or use the microphone to practice speaking..."
            className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Analysis Panel */}
      {analysis && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Response Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analysis.wordCount}</div>
              <div className="text-sm text-gray-600">Words</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{analysis.fillerCount}</div>
              <div className="text-sm text-gray-600">Filler Words</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analysis.speakingRate}</div>
              <div className="text-sm text-gray-600">Words/Min</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{analysis.clarity}%</div>
              <div className="text-sm text-gray-600">Clarity Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{analysis.confidence}%</div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
          </div>

          {analysis.fillerWords.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Detected Filler Words:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.fillerWords.map((word, index) => (
                  <span key={index} className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">💡 Suggestions for Improvement:</h4>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Next Question Button */}
      <div className="text-center">
        <button
          onClick={nextQuestion}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}