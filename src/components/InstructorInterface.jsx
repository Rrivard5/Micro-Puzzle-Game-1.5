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
        // Track incorrect answers with details
        summary.incorrectAnswers.push({
          questionId: record.questionId,
          roomId: record.roomId,
          studentAnswer: record.answer,
          timestamp: record.timestamp,
          attemptNumber: record.attemptNumber
        });
      }
      summary.rooms.add(record.roomId);
      
      // Check if completed based on room progression
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
      
      // Remove all elements for this wall
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

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (event) => {
    if (!roomImages[selectedWall]) return;
    
    const coords = getCanvasCoordinates(event);
    setIsDrawing(true);
    setCurrentDrawing({
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y
    });
  };

  const handleCanvasMouseMove = (event) => {
    if (!isDrawing || !currentDrawing) return;
    
    const coords = getCanvasCoordinates(event);
    setCurrentDrawing(prev => ({
      ...prev,
      endX: coords.x,
      endY: coords.y
    }));
    
    redrawCanvas();
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentDrawing) return;
    
    setIsDrawing(false);
    
    // Only create element if the drawing is large enough
    const width = Math.abs(currentDrawing.endX - currentDrawing.startX);
    const height = Math.abs(currentDrawing.endY - currentDrawing.startY);
    
    if (width < 10 || height < 10) {
      setCurrentDrawing(null);
      redrawCanvas();
      return;
    }
    
    // Create new element
    const elementId = `element_${Date.now()}`;
    const newElement = {
      id: elementId,
      name: 'New Element',
      type: 'equipment',
      wall: selectedWall,
      interactionType: 'question',
      region: {
        x: Math.min(currentDrawing.startX, currentDrawing.endX),
        y: Math.min(currentDrawing.startY, currentDrawing.endY),
        width: Math.abs(currentDrawing.endX - currentDrawing.startX),
        height: Math.abs(currentDrawing.endY - currentDrawing.startY)
      },
      content: {
        info: 'Information revealed when clicked...',
        infoImage: null,
        question: {
          groups: {
            1: [{
              id: `${elementId}_q1`,
              question: 'Question about this element...',
              type: 'multiple_choice',
              numOptions: 4,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              hint: 'Hint for this question...',
              clue: 'Clue revealed when solved...',
              randomizeAnswers: false,
              info: 'Information revealed when solved...',
              infoImage: null
            }]
          }
        }
      },
      isVisible: true,
      revealedBy: null,
      isRequired: true,
      defaultIcon: defaultIcons.equipment
    };
    
    const newElements = { ...roomElements, [elementId]: newElement };
    setRoomElements(newElements);
    localStorage.setItem('instructor-room-elements', JSON.stringify(newElements));
    
    setCurrentDrawing(null);
    setEditingElement(newElement);
    setSelectedElementId(elementId);
    setShowElementModal(true);
    
    redrawCanvas();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !roomImages[selectedWall]) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Only draw if image is loaded
    if (!image.complete || image.naturalWidth === 0) return;
    
    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Draw existing elements
      Object.entries(roomElements).forEach(([elementId, element]) => {
        if (element.wall === selectedWall && element.region) {
          ctx.strokeStyle = selectedElementId === elementId ? '#ff0000' : '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(element.region.x, element.region.y, element.region.width, element.region.height);
          
          // Draw element name
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(element.region.x, element.region.y - 20, element.region.width, 20);
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(element.name, element.region.x + 5, element.region.y - 5);
        }
      });
      
      // Draw current drawing
      if (currentDrawing) {
        ctx.strokeStyle = '#0000ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          Math.min(currentDrawing.startX, currentDrawing.endX),
          Math.min(currentDrawing.startY, currentDrawing.endY),
          Math.abs(currentDrawing.endX - currentDrawing.startX),
          Math.abs(currentDrawing.endY - currentDrawing.startY)
        );
      }
    } catch (error) {
      console.error('Error drawing canvas:', error);
    }
  };

  const handleCanvasClick = (event) => {
    if (isDrawing) return;
    
    const coords = getCanvasCoordinates(event);
    
    // Check if click is on an existing element
    const clickedElement = Object.entries(roomElements).find(([elementId, element]) => {
      if (element.wall !== selectedWall) return false;
      
      const region = element.region;
      return coords.x >= region.x && 
             coords.x <= region.x + region.width &&
             coords.y >= region.y && 
             coords.y <= region.y + region.height;
    });
    
    if (clickedElement) {
      setSelectedElementId(clickedElement[0]);
      setEditingElement(clickedElement[1]);
      setShowElementModal(true);
    } else {
      setSelectedElementId(null);
    }
    
    redrawCanvas();
  };

  const updateElement = (elementId, updates) => {
    const newElements = {
      ...roomElements,
      [elementId]: { ...roomElements[elementId], ...updates }
    };
    setRoomElements(newElements);
    localStorage.setItem('instructor-room-elements', JSON.stringify(newElements));
  };

  const deleteElement = (elementId) => {
    if (confirm('Are you sure you want to delete this element?')) {
      const newElements = { ...roomElements };
      delete newElements[elementId];
      setRoomElements(newElements);
      localStorage.setItem('instructor-room-elements', JSON.stringify(newElements));
      
      setSelectedElementId(null);
      setShowElementModal(false);
      setEditingElement(null);
      redrawCanvas();
    }
  };

  const updateElementQuestion = (elementId, groupNumber, questionData) => {
    const element = roomElements[elementId];
    if (!element) return;
    
    const newElements = {
      ...roomElements,
      [elementId]: {
        ...element,
        content: {
          ...element.content,
          question: {
            ...element.content.question,
            groups: {
              ...element.content.question?.groups,
              [groupNumber]: [questionData]
            }
          }
        }
      }
    };
    setRoomElements(newElements);
    localStorage.setItem('instructor-room-elements', JSON.stringify(newElements));
  };

  const updatePPEQuestion = (groupNumber, questionData) => {
    const newPPESettings = {
      ...ppeSettings,
      groups: {
        ...ppeSettings.groups,
        [groupNumber]: [questionData]
      }
    };
    setPpeSettings(newPPESettings);
    localStorage.setItem('instructor-ppe-questions', JSON.stringify(newPPESettings));
  };

  const updateFinalQuestion = (groupNumber, questionData) => {
    const newFinalQuestions = {
      ...finalQuestionSettings,
      groups: {
        ...finalQuestionSettings.groups,
        [groupNumber]: [questionData]
      }
    };
    setFinalQuestionSettings(newFinalQuestions);
    localStorage.setItem('instructor-final-questions', JSON.stringify(newFinalQuestions));
    
    // Also update game settings
    const newGameSettings = {
      ...gameSettings,
      finalQuestion: newFinalQuestions
    };
    setGameSettings(newGameSettings);
    localStorage.setItem('instructor-game-settings', JSON.stringify(newGameSettings));
  };

  const updateFeedbackSettings = (updates) => {
    const newFeedbackSettings = { ...feedbackSettings, ...updates };
    setFeedbackSettings(newFeedbackSettings);
    localStorage.setItem('instructor-feedback-settings', JSON.stringify(newFeedbackSettings));
  };

  const updateQuestionFeedback = (questionId, feedbackData) => {
    const newFeedbackSettings = {
      ...feedbackSettings,
      questionFeedback: {
        ...feedbackSettings.questionFeedback,
        [questionId]: feedbackData
      }
    };
    setFeedbackSettings(newFeedbackSettings);
    localStorage.setItem('instructor-feedback-settings', JSON.stringify(newFeedbackSettings));
  };

  const generateStudentFeedback = (student) => {
    const feedback = [];
    const accuracyRate = student.accuracyRate;
    
    // Add general feedback based on performance
    if (accuracyRate >= 90) {
      feedback.push(feedbackSettings.generalFeedback.excellent);
    } else if (accuracyRate >= 75) {
      feedback.push(feedbackSettings.generalFeedback.good);
    } else if (accuracyRate >= 60) {
      feedback.push(feedbackSettings.generalFeedback.needs_improvement);
    } else {
      feedback.push(feedbackSettings.generalFeedback.poor);
    }
    
    // Add specific feedback for incorrect answers
    student.incorrectAnswers.forEach(incorrectAnswer => {
      const questionFeedback = feedbackSettings.questionFeedback[incorrectAnswer.questionId];
      if (questionFeedback) {
        feedback.push(`${questionFeedback.topic}: ${questionFeedback.feedback}`);
      }
    });
    
    return feedback;
  };

  const exportStudentData = () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        summary: studentProgress,
        detailedData: studentData,
        wordSettings: wordSettings,
        totalStudents: studentProgress.length,
        completionRate: studentProgress.length > 0 ? 
          Math.round((studentProgress.filter(s => s.completed).length / studentProgress.length) * 100) : 0
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microbiology-lab-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const exportStudentDataCSV = () => {
    try {
      const headers = [
        'Session ID', 'Name', 'Semester', 'Year', 'Group Number',
        'Start Time', 'Last Activity', 'Questions Answered', 'Questions Correct',
        'Accuracy Rate', 'Incorrect Answers', 'Rooms Visited', 'Completed'
      ];
      
      const rows = studentProgress.map(student => [
        student.sessionId,
        student.name,
        student.semester,
        student.year,
        student.groupNumber,
        student.startTime,
        student.lastActivity,
        student.questionsAnswered,
        student.questionsCorrect,
        `${student.accuracyRate}%`,
        student.incorrectAnswers.map(ia => `${ia.questionId}: "${ia.studentAnswer}"`).join('; '),
        student.rooms.join('; '),
        student.completed ? 'Yes' : 'No'
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microbiology-lab-summary-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV. Please try again.');
    }
  };

  const clearStudentData = () => {
    if (confirm('Are you sure you want to clear all student progress data? This action cannot be undone.')) {
      localStorage.removeItem('instructor-student-data');
      localStorage.removeItem('class-letters-progress');
      localStorage.removeItem('solved-elements');
      localStorage.removeItem('word-scramble-success');
      
      // Clear final question solved states
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('_final_question_solved')) {
          localStorage.removeItem(key);
        }
      });
      
      setStudentData([]);
      setStudentProgress([]);
      alert('All student data has been cleared.');
    }
  };

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

  const downloadGroupData = (groupNumber) => {
    try {
      // Get all elements that have content for this specific group
      const groupSpecificElements = {};
      
      Object.entries(roomElements).forEach(([elementId, element]) => {
        // Create a copy of the element
        const elementCopy = { ...element };
        
        // If it has questions, only include the ones for this group
        if (elementCopy.content?.question?.groups) {
          const groupQuestion = elementCopy.content.question.groups[groupNumber];
          if (groupQuestion) {
            elementCopy.content = {
              ...elementCopy.content,
              question: {
                groups: {
                  [groupNumber]: groupQuestion
                }
              }
            };
            groupSpecificElements[elementId] = elementCopy;
          }
        } else if (elementCopy.interactionType === 'info') {
          // Include info-only elements
          groupSpecificElements[elementId] = elementCopy;
        } else {
          // Include non-interactive elements
          groupSpecificElements[elementId] = elementCopy;
        }
      });
      
      const groupData = {
        version: '2.0',
        groupNumber: groupNumber,
        timestamp: new Date().toISOString(),
        
        // Room setup data
        roomImages: roomImages,
        roomElements: groupSpecificElements,
        
        // Group-specific questions
        ppeQuestion: ppeSettings.groups?.[groupNumber] || null,
        finalQuestion: finalQuestionSettings.groups?.[groupNumber] || null,
        
        // Summary metadata
        metadata: {
          totalElements: Object.keys(groupSpecificElements).length,
          interactiveElements: Object.values(groupSpecificElements).filter(el => 
            ['info', 'question'].includes(el.interactionType)
          ).length,
          roomWalls: Object.keys(roomImages),
          hasCustomQuestions: !!(ppeSettings.groups?.[groupNumber] || finalQuestionSettings.groups?.[groupNumber])
        }
      };
      
      const blob = new Blob([JSON.stringify(groupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microbiology-lab-group-${groupNumber}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Downloaded data for Group ${groupNumber}`);
      alert(`Group ${groupNumber} data downloaded successfully!\n\nIncludes:\n- ${Object.keys(roomImages).length} room images\n- ${Object.keys(groupSpecificElements).length} room elements\n- Group-specific questions\n- All images and revealed information`);
    } catch (error) {
      console.error('Error downloading group data:', error);
      alert('Error downloading group data. Please try again.');
    }
  };

  const downloadAllGroupsData = () => {
    try {
      const allGroupsData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        description: 'Complete microbiology lab escape room data for all groups',
        
        // Core room data
        roomImages: roomImages,
        roomElements: roomElements,
        
        // Group-specific content
        ppeSettings: ppeSettings,
        finalQuestionSettings: finalQuestionSettings,
        
        // Configuration (included for complete backup)
        gameSettings: gameSettings,
        
        // Comprehensive metadata
        metadata: {
          totalGroups: wordSettings.numGroups,
          totalElements: Object.keys(roomElements).length,
          interactiveElements: Object.values(roomElements).filter(el => 
            ['info', 'question'].includes(el.interactionType)
          ).length,
          roomWalls: Object.keys(roomImages),
          groupsWithCustomPPE: Object.keys(ppeSettings.groups || {}).length,
          groupsWithCustomFinal: Object.keys(finalQuestionSettings.groups || {}).length,
          totalImages: Object.values(roomImages).length + 
                      Object.values(roomElements).reduce((count, element) => {
                        let imageCount = 0;
                        if (element.content?.infoImage) imageCount++;
                        if (element.content?.question?.groups) {
                          Object.values(element.content.question.groups).forEach(groupQuestions => {
                            groupQuestions.forEach(q => {
                              if (q.infoImage) imageCount++;
                            });
                          });
                        }
                        return count + imageCount;
                      }, 0) +
                      Object.values(ppeSettings.groups || {}).length +
                      Object.values(finalQuestionSettings.groups || {}).reduce((count, questions) => {
                        return count + questions.filter(q => q.infoImage).length;
                      }, 0)
        }
      };
      
      const blob = new Blob([JSON.stringify(allGroupsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microbiology-lab-complete-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Downloaded complete lab data');
      alert(`Complete lab data downloaded successfully!\n\nIncludes:\n- ${Object.keys(roomImages).length} room background images\n- ${Object.keys(roomElements).length} interactive elements\n- Questions for ${Object.keys(ppeSettings.groups || {}).length} groups (PPE)\n- Questions for ${Object.keys(finalQuestionSettings.groups || {}).length} groups (Final)\n- ${allGroupsData.metadata.totalImages} total images\n- All revealed information and settings`);
    } catch (error) {
      console.error('Error downloading all groups data:', error);
      alert('Error downloading all groups data. Please try again.');
    }
  };

  const handleGroupDataUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.version) {
          alert('Invalid file format. Please upload a valid lab data file.');
          return;
        }

        // Handle different versions
        if (data.version !== '2.0' && data.version !== '1.0') {
          if (!confirm('This file appears to be from a different version. Do you want to try importing it anyway?')) {
            return;
          }
        }

        const isAllGroups = !data.groupNumber;
        const confirmMessage = isAllGroups 
          ? `Import complete lab setup?\n\nThis will replace:\n- All room images\n- All interactive elements\n- All group questions\n- All images and settings\n\nContinue?`
          : `Import data for Group ${data.groupNumber}?\n\nThis will replace:\n- Room images (if included)\n- Interactive elements (if included)\n- Group ${data.groupNumber} questions\n- Associated images\n\nContinue?`;
        
        if (!confirm(confirmMessage)) {
          return;
        }

        let importSummary = [];

        // Import the data based on type
        if (isAllGroups) {
          // Import complete lab data
          if (data.roomImages) {
            setRoomImages(data.roomImages);
            localStorage.setItem('instructor-room-images', JSON.stringify(data.roomImages));
            importSummary.push(`✅ ${Object.keys(data.roomImages).length} room images`);
          }
          
          if (data.roomElements) {
            setRoomElements(data.roomElements);
            localStorage.setItem('instructor-room-elements', JSON.stringify(data.roomElements));
            const interactiveCount = Object.values(data.roomElements).filter(el => 
              ['info', 'question'].includes(el.interactionType)
            ).length;
            importSummary.push(`✅ ${Object.keys(data.roomElements).length} elements (${interactiveCount} interactive)`);
          }
          
          if (data.ppeSettings) {
            setPpeSettings(data.ppeSettings);
            localStorage.setItem('instructor-ppe-questions', JSON.stringify(data.ppeSettings));
            importSummary.push(`✅ PPE questions for ${Object.keys(data.ppeSettings.groups || {}).length} groups`);
          }
          
          if (data.finalQuestionSettings) {
            setFinalQuestionSettings(data.finalQuestionSettings);
            localStorage.setItem('instructor-final-questions', JSON.stringify(data.finalQuestionSettings));
            importSummary.push(`✅ Final questions for ${Object.keys(data.finalQuestionSettings.groups || {}).length} groups`);
          }
          
          if (data.gameSettings) {
            setGameSettings(data.gameSettings);
            localStorage.setItem('instructor-game-settings', JSON.stringify(data.gameSettings));
            importSummary.push(`✅ Game settings`);
          }

        } else {
          // Import specific group data
          const groupNumber = data.groupNumber;
          
          // Import room images and elements (shared across groups)
          if (data.roomImages) {
            setRoomImages(data.roomImages);
            localStorage.setItem('instructor-room-images', JSON.stringify(data.roomImages));
            importSummary.push(`✅ ${Object.keys(data.roomImages).length} room images`);
          }
          
          if (data.roomElements) {
            setRoomElements(data.roomElements);
            localStorage.setItem('instructor-room-elements', JSON.stringify(data.roomElements));
            const interactiveCount = Object.values(data.roomElements).filter(el => 
              ['info', 'question'].includes(el.interactionType)
            ).length;
            importSummary.push(`✅ ${Object.keys(data.roomElements).length} elements (${interactiveCount} interactive)`);
          }
          
          // Import group-specific questions
          if (data.ppeQuestion) {
            const newPPESettings = {
              ...ppeSettings,
              groups: {
                ...ppeSettings.groups,
                [groupNumber]: data.ppeQuestion
              }
            };
            setPpeSettings(newPPESettings);
            localStorage.setItem('instructor-ppe-questions', JSON.stringify(newPPESettings));
            importSummary.push(`✅ PPE question for Group ${groupNumber}`);
          }
          
          if (data.finalQuestion) {
            const newFinalSettings = {
              ...finalQuestionSettings,
              groups: {
                ...finalQuestionSettings.groups,
                [groupNumber]: data.finalQuestion
              }
            };
            setFinalQuestionSettings(newFinalSettings);
            localStorage.setItem('instructor-final-questions', JSON.stringify(newFinalSettings));
            importSummary.push(`✅ Final question for Group ${groupNumber}`);
          }
        }

        // Show success message with summary
        const successMessage = isAllGroups 
          ? `Complete lab data imported successfully!\n\n${importSummary.join('\n')}`
          : `Group ${data.groupNumber} data imported successfully!\n\n${importSummary.join('\n')}`;
        
        alert(successMessage);

        // Clear the file input
        event.target.value = '';
        
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
        alert('Error reading the uploaded file. Please make sure it\'s a valid JSON file exported from this system.');
      }
    };
    
    reader.readAsText(file);
  };

  // Load image when room image changes
  useEffect(() => {
    if (roomImages[selectedWall] && imageRef.current) {
      const image = imageRef.current;
      
      const handleImageLoad = () => {
        setTimeout(() => {
          redrawCanvas();
        }, 100);
      };
      
      const handleImageError = (error) => {
        console.error('Error loading image:', error);
      };
      
      image.onload = handleImageLoad;
      image.onerror = handleImageError;
      
      // Set the image source
      image.src = roomImages[selectedWall].data;
      
      // If image is already loaded, trigger redraw immediately
      if (image.complete && image.naturalWidth > 0) {
        handleImageLoad();
      }
    }
  }, [roomImages, selectedWall]);

  // Redraw canvas when elements change
  useEffect(() => {
    if (roomImages[selectedWall]) {
      redrawCanvas();
    }
  }, [roomElements, selectedElementId, currentDrawing]);

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

        {/* ENHANCED Group Data Management Section - Available on all tabs */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Enhanced Group Data Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Individual Group Management */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-3">Individual Group Data</h3>
              <div className="flex flex-wrap gap-3 items-center mb-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Group:</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({length: wordSettings.numGroups}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>Group {num}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => downloadGroupData(selectedGroup)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                >
                  📥 Download Group {selectedGroup}
                </button>
              </div>
              <p className="text-sm text-blue-700">
                Downloads room images, elements, and group-specific questions/images for a single group.
              </p>
            </div>
            
            {/* Complete Lab Management */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-3">Complete Lab Data</h3>
              <div className="flex flex-wrap gap-3 items-center mb-3">
                <button
                  onClick={() => downloadAllGroupsData()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm"
                >
                  📦 Download Everything
                </button>
                
                <label className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm">
                  📤 Upload Lab Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleGroupDataUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-green-700">
                Complete backup including all groups, room setup, questions, and images.
              </p>
            </div>
          </div>
          
          {/* Data Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{Object.keys(roomImages).length}</div>
              <div className="text-sm text-gray-600">Room Images</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{Object.keys(roomElements).length}</div>
              <div className="text-sm text-gray-600">Room Elements</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{Object.keys(ppeSettings.groups || {}).length}</div>
              <div className="text-sm text-gray-600">PPE Groups</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{Object.keys(finalQuestionSettings.groups || {}).length}</div>
              <div className="text-sm text-gray-600">Final Questions</div>
            </div>
          </div>
        </div>

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

            {/* Game Settings */}
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
                
                {/* Hidden image element for loading */}
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
            {/* Group Selection */}
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
                        <h4 className="font-bold text-gray-700 mb-3">
                          {element.defaultIcon} {element.name} ({element.wall} wall)
                        </h4>
                        
                        {element.interactionType === 'info' ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Information Text
                              </label>
                              <textarea
                                value={element.content?.info || ''}
                                onChange={(e) => {
                                  const updated = {
                                    ...element,
                                    content: { ...element.content, info: e.target.value }
                                  };
                                  updateElement(elementId, updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Information revealed when clicked..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Information Image (Optional)
                              </label>
                              {element.content?.infoImage ? (
                                <div className="space-y-2">
                                  <img
                                    src={element.content.infoImage.data}
                                    alt="Information"
                                    className="w-32 h-32 object-cover rounded border"
                                  />
                                  <button
                                    onClick={() => {
                                      const updated = {
                                        ...element,
                                        content: { ...element.content, infoImage: null }
                                      };
                                      updateElement(elementId, updated);
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
                                            ...element,
                                            content: { 
                                              ...element.content, 
                                              infoImage: {
                                                data: event.target.result,
                                                name: file.name,
                                                size: file.size,
                                                lastModified: new Date().toISOString()
                                              }
                                            }
                                          };
                                          updateElement(elementId, updated);
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
                        ) : (
                          <div className="space-y-4">
                            {/* Question Text */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question
                              </label>
                              <textarea
                                value={element.content?.question?.groups?.[selectedGroup]?.[0]?.question || ''}
                                onChange={(e) => {
                                  const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                  const updatedQuestion = {
                                    ...currentQuestion,
                                    id: `${elementId}_g${selectedGroup}`,
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
                                  updateElementQuestion(elementId, selectedGroup, updatedQuestion);
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
                                value={element.content?.question?.groups?.[selectedGroup]?.[0]?.type || 'multiple_choice'}
                                onChange={(e) => {
                                  const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                  const updatedQuestion = {
                                    ...currentQuestion,
                                    type: e.target.value,
                                    options: e.target.value === 'multiple_choice' ? (currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']) : [],
                                    correctAnswer: e.target.value === 'multiple_choice' ? (currentQuestion.correctAnswer || 0) : 0,
                                    correctText: e.target.value === 'text' ? (currentQuestion.correctText || '') : ''
                                  };
                                  updateElementQuestion(elementId, selectedGroup, updatedQuestion);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="text">Fill in the Blank</option>
                              </select>
                            </div>

                            {/* Multiple Choice Options */}
                            {element.content?.question?.groups?.[selectedGroup]?.[0]?.type === 'multiple_choice' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Answer Options
                                  </label>
                                  <div className="space-y-2">
                                    {(element.content?.question?.groups?.[selectedGroup]?.[0]?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                                      <div key={idx} className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-600 w-8">
                                          {String.fromCharCode(65 + idx)}:
                                        </span>
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                            const newOptions = [...(currentQuestion.options || [])];
                                            newOptions[idx] = e.target.value;
                                            const updatedQuestion = {
                                              ...currentQuestion,
                                              options: newOptions
                                            };
                                            updateElementQuestion(elementId, selectedGroup, updatedQuestion);
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
                                    value={element.content?.question?.groups?.[selectedGroup]?.[0]?.correctAnswer || 0}
                                    onChange={(e) => {
                                      const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                      const updatedQuestion = {
                                        ...currentQuestion,
                                        correctAnswer: parseInt(e.target.value)
                                      };
                                      updateElementQuestion(elementId, selectedGroup, updatedQuestion);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    {(element.content?.question?.groups?.[selectedGroup]?.[0]?.options || []).map((option, idx) => (
                                      <option key={idx} value={idx}>
                                        {String.fromCharCode(65 + idx)}: {option}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}

                            {/* Text Answer */}
                            {element.content?.question?.groups?.[selectedGroup]?.[0]?.type === 'text' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Correct Answer (case-insensitive)
                                </label>
                                <input
                                  type="text"
                                  value={element.content?.question?.groups?.[selectedGroup]?.[0]?.correctText || ''}
                                  onChange={(e) => {
                                    const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                    const updatedQuestion = {
                                      ...currentQuestion,
                                      correctText: e.target.value
                                    };
                                    updateElementQuestion(elementId, selectedGroup, updatedQuestion);
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
                                value={element.content?.question?.groups?.[selectedGroup]?.[0]?.hint || ''}
                                onChange={(e) => {
                                  const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                  const updatedQuestion = {
                                    ...currentQuestion,
                                    hint: e.target.value
                                  };
                                  updateElementQuestion(elementId, selectedGroup, updatedQuestion);
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
                                value={element.content?.question?.groups?.[selectedGroup]?.[0]?.info || ''}
                                onChange={(e) => {
                                  const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                  const updatedQuestion = {
                                    ...currentQuestion,
                                    info: e.target.value,
                                    clue: e.target.value // Keep clue in sync
                                  };
                                  updateElementQuestion(elementId, selectedGroup, updatedQuestion);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Information revealed when student answers correctly..."
                              />
                            </div>

                            {/* Information Image */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Information Image (Optional)
                              </label>
                              {element.content?.question?.groups?.[selectedGroup]?.[0]?.infoImage ? (
                                <div className="space-y-2">
                                  <img
                                    src={element.content.question.groups[selectedGroup][0].infoImage.data}
                                    alt="Information"
                                    className="w-32 h-32 object-cover rounded border"
                                  />
                                  <button
                                    onClick={() => {
                                      const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                      const updatedQuestion = {
                                        ...currentQuestion,
                                        infoImage: null
                                      };
                                      updateElementQuestion(elementId, selectedGroup, updatedQuestion);
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
                                          const currentQuestion = element.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                          const updatedQuestion = {
                                            ...currentQuestion,
                                            infoImage: {
                                              data: event.target.result,
                                              name: file.name,
                                              size: file.size,
                                              lastModified: new Date().toISOString()
                                            }
                                          };
                                          updateElementQuestion(elementId, selectedGroup, updatedQuestion);
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
            {/* General Feedback Settings */}
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
                    onChange={(e) => updateFeedbackSettings({
                      generalFeedback: {
                        ...feedbackSettings.generalFeedback,
                        excellent: e.target.value
                      }
                    })}
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
                    onChange={(e) => updateFeedbackSettings({
                      generalFeedback: {
                        ...feedbackSettings.generalFeedback,
                        good: e.target.value
                      }
                    })}
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
                    onChange={(e) => updateFeedbackSettings({
                      generalFeedback: {
                        ...feedbackSettings.generalFeedback,
                        needs_improvement: e.target.value
                      }
                    })}
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
                    onChange={(e) => updateFeedbackSettings({
                      generalFeedback: {
                        ...feedbackSettings.generalFeedback,
                        poor: e.target.value
                      }
                    })}
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
                
                {/* Custom Question Feedback */}
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-bold text-blue-800 mb-2">Custom Question Feedback</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    You can also add feedback for specific questions by their ID. Question IDs are shown in the student progress data.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Question ID (e.g., element_123_g1)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="custom-question-id"
                      />
                      <input
                        type="text"
                        placeholder="Topic (e.g., Centrifuge Operation)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="custom-question-topic"
                      />
                    </div>
                    <textarea
                      placeholder="Feedback for this specific question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      id="custom-question-feedback"
                    />
                    <button
                      onClick={() => {
                        const questionId = document.getElementById('custom-question-id').value;
                        const topic = document.getElementById('custom-question-topic').value;
                        const feedback = document.getElementById('custom-question-feedback').value;
                        
                        if (questionId && topic && feedback) {
                          updateQuestionFeedback(questionId, { topic, feedback });
                          document.getElementById('custom-question-id').value = '';
                          document.getElementById('custom-question-topic').value = '';
                          document.getElementById('custom-question-feedback').value = '';
                        } else {
                          alert('Please fill in all fields');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Add Custom Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Custom Feedback */}
            {Object.keys(feedbackSettings.questionFeedback).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Configured Question Feedback</h2>
                <div className="space-y-3">
                  {Object.entries(feedbackSettings.questionFeedback).map(([questionId, feedback]) => (
                    <div key={questionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-bold text-gray-800">{feedback.topic}</h3>
                        <p className="text-sm text-gray-600">ID: {questionId}</p>
                        <p className="text-sm text-gray-700 mt-1">{feedback.feedback}</p>
                      </div>
                      <button
                        onClick={() => {
                          const newFeedback = { ...feedbackSettings.questionFeedback };
                          delete newFeedback[questionId];
                          updateFeedbackSettings({
                            questionFeedback: newFeedback
                          });
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                          Rooms
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Incorrect Answers
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Generated Feedback
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.rooms.join(', ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            {student.incorrectAnswers.length > 0 ? (
                              <div className="space-y-1">
                                {student.incorrectAnswers.slice(0, 3).map((incorrect, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span className="font-medium text-red-600">{incorrect.questionId}:</span>
                                    <span className="text-red-500 ml-1">"{incorrect.studentAnswer}"</span>
                                  </div>
                                ))}
                                {student.incorrectAnswers.length > 3 && (
                                  <div className="text-xs text-gray-400">
                                    +{student.incorrectAnswers.length - 3} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-green-600">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="space-y-1">
                              {generateStudentFeedback(student).slice(0, 2).map((feedback, idx) => (
                                <div key={idx} className="text-xs p-1 bg-blue-50 rounded">
                                  {feedback}
                                </div>
                              ))}
                              {generateStudentFeedback(student).length > 2 && (
                                <div className="text-xs text-gray-400">
                                  +{generateStudentFeedback(student).length - 2} more suggestions
                                </div>
                              )}
                            </div>
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

            {/* Statistics Summary */}
            {studentProgress.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Statistics Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-800">Total Students</h4>
                    <p className="text-2xl font-bold text-blue-600">{studentProgress.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-bold text-green-800">Completed</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {studentProgress.filter(s => s.completed).length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800">In Progress</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {studentProgress.filter(s => !s.completed).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800">Completion Rate</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {studentProgress.length > 0 ? Math.round((studentProgress.filter(s => s.completed).length / studentProgress.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Element Configuration Modal */}
      {showElementModal && editingElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

              <div className="space-y-4">
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
