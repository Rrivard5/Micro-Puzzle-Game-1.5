// FIXED Element Configuration Modal Section for InstructorRoomEditor.jsx
// Replace the {/* Element Configuration Modal */} section (starting around line 800)

{showElementModal && editingElement && selectedElementId && (
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

        <div className="space-y-6">
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

          {/* Content Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Category (for feedback)
            </label>
            <select
              value={editingElement.contentCategory || ''}
              onChange={(e) => {
                const updated = { ...editingElement, contentCategory: e.target.value };
                setEditingElement(updated);
                updateElement(selectedElementId, updated);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No category assigned</option>
              {Object.entries(contentCategories).map(([id, category]) => (
                <option key={id} value={id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* INFO ONLY ELEMENT */}
          {editingElement.interactionType === 'info' && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Information Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Information Text
                  </label>
                  <textarea
                    value={editingElement.content?.info || ''}
                    onChange={(e) => {
                      const updated = {
                        ...editingElement,
                        content: { ...editingElement.content, info: e.target.value }
                      };
                      setEditingElement(updated);
                      updateElement(selectedElementId, updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Information revealed when clicked..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Information Image (Optional)
                  </label>
                  {editingElement.content?.infoImage?.hasImage ? (
                    <div className="space-y-2">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-green-700 text-sm">✓ Image uploaded: {editingElement.content.infoImage.name}</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = {
                            ...editingElement,
                            content: { ...editingElement.content, infoImage: null }
                          };
                          setEditingElement(updated);
                          updateElement(selectedElementId, updated);
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
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file && file.size <= 5 * 1024 * 1024) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const updated = {
                                ...editingElement,
                                content: { 
                                  ...editingElement.content, 
                                  infoImage: {
                                    data: event.target.result,
                                    name: file.name,
                                    size: file.size
                                  }
                                }
                              };
                              setEditingElement(updated);
                              updateElement(selectedElementId, updated);
                            };
                            reader.readAsDataURL(file);
                          } else if (file) {
                            alert('File size must be less than 5MB');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* QUESTION ELEMENT */}
          {editingElement.interactionType === 'question' && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-green-800 mb-4">❓ Question Configuration for Group {selectedGroup}</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                  <textarea
                    value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.question || ''}
                    onChange={(e) => {
                      const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        id: `${selectedElementId}_g${selectedGroup}`,
                        question: e.target.value,
                        type: currentQuestion.type || 'multiple_choice',
                        options: currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: currentQuestion.correctAnswer || 0,
                        correctText: currentQuestion.correctText || '',
                        hint: currentQuestion.hint || '',
                        info: currentQuestion.info || '',
                        infoImage: currentQuestion.infoImage || null,
                        randomizeAnswers: currentQuestion.randomizeAnswers || false
                      };
                      updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                      
                      const updatedElement = { ...editingElement };
                      if (!updatedElement.content) updatedElement.content = {};
                      if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                      updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                      setEditingElement(updatedElement);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter question..."
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <select
                    value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.type || 'multiple_choice'}
                    onChange={(e) => {
                      const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = {
                        ...currentQuestion,
                        type: e.target.value,
                        options: e.target.value === 'multiple_choice' ? (currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']) : [],
                        correctAnswer: e.target.value === 'multiple_choice' ? (currentQuestion.correctAnswer || 0) : 0,
                        correctText: e.target.value === 'text' ? (currentQuestion.correctText || '') : ''
                      };
                      updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                      
                      const updatedElement = { ...editingElement };
                      if (!updatedElement.content) updatedElement.content = {};
                      if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                      updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                      setEditingElement(updatedElement);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Fill in the Blank</option>
                  </select>
                </div>

                {/* MULTIPLE CHOICE OPTIONS - FIXED */}
                {editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.type === 'multiple_choice' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                      <div className="space-y-2">
                        {(editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 w-8">
                              {String.fromCharCode(65 + idx)}:
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                                const newOptions = [...(currentQuestion.options || [])];
                                newOptions[idx] = e.target.value;
                                const updatedQuestion = { ...currentQuestion, options: newOptions };
                                updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                                
                                const updatedElement = { ...editingElement };
                                if (!updatedElement.content) updatedElement.content = {};
                                if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                                updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                                setEditingElement(updatedElement);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                      <select
                        value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.correctAnswer || 0}
                        onChange={(e) => {
                          const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                          const updatedQuestion = { ...currentQuestion, correctAnswer: parseInt(e.target.value) };
                          updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                          
                          const updatedElement = { ...editingElement };
                          if (!updatedElement.content) updatedElement.content = {};
                          if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                          updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                          setEditingElement(updatedElement);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {(editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.options || []).map((option, idx) => (
                          <option key={idx} value={idx}>{String.fromCharCode(65 + idx)}: {option}</option>
                        ))}
                      </select>
                    </div>

                    {/* Randomize Answers Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="randomizeAnswers"
                        checked={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.randomizeAnswers || false}
                        onChange={(e) => {
                          const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                          const updatedQuestion = { ...currentQuestion, randomizeAnswers: e.target.checked };
                          updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                          
                          const updatedElement = { ...editingElement };
                          if (!updatedElement.content) updatedElement.content = {};
                          if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                          updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                          setEditingElement(updatedElement);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="randomizeAnswers" className="ml-2 block text-sm text-gray-700">
                        Randomize answer order for students
                      </label>
                    </div>
                  </>
                )}

                {/* TEXT ANSWER */}
                {editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                    <input
                      type="text"
                      value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.correctText || ''}
                      onChange={(e) => {
                        const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                        const updatedQuestion = { ...currentQuestion, correctText: e.target.value };
                        updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                        
                        const updatedElement = { ...editingElement };
                        if (!updatedElement.content) updatedElement.content = {};
                        if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                        updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                        setEditingElement(updatedElement);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter correct answer..."
                    />
                  </div>
                )}

                {/* Hint */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hint (Optional)</label>
                  <input
                    type="text"
                    value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.hint || ''}
                    onChange={(e) => {
                      const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = { ...currentQuestion, hint: e.target.value };
                      updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                      
                      const updatedElement = { ...editingElement };
                      if (!updatedElement.content) updatedElement.content = {};
                      if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                      updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                      setEditingElement(updatedElement);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional hint..."
                  />
                </div>

                {/* Success Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Information Revealed When Correct</label>
                  <textarea
                    value={editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.info || ''}
                    onChange={(e) => {
                      const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                      const updatedQuestion = { ...currentQuestion, info: e.target.value };
                      updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                      
                      const updatedElement = { ...editingElement };
                      if (!updatedElement.content) updatedElement.content = {};
                      if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                      updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                      setEditingElement(updatedElement);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Information revealed when answered correctly..."
                  />
                </div>

                {/* Reward Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🎁 Reward Image</label>
                  {editingElement.content?.question?.groups?.[selectedGroup]?.[0]?.infoImage?.hasImage ? (
                    <div className="space-y-2">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-green-700 text-sm">✓ Reward image uploaded</p>
                      </div>
                      <button
                        onClick={() => {
                          const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {};
                          const updatedQuestion = { ...currentQuestion, infoImage: null };
                          updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                          
                          const updatedElement = { ...editingElement };
                          if (!updatedElement.content) updatedElement.content = {};
                          if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                          updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                          setEditingElement(updatedElement);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                      📁 Upload Reward Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size <= 5 * 1024 * 1024) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const currentQuestion = editingElement.content?.question?.groups?.[selectedGroup]?.[0] || {
                                id: `${selectedElementId}_g${selectedGroup}`,
                                question: 'Question...',
                                type: 'multiple_choice',
                                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                correctAnswer: 0,
                                hint: '',
                                info: 'Information...'
                              };
                              
                              const updatedQuestion = {
                                ...currentQuestion,
                                infoImage: {
                                  data: event.target.result,
                                  name: file.name,
                                  size: file.size,
                                  hasImage: true
                                }
                              };
                              
                              updateElementQuestion(selectedElementId, selectedGroup, updatedQuestion);
                              
                              const updatedElement = { ...editingElement };
                              if (!updatedElement.content) updatedElement.content = {};
                              if (!updatedElement.content.question) updatedElement.content.question = { groups: {} };
                              updatedElement.content.question.groups[selectedGroup] = [updatedQuestion];
                              setEditingElement(updatedElement);
                            };
                            reader.readAsDataURL(file);
                          } else if (file) {
                            alert('File size must be less than 5MB');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    ✨ Shown when students answer correctly
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => deleteElement(selectedElementId)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete Element
            </button>
            <button
              onClick={() => {
                setShowElementModal(false);
                setEditingElement(null);
                setSelectedElementId(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
