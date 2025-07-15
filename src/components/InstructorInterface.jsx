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
  const [equipmentImages, setEquipmentImages] = useState({});
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
    type: 'furniture',
    wall: 'north',
    interactionType: 'none',
    revealedElementId: null
  });

  // Game completion settings
  const [completionMode, setCompletionMode] = useState('all');
  const [finalElementId, setFinalElementId] = useState('');

  // Equipment positioning - Updated to match student room
  const [equipmentPositions, setEquipmentPositions] = useState({
    north: [],
    east: [],
    south: [],
    west: []
  });
  
  // Canvas ref for image processing
  const canvasRef = useRef(null);

  const equipmentTypes = ['microscope', 'incubator', 'petriDish', 'autoclave', 'centrifuge'];
  const wallOptions = ['north', 'east', 'south', 'west'];
  const elementTypes = {
    furniture: 'Furniture (tables, chairs, cabinets)',
    equipment: 'Lab Equipment (non-interactive)',
    decoration: 'Decorative Items',
    safety: 'Safety Equipment',
    storage: 'Storage Items'
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
      loadLabContent();
      loadStudentProgress();
      loadWordSettings();
      loadEquipmentImages();
      loadBackgroundImages();
      loadRoomElements();
      loadGameSettings();
      loadEquipmentPositions();
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

  // Load equipment positions
  const loadEquipmentPositions = () => {
    const savedPositions = localStorage.getItem('instructor-equipment-positions');
    if (savedPositions) {
      try {
        setEquipmentPositions(JSON.parse(savedPositions));
      } catch (error) {
        console.error('Error loading equipment positions:', error);
        initializeDefaultEquipmentPositions();
      }
    } else {
      initializeDefaultEquipmentPositions();
    }
  };

  // Initialize default equipment positions to match student room coordinates
  const initializeDefaultEquipmentPositions = () => {
    const defaultPositions = {
      north: [
        { equipmentType: 'microscope', x: 20, y: 50, size: 120, zIndex: 10 }
      ],
      east: [
        { equipmentType: 'incubator', x: 20, y: 40, size: 120, zIndex: 10 },
        { equipmentType: 'autoclave', x: 60, y: 40, size: 120, zIndex: 10 }
      ],
      south: [
        { equipmentType: 'centrifuge', x: 50, y: 40, size: 120, zIndex: 10 }
      ],
      west: [
        { equipmentType: 'petriDish', x: 50, y: 40, size: 120, zIndex: 10 }
      ]
    };
    setEquipmentPositions(defaultPositions);
  };

  // Update equipment position
  const updateEquipmentPosition = (equipmentType, newSettings) => {
    setEquipmentPositions(prev => {
      const updated = { ...prev };
      
      // Find and update the equipment across all walls
      Object.keys(updated).forEach(wall => {
        const equipmentIndex = updated[wall].findIndex(eq => eq.equipmentType === equipmentType);
        if (equipmentIndex !== -1) {
          updated[wall][equipmentIndex] = {
            ...updated[wall][equipmentIndex],
            ...newSettings
          };
        }
      });
      
      return updated;
    });
  };

  // Move equipment to different wall
  const moveEquipmentToWall = (equipmentType, targetWall) => {
    setEquipmentPositions(prev => {
      const updated = { ...prev };
      let equipmentData = null;
      
      // Remove equipment from current wall
      Object.keys(updated).forEach(wall => {
        const equipmentIndex = updated[wall].findIndex(eq => eq.equipmentType === equipmentType);
        if (equipmentIndex !== -1) {
          equipmentData = updated[wall][equipmentIndex];
          updated[wall].splice(equipmentIndex, 1);
        }
      });
      
      // Add equipment to target wall
      if (equipmentData) {
        updated[targetWall].push({
          ...equipmentData,
          x: 50, // Reset position to center
          y: 40
        });
      }
      
      return updated;
    });
  };

  // Get equipment on specific wall
  const getEquipmentOnWall = (wall) => {
    return equipmentPositions[wall] || [];
  };

  // Load game settings
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

  // Get all available items for final element selection
  const getAvailableFinalElements = () => {
    const items = [];
    
    // Add interactive room elements
    Object.entries(roomElements).forEach(([id, element]) => {
      if (['info', 'question', 'element', 'question_element'].includes(element.interactionType)) {
        items.push({
          id,
          name: element.name,
          type: 'Room Element',
          interactionType: element.interactionType
        });
      }
    });
    
    // Add equipment
    equipmentTypes.forEach(equipmentType => {
      items.push({
        id: equipmentType,
        name: equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1).replace(/([A-Z])/g, ' $1'),
        type: 'Equipment',
        interactionType: 'question'
      });
    });
    
    return items;
  };

  const handleInfoImageUpload = (event, equipment, groupNumber) => {
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

      const uploadKey = `${equipment}_${groupNumber}_info`;
      setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const currentQuestion = labQuestions[equipment]?.groups?.[groupNumber]?.[0];
        if (currentQuestion) {
          const updatedQuestion = {
            ...currentQuestion,
            infoImage: {
              data: e.target.result,
              name: file.name,
              size: file.size,
              lastModified: new Date().toISOString()
            }
          };
          updateQuestion(equipment, groupNumber, updatedQuestion);
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

  const removeInfoImage = (equipment, groupNumber) => {
    if (confirm('Are you sure you want to remove this info image?')) {
      const currentQuestion = labQuestions[equipment]?.groups?.[groupNumber]?.[0];
      if (currentQuestion) {
        const updatedQuestion = {
          ...currentQuestion,
          infoImage: null
        };
        updateQuestion(equipment, groupNumber, updatedQuestion);
      }
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
            interactionType: 'question',
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
      },
      incubator: {
        groups: {
          1: [{
            id: 'inc1',
            interactionType: 'question',
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
      },
      petriDish: {
        groups: {
          1: [{
            id: 'pet1',
            interactionType: 'question',
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
      },
      autoclave: {
        groups: {
          1: [{
            id: 'auto1',
            interactionType: 'question',
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
      },
      centrifuge: {
        groups: {
          1: [{
            id: 'cent1',
            interactionType: 'question',
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
      localStorage.setItem('instructor-room-elements', JSON.stringify(roomElements));
      localStorage.setItem('instructor-equipment-positions', JSON.stringify(equipmentPositions));
      
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
      settings: {
        size: 100,
        xOffset: 0,
        yOffset: 0,
        zIndex: 3,
        x: 50,
        y: 50
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
              randomizeAnswers: false
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
      type: 'furniture',
      wall: 'north',
      interactionType: 'none',
      revealedElementId: null
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
      const originalDataURL = URL.createObjectURL(file);
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

  const handleEquipmentImageUpload = async (event, equipment) => {
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

    const uploadKey = equipment;
    setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
    setProcessingImages(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const originalDataURL = URL.createObjectURL(file);
      const processedImageData = await processImage(file);
      
      setEquipmentImages(prev => ({
        ...prev,
        [equipment]: {
          original: originalDataURL,
          processed: processedImageData,
          name: file.name,
          size: file.size,
          lastModified: new Date().toISOString(),
          equipment
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

  const removeEquipmentImage = (equipment) => {
    if (confirm('Are you sure you want to remove this equipment image?')) {
      setEquipmentImages(prev => {
        const updated = { ...prev };
        delete updated[equipment];
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

  const addNewGroup = (equipment) => {
    const existingGroups = Object.keys(labQuestions[equipment].groups).map(Number);
    const newGroupNumber = existingGroups.length > 0 ? Math.max(...existingGroups) + 1 : 1;
    
    const defaultQuestion = {
      id: `${equipment}1`,
      interactionType: 'question',
      question: `New ${equipment} question for group ${newGroupNumber}...`,
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
      hint: 'Hint for this question...',
      clue: 'Clue revealed when solved...',
      randomizeAnswers: false,
      info: 'Information revealed when solved...',
      infoImage: null
    };
    
    updateQuestion(equipment, newGroupNumber, defaultQuestion);
    setSelectedGroup(newGroupNumber);
  };

  // Drag and drop handlers
  const handleMouseDown = (e, elementId) => {
    e.preventDefault();
    setDraggedElement(elementId);
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedElement) return;
    
    const previewRect = document.getElementById('room-preview').getBoundingClientRect();
    const x = ((e.clientX - previewRect.left - dragOffset.x) / previewRect.width) * 100;
    const y = ((e.clientY - previewRect.top - dragOffset.y) / previewRect.height) * 100;
    
    // Check if it's a room element or equipment
    if (roomElements[draggedElement]) {
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
    } else {
      // It's equipment
      updateEquipmentPosition(draggedElement, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Equipment drag handlers
  const handleEquipmentMouseDown = (e, equipmentType) => {
    e.preventDefault();
    setDraggedElement(equipmentType);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Updated room preview component with proper scaling and positioning
  const renderRoomPreview = () => {
    const wallElements = Object.entries(roomElements).filter(([id, element]) => element.wall === selectedWall);
    const wallEquipment = getEquipmentOnWall(selectedWall);
    const backgroundImage = backgroundImages[selectedWall];
    
    return (
      <div 
        id="room-preview"
        className="relative bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden"
        style={{
          width: '100%',
          height: '400px', // Fixed height for consistent preview
          backgroundImage: backgroundImage 
            ? `url('${backgroundImage.data}')`
            : undefined,
          backgroundSize: backgroundImage ? 'cover' : 'auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Default SVG background when no custom background - matching student room */}
        {!backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`
                <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#f1f5f9"/>
                      <stop offset="100%" stop-color="#e2e8f0"/>
                    </linearGradient>
                    <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#ffffff"/>
                      <stop offset="100%" stop-color="#f8fafc"/>
                    </linearGradient>
                    <pattern id="floorTiles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="#f8fafc"/>
                      <rect width="38" height="38" x="1" y="1" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
                    </pattern>
                  </defs>
                  
                  <polygon points="80,120 720,120 760,380 40,380" fill="url(#floorTiles)" stroke="#cbd5e0" stroke-width="2"/>
                  <polygon points="120,40 680,40 720,120 80,120" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  <polygon points="80,120 120,40 120,280 80,360" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  <polygon points="680,40 720,120 720,360 680,280" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  <polygon points="150,200 650,200 680,240 120,240" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
                  <polygon points="120,240 680,240 680,260 120,260" fill="#d1d5db"/>
                  <polygon points="680,240 720,280 720,300 680,260" fill="#cbd5e0"/>
                  <ellipse cx="250" cy="55" rx="50" ry="8" fill="#fef3c7" opacity="0.9"/>
                  <ellipse cx="400" cy="58" rx="60" ry="10" fill="#fef3c7" opacity="0.9"/>
                  <ellipse cx="550" cy="55" rx="50" ry="8" fill="#fef3c7" opacity="0.9"/>
                </svg>
              `)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
        
        {/* Room Elements - positioned to match student room */}
        {wallElements.map(([elementId, element]) => (
          <div
            key={elementId}
            className={`absolute cursor-move transition-all duration-200 ${
              selectedElement === elementId ? 'ring-2 ring-blue-500' : ''
            } ${draggedElement === elementId ? 'z-50' : ''} ${
              finalElementId === elementId ? 'ring-4 ring-yellow-400' : ''
            }`}
            style={{
              left: `${element.settings.x}%`,
              top: `${element.settings.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: element.settings.zIndex
            }}
            onClick={() => setSelectedElement(elementId)}
            onMouseDown={(e) => handleMouseDown(e, elementId)}
          >
            {element.image ? (
              <img
                src={element.image.processed}
                alt={element.name}
                className="object-contain transition-all duration-300 pointer-events-none"
                style={{
                  width: `${element.settings.size * 0.6}px`, // Scale down for preview
                  height: `${element.settings.size * 0.6}px`,
                  filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.4))'
                }}
              />
            ) : (
              <div
                className="bg-gray-300 border-2 border-gray-500 rounded-lg flex items-center justify-center"
                style={{
                  width: `${element.settings.size * 0.4}px`, // Scale placeholder appropriately
                  height: `${element.settings.size * 0.4}px`
                }}
              >
                <div className="text-gray-600 text-center">
                  <div className="text-sm mb-1">📦</div>
                  <div className="text-xs">{element.name}</div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Equipment - positioned to match student room */}
        {wallEquipment.map((equipment) => {
          const equipmentImage = equipmentImages[equipment.equipmentType];
          if (!equipmentImage) return null;
          
          return (
            <div
              key={equipment.equipmentType}
              className={`absolute cursor-move transition-all duration-200 ${
                selectedElement === equipment.equipmentType ? 'ring-2 ring-green-500' : ''
              } ${draggedElement === equipment.equipmentType ? 'z-50' : ''} ${
                finalElementId === equipment.equipmentType ? 'ring-4 ring-yellow-400' : ''
              }`}
              style={{
                left: `${equipment.x}%`,
                top: `${equipment.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: equipment.zIndex
              }}
              onClick={() => setSelectedElement(equipment.equipmentType)}
              onMouseDown={(e) => handleEquipmentMouseDown(e, equipment.equipmentType)}
            >
              <img
                src={equipmentImage.processed}
                alt={equipment.equipmentType}
                className="object-contain transition-all duration-300 pointer-events-none"
                style={{
                  width: `${equipment.size * 0.6}px`, // Scale down for preview
                  height: `${equipment.size * 0.6}px`,
                  filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.4))'
                }}
              />
            </div>
          );
        })}
        
        {/* Grid overlay for reference */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 400">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
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
            <p className="text-gray-600">Enhanced Room Builder System</p>
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
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">🧪 Microbiology Lab - Room Builder</h1>
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
              { id: 'questions', name: 'Questions & Info', icon: '❓' },
              { id: 'equipment-images', name: 'Equipment Images', icon: '📸' },
              { id: 'room-builder', name: 'Room Builder', icon: '🏗️' },
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

        {/* Questions & Info Management */}
        {activeTab === 'questions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">❓ Questions & Information Management</h2>
            </div>
            
            {/* Item Type Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Item to Configure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Equipment */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Lab Equipment</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(labQuestions).map(equipment => (
                      <button
                        key={equipment}
                        onClick={() => {
                          setSelectedElementId(equipment);
                        }}
                        className={`p-3 rounded-lg font-medium transition-colors text-left ${
                          selectedElementId === equipment
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {equipment === 'microscope' && '🔬'} 
                        {equipment === 'incubator' && '🌡️'} 
                        {equipment === 'petriDish' && '🧫'} 
                        {equipment === 'autoclave' && '♨️'} 
                        {equipment === 'centrifuge' && '🌪️'}
                        {' '}
                        {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/([A-Z])/g, ' $1')}
                        {finalElementId === equipment && <span className="text-yellow-300 ml-1">⭐</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Room Elements */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Room Elements</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {Object.entries(roomElements).map(([elementId, element]) => (
                      <button
                        key={elementId}
                        onClick={() => {
                          setSelectedElementId(elementId);
                        }}
                        className={`p-3 rounded-lg font-medium transition-colors text-left ${
                          selectedElementId === elementId
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {element.interactionType === 'none' ? '📦' : 
                         element.interactionType === 'zoom' ? '🔍' : '🔍'} {element.name}
                        {finalElementId === elementId && <span className="text-yellow-300 ml-1">⭐</span>}
                        <div className="text-xs opacity-75">
                          {interactionTypes[element.interactionType]}
                        </div>
                      </button>
                    ))}
                  </div>
                  {Object.entries(roomElements).length === 0 && (
                    <div className="text-gray-500 text-sm italic p-3">
                      No room elements yet. Create some in the Room Builder tab.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Group Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Configure for Groups
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
              
              {equipmentTypes.includes(selectedElementId) && (
                <button
                  onClick={() => addNewGroup(selectedElementId)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add New Group
                </button>
              )}
            </div>

            {/* Question/Info Configuration */}
            {selectedElementId && selectedGroup && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Configure {roomElements[selectedElementId] ? roomElements[selectedElementId].name : selectedElementId?.charAt(0).toUpperCase() + selectedElementId?.slice(1)} - Group {selectedGroup}
                  {finalElementId === selectedElementId && <span className="text-yellow-600 ml-2">⭐ FINAL ELEMENT</span>}
                </h3>
                
                {/* Equipment Configuration */}
                {equipmentTypes.includes(selectedElementId) && (() => {
                  const currentQuestion = labQuestions[selectedElementId]?.groups?.[selectedGroup]?.[0] || {
                    id: `${selectedElementId}1`,
                    interactionType: 'question',
                    question: '',
                    type: 'multiple_choice',
                    options: ['', '', '', ''],
                    answer: '',
                    hint: '',
                    clue: '',
                    randomizeAnswers: false,
                    info: '',
                    infoImage: null
                  };
                  
                  return (
                    <div className="space-y-6">
                      {/* Interaction Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Type</label>
                        <select
                          value={currentQuestion.interactionType}
                          onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                            ...currentQuestion, 
                            interactionType: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="info">Show Information Only</option>
                          <option value="question">Require Question First → Show Information</option>
                        </select>
                      </div>

                      {/* Question Configuration (only if question type) */}
                      {currentQuestion.interactionType === 'question' && (
                        <div className="space-y-4 border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium text-blue-800">Question Configuration</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                            <textarea
                              value={currentQuestion.question}
                              onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                question: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Enter the microbiology question..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                            <select
                              value={currentQuestion.type}
                              onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                type: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="text">Text Input</option>
                            </select>
                          </div>

                          {currentQuestion.type === 'multiple_choice' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                              {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="radio"
                                    name={`answer-${selectedElementId}-${selectedGroup}`}
                                    checked={currentQuestion.answer === option}
                                    onChange={() => updateQuestion(selectedElementId, selectedGroup, { 
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
                                      updateQuestion(selectedElementId, selectedGroup, { 
                                        ...currentQuestion, 
                                        options: newOptions 
                                      });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  />
                                </div>
                              ))}
                              
                              <div className="mt-2">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={currentQuestion.randomizeAnswers || false}
                                    onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                                      ...currentQuestion, 
                                      randomizeAnswers: e.target.checked 
                                    })}
                                    className="mr-2"
                                  />
                                  Randomize answer order for each student
                                </label>
                              </div>
                            </div>
                          )}

                          {currentQuestion.type === 'text' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                              <input
                                value={currentQuestion.answer}
                                onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                                  ...currentQuestion, 
                                  answer: e.target.value 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter the correct answer"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hint (Optional)</label>
                            <textarea
                              value={currentQuestion.hint}
                              onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                hint: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Provide a helpful hint for struggling students..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Equipment Image for Question (Group {selectedGroup})
                            </label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, selectedElementId, selectedGroup)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {uploadingImages[`${selectedElementId}_${selectedGroup}`] && (
                                <div className="text-blue-600 text-sm">Uploading...</div>
                              )}
                              {labImages[`${selectedElementId}_group${selectedGroup}`] && (
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                  <img 
                                    src={labImages[`${selectedElementId}_group${selectedGroup}`].data} 
                                    alt="Question" 
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{labImages[`${selectedElementId}_group${selectedGroup}`].name}</div>
                                    <div className="text-xs text-gray-500">{(labImages[`${selectedElementId}_group${selectedGroup}`].size / 1024).toFixed(1)} KB</div>
                                  </div>
                                  <button
                                    onClick={() => removeImage(selectedElementId, selectedGroup)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Information Configuration */}
                      <div className="space-y-4 border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-green-800">Information Revealed</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Information Text</label>
                          <textarea
                            value={currentQuestion.info}
                            onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                              ...currentQuestion, 
                              info: e.target.value 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Information revealed to students when they solve the question..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Information Image (Group {selectedGroup})
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleInfoImageUpload(e, selectedElementId, selectedGroup)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {uploadingImages[`${selectedElementId}_${selectedGroup}_info`] && (
                              <div className="text-blue-600 text-sm">Uploading...</div>
                            )}
                            {currentQuestion.infoImage && (
                              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                <img 
                                  src={currentQuestion.infoImage.data} 
                                  alt="Info" 
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{currentQuestion.infoImage.name}</div>
                                  <div className="text-xs text-gray-500">{(currentQuestion.infoImage.size / 1024).toFixed(1)} KB</div>
                                </div>
                                <button
                                  onClick={() => removeInfoImage(selectedElementId, selectedGroup)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Room Element Configuration */}
                {roomElements[selectedElementId] && (() => {
                  const element = roomElements[selectedElementId];
                  const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {
                    id: `${selectedElementId}_q1`,
                    question: '',
                    type: 'multiple_choice',
                    options: ['', '', '', ''],
                    answer: '',
                    hint: '',
                    clue: '',
                    randomizeAnswers: false
                  };
                  
                  return (
                    <div className="space-y-6">
                      {/* Interaction Type Display */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">Interaction Type</h4>
                        <p className="text-sm text-purple-700">{interactionTypes[element.interactionType]}</p>
                        <p className="text-xs text-purple-600 mt-1">Change interaction type in the Room Builder tab</p>
                      </div>

                      {/* Question Configuration (if has question) */}
                      {['question', 'question_element'].includes(element.interactionType) && (
                        <div className="space-y-4 border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium text-blue-800">Question Configuration</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                            <textarea
                              value={currentQuestion.question}
                              onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                question: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Enter the question..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                            <select
                              value={currentQuestion.type}
                              onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                type: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="text">Text Input</option>
                            </select>
                          </div>

                          {currentQuestion.type === 'multiple_choice' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                              {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="radio"
                                    name={`answer-${selectedElementId}-${selectedGroup}`}
                                    checked={currentQuestion.answer === option}
                                    onChange={() => updateElementQuestion(selectedElementId, selectedGroup, { 
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
                                      updateElementQuestion(selectedElementId, selectedGroup, { 
                                        ...currentQuestion, 
                                        options: newOptions 
                                      });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  />
                                </div>
                              ))}
                              
                              <div className="mt-2">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={currentQuestion.randomizeAnswers || false}
                                    onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                      ...currentQuestion, 
                                      randomizeAnswers: e.target.checked 
                                    })}
                                    className="mr-2"
                                  />
                                  Randomize answer order for each student
                                </label>
                              </div>
                            </div>
                          )}

                          {currentQuestion.type === 'text' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                              <input
                                value={currentQuestion.answer}
                                onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                  ...currentQuestion, 
                                  answer: e.target.value 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter the correct answer"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hint (Optional)</label>
                            <textarea
                              value={currentQuestion.hint}
                              onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                hint: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Provide a helpful hint for struggling students..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Clue (Revealed after solving)</label>
                            <textarea
                              value={currentQuestion.clue}
                              onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                clue: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Clue revealed when question is solved..."
                            />
                          </div>
                        </div>
                      )}

                      {/* Information Configuration (if has info) */}
                      {['info', 'question'].includes(element.interactionType) && (
                        <div className="space-y-4 border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium text-green-800">Information Revealed</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Information Text</label>
                            <textarea
                              value={element.content?.info || ''}
                              onChange={(e) => updateElementContent(selectedElementId, 'info', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Information revealed to students..."
                            />
                          </div>
                        </div>
                      )}
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
              <h2 className="text-xl font-bold text-gray-800">📸 Equipment Images</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipmentTypes.map(equipment => (
                <div key={equipment} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {equipment === 'microscope' && '🔬'} 
                    {equipment === 'incubator' && '🌡️'} 
                    {equipment === 'petriDish' && '🧫'} 
                    {equipment === 'autoclave' && '♨️'} 
                    {equipment === 'centrifuge' && '🌪️'}
                    {' '}
                    {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/([A-Z])/g, ' $1')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Equipment Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEquipmentImageUpload(e, equipment)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {uploadingImages[equipment] && (
                        <div className="text-blue-600 text-sm mt-2">Uploading...</div>
                      )}
                      {processingImages[equipment] && (
                        <div className="text-orange-600 text-sm mt-2">Processing image...</div>
                      )}
                    </div>
                    
                    {equipmentImages[equipment] && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Current Image:</span>
                          <button
                            onClick={() => removeEquipmentImage(equipment)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Original</div>
                            <img 
                              src={equipmentImages[equipment].original} 
                              alt={`${equipment} original`} 
                              className="w-full h-32 object-cover rounded border"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Processed</div>
                            <img 
                              src={equipmentImages[equipment].processed} 
                              alt={`${equipment} processed`} 
                              className="w-full h-32 object-cover rounded border"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {equipmentImages[equipment].name} - {(equipmentImages[equipment].size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Room Builder Tab */}
        {activeTab === 'room-builder' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🏗️ Room Builder</h2>
              <button
                onClick={() => setShowAddElementModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Room Element
              </button>
            </div>
            
            {/* Wall Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Wall</h3>
              <div className="flex space-x-2">
                {wallOptions.map(wall => (
                  <button
                    key={wall}
                    onClick={() => setSelectedWall(wall)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedWall === wall
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {wall.charAt(0).toUpperCase() + wall.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Room Preview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Room Preview - {selectedWall} Wall</h3>
                {renderRoomPreview()}
              </div>
              
              {/* Element Configuration */}
              <div className="space-y-6">
                {/* Game Completion Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Game Completion Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Completion Mode</label>
                      <select
                        value={completionMode}
                        onChange={(e) => setCompletionMode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Complete All Equipment</option>
                        <option value="final">Complete Final Element Only</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Final Element</label>
                      <select
                        value={finalElementId}
                        onChange={(e) => setFinalElementId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select final element...</option>
                        {getAvailableFinalElements().map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.type})
                          </option>
                        ))}
                      </select>
                      {finalElementId && (
                        <div className="mt-2 text-sm text-gray-600">
                          Final element: {getAvailableFinalElements().find(item => item.id === finalElementId)?.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Background Images */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Background Images</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {wallOptions.map(wall => (
                      <div key={wall} className="space-y-2">
                        <h4 className="font-medium text-gray-600">{wall.charAt(0).toUpperCase() + wall.slice(1)} Wall</h4>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBackgroundImageUpload(e, wall)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        {backgroundImages[wall] && (
                          <div className="space-y-1">
                            <img 
                              src={backgroundImages[wall].data} 
                              alt={`${wall} background`} 
                              className="w-full h-20 object-cover rounded"
                            />
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{backgroundImages[wall].name}</span>
                              <button
                                onClick={() => removeBackgroundImage(wall)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Equipment Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Equipment Positioning</h3>
                  
                  {selectedElement && equipmentTypes.includes(selectedElement) && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-green-700">
                        {selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)} Settings
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            value={getEquipmentOnWall(selectedWall).find(eq => eq.equipmentType === selectedElement)?.size || 120}
                            onChange={(e) => updateEquipmentPosition(selectedElement, { size: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500">
                            {getEquipmentOnWall(selectedWall).find(eq => eq.equipmentType === selectedElement)?.size || 120}px
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Z-Index</label>
                          <select
                            value={getEquipmentOnWall(selectedWall).find(eq => eq.equipmentType === selectedElement)?.zIndex || 10}
                            onChange={(e) => updateEquipmentPosition(selectedElement, { zIndex: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Object.entries(zIndexLayers).map(([value, description]) => (
                              <option key={value} value={value}>
                                {value} - {description}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Move to Wall</label>
                        <div className="flex space-x-2">
                          {wallOptions.map(wall => (
                            <button
                              key={wall}
                              onClick={() => moveEquipmentToWall(selectedElement, wall)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                getEquipmentOnWall(wall).find(eq => eq.equipmentType === selectedElement)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {wall}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Element Settings */}
                {selectedElement && roomElements[selectedElement] && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Element Settings</h3>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-blue-700">
                        {roomElements[selectedElement].name} Settings
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            value={roomElements[selectedElement].settings.size}
                            onChange={(e) => updateElementSettings(selectedElement, { size: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500">
                            {roomElements[selectedElement].settings.size}px
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Z-Index</label>
                          <select
                            value={roomElements[selectedElement].settings.zIndex}
                            onChange={(e) => updateElementSettings(selectedElement, { zIndex: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Object.entries(zIndexLayers).map(([value, description]) => (
                              <option key={value} value={value}>
                                {value} - {description}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleElementImageUpload(e, selectedElement)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {processingImages[selectedElement] && (
                          <div className="text-orange-600 text-sm mt-2">Processing image...</div>
                        )}
                        {roomElements[selectedElement].image && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Original</div>
                              <img 
                                src={roomElements[selectedElement].image.original} 
                                alt="Original" 
                                className="w-full h-20 object-cover rounded"
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Processed</div>
                              <img 
                                src={roomElements[selectedElement].image.processed} 
                                alt="Processed" 
                                className="w-full h-20 object-cover rounded"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Type</label>
                        <select
                          value={roomElements[selectedElement].interactionType}
                          onChange={(e) => setRoomElements(prev => ({
                            ...prev,
                            [selectedElement]: {
                              ...prev[selectedElement],
                              interactionType: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(interactionTypes).map(([value, description]) => (
                            <option key={value} value={value}>
                              {description}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => deleteRoomElement(selectedElement)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete Element
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Word Settings Tab */}
        {activeTab === 'word-settings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🧩 Word Scramble Settings</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Word</label>
                  <input
                    type="text"
                    value={wordSettings.targetWord}
                    onChange={(e) => {
                      const newSettings = {
                        ...wordSettings,
                        targetWord: e.target.value.toUpperCase()
                      };
                      assignLettersToGroups(newSettings, e.target.value, wordSettings.numGroups);
                      setWordSettings(newSettings);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target word (e.g., MICROBIOLOGY)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Groups</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={wordSettings.numGroups}
                    onChange={(e) => {
                      const newSettings = {
                        ...wordSettings,
                        numGroups: parseInt(e.target.value)
                      };
                      assignLettersToGroups(newSettings, wordSettings.targetWord, parseInt(e.target.value));
                      setWordSettings(newSettings);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Letter Assignments</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(wordSettings.groupLetters).map(([group, letter]) => (
                      <div key={group} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">Group {group}</div>
                        <div className="text-xl font-bold text-blue-600">{letter}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const newSettings = { ...wordSettings };
                    assignLettersToGroups(newSettings, wordSettings.targetWord, wordSettings.numGroups);
                    setWordSettings(newSettings);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Shuffle Letters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data-management' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🗂️ Data Management</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Export Data</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(labQuestions, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = 'lab-questions.json';
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Export Questions
                  </button>
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(roomElements, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = 'room-elements.json';
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Export Room Elements
                  </button>
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(studentProgress, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = 'student-progress.json';
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Export Student Progress
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Clear Data</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all student progress? This cannot be undone.')) {
                        localStorage.removeItem('instructor-student-progress');
                        setStudentProgress([]);
                        alert('Student progress cleared.');
                      }
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear Student Progress
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all questions to default? This cannot be undone.')) {
                        initializeDefaultContent();
                        alert('Questions reset to default.');
                      }
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reset Questions to Default
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all room elements? This cannot be undone.')) {
                        localStorage.removeItem('instructor-room-elements');
                        setRoomElements({});
                        alert('Room elements cleared.');
                      }
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear Room Elements
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Element Modal */}
      {showAddElementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Room Element</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newElementData.name}
                  onChange={(e) => setNewElementData({ ...newElementData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter element name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newElementData.type}
                  onChange={(e) => setNewElementData({ ...newElementData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(elementTypes).map(([value, description]) => (
                    <option key={value} value={value}>
                      {description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wall</label>
                <select
                  value={newElementData.wall}
                  onChange={(e) => setNewElementData({ ...newElementData, wall: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {wallOptions.map(wall => (
                    <option key={wall} value={wall}>
                      {wall.charAt(0).toUpperCase() + wall.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interaction Type</label>
                <select
                  value={newElementData.interactionType}
                  onChange={(e) => setNewElementData({ ...newElementData, interactionType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(interactionTypes).map(([value, description]) => (
                    <option key={value} value={value}>
                      {description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddElementModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRoomElement}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Element
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorInterface;
