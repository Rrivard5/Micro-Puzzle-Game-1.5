import { useState, useEffect } from 'react'
import { useGame } from '../../context/GameStateContext'
import imageLifecycle from '../../utils/imageLifecycleManager'

export default function Modal({ isOpen, onClose, title, elementId, studentGroup, onSolved }) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [elementContent, setElementContent] = useState(null)
  const [showInfoOnly, setShowInfoOnly] = useState(false)
  const [isAlreadySolved, setIsAlreadySolved] = useState(false)
  const [solvedInfo, setSolvedInfo] = useState('')
  const [displayOptions, setDisplayOptions] = useState([])
  const [answerMapping, setAnswerMapping] = useState([])
  
  // 🆕 Image states - only loaded when needed
  const [loadedInfoImage, setLoadedInfoImage] = useState(null)
  const [currentImageKeys, setCurrentImageKeys] = useState([])
  
  const { trackAttempt, studentInfo } = useGame()

  // 🆕 CLEANUP: Unload images when modal closes
  useEffect(() => {
    return () => {
      console.log('🧹 Modal closing - cleaning up images');
      imageLifecycle.unloadImages(currentImageKeys);
      setLoadedInfoImage(null);
      setCurrentImageKeys([]);
    };
  }, [currentImageKeys]);

  useEffect(() => {
    if (isOpen && elementId) {
      loadContent()
    }
  }, [isOpen, elementId, studentGroup])

  // 🆕 Load question image ONLY when question changes
  useEffect(() => {
    const loadQuestionImage = async () => {
      if (currentQuestion?.infoImage?.imageKey) {
        try {
          const imageData = await imageLifecycle.loadImage(
            currentQuestion.infoImage.imageKey,
            `modal-question-${elementId}`
          );
          
          if (imageData) {
            setLoadedInfoImage(imageData);
            setCurrentImageKeys(prev => [...prev, currentQuestion.infoImage.imageKey]);
          }
        } catch (error) {
          console.error('Error loading question image:', error);
          setLoadedInfoImage(null);
        }
      } else if (currentQuestion?.infoImage?.data) {
        // Fallback for old format
        setLoadedInfoImage(currentQuestion.infoImage.data);
      } else {
        setLoadedInfoImage(null);
      }
    };
    
    if (currentQuestion) {
      loadQuestionImage();
    }
  }, [currentQuestion, elementId]);

  // 🆕 Load image for already-solved elements
  useEffect(() => {
    const loadSolvedElementImage = async () => {
      if (isAlreadySolved && elementContent) {
        try {
          let imageKey = null;
          
          if (elementContent.interactionType === 'question') {
            const question = elementContent.content?.question?.groups?.[studentGroup]?.[0] 
              || elementContent.content?.question?.groups?.[1]?.[0];
            imageKey = question?.infoImage?.imageKey;
          } else if (elementContent.interactionType === 'info') {
            imageKey = elementContent.content?.infoImage?.imageKey;
          }
          
          if (imageKey) {
            const imageData = await imageLifecycle.loadImage(
              imageKey,
              `modal-solved-${elementId}`
            );
            
            if (imageData) {
              setLoadedInfoImage(imageData);
              setCurrentImageKeys(prev => [...prev, imageKey]);
            }
          }
        } catch (error) {
          console.error('Error loading solved element image:', error);
          setLoadedInfoImage(null);
        }
      }
    };
    
    loadSolvedElementImage();
  }, [isAlreadySolved, elementContent, studentGroup, elementId]);

  const loadContent = async () => {
    setIsLoading(true);
    setShowInfoOnly(false)
    setUserAnswer('')
    setFeedback(null)
    setAttempts(0)
    setShowHint(false)
    setIsAlreadySolved(false)
    setSolvedInfo('')
    setLoadedInfoImage(null)
    setCurrentImageKeys([])
    
    // Check if already solved
    const solvedElements = JSON.parse(localStorage.getItem('solved-elements') || '{}')
    const sessionId = studentInfo?.sessionId || 'default'
    const elementKey = `${sessionId}_${elementId}`
    
    if (solvedElements[elementKey]) {
      setIsAlreadySolved(true)
      setSolvedInfo(solvedElements[elementKey])
      setIsLoading(false)
      return
    }
    
    // Load element content (no images yet)
    const element = await getRoomElement(elementId)
    setElementContent(element)
    
    if (element && element.interactionType === 'question') {
      const question = await getElementQuestion(elementId, studentGroup)
      setCurrentQuestion(question)
      
      // Setup display options for multiple choice
      if (question && question.type === 'multiple_choice') {
        const cleanedOptions = (question.options || []).map(option => option.trim())
        
        if (question.randomizeAnswers) {
          const indices = cleanedOptions.map((_, index) => index)
          for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]]
          }
          
          const shuffledOptions = indices.map(originalIndex => cleanedOptions[originalIndex])
          setDisplayOptions(shuffledOptions)
          setAnswerMapping(indices)
        } else {
          setDisplayOptions(cleanedOptions)
          setAnswerMapping(cleanedOptions.map((_, index) => index))
        }
      }
    } else if (element && element.interactionType === 'info') {
      setShowInfoOnly(true)
    }
    
    setIsLoading(false)
  }

  const getRoomElement = async (elementId) => {
    const savedElements = localStorage.getItem('instructor-room-elements')
    
    if (savedElements) {
      try {
        const elements = JSON.parse(savedElements)
        return elements[elementId] || null
      } catch (error) {
        console.error('Error loading room element:', error)
      }
    }
    
    return null
  }

  const getElementQuestion = async (elementId, group) => {
    const element = await getRoomElement(elementId)
    
    if (element && element.content?.question) {
      const groupQuestions = element.content.question.groups?.[group] || element.content.question.groups?.[1]
      if (groupQuestions && groupQuestions.length > 0) {
        return groupQuestions[0]
      }
    }
    
    return {
      id: `${elementId}_default`,
      question: `What do you observe about ${element?.name || 'this element'}?`,
      type: 'text',
      correctText: 'observed',
      hint: 'Look carefully at the details.',
      clue: 'Observation recorded successfully.',
      info: 'Analysis completed successfully!',
      randomizeAnswers: false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!userAnswer.trim()) {
      setFeedback({ type: 'warning', message: 'Please provide an answer before submitting.' })
      return
    }

    const isCorrect = checkAnswer(userAnswer, currentQuestion)
    setAttempts(prev => prev + 1)
    
    const trackingId = `${elementId}_${currentQuestion.id}`
    trackAttempt('lab', trackingId, userAnswer, isCorrect)
    
    if (isCorrect) {
      const clueText = currentQuestion.info || currentQuestion.clue || elementContent?.content?.info || 'Information discovered!'
      
      const solvedElements = JSON.parse(localStorage.getItem('solved-elements') || '{}')
      const sessionId = studentInfo?.sessionId || 'default'
      const elementKey = `${sessionId}_${elementId}`
      solvedElements[elementKey] = clueText
      localStorage.setItem('solved-elements', JSON.stringify(solvedElements))
      
      setFeedback({ 
        type: 'success', 
        message: '🎉 Correct! Analysis complete.' 
      })
    } else {
      setFeedback({ 
        type: 'error', 
        message: getWrongAnswerFeedback() 
      })
    }
  }

  const checkAnswer = (answer, question) => {
    if (!question || !answer) return false
    
    const trimmedAnswer = answer.trim()
    
    if (question.type === 'multiple_choice') {
      if (question.randomizeAnswers && answerMapping.length > 0) {
        const selectedDisplayIndex = displayOptions.findIndex(option => option === trimmedAnswer)
        if (selectedDisplayIndex === -1) return false
        
        const originalIndex = answerMapping[selectedDisplayIndex]
        return originalIndex === question.correctAnswer
      } else {
        if (question.options && typeof question.correctAnswer === 'number') {
          const correctAnswerText = question.options[question.correctAnswer]
          if (correctAnswerText && trimmedAnswer === correctAnswerText.trim()) {
            return true
          }
        }
        
        if (question.answer && trimmedAnswer === question.answer.trim()) {
          return true
        }
        
        if (question.answer && question.options) {
          const matchingOption = question.options.find(opt => opt.trim() === question.answer.trim())
          if (matchingOption && trimmedAnswer === matchingOption.trim()) {
            return true
          }
        }
      }
      
    } else if (question.type === 'text') {
      if (question.correctText) {
        return question.correctText.trim().toLowerCase() === trimmedAnswer.toLowerCase()
      }
      
      if (question.answer) {
        return question.answer.trim().toLowerCase() === trimmedAnswer.toLowerCase()
      }
    }
    
    return false
  }

  const getWrongAnswerFeedback = () => {
    const feedbackMessages = [
      "Not quite right. Review the specimen carefully and try again.",
      "Incorrect. Consider the laboratory conditions and protocols.",
      "That's not the answer. Think about the microbiology principles involved.",
      "Try again. Look for visual clues in the setup."
    ]
    return feedbackMessages[attempts % feedbackMessages.length]
  }

  const handleHint = () => {
    setShowHint(true)
    const trackingId = `${elementId}_hint`
    trackAttempt('lab', trackingId, 'hint_requested', false)
  }

  const handleInfoOnly = () => {
    const infoText = elementContent.content?.info || 'Information discovered!'
    onSolved(elementId, infoText)
  }

  const handleConfirmClose = () => {
    if (feedback?.type === 'success') {
      const clueText = currentQuestion.info || currentQuestion.clue || elementContent?.content?.info || 'Information discovered!'
      onSolved(elementId, clueText)
    } else if (isAlreadySolved) {
      onSolved(elementId, solvedInfo)
    }
  }

  const handleAlreadySolvedClose = () => {
    onSolved(elementId, solvedInfo)
  }

  const handleClose = () => {
    // Cleanup will happen automatically via useEffect
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 text-3xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            {studentGroup ? `Group ${studentGroup} - ` : ''}
            Equipment Analysis
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analysis interface...</p>
            </div>
          ) : isAlreadySolved ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-bold text-green-800 mb-4">📋 Previously Analyzed</h3>
              
              <div className="mb-4">
                <p className="text-green-700 mb-4">
                  {solvedInfo}
                </p>
              </div>

              {entryImage && (
              <div className="mb-4">
                <img
                  src={entryImage}
                    alt={`${elementId} diagnostic results`}
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                  />
                </div>
              )}

              <button
                onClick={handleAlreadySolvedClose}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
              >
                ✅ Continue Investigation
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">
                  🔍 Equipment Analysis
                </h3>
                <p className="text-blue-700">
                  You are examining the {elementContent?.name || 'equipment'} to gather diagnostic information about the patient sample.
                </p>
              </div>

              {showInfoOnly && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-green-800 mb-4">📋 Analysis Results</h3>
                  
                  <div className="mb-4">
                    <p className="text-green-700 mb-4">
                      {elementContent?.content?.info || 'You have discovered important diagnostic information!'}
                    </p>
                  </div>

                  {loadedInfoImage && (
                    <div className="mb-4">
                      <img
                        src={loadedInfoImage}
                        alt={`${elementContent.name} analysis`}
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleInfoOnly}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
                  >
                    ✅ Record Analysis Data
                  </button>
                </div>
              )}

              {currentQuestion && !showInfoOnly && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">{currentQuestion.question}</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {currentQuestion.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {displayOptions.map((option, index) => (
                          <label 
                            key={index}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                              userAnswer === option 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="answer"
                              value={option}
                              checked={userAnswer === option}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              disabled={feedback?.type === 'success'}
                              className="mr-3 h-4 w-4 text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={feedback?.type === 'success'}
                      />
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={!userAnswer || feedback?.type === 'success'}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                          feedback?.type === 'success' 
                            ? 'bg-green-600 text-white cursor-not-allowed' 
                            : !userAnswer 
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {feedback?.type === 'success' ? '✅ Analysis Complete' : '📝 Submit Answer'}
                      </button>
                      
                      {!showHint && attempts > 0 && feedback?.type !== 'success' && (
                        <button
                          type="button"
                          onClick={handleHint}
                          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-all"
                        >
                          💡 Show Hint
                        </button>
                      )}
                    </div>
                  </form>

                  {feedback?.type === 'success' && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-3">📊 Diagnostic Results</h4>
                      
                      <div className="mb-4">
                        <p className="text-green-700">
                          {currentQuestion.info || currentQuestion.clue || 'Diagnostic analysis completed successfully!'}
                        </p>
                      </div>

                      {loadedInfoImage && (
                        <div className="mb-4">
                          <img
                            src={loadedInfoImage}
                            alt={`${elementId} diagnostic results`}
                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                          />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <button
                          onClick={handleConfirmClose}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
                        >
                          ✅ Continue Investigation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showHint && currentQuestion?.hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">💡 Analysis Hint</h4>
                  <p className="text-yellow-700">{currentQuestion.hint}</p>
                </div>
              )}

              {feedback && feedback.type !== 'success' && (
                <div className={`p-4 rounded-lg border-2 ${
                  feedback.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <p className="font-medium">{feedback.message}</p>
                </div>
              )}

              {attempts > 0 && (
                <div className="text-center text-sm text-gray-500">
                  Analysis attempts: {attempts}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
