import React, { useState, useEffect } from 'react';
import writingService, { WritingScore, CombinedWritingScore } from '../../services/writing.service';
import { ScoreDisplay } from '../../components/Writing/ScoreDisplay';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WritingScores: React.FC = () => {
  const [scores, setScores] = useState<WritingScore[]>([]);
  const [combinedScores, setCombinedScores] = useState<CombinedWritingScore[]>([]);
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCombinedScores, setShowCombinedScores] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScores();
    fetchCombinedScores();
  }, []);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const userScores = await writingService.getUserScores();
      setScores(userScores || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching scores:', err);
      setError('Failed to load writing scores. Please try again later.');
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCombinedScores = async () => {
    try {
      const userCombinedScores = await writingService.getCombinedScores();
      setCombinedScores(userCombinedScores || []);
    } catch (err) {
      console.error('Error fetching combined scores:', err);
    }
  };

  const handleScoreClick = (scoreId: string) => {
    setExpandedScoreId(expandedScoreId === scoreId ? null : scoreId);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (seconds: number | undefined): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBandColor = (score: number) => {
    if (score >= 7.5) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (score >= 6.5) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (score >= 5.5) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getBandTextColor = (score: number) => {
    if (score >= 7.5) return 'text-emerald-600';
    if (score >= 6.5) return 'text-blue-600';
    if (score >= 5.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderHighlightedText = (text: string, score: WritingScore) => {
    const corrections = writingService.parseCorrections(score);
    const highlightedText = writingService.highlightText(text, corrections);
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-8 rounded-2xl bg-white shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your scores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white shadow-lg">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg" role="alert">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">Error!</span>
            </div>
            <p className="mt-2 text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Writing Scores History
              </h1>
              <p className="text-gray-600 mt-2">Track your IELTS writing progress over time</p>
            </div>
            <div className="flex gap-3">
              {combinedScores.length > 0 && (
                <button
                  onClick={() => setShowCombinedScores(!showCombinedScores)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    showCombinedScores 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  {showCombinedScores ? 'Individual Scores' : 'Combined Scores'}
                </button>
              )}
              <button
                onClick={() => navigate('/writing')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                         hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all
                         shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Writing Task
              </button>
            </div>
          </div>

          {/* Combined Scores Section */}
          {showCombinedScores && combinedScores.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Combined Writing Scores</h2>
              <p className="text-gray-600 mb-6">
                Combined scores calculated as: Task 1 (33.3%) + Task 2 (66.7%)
              </p>
              <div className="grid grid-cols-1 gap-4">
                {combinedScores.map((combinedScore) => (
                  <div key={combinedScore.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Combined Writing Score
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {formatDate(combinedScore.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${getBandTextColor(combinedScore.combined_score)}`}>
                          {combinedScore.combined_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Overall Band Score
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {combinedScore.task1_score && (
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-sm text-gray-600">Task 1 (33.3%)</div>
                          <div className="text-lg font-semibold text-blue-600">
                            {combinedScore.task1_score.adjusted_score.toFixed(1)}
                          </div>
                        </div>
                      )}
                      {combinedScore.task2_score && (
                        <div className="bg-white rounded-lg p-3">
                          <div className="text-sm text-gray-600">Task 2 (66.7%)</div>
                          <div className="text-lg font-semibold text-indigo-600">
                            {combinedScore.task2_score.adjusted_score.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Scores Section */}
          {(!showCombinedScores || combinedScores.length === 0) && (
            <>
              {!scores || scores.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-xl font-medium text-gray-600">No writing scores yet</p>
                  <p className="mt-2 text-gray-500">Start your first writing task to track your progress</p>
                  <button
                    onClick={() => navigate('/writing')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
                             hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all
                             shadow-md hover:shadow-lg inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Start Your First Writing Task
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence>
                    {scores.map((score) => (
                      <motion.div
                        key={score.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
                      >
                        {/* Score Header - Always visible */}
                        <div
                          onClick={() => handleScoreClick(score.id)}
                          className="p-6 cursor-pointer hover:bg-gray-50 transition-all rounded-xl
                                   flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                        >
                          <div className="flex items-start gap-6">
                            <div className="flex flex-col items-center">
                              <div className={`w-14 h-14 rounded-xl ${getBandColor(score.adjusted_score)} 
                                            flex items-center justify-center text-white font-bold text-xl`}>
                                {score.adjusted_score?.toFixed(1)}
                              </div>
                              {(score.word_count_penalty > 0 || score.time_penalty > 0) && (
                                <div className="text-xs text-red-600 mt-1 text-center">
                                  {score.overall_score?.toFixed(1)} → {score.adjusted_score?.toFixed(1)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                Writing {score.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                              </h3>
                              <div className="flex items-center gap-4 text-gray-500 mt-1">
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm">{formatDate(score.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm">{formatTime(score.time_spent)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm">{score.word_count} words</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              {['Task Achievement', 'Coherence', 'Lexical', 'Grammar'].map((criterion, index) => (
                                <div key={criterion} className="text-center">
                                  <div className={`text-sm font-medium ${getBandTextColor(
                                    [score.task_achievement, score.coherence_cohesion, 
                                     score.lexical_resource, score.grammatical_range][index]
                                  )}`}>
                                    {[score.task_achievement, score.coherence_cohesion,
                                      score.lexical_resource, score.grammatical_range][index].toFixed(1)}
                                  </div>
                                  <div className="text-xs text-gray-500">{criterion}</div>
                                </div>
                              ))}
                            </div>
                            <motion.svg 
                              animate={{ rotate: expandedScoreId === score.id ? 180 : 0 }}
                              className="w-6 h-6 text-gray-400 flex-shrink-0"
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                          </div>
                        </div>

                        {/* Expandable Score Details */}
                        <AnimatePresence>
                          {expandedScoreId === score.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-100 p-6">
                                {/* Penalties Section */}
                                {(score.word_count_penalty > 0 || score.time_penalty > 0) && (
                                  <div className="mb-6 bg-red-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-red-800 mb-3">Score Adjustments</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Original Score:</span>
                                        <span className="font-medium">{score.overall_score?.toFixed(1)}</span>
                                      </div>
                                      {score.word_count_penalty > 0 && (
                                        <div className="flex justify-between items-center text-red-600">
                                          <span>Word Count Penalty:</span>
                                          <span>-{score.word_count_penalty.toFixed(1)}</span>
                                        </div>
                                      )}
                                      {score.time_penalty > 0 && (
                                        <div className="flex justify-between items-center text-red-600">
                                          <span>Time Penalty:</span>
                                          <span>-{score.time_penalty.toFixed(1)}</span>
                                        </div>
                                      )}
                                      <div className="border-t pt-2 flex justify-between items-center font-semibold">
                                        <span className="text-gray-700">Final Score:</span>
                                        <span className={getBandTextColor(score.adjusted_score)}>
                                          {score.adjusted_score?.toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Essay with Highlighting */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Essay (with corrections highlighted)</h3>
                                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {renderHighlightedText(score.essay_text, score)}
                                  </div>
                                  <div className="mt-2 text-sm text-gray-500 flex gap-4">
                                    <span className="flex items-center gap-1">
                                      <span className="w-3 h-3 bg-red-200 rounded"></span>
                                      Grammar corrections
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-3 h-3 bg-blue-200 rounded"></span>
                                      Vocabulary improvements
                                    </span>
                                  </div>
                                </div>

                                <ScoreDisplay score={score} />

                                {/* Corrections Section */}
                                {(() => {
                                  const corrections = writingService.parseCorrections(score);
                                  return (corrections.grammar?.length > 0 ||
                                    corrections.vocabulary?.length > 0 ||
                                    corrections.structure?.length > 0) && (
                                    <div className="mt-8">
                                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                                        Suggested Corrections
                                      </h3>

                                      {/* Grammar Corrections */}
                                      {corrections.grammar?.length > 0 && (
                                        <div className="mb-6">
                                          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Grammar Corrections
                                          </h4>
                                          <div className="space-y-4">
                                            {corrections.grammar.map((correction, index) => (
                                              <div key={index} className="bg-red-50 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                  <span className="bg-red-100 text-red-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                    {index + 1}
                                                  </span>
                                                  <div className="flex-1">
                                                    <p className="text-gray-800 line-through decoration-red-500">
                                                      {correction.original}
                                                    </p>
                                                    <p className="text-green-600 font-medium mt-1">
                                                      {correction.correction}
                                                    </p>
                                                    <p className="text-gray-600 text-sm mt-2 italic">
                                                      {correction.explanation}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Vocabulary Suggestions */}
                                      {corrections.vocabulary?.length > 0 && (
                                        <div className="mb-6">
                                          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            Vocabulary Improvements
                                          </h4>
                                          <div className="space-y-4">
                                            {corrections.vocabulary.map((suggestion, index) => (
                                              <div key={index} className="bg-blue-50 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                  <span className="bg-blue-100 text-blue-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                    {index + 1}
                                                  </span>
                                                  <div className="flex-1">
                                                    <p className="text-gray-800 line-through decoration-blue-500">
                                                      {suggestion.original}
                                                    </p>
                                                    <p className="text-blue-600 font-medium mt-1">
                                                      {suggestion.suggestion}
                                                    </p>
                                                    <p className="text-gray-600 text-sm mt-2 italic">
                                                      {suggestion.explanation}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Structure Improvements */}
                                      {corrections.structure?.length > 0 && (
                                        <div className="mb-6">
                                          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                    d="M4 6h16M4 12h16m-7 6h7" />
                                            </svg>
                                            Structure Improvements
                                          </h4>
                                          <div className="space-y-4">
                                            {corrections.structure.map((improvement, index) => (
                                              <div key={index} className="bg-purple-50 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                  <span className="bg-purple-100 text-purple-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                    {index + 1}
                                                  </span>
                                                  <div className="flex-1">
                                                    <p className="text-gray-800 font-medium">
                                                      Issue: {improvement.issue}
                                                    </p>
                                                    <p className="text-purple-600 mt-1">
                                                      Suggestion: {improvement.suggestion}
                                                    </p>
                                                    <p className="text-gray-600 mt-2 italic bg-purple-50 p-2 rounded">
                                                      Example: {improvement.example}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingScores; 