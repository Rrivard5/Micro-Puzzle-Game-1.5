import { useState, useEffect } from 'react';

export default function InstructorDebug() {
  const [debugInfo, setDebugInfo] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [roomElements, setRoomElements] = useState({});

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = () => {
    try {
      // Load room elements
      const savedElements = localStorage.getItem('instructor-room-elements');
      const elements = savedElements ? JSON.parse(savedElements) : {};
      setRoomElements(elements);

      // Get debug info
      const debug = {
        hasRoomElements: Object.keys(elements).length > 0,
        roomElementsCount: Object.keys(elements).length,
        interactiveElements: Object.values(elements).filter(el => 
          ['info', 'question'].includes(el.interactionType)
        ).length,
        questionElements: Object.values(elements).filter(el => 
          el.interactionType === 'question'
        ).length,
        elementsWithGroups: Object.values(elements).filter(el => 
          el.content?.question?.groups
        ).length,
        localStorageKeys: Object.keys(localStorage).filter(key => 
          key.startsWith('instructor-')
        )
      };

      setDebugInfo(debug);
    } catch (error) {
      console.error('Debug loading error:', error);
    }
  };

  const checkElementForGroup = (elementId, groupNumber) => {
    const element = roomElements[elementId];
    if (!element) return { exists: false };

    const hasQuestion = element.content?.question?.groups?.[groupNumber];
    const hasRewardImage = hasQuestion && hasQuestion[0]?.infoImage;

    return {
      exists: true,
      interactionType: element.interactionType,
      hasQuestion: !!hasQuestion,
      hasRewardImage: !!hasRewardImage,
      questionData: hasQuestion ? hasQuestion[0] : null
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 text-red-600">🐛 INSTRUCTOR INTERFACE DEBUG</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold text-blue-800">Room Elements</h3>
              <p>Total: {debugInfo.roomElementsCount}</p>
              <p>Interactive: {debugInfo.interactiveElements}</p>
              <p>Question Type: {debugInfo.questionElements}</p>
              <p>With Groups: {debugInfo.elementsWithGroups}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-800">LocalStorage Keys</h3>
              {debugInfo.localStorageKeys?.map(key => (
                <p key={key} className="text-sm text-green-700">• {key}</p>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Debug Group:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg"
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>Group {num}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Room Elements Analysis:</h3>
            {Object.entries(roomElements).map(([elementId, element]) => {
              const analysis = checkElementForGroup(elementId, selectedGroup);
              
              return (
                <div key={elementId} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{element.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      element.interactionType === 'question' ? 'bg-blue-100 text-blue-800' :
                      element.interactionType === 'info' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {element.interactionType}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Wall:</strong> {element.wall}</p>
                      <p><strong>Type:</strong> {element.type}</p>
                      <p><strong>Required:</strong> {element.isRequired ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p><strong>Has Question for Group {selectedGroup}:</strong> {analysis.hasQuestion ? '✅' : '❌'}</p>
                      <p><strong>Has Reward Image:</strong> {analysis.hasRewardImage ? '✅' : '❌'}</p>
                      <p><strong>Question ID:</strong> {analysis.questionData?.id || 'None'}</p>
                    </div>
                  </div>

                  {analysis.hasRewardImage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-medium">✅ Reward image found!</p>
                      <img 
                        src={analysis.questionData.infoImage.data} 
                        alt="Reward preview" 
                        className="w-24 h-24 object-cover rounded mt-2"
                      />
                    </div>
                  )}

                  {element.interactionType === 'question' && !analysis.hasQuestion && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800">⚠️ No question configured for Group {selectedGroup}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-bold text-red-800 mb-2">🔧 Troubleshooting Steps:</h3>
            <ol className="text-red-700 space-y-1">
              <li>1. Go to Instructor Portal → Group Questions tab</li>
              <li>2. Select your group number</li>
              <li>3. Find elements with "Question" interaction type</li>
              <li>4. Look for the "🎁 Reward Image" section</li>
              <li>5. Upload images there - they should appear in the Modal</li>
              <li>6. Check if localStorage is being cleared between sessions</li>
            </ol>
          </div>

          <button
            onClick={loadDebugData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh Debug Data
          </button>
        </div>
      </div>
    </div>
  );
}
