import { useState, useEffect } from 'react';

const InstructorInterface = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Microbiology-specific state
  const [labQuestions, setLabQuestions] = useState({
    microscope: { groups: {} },
    incubator: { groups: {} },
    petriDish: { groups: {} },
    autoclave: { groups: {} },
    centrifuge: { groups: {} }
  });
  
  const [labImages, setLabImages] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState('microscope');
  const [uploadingImages, setUploadingImages] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [studentProgress, setStudentProgress] = useState([]);
  const [wordSettings, setWordSettings] = useState({
    targetWord: '',
    numGroups: 15,
    groupLetters: {}
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadLabContent();
      loadStudentProgress();
      loadWordSettings();
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

  const loadLabContent = () => {
    const savedQuestions = localStorage.getItem('instructor-lab-questions');
    if (savedQuestions) {
      setLabQuestions(JSON.parse(savedQuestions));
    } else {
      initializeDefaultContent();
    }

    const savedImages = localStorage.getItem('instructor-lab-images');
    if (savedImages) {
      setLabImages(JSON.parse(savedImages));
    }
  };

  const initializeDefaultContent = () => {
    const defaultQuestions = {
      microscope: {
        groups: {
          1: [{
            id: 'mic1',
            question: 'Looking at the bacterial specimen under 1000x magnification, what is the most likely shape classification of these cells?',
            type: 'multiple_choice',
            options: ['Cocci (spherical)', 'Bacilli (rod-shaped)', 'Spirilla (spiral)', 'Pleomorphic (variable)'],
            answer: 'Bacilli (rod-shaped)',
            hint: 'Look carefully at the elongated shape of the individual cells.',
            clue: 'Rod-shaped bacteria detected - likely Escherichia coli'
          }]
        }
      },
      incubator: {
        groups: {
          1: [{
            id: 'inc1',
            question: 'The incubator display shows 37°C and 5% CO2. This environment is optimal for growing which type of microorganisms?',
            type: 'multiple_choice',
            options: ['Psychrophiles', 'Mesophiles', 'Thermophiles', 'Hyperthermophiles'],
            answer: 'Mesophiles',
            hint: 'Consider the temperature range and CO2 requirements for human pathogens.',
            clue: 'Mesophilic conditions set - optimal for human pathogens'
          }]
        }
      },
      petriDish: {
        groups: {
          1: [{
            id: 'pet1',
            question: 'On the blood agar plate, you observe clear zones around some bacterial colonies. This indicates:',
            type: 'multiple_choice',
            options: ['Alpha hemolysis', 'Beta hemolysis', 'Gamma hemolysis', 'No hemolysis'],
            answer: 'Beta hemolysis',
            hint: 'Clear zones indicate complete breakdown of red blood cells.',
            clue: 'Beta-hemolytic bacteria identified - Streptococcus pyogenes likely'
          }]
        }
      },
      autoclave: {
        groups: {
          1: [{
            id: 'auto1',
            question: 'For proper sterilization, the autoclave must reach what temperature and pressure for how long?',
            type: 'multiple_choice',
            options: ['121°C, 15 psi, 15 minutes', '100°C, 10 psi, 10 minutes', '134°C, 20 psi, 20 minutes', '80°C, 5 psi, 30 minutes'],
            answer: '121°C, 15 psi, 15 minutes',
            hint: 'Standard sterilization parameters for most laboratory equipment.',
            clue: 'Sterilization protocol confirmed - equipment properly decontaminated'
          }]
        }
      },
      centrifuge: {
        groups: {
          1: [{
            id: 'cent1',
            question: 'When centrifuging blood samples, the heavier red blood cells settle at the bottom while the lighter plasma rises to the top. This separation is based on:',
            type: 'multiple_choice',
            options: ['Molecular weight', 'Density differences', 'Electrical charge', 'Surface tension'],
            answer: 'Density differences',
            hint: 'Think about what causes particles to separate when spun at high speed.',
            clue: 'Density separation principle confirmed - sample fractionation successful'
          }]
        }
      }
    };
    setLabQuestions(defaultQuestions);
  };

  const loadStudentProgress = () => {
    const savedProgress = localStorage.getItem('instructor-student-progress');
    if (savedProgress) {
      setStudentProgress(JSON.parse(savedProgress));
    }
  };

  const loadWordSettings = () => {
    const savedSettings = localStorage.getItem('instructor-word-settings');
    if (savedSettings) {
      setWordSettings(JSON.parse(savedSettings));
    } else {
      const defaultSettings = {
        targetWord: 'MICROBIOLOGY',
        numGroups: 15,
        groupLetters: {}
      };
      assignLettersToGroups(defaultSettings, 'MICROBIOLOGY', 15);
      setWordSettings(defaultSettings);
    }
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

  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('instructor-lab-questions', JSON.stringify(labQuestions));
      localStorage.setItem('instructor-lab-images', JSON.stringify(labImages));
      localStorage.setItem('instructor-word-settings', JSON.stringify(wordSettings));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('All settings saved successfully!');
    } catch (error) {
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestion = (equipment, groupNumber, questionData) => {
    setLabQuestions(prev => ({
      ...prev,
      [equipment]: {
        ...prev[equipment],
        groups: {
          ...prev[equipment].groups,
          [groupNumber]: [questionData] // Each equipment has one question per group
        }
      }
    }));
  };

  const handleImageUpload = (event, equipment, groupNumber) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files (JPG, PNG, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const uploadKey = `${equipment}_${groupNumber}`;
      setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageKey = `${equipment}_group${groupNumber}`;
        setLabImages(prev => ({
          ...prev,
          [imageKey]: {
            data: e.target.result,
            name: file.name,
            size: file.size,
            lastModified: new Date().toISOString()
          }
        }));
        setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (equipment, groupNumber) => {
    if (confirm('Are you sure you want to remove this image?')) {
      const imageKey = `${equipment}_group${groupNumber}`;
      setLabImages(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
    }
  };

  const addNewGroup = (equipment) => {
    const existingGroups = Object.keys(labQuestions[equipment].groups).map(Number);
    const newGroupNumber = existingGroups.length > 0 ? Math.max(...existingGroups) + 1 : 1;
    
    const defaultQuestion = {
      id: `${equipment}1`,
      question: `New ${equipment} question for group ${newGroupNumber}...`,
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
      hint: 'Hint for this question...',
      clue: 'Clue revealed when solved...'
    };
    
    updateQuestion(equipment, newGroupNumber, defaultQuestion);
    setSelectedGroup(newGroupNumber);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🧪 Microbiology Lab</h1>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Instructor Portal</h2>
            <p className="text-gray-600">Enter password to access lab management tools</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter instructor password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            Default password: microbiology2024
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
            <h1 className="text-2xl font-bold text-gray-800">🧪 Microbiology Lab - Instructor Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveAllSettings}
                disabled={isSaving}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all transform ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg'
                }`}
              >
                {isSaving ? 'Saving...' : '💾 Save All Settings'}
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Student Progress', icon: '📊' },
              { id: 'equipment', name: 'Lab Equipment', icon: '🔬' },
              { id: 'word-settings', name: 'Word Scramble', icon: '🧩' },
              { id: 'data-management', name: 'Data Management', icon: '🗂️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Student Progress Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Student Progress Overview</h2>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lab Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment Solved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentProgress.map((student, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.semester} {student.year} - Group {student.groupNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.lab?.percentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{student.lab?.percentage || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.lab?.equipmentSolved || 0}/5 Equipment
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.lastActivity ? new Date(student.lastActivity).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lab Equipment Management */}
        {activeTab === 'equipment' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🔬 Lab Equipment Management</h2>
            </div>
            
            {/* Equipment Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Equipment to Configure</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.keys(labQuestions).map(equipment => (
                  <button
                    key={equipment}
                    onClick={() => setSelectedEquipment(equipment)}
                    className={`p-4 rounded-lg font-medium transition-colors ${
                      selectedEquipment === equipment
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {equipment === 'microscope' && '🔬'} 
                    {equipment === 'incubator' && '🌡️'} 
                    {equipment === 'petriDish' && '🧫'} 
                    {equipment === 'autoclave' && '♨️'} 
                    {equipment === 'centrifuge' && '🌪️'}
                    <br />
                    {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/([A-Z])/g, ' $1')}
                  </button>
                ))}
              </div>
            </div>

            {/* Group Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Configure {selectedEquipment.charAt(0).toUpperCase() + selectedEquipment.slice(1)} for Groups
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {[...Array(15)].map((_, i) => {
                  const groupNumber = i + 1;
                  return (
                    <button
                      key={groupNumber}
                      onClick={() => setSelectedGroup(groupNumber)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedGroup === groupNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Group {groupNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => addNewGroup(selectedEquipment)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add New Group
              </button>
            </div>

            {/* Question Configuration */}
            {selectedEquipment && selectedGroup && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Question for {selectedEquipment.charAt(0).toUpperCase() + selectedEquipment.slice(1)} - Group {selectedGroup}
                </h3>
                
                {(() => {
                  const currentQuestion = labQuestions[selectedEquipment]?.groups?.[selectedGroup]?.[0] || {
                    id: `${selectedEquipment}1`,
                    question: '',
                    type: 'multiple_choice',
                    options: ['', '', '', ''],
                    answer: '',
                    hint: '',
                    clue: ''
                  };
                  
                  return (
                    <div className="space-y-6">
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                        <textarea
                          value={currentQuestion.question}
                          onChange={(e) => updateQuestion(selectedEquipment, selectedGroup, { 
                            ...currentQuestion, 
                            question: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter the microbiology question..."
                        />
                      </div>

                      {/* Question Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) => updateQuestion(selectedEquipment, selectedGroup, { 
                            ...currentQuestion, 
                            type: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="text">Text Input</option>
                        </select>
                      </div>

                      {/* Multiple Choice Options */}
                      {currentQuestion.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <input
                                type="radio"
                                name={`answer-${selectedEquipment}-${selectedGroup}`}
                                checked={currentQuestion.answer === option}
                                onChange={() => updateQuestion(selectedEquipment, selectedGroup, { 
                                  ...currentQuestion, 
                                  answer: option 
                                })}
                                className="text-blue-600"
                              />
                              <input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...currentQuestion.options];
                                  newOptions[index] = e.target.value;
                                  updateQuestion(selectedEquipment, selectedGroup, { 
                                    ...currentQuestion, 
                                    options: newOptions 
                                  });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Text Answer */}
                      {currentQuestion.type === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                          <input
                            value={currentQuestion.answer}
                            onChange={(e) => updateQuestion(selectedEquipment, selectedGroup, { 
                              ...currentQuestion, 
                              answer: e.target.value 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the correct answer"
                          />
                        </div>
                      )}

                      {/* Hint */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hint (Optional)</label>
                        <textarea
                          value={currentQuestion.hint}
                          onChange={(e) => updateQuestion(selectedEquipment, selectedGroup, { 
                            ...currentQuestion, 
                            hint: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="Provide a helpful hint for struggling students..."
                        />
                      </div>

                      {/* Clue (Result) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Research Clue (Revealed when solved)</label>
                        <textarea
                          value={currentQuestion.clue}
                          onChange={(e) => updateQuestion(selectedEquipment, selectedGroup, { 
                            ...currentQuestion, 
                            clue: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="What research finding is revealed when this equipment is analyzed?"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Equipment Image for Group {selectedGroup}
                        </label>
                        {labImages[`${selectedEquipment}_group${selectedGroup}`] ? (
                          <div className="space-y-2">
                            <img
                              src={labImages[`${selectedEquipment}_group${selectedGroup}`].data}
                              alt={`${selectedEquipment} for Group ${selectedGroup}`}
                              className="w-full max-w-md h-32 object-cover rounded border"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => removeImage(selectedEquipment, selectedGroup)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, selectedEquipment, selectedGroup)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={uploadingImages[`${selectedEquipment}_${selectedGroup}`]}
                            />
                            <p className="text-xs text-gray-500">
                              Upload microscopy images, bacterial cultures, or equipment photos to help students answer questions.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Word Scramble Settings */}
        {activeTab === 'word-settings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🧩 Word Scramble Settings</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Target Word Configuration</h3>
              <p className="text-gray-600 mb-6">
                Set up the target word for the class word scramble challenge. Letters will be automatically 
                distributed randomly among the groups.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Word</label>
                  <input
                    type="text"
                    value={wordSettings.targetWord}
                    onChange={(e) => {
                      const newWord = e.target.value.toUpperCase();
                      const updatedSettings = { ...wordSettings, targetWord: newWord };
                      if (newWord.trim()) {
                        assignLettersToGroups(updatedSettings, newWord, wordSettings.numGroups);
                      }
                      setWordSettings(updatedSettings);
                    }}
                    placeholder="Enter the target word (e.g., MICROBIOLOGY)"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg uppercase"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Groups</label>
                  <input
                    type="number"
                    value={wordSettings.numGroups}
                    onChange={(e) => {
                      const num = parseInt(e.target.value);
                      if (isNaN(num) || num < 1) return;
                      const updatedSettings = { ...wordSettings, numGroups: num };
                      if (wordSettings.targetWord.trim()) {
                        assignLettersToGroups(updatedSettings, wordSettings.targetWord, num);
                      }
                      setWordSettings(updatedSettings);
                    }}
                    min="1"
                    max="50"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Letter Distribution Preview */}
            {wordSettings.targetWord && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Letter Distribution Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {Object.entries(wordSettings.groupLetters).map(([groupNum, letter]) => (
                    <div
                      key={groupNum}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200"
                    >
                      <div className="font-bold text-blue-800">Group {groupNum}</div>
                      <div className="text-3xl font-bold text-blue-600 mt-1">{letter}</div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const updatedSettings = { ...wordSettings };
                    assignLettersToGroups(updatedSettings, wordSettings.targetWord, wordSettings.numGroups);
                    setWordSettings(updatedSettings);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🎲 Randomize Letter Distribution Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Data Management */}
        {activeTab === 'data-management' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🗂️ Data Management & Cleanup</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">⚠️ Data Cleanup Operations</h3>
              <p className="text-gray-600 mb-6">
                Use these tools to clear data between class sessions or when testing.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Clear Word Scramble Progress</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Removes all group completion records from the word scramble.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear ALL word scramble progress?')) {
                        localStorage.removeItem('class-letters-progress');
                        localStorage.removeItem('word-scramble-success');
                        alert('Word scramble progress cleared!');
                      }
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                  >
                    🗑️ Clear Word Scramble Data
                  </button>
                </div>
                
                <div className="border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Clear Student Tracking Data</h4>
                  <p className="text-sm text-orange-600 mb-4">
                    Removes all student progress and lab completion records.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear ALL student tracking data?')) {
                        localStorage.removeItem('instructor-student-progress');
                        localStorage.removeItem('instructor-student-data');
                        alert('Student tracking data cleared!');
                      }
                    }}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                  >
                    📊 Clear Student Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorInterface;
