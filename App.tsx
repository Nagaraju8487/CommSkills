import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ConversationSimulator } from './components/ConversationSimulator';
import { EmailToneImprover } from './components/EmailToneImprover';
import { ImpromptuSpeechGenerator } from './components/ImpromptuSpeechGenerator';
import { PronunciationTrainer } from './components/PronunciationTrainer'; // Corrected spelling here

export type AppView = 
  | 'dashboard' 
  | 'conversation' 
  | 'practice-speaking'
  | 'email-tone' 
  | 'impromptu-speech';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Master Your Communication Skills
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Practice speaking, improve pronunciation, and build confidence with our comprehensive training platform
            </p>
            
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg mb-8"
            >
              Create Account / Sign In
            </button>
            
            
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Practice Speaking</h3>
              <p className="text-gray-600">Improve your pronunciation and speaking skills with real-time speech recognition and instant feedback.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Progress</h3>
              <p className="text-gray-600">Track your improvement over time with detailed analytics and personalized recommendations.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Tone</h3>
              <p className="text-gray-600">Get instant feedback on the tone, clarity, and politeness of your emails.</p>
            </div>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }
const renderCurrentView = () => {
  switch (currentView) {
    case 'conversation':
      return <ConversationSimulator />;
    case 'practice-speaking':
      return <PronunciationTrainer />;
    case 'email-tone': // Changed from 'speaking-timer'
      return <EmailToneImprover />; // Return the new component
    case 'impromptu-speech':
      return <ImpromptuSpeechGenerator />;
    default:
      return <Dashboard onNavigate={setCurrentView} />;
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation 
        currentView={currentView} 
        onNavigate={setCurrentView}
        user={user}
      />
      <main className="pt-20">
        {renderCurrentView()}
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default App;