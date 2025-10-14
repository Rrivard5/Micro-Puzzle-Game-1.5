import { useState, useEffect, useRef } from 'react';

export default function InstructorInterface() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Room setup state
  const [roomImages, setRoomImages] = useState({});
  const [selectedWall, setSelectedWall] = useState('north');
  const [roomElements, setRoomElements] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [showElementModal, setShowElementModal] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Word scramble state
  const [wordSettings, setWordSettings] = useState({
    targetWord: '',
    numGroups: 15,
    groupLetters: {}
  });
  
  // Student progress state
  const [studentProgress, setStudentProgress] = useState([]);
  const [studentData, setStudentData] = useState([]);
  
  // Feedback settings
  const [feedbackSettings, setFeedbackSettings] = useState({
    questionFeedback: {},
    generalFeedback: {
      excellent: 'Outstanding work! You demonstrate excellent understanding of microbiology concepts.',
      good: 'Good job! You show solid understanding with room for minor improvements.',
      needs_improvement: 'Consider reviewing the material and practicing more questions.',
      poor: 'Please review the fundamental concepts and seek additional help if needed.'
    }
  });
  
  // Game settings
  const [gameSettings, setGameSettings] = useState({
    completionMode: 'all',
    finalElementId: '',
    finalQuestion: null
  });
  
  // PPE settings
  const [ppeSettings, setPpeSettings] = useState({
    groups: {}
  });
  
  // Final question state
  const [finalQuestionSettings, setFinalQuestionSettings] = useState({
    groups: {}
  });
  
  // Canvas refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const wallOptions = ['north', 'east', 'south', 'west'];
  
  const elementTypes = {
    equipment: 'Lab Equipment',
    furniture: 'Furniture',
    decoration: 'Decorative Items',
    safety: 'Safety Equipment',
    storage: 'Storage Items',
    chemical: 'Chemical Storage',
    glassware: 'Laboratory Glassware',
    instrument: 'Scientific Instruments',
    computer: 'Computer/Electronics',
    document: 'Documents/Posters'
  };
  
  const interactionTypes = {
    none: 'Decorative Only (No Interaction)',
    info: 'Reveal Information Only',
    question: 'Show Question → Reveal Information'
  };
  
  const defaultIcons = {
    equipment: '🔬',
    furniture: '📦',
    decoration: '🎨',
    safety: '⚠️',
    storage: '🗄️',
    chemical: '🧪',
    glassware: '⚗️',
    instrument: '🔧',
    computer: '💻',
    document: '📄'
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
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

  const loadAllData = () => {
    try {
      // Load room images
      const savedImages = localStorage.getItem('instructor-room-images');
      if (savedImages) {
        setRoomImages(JSON.parse(savedImages));
      }
      
      // Load room elements
      const savedElements = localStorage.getItem('instructor-room-elements');
      if (savedElements) {
        setRoomElements(JSON.parse(savedElements));
      }
      
      // Load word settings
      const savedWordSettings = localStorage.getItem('instructor-word-settings');
      if (savedWordSettings) {
        setWordSettings(JSON.parse(savedWordSettings));
      } else {
        setDefaultWordSettings();
      }
      
      // Load game settings
      const savedGameSettings = localStorage.getItem('instructor-game-settings');
      if (savedGameSettings) {
        setGameSettings(JSON.parse(savedGameSettings));
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
      
      // Load feedback settings
      const savedFeedbackSettings = localStorage.getItem('instructor-feedback-settings');
      if (savedFeedbackSettings) {
        setFeedbackSettings(JSON.parse(savedFeedbackSettings));
      }
      
      // Load student progress
      const savedStudentData = localStorage.getItem('instructor-student-data');
      if (savedStudentData) {
        setStudentData(JSON.parse(savedStudentData));
        generateProgressSummary(JSON.parse(savedStudentData));
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
          completed: false
        });
      }
      
      const summary = summaryMap.get(key);
      summary.lastActivity = record.timestamp;
      summary.questionsAnswered++;
      if (record.isCorrect) {
        summary.questionsCorrect++;
      } else {
        summary.incorrectAnswers.push({
          questionId: record.questionId,
          roomId: record.roomId,
          studentAnswer: record.answer,
          timestamp: record.timestamp,
          attemptNumber: record.attemptNumber
        });
      }
      summary.rooms.add(record.roomId);
      
      if (record.roomId === 'lab' && record.questionId === 'final_question' && record.isCorrect) {
        summary.completed = true;
      }
    });
    
    const progressArray = Array.from(summaryMap.values()).map(summary => ({
      ...summary,
      rooms: Array.from(summary.rooms),
      accuracyRate: summary.questionsAnswered > 0 ? 
        Math.round((summary.questionsCorrect / summary.questionsAnswered) * 100) : 0
    }));
    
    setStudentProgress(progressArray);
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
    
    const expandedLetters = [];
    for (let i = 0; i < numGroups; i++) {
      expandedLetters.push(letters[i % letters.length]);
    }
    
    const shuffledLetters = [...expandedLetters];
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
    }
    
    for (let i = 1; i <= numGroups; i++) {
      newGroupLetters[i] = shuffledLetters[i - 1];
    }
    
    settings.groupLetters = newGroupLetters;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newRoomImages = {
        ...roomImages,
        [selectedWall]: {
          data: e.target.result,
          name: file.name,
          size: file.size,
          lastModified: new Date().toISOString()
        }
      };
      setRoomImages(newRoomImages);
      localStorage.setItem('instructor-room-images', JSON.stringify(newRoomImages));
    };
    reader.readAsDataURL(file);
  };

  const removeRoomImage = (wall) => {
    if (confirm('Are you sure you want to remove this room image and all its elements?')) {
      const newRoomImages = { ...roomImages };
      delete newRoomImages[wall];
      setRoomImages(newRoomImages);
      localStorage.setItem('instructor-room-images', JSON.stringify(newRoomImages));
      
      const newElements = { ...roomElements };
      Object.keys(newElements).forEach(elementId => {
        if (newElements[elementId].wall === wall) {
          delete newElements[elementId];
        }
      });
      setRoomElements(newElements);
      localStorage.setItem('instructor-room-elements', JSON.stringify(newElements));
    }
  };

  // NEW: Export settings functionality
  const exportSettings = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        settings: {
          roomImages,
          roomElements,
          wordSettings,
          gameSettings,
          ppeSettings,
          finalQuestionSettings,
          feedbackSettings
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microbiology-lab-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Settings exported successfully!');
    } catch (error) {
      console.error('Error exporting settings:', error);
      alert('Error exporting settings. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // NEW: Import settings functionality
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
        
        // Validate the imported data structure
        if (!importData.settings) {
          throw new Error('Invalid settings file format');
        }

        // Confirm before importing
        if (!confirm('This will replace all current settings. Are you sure you want to continue?')) {
          setIsImporting(false);
          return;
        }

        const settings = importData.settings;
        
        // Import each setting type if it exists
        if (settings.roomImages) {
          setRoomImages(settings.roomImages);
          localStorage.setItem('instructor-room-images', JSON.stringify(settings.roomImages));
        }
        
        if (settings.roomElements) {
          setRoomElements(settings.roomElements);
          localStorage.setItem('instructor-room-elements', JSON.stringify(settings.roomElements));
        }
        
        if (settings.wordSettings) {
          setWordSettings(settings.wordSettings);
          localStorage.setItem('instructor-word-settings', JSON.stringify(settings.wordSettings));
        }
        
        if (settings.gameSettings) {
          setGameSettings(settings.gameSettings);
          localStorage.setItem('instructor-game-settings', JSON.stringify(settings.gameSettings));
        }
        
        if (settings.ppeSettings) {
          setPpeSettings(settings.ppeSettings);
          localStorage.setItem('instructor-ppe-questions', JSON.stringify(settings.ppeSettings));
        }
        
        if (settings.finalQuestionSettings) {
          setFinalQuestionSettings(settings.finalQuestionSettings);
          localStorage.setItem('instructor-final-questions', JSON.stringify(settings.finalQuestionSettings));
        }
        
        if (settings.feedbackSettings) {
          setFeedbackSettings(settings.feedbackSettings);
          localStorage.setItem('instructor-feedback-settings', JSON.stringify(settings.feedbackSettings));
        }

        alert(`Settings imported successfully! ${importData.exportDate ? `(Exported on ${new Date(importData.exportDate).toLocaleDateString()})` : ''}`);
      } catch (error) {
        console.error('Error importing settings:', error);
        alert('Error importing settings. Please check the file format and try again.');
      } finally {
        setIsImporting(false);
        // Clear the file input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  const triggerSettingsUpload = () => {
    fileInputRef.current?.click();
  };

  // ... (keeping all the other existing functions for brevity - canvas handling, element management, etc.)
  // The rest of your existing functions go here unchanged...

  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('instructor-room-images', JSON.stringify(roomImages));
      localStorage.setItem('instructor-room-elements', JSON.stringify(roomElements));
      localStorage.setItem('instructor-word-settings', JSON.stringify(wordSettings));
      localStorage.setItem('instructor-game-settings', JSON.stringify(gameSettings));
      localStorage.setItem('instructor-ppe-questions', JSON.stringify(ppeSettings));
      localStorage.setItem('instructor-final-questions', JSON.stringify(finalQuestionSettings));
      localStorage.setItem('instructor-feedback-settings', JSON.stringify(feedbackSettings));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('All settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ... (other existing functions continue here)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔒 Instructor Login
          </h1>
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
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with updated Save/Export/Import buttons */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🧪 Microbiology Lab Instructor Portal
            </h1>
            
            {/* Updated action buttons */}
            <div className="flex gap-3">
              <button
                onClick={exportSettings}
                disabled={isExporting}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center ${
                  isExporting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    📥 Download Settings
                  </>
                )}
              </button>
              
              <button
                onClick={triggerSettingsUpload}
                disabled={isImporting}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center ${
                  isImporting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    📤 Upload Settings
                  </>
                )}
              </button>
              
              <button
                onClick={saveAllSettings}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isSaving ? 'Saving...' : '💾 Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for settings upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleSettingsUpload}
        className="hidden"
      />

      {/* Rest of your existing component JSX continues here... */}
      {/* Tab Navigation, Dashboard, etc. - keeping the same structure */}
      
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['dashboard', 'room-setup', 'group-questions', 'feedback', 'word-scramble', 'progress'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'room-setup' && '🏗️ Room Setup'}
                {tab === 'group-questions' && '❓ Group Questions'}
                {tab === 'feedback' && '💬 Feedback System'}
                {tab === 'word-scramble' && '🧩 Word Scramble'}
                {tab === 'progress' && '📈 Student Progress'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800">Room Images</h3>
                  <p className="text-2xl font-bold text-blue-600">{Object.keys(roomImages).length}</p>
                  <p className="text-sm text-blue-600">Walls configured</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-bold text-green-800">Room Elements</h3>
                  <p className="text-2xl font-bold text-green-600">{Object.keys(roomElements).length}</p>
                  <p className="text-sm text-green-600">Interactive elements</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-800">Student Groups</h3>
                  <p className="text-2xl font-bold text-yellow-600">{wordSettings.numGroups}</p>
                  <p className="text-sm text-yellow-600">Groups configured</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-bold text-purple-800">Active Students</h3>
                  <p className="text-2xl font-bold text-purple-600">{studentProgress.length}</p>
                  <p className="text-sm text-purple-600">Students tracked</p>
                </div>
              </div>
            </div>

            {/* Settings Management Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📁 Settings Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Export Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-3">📥 Download Settings</h3>
                  <p className="text-green-700 text-sm mb-4">
                    Export all your current settings including room setup, questions, and configurations to a JSON file. 
                    Perfect for backing up your work or sharing with colleagues.
                  </p>
                  <button
                    onClick={exportSettings}
                    disabled={isExporting}
                    className={`w-full px-4 py-3 rounded-lg font-bold transition-all ${
                      isExporting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isExporting ? 'Exporting Settings...' : '📥 Download Current Settings'}
                  </button>
                </div>

                {/* Import Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 mb-3">📤 Upload Settings</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Import previously exported settings to quickly restore a configuration. 
                    This will replace ALL current settings with the imported ones.
                  </p>
                  <button
                    onClick={triggerSettingsUpload}
                    disabled={isImporting}
                    className={`w-full px-4 py-3 rounded-lg font-bold transition-all ${
                      isImporting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isImporting ? 'Importing Settings...' : '📤 Upload Settings File'}
                  </button>
                </div>
              </div>
              
              {/* Usage Instructions */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-bold text-amber-800 mb-2">💡 Usage Tips</h4>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• Download settings at the end of each semester to keep as backups</li>
                  <li>• Upload settings at the start of new semesters to reuse configurations</li>
                  <li>• Share settings files with colleagues to collaborate on lab designs</li>
                  <li>• Always download current settings before uploading new ones</li>
                  <li>• Settings files include room images, questions, and all configurations</li>
                </ul>
              </div>
            </div>

            {/* Game Completion Settings remains the same... */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Game Completion Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Mode
                  </label>
                  <select
                    value={gameSettings.completionMode}
                    onChange={(e) => setGameSettings(prev => ({ ...prev, completionMode: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Complete All Required Elements</option>
                    <option value="final">Complete Specific Final Element Only</option>
                  </select>
                </div>

                {gameSettings.completionMode === 'final' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Element (Must be solved to complete)
                    </label>
                    <select
                      value={gameSettings.finalElementId}
                      onChange={(e) => setGameSettings(prev => ({ ...prev, finalElementId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select final element...</option>
                      {Object.entries(roomElements)
                        .filter(([id, el]) => ['info', 'question'].includes(el.interactionType))
                        .map(([id, element]) => (
                          <option key={id} value={id}>
                            {element.name} ({element.wall} wall)
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Room Setup Tab */}
        {activeTab === 'room-setup' && (
          <div className="space-y-6">
            {/* Wall Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Wall to Configure</h2>
              <div className="flex space-x-4">
                {wallOptions.map(wall => (
                  <button
                    key={wall}
                    onClick={() => setSelectedWall(wall)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedWall === wall
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {wall.charAt(0).toUpperCase() + wall.slice(1)} Wall
                    {roomImages[wall] && <span className="ml-2">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Room Image - {selectedWall.charAt(0).toUpperCase() + selectedWall.slice(1)} Wall
              </h2>
              
              {roomImages[selectedWall] ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Current image: {roomImages[selectedWall].name}
                    </span>
                    <button
                      onClick={() => removeRoomImage(selectedWall)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No image uploaded for this wall</p>
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload a high-quality image of your laboratory wall. You'll be able to define interactive regions on this image.
                </p>
              </div>
            </div>

            {/* Interactive Canvas */}
            {roomImages[selectedWall] && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Define Interactive Elements
                </h2>
                <p className="text-gray-600 mb-4">
                  Click and drag to create interactive regions on the image. Click on existing regions to edit them.
                </p>
                
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-auto cursor-crosshair block"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onClick={handleCanvasClick}
                    style={{ 
                      touchAction: 'none',
                      display: 'block',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </div>
                
                <img
                  ref={imageRef}
                  alt="Room background"
                  style={{ display: 'none' }}
                />
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>• <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span>Green rectangles: Existing interactive elements</p>
                  <p>• <span className="inline-block w-4 h-4 bg-red-500 mr-2"></span>Red rectangles: Selected element</p>
                  <p>• <span className="inline-block w-4 h-4 bg-blue-500 mr-2"></span>Blue rectangles: Currently drawing</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: Draw rectangles at least 20x20 pixels for best results
                  </p>
                </div>
              </div>
            )}

            {/* Element List */}
            {Object.keys(roomElements).filter(id => roomElements[id].wall === selectedWall).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Elements on {selectedWall.charAt(0).toUpperCase() + selectedWall.slice(1)} Wall
                </h2>
                <div className="space-y-3">
                  {Object.entries(roomElements)
                    .filter(([id, element]) => element.wall === selectedWall)
                    .map(([elementId, element]) => (
                      <div key={elementId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-bold">{element.name}</h3>
                          <p className="text-sm text-gray-600">
                            {elementTypes[element.type]} | {interactionTypes[element.interactionType]}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingElement(element);
                              setSelectedElementId(elementId);
                              setShowElementModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteElement(elementId)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Group Questions Tab */}
        {activeTab === 'group-questions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Configure Questions by Group</h2>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Select Group to Configure:
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
              <p className="text-gray-600 text-sm">
                Configure different questions and information for each group. Groups will only see content assigned to their specific group number.
              </p>
            </div>

            {/* Room Elements Questions */}
            {Object.keys(roomElements).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Room Element Questions - Group {selectedGroup}</h3>
                <div className="space-y-6">
                  {Object.entries(roomElements)
                    .filter(([id, element]) => ['info', 'question'].includes(element.interactionType))
                    .map(([elementId, element]) => (
                      <div key={elementId} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                          <span className="mr-2">
                            {element.defaultIcon || '🔍'}
                          </span>
                          {element.name} ({element.wall} wall)
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            element.interactionType === 'question' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {element.interactionType}
                          </span>
                        </h4>
                        
                        {element.interactionType === 'info' ? (
                          <div className="bg-green-50 p-4 rounded">
                            <p className="text-green-700 text-sm mb-2">
                              ℹ️ This element shows information directly (no question required)
                            </p>
                            <p className="text-green-600 text-xs">
                              Configure this element's content in the Room Setup tab.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-blue-50 p-4 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-blue-800 font-medium">Question Configuration for Group {selectedGroup}</span>
                              <button
                                onClick={() => {
                                  setEditingElement(element);
                                  setSelectedElementId(elementId);
                                  setShowElementModal(true);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                ⚙️ Edit Questions
                              </button>
                            </div>
                            
                            {(() => {
                              const groupQuestion = element.content?.question?.groups?.[selectedGroup]?.[0];
                              
                              if (groupQuestion) {
                                return (
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Question:</strong> {groupQuestion.question || 'No question set'}</div>
                                    <div><strong>Type:</strong> {groupQuestion.type || 'multiple_choice'}</div>
                                    {groupQuestion.type === 'multiple_choice' && (
                                      <div><strong>Correct Answer:</strong> {groupQuestion.options?.[groupQuestion.correctAnswer] || 'Not set'}</div>
                                    )}
                                    {groupQuestion.type === 'text' && (
                                      <div><strong>Correct Answer:</strong> {groupQuestion.correctText || 'Not set'}</div>
                                    )}
                                    <div><strong>Has Reward Image:</strong> {groupQuestion.infoImage ? '✅ Yes' : '❌ No'}</div>
                                  </div>
                                );
                              } else {
                                return (
                                  <p className="text-blue-600 text-sm">
                                    ⚠️ No question configured for Group {selectedGroup}. Click "Edit Questions" to set up the question.
                                  </p>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* PPE Questions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">PPE Room Question - Group {selectedGroup}</h3>
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
                        answer: currentQuestion.answer || 'Option A',
                        hint: currentQuestion.hint || '',
                        clue: currentQuestion.clue || ''
                      };
                      updatePPEQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter PPE safety question for this group..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select
                    value={ppeSettings.groups?.[selectedGroup]?.[0]?.type || 'multiple_choice'}
                    onChange={(e) => {
                      const currentQuestion = ppeSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        type: e.target.value,
                        options: e.target.value === 'multiple_choice' ? (currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']) : [],
                        answer: currentQuestion.answer || (e.target.value === 'multiple_choice' ? 'Option A' : '')
                      };
                      updatePPEQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Text Answer</option>
                  </select>
                </div>

                {ppeSettings.groups?.[selectedGroup]?.[0]?.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {(ppeSettings.groups?.[selectedGroup]?.[0]?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600 w-8">
                            {String.fromCharCode(65 + idx)}:
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const currentQuestion = ppeSettings.groups?.[selectedGroup]?.[0] || {};
                              const newOptions = [...(currentQuestion.options || [])];
                              newOptions[idx] = e.target.value;
                              const updatedQuestion = {
                                ...currentQuestion,
                                options: newOptions
                              };
                              updatePPEQuestion(selectedGroup, updatedQuestion);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    value={ppeSettings.groups?.[selectedGroup]?.[0]?.answer || ''}
                    onChange={(e) => {
                      const currentQuestion = ppeSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        answer: e.target.value
                      };
                      updatePPEQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the correct answer..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={ppeSettings.groups?.[selectedGroup]?.[0]?.hint || ''}
                    onChange={(e) => {
                      const currentQuestion = ppeSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        hint: e.target.value
                      };
                      updatePPEQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional hint for students..."
                  />
                </div>
              </div>
            </div>

            {/* Final Question */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Final Diagnosis Question - Group {selectedGroup}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.question || ''}
                    onChange={(e) => {
                      const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        id: `final_g${selectedGroup}`,
                        question: e.target.value,
                        type: currentQuestion.type || 'text',
                        options: currentQuestion.options || [],
                        correctAnswer: currentQuestion.correctAnswer || 0,
                        correctText: currentQuestion.correctText || '',
                        hint: currentQuestion.hint || '',
                        info: currentQuestion.info || '',
                        infoImage: currentQuestion.infoImage || null
                      };
                      updateFinalQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter final diagnosis question for this group..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select
                    value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.type || 'text'}
                    onChange={(e) => {
                      const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        type: e.target.value,
                        options: e.target.value === 'multiple_choice' ? (currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']) : [],
                        correctAnswer: e.target.value === 'multiple_choice' ? (currentQuestion.correctAnswer || 0) : 0,
                        correctText: e.target.value === 'text' ? (currentQuestion.correctText || '') : ''
                      };
                      updateFinalQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text Answer</option>
                    <option value="multiple_choice">Multiple Choice</option>
                  </select>
                </div>

                {finalQuestionSettings.groups?.[selectedGroup]?.[0]?.type === 'multiple_choice' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {(finalQuestionSettings.groups?.[selectedGroup]?.[0]?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 w-8">
                              {String.fromCharCode(65 + idx)}:
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                                const newOptions = [...(currentQuestion.options || [])];
                                newOptions[idx] = e.target.value;
                                const updatedQuestion = {
                                  ...currentQuestion,
                                  options: newOptions
                                };
                                updateFinalQuestion(selectedGroup, updatedQuestion);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer
                      </label>
                      <select
                        value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.correctAnswer || 0}
                        onChange={(e) => {
                          const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                          const updatedQuestion = {
                            ...currentQuestion,
                            correctAnswer: parseInt(e.target.value)
                          };
                          updateFinalQuestion(selectedGroup, updatedQuestion);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {(finalQuestionSettings.groups?.[selectedGroup]?.[0]?.options || []).map((option, idx) => (
                          <option key={idx} value={idx}>
                            {String.fromCharCode(65 + idx)}: {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {finalQuestionSettings.groups?.[selectedGroup]?.[0]?.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.correctText || ''}
                      onChange={(e) => {
                        const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                        const updatedQuestion = {
                          ...currentQuestion,
                          correctText: e.target.value
                        };
                        updateFinalQuestion(selectedGroup, updatedQuestion);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter the correct answer..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.hint || ''}
                    onChange={(e) => {
                      const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        hint: e.target.value
                      };
                      updateFinalQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional hint for students..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Information Revealed When Correct
                  </label>
                  <textarea
                    value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.info || ''}
                    onChange={(e) => {
                      const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        info: e.target.value
                      };
                      updateFinalQuestion(selectedGroup, updatedQuestion);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Information revealed when student answers correctly..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Information Image (Optional)
                  </label>
                  {finalQuestionSettings.groups?.[selectedGroup]?.[0]?.infoImage ? (
                    <div className="space-y-2">
                      <img
                        src={finalQuestionSettings.groups[selectedGroup][0].infoImage.data}
                        alt="Information"
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <button
                        onClick={() => {
                          const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                          const updatedQuestion = {
                            ...currentQuestion,
                            infoImage: null
                          };
                          updateFinalQuestion(selectedGroup, updatedQuestion);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {};
                              const updatedQuestion = {
                                ...currentQuestion,
                                infoImage: {
                                  data: event.target.result,
                                  name: file.name,
                                  size: file.size,
                                  lastModified: new Date().toISOString()
                                }
                              };
                              updateFinalQuestion(selectedGroup, updatedQuestion);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Optional image shown alongside the success information
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">General Performance Feedback</h2>
              <p className="text-gray-600 mb-4">
                Configure feedback messages based on student performance levels. These will be included in their final feedback report.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excellent (90-100% accuracy)
                  </label>
                  <textarea
                    value={feedbackSettings.generalFeedback.excellent}
                    onChange={(e) => setFeedbackSettings(prev => ({
                      ...prev,
                      generalFeedback: {
                        ...prev.generalFeedback,
                        excellent: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Good (75-89% accuracy)
                  </label>
                  <textarea
                    value={feedbackSettings.generalFeedback.good}
                    onChange={(e) => setFeedbackSettings(prev => ({
                      ...prev,
                      generalFeedback: {
                        ...prev.generalFeedback,
                        good: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Needs Improvement (60-74% accuracy)
                  </label>
                  <textarea
                    value={feedbackSettings.generalFeedback.needs_improvement}
                    onChange={(e) => setFeedbackSettings(prev => ({
                      ...prev,
                      generalFeedback: {
                        ...prev.generalFeedback,
                        needs_improvement: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poor (Below 60% accuracy)
                  </label>
                  <textarea
                    value={feedbackSettings.generalFeedback.poor}
                    onChange={(e) => setFeedbackSettings(prev => ({
                      ...prev,
                      generalFeedback: {
                        ...prev.generalFeedback,
                        poor: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Question-Specific Feedback */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Question-Specific Feedback</h2>
              <p className="text-gray-600 mb-4">
                Configure specific feedback for different types of questions. When students get these questions wrong, 
                they'll receive targeted advice on what to study.
              </p>
              
              <div className="space-y-4">
                {/* Common Question Types */}
                {[
                  { id: 'ppe_safety', topic: 'PPE Safety', description: 'Personal protective equipment questions' },
                  { id: 'microscopy', topic: 'Microscopy', description: 'Microscope use and observation questions' },
                  { id: 'bacterial_morphology', topic: 'Bacterial Morphology', description: 'Bacterial shapes and arrangements' },
                  { id: 'culture_techniques', topic: 'Culture Techniques', description: 'Growing and maintaining bacterial cultures' },
                  { id: 'sterilization', topic: 'Sterilization', description: 'Autoclave and sterilization methods' },
                  { id: 'diagnosis', topic: 'Diagnosis', description: 'Patient diagnosis and pathogen identification' }
                ].map(questionType => (
                  <div key={questionType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{questionType.topic}</h3>
                        <p className="text-sm text-gray-600">{questionType.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback for incorrect answers:
                      </label>
                      <textarea
                        value={feedbackSettings.questionFeedback[questionType.id]?.feedback || ''}
                        onChange={(e) => updateQuestionFeedback(questionType.id, {
                          topic: questionType.topic,
                          feedback: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder={`Enter feedback for ${questionType.topic.toLowerCase()} questions...`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Word Scramble Tab */}
        {activeTab === 'word-scramble' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Word Scramble Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Word (Solution)
                  </label>
                  <input
                    type="text"
                    value={wordSettings.targetWord}
                    onChange={(e) => {
                      const newWord = e.target.value.toUpperCase();
                      const newSettings = { ...wordSettings, targetWord: newWord };
                      assignLettersToGroups(newSettings, newWord, wordSettings.numGroups);
                      setWordSettings(newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the target word..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Groups
                  </label>
                  <input
                    type="number"
                    value={wordSettings.numGroups}
                    onChange={(e) => {
                      const numGroups = parseInt(e.target.value) || 1;
                      const newSettings = { ...wordSettings, numGroups };
                      assignLettersToGroups(newSettings, wordSettings.targetWord, numGroups);
                      setWordSettings(newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="50"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 mb-2">Letter Assignments</h3>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {Object.entries(wordSettings.groupLetters).map(([group, letter]) => (
                      <div key={group} className="bg-white border border-blue-300 rounded p-2 text-center">
                        <div className="text-xs text-gray-600">Group {group}</div>
                        <div className="text-lg font-bold text-blue-600">{letter}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Student Progress & Feedback</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={exportStudentDataCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    📊 Export CSV
                  </button>
                  <button
                    onClick={clearStudentData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    🗑️ Clear Data
                  </button>
                </div>
              </div>

              {studentProgress.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No student data recorded yet.
                </p>
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
                          Questions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Accuracy
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentProgress.map((student, index) => (
                        <tr key={index} className={student.completed ? 'bg-green-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.semester} {student.year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.groupNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.questionsCorrect}/{student.questionsAnswered}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.accuracyRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.completed ? 'Complete' : 'In Progress'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(student.lastActivity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Element Configuration Modal - COMPLETE VERSION WITH FULL QUESTION EDITING */}
      {showElementModal && editingElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Configure Element</h2>
                <button
                  onClick={() => {
                    setShowElementModal(false);
                    setEditingElement(null);
                    setSelectedElementId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Element Name
                    </label>
                    <input
                      type="text"
                      value={editingElement.name}
                      onChange={(e) => {
                        const updated = { ...editingElement, name: e.target.value };
                        setEditingElement(updated);
                        updateElement(selectedElementId, updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Element Type
                    </label>
                    <select
                      value={editingElement.type}
                      onChange={(e) => {
                        const updated = { 
                          ...editingElement, 
                          type: e.target.value,
                          defaultIcon: defaultIcons[e.target.value] || '📦'
                        };
                        setEditingElement(updated);
                        updateElement(selectedElementId, updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(elementTypes).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interaction Type
                    </label>
                    <select
                      value={editingElement.interactionType}
                      onChange={(e) => {
                        const updated = { ...editingElement, interactionType: e.target.value };
                        setEditingElement(updated);
                        updateElement(selectedElementId, updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(interactionTypes).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Icon
                    </label>
                    <input
                      type="text"
                      value={editingElement.defaultIcon}
                      onChange={(e) => {
                        const updated = { ...editingElement, defaultIcon: e.target.value };
                        setEditingElement(updated);
                        updateElement(selectedElementId, updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter an emoji..."
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={editingElement.isRequired}
                    onChange={(e) => {
                      const updated = { ...editingElement, isRequired: e.target.checked };
                      setEditingElement(updated);
                      updateElement(selectedElementId, updated);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700">
                    Required for completion
                  </label>
                </div>

                {/* INFO ONLY ELEMENT CONFIGURATION */}
                {editingElement.interactionType === 'info' && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Information Content</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      This element will show information directly when clicked (no question required).
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Information Text
                        </label>
                        <textarea
                          value={editingElement.content?.info || ''}
                          onChange={(e) => {
                            const updated = {
                              ...editingElement,
                              content: { ...editingElement.content, info: e.target.value }
                            };
                            setEditingElement(updated);
                            updateElement(selectedElementId, updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                          placeholder="Information revealed when clicked..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Information Image (Optional)
                        </label>
                        {editingElement.content?.infoImage ? (
                          <div className="space-y-2">
                            <img
                              src={editingElement.content.infoImage.data}
                              alt="Information"
                              className="w-48 h-48 object-cover rounded border"
                            />
                            <button
                              onClick={() => {
                                const updated = {
                                  ...editingElement,
                                  content: { ...editingElement.content, infoImage: null }
                                };
                                setEditingElement(updated);
                                updateElement(selectedElementId, updated);
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('File size must be less than 5MB');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const updated = {
                                      ...editingElement,
                                      content: { 
                                        ...editingElement.content, 
                                        infoImage: {
                                          data: event.target.result,
                                          name: file.name,
                                          size: file.size,
                                          lastModified: new Date().toISOString()
                                        }
                                      }
                                    };
                                    setEditingElement(updated);
                                    updateElement(selectedElementId, updated);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* QUESTION ELEMENT CONFIGURATION */}
                {editingElement.interactionType === 'question' && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-bold text-green-800 mb-4">❓ Question Configuration for Group {selectedGroup}</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Students must answer this question correctly to receive the reward information and image.
                    </p>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question
                        </label>
                        <textarea
                          value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.question || ''}
                          onChange={(e) => {
                            const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                            const updatedQuestion = {
                              ...currentQuestion,
                              id: `${selectedElementId}_g${selectedGroup}`,
                              question: e.target.value,
                              type: currentQuestion.type || 'multiple_choice',
                              numOptions: currentQuestion.numOptions || 4,
                              options: currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                              correctAnswer: currentQuestion.correctAnswer || 0,
                              correctText: currentQuestion.correctText || '',
                              hint: currentQuestion.hint || '',
                              clue: currentQuestion.clue || '',
                              randomizeAnswers: currentQuestion.randomizeAnswers || false,
                              info: currentQuestion.info || '',
                              infoImage: currentQuestion.infoImage || null
                            };
                            updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                            
                            // Update editing element state
                            const updatedElement = { ...editingElement };
                            if (!updatedElement.content) updatedElement.content = {};
                            if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                            updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                            setEditingElement(updatedElement);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter question for this group..."
                        />
                      </div>
                      
                      {/* Question Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type
                        </label>
                        <select
                          value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.type || 'multiple_choice'}
                          onChange={(e) => {
                            const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                            const updatedQuestion = {
                              ...currentQuestion,
                              type: e.target.value,
                              options: e.target.value === 'multiple_choice' ? (currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']) : [],
                              correctAnswer: e.target.value === 'multiple_choice' ? (currentQuestion.correctAnswer || 0) : 0,
                              correctText: e.target.value === 'text' ? (currentQuestion.correctText || '') : ''
                            };
                            updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                            
                            // Update editing element state
                            const updatedElement = { ...editingElement };
                            if (!updatedElement.content) updatedElement.content = {};
                            if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                            updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                            setEditingElement(updatedElement);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="text">Fill in the Blank</option>
                        </select>
                      </div>

                      {/* Multiple Choice Options */}
                      {editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.type === 'multiple_choice' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Answer Options
                            </label>
                            <div className="space-y-2">
                              {(editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-600 w-8">
                                    {String.fromCharCode(65 + idx)}:
                                  </span>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                      const newOptions = [...(currentQuestion.options || [])];
                                      newOptions[idx] = e.target.value;
                                      const updatedQuestion = {
                                        ...currentQuestion,
                                        options: newOptions
                                      };
                                      updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                                      
                                      // Update editing element state
                                      const updatedElement = { ...editingElement };
                                      if (!updatedElement.content) updatedElement.content = {};
                                      if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                                      updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                                      setEditingElement(updatedElement);
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Correct Answer
                            </label>
                            <select
                              value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.correctAnswer || 0}
                              onChange={(e) => {
                                const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                const updatedQuestion = {
                                  ...currentQuestion,
                                  correctAnswer: parseInt(e.target.value)
                                };
                                updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                                
                                // Update editing element state
                                const updatedElement = { ...editingElement };
                                if (!updatedElement.content) updatedElement.content = {};
                                if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                                updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                                setEditingElement(updatedElement);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {(editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.options || []).map((option, idx) => (
                                <option key={idx} value={idx}>
                                  {String.fromCharCode(65 + idx)}: {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {/* Text Answer */}
                      {editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.type === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer (case-insensitive)
                          </label>
                          <input
                            type="text"
                            value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.correctText || ''}
                            onChange={(e) => {
                              const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                              const updatedQuestion = {
                                ...currentQuestion,
                                correctText: e.target.value
                              };
                              updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                              
                              // Update editing element state
                              const updatedElement = { ...editingElement };
                              if (!updatedElement.content) updatedElement.content = {};
                              if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                              updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                              setEditingElement(updatedElement);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the correct answer..."
                          />
                        </div>
                      )}

                      {/* Hint */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hint (Optional)
                        </label>
                        <input
                          type="text"
                          value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.hint || ''}
                          onChange={(e) => {
                            const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                            const updatedQuestion = {
                              ...currentQuestion,
                              hint: e.target.value
                            };
                            updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                            
                            // Update editing element state
                            const updatedElement = { ...editingElement };
                            if (!updatedElement.content) updatedElement.content = {};
                            if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                            updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                            setEditingElement(updatedElement);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional hint for students..."
                        />
                      </div>

                      {/* Information Revealed When Correct */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Information Revealed When Correct
                        </label>
                        <textarea
                          value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.info || ''}
                          onChange={(e) => {
                            const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                            const updatedQuestion = {
                              ...currentQuestion,
                              info: e.target.value,
                              clue: e.target.value // Keep clue in sync
                            };
                            updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                            
                            // Update editing element state
                            const updatedElement = { ...editingElement };
                            if (!updatedElement.content) updatedElement.content = {};
                            if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                            updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                            setEditingElement(updatedElement);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Information revealed when student answers correctly..."
                        />
                      </div>

                      {/* SUCCESS/REWARD Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🎁 Reward Image (Shown When Question Answered Correctly)
                        </label>
                        {editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.infoImage ? (
                          <div className="space-y-2">
                            <div className="bg-white border border-green-300 rounded-lg p-3">
                              <p className="text-sm text-green-800 font-medium mb-2">✅ Current Reward Image for Group {selectedGroup}:</p>
                              <img
                                src={editingElement.content.question.groups[selectedGroup][0].infoImage.data}
                                alt="Success/Reward Image"
                                className="w-48 h-48 object-cover rounded border mx-auto shadow-lg"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                const updatedQuestion = {
                                  ...currentQuestion,
                                  infoImage: null
                                };
                                updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                                
                                // Update editing element state
                                const updatedElement = { ...editingElement };
                                if (!updatedElement.content) updatedElement.content = {};
                                if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                                updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                                setEditingElement(updatedElement);
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all"
                            >
                              🗑️ Remove Reward Image
                            </button>
                          </div>
                        ) : (
                          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-6xl mb-3">🎁</div>
                            <p className="text-blue-800 font-medium mb-2">No reward image set for Group {selectedGroup}</p>
                            <p className="text-sm text-blue-600 mb-4">Upload an image that students will see when they answer correctly!</p>
                            <label className="cursor-pointer inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all font-medium">
                              📁 Upload Success/Reward Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    if (file.size > 5 * 1024 * 1024) {
                                      alert('File size must be less than 5MB');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {
                                        id: `${selectedElementId}_g${selectedGroup}`,
                                        question: 'Question about this element...',
                                        type: 'multiple_choice',
                                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                        correctAnswer: 0,
                                        hint: '',
                                        info: 'Information revealed when solved...'
                                      };
                                      
                                      const updatedQuestion = {
                                        ...currentQuestion,
                                        infoImage: {
                                          data: event.target.result,
                                          name: file.name,
                                          size: file.size,
                                          lastModified: new Date().toISOString()
                                        }
                                      };
                                      
                                      updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                                      
                                      // Update editing element state
                                      const updatedElement = { ...editingElement };
                                      if (!updatedElement.content) updatedElement.content = {};
                                      if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                                      updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                                      setEditingElement(updatedElement);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          ✨ This image appears as a "reward" when students answer the question correctly
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => deleteElement(selectedElementId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  >
                    Delete Element
                  </button>
                  <button
                    onClick={() => {
                      setShowElementModal(false);
                      setEditingElement(null);
                      setSelectedElementId(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
