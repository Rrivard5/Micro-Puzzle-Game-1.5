import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function InstructorRoomEditor() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

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

  // Content categories for feedback
  const [contentCategories, setContentCategories] = useState({});
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    correctFeedback: '',
    incorrectFeedback: ''
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

  // Default content categories
  const defaultContentCategories = {
    bacterial_morphology: {
      name: "Bacterial Morphology & Classification",
      description: "Shape, arrangement, and identification of bacteria",
      correctFeedback: "Excellent! You correctly identified the bacterial characteristics and understood their clinical significance.",
      incorrectFeedback: "Review bacterial shapes (cocci, bacilli, spirilla) and their arrangements. Consider how morphology relates to pathogen identification."
    },
    microscopy_techniques: {
      name: "Microscopy & Staining Techniques", 
      description: "Proper use of microscopes and staining procedures",
      correctFeedback: "Great work with microscopy analysis! Your understanding of magnification and staining is solid.",
      incorrectFeedback: "Remember the steps for proper slide preparation, focus adjustment, and interpretation of staining results."
    },
    culture_methods: {
      name: "Culture Techniques & Media",
      description: "Growing and maintaining bacterial cultures",
      correctFeedback: "You understand culture techniques well! Your knowledge of growth conditions is excellent.",
      incorrectFeedback: "Review aseptic technique, appropriate culture conditions, and interpretation of growth patterns."
    },
    sterilization: {
      name: "Sterilization & Disinfection",
      description: "Methods for eliminating microorganisms",
      correctFeedback: "Perfect! You understand the principles of sterilization and their applications.",
      incorrectFeedback: "Review different sterilization methods (autoclave, chemical, UV) and when to use each approach."
    },
    safety_protocols: {
      name: "Laboratory Safety & PPE",
      description: "Safety procedures and protective equipment",
      correctFeedback: "Excellent safety awareness! You understand proper laboratory protocols.",
      incorrectFeedback: "Review laboratory safety protocols, proper PPE selection, and emergency procedures."
    },
    diagnosis: {
      name: "Clinical Diagnosis & Pathogen ID",
      description: "Identifying pathogens and making clinical decisions",
      correctFeedback: "Outstanding diagnostic reasoning! You've successfully identified the pathogen and treatment.",
      incorrectFeedback: "Consider all laboratory findings together. Review pathogen characteristics and treatment options."
    }
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

      // Load content categories
      const savedCategories = localStorage.getItem('instructor-content-categories');
      if (savedCategories) {
        setContentCategories(JSON.parse(savedCategories));
      } else {
        // Initialize with defaults
        setContentCategories(defaultContentCategories);
        localStorage.setItem('instructor-content-categories', JSON.stringify(defaultContentCategories));
      }

      // Load word settings to get number of groups
      const savedWordSettings = localStorage.getItem('instructor-word-settings');
      if (savedWordSettings) {
        const settings = JSON.parse(savedWordSettings);
        // We'll use this for the group selector
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveAllData = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('instructor-room-images', JSON.stringify(roomImages));
      localStorage.setItem('instructor-room-elements', JSON.stringify(roomElements));
      localStorage.setItem('instructor-content-categories', JSON.stringify(contentCategories));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Room configuration saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Image upload functionality
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
      
      // Load image onto canvas
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 800, 600);
        drawExistingElements();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeRoomImage = (wall) => {
    if (confirm('Are you sure you want to remove this room image and all its elements?')) {
      const newRoomImages = { ...roomImages };
      delete newRoomImages[wall];
      setRoomImages(newRoomImages);
      
      // Remove associated elements
      const newElements = { ...roomElements };
      Object.keys(newElements).forEach(elementId => {
        if (newElements[elementId].wall === wall) {
          delete newElements[elementId];
        }
      });
      setRoomElements(newElements);
      
      // Clear canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Canvas drawing functionality
  const handleCanvasMouseDown = (event) => {
    if (!roomImages[selectedWall]) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // Check if clicking on existing element
    const clickedElement = getElementAtPosition(x, y);
    if (clickedElement) {
      setSelectedElementId(clickedElement);
      redrawCanvas();
      return;
    }
    
    // Start drawing new element
    setIsDrawing(true);
    setCurrentDrawing({
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  };

  const handleCanvasMouseMove = (event) => {
    if (!isDrawing || !roomImages[selectedWall]) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    setCurrentDrawing(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
    
    redrawCanvas();
  };

  const handleCanvasMouseUp = (event) => {
    if (!isDrawing || !currentDrawing) return;
    
    const width = Math.abs(currentDrawing.endX - currentDrawing.startX);
    const height = Math.abs(currentDrawing.endY - currentDrawing.startY);
    
    if (width < 20 || height < 20) {
      alert('Element must be at least 20x20 pixels');
      setIsDrawing(false);
      setCurrentDrawing(null);
      redrawCanvas();
      return;
    }
    
    // Create new element
    const elementId = `element_${Date.now()}`;
    const newElement = {
      name: 'New Element',
      type: 'equipment',
      interactionType: 'none',
      isRequired: false,
      wall: selectedWall,
      region: {
        x: Math.min(currentDrawing.startX, currentDrawing.endX),
        y: Math.min(currentDrawing.startY, currentDrawing.endY),
        width: width,
        height: height
      },
      content: {},
      defaultIcon: defaultIcons.equipment,
      contentCategory: '', // New field for feedback linking
      customFeedback: false // Whether to use custom vs category feedback
    };
    
    const newElements = {
      ...roomElements,
      [elementId]: newElement
    };
    
    setRoomElements(newElements);
    setIsDrawing(false);
    setCurrentDrawing(null);
    setSelectedElementId(elementId);
    setEditingElement(newElement);
    setShowElementModal(true);
    
    redrawCanvas();
  };

  const getElementAtPosition = (x, y) => {
    for (const [elementId, element] of Object.entries(roomElements)) {
      if (element.wall !== selectedWall) continue;
      
      const region = element.region;
      if (x >= region.x && x <= region.x + region.width &&
          y >= region.y && y <= region.y + region.height) {
        return elementId;
      }
    }
    return null;
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    
    // Draw background image
    if (roomImages[selectedWall]) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 800, 600);
        drawExistingElements();
        drawCurrentDrawing();
      };
      img.src = roomImages[selectedWall].data;
    } else {
      drawExistingElements();
      drawCurrentDrawing();
    }
  };

  const drawExistingElements = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    Object.entries(roomElements).forEach(([elementId, element]) => {
      if (element.wall !== selectedWall) return;
      
      const region = element.region;
      const isSelected = elementId === selectedElementId;
      
      ctx.strokeStyle = isSelected ? '#ef4444' : '#22c55e';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
      
      ctx.fillRect(region.x, region.y, region.width, region.height);
      ctx.strokeRect(region.x, region.y, region.width, region.height);
      
      // Draw element name
      ctx.fillStyle = isSelected ? '#ef4444' : '#22c55e';
      ctx.font = '12px Arial';
      ctx.fillText(element.name, region.x + 5, region.y + 15);
    });
  };

  const drawCurrentDrawing = () => {
    if (!isDrawing || !currentDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const x = Math.min(currentDrawing.startX, currentDrawing.endX);
    const y = Math.min(currentDrawing.startY, currentDrawing.endY);
    const width = Math.abs(currentDrawing.endX - currentDrawing.startX);
    const height = Math.abs(currentDrawing.endY - currentDrawing.startY);
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  };

  // Load canvas when wall changes
  useEffect(() => {
    if (canvasRef.current && roomImages[selectedWall]) {
      redrawCanvas();
    } else if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 800, 600);
      drawExistingElements();
    }
  }, [selectedWall, roomElements]);

  // Content category management
  const addContentCategory = () => {
    if (!newCategoryForm.id || !newCategoryForm.name) {
      alert('Please fill in ID and Name fields');
      return;
    }

    if (contentCategories[newCategoryForm.id]) {
      alert('Category ID already exists');
      return;
    }

    const newCategories = {
      ...contentCategories,
      [newCategoryForm.id]: {
        name: newCategoryForm.name,
        description: newCategoryForm.description,
        correctFeedback: newCategoryForm.correctFeedback,
        incorrectFeedback: newCategoryForm.incorrectFeedback
      }
    };

    setContentCategories(newCategories);
    setNewCategoryForm({
      id: '',
      name: '',
      description: '',
      correctFeedback: '',
      incorrectFeedback: ''
    });
    setShowCategoryManager(false);
  };

  const deleteContentCategory = (categoryId) => {
    if (confirm(`Are you sure you want to delete the category "${contentCategories[categoryId].name}"?`)) {
      const newCategories = { ...contentCategories };
      delete newCategories[categoryId];
      setContentCategories(newCategories);
    }
  };

  // Element management
  const updateElement = (elementId, updatedElement) => {
    const newElements = {
      ...roomElements,
      [elementId]: updatedElement
    };
    setRoomElements(newElements);
  };

  const deleteElement = (elementId) => {
    if (confirm('Are you sure you want to delete this element?')) {
      const newElements = { ...roomElements };
      delete newElements[elementId];
      setRoomElements(newElements);
      setShowElementModal(false);
      setSelectedElementId(null);
      setEditingElement(null);
      redrawCanvas();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔒 Room Editor Login
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
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🏗️ Laboratory Room Editor
              </h1>
              <p className="text-gray-600">Configure room layout and interactive questions</p>
            </div>
            
            <div className="flex gap-3">
              <Link
                to="/instructor"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                ← Back to Dashboard
              </Link>
              
              <button
                onClick={() => setShowCategoryManager(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                📚 Manage Content Categories
              </button>
              
              <button
                onClick={saveAllData}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSaving ? 'Saving...' : '💾 Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-blue-800">Room Images</h3>
            <p className="text-2xl font-bold text-blue-600">{Object.keys(roomImages).length}</p>
            <p className="text-sm text-blue-600">Walls configured</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-green-800">Room Elements</h3>
            <p className="text-2xl font-bold text-green-600">{Object.keys(roomElements).length}</p>
            <p className="text-sm text-green-600">Interactive elements</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-purple-800">Content Categories</h3>
            <p className="text-2xl font-bold text-purple-600">{Object.keys(contentCategories).length}</p>
            <p className="text-sm text-purple-600">Feedback categories</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-yellow-800">Current Group</h3>
            <p className="text-2xl font-bold text-yellow-600">{selectedGroup}</p>
            <p className="text-sm text-yellow-600">Editing questions for</p>
          </div>
        </div>

        {/* Wall Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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

        {/* Group Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Group for Question Editing</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Editing questions for Group:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({length: 15}, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Group {num}</option>
              ))}
            </select>
            <p className="text-sm text-gray-600">
              Configure different questions for each group
            </p>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
          <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                style={{ 
                  touchAction: 'none',
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>• <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span>Green rectangles: Existing interactive elements</p>
              <p>• <span className="inline-block w-4 h-4 bg-red-500 mr-2"></span>Red rectangles: Selected element</p>
              <p>• <span className="inline-block w-4 h-4 bg-blue-500 mr-2"></span>Blue rectangles: Currently drawing</p>
            </div>
          </div>
        )}

        {/* Elements List */}
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
                      {element.contentCategory && (
                        <p className="text-xs text-purple-600">
                          📚 {contentCategories[element.contentCategory]?.name || 'Unknown Category'}
                        </p>
                      )}
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

      {/* Content Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">📚 Content Categories Manager</h2>
                <button
                  onClick={() => setShowCategoryManager(false)}
                  className="text-white hover:text-gray-300 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-purple-100 mt-2">
                Manage feedback categories that can be linked to questions
              </p>
            </div>

            <div className="p-6">
              {/* Add New Category Form */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-purple-800 mb-4">Add New Content Category</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category ID (lowercase, underscores)
                    </label>
                    <input
                      type="text"
                      value={newCategoryForm.id}
                      onChange={(e) => setNewCategoryForm(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="e.g., gram_staining"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newCategoryForm.name}
                      onChange={(e) => setNewCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Gram Staining Techniques"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCategoryForm.description}
                    onChange={(e) => setNewCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this content area..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer Feedback
                    </label>
                    <textarea
                      value={newCategoryForm.correctFeedback}
                      onChange={(e) => setNewCategoryForm(prev => ({ ...prev, correctFeedback: e.target.value }))}
                      placeholder="Feedback for correct answers in this category..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incorrect Answer Feedback
                    </label>
                    <textarea
                      value={newCategoryForm.incorrectFeedback}
                      onChange={(e) => setNewCategoryForm(prev => ({ ...prev, incorrectFeedback: e.target.value }))}
                      placeholder="Feedback for incorrect answers in this category..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                    />
                  </div>
                </div>

                <button
                  onClick={addContentCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  ➕ Add Category
                </button>
              </div>

              {/* Existing Categories */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Existing Content Categories</h3>
                <div className="space-y-4">
                  {Object.entries(contentCategories).map(([categoryId, category]) => (
                    <div key={categoryId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800">{category.name}</h4>
                          <p className="text-sm text-gray-600">ID: {categoryId}</p>
                          <p className="text-sm text-gray-700 mt-1">{category.description}</p>
                        </div>
                        <button
                          onClick={() => deleteContentCategory(categoryId)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 p-3 rounded">
                          <h5 className="font-semibold text-green-800">Correct Feedback:</h5>
                          <p className="text-green-700">{category.correctFeedback}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded">
                          <h5 className="font-semibold text-red-800">Incorrect Feedback:</h5>
                          <p className="text-red-700">{category.incorrectFeedback}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Element Configuration Modal */}
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
              <p className="text-gray-600">Element configuration form would continue here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
