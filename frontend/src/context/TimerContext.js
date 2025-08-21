import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLORS } from '../../constants/theme';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [timerState, setTimerState] = useState('idle'); // 'idle', 'focus', 'break', 'longBreak'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState(1);
  const [totalSessions, setTotalSessions] = useState(4);

  // Timer configurations
  const timerConfigs = {
    focus: 25 * 60, // 25 minutes
    break: 5 * 60,  // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  };

  // Get mood color based on timer state
  const getMoodColor = (state) => {
    switch (state) {
      case 'focus':
        return COLORS.focus;
      case 'break':
        return COLORS.break;
      case 'longBreak':
        return COLORS.longBreak;
      default:
        return COLORS.primary;
    }
  };

  // Start timer
  const startTimer = (type = 'focus') => {
    setTimerState(type);
    setIsRunning(true);
    setTimeLeft(timerConfigs[type]);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // Resume timer
  const resumeTimer = () => {
    setIsRunning(true);
  };

  // Stop timer
  const stopTimer = () => {
    setIsRunning(false);
    setTimerState('idle');
    setTimeLeft(timerConfigs.focus);
    setCurrentSession(1);
  };

  // Skip to next session
  const skipSession = () => {
    if (timerState === 'focus') {
      if (currentSession % 4 === 0) {
        // Long break after 4 focus sessions
        setTimerState('longBreak');
        setTimeLeft(timerConfigs.longBreak);
      } else {
        // Regular break
        setTimerState('break');
        setTimeLeft(timerConfigs.break);
      }
    } else {
      // Break finished, start next focus session
      setTimerState('focus');
      setTimeLeft(timerConfigs.focus);
      setCurrentSession(prev => prev + 1);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Timer finished
            setIsRunning(false);
            skipSession();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const value = {
    // State
    timerState,
    isRunning,
    timeLeft,
    currentSession,
    totalSessions,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipSession,
    
    // Utilities
    getMoodColor,
    formatTime,
    timerConfigs,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
