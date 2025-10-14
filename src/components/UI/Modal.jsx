import { useState, useEffect } from 'react'
import { useGame } from '../../context/GameStateContext'

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
  
  const { trackAttempt, studentInfo } = useGame()

  useEffect(() => {
    if (isOpen && elementId) {
      loadContent()
    }
  }, [isOpen, elementId, studentGroup])

  const loadContent = async () => {
    setIsLoading(true)
    setShowInfoOnly(false)
    setUserAnswer('')
    setFeedback(null)
    setAttempts(0)
    setShowHint(false)
    setIsAlreadySolved(false)
    setSolvedInfo('')
    
    // Check if this element was already solved
    const solvedElements = JSON.parse(localStorage.getItem('solved-elements') || '{}')
    const sessionId = studentInfo?.sessionId || 'default'
    const elementKey = `${sessionId}_${elementId}`
    
    if (solvedElements[elementKey]) {
      setIsAlreadySolved(true)
      setSolvedInfo(solvedElements[elementKey])
      setIsLoading(false)
      return
    }
    
    // Load room element content
    const element = await getRoomElement(elementId)
    setElementContent(element)
    
    if (element && element.interactionType === 'question') {
      const question = await getElementQuestion(elementId, studentGroup)
      setCurrentQuestion(question)
      
      // Set up display options for multiple choice questions - NO SHUFFLING
      if (question && question.type === 'multiple_choice') {
        // Use the original options array directly - no shuffling
        setDisplayOptions(question.options || [])
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
    
    // Return a default question if none exists
    return {
      id: `${elementId}_default`,
      question: `What do you observe about ${element?.name || 'this element'}?`,
      type: 'text',
      correctText: 'observed',
      hint: 'Look carefully at the details.',
      clue: 'Observation recorded successfully.',
      info: 'Analysis completed successfully!'
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
    
    // Track the attempt
    const trackingId = `${elementId}_${currentQuestion.id}`
    trackAttempt('lab', trackingId, userAnswer, isCorrect)
    
    if (isCorrect) {
      const clueText = currentQuestion.info || currentQuestion.clue || elementContent?.content?.info || 'Information discovered!'
      
      // Save this element as solved
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
      // SIMPLIFIED: For multiple choice, check if the selected answer text matches the correct answer text
      if (question.options && typeof question.correctAnswer === 'number') {
        // Check if the selected answer matches the correct option by index
        const correctAnswerText = question.options[question.correctAnswer]
        return trimmedAnswer === correctAnswerText
      } else if (question.answer) {
        // Fallback: check against the answer field directly
        return trimmedAnswer === question.answer
      }
    } else if (question.type === 'text') {
      // For text questions, check against correctText (case-insensitive)
      if (question.correctText) {
        return question.correctText.toLowerCase() === trimmedAnswer.toLowerCase()
      }
      
      // Fallback check against the answer field for backwards compatibility
      if (question.answer) {
        return question.answer.toLowerCase() === trimmedAnswer.toLowerCase()
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
    // For info-only elements, just show the information and close
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
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
              
              {/* Show the previously discovered information */}
              <div className="mb-4">
                <p className="text-green-700 mb-4">
                  {solvedInfo}
                </p>
              </div>

              {/* Show image if it exists - FIXED: Look for the image in the correct location */}
              {(() => {
                // Try to get the solved question data to show the image
                const element = elementContent
                if (element?.interactionType === 'question') {
                  const question = element.content?.question?.groups?.[studentGroup]?.[0] || element.content?.question?.groups?.[1]?.[0]
                  if (question?.infoImage) {
                    return (
                      <div className="mb-4">
                        <img
                          src={question.infoImage.data}
                          alt={`${elementId} diagnostic results`}
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                        />
                      </div>
                    )
                  }
                } else if (element?.content?.infoImage) {
                  return (
                    <div className="mb-4">
                      <img
                        src={element.content.infoImage.data}
                        alt={`${elementId} analysis`}
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                      />
                    </div>
                  )
                }
                return null
              })()}

              <button
                onClick={handleAlreadySolvedClose}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
              >
                ✅ Continue Investigation
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Content Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">
                  🔍 Equipment Analysis
                </h3>
                <p className="text-blue-700">
                  You are examining the {elementContent?.name || 'equipment'} to gather diagnostic information about the patient sample.
                </p>
              </div>

              {/* Info-only elements */}
              {showInfoOnly && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-green-800 mb-4">📋 Analysis Results</h3>
                  
                  {/* Text Information */}
                  <div className="mb-4">
                    <p className="text-green-700 mb-4">
                      {elementContent?.content?.info || 'You have discovered important diagnostic information!'}
                    </p>
                  </div>

                  {/* Info Image */}
                  {elementContent?.content?.infoImage && (
                    <div className="mb-4">
                      <img
                        src={elementContent.content.infoImage.data}
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

              {/* Question Section */}
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

                    {/* Action Buttons */}
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

                  {/* Success Information Display - FIXED: Now properly shows images */}
                  {feedback?.type === 'success' && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-3">📊 Diagnostic Results</h4>
                      
                      {/* Text Information */}
                      <div className="mb-4">
                        <p className="text-green-700">
                          {currentQuestion.info || currentQuestion.clue || 'Diagnostic analysis completed successfully!'}
                        </p>
                      </div>

                      {/* Info Image - FIXED: Now properly displays the infoImage */}
                      {currentQuestion.infoImage && (
                        <div className="mb-4">
                          <img
                            src={currentQuestion.infoImage.data}
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

              {/* Hint Display */}
              {showHint && currentQuestion?.hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">💡 Analysis Hint</h4>
                  <p className="text-yellow-700">{currentQuestion.hint}</p>
                </div>
              )}

              {/* Feedback */}
              {feedback && feedback.type !== 'success' && (
                <div className={`p-4 rounded-lg border-2 ${
                  feedback.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <p className="font-medium">{feedback.message}</p>
                </div>
              )}

              {/* Attempt Counter */}
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
