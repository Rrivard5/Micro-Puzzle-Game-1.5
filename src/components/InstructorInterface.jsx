import { useState, useEffect, useRef } from 'react';

const InstructorInterface = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [uploadingImages, setUploadingImages] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [studentProgress, setStudentProgress] = useState([]);
  const [wordSettings, setWordSettings] = useState({
    targetWord: '',
    numGroups: 15,
    groupLetters: {}
  });

  // Enhanced image management state
  const [processingImages, setProcessingImages] = useState({});
  const [backgroundImages, setBackgroundImages] = useState({});
  
  // Room Elements System
  const [roomElements, setRoomElements] = useState({});
  const [selectedElement, setSelectedElement] = useState(null);
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [selectedWall, setSelectedWall] = useState('north');
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newElementData, setNewElementData] = useState({
    name: '',
    type: 'equipment',
    wall: 'north',
    interactionType: 'question',
    revealedElementId: null,
    defaultIcon: '🔬',
    isRequired: true
  });

  // Game completion settings
  const [completionMode, setCompletionMode] = useState('all');
  const [finalElementId, setFinalElementId] = useState('');
  
  // Canvas ref for image processing
  const canvasRef = useRef(null);

  // Default equipment icons
  const defaultIcons = {
    microscope: '🔬',
    incubator: '🌡️',
    petriDish: '🧫',
    autoclave: '♨️',
    centrifuge: '🌪️',
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

  const wallOptions = ['north', 'east', 'south', 'west'];
  const elementTypes = {
    equipment: 'Lab Equipment',
    furniture: 'Furniture (tables, chairs, cabinets)',
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
    question: 'Show Question → Reveal Information',
    element: 'Reveal New Element',
    question_element: 'Show Question → Reveal New Element',
    zoom: 'Zoom In/Out (Click to Enlarge)'
  };

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
      loadStudentProgress();
      loadWordSettings();
      loadBackgroundImages();
      loadRoomElements();
      loadGameSettings();
      checkForDefaultEquipment();
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

  // Check and create default equipment if none exist
  const checkForDefaultEquipment = () => {
    const savedElements = localStorage.getItem('instructor-room-elements');
    if (!savedElements || savedElements === '{}') {
      // Create default microbiology equipment
      const defaultEquipment = {
        microscope: {
          id: 'microscope',
          name: 'Research Microscope',
          type: 'equipment',
          wall: 'north',
          interactionType: 'question',
          defaultIcon: '🔬',
          isRequired: true,
          settings: {
            size: 100,
            x: 50,
            y: 70,
            zIndex: 10
          },
          image: null,
          content: {
            info: 'Rod-shaped bacteria detected - likely Escherichia coli',
            question: {
              groups: {
                1: [{
                  id: 'mic1',
                  question: 'Looking at the bacterial specimen under 1000x magnification, what is the most likely shape classification of these cells?',
                  type: 'multiple_choice',
                  options: ['Cocci (spherical)', 'Bacilli (rod-shaped)', 'Spirilla (spiral)', 'Pleomorphic (variable)'],
                  answer: 'Bacilli (rod-shaped)',
                  hint: 'Look carefully at the elongated shape of the individual cells.',
                  clue: 'Rod-shaped bacteria detected - likely Escherichia coli',
                  randomizeAnswers: false,
                  info: 'Rod-shaped bacteria detected - likely Escherichia coli',
                  infoImage: null
                }]
              }
            }
          },
          isVisible: true,
          revealedBy: null
        },
        incubator: {
          id: 'incubator',
          name: 'CO₂ Incubator',
          type: 'equipment',
          wall: 'east',
          interactionType: 'question',
          defaultIcon: '🌡️',
          isRequired: true,
          settings: {
            size: 100,
            x: 30,
            y: 70,
            zIndex: 10
          },
          image: null,
          content: {
            info: 'Mesophilic conditions set - optimal for human pathogens',
            question: {
              groups: {
                1: [{
                  id: 'inc1',
                  question: 'The incubator display shows 37°C and 5% CO2. This environment is optimal for growing which type of microorganisms?',
                  type: 'multiple_choice',
                  options: ['Psychrophiles', 'Mesophiles', 'Thermophiles', 'Hyperthermophiles'],
                  answer: 'Mesophiles',
                  hint: 'Consider the temperature range and CO2 requirements for human pathogens.',
                  clue: 'Mesophilic conditions set - optimal for human pathogens',
                  randomizeAnswers: false,
                  info: 'Mesophilic conditions set - optimal for human pathogens',
                  infoImage: null
                }]
              }
            }
          },
          isVisible: true,
          revealedBy: null
        },
        petriDish: {
          id: 'petriDish',
          name: 'Bacterial Cultures',
          type: 'equipment',
          wall: 'west',
          interactionType: 'question',
          defaultIcon: '🧫',
          isRequired: true,
          settings: {
            size: 100,
            x: 50,
            y: 70,
            zIndex: 10
          },
          image: null,
          content: {
            info: 'Beta-hemolytic bacteria identified - Streptococcus pyogenes likely',
            question: {
              groups: {
                1: [{
                  id: 'pet1',
                  question: 'On the blood agar plate, you observe clear zones around some bacterial colonies. This indicates:',
                  type: 'multiple_choice',
                  options: ['Alpha hemolysis', 'Beta hemolysis', 'Gamma hemolysis', 'No hemolysis'],
                  answer: 'Beta hemolysis',
                  hint: 'Clear zones indicate complete breakdown of red blood cells.',
                  clue: 'Beta-hemolytic bacteria identified - Streptococcus pyogenes likely',
                  randomizeAnswers: false,
                  info: 'Beta-hemolytic bacteria identified - Streptococcus pyogenes likely',
                  infoImage: null
                }]
              }
            }
          },
          isVisible: true,
          revealedBy: null
        },
        autoclave: {
          id: 'autoclave',
          name: 'Steam Autoclave',
          type: 'equipment',
          wall: 'east',
          interactionType: 'question',
          defaultIcon: '♨️',
          isRequired: true,
          settings: {
            size: 100,
            x: 70,
            y: 70,
            zIndex: 10
          },
          image: null,
          content: {
            info: 'Sterilization protocol confirmed - equipment properly decontaminated',
            question: {
              groups: {
                1: [{
                  id: 'auto1',
                  question: 'For proper sterilization, the autoclave must reach what temperature and pressure for how long?',
                  type: 'multiple_choice',
                  options: ['121°C, 15 psi, 15 minutes', '100°C, 10 psi, 10 minutes', '134°C, 20 psi, 20 minutes', '80°C, 5 psi, 30 minutes'],
                  answer: '121°C, 15 psi, 15 minutes',
                  hint: 'Standard sterilization parameters for most laboratory equipment.',
                  clue: 'Sterilization protocol confirmed - equipment properly decontaminated',
                  randomizeAnswers: false,
                  info: 'Sterilization protocol confirmed - equipment properly decontaminated',
                  infoImage: null
                }]
              }
            }
          },
          isVisible: true,
          revealedBy: null
        },
        centrifuge: {
          id: 'centrifuge',
          name: 'Refrigerated Centrifuge',
          type: 'equipment',
          wall: 'south',
          interactionType: 'question',
          defaultIcon: '🌪️',
          isRequired: true,
          settings: {
            size: 100,
            x: 50,
            y: 70,
            zIndex: 10
          },
          image: null,
          content: {
            info: 'Density separation principle confirmed - sample fractionation successful',
            question: {
              groups: {
                1: [{
                  id: 'cent1',
                  question: 'When centrifuging blood samples, the heavier red blood cells settle at the bottom while the lighter plasma rises to the top. This separation is based on:',
                  type: 'multiple_choice',
                  options: ['Molecular weight', 'Density differences', 'Electrical charge', 'Surface tension'],
                  answer: 'Density differences',
                  hint: 'Think about what causes particles to separate when spun at high speed.',
                  clue: 'Density separation principle confirmed - sample fractionation successful',
                  randomizeAnswers: false,
                  info: 'Density separation principle confirmed - sample fractionation successful',
                  infoImage: null
                }]
              }
            }
          },
          isVisible: true,
          revealedBy: null
        }
      };
      
      setRoomElements(defaultEquipment);
      localStorage.setItem('instructor-room-elements', JSON.stringify(defaultEquipment));
    }
  };

  // Load functions
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

  const loadRoomElements = () => {
    const savedElements = localStorage.getItem('instructor-room-elements');
    if (savedElements) {
      try {
        setRoomElements(JSON.parse(savedElements));
      } catch (error) {
        console.error('Error loading room elements:', error);
      }
    }
  };

  const loadGameSettings = () => {
    const savedSettings = localStorage.getItem('instructor-game-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setCompletionMode(settings.completionMode || 'all');
        setFinalElementId(settings.finalElementId || '');
      } catch (error) {
        console.error('Error loading game settings:', error);
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
      localStorage.setItem('instructor-word-settings', JSON.stringify(wordSettings));
      localStorage.setItem('instructor-background-images', JSON.stringify(backgroundImages));
      localStorage.setItem('instructor-room-elements', JSON.stringify(roomElements));
      
      // Save game settings
      const gameSettings = {
        completionMode,
        finalElementId
      };
      localStorage.setItem('instructor-game-settings', JSON.stringify(gameSettings));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('All settings saved successfully!');
    } catch (error) {
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Room Elements Management
  const addRoomElement = () => {
    if (!newElementData.name.trim()) {
      alert('Please enter a name for the element');
      return;
    }

    const elementId = `${newElementData.type}_${Date.now()}`;
    const newElement = {
      id: elementId,
      name: newElementData.name,
      type: newElementData.type,
      wall: newElementData.wall,
      interactionType: newElementData.interactionType,
      revealedElementId: newElementData.revealedElementId,
      defaultIcon: newElementData.defaultIcon || defaultIcons[newElementData.type] || '📦',
      isRequired: newElementData.isRequired,
      settings: {
        size: 100,
        x: 50,
        y: 50,
        zIndex: 10
      },
      image: null,
      content: {
        info: ['info', 'question'].includes(newElementData.interactionType) ? 'Information revealed when clicked...' : '',
        question: ['question', 'question_element'].includes(newElementData.interactionType) ? {
          groups: {
            1: [{
              id: `${elementId}_q1`,
              question: `Question about ${newElementData.name}...`,
              type: 'multiple_choice',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              answer: 'Option A',
              hint: 'Hint for this question...',
              clue: 'Clue revealed when solved...',
              randomizeAnswers: false,
              info: 'Information revealed when solved...',
              infoImage: null
            }]
          }
        } : null
      },
      isVisible: true,
      revealedBy: null
    };

    setRoomElements(prev => ({
      ...prev,
      [elementId]: newElement
    }));

    setNewElementData({
      name: '',
      type: 'equipment',
      wall: 'north',
      interactionType: 'question',
      revealedElementId: null,
      defaultIcon: '🔬',
      isRequired: true
    });
    setShowAddElementModal(false);
  };

  const updateElementSettings = (elementId, newSettings) => {
    setRoomElements(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        settings: {
          ...prev[elementId].settings,
          ...newSettings
        }
      }
    }));
  };

  const updateElementContent = (elementId, contentType, content) => {
    setRoomElements(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        content: {
          ...prev[elementId].content,
          [contentType]: content
        }
      }
    }));
  };

  const updateElementQuestion = (elementId, groupNumber, questionData) => {
    setRoomElements(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        content: {
          ...prev[elementId].content,
          question: {
            ...prev[elementId].content.question,
            groups: {
              ...prev[elementId].content.question?.groups,
              [groupNumber]: [questionData]
            }
          }
        }
      }
    }));
  };

  const handleElementImageUpload = async (event, elementId) => {
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

    setProcessingImages(prev => ({ ...prev, [elementId]: true }));

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const originalDataURL = e.target.result;
        const processedImageData = await processImage(file);
        
        setRoomElements(prev => ({
          ...prev,
          [elementId]: {
            ...prev[elementId],
            image: {
              original: originalDataURL,
              processed: processedImageData,
              name: file.name,
              size: file.size,
              lastModified: new Date().toISOString()
            }
          }
        }));
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setProcessingImages(prev => ({ ...prev, [elementId]: false }));
    }
  };

  const deleteRoomElement = (elementId) => {
    if (confirm('Are you sure you want to delete this room element?')) {
      setRoomElements(prev => {
        const updated = { ...prev };
        delete updated[elementId];
        return updated;
      });
      if (selectedElement === elementId) {
        setSelectedElement(null);
      }
      if (selectedElementId === elementId) {
        setSelectedElementId(null);
      }
      // Clear final element if it's being deleted
      if (finalElementId === elementId) {
        setFinalElementId('');
      }
    }
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

  const processImage = (file) => {
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

  const removeBackgroundImage = (wallType) => {
    if (confirm('Are you sure you want to remove this background image?')) {
      setBackgroundImages(prev => {
        const updated = { ...prev };
        delete updated[wallType];
        return updated;
      });
    }
  };

  const addNewGroup = (elementId) => {
    const element = roomElements[elementId];
    if (!element || !element.content?.question) return;
    
    const existingGroups = Object.keys(element.content.question.groups).map(Number);
    const newGroupNumber = existingGroups.length > 0 ? Math.max(...existingGroups) + 1 : 1;
    
    const defaultQuestion = {
      id: `${elementId}_g${newGroupNumber}`,
      question: `New question for group ${newGroupNumber}...`,
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
      hint: 'Hint for this question...',
      clue: 'Clue revealed when solved...',
      randomizeAnswers: false,
      info: 'Information revealed when solved...',
      infoImage: null
    };
    
    updateElementQuestion(elementId, newGroupNumber, defaultQuestion);
    setSelectedGroup(newGroupNumber);
  };

  // Drag and drop handlers
  const handleMouseDown = (e, elementId) => {
    e.preventDefault();
    setDraggedElement(elementId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedElement) return;
    
    const previewElement = document.getElementById('room-preview');
    if (!previewElement) return;
    
    const previewRect = previewElement.getBoundingClientRect();
    const x = ((e.clientX - previewRect.left - dragOffset.x) / previewRect.width) * 100;
    const y = ((e.clientY - previewRect.top - dragOffset.y) / previewRect.height) * 100;
    
    setRoomElements(prev => ({
      ...prev,
      [draggedElement]: {
        ...prev[draggedElement],
        settings: {
          ...prev[draggedElement].settings,
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        }
      }
    }));
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleInfoImageUpload = (event, elementId, groupNumber) => {
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

      const uploadKey = `${elementId}_${groupNumber}_info`;
      setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const element = roomElements[elementId];
        if (element?.content?.question?.groups?.[groupNumber]?.[0]) {
          const currentQuestion = element.content.question.groups[groupNumber][0];
          const updatedQuestion = {
            ...currentQuestion,
            infoImage: {
              data: e.target.result,
              name: file.name,
              size: file.size,
              lastModified: new Date().toISOString()
            }
          };
          updateElementQuestion(elementId, groupNumber, updatedQuestion);
        }
        setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeInfoImage = (elementId, groupNumber) => {
    if (confirm('Are you sure you want to remove this info image?')) {
      const element = roomElements[elementId];
      if (element?.content?.question?.groups?.[groupNumber]?.[0]) {
        const currentQuestion = element.content.question.groups[groupNumber][0];
        const updatedQuestion = {
          ...currentQuestion,
          infoImage: null
        };
        updateElementQuestion(elementId, groupNumber, updatedQuestion);
      }
    }
  };

  // Add event listeners for mouse events
  useEffect(() => {
    if (draggedElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedElement, dragOffset]);

  // Render the component
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🧪 Microbiology Lab Instructor Portal
            </h1>
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

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['dashboard', 'room-setup', 'word-scramble', 'progress'].map(tab => (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800">Room Elements</h3>
                  <p className="text-2xl font-bold text-blue-600">{Object.keys(roomElements).length}</p>
                  <p className="text-sm text-blue-600">Total elements configured</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-bold text-green-800">Student Groups</h3>
                  <p className="text-2xl font-bold text-green-600">{wordSettings.numGroups}</p>
                  <p className="text-sm text-green-600">Groups configured</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-bold text-purple-800">Target Word</h3>
                  <p className="text-2xl font-bold text-purple-600">{wordSettings.targetWord || 'Not Set'}</p>
                  <p className="text-sm text-purple-600">Word scramble answer</p>
                </div>
              </div>
            </div>

            {/* Game Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Game Completion Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Mode
                  </label>
                  <select
                    value={completionMode}
                    onChange={(e) => setCompletionMode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Complete All Required Elements</option>
                    <option value="final">Complete Specific Final Element Only</option>
                  </select>
                </div>

                {completionMode === 'final' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Element (Must be solved to complete)
                    </label>
                    <select
                      value={finalElementId}
                      onChange={(e) => setFinalElementId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select final element...</option>
                      {Object.entries(roomElements)
                        .filter(([id, el]) => ['info', 'question', 'element', 'question_element'].includes(el.interactionType))
                        .map(([id, element]) => (
                          <option key={id} value={id}>
                            {element.name} ({element.wall} wall)
                          </option>
                        ))}
                    </select>
                    {finalElementId && (
                      <p className="text-sm text-green-600 mt-2">
                        ⭐ Students must complete "{roomElements[finalElementId]?.name}" to finish the lab
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Room Setup Tab */}
        {activeTab === 'room-setup' && (
          <div className="space-y-6">
            {/* Background Images Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Room Background Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {wallOptions.map(wall => (
                  <div key={wall} className="space-y-2">
                    <h3 className="font-medium text-gray-700 capitalize">{wall} Wall</h3>
                    {backgroundImages[wall] ? (
                      <div className="relative">
                        <img
                          src={backgroundImages[wall].data}
                          alt={`${wall} wall background`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          onClick={() => removeBackgroundImage(wall)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <label className="cursor-pointer text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBackgroundImageUpload(e, wall)}
                            className="hidden"
                          />
                          <div className="text-gray-500">
                            <div className="text-2xl mb-1">📷</div>
                            <div className="text-xs">Upload Image</div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Room Elements Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Room Elements</h2>
                <button
                  onClick={() => setShowAddElementModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  + Add Element
                </button>
              </div>

              {Object.keys(roomElements).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No elements added yet. Click "Add Element" to create your first room element.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(roomElements).map(([elementId, element]) => (
                    <div key={elementId} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{element.name}</h3>
                          <p className="text-sm text-gray-600">
                            Type: {elementTypes[element.type]} | Wall: {element.wall} | 
                            Interaction: {interactionTypes[element.interactionType]}
                            {element.isRequired && ' | Required ✓'}
                            {completionMode === 'final' && finalElementId === elementId && ' | ⭐ Final Element'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteRoomElement(elementId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      {/* Element Image */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {element.image ? (
                            <img
                              src={element.image.processed || element.image.original}
                              alt={element.name}
                              className="w-24 h-24 object-contain rounded-lg border-2 border-gray-300"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <span className="text-3xl">{element.defaultIcon}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 inline-block">
                            {processingImages[elementId] ? 'Processing...' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleElementImageUpload(e, elementId)}
                              className="hidden"
                              disabled={processingImages[elementId]}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            White backgrounds will be automatically removed
                          </p>
                        </div>
                      </div>

                      {/* Element Settings */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Size (px)</label>
                          <input
                            type="number"
                            value={element.settings.size}
                            onChange={(e) => updateElementSettings(elementId, { size: parseInt(e.target.value) || 100 })}
                            className="w-full px-2 py-1 border rounded"
                            min="20"
                            max="300"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">X Position (%)</label>
                          <input
                            type="number"
                            value={Math.round(element.settings.x)}
                            onChange={(e) => updateElementSettings(elementId, { x: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border rounded"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Y Position (%)</label>
                          <input
                            type="number"
                            value={Math.round(element.settings.y)}
                            onChange={(e) => updateElementSettings(elementId, { y: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border rounded"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Z-Index Layer</label>
                          <select
                            value={element.settings.zIndex}
                            onChange={(e) => updateElementSettings(elementId, { zIndex: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 border rounded"
                          >
                            {Object.entries(zIndexLayers).map(([value, description]) => (
                              <option key={value} value={value}>
                                {value} - {description}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Content Configuration */}
                      {['info', 'question', 'question_element'].includes(element.interactionType) && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Information Text</label>
                            <textarea
                              value={element.content?.info || ''}
                              onChange={(e) => updateElementContent(elementId, 'info', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg"
                              rows="2"
                              placeholder="Information revealed when element is clicked or question is solved..."
                            />
                          </div>

                          {['question', 'question_element'].includes(element.interactionType) && (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Questions by Group
                                </label>
                                <button
                                  onClick={() => addNewGroup(elementId)}
                                  className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                  + Add Group
                                </button>
                              </div>

                              {element.content?.question?.groups && (
                                <div className="space-y-2">
                                  {Object.entries(element.content.question.groups).map(([groupNum, questions]) => {
                                    const question = questions[0];
                                    return (
                                      <div key={groupNum} className="border rounded-lg p-3 bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                          <h4 className="font-medium text-gray-700">Group {groupNum}</h4>
                                          <button
                                            onClick={() => setSelectedGroup(parseInt(groupNum))}
                                            className={`text-sm px-2 py-1 rounded ${
                                              selectedGroup === parseInt(groupNum)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                            }`}
                                          >
                                            {selectedGroup === parseInt(groupNum) ? 'Editing' : 'Edit'}
                                          </button>
                                        </div>

                                        {selectedGroup === parseInt(groupNum) && (
                                          <div className="space-y-3">
                                            <textarea
                                              value={question?.question || ''}
                                              onChange={(e) => updateElementQuestion(elementId, groupNum, {
                                                ...question,
                                                question: e.target.value
                                              })}
                                              className="w-full px-2 py-1 border rounded text-sm"
                                              rows="2"
                                              placeholder="Enter question..."
                                            />

                                            {question?.type === 'multiple_choice' && (
                                              <div className="space-y-2">
                                                <label className="text-xs text-gray-600">Options:</label>
                                                {question.options?.map((option, idx) => (
                                                  <input
                                                    key={idx}
                                                    value={option}
                                                    onChange={(e) => {
                                                      const newOptions = [...question.options];
                                                      newOptions[idx] = e.target.value;
                                                      updateElementQuestion(elementId, groupNum, {
                                                        ...question,
                                                        options: newOptions
                                                      });
                                                    }}
                                                    className="w-full px-2 py-1 border rounded text-sm"
                                                    placeholder={`Option ${idx + 1}`}
                                                  />
                                                ))}
                                              </div>
                                            )}

                                            <input
                                              value={question?.answer || ''}
                                              onChange={(e) => updateElementQuestion(elementId, groupNum, {
                                                ...question,
                                                answer: e.target.value
                                              })}
                                              className="w-full px-2 py-1 border rounded text-sm"
                                              placeholder="Correct answer..."
                                            />

                                            <input
                                              value={question?.hint || ''}
                                              onChange={(e) => updateElementQuestion(elementId, groupNum, {
                                                ...question,
                                                hint: e.target.value
                                              })}
                                              className="w-full px-2 py-1 border rounded text-sm"
                                              placeholder="Hint (optional)..."
                                            />

                                            <div className="flex items-center space-x-2">
                                              <input
                                                type="checkbox"
                                                checked={question?.randomizeAnswers || false}
                                                onChange={(e) => updateElementQuestion(elementId, groupNum, {
                                                  ...question,
                                                  randomizeAnswers: e.target.checked
                                                })}
                                                className="rounded"
                                              />
                                              <label className="text-sm text-gray-700">
                                                Randomize answer order for each student
                                              </label>
                                            </div>

                                            {/* Info Image Upload */}
                                            <div className="border-t pt-3">
                                              <label className="text-sm font-medium text-gray-700">
                                                Info Image (shown after correct answer)
                                              </label>
                                              {question?.infoImage ? (
                                                <div className="mt-2 relative">
                                                  <img
                                                    src={question.infoImage.data}
                                                    alt="Info"
                                                    className="w-32 h-32 object-cover rounded border"
                                                  />
                                                  <button
                                                    onClick={() => removeInfoImage(elementId, groupNum)}
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                                                  >
                                                    ✕
                                                  </button>
                                                </div>
                                              ) : (
                                                <label className="mt-2 cursor-pointer inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
                                                  {uploadingImages[`${elementId}_${groupNum}_info`] ? 'Uploading...' : 'Upload Image'}
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleInfoImageUpload(e, elementId, groupNum)}
                                                    className="hidden"
                                                    disabled={uploadingImages[`${elementId}_${groupNum}_info`]}
                                                  />
                                                </label>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reveal Element Configuration */}
                      {['element', 'question_element'].includes(element.interactionType) && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Element to Reveal When Solved
                          </label>
                          <select
                            value={element.revealedElementId || ''}
                            onChange={(e) => setRoomElements(prev => ({
                              ...prev,
                              [elementId]: {
                                ...prev[elementId],
                                revealedElementId: e.target.value
                              }
                            }))}
                            className="w-full px-3 py-2 border rounded-lg mt-1"
                          >
                            <option value="">None - No element revealed</option>
                            {Object.entries(roomElements)
                              .filter(([id]) => id !== elementId)
                              .map(([id, el]) => (
                                <option key={id} value={id}>
                                  {el.name} ({el.wall} wall)
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      {/* Visual Position Preview */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Position Preview ({element.wall} wall)
                        </h4>
                        <div 
                          id="room-preview"
                          className="relative w-full h-48 bg-white border-2 border-gray-300 rounded"
                          style={{
                            backgroundImage: backgroundImages[element.wall] 
                              ? `url('${backgroundImages[element.wall].data}')`
                              : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div
                            className="absolute cursor-move"
                            style={{
                              left: `${element.settings.x}%`,
                              top: `${element.settings.y}%`,
                              transform: 'translate(-50%, -50%)',
                              zIndex: element.settings.zIndex
                            }}
                            onMouseDown={(e) => handleMouseDown(e, elementId)}
                          >
                            {element.image ? (
                              <img
                                src={element.image.processed || element.image.original}
                                alt={element.name}
                                className="object-contain"
                                style={{
                                  width: `${element.settings.size / 2}px`,
                                  height: `${element.settings.size / 2}px`
                                }}
                                draggable={false}
                              />
                            ) : (
                              <div
                                className="bg-blue-100 border-2 border-blue-300 rounded flex items-center justify-center"
                                style={{
                                  width: `${element.settings.size / 2}px`,
                                  height: `${element.settings.size / 2}px`
                                }}
                              >
                                <span className="text-2xl">{element.defaultIcon}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Drag the element to reposition it
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">Student Progress</h2>
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
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentProgress.map((student, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.group}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.progress}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.completionTime || 'In Progress'}
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

      {/* Add Element Modal */}
      {showAddElementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Room Element</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Element Name
                </label>
                <input
                  type="text"
                  value={newElementData.name}
                  onChange={(e) => setNewElementData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Microscope, Incubator..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Element Type
                </label>
                <select
                  value={newElementData.type}
                  onChange={(e) => setNewElementData(prev => ({ 
                    ...prev, 
                    type: e.target.value,
                    defaultIcon: defaultIcons[e.target.value] || '📦'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(elementTypes).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wall Location
                </label>
                <select
                  value={newElementData.wall}
                  onChange={(e) => setNewElementData(prev => ({ ...prev, wall: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {wallOptions.map(wall => (
                    <option key={wall} value={wall}>{wall.charAt(0).toUpperCase() + wall.slice(1)} Wall</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interaction Type
                </label>
                <select
                  value={newElementData.interactionType}
                  onChange={(e) => setNewElementData(prev => ({ ...prev, interactionType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(interactionTypes).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={newElementData.isRequired}
                  onChange={(e) => setNewElementData(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700">
                  Required for completion
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Icon
                </label>
                <input
                  type="text"
                  value={newElementData.defaultIcon}
                  onChange={(e) => setNewElementData(prev => ({ ...prev, defaultIcon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter an emoji..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddElementModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addRoomElement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Element
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default InstructorInterface;
