import { useState, useEffect, useRef } from 'react';

const InstructorInterface = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('equipment-images');
  
  // Image management state
  const [equipmentImages, setEquipmentImages] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const [processingImages, setProcessingImages] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState('microscope');
  const [selectedGroup, setSelectedGroup] = useState(1);
  
  // Canvas ref for image processing
  const canvasRef = useRef(null);

  const equipmentTypes = ['microscope', 'incubator', 'petriDish', 'autoclave', 'centrifuge'];

  useEffect(() => {
    if (isAuthenticated) {
      loadEquipmentImages();
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

  const saveEquipmentImages = () => {
    localStorage.setItem('instructor-equipment-images', JSON.stringify(equipmentImages));
  };

  // Image processing functions
  const removeWhiteBackground = (imageData, canvas, ctx) => {
    const data = imageData.data;
    const threshold = 200; // Adjust this value to be more/less aggressive with white removal
    
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      
      // Check if pixel is close to white
      if (red > threshold && green > threshold && blue > threshold) {
        // Make it transparent
        data[i + 3] = 0;
      } else if (red > threshold - 30 && green > threshold - 30 && blue > threshold - 30) {
        // Semi-transparent for near-white pixels
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
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Process the image to remove white background
        const processedDataURL = removeWhiteBackground(imageData, canvas, ctx);
        
        resolve(processedDataURL);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event, equipment, group) => {
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
      // Process the image to remove background
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
      
      // Auto-save
      setTimeout(() => {
        saveEquipmentImages();
      }, 100);
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      setProcessingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const removeImage = (equipment, group) => {
    if (confirm('Are you sure you want to remove this image?')) {
      const imageKey = `${equipment}_group${group}`;
      setEquipmentImages(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
      saveEquipmentImages();
    }
  };

  // Enhanced image cropping/adjustment
  const adjustImageSettings = (equipment, group, settings) => {
    const imageKey = `${equipment}_group${group}`;
    setEquipmentImages(prev => ({
      ...prev,
      [imageKey]: {
        ...prev[imageKey],
        settings: {
          ...prev[imageKey]?.settings,
          ...settings
        }
      }
    }));
    saveEquipmentImages();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🧪 Microbiology Lab</h1>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Instructor Portal</h2>
            <p className="text-gray-600">Enhanced with Image Upload & Background Removal</p>
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
            <h1 className="text-2xl font-bold text-gray-800">🧪 Microbiology Lab - Enhanced Instructor Portal</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveEquipmentImages}
                className="px-6 py-3 rounded-lg font-semibold text-lg bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg transition-all transform"
              >
                💾 Save Images
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
              { id: 'equipment-images', name: 'Equipment Images', icon: '📸' },
              { id: 'image-preview', name: 'Preview & Test', icon: '👁️' },
              { id: 'settings', name: 'Image Settings', icon: '⚙️' }
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
        {/* Equipment Image Upload */}
        {activeTab === 'equipment-images' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">📸 Upload Realistic Equipment Images</h2>
            </div>
            
            {/* Equipment and Group Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Equipment and Group</h3>
              <div className="grid grid-cols-2 gap-6">
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
            </div>

            {/* Image Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Upload Image for {selectedEquipment.charAt(0).toUpperCase() + selectedEquipment.slice(1)} - Group {selectedGroup}
              </h3>
              
              {(() => {
                const imageKey = `${selectedEquipment}_group${selectedGroup}`;
                const currentImage = equipmentImages[imageKey];
                const uploadKey = `${selectedEquipment}_${selectedGroup}`;
                const isUploading = uploadingImages[uploadKey];
                const isProcessing = processingImages[uploadKey];
                
                return currentImage ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Original Image */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Original Image</h4>
                        <img
                          src={currentImage.original}
                          alt={`Original ${selectedEquipment}`}
                          className="w-full max-h-64 object-contain rounded border border-gray-300"
                        />
                      </div>
                      
                      {/* Processed Image */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Processed (Background Removed)</h4>
                        <div className="bg-gray-100 p-4 rounded border border-gray-300">
                          <img
                            src={currentImage.processed}
                            alt={`Processed ${selectedEquipment}`}
                            className="w-full max-h-64 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => removeImage(selectedEquipment, selectedGroup)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        🗑️ Remove Image
                      </button>
                      
                      <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
                        🔄 Replace Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, selectedEquipment, selectedGroup)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>File: {currentImage.name}</p>
                      <p>Size: {Math.round(currentImage.size / 1024)} KB</p>
                      <p>Uploaded: {new Date(currentImage.lastModified).toLocaleString()}</p>
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
                      <div>
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
                            onChange={(e) => handleImageUpload(e, selectedEquipment, selectedGroup)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Image Preview */}
        {activeTab === 'image-preview' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">👁️ Preview Equipment Images in Game</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(equipmentImages).map(([imageKey, imageData]) => (
                <div key={imageKey} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    {imageData.equipment.charAt(0).toUpperCase() + imageData.equipment.slice(1)} - Group {imageData.group}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Game Preview */}
                    <div className="bg-gray-100 p-4 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-2">Game Preview:</p>
                      <div className="bg-gradient-to-b from-blue-50 to-gray-100 p-4 rounded">
                        <img
                          src={imageData.processed}
                          alt={`${imageData.equipment} preview`}
                          className="w-full max-h-32 object-contain"
                          style={{
                            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))',
                            transform: 'scale(0.8)'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <p>Original size: {Math.round(imageData.size / 1024)} KB</p>
                      <p>Uploaded: {new Date(imageData.lastModified).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {Object.keys(equipmentImages).length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-600 text-lg">No equipment images uploaded yet.</p>
                <p className="text-gray-500 text-sm">Go to the Equipment Images tab to upload your first image.</p>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">⚙️ Image Processing Settings</h2>
            
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Background Removal Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Images with pure white backgrounds work best</li>
                  <li>Ensure good lighting and contrast on your equipment</li>
                  <li>Avoid shadows on the white background</li>
                  <li>Use high-resolution images for better quality</li>
                  <li>PNG format preserves transparency better than JPG</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Recommended Image Specifications</h3>
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <ul className="space-y-2 text-blue-800">
                    <li><strong>Resolution:</strong> 1200x800 pixels or higher</li>
                    <li><strong>Format:</strong> PNG (preferred) or JPG</li>
                    <li><strong>Background:</strong> Pure white (#FFFFFF)</li>
                    <li><strong>File Size:</strong> Under 10MB</li>
                    <li><strong>Equipment Size:</strong> Fill 60-80% of the image frame</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Troubleshooting</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded p-3">
                    <p className="font-medium text-gray-800">Problem: Parts of equipment are being removed</p>
                    <p className="text-gray-600 text-sm">Solution: Ensure equipment doesn't have white/light colored parts that match the background</p>
                  </div>
                  <div className="border border-gray-200 rounded p-3">
                    <p className="font-medium text-gray-800">Problem: Background not fully removed</p>
                    <p className="text-gray-600 text-sm">Solution: Use a more uniform white background, avoid shadows and gradients</p>
                  </div>
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
