import { useState, useEffect, useRef } from 'react';

const InstructorInterface = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Original microbiology-specific state
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

  // Enhanced image management state
  const [equipmentImages, setEquipmentImages] = useState({});
  const [processingImages, setProcessingImages] = useState({});
  const [backgroundImages, setBackgroundImages] = useState({});
  const [equipmentSettings, setEquipmentSettings] = useState({});
  const [tableImages, setTableImages] = useState({});
  
  // Canvas ref for image processing
  const canvasRef = useRef(null);

  const equipmentTypes = ['microscope', 'incubator', 'petriDish', 'autoclave', 'centrifuge'];

  // Z-index layers for context
  const zIndexLayers = {
    1: 'Floor/Background elements',
    2: 'Wall fixtures',
    3: 'Tables/Surfaces',
    4: 'Basic equipment',
    5: 'Standard equipment',
    6: 'Raised equipment',
    7: 'Desktop items',
    8: 'Monitors/Displays',
    9: 'Foreground equipment',
    10: 'Primary equipment (default)',
    11: 'Elevated equipment',
    12: 'Hanging equipment',
    13: 'Overlays',
    14: 'Active indicators',
    15: 'Top-level equipment',
    16: 'Floating elements',
    17: 'Pop-ups',
    18: 'Tooltips',
    19: 'Modal backgrounds',
    20: 'Modal content (front)'
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLabContent();
      loadStudentProgress();
      loadWordSettings();
      loadEquipmentImages();
      loadBackgroundImages();
      loadEquipmentSettings();
      loadTableImages();
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

  const loadEquipmentImages = () => {
    const savedImages = localStorage.getItem('instructor-equipment-images');
    if (savedImages) {
      try {
        setEquipmentImages(JSON.parse(savedImages));
      } catch (error) {
        console.error('Error loading equipment images:', error);
      }
    }
  };

  const loadBackgroundImages = () => {
    const savedBgImages = localStorage.getItem('instructor-background-images');
    if (savedBgImages) {
      try {
        setBackgroundImages(JSON.parse(savedBgImages));
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    }
  };

  const loadEquipmentSettings = () => {
    const savedSettings = localStorage.getItem('instructor-equipment-settings');
    if (savedSettings) {
      try {
        setEquipmentSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading equipment settings:', error);
      }
    }
  };

  const loadTableImages = () => {
    const savedTableImages = localStorage.getItem('instructor-table-images');
    if (savedTableImages) {
      try {
        setTableImages(JSON.parse(savedTableImages));
      } catch (error) {
        console.error('Error loading table images:', error);
      }
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
      localStorage.setItem('instructor-equipment-images', JSON.stringify(equipmentImages));
      localStorage.setItem('instructor-background-images', JSON.stringify(backgroundImages));
      localStorage.setItem('instructor-equipment-settings', JSON.stringify(equipmentSettings));
      localStorage.setItem('instructor-table-images', JSON.stringify(tableImages));
      
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
          [groupNumber]: [questionData]
        }
      }
    }));
  };

  // Enhanced equipment settings management (layout same for all groups)
  const updateEquipmentSettings = (equipment, newSettings) => {
    setEquipmentSettings(prev => ({
      ...prev,
      [equipment]: {
        ...prev[equipment],
        ...newSettings
      }
    }));
  };

  const getEquipmentSettings = (equipment) => {
    return equipmentSettings[equipment] || {
      size: 100,
      showTable: true,
      tableType: 'default',
      xOffset: 0,
      yOffset: 0,
      zIndex: 10
    };
  };

  // Image processing functions
  const removeWhiteBackground = (imageData, canvas, ctx) => {
    const data = imageData.data;
    const threshold = 200;
    
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      
      if (red > threshold && green > threshold && blue > threshold) {
        data[i + 3] = 0;
      } else if (red > threshold - 30 && green > threshold - 30 && blue > threshold - 30) {
        data[i + 3] = Math.floor(data[i + 3] * 0.3);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const processImage = (file, equipment, group) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const processedDataURL = removeWhiteBackground(imageData, canvas, ctx);
        resolve(processedDataURL);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleEquipmentImageUpload = async (event, equipment, group) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const uploadKey = `${equipment}_${group}`;
    setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
    setProcessingImages(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const processedImageData = await processImage(file, equipment, group);
      
      const imageKey = `${equipment}_group${group}`;
      setEquipmentImages(prev => ({
        ...prev,
        [imageKey]: {
          original: URL.createObjectURL(file),
          processed: processedImageData,
          name: file.name,
          size: file.size,
          lastModified: new Date().toISOString(),
          equipment,
          group
        }
      }));
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      setProcessingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleBackgroundImageUpload = (event, wallType) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setBackgroundImages(prev => ({
        ...prev,
        [wallType]: {
          data: e.target.result,
          name: file.name,
          size: file.size,
          lastModified: new Date().toISOString()
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleTableImageUpload = (event, equipment) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setTableImages(prev => ({
        ...prev,
        [equipment]: {
          data: e.target.result,
          name: file.name,
          size: file.size,
          lastModified: new Date().toISOString()
        }
      }));
    };
    reader.readAsDataURL(file);
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

  const removeImage = (equipment, group) => {
    if (confirm('Are you sure you want to remove this image?')) {
      const imageKey = `${equipment}_group${group}`;
      setLabImages(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
    }
  };

  const removeEquipmentImage = (equipment, group) => {
    if (confirm('Are you sure you want to remove this equipment image?')) {
      const imageKey = `${equipment}_group${group}`;
      setEquipmentImages(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
    }
  };

  const removeBackgroundImage = (wallType) => {
    if (confirm('Are you sure you want to remove this background image?')) {
      setBackgroundImages(prev => {
        const updated = { ...prev };
        delete updated[wallType];
        return updated;
      });
    }
  };

  const removeTableImage = (equipment) => {
    if (confirm('Are you sure you want to remove this table image?')) {
      setTableImages(prev => {
        const updated = { ...prev };
        delete updated[equipment];
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

  // Room preview component
  const renderRoomPreview = (equipment) => {
    const settings = getEquipmentSettings(equipment);
    const imageKey = `${equipment}_group${selectedGroup}`;
    const currentImage = equipmentImages[imageKey];
    const tableImage = tableImages[equipment];
    
    return (
      <div className="relative bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg border-2 border-gray-300 h-96 overflow-hidden">
        {/* Lab Room SVG Background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9"/>
              <stop offset="100%" stopColor="#e2e8f0"/>
            </linearGradient>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#f8fafc"/>
            </linearGradient>
            <pattern id="floorTiles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="#f8fafc"/>
              <rect width="48" height="48" x="1" y="1" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
            </pattern>
          </defs>
          
          {/* Floor */}
          <polygon points="80,180 720,180 760,550 40,550" fill="url(#floorTiles)" stroke="#cbd5e0" strokeWidth="2"/>
          
          {/* Back wall */}
          <polygon points="120,60 680,60 720,180 80,180" fill="url(#wallGrad)" stroke="#e2e8f0"/>
          
          {/* Side walls */}
          <polygon points="80,180 120,60 120,400 80,520" fill="url(#wallGrad)" stroke="#e2e8f0"/>
          <polygon points="680,60 720,180 720,520 680,400" fill="url(#wallGrad)" stroke="#e2e8f0"/>
          
          {/* Lab bench */}
          <polygon points="150,300 650,300 680,340 120,340" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2"/>
          <polygon points="120,340 680,340 680,360 120,360" fill="#d1d5db"/>
          <polygon points="680,340 720,380 720,400 680,360" fill="#cbd5e0"/>
          
          {/* Ceiling lights */}
          <ellipse cx="250" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
          <ellipse cx="400" cy="85" rx="70" ry="15" fill="#fef3c7" opacity="0.9"/>
          <ellipse cx="550" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
        </svg>
        
        {/* Table (behind equipment) */}
        {settings.showTable && (
          <div 
            className="absolute"
            style={{
              left: '50%',
              bottom: `${100 + settings.yOffset}px`,
              transform: `translateX(-50%) translateX(${settings.xOffset}px)`,
              zIndex: Math.max(1, settings.zIndex - 1)
            }}
          >
            {tableImage ? (
              <img
                src={tableImage.data}
                alt="Table"
                className="object-contain"
                style={{
                  maxWidth: '160px',
                  maxHeight: '80px',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
                }}
              />
            ) : (
              <div 
                className={`w-40 h-20 rounded-lg shadow-xl border-2 border-gray-600 ${
                  settings.tableType === 'stainless' 
                    ? 'bg-gradient-to-b from-gray-100 via-gray-200 to-gray-400'
                    : settings.tableType === 'wooden'
                    ? 'bg-gradient-to-b from-amber-200 via-amber-300 to-amber-600'
                    : 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-500'
                }`}
                style={{
                  boxShadow: '0 12px 24px rgba(0,0,0,0.4)'
                }}
              />
            )}
          </div>
        )}
        
        {/* Equipment Image */}
        {currentImage && (
          <div 
            className="absolute"
            style={{
              left: '50%',
              bottom: `${120 + settings.yOffset}px`,
              transform: `translateX(-50%) translateX(${settings.xOffset}px)`,
              zIndex: settings.zIndex
            }}
          >
            <img
              src={currentImage.processed}
              alt="Equipment preview"
              className="object-contain transition-all duration-300"
              style={{
                maxWidth: `${200 * (settings.size / 100)}px`,
                maxHeight: `${200 * (settings.size / 100)}px`,
                filter: 'drop-shadow(3px 6px 12px rgba(0,0,0,0.4))'
              }}
            />
          </div>
        )}
        
        {/* Equipment position indicator */}
        <div 
          className="absolute w-4 h-4 border-2 border-red-400 rounded-full bg-red-100 opacity-60"
          style={{
            left: '50%',
            bottom: `${120 + settings.yOffset}px`,
            transform: `translateX(-50%) translateX(${settings.xOffset}px)`,
            zIndex: settings.zIndex + 1
          }}
        />
        
        {/* Grid overlay for reference */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
          </svg>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🧪 Microbiology Lab</h1>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Instructor Portal</h2>
            <p className="text-gray-600">Enhanced Lab Management System</p>
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
              { id: 'equipment-images', name: 'Realistic Images', icon: '📸' },
              { id: 'image-sizing', name: 'Image Layout', icon: '📐' },
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

        {/* Equipment Images Tab */}
        {activeTab === 'equipment-images' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">📸 Realistic Equipment & Background Images</h2>
            </div>
            
            {/* Equipment Images Section */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">🔬 Equipment Images (Auto Background Removal)</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
                  <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {equipmentTypes.map(equipment => (
                      <option key={equipment} value={equipment}>
                        {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/([A-Z])/g, ' $1')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Number</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Group {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(() => {
                const imageKey = `${selectedEquipment}_group${selectedGroup}`;
                const currentImage = equipmentImages[imageKey];
                const uploadKey = `${selectedEquipment}_${selectedGroup}`;
                const isUploading = uploadingImages[uploadKey];
                const isProcessing = processingImages[uploadKey];
                
                return currentImage ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Original Image</h4>
                        <img
                          src={currentImage.original}
                          alt={`Original ${selectedEquipment}`}
                          className="w-full max-h-48 object-contain rounded border border-gray-300"
                        />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Processed (Background Removed)</h4>
                        <div className="bg-gray-100 p-4 rounded border border-gray-300">
                          <img
                            src={currentImage.processed}
                            alt={`Processed ${selectedEquipment}`}
                            className="w-full max-h-48 object-contain"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Game Preview</h4>
                        <div className="bg-gradient-to-b from-blue-50 to-gray-100 p-4 rounded border border-gray-300">
                          <img
                            src={currentImage.processed}
                            alt={`Game preview ${selectedEquipment}`}
                            className="w-full max-h-48 object-contain"
                            style={{
                              filter: 'drop-shadow(3px 6px 12px rgba(0,0,0,0.4))',
                              transform: 'scale(0.8)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => removeEquipmentImage(selectedEquipment, selectedGroup)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        🗑️ Remove Image
                      </button>
                      
                      <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
                        🔄 Replace Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleEquipmentImageUpload(e, selectedEquipment, selectedGroup)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isUploading || isProcessing ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                          {isProcessing ? 'Processing image and removing background...' : 'Uploading image...'}
                        </p>
                      </div>
                    ) : (
                      <label className="block w-full">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                          <div className="text-4xl mb-4">📸</div>
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            Upload {selectedEquipment.charAt(0).toUpperCase() + selectedEquipment.slice(1)} Image
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Click to select an image file (JPG, PNG, etc.)
                          </p>
                          <p className="text-xs text-gray-400">
                            White backgrounds will be automatically removed
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleEquipmentImageUpload(e, selectedEquipment, selectedGroup)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Background Images Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">🏢 Lab Background Images</h3>
              <p className="text-gray-600 mb-6">Upload custom background images for different lab walls. These will replace the default SVG backgrounds.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['north', 'east', 'south', 'west'].map((wall) => (
                  <div key={wall} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 capitalize">{wall} Wall</h4>
                    
                    {backgroundImages[wall] ? (
                      <div className="space-y-3">
                        <img
                          src={backgroundImages[wall].data}
                          alt={`${wall} wall background`}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => removeBackgroundImage(wall)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                          <label className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer">
                            Replace
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBackgroundImageUpload(e, wall)}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="text-xs text-gray-500">
                          {backgroundImages[wall].name} ({Math.round(backgroundImages[wall].size / 1024)} KB)
                        </div>
                      </div>
                    ) : (
                      <label className="block w-full">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                          <div className="text-2xl mb-2">🖼️</div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Upload {wall} wall</p>
                          <p className="text-xs text-gray-500">Lab background image</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBackgroundImageUpload(e, wall)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-medium text-blue-800 mb-2">Background Image Tips:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Use high-resolution images (1920x1080 or higher)</li>
                  <li>• Laboratory or classroom photos work best</li>
                  <li>• Ensure good lighting and contrast</li>
                  <li>• Images will be overlaid with perspective effects</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Image Layout Tab */}
        {activeTab === 'image-sizing' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">📐 Image Layout Controls</h2>
            </div>
            
            {/* Equipment Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Equipment to Configure Layout</h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
                  <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {equipmentTypes.map(equipment => (
                      <option key={equipment} value={equipment}>
                        {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/([A-Z])/g, ' $1')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group for Preview</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Group {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Layout settings apply to all groups for this equipment type. 
                  The group selection above is only for preview purposes.
                </p>
              </div>
            </div>

            {(() => {
              const imageKey = `${selectedEquipment}_group${selectedGroup}`;
              const currentImage = equipmentImages[imageKey];
              const currentSettings = getEquipmentSettings(selectedEquipment);
              
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Controls Panel */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Layout Controls for {selectedEquipment.charAt(0).toUpperCase() + selectedEquipment.slice(1)}
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Size Control */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Equipment Size: {currentSettings.size}%
                        </label>
                        <input
                          type="range"
                          min="25"
                          max="200"
                          value={currentSettings.size}
                          onChange={(e) => updateEquipmentSettings(selectedEquipment, {
                            size: parseInt(e.target.value)
                          })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>25% (Small)</span>
                          <span>100% (Normal)</span>
                          <span>200% (Large)</span>
                        </div>
                      </div>

                      {/* X Offset */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horizontal Position: {currentSettings.xOffset}px
                        </label>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={currentSettings.xOffset}
                          onChange={(e) => updateEquipmentSettings(selectedEquipment, {
                            xOffset: parseInt(e.target.value)
                          })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>-200px (Left)</span>
                          <span>0px (Center)</span>
                          <span>200px (Right)</span>
                        </div>
                      </div>

                      {/* Y Offset */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vertical Position: {currentSettings.yOffset}px
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={currentSettings.yOffset}
                          onChange={(e) => updateEquipmentSettings(selectedEquipment, {
                            yOffset: parseInt(e.target.value)
                          })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>-100px (Up)</span>
                          <span>0px (Center)</span>
                          <span>100px (Down)</span>
                        </div>
                      </div>

                      {/* Z-Index with context */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Layer Order (Z-Index): {currentSettings.zIndex}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={currentSettings.zIndex}
                          onChange={(e) => updateEquipmentSettings(selectedEquipment, {
                            zIndex: parseInt(e.target.value)
                          })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 (Behind)</span>
                          <span>10 (Normal)</span>
                          <span>20 (Front)</span>
                        </div>
                        
                        {/* Z-Index Context */}
                        <div className="mt-2 bg-gray-50 rounded p-3">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Layer Reference:</h4>
                          <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                            {Object.entries(zIndexLayers).map(([index, description]) => (
                              <div 
                                key={index} 
                                className={`flex justify-between ${
                                  parseInt(index) === currentSettings.zIndex ? 'font-bold text-blue-600' : ''
                                }`}
                              >
                                <span>{index}:</span>
                                <span className="ml-2">{description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Table Settings */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Table Settings</h4>
                        
                        <div className="space-y-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={currentSettings.showTable}
                              onChange={(e) => updateEquipmentSettings(selectedEquipment, {
                                showTable: e.target.checked
                              })}
                              className="mr-2"
                            />
                            Show table under equipment
                          </label>

                          {currentSettings.showTable && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Table Type
                              </label>
                              <select
                                value={currentSettings.tableType}
                                onChange={(e) => updateEquipmentSettings(selectedEquipment, {
                                  tableType: e.target.value
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="default">Default (Gray)</option>
                                <option value="stainless">Stainless Steel</option>
                                <option value="wooden">Wooden</option>
                                <option value="custom">Custom Image</option>
                              </select>
                              
                              {/* Custom Table Image Upload */}
                              {currentSettings.tableType === 'custom' && (
                                <div className="mt-3">
                                  {tableImages[selectedEquipment] ? (
                                    <div className="space-y-2">
                                      <img
                                        src={tableImages[selectedEquipment].data}
                                        alt="Custom table"
                                        className="w-32 h-16 object-cover rounded border"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => removeTableImage(selectedEquipment)}
                                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                        >
                                          Remove
                                        </button>
                                        <label className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 cursor-pointer">
                                          Replace
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleTableImageUpload(e, selectedEquipment)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  ) : (
                                    <label className="block w-full">
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                        <div className="text-lg mb-1">🏷️</div>
                                        <p className="text-xs font-medium text-gray-700">Upload Table Image</p>
                                      </div>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleTableImageUpload(e, selectedEquipment)}
                                        className="hidden"
                                      />
                                    </label>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reset Button */}
                      <div className="border-t pt-4">
                        <button
                          onClick={() => updateEquipmentSettings(selectedEquipment, {
                            size: 100,
                            xOffset: 0,
                            yOffset: 0,
                            zIndex: 10,
                            showTable: true,
                            tableType: 'default'
                          })}
                          className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          🔄 Reset to Defaults
                        </button>
                      </div>

                      {/* Settings Summary */}
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Current Settings</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>Size: {currentSettings.size}%</div>
                          <div>Layer: {currentSettings.zIndex}</div>
                          <div>X: {currentSettings.xOffset}px</div>
                          <div>Y: {currentSettings.yOffset}px</div>
                          <div>Table: {currentSettings.showTable ? 'Yes' : 'No'}</div>
                          <div>Type: {currentSettings.tableType}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Panel with Room Context */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Live Room Preview</h3>
                    
                    {currentImage ? (
                      renderRoomPreview(selectedEquipment)
                    ) : (
                      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-6xl mb-4">📷</div>
                          <p className="text-lg">No image to preview</p>
                          <p className="text-sm">Upload an equipment image in the "Realistic Images" tab to see the preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {/* Apply to All Equipment */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">📋 Apply Layout to Other Equipment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (confirm('Apply current layout settings to all equipment types?')) {
                      const currentSettings = getEquipmentSettings(selectedEquipment);
                      equipmentTypes.forEach(equipment => {
                        if (equipment !== selectedEquipment) {
                          updateEquipmentSettings(equipment, currentSettings);
                        }
                      });
                      alert('Layout settings applied to all equipment!');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📤 Apply to All Equipment
                  <div className="text-xs mt-1 opacity-75">Copy current settings to all types</div>
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('Reset all equipment layout settings to defaults?')) {
                      const defaultSettings = {
                        size: 100,
                        xOffset: 0,
                        yOffset: 0,
                        zIndex: 10,
                        showTable: true,
                        tableType: 'default'
                      };
                      
                      equipmentTypes.forEach(equipment => {
                        updateEquipmentSettings(equipment, defaultSettings);
                      });
                      alert('All layout settings reset to defaults!');
                    }
                  }}
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🔄 Reset All Layouts
                  <div className="text-xs mt-1 opacity-75">All equipment to defaults</div>
                </button>
              </div>
            </div>
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
            
            {/* Import/Export Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">📦 Import/Export Configuration</h3>
              <p className="text-gray-600 mb-6">
                Backup and restore your entire lab configuration including images, questions, and settings.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Export Complete Configuration</h4>
                  <p className="text-sm text-green-600 mb-4">
                    Download all settings, questions, images, and configurations as a backup file.
                  </p>
                  <button
                    onClick={() => {
                      const fullConfig = {
                        labQuestions,
                        labImages,
                        equipmentImages,
                        backgroundImages,
                        equipmentSettings,
                        tableImages,
                        wordSettings,
                        exportDate: new Date().toISOString(),
                        version: '1.0'
                      };
                      
                      const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `microbiology_lab_config_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    💾 Export Configuration
                  </button>
                </div>
                
                <div className="border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Import Configuration</h4>
                  <p className="text-sm text-blue-600 mb-4">
                    Restore settings from a previously exported configuration file.
                  </p>
                  <label className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold cursor-pointer block text-center">
                    📁 Import Configuration
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const config = JSON.parse(event.target.result);
                              
                              if (confirm('This will replace all current settings. Are you sure?')) {
                                if (config.labQuestions) setLabQuestions(config.labQuestions);
                                if (config.labImages) setLabImages(config.labImages);
                                if (config.equipmentImages) setEquipmentImages(config.equipmentImages);
                                if (config.backgroundImages) setBackgroundImages(config.backgroundImages);
                                if (config.equipmentSettings) setEquipmentSettings(config.equipmentSettings);
                                if (config.tableImages) setTableImages(config.tableImages);
                                if (config.wordSettings) setWordSettings(config.wordSettings);
                                
                                alert('Configuration imported successfully!');
                              }
                            } catch (error) {
                              alert('Error importing configuration file. Please check the file format.');
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default InstructorInterface;
