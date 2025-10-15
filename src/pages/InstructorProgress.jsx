import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInstructorAuth } from '../context/InstructorAuthContext';

export default function InstructorProgress() {
  const { isAuthenticated, isLoading } = useInstructorAuth();
  const [studentData, setStudentData] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [contentCategories, setContentCategories] = useState({});
  const [roomElements, setRoomElements] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = () => {
    try {
      // Load student progress data
      const savedStudentData = localStorage.getItem('instructor-student-data');
      if (savedStudentData) {
        const data = JSON.parse(savedStudentData);
        setStudentData(data);
        generateProgressSummary(data);
      }

      // Load content categories for feedback analysis
      const savedCategories = localStorage.getItem('instructor-content-categories');
      if (savedCategories) {
        setContentCategories(JSON.parse(savedCategories));
      }

      // Load room elements for question mapping
      const savedElements = localStorage.getItem('instructor-room-elements');
      if (savedElements) {
        setRoomElements(JSON.parse(savedElements));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateProgressSummary = (data) => {
    const summaryMap = new Map();
    
    data.forEach(record => {
      const key = `${record.sessionId}_${record.name}`;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          sessionId: record.sessionId,
          name: record.name,
          semester: record.semester,
          year: record.year,
          groupNumber: record.groupNumber,
          startTime: record.timestamp,
          lastActivity: record.timestamp,
          questionsAnswered: 0,
          questionsCorrect: 0,
          incorrectAnswers: [],
          rooms: new Set(),
          completed: false,
          timeSpent: 0,
          contentAreasStruggling: new Set(),
          contentAreasStrong: new Set()
        });
      }
      
      const summary = summaryMap.get(key);
      summary.lastActivity = record.timestamp;
      summary.questionsAnswered++;
      
      if (record.isCorrect) {
        summary.questionsCorrect++;
        // Track strong content areas
        const elementId = record.questionId.split('_')[0];
        const element = roomElements[elementId];
        if (element?.contentCategory && contentCategories[element.contentCategory]) {
          summary.contentAreasStrong.add(element.contentCategory);
        }
      } else {
        summary.incorrectAnswers.push({
          questionId: record.questionId,
          roomId: record.roomId,
          studentAnswer: record.answer,
          timestamp: record.timestamp,
          attemptNumber: record.attemptNumber
        });
        
        // Track struggling content areas
        const elementId = record.questionId.split('_')[0];
        const element = roomElements[elementId];
        if (element?.contentCategory && contentCategories[element.contentCategory]) {
          summary.contentAreasStruggling.add(element.contentCategory);
        }
      }
      
      summary.rooms.add(record.roomId);
      
      // Check completion status
      if (record.roomId === 'lab' && record.questionId === 'final_question' && record.isCorrect) {
        summary.completed = true;
      }
    });
    
    // Calculate time spent and convert Sets to Arrays
    const progressArray = Array.from(summaryMap.values()).map(summary => {
      const startTime = new Date(summary.startTime);
      const endTime = new Date(summary.lastActivity);
      summary.timeSpent = Math.round((endTime - startTime) / (1000 * 60)); // minutes
      
      return {
        ...summary,
        rooms: Array.from(summary.rooms),
        contentAreasStruggling: Array.from(summary.contentAreasStruggling),
        contentAreasStrong: Array.from(summary.contentAreasStrong),
        accuracyRate: summary.questionsAnswered > 0 ? 
          Math.round((summary.questionsCorrect / summary.questionsAnswered) * 100) : 0
      };
    });
    
    setStudentProgress(progressArray);
  };

  const getFilteredAndSortedData = () => {
    let filtered = studentProgress;
    
    // Apply group filter
    if (filterGroup !== 'all') {
      filtered = filtered.filter(student => student.groupNumber === parseInt(filterGroup));
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        filtered = filtered.filter(student => student.completed);
      } else if (filterStatus === 'in-progress') {
        filtered = filtered.filter(student => !student.completed && student.questionsAnswered > 0);
      } else if (filterStatus === 'struggling') {
        filtered = filtered.filter(student => student.accuracyRate < 70 && student.questionsAnswered > 2);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'lastActivity' || sortBy === 'startTime') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const exportStudentDataCSV = () => {
    if (studentData.length === 0) {
      alert('No student data to export');
      return;
    }

    const headers = [
      'Student Name', 'Group', 'Semester', 'Year', 'Room', 'Question ID', 'Question Element',
      'Answer Given', 'Correct', 'Attempt Number', 'Timestamp', 'Session ID'
    ];
    
    const csvData = [
      headers.join(','),
      ...studentData.map(record => {
        const elementId = record.questionId.split('_')[0];
        const elementName = roomElements[elementId]?.name || 'Unknown';
        
        return [
          `"${record.name}"`,
          record.groupNumber,
          record.semester,
          record.year,
          record.roomId,
          record.questionId,
          `"${elementName}"`,
          `"${record.answer}"`,
          record.isCorrect,
          record.attemptNumber,
          record.timestamp,
          record.sessionId
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microbiology-lab-student-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportProgressSummaryCSV = () => {
    if (studentProgress.length === 0) {
      alert('No progress data to export');
      return;
    }

    const headers = [
      'Student Name', 'Group', 'Semester', 'Year', 'Questions Answered', 'Questions Correct',
      'Accuracy Rate', 'Time Spent (min)', 'Completed', 'Start Time', 'Last Activity',
      'Struggling Areas', 'Strong Areas'
    ];
    
    const csvData = [
      headers.join(','),
      ...studentProgress.map(student => [
        `"${student.name}"`,
        student.groupNumber,
        student.semester,
        student.year,
        student.questionsAnswered,
        student.questionsCorrect,
        student.accuracyRate,
        student.timeSpent,
        student.completed,
        student.startTime,
        student.lastActivity,
        `"${student.contentAreasStruggling.map(id => contentCategories[id]?.name || id).join('; ')}"`,
        `"${student.contentAreasStrong.map(id => contentCategories[id]?.name || id).join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microbiology-lab-progress-summary-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearStudentData = () => {
    if (confirm('Are you sure you want to clear all student progress data? This cannot be undone.')) {
      localStorage.removeItem('instructor-student-data');
      setStudentData([]);
      setStudentProgress([]);
    }
  };

  const showStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const getPerformanceBadge = (accuracyRate, questionsAnswered) => {
    if (questionsAnswered === 0) return { text: 'No Activity', color: 'gray' };
    if (accuracyRate >= 90) return { text: 'Excellent', color: 'green' };
    if (accuracyRate >= 75) return { text: 'Good', color: 'blue' };
    if (accuracyRate >= 60) return { text: 'Fair', color: 'yellow' };
    return { text: 'Struggling', color: 'red' };
  };

  const getStatusBadge = (student) => {
    if (student.completed) return { text: 'Completed', color: 'green' };
    if (student.questionsAnswered === 0) return { text: 'Not Started', color: 'gray' };
    return { text: 'In Progress', color: 'blue' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in through the instructor dashboard to access this page.</p>
          <Link
            to="/instructor"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredAndSortedData();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                📈 Student Progress Analytics
              </h1>
              <p className="text-gray-600">Monitor student performance and learning outcomes</p>
            </div>
            
            <div className="flex gap-3">
              <Link
                to="/instructor"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                ← Dashboard
              </Link>
              
              <button
                onClick={exportProgressSummaryCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                📊 Export Summary
              </button>
              
              <button
                onClick={exportStudentDataCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                📋 Export Raw Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-blue-800">Total Students</h3>
            <p className="text-2xl font-bold text-blue-600">{studentProgress.length}</p>
            <p className="text-sm text-blue-600">Unique participants</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-green-800">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {studentProgress.filter(s => s.completed).length}
            </p>
            <p className="text-sm text-green-600">Finished the lab</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-yellow-800">Average Accuracy</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {studentProgress.length > 0 
                ? Math.round(studentProgress.reduce((sum, s) => sum + s.accuracyRate, 0) / studentProgress.length)
                : 0}%
            </p>
            <p className="text-sm text-yellow-600">Class performance</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-purple-800">Total Questions</h3>
            <p className="text-2xl font-bold text-purple-600">
              {studentData.length}
            </p>
            <p className="text-sm text-purple-600">Answers recorded</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Filters & Sorting</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Group
              </label>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Groups</option>
                {[...Array(15)].map((_, i) => (
                  <option key={i+1} value={i+1}>Group {i+1}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Students</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="struggling">Struggling (&lt;70%)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lastActivity">Last Activity</option>
                <option value="name">Student Name</option>
                <option value="groupNumber">Group Number</option>
                <option value="accuracyRate">Accuracy Rate</option>
                <option value="questionsAnswered">Questions Answered</option>
                <option value="timeSpent">Time Spent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Progress Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Student Progress ({filteredData.length} students)
              </h2>
              
              <div className="flex gap-2">
                <button
                  onClick={clearStudentData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"
                >
                  🗑️ Clear All Data
                </button>
              </div>
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📊</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No Student Data</h3>
              <p className="text-gray-500">
                Student progress will appear here once they start using the laboratory system.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((student, index) => {
                    const performanceBadge = getPerformanceBadge(student.accuracyRate, student.questionsAnswered);
                    const statusBadge = getStatusBadge(student);
                    
                    return (
                      <tr key={index} className={student.completed ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.semester} {student.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.groupNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.questionsCorrect}/{student.questionsAnswered} correct
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            performanceBadge.color === 'green' ? 'bg-green-100 text-green-800' :
                            performanceBadge.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            performanceBadge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            performanceBadge.color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {student.accuracyRate}% - {performanceBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.timeSpent} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusBadge.color === 'green' ? 'bg-green-100 text-green-800' :
                            statusBadge.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => showStudentDetails(student)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal - continues with same code as before... */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-blue-100">
                    Group {selectedStudent.groupNumber} • {selectedStudent.semester} {selectedStudent.year}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-gray-300 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedStudent.accuracyRate}%</div>
                  <div className="text-sm text-blue-800">Accuracy Rate</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedStudent.questionsAnswered}</div>
                  <div className="text-sm text-green-800">Questions Answered</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedStudent.timeSpent}</div>
                  <div className="text-sm text-purple-800">Minutes Spent</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{selectedStudent.rooms.length}</div>
                  <div className="text-sm text-yellow-800">Rooms Visited</div>
                </div>
              </div>

              {/* Content Areas Analysis */}
              {(selectedStudent.contentAreasStruggling.length > 0 || selectedStudent.contentAreasStrong.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Content Area Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {selectedStudent.contentAreasStrong.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Strong Areas</h4>
                        <ul className="text-green-700 text-sm space-y-1">
                          {selectedStudent.contentAreasStrong.map(categoryId => (
                            <li key={categoryId}>
                              • {contentCategories[categoryId]?.name || categoryId}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedStudent.contentAreasStruggling.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2">Areas for Improvement</h4>
                        <ul className="text-red-700 text-sm space-y-1">
                          {selectedStudent.contentAreasStruggling.map(categoryId => (
                            <li key={categoryId}>
                              • {contentCategories[categoryId]?.name || categoryId}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Incorrect Answers Detail */}
              {selectedStudent.incorrectAnswers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Incorrect Answers ({selectedStudent.incorrectAnswers.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                      {selectedStudent.incorrectAnswers.map((answer, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium text-gray-800">
                              {answer.roomId === 'lab' ? 'Laboratory' : answer.roomId} - {answer.questionId}
                            </div>
                            <div className="text-xs text-gray-500">
                              Attempt #{answer.attemptNumber}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Answer given: "{answer.studentAnswer}"
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(answer.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Session Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Session Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Start Time:</strong> {new Date(selectedStudent.startTime).toLocaleString()}
                  </div>
                  <div>
                    <strong>Last Activity:</strong> {new Date(selectedStudent.lastActivity).toLocaleString()}
                  </div>
                  <div>
                    <strong>Session ID:</strong> {selectedStudent.sessionId}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedStudent.completed ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
