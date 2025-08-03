import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import writingService, { ScoreEssayRequest } from '../../services/writing.service';
import WritingAnalysis from '../../components/Writing/WritingAnalysis';

const WritingSubmission: React.FC = () => {
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task1');
  const [essayText, setEssayText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (isTimerActive && startTime) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerActive, startTime]);

  // Start timer when user starts typing
  useEffect(() => {
    if (essayText.length > 0 && !startTime) {
      setStartTime(new Date());
      setIsTimerActive(true);
    }
  }, [essayText, startTime]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeLimit = (): number => {
    return writingService.calculateTimeLimit(taskType);
  };

  const getWordLimit = (): number => {
    return writingService.calculateWordLimit(taskType);
  };

  const getWordCount = (): number => {
    return essayText.trim().split(/\s+/).filter(Boolean).length;
  };

  const isOverTimeLimit = (): boolean => {
    return timeSpent > getTimeLimit() * 60;
  };

  const isUnderWordLimit = (): boolean => {
    return getWordCount() < getWordLimit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayText.trim()) {
      setError('Please enter your essay text.');
      return;
    }
    setShowAnalysis(true);
  };

  const handleAnalysisSubmit = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setIsTimerActive(false); // Stop timer

      const scoreData: ScoreEssayRequest = {
        task_type: taskType,
        essay_text: essayText,
        time_spent: timeSpent
      };

      await writingService.scoreEssay(scoreData);
      navigate('/writing/scores');
    } catch (err: any) {
      let errorMessage = 'Failed to analyze essay. Please try again later.';
      
      // Handle specific error messages
      if (err.response?.data?.error) {
        switch (err.response.data.error) {
          case 'User credits not found':
            errorMessage = 'Your account is not set up for writing analysis. Please contact support.';
            break;
          case 'Insufficient credits':
            errorMessage = 'You do not have enough credits to analyze this essay. Please purchase more credits to continue.';
            break;
          default:
            errorMessage = err.response.data.error;
        }
      }
      
      setError(errorMessage);
      console.error('Error analyzing essay:', err);
      setShowAnalysis(false);
      setIsTimerActive(true); // Resume timer if analysis fails
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisCancel = () => {
    setShowAnalysis(false);
    setIsTimerActive(true); // Resume timer
  };

  const handleTaskTypeChange = (newTaskType: 'task1' | 'task2') => {
    setTaskType(newTaskType);
    // Reset timer when changing task type
    setStartTime(null);
    setTimeSpent(0);
    setIsTimerActive(false);
  };

  if (showAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <WritingAnalysis
            isLoading={isAnalyzing}
            essayText={essayText}
            taskType={taskType}
            timeSpent={timeSpent}
            onSubmit={handleAnalysisSubmit}
            onCancel={handleAnalysisCancel}
          />
          {error && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                  {(error.includes('credits') || error.includes('purchase')) && (
                    <div className="mt-2">
                      <button
                        onClick={() => navigate('/credits')}
                        className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                      >
                        Purchase Credits
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Submit Writing Task</h1>
          <div className="flex items-center gap-4">
            {/* Timer Display */}
            {startTime && (
              <div className={`px-4 py-2 rounded-lg font-mono text-lg ${
                isOverTimeLimit() ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(timeSpent)} / {getTimeLimit()}:00
                </div>
                {isOverTimeLimit() && (
                  <div className="text-xs mt-1">Over time limit!</div>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/writing/scores')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Previous Scores
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Type Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Task Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTaskTypeChange('task1')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  taskType === 'task1'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-medium text-gray-800">Task 1</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Describe visual information (graph, table, chart, or diagram)
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Time limit: {writingService.calculateTimeLimit('task1')} minutes | 
                  Min words: {writingService.calculateWordLimit('task1')}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTaskTypeChange('task2')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  taskType === 'task2'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-medium text-gray-800">Task 2</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Write an essay in response to a point of view, argument, or problem
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Time limit: {writingService.calculateTimeLimit('task2')} minutes | 
                  Min words: {writingService.calculateWordLimit('task2')}
                </div>
              </button>
            </div>
          </div>

          {/* Essay Input */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Essay</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your essay text
                </label>
                <textarea
                  id="essay"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Start writing your essay here..."
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className={`${isUnderWordLimit() ? 'text-red-600' : 'text-gray-600'}`}>
                  Word count: {getWordCount()}
                </span>
                <span className="text-gray-500">
                  Recommended: {getWordLimit()}+ words
                </span>
              </div>
              {isUnderWordLimit() && getWordCount() > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your essay is {getWordLimit() - getWordCount()} words short. 
                        This may result in a penalty to your final score.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!essayText.trim()}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                !essayText.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Continue to Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WritingSubmission; 