import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Search, Filter, Download, RefreshCw, TrendingUp, Users, BookOpen, Award } from 'lucide-react';

const AdminPage = ({ darkMode }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ type: 'all', userId: '' });
  const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const EVAL_SERVICE = 'http://localhost:4000';

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: pagination.offset,
        ...(filter.type !== 'all' && { type: filter.type }),
        ...(filter.userId && { userId: filter.userId })
      });

      console.log('🔍 Fetching from:', `${EVAL_SERVICE}/api/evaluations/history?${params}`);

      const response = await fetch(`${EVAL_SERVICE}/api/evaluations/history?${params}`);
      const data = await response.json();
      
      console.log('📊 Full API Response:', data);
      console.log('📊 First evaluation object (if exists):', data.history?.[0]);
      
      if (data.history && data.history[0]) {
        console.log('📊 Available fields:', Object.keys(data.history[0]));
      }
      
      if (data.history !== undefined) {
        setEvaluations(data.history || []);
      } else {
        console.error('Unexpected response format:', data);
      }
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      console.log('📊 Fetching statistics from:', `${EVAL_SERVICE}/api/statistics`);
      
      const response = await fetch(`${EVAL_SERVICE}/api/statistics`);
      const data = await response.json();
      
      console.log('📈 Statistics:', data);
      
      if (data.statistics !== undefined) {
        setStatistics(data.statistics);
      } else {
        console.error('Unexpected statistics format:', data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const deleteEvaluation = async (evaluation) => {
    console.log('🗑️ Deleting evaluation:', evaluation);
    
    const id = evaluation._id || evaluation.id || evaluation.evaluationId;
    
    if (!id) {
      console.error('❌ No ID found in evaluation object:', evaluation);
      alert('Error: Evaluation has no ID');
      return;
    }

    if (!confirm(`Are you sure you want to delete this ${evaluation.type} evaluation?`)) return;

    try {
      console.log('🗑️ Deleting evaluation ID:', id);
      
      const response = await fetch(`${EVAL_SERVICE}/api/evaluations/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Deleted successfully:', data);
        alert('✅ Evaluation deleted successfully!');
        fetchEvaluations();
        fetchStatistics();
      } else {
        console.error('❌ Delete failed:', data);
        alert('❌ Failed to delete: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('❌ Failed to delete evaluation. Check console for details.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvaluations();
    }, 300);

    return () => clearTimeout(timer);
  }, [filter, pagination]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div className={`min-h-screen p-8 ${
      darkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            📊 Evaluation Dashboard
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage and analyze student evaluations
          </p>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Total Evaluations"
              value={statistics.totalEvaluations || 0}
              color="from-blue-500 to-cyan-500"
              darkMode={darkMode}
            />
            <StatCard
              icon={<Award className="w-8 h-8" />}
              title="Average Score"
              value={`${statistics.avgScore?.toFixed(1) || 0}%`}
              color="from-green-500 to-emerald-500"
              darkMode={darkMode}
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              title="Grammar Checks"
              value={statistics.totalGrammarChecks || 0}
              color="from-purple-500 to-pink-500"
              darkMode={darkMode}
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Story Evaluations"
              value={statistics.totalStoryEvaluations || 0}
              color="from-orange-500 to-red-500"
              darkMode={darkMode}
            />
          </div>
        )}

        <div className={`rounded-2xl shadow-lg p-6 mb-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className={`px-4 py-2 border-2 rounded-xl focus:outline-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                }`}
              >
                <option value="all">All Types</option>
                <option value="grammar">Grammar</option>
                <option value="story">Story</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Search className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by User ID..."
                value={filter.userId}
                onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
                className={`flex-1 px-4 py-2 border-2 rounded-xl focus:outline-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <button
              onClick={fetchEvaluations}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Loading evaluations...
              </p>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className={`text-lg mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No evaluations found
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or use Grammar Checker/Story Evaluator to create data!
              </p>
              <button
                onClick={() => setFilter({ type: 'all', userId: '' })}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">User ID</th>
                      <th className="px-6 py-4 text-left">Type</th>
                      <th className="px-6 py-4 text-left">Score</th>
                      <th className="px-6 py-4 text-left">Words</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((evaluation, index) => (
                      <tr
                        key={evaluation._id || evaluation.id || `eval-${index}`}
                        className={`border-b transition-colors ${
                          darkMode
                            ? 'hover:bg-gray-700 border-gray-700'
                            : 'hover:bg-purple-50 border-gray-200'
                        } ${
                          index % 2 === 0 
                            ? darkMode ? 'bg-gray-800' : 'bg-white' 
                            : darkMode ? 'bg-gray-750' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {evaluation.userId?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className={`font-medium ${
                              darkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {evaluation.userId || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            evaluation.type === 'grammar'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {evaluation.type === 'grammar' ? '✏️ Grammar' : '📚 Story'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 rounded-full h-2 max-w-[100px] ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                style={{ width: `${evaluation.score || 0}%` }}
                              />
                            </div>
                            <span className={`font-bold ${
                              darkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {(evaluation.score || 0).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {evaluation.statistics?.wordCount || 0} words
                        </td>
                        <td className={`px-6 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString() : 'N/A'} <br />
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleTimeString() : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedEvaluation(evaluation)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-blue-900/30' 
                                  : 'hover:bg-blue-100'
                              }`}
                              title="View details"
                            >
                              <Eye className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteEvaluation(evaluation)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-red-900/30' 
                                  : 'hover:bg-red-100'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`flex items-center justify-between px-6 py-4 border-t ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <button
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    offset: Math.max(0, prev.offset - prev.limit) 
                  }))}
                  disabled={pagination.offset === 0}
                  className={`px-4 py-2 border-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 hover:border-purple-500'
                  }`}
                >
                  Previous
                </button>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Showing {pagination.offset + 1} - {pagination.offset + evaluations.length}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    offset: prev.offset + prev.limit 
                  }))}
                  disabled={evaluations.length < pagination.limit}
                  className={`px-4 py-2 border-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 hover:border-purple-500'
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {selectedEvaluation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvaluation(null)}>
            <div 
              className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  📋 Evaluation Details
                </h2>
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <DetailRow 
                  label="User ID" 
                  value={selectedEvaluation.userId || 'Unknown'} 
                  darkMode={darkMode}
                />
                <DetailRow 
                  label="Type" 
                  value={selectedEvaluation.type || 'Unknown'} 
                  darkMode={darkMode}
                />
                <DetailRow 
                  label="Score" 
                  value={`${selectedEvaluation.score?.toFixed(1) || 0}%`} 
                  darkMode={darkMode}
                />
                <DetailRow 
                  label="Created At" 
                  value={selectedEvaluation.createdAt ? new Date(selectedEvaluation.createdAt).toLocaleString() : 'N/A'} 
                  darkMode={darkMode}
                />
                
                <div className={`pt-4 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Original Text:
                  </h3>
                  <div className={`p-4 rounded-xl whitespace-pre-wrap max-h-60 overflow-y-auto ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-200' 
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    {selectedEvaluation.originalText || 'No text available'}
                  </div>
                </div>

                {selectedEvaluation.statistics && (
                  <div className={`pt-4 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h3 className={`font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Statistics:
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">Word Count</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedEvaluation.statistics.wordCount || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm text-gray-600">Errors Found</div>
                        <div className="text-2xl font-bold text-red-600">
                          {selectedEvaluation.statistics.errorsFound || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvaluation.feedback && (
                  <div className={`pt-4 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h3 className={`font-bold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Feedback:
                    </h3>
                    <div className={`p-4 rounded-xl ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-200' 
                        : 'bg-green-50 text-gray-700'
                    }`}>
                      {selectedEvaluation.feedback}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, darkMode }) => (
  <div className={`rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
    darkMode ? 'bg-gray-800' : 'bg-white'
  }`}>
    <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <div className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {title}
    </div>
    <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {value}
    </div>
  </div>
);

const DetailRow = ({ label, value, darkMode }) => (
  <div className={`flex items-center justify-between py-2 border-b ${
    darkMode ? 'border-gray-700' : 'border-gray-200'
  }`}>
    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {label}:
    </span>
    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
);

export default AdminPage;