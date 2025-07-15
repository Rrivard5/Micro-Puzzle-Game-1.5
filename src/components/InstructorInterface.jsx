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
    none: 'Not Interactive (Decoration Only)',
    info: 'Reveal Information Only',
    question: 'Show Question → Reveal Information',
    element: 'Reveal New Element',
    question_element: 'Show Question → Reveal New Element'
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
            clue: 'Rod-shaped bacteria detected - likely Escherichia coli',
            randomizeAnswers: false
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
            clue: 'Mesophilic conditions set - optimal for human pathogens',
            randomizeAnswers: false
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
            clue: 'Beta-hemolytic bacteria identified - Streptococcus pyogenes likely',
            randomizeAnswers: false
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
            clue: 'Sterilization protocol confirmed - equipment properly decontaminated',
            randomizeAnswers: false
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
            clue: 'Density separation principle confirmed - sample fractionation successful',
            randomizeAnswers: false
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
      question: `New ${equipment} question for group ${newGroupNumber}...`,
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
      hint: 'Hint for this question...',
      clue: 'Clue revealed when solved...',
      randomizeAnswers: false
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

  // Room preview component with correct scaling and background
  const renderRoomPreview = () => {
    const wallElements = Object.entries(roomElements).filter(([id, element]) => element.wall === selectedWall);
    const backgroundImage = backgroundImages[selectedWall];
    
    return (
      <div 
        id="room-preview"
        className="relative bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg border-2 border-gray-300 h-96 overflow-hidden"
        style={{
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
        {/* Default SVG background when no custom background */}
        {!backgroundImage && (
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
            
            <polygon points="80,180 720,180 760,550 40,550" fill="url(#floorTiles)" stroke="#cbd5e0" strokeWidth="2"/>
            <polygon points="120,60 680,60 720,180 80,180" fill="url(#wallGrad)" stroke="#e2e8f0"/>
            <polygon points="80,180 120,60 120,400 80,520" fill="url(#wallGrad)" stroke="#e2e8f0"/>
            <polygon points="680,60 720,180 720,520 680,400" fill="url(#wallGrad)" stroke="#e2e8f0"/>
            <polygon points="150,300 650,300 680,340 120,340" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2"/>
            <polygon points="120,340 680,340 680,360 120,360" fill="#d1d5db"/>
            <polygon points="680,340 720,380 720,400 680,360" fill="#cbd5e0"/>
            <ellipse cx="250" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
            <ellipse cx="400" cy="85" rx="70" ry="15" fill="#fef3c7" opacity="0.9"/>
            <ellipse cx="550" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
          </svg>
        )}
        
        {/* Room Elements */}
        {wallElements.map(([elementId, element]) => (
          <div
            key={elementId}
            className={`absolute cursor-move transition-all duration-200 ${
              selectedElement === elementId ? 'ring-2 ring-blue-500' : ''
            } ${draggedElement === elementId ? 'z-50' : ''}`}
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
                  width: `${100 * (element.settings.size / 100)}px`,
                  height: `${100 * (element.settings.size / 100)}px`,
                  filter: 'drop-shadow(3px 6px 12px rgba(0,0,0,0.4))'
                }}
              />
            ) : (
              <div
                className="bg-gray-300 border-2 border-gray-500 rounded-lg flex items-center justify-center"
                style={{
                  width: `${60 * (element.settings.size / 100)}px`,
                  height: `${60 * (element.settings.size / 100)}px`
                }}
              >
                <div className="text-gray-600 text-center">
                  <div className="text-xl mb-1">📦</div>
                  <div className="text-xs">{element.name}</div>
                </div>
              </div>
            )}
            
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow whitespace-nowrap">
              {element.name}
            </div>
          </div>
        ))}
        
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
                        {element.interactionType === 'none' ? '📦' : '🔍'} {element.name}
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
                </h3>
                
                {/* Equipment Configuration */}
                {equipmentTypes.includes(selectedElementId) && (() => {
                  const currentQuestion = labQuestions[selectedElementId]?.groups?.[selectedGroup]?.[0] || {
                    id: `${selectedElementId}1`,
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Research Clue (Revealed when solved)</label>
                        <textarea
                          value={currentQuestion.clue}
                          onChange={(e) => updateQuestion(selectedElementId, selectedGroup, { 
                            ...currentQuestion, 
                            clue: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="What research finding is revealed when this equipment is analyzed?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Equipment Image for Group {selectedGroup}
                        </label>
                        {labImages[`${selectedElementId}_group${selectedGroup}`] ? (
                          <div className="space-y-2">
                            <img
                              src={labImages[`${selectedElementId}_group${selectedGroup}`].data}
                              alt={`${selectedElementId} for Group ${selectedGroup}`}
                              className="w-full max-w-md h-32 object-cover rounded border"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => removeImage(selectedElementId, selectedGroup)}
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
                              onChange={(e) => handleImageUpload(e, selectedElementId, selectedGroup)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={uploadingImages[`${selectedElementId}_${selectedGroup}`]}
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
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Element Settings</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Type:</strong> {interactionTypes[element.interactionType]}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Wall:</strong> {element.wall.charAt(0).toUpperCase() + element.wall.slice(1)}
                        </p>
                      </div>

                      {/* Information Content */}
                      {['info', 'question'].includes(element.interactionType) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Information to Reveal
                          </label>
                          <textarea
                            value={element.content?.info || ''}
                            onChange={(e) => updateElementContent(selectedElementId, 'info', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Enter information to reveal when element is clicked..."
                          />
                        </div>
                      )}

                      {/* Question Configuration */}
                      {['question', 'question_element'].includes(element.interactionType) && (
                        <div className="space-y-4">
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
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hint</label>
                            <textarea
                              value={currentQuestion.hint}
                              onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                hint: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {element.interactionType === 'question' 
                                ? 'Information revealed when solved' 
                                : 'Clue revealed when solved'}
                            </label>
                            <textarea
                              value={currentQuestion.clue}
                              onChange={(e) => updateElementQuestion(selectedElementId, selectedGroup, { 
                                ...currentQuestion, 
                                clue: e.target.value 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                            />
                          </div>
                        </div>
                      )}

                      {/* Non-interactive elements message */}
                      {element.interactionType === 'none' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 mb-2">Non-Interactive Element</h4>
                          <p className="text-blue-700 text-sm">
                            This element is set to "Not Interactive" and is for decoration only. 
                            To add questions or information, edit the element in the Room Builder tab 
                            and change its interaction type.
                          </p>
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
              <h2 className="text-xl font-bold text-gray-800">📸 Equipment Images & Backgrounds</h2>
            </div>
            
            {/* Equipment Images Section */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">🔬 Equipment Images (Auto Background Removal)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipmentTypes.map(equipment => {
                  const currentImage = equipmentImages[equipment];
                  const uploadKey = equipment;
                  const isUploading = uploadingImages[uploadKey];
                  const isProcessing = processingImages[uploadKey];
                  
                  return (
                    <div key={equipment} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-3 capitalize">
                        {equipment === 'microscope' && '🔬'} 
                        {equipment === 'incubator' && '🌡️'} 
                        {equipment === 'petriDish' && '🧫'} 
                        {equipment === 'autoclave' && '♨️'} 
                        {equipment === 'centrifuge' && '🌪️'}
                        {' '}
                        {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/([A-Z])/g, ' $1')}
                      </h4>
                      
                      {currentImage ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Processed Image</h5>
                              <div className="bg-gray-100 p-4 rounded border border-gray-300">
                                <img
                                  src={currentImage.processed}
                                  alt={`Processed ${equipment}`}
                                  className="w-full max-h-32 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => removeEquipmentImage(equipment)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              🗑️ Remove
                            </button>
                            
                            <label className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer">
                              🔄 Replace
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleEquipmentImageUpload(e, equipment)}
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
                                {isProcessing ? 'Processing image...' : 'Uploading image...'}
                              </p>
                            </div>
                          ) : (
                            <label className="block w-full">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                <div className="text-4xl mb-4">📸</div>
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                  Upload Image
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                  Click to select an image file
                                </p>
                                <p className="text-xs text-gray-400">
                                  White backgrounds will be automatically removed
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleEquipmentImageUpload(e, equipment)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Room Element
              </button>
            </div>
            
            {/* Wall Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Wall to Edit</h3>
              <div className="grid grid-cols-4 gap-4">
                {wallOptions.map((wall) => (
                  <button
                    key={wall}
                    onClick={() => setSelectedWall(wall)}
                    className={`p-4 rounded-lg font-medium transition-colors ${
                      selectedWall === wall
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {wall.charAt(0).toUpperCase() + wall.slice(1)} Wall
                  </button>
                ))}
              </div>
            </div>
            
            {/* Room Elements List */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Room Elements - {selectedWall.charAt(0).toUpperCase() + selectedWall.slice(1)} Wall</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(roomElements)
                  .filter(([id, element]) => element.wall === selectedWall)
                  .map(([elementId, element]) => (
                  <div key={elementId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{element.name}</h4>
                      <button
                        onClick={() => deleteRoomElement(elementId)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div>Type: {elementTypes[element.type]}</div>
                      <div>Interaction: {interactionTypes[element.interactionType]}</div>
                      <div>Size: {element.settings.size}%</div>
                    </div>
                    
                    {element.image ? (
                      <img
                        src={element.image.processed}
                        alt={element.name}
                        className="w-full h-20 object-contain bg-gray-100 rounded mb-2"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedElement(elementId)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <label className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 cursor-pointer">
                        Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleElementImageUpload(e, elementId)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Element Editor and Room Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls Panel */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {selectedElement && roomElements[selectedElement] 
                    ? `Edit: ${roomElements[selectedElement].name}` 
                    : 'Select an element to edit'}
                </h3>
                
                {selectedElement && roomElements[selectedElement] && (
                  <div className="space-y-6">
                    {/* Basic Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Element Name</label>
                      <input
                        type="text"
                        value={roomElements[selectedElement].name}
                        onChange={(e) => setRoomElements(prev => ({
                          ...prev,
                          [selectedElement]: {
                            ...prev[selectedElement],
                            name: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Wall Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Wall</label>
                      <select
                        value={roomElements[selectedElement].wall}
                        onChange={(e) => setRoomElements(prev => ({
                          ...prev,
                          [selectedElement]: {
                            ...prev[selectedElement],
                            wall: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {wallOptions.map(wall => (
                          <option key={wall} value={wall}>{wall.charAt(0).toUpperCase() + wall.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Interaction Type */}
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
                        {Object.entries(interactionTypes).map(([key, description]) => (
                          <option key={key} value={key}>{description}</option>
                        ))}
                      </select>
                    </div>

                    {/* Size Control */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size: {roomElements[selectedElement].settings.size}%
                      </label>
                      <input
                        type="range"
                        min="25"
                        max="200"
                        value={roomElements[selectedElement].settings.size}
                        onChange={(e) => updateElementSettings(selectedElement, {
                          size: parseInt(e.target.value)
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Z-Index with context */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layer (Z-Index): {roomElements[selectedElement].settings.zIndex}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={roomElements[selectedElement].settings.zIndex}
                        onChange={(e) => updateElementSettings(selectedElement, {
                          zIndex: parseInt(e.target.value)
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      {/* Z-Index Context */}
                      <div className="mt-2 bg-gray-50 rounded p-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Layer Reference:</h4>
                        <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(zIndexLayers).map(([index, description]) => (
                            <div 
                              key={index} 
                              className={`flex justify-between ${
                                parseInt(index) === roomElements[selectedElement].settings.zIndex ? 'font-bold text-blue-600' : ''
                              }`}
                            >
                              <span>{index}:</span>
                              <span className="ml-2">{description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Revealed Element Selection */}
                    {['element', 'question_element'].includes(roomElements[selectedElement].interactionType) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Element to Reveal (Optional)
                        </label>
                        <select
                          value={roomElements[selectedElement].revealedElementId || ''}
                          onChange={(e) => setRoomElements(prev => ({
                            ...prev,
                            [selectedElement]: {
                              ...prev[selectedElement],
                              revealedElementId: e.target.value || null
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select element to reveal...</option>
                          {Object.entries(roomElements)
                            .filter(([id]) => id !== selectedElement)
                            .map(([id, element]) => (
                              <option key={id} value={id}>{element.name}</option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <h4 className="font-medium text-blue-800 mb-2">💡 Note:</h4>
                      <p className="text-blue-700 text-sm">
                        To configure questions and information for this element, go to the "Questions & Info" tab after saving.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Room Preview - {selectedWall.charAt(0).toUpperCase() + selectedWall.slice(1)} Wall</h3>
                
                <div className="mb-4 text-sm text-gray-600">
                  <p>• Click and drag elements to reposition them</p>
                  <p>• Use the controls on the left to resize and configure elements</p>
                </div>
                
                {renderRoomPreview()}
                
                <div className="mt-4 text-xs text-gray-500">
                  Elements on this wall: {Object.values(roomElements).filter(el => el.wall === selectedWall).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Element Modal */}
        {showAddElementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Room Element</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Element Name</label>
                  <input
                    type="text"
                    value={newElementData.name}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Lab Table, Storage Cabinet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Element Type</label>
                  <select
                    value={newElementData.type}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(elementTypes).map(([key, description]) => (
                      <option key={key} value={key}>{description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wall</label>
                  <select
                    value={newElementData.wall}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, wall: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {wallOptions.map(wall => (
                      <option key={wall} value={wall}>{wall.charAt(0).toUpperCase() + wall.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Type</label>
                  <select
                    value={newElementData.interactionType}
                    onChange={(e) => setNewElementData(prev => ({ ...prev, interactionType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(interactionTypes).map(([key, description]) => (
                      <option key={key} value={key}>{description}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addRoomElement}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Element
                </button>
                <button
                  onClick={() => setShowAddElementModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
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
                Backup and restore your entire lab configuration including images, questions, and room elements.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Export Complete Configuration</h4>
                  <p className="text-sm text-green-600 mb-4">
                    Download all settings, questions, images, and room elements as a backup file.
                  </p>
                  <button
                    onClick={() => {
                      const fullConfig = {
                        labQuestions,
                        labImages,
                        equipmentImages,
                        backgroundImages,
                        roomElements,
                        wordSettings,
                        exportDate: new Date().toISOString(),
                        version: '2.0'
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
                                if (config.roomElements) setRoomElements(config.roomElements);
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
