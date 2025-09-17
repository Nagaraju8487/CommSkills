import React, { useState, useEffect } from 'react';
import { Zap, Clock, RotateCcw, Play, Pause, Lightbulb } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useUserData } from '../hooks/useUserData';
import { analyzeSpeech } from '../utils/speechAnalysis';

interface Topic {
  id: number;
  text: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const topics: Topic[] = [
  { id: 1, text: 'Describe your perfect vacation', category: 'Personal', difficulty: 'Easy' },
  { id: 2, text: 'If you could have dinner with anyone, who would it be?', category: 'Personal', difficulty: 'Easy' },
  { id: 3, text: 'Explain why everyone should learn a second language', category: 'Education', difficulty: 'Medium' },
  { id: 4, text: 'The most important invention in human history', category: 'Technology', difficulty: 'Medium' },
  { id: 5, text: 'Convince me to visit your hometown', category: 'Persuasive', difficulty: 'Medium' },
  { id: 6, text: 'Defend or critique social media\'s impact on society', category: 'Social Issues', difficulty: 'Hard' },
  { id: 7, text: 'If you were a world leader for one day, what would you do?', category: 'Politics', difficulty: 'Hard' },
  { id: 8, text: 'Explain quantum computing to a 10-year-old', category: 'Technology', difficulty: 'Hard' },
  { id: 9, text: 'Your advice for someone starting their first job', category: 'Career', difficulty: 'Easy' },
  { id: 10, text: 'The role of failure in personal growth', category: 'Personal Development', difficulty: 'Medium' }
];

const speakingTips = [
  'Take a moment to organize your thoughts before starting',
  'Use the "Past, Present, Future" structure for personal topics',
  'Start with a hook or interesting fact',
  'Use specific examples to support your points',
  'End with a memorable conclusion or call to action',
  'Maintain eye contact with your audience',
  'Use gestures to emphasize key points',
  'Vary your pace and tone to keep it engaging'
];

export function ImpromptuSpeechGenerator() {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [preparationTime, setPreparationTime] = useState(30);
  const [speechTime, setSpeechTime] = useState(120);
  const [prepTimer, setPrepTimer] = useState(0);
  const [speechTimer, setSpeechTimer] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'preparing' | 'speaking' | 'finished'>('ready');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'All'>('All');
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null);
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
    
    if (phase === 'preparing' && prepTimer < preparationTime) {
      interval = setInterval(() => {
        setPrepTimer(prev => prev + 1);
      }, 1000);
    } else if (phase === 'preparing' && prepTimer >= preparationTime) {
      setPhase('ready');
    }
    
    if (phase === 'speaking' && speechTimer < speechTime) {
      interval = setInterval(() => {
        setSpeechTimer(prev => prev + 1);
      }, 1000);
    } else if (phase === 'speaking' && speechTimer >= speechTime) {
      handleFinishSpeech();
    }

