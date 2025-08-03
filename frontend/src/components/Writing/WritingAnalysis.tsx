import React from 'react';
import { motion } from 'framer-motion';
import writingService from '../../services/writing.service';

interface WritingAnalysisProps {
  isLoading: boolean;
  essayText: string;
  taskType: 'task1' | 'task2';
  timeSpent: number;
  onSubmit: () => void;
  onCancel: () => void;
}

const WritingAnalysis: React.FC<WritingAnalysisProps> = ({
  isLoading,
  essayText,
  taskType,
  timeSpent,
  onSubmit,
  onCancel
}) => {
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const minWords = writingService.calculateWordLimit(taskType);
  const timeLimit = writingService.calculateTimeLimit(taskType);
  const timeLimitSeconds = timeLimit * 60;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isOverTimeLimit = timeSpent > timeLimitSeconds;
  const isUnderWordLimit = wordCount < minWords;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Writing Analysis - {taskType === 'task1' ? 'Task 1' : 'Task 2'}
      </h2>

      {/* Time and Word Count Warnings */}
      <div className="space-y-4 mb-6">
        {/* Time Warning */}
        {isOverTimeLimit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Time Limit Exceeded:</strong> You took {formatTime(timeSpent)} but the limit is {timeLimit} minutes.
                  This may result in a time penalty affecting your final score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Word Count Warning */}
        {isUnderWordLimit && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Word Count Warning:</strong> Your essay is {minWords - wordCount} words short of the recommended minimum ({minWords} words).
                  This may result in a word count penalty affecting your Task Achievement score.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Time Taken:</span>
            <span className={`font-medium ${isOverTimeLimit ? 'text-red-600' : 'text-green-600'}`}>
              {formatTime(timeSpent)} / {timeLimit}:00
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Word Count:</span>
            <span className={`font-medium ${isUnderWordLimit ? 'text-red-600' : 'text-green-600'}`}>
              {wordCount} / {minWords}+ words
            </span>
          </div>
        </div>
      </div>

      {/* Essay Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Essay</h3>
        <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700 max-h-64 overflow-y-auto">
          {essayText}
        </div>
      </div>

      {/* Analysis Status */}
      {isLoading && (
        <div className="text-center py-8">
          <motion.div
            className="inline-block"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.div>
          <p className="mt-4 text-lg font-medium text-gray-800">
            Analyzing your essay...
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Our AI is carefully evaluating your writing based on IELTS criteria.
            This may take a minute.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading || !essayText.trim()}
          className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
            isLoading || !essayText.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Analyzing...' : 'Submit for Analysis'}
        </button>
      </div>
    </div>
  );
};

export default WritingAnalysis; 