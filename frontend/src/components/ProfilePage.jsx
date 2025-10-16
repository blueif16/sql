import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Award, TrendingUp, BookOpen, Target, Zap, Trophy } from 'lucide-react';
import { USER_CONFIG, DIFFICULTY_COLORS, DIFFICULTY_LABELS, UI_CONFIG } from '../config/constants';
import { userAPI } from '../services/api';

const ProfilePage = ({ user }) => { // Profile page component: user info and statistics
  const [activeTab, setActiveTab] = useState('overview'); // Active tab: overview, submissions, or stats
  const [submissions, setSubmissions] = useState([]); // User submission history
  const [problemStats, setProblemStats] = useState([]); // Problem statistics
  const [conceptStats, setConceptStats] = useState([]); // Concept statistics
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => { // Load user data on component mount
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => { // Fetch user submissions and statistics from API
    setLoading(true);
    try {
      const [submissionsData, problemStatsData, conceptStatsData] = await Promise.all([
        userAPI.getSubmissions().catch(() => null),
        userAPI.getProblemStats().catch(() => null),
        userAPI.getConceptStats().catch(() => null),
      ]);
      setSubmissions(submissionsData || getMockSubmissions()); // Fallback to mock data if API fails
      setProblemStats(problemStatsData || getMockProblemStats());
      setConceptStats(conceptStatsData || getMockConceptStats());
    } catch (error) {
      console.error('Failed to load user data:', error);
      setSubmissions(getMockSubmissions()); // Use mock data on error
      setProblemStats(getMockProblemStats());
      setConceptStats(getMockConceptStats());
    } finally {
      setLoading(false);
    }
  };

  const getMockSubmissions = () => { // Generate mock submission data for demo
    return [
      { id: 1, problem_title: 'Basic SELECT Query', is_correct: true, submitted_at: '2025-10-10 14:30:00', hints_used: 0, time_spent_seconds: 120 },
      { id: 2, problem_title: 'WHERE Clause Filtering', is_correct: false, submitted_at: '2025-10-10 15:00:00', hints_used: 1, time_spent_seconds: 180 },
      { id: 3, problem_title: 'JOIN Multiple Tables', is_correct: true, submitted_at: '2025-10-09 10:20:00', hints_used: 2, time_spent_seconds: 300 },
      { id: 4, problem_title: 'GROUP BY Aggregation', is_correct: true, submitted_at: '2025-10-09 11:00:00', hints_used: 0, time_spent_seconds: 150 },
      { id: 5, problem_title: 'ORDER BY Sorting', is_correct: true, submitted_at: '2025-10-08 16:45:00', hints_used: 0, time_spent_seconds: 90 },
    ];
  };

  const getMockProblemStats = () => { // Generate mock problem statistics
    return [
      { problem_title: 'Basic SELECT Query', difficulty: 'beginner', total_attempts: 1, passed: true, attempts_until_pass: 1, total_hints_used: 0, best_time_seconds: 120 },
      { problem_title: 'WHERE Clause Filtering', difficulty: 'beginner', total_attempts: 2, passed: false, attempts_until_pass: null, total_hints_used: 1, best_time_seconds: 180 },
      { problem_title: 'JOIN Multiple Tables', difficulty: 'intermediate', total_attempts: 3, passed: true, attempts_until_pass: 3, total_hints_used: 2, best_time_seconds: 300 },
      { problem_title: 'GROUP BY Aggregation', difficulty: 'intermediate', total_attempts: 1, passed: true, attempts_until_pass: 1, total_hints_used: 0, best_time_seconds: 150 },
      { problem_title: 'ORDER BY Sorting', difficulty: 'beginner', total_attempts: 1, passed: true, attempts_until_pass: 1, total_hints_used: 0, best_time_seconds: 90 },
    ];
  };

  const getMockConceptStats = () => { // Generate mock concept statistics
    return [
      { concept: 'SELECT Statement', total_attempts: 5, correct_attempts: 4, accuracy: 80.00, avg_time_seconds: 135.50 },
      { concept: 'WHERE Clause', total_attempts: 3, correct_attempts: 2, accuracy: 66.67, avg_time_seconds: 165.00 },
      { concept: 'JOIN Operations', total_attempts: 4, correct_attempts: 3, accuracy: 75.00, avg_time_seconds: 280.25 },
      { concept: 'GROUP BY Aggregation', total_attempts: 2, correct_attempts: 2, accuracy: 100.00, avg_time_seconds: 145.00 },
      { concept: 'ORDER BY Sorting', total_attempts: 3, correct_attempts: 3, accuracy: 100.00, avg_time_seconds: 95.00 },
    ];
  };

  const formatTime = (seconds) => { // Format seconds to readable time string
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateOverallStats = () => { // Calculate overall user statistics
    const totalSubmissions = submissions.length;
    const correctSubmissions = submissions.filter(s => s.is_correct).length;
    const totalProblems = problemStats.length;
    const solvedProblems = problemStats.filter(p => p.passed).length;
    const accuracy = totalSubmissions > 0 ? ((correctSubmissions / totalSubmissions) * 100).toFixed(1) : 0;
    
    return { totalSubmissions, correctSubmissions, totalProblems, solvedProblems, accuracy };
  };

  const stats = calculateOverallStats();

  if (loading) { // Show loading state
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={user?.avatar || `${USER_CONFIG.DEFAULT_AVATAR}${user?.username}`}
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg ring-2 ring-gray-100"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <Trophy className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{user?.username || 'Guest'}</h2>
              <p className="text-gray-600 mb-2">{user?.email || ''}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Member since {user?.created_at || '2025-10-01'}</span>
              </div>
            </div>
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.solvedProblems}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.accuracy}%
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl shadow-sm p-5 border border-blue-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Total Submissions</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-xl shadow-sm p-5 border border-green-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Correct</p>
                <p className="text-3xl font-bold text-green-900">{stats.correctSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl shadow-sm p-5 border border-purple-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Problems</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalProblems}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-100/50 rounded-xl shadow-sm p-5 border border-orange-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-orange-900">{stats.accuracy}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: Target },
                { key: 'submissions', label: 'Submissions', icon: Zap },
                { key: 'stats', label: 'Statistics', icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Concept Mastery */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-blue-600" />
                    Concept Mastery
                  </h3>
                  <div className="space-y-4">
                    {conceptStats.slice(0, 5).map((concept, index) => (
                      <div key={index} className="group hover:bg-gray-50 p-4 rounded-xl transition-colors duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-800">{concept.concept}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">{concept.correct_attempts}/{concept.total_attempts}</span>
                            <span className="text-sm font-bold text-blue-600">{concept.accuracy.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${concept.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Submissions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-2 text-blue-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {submissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-100">
                        <div className="flex items-center space-x-4">
                          {submission.is_correct ? (
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                          )}
                          <span className="text-sm font-semibold text-gray-800">{submission.problem_title}</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="font-medium">{formatTime(submission.time_spent_seconds)}</span>
                          <span>{submission.submitted_at}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Submission History</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Problem</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hints</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{submission.problem_title}</td>
                          <td className="px-6 py-4">
                            {submission.is_correct ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{submission.hints_used}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">{formatTime(submission.time_spent_seconds)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{submission.submitted_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8">
                {/* Problem Statistics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Problem Statistics</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Problem</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Difficulty</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Attempts</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Solved In</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Best Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {problemStats.map((problem, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{problem.problem_title}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${DIFFICULTY_COLORS[problem.difficulty] || 'text-gray-600 bg-gray-50'}`}>
                                {DIFFICULTY_LABELS[problem.difficulty] || problem.difficulty}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">{problem.total_attempts}</td>
                            <td className="px-6 py-4">
                              {problem.passed ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {problem.attempts_until_pass ? `${problem.attempts_until_pass} attempts` : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                              {formatTime(problem.best_time_seconds)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Concept Statistics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Concept Performance</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Concept</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Correct</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Accuracy</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Avg Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {conceptStats.map((concept, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{concept.concept}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{concept.total_attempts}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{concept.correct_attempts}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-bold text-gray-900 min-w-[45px]">
                                  {concept.accuracy.toFixed(1)}%
                                </span>
                                <div className="flex-1 min-w-[100px] bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${concept.accuracy}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                              {formatTime(Math.round(concept.avg_time_seconds))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
