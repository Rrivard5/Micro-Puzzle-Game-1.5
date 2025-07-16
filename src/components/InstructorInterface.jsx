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
