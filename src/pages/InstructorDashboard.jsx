import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInstructorAuth } from '../context/InstructorAuthContext';
import { migrateExistingData } from '../utils/dataMigration';

export default function InstructorDashboard() {
  const { isAuthenticated, isLoading, login, logout } = useInstructorAuth();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  
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
      // Run migration first
      runMigration();
      loadDashboardStats();
    }
  }, [isAuthenticated]);

  const runMigration = async () => {
    const migrationDone = localStorage.getItem('data-migration-v2-complete');
    if (!migrationDone) {
      setIsMigrating(true);
      setMigrationStatus('Migrating existing data to new storage system...');
      
      const success = await migrateExistingData();
      
      if (success) {
        setMigrationStatus('✅ Migration complete! Your data has been optimized.');
        setTimeout(() => {
          setIsMigrating(false);
          setMigrationStatus('');
        }, 3000);
      } else {
        setMigrationStatus('⚠️ Migration had some issues but you can continue.');
        setTimeout(() => {
          setIsMigrating(false);
          setMigrationStatus('');
        }, 3000);
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout from the instructor portal?')) {
      logout();
      navigate('/');
    }
  };

  const loadDashboardStats = () => {
    try {
      const roomImages = JSON.parse(localStorage.getItem('instructor-room-images') || '{}');
      const roomElements = JSON.parse(localStorage.getItem('instructor-room-elements') || '{}');
      const contentCategories = JSON.parse(localStorage.getItem('instructor-content-categories') || '{}');
      const wordSettings = JSON.parse(localStorage.getItem('instructor-word-settings') || '{"numGroups": 15}');
      const studentData = JSON.parse(localStorage.getItem('instructor-student-data') || '[]');
      const uniqueStudents = new Set(studentData.map(record => `${record.sessionId}_${record.name}`)).size;
      
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

  const handleSettingsUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON settings file');
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (!importData.settings) {
          throw new Error('Invalid settings file format');
        }

        if (!confirm('This will replace all current settings. Are you sure you want to continue?')) {
          setIsImporting(false);
          event.target.value = '';
          return;
        }

        const settings = importData.settings;
        
        if (settings.roomImages) {
          localStorage.setItem('instructor-room-images', JSON.stringify(settings.roomImages));
        }
        
        if (settings.roomElements) {
          localStorage.setItem('instructor-room-elements', JSON.stringify(settings.roomElements));
        }
        
        if (settings.contentCategories) {
          localStorage.setItem('instructor-content-categories', JSON.stringify(settings.contentCategories));
        }
        
        if (settings.wordSettings) {
          localStorage.setItem('instructor-word-settings', JSON.stringify(settings.wordSettings));
        }
        
        if (settings.gameSettings) {
          localStorage.setItem('instructor-game-settings', JSON.stringify(settings.gameSettings));
        }
        
        if (settings.ppeSettings) {
          localStorage.setItem('instructor-ppe-questions', JSON.stringify(settings.ppeSettings));
        }
        
        if (settings.finalQuestionSettings) {
          localStorage.setItem('instructor-final-questions', JSON.stringify(settings.finalQuestionSettings));
        }
        
        if (settings.feedbackSettings) {
          localStorage.setItem('instructor-feedback-settings', JSON.stringify(settings.feedbackSettings));
        }

        // Reload dashboard stats
        loadDashboardStats();

        alert(`Settings imported successfully! ${importData.exportDate ? `(Exported on ${new Date(importData.exportDate).toLocaleDateString()})` : ''}`);
      } catch (error) {
        console.error('Error importing settings:', error);
        alert('Error importing settings. Please check the file format and try again.');
      } finally {
        setIsImporting(false);
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsImporting(false);
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };

  const triggerSettingsUpload = () => {
    fileInputRef.current?.click();
  };

  const clearAllData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL instructor settings and student data. This cannot be undone. Are you absolutely sure?')) {
      if (confirm('Last chance! This will permanently delete everything. Continue?')) {
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
        
        // Also clear migration flag so it can run again if needed
        localStorage.removeItem('data-migration-v2-complete');
        
        loadDashboardStats();
        
        alert('✅ All instructor data has been cleared.');
      }
    }
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
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError('');
              }}
              placeholder="Enter instructor password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 ${
                loginError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {loginError && (
              <p className="text-red-600 text-sm mb-3">{loginError}</p>
            )}
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
      {/* Hidden file input for settings upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleSettingsUpload}
        className="hidden"
      />

      {/* Migration Status Banner */}
      {isMigrating && (
        <div className="bg-blue-600 text-white p-3 text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            {migrationStatus}
          </div>
        </div>
      )}

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
                📥 Download Settings
              </button>
              
              <button
                onClick={triggerSettingsUpload}
                disabled={isImporting}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isImporting 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isImporting ? 'Uploading...' : '📤 Upload Settings'}
              </button>
              
              <Link
                to="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                👀 View Student Interface
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the dashboard content remains the same... */}
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
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Microbiology Lab Escape Room - Instructor Portal v2.0</p>
        </div>
      </div>
    </div>
  );
}
