import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useUser } from './UserContext';

const SessionsContext = createContext(null);

export function SessionsProvider({ children }) {
  const { user, isAuthenticated } = useUser();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSessions = useCallback(async (options = {}) => {
    if (!user?._id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getUserSessions(user._id, options);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  const loadStats = useCallback(async (period = 'week') => {
    if (!user?._id) return;
    
    try {
      setError(null);
      const response = await apiService.getSessionStats(user._id, period);
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(error.message);
    }
  }, [user?._id]);

  // Load sessions when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      loadSessions();
      loadStats();
    } else {
      // Clear sessions when user is not authenticated
      setSessions([]);
      setStats(null);
      setError(null);
    }
  }, [isAuthenticated, user?._id, loadSessions, loadStats]);

  const logSession = async (sessionData) => {
    try {
      setError(null);
      const response = await apiService.logSession(sessionData);
      setSessions(prevSessions => [response.session, ...prevSessions]);
      
      // Reload stats to reflect new session
      await loadStats();
      
      return response.session;
    } catch (error) {
      console.error('Error logging session:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = useMemo(() => ({
    sessions,
    stats,
    isLoading,
    error,
    loadSessions,
    loadStats,
    logSession
  }), [sessions, stats, isLoading, error, loadSessions, loadStats]);

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error('useSessions must be used within SessionsProvider');
  return ctx;
}
