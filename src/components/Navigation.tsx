import React from 'react';
import { User } from 'firebase/auth'; // Import the correct User type from Firebase
import { useAuth } from '../contexts/AuthContext';
import { AppView } from '../App';
import { 
  Home, 
  MessageSquare, 
  Mic, 
  Mail, 
  Zap, 
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User | null; // Use the correct User type from Firebase or null
}

const navItems = [
  { id: 'dashboard' as AppView, label: 'Dashboard', icon: Home },
  { id: 'conversation' as AppView, label: 'Conversation', icon: MessageSquare },
  { id: 'practice-speaking' as AppView, label: 'Practice Speaking', icon: Mic },
  { id: 'email-tone' as AppView, label: 'Email Tone', icon: Mail },
  { id: 'impromptu-speech' as AppView, label: 'Impromptu Speech', icon: Zap },
];

export function Navigation({ currentView, onNavigate, user }: NavigationProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">CommSkills</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="w-4 h-4" />
              <span>{user?.displayName || user?.email || 'User'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
          {/* Mobile menu - simplified for demo */}
          <div className="md:hidden flex items-center space-x-2">
            <select 
              value={currentView} 
              onChange={(e) => onNavigate(e.target.value as AppView)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}