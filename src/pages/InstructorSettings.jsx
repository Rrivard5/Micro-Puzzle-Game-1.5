import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInstructorAuth } from '../context/InstructorAuthContext';

export default function InstructorSettings() {
  const { isAuthenticated, isLoading } = useInstructorAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Word scramble settings
  const [wordSettings, setWordSettings] = useState({
    targetWord: 'MICROBIOLOGY',
    numGroups: 15,
    groupLetters: {}
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadAllSettings();
    }
  }, [isAuthenticated]);

  const loadAllSettings = () => {
    try {
      // Load word settings
      const savedWordSettings = localStorage.getItem('instructor-word-settings');
      if (savedWordSettings) {
        setWordSettings(JSON.parse(savedWordSettings));
      } else {
        setDefaultWordSettings();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setDefaultWordSettings = () => {
    const defaultSettings = {
      targetWord: 'MICROBIOLOGY',
      numGroups: 15,
      groupLetters: {}
    };
    assignLettersToGroups(defaultSettings, 'MICROBIOLOGY', 15);
    setWordSettings(defaultSettings);
  };

  const assignLettersToGroups = (settings, word, numGroups) => {
    if (!word || numGroups < 1) return;
    
    const letters = word.toUpperCase().split('');
    const newGroupLetters = {};
    
    // Create expanded array by repeating letters
    const expandedLetters = [];
    for (let i = 0; i < numGroups; i++) {
      expandedLetters.push(letters[i % letters.length]);
    }
    
    // Shuffle the letters
    const shuffledLetters = [...expandedLetters];
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
    }
    
    // Assign to groups
    for (let i = 1; i <= numGroups; i++) {
      newGroupLetters[i] = shuffledLetters[i - 1];
    }
    
    settings.groupLetters = newGroupLetters;
  };

  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('instructor-word-settings', JSON.stringify(wordSettings));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Word scramble functions
  const updateWordSettings = (field, value) => {
    const newSettings = { ...wordSettings, [field]: value };
    
    if (field === 'targetWord' || field === 'numGroups') {
      assignLettersToGroups(newSettings, newSettings.targetWord, newSettings.numGroups);
    }
    
    setWordSettings(newSettings);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ⚙️ Game Settings Configuration
              </h1>
              <p className="text-gray-600">Configure word scramble challenge</p>
            </div>
            
            <div className="flex gap-3">
              <Link
                to="/instructor"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                ← Dashboard
              </Link>
              
              <button
                onClick={saveAllSettings}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSaving ? 'Saving...' : '💾 Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Word Scramble Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🧩 Word Scramble Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Word (Solution)
                </label>
                <input
                  type="text"
                  value={wordSettings.targetWord}
                  onChange={(e) => updateWordSettings('targetWord', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the target word..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is the word students will need to unscramble
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Student Groups
                </label>
                <input
                  type="number"
                  value={wordSettings.numGroups}
                  onChange={(e) => updateWordSettings('numGroups', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="50"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Each group will receive one letter when they complete the laboratory
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">Letter Assignments Preview</h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {Object.entries(wordSettings.groupLetters).map(([group, letter]) => (
                    <div key={group} className="bg-white border border-blue-300 rounded p-2 text-center">
                      <div className="text-xs text-gray-600">Group {group}</div>
                      <div className="text-lg font-bold text-blue-600">{letter}</div>
                    </div>
                  ))}
                </div>
                <p className="text-blue-600 text-sm mt-2">
                  Letters are automatically distributed and shuffled among groups
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">💡 How It Works</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Each group completes the laboratory to earn their assigned letter</li>
                  <li>• Letters from the target word are distributed among all groups</li>
                  <li>• If there are more groups than letters, letters are repeated</li>
                  <li>• Students work together to unscramble the final word</li>
                  <li>• Change the target word or number of groups to regenerate assignments</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-bold text-purple-800 mb-3">📌 Additional Settings Locations</h3>
            <div className="space-y-2 text-purple-700">
              <p>• <strong>PPE Questions & Final Questions:</strong> Configure these in the <Link to="/instructor/rooms" className="text-purple-600 underline font-semibold">Room Setup</Link> page under "Group Questions" for each group</p>
              <p>• <strong>Room Elements & Interactive Areas:</strong> Set up in the <Link to="/instructor/rooms" className="text-purple-600 underline font-semibold">Room Setup</Link> page</p>
              <p>• <strong>Student Progress:</strong> View in the <Link to="/instructor/progress" className="text-purple-600 underline font-semibold">Student Progress</Link> page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
