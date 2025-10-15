import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    roomImages: 0,
    roomElements: 0,
    contentCategories: 0,
    studentGroups: 0,
    activeStudents: 0,
    questionsConfigured: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardStats();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === 'microbiology2024') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const loadDashboardStats = () => {
    try {
      // Load room images
      const roomImages = JSON.parse(localStorage.getItem('instructor-room-images') || '{}');
      
      // Load room elements
      const roomElements = JSON.parse(localStorage.getItem('instructor-room-elements') || '{}');
      
      // Load content categories
      const contentCategories = JSON.parse(localStorage.getItem('instructor-content-categories') || '{}');
      
      // Load word settings for student groups
      const wordSettings = JSON.parse(localStorage.getItem('instructor-word-settings') || '{"numGroups": 15}');
      
      // Load student progress data
      const studentData = JSON.parse(localStorage.getItem('instructor-student-data') || '[]');
      const uniqueStudents = new Set(studentData.map(record => `${record.sessionId}_${record.name}`)).size;
      
      // Count configured questions
      const questionsCount = Object.values(roomElements).reduce((count, element) => {
        if (element.interactionType === 'question' && element.content?.question?.groups) {
          return count + Object.keys(element.content.question.groups).length;
        }
        return count;
      }, 0);

      setDashboardStats({
        roomImages: Object.keys(roomImages).length,
        roomElements: Object.keys(roomElements).length,
        contentCategories: Object.keys(contentCategories).length,
        studentGroups: wordSettings.numGroups || 15,
        activeStudents: uniqueStudents,
        questionsConfigured: questionsCount
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const exportAllSettings = () => {
    try {
      const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        settings: {
          roomImages: JSON.parse(localStorage.getItem('instructor-room-images') || '{}'),
          roomElements: JSON.parse(localStorage.getItem('instructor-room-elements') || '{}'),
          contentCategories: JSON.parse(localStorage.getItem('instructor-content-categories') || '{}'),
          wordSettings: JSON.parse(localStorage.getItem('instructor-word-settings') || '{}'),
          gameSettings: JSON.parse(localStorage.getItem('instructor-game-settings') || '{}'),
          ppeSettings: JSON.parse(localStorage.getItem('instructor-ppe-questions') || '{}'),
          finalQuestionSettings: JSON.parse(localStorage.getItem('instructor-final-questions') || '{}'),
          feedbackSettings: JSON.parse(localStorage.getItem('instructor-feedback-settings') || '{}')
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microbiology-lab-complete-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Complete settings exported successfully!');
    } catch (error) {
      console.error('Error exporting settings:', error);
      alert('Error exporting settings. Please try again.');
    }
  };

  const clearAllData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL instructor settings and student data. This cannot be undone. Are you absolutely sure?')) {
      if (confirm('Last chance! This will permanently delete everything. Continue?')) {
        // Clear all instructor data
        const instructorKeys = [
          'instructor-room-images',
          'instructor-room-elements', 
          'instructor-content-categories',
          'instructor-word-settings',
          'instructor-game-settings',
          'instructor-ppe-questions',
          'instructor-final-questions',
          'instructor-feedback-settings',
          'instructor-student-data'
        ];
        
        instructorKeys.forEach(key => localStorage.removeItem(key));
        
        // Refresh stats
        loadDashboardStats();
        
        alert('✅ All instructor data has been cleared.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🧪</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Instructor Portal
            </h1>
            <p className="text-gray-600">
              Microbiology Lab Escape Room
            </p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter instructor password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
            >
              Access Portal
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to Student Interface
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🧪 Microbiology Lab Instructor Portal
              </h1>
              <p className="text-gray-600">Manage your interactive laboratory escape room</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportAllSettings}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                📥 Export All Settings
              </button>
              
              <Link
                to="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                👀 View Student Interface
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-blue-800">Room Images</h3>
            <p className="text-2xl font-bold text-blue-600">{dashboardStats.roomImages}</p>
            <p className="text-sm text-blue-600">Walls configured</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-green-800">Interactive Elements</h3>
            <p className="text-2xl font-bold text-green-600">{dashboardStats.roomElements}</p>
            <p className="text-sm text-green-600">Clickable items</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-purple-800">Content Categories</h3>
            <p className="text-2xl font-bold text-purple-600">{dashboardStats.contentCategories}</p>
            <p className="text-sm text-purple-600">Feedback topics</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-yellow-800">Student Groups</h3>
            <p className="text-2xl font-bold text-yellow-600">{dashboardStats.studentGroups}</p>
            <p className="text-sm text-yellow-600">Configured groups</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-red-800">Active Students</h3>
            <p className="text-2xl font-bold text-red-600">{dashboardStats.activeStudents}</p>
            <p className="text-sm text-red-600">Tracked sessions</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-indigo-800">Questions</h3>
            <p className="text-2xl font-bold text-indigo-600">{dashboardStats.questionsConfigured}</p>
            <p className="text-sm text-indigo-600">Group questions</p>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Room Setup */}
          <Link
            to="/instructor/rooms"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">🏗️</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Room Setup</h3>
                <p className="text-gray-600">Configure lab layout & questions</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              • Upload room images<br/>
              • Define interactive elements<br/>
              • Create group-specific questions<br/>
              • Manage content categories & feedback
            </div>
            <div className="mt-4 text-blue-600 font-semibold">
              Configure Laboratory →
            </div>
          </Link>

          {/* Student Progress */}
          <Link
            to="/instructor/progress"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-green-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">📈</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Student Progress</h3>
                <p className="text-gray-600">Track student performance</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              • View student attempts & scores<br/>
              • Export performance data<br/>
              • Generate progress reports<br/>
              • Monitor completion rates
            </div>
            <div className="mt-4 text-green-600 font-semibold">
              View Analytics →
            </div>
          </Link>

          {/* Game Settings */}
          <Link
            to="/instructor/settings"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-purple-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">⚙️</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Game Settings</h3>
                <p className="text-gray-600">Configure gameplay mechanics</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              • Word scramble configuration<br/>
              • Final question setup<br/>
              • PPE room questions<br/>
              • Completion requirements
            </div>
            <div className="mt-4 text-purple-600 font-semibold">
              Manage Settings →
            </div>
          </Link>

          {/* Content Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">📚</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Content Library</h3>
                <p className="text-gray-600">Manage educational content</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              • Pre-built question templates<br/>
              • Microbiology image library<br/>
              • Feedback message templates<br/>
              • Learning objective alignment
            </div>
            <div className="mt-4 text-yellow-600 font-semibold">
              Coming Soon
            </div>
          </div>

          {/* Class Management */}
          <Link
            to="/word-scramble"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-indigo-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">🧩</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Word Scramble</h3>
                <p className="text-gray-600">Monitor class collaboration</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              • View completed groups<br/>
              • Track letter collection<br/>
              • Monitor solution attempts<br/>
              • Class progress overview
            </div>
            <div className="mt-4 text-indigo-600 font-semibold">
              View Class Progress →
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">🔧</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
                <p className="text-gray-600">Common instructor tasks</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={exportAllSettings}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-all"
              >
                📥 Export All Settings
              </button>
              <button
                onClick={() => window.open('/debug', '_blank')}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-all"
              >
                🐛 Debug Interface
              </button>
              <button
                onClick={clearAllData}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-all"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {dashboardStats.activeStudents > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 System Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{dashboardStats.activeStudents}</div>
                <div className="text-sm text-gray-600">Students have used the system</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{dashboardStats.questionsConfigured}</div>
                <div className="text-sm text-gray-600">Questions configured across all groups</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{dashboardStats.roomElements}</div>
                <div className="text-sm text-gray-600">Interactive elements in laboratory</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">💡 Quick Start Guide</h3>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. <strong>Room Setup:</strong> Upload laboratory images and define interactive areas</li>
                <li>2. <strong>Content Creation:</strong> Create questions and assign them to content categories</li>
                <li>3. <strong>Game Settings:</strong> Configure word scramble and final questions</li>
                <li>4. <strong>Testing:</strong> Use the debug interface to test student experience</li>
                <li>5. <strong>Monitoring:</strong> Track student progress during class sessions</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Microbiology Lab Escape Room - Instructor Portal v2.0</p>
          <p className="mt-1">
            <span className="mx-2">•</span>
            Password: microbiology2024
            <span className="mx-2">•</span>
            <Link to="/debug" className="hover:text-blue-600 underline">Debug Interface</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