    return () => clearInterval(interval);
  }, [phase, prepTimer, preparationTime, speechTimer, speechTime]);

  useEffect(() => {
    if (transcript && phase === 'speaking') {
      const analysis = analyzeSpeech(transcript, speechTimer, confidence);
      setSpeechAnalysis(analysis);
    }
  }, [transcript, speechTimer, confidence, phase]);

  const getRandomTopic = () => {
    const filteredTopics = selectedDifficulty === 'All' 
      ? topics 
      : topics.filter(topic => topic.difficulty === selectedDifficulty);
    
    const randomIndex = Math.floor(Math.random() * filteredTopics.length);
    setCurrentTopic(filteredTopics[randomIndex]);
    setPhase('ready');
    setPrepTimer(0);
    setSpeechTimer(0);
    setSpeechAnalysis(null);
    resetTranscript();
  };

  const startPreparation = () => {
    if (currentTopic) {
      setPhase('preparing');
      setPrepTimer(0);
    }
  };

  const startSpeaking = () => {
    setSessionStartTime(Date.now());
    resetTranscript();
    setSpeechAnalysis(null);
    setPhase('speaking');
    setSpeechTimer(0);
    if (isSupported) {
      startListening();
    }
  };

  const pauseSpeaking = () => {
    setPhase('ready');
    if (isListening) {
      stopListening();
    }
  };

  const handleFinishSpeech = async () => {
    setPhase('finished');
    if (isListening) {
      stopListening();
    }
    
    if (transcript && sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000);
      const analysis = analyzeSpeech(transcript, duration, confidence);
      setSpeechAnalysis(analysis);
      
      await saveSpeechSession('impromptu-speech', transcript, analysis, duration);
    }
  };

  const reset = () => {
    setPhase('ready');
    setPrepTimer(0);
    setSpeechTimer(0);
    setSpeechAnalysis(null);
    setSessionStartTime(null);
    resetTranscript();
    if (isListening) {
      stopListening();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * speakingTips.length);
    return speakingTips[randomIndex];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Impromptu Speech Generator</h1>
        <p className="text-gray-600 text-lg">Practice spontaneous speaking with random topics</p>
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

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Speech Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Time</label>
            <select
              value={preparationTime}
              onChange={(e) => setPreparationTime(parseInt(e.target.value))}
              disabled={phase !== 'ready'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Speech Duration</label>
            <select
              value={speechTime}
              onChange={(e) => setSpeechTime(parseInt(e.target.value))}
              disabled={phase !== 'ready'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
            >
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topic Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Your Topic</h2>
          </div>

          <button
            onClick={getRandomTopic}
            disabled={phase === 'preparing' || phase === 'speaking'}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            <span>New Topic</span>
          </button>
        </div>

        {currentTopic ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentTopic.text}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {currentTopic.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentTopic.difficulty)}`}>
                      {currentTopic.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-gray-900">Quick Tip:</span>
                </div>
                <p className="text-sm text-gray-700">{getRandomTip()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Click "New Topic" to get started!</p>
          </div>
        )}
      </div>

      {/* Timer and Controls */}
      {currentTopic && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            {phase === 'preparing' && (
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatTime(preparationTime - prepTimer)}
                </div>
                <div className="text-lg text-gray-600 mb-4">Preparation Time Remaining</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(prepTimer / preparationTime) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {phase === 'speaking' && (
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatTime(speechTime - speechTimer)}
                </div>
                <div className="text-lg text-gray-600 mb-4">Speaking Time Remaining</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(speechTimer / speechTime) * 100}%` }}
                  />
                </div>
                {isListening && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">Recording your speech...</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Words spoken: {transcript ? transcript.split(' ').length : 0}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(phase === 'ready' || phase === 'finished') && (
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {phase === 'finished' ? '🎉 Complete!' : 'Ready to Start'}
                </div>
                <div className="text-lg text-gray-600">
                  {phase === 'finished' 
                    ? 'Great job! Try another topic to keep practicing.'
                    : `${formatTime(preparationTime)} prep + ${formatTime(speechTime)} speech`
                  }
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            {phase === 'ready' && (
              <button
                onClick={startPreparation}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Start Preparation</span>
              </button>
            )}

            {phase === 'preparing' && (
              <button
                onClick={startSpeaking}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Start Speaking Now</span>
              </button>
            )}

            {phase === 'speaking' && (
              <button
                onClick={pauseSpeaking}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            {phase === 'speaking' && (
              <button
                onClick={handleFinishSpeech}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <span>Finish Early</span>
              </button>
            )}

            <button
              onClick={reset}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Speech Analysis Results */}
      {phase === 'finished' && speechAnalysis && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Speech Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{speechAnalysis.wordCount}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{speechAnalysis.speakingRate}</div>
              <div className="text-sm text-gray-600">Words/Min</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{speechAnalysis.clarity}%</div>
              <div className="text-sm text-gray-600">Clarity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{speechAnalysis.fillerCount}</div>
              <div className="text-sm text-gray-600">Filler Words</div>
            </div>
          </div>

          {speechAnalysis.suggestions && speechAnalysis.suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">💡 Suggestions for Improvement:</h4>
              <ul className="space-y-2">
                {speechAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {transcript && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Your Speech Transcript:</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Speaking Structure Guide */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Structure Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Opening</h4>
            <p className="text-sm text-gray-600">Hook your audience with an interesting fact or question</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Main Points</h4>
            <p className="text-sm text-gray-600">Make 2-3 key points with examples or stories</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Conclusion</h4>
            <p className="text-sm text-gray-600">Summarize and end with a memorable statement</p>
          </div>
        </div>
      </div>
    </div>
  );
}