import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

export const useUserData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0); // New state for the streak

  // A helper function to calculate the streak
  const calculateStreak = (sessionsArray: any[]) => {
    if (sessionsArray.length === 0) {
      return 0;
    }

    // Get unique dates from the sessions, sorted in descending order
    const uniqueDates = Array.from(new Set(
      sessionsArray.map(s => {
        // Handle both Firestore Timestamp and JS Date objects
        const date = s.date instanceof Timestamp ? s.date.toDate() : s.date;
        return date.toISOString().split('T')[0];
      })
    )).sort().reverse();

    if (uniqueDates.length === 0) {
      return 0;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let previousDate = new Date(); // Start with a recent date

    for (const dateString of uniqueDates) {
      const currentDate = new Date(dateString);
      const diffInDays = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays <= 1) {
        currentStreak++;
      } else {
        currentStreak = 1; // Restart streak
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      previousDate = currentDate;
    }

    return longestStreak;
  };

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const sessionsQuery = query(
          collection(db, 'user_sessions'),
          where('user_id', '==', user.uid),
          orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(sessionsQuery);
        const fetchedSessions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSessions(fetchedSessions);
        setStreak(calculateStreak(fetchedSessions)); // Calculate the streak
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions.');
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const saveSpeechSession = async (sessionData: {
    sessionType: string;
    transcript: string;
    analysis: any;
    duration: number;
  }) => {
    if (!user) {
      console.error('User is not authenticated. Cannot save session.');
      return;
    }

    try {
      await addDoc(collection(db, 'user_sessions'), {
        user_id: user.uid,
        session_type: sessionData.sessionType,
        transcript_text: sessionData.transcript,
        word_count: sessionData.analysis.wordCount,
        filler_words: sessionData.analysis.fillerCount,
        speaking_rate: sessionData.analysis.speakingRate,
        confidence: sessionData.analysis.confidence,
        session_duration: sessionData.duration,
        date: new Date(),
      });
      // After saving, re-fetch to update the state
      const sessionsQuery = query(
        collection(db, 'user_sessions'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(sessionsQuery);
      const fetchedSessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSessions(fetchedSessions);
      setStreak(calculateStreak(fetchedSessions)); // Update streak
    } catch (err: any) {
      console.error('Error saving session:', err);
      setError('Failed to save session.');
    }
  };

  return {
    sessions,
    loading,
    error,
    saveSpeechSession,
    streak // Return the new streak value
  };
};