import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useUser } from './UserContext';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { user, isAuthenticated } = useUser();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getTasks(user._id);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  // Load tasks when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      loadTasks();
    } else {
      // Clear tasks when user is not authenticated
      setTasks([]);
      setError(null);
    }
  }, [isAuthenticated, user?._id, loadTasks]);

  const createTask = async (taskData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.createTask(taskData);
      setTasks(prevTasks => [response.task, ...prevTasks]);
      return response.task;
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.updateTask(taskId, updates);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? response.task : task
        )
      );
      return response.task;
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const incrementPomodoro = async (taskId) => {
    try {
      setError(null);
      const response = await apiService.incrementPomodoro(taskId);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? response.task : task
        )
      );
      return response.task;
    } catch (error) {
      console.error('Error incrementing pomodoro:', error);
      setError(error.message);
      throw error;
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  const value = useMemo(() => ({
    tasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    incrementPomodoro,
    toggleTaskStatus
  }), [tasks, isLoading, error, loadTasks]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
