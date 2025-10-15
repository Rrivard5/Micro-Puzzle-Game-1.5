import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInstructorAuth } from '../context/InstructorAuthContext';

export default function InstructorSettings() {
  const { isAuthenticated, isLoading } = useInstructorAuth();
  const [activeTab, setActiveTab] = useState('word-scramble');
  const [isSaving, setIsSaving] = useState(false);

  // Word scramble settings
  const [wordSettings, setWordSettings] = useState({
    targetWord: 'MICROBIOLOGY',
    numGroups: 15,
    groupLetters: {}
  });

  // PPE settings
  const [ppeSettings, setPpeSettings] = useState({
    groups: {}
  });

  // Final question settings
  const [finalQuestionSettings, setFinalQuestionSettings] = useState({
    groups: {}
  });

  // Game completion settings
  const [gameSettings, setGameSettings] = useState({
    completionMode: 'all',
    finalElementId: '',
    requireAllElements: true
  });

  const [selectedGroup, setSelectedGroup] = useState(1);

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

      // Load PPE settings
      const savedPPESettings = localStorage.getItem('instructor-ppe-questions');
      if (savedPPESettings) {
        setPpeSettings(JSON.parse(savedPPESettings));
      }

      // Load final question settings
      const savedFinalQuestions = localStorage.getItem('instructor-final-questions');
      if (savedFinalQuestions) {
        setFinalQuestionSettings(JSON.parse(savedFinalQuestions));
      }

      // Load game settings
      const savedGameSettings = localStorage.getItem('instructor-game-settings');
      if (savedGameSettings) {
        setGameSettings(JSON.parse(savedGameSettings));
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
      localStorage.setItem('instructor-ppe-questions', JSON.stringify(ppeSettings));
      localStorage.setItem('instructor-final-questions', JSON.stringify(finalQuestionSettings));
      localStorage.setItem('instructor-game-settings', JSON.stringify(gameSettings));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('All settings saved successfully!');
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

  // PPE question functions
  const updatePPEQuestion = (groupNumber, question) => {
    const updatedSettings = {
      ...ppeSettings,
      groups: {
        ...ppeSettings.groups,
        [groupNumber]: [question]
      }
    };
    setPpeSettings(updatedSettings);
  };

  const addPPEOption = (groupNumber) => {
    const currentQuestion = ppeSettings.groups?.[groupNumber]?.[0] || {};
    const currentOptions = currentQuestion.options || ['Option A', 'Option B'];
    
    const updatedQuestion = {
      ...currentQuestion,
      options: [...currentOptions, `Option ${String.fromCharCode(65 + currentOptions.length)}`]
    };
    
    updatePPEQuestion(groupNumber, updatedQuestion);
  };

  const removePPEOption = (groupNumber, optionIndex) => {
    const currentQuestion = ppeSettings.groups?.[groupNumber]?.[0] || {};
    const currentOptions = currentQuestion.options || [];
    
    if (currentOptions.length <= 2) {
      alert('Questions must have at least 2 options');
      return;
    }
    
    const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
    const updatedQuestion = {
      ...currentQuestion,
      options: newOptions,
      answer: currentQuestion.answer === currentOptions[optionIndex] ? newOptions[0] || '' : currentQuestion.answer
    };
    
    updatePPEQuestion(groupNumber, updatedQuestion);
  };

  // Final question functions
  const updateFinalQuestion = (groupNumber, question) => {
    const updatedSettings = {
      ...finalQuestionSettings,
      groups: {
        ...finalQuestionSettings.groups,
        [groupNumber]: [question]
      }
    };
    setFinalQuestionSettings(updatedSettings);
  };

  const addFinalQuestionOption = (groupNumber) => {
    const currentQuestion = finalQuestionSettings.groups?.[groupNumber]?.[0] || {};
    const currentOptions = currentQuestion.options || ['Option A', 'Option B'];
    
    const updatedQuestion = {
      ...currentQuestion,
      options: [...currentOptions, `Option ${String.fromCharCode(65 + currentOptions.length)}`]
    };
    
    updateFinalQuestion(groupNumber, updatedQuestion);
  };

  const removeFinalQuestionOption = (groupNumber, optionIndex) => {
    const currentQuestion = finalQuestionSettings.groups?.[groupNumber]?.[0] || {};
    const currentOptions = currentQuestion.options || [];
    
    if (currentOptions.length <= 2) {
      alert('Questions must have at least 2 options');
      return;
    }
    
    const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
    
    // Adjust correct answer if needed
    let newCorrectAnswer = currentQuestion.correctAnswer || 0;
    if (newCorrectAnswer >= optionIndex && newCorrectAnswer > 0) {
      newCorrectAnswer = Math.max(0, newCorrectAnswer - 1);
    } else if (newCorrectAnswer >= newOptions.length) {
      newCorrectAnswer = newOptions.length - 1;
    }
    
    const updatedQuestion = {
      ...currentQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    };
    
    updateFinalQuestion(groupNumber, updatedQuestion);
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
              <p className="text-gray-600">Configure gameplay mechanics and questions</p>
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
                {isSaving ? 'Saving...' : '💾 Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'word-scramble', name: '🧩 Word Scramble', desc: 'Target word and group letters' },
              { id: 'ppe-questions', name: '🥽 PPE Questions', desc: 'Safety room questions' },
              { id: 'final-questions', name: '🎯 Final Questions', desc: 'Diagnosis questions' },
              { id: 'completion', name: '🏁 Completion Rules', desc: 'Game completion settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div>{tab.name}</div>
                <div className="text-xs text-gray-400">{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Word Scramble Tab */}
        {activeTab === 'word-scramble' && (
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
          </div>
        )}

        {/* PPE Questions Tab - Continuing with same structure... */}
        {activeTab === 'ppe-questions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🥽 PPE Safety Questions</h2>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Configure Question for Group:
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: wordSettings.numGroups}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Group {num}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-800 mb-2">🔒 PPE Room Access Question</h3>
                <p className="text-red-700 text-sm">
                  Students must answer this safety question correctly to access their PPE locker and proceed to the laboratory.
                </p>
              </div>

              {/* PPE Question configuration fields continue with same structure as original... */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={ppeSettings.groups?.[selectedGroup]?.[0]?.question || ''}
                    onChange={(e) => {
                      const currentQuestion = ppeSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        id: `ppe_g${selectedGroup}`,
                        question: e.target.value,
                        type: currentQuestion.type || 'multiple_choice',
                        options: currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                        answer: currentQuestion.answer || '',
                        hint: currentQuestion.hint || '',
                        randomizeAnswers: currentQuestion.randomizeAnswers || false
                      };
                      updatePPEQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter PPE safety question for this group..."
                  />
                </div>
                
                {/* Continue with rest of PPE configuration... */}
              </div>
            </div>
          </div>
        )}

        {/* Final Questions and Completion tabs continue with same structure... */}
        
      </div>
    </div>
  );
}
