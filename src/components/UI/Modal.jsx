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
  
  const { trackAttempt, studentInfo } = useGame()

  useEffect(() => {
    if (isOpen && elementId) {
      loadContent()
    }
  }, [isOpen, elementId, studentGroup])

  const loadContent = async () => {
    setIsLoading(true)
    setShowInfoOnly(false)
    
    // Load room element content
    const element = await getRoomElement(elementId)
    setElementContent(element)
    
    if (element && ['question', 'question_element'].includes(element.interactionType)) {
      const question = await getElementQuestion(elementId, studentGroup)
      setCurrentQuestion(question)
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

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const getDisplayOptions = (question) => {
    if (question.type !== 'multiple_choice' || !question.randomizeAnswers) {
      return question.options
    }
    
    // Create a consistent seed based on student and question
    const seed = `${studentInfo?.sessionId || 'default'}_${question.id}`
    const random = seedRandom(seed)
    
    const shuffled = [...question.options]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }

  // Simple seeded random number generator
  const seedRandom = (seed) => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return () => {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff
      return hash / 0x7fffffff
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
      setFeedback({ 
        type: 'success', 
        message: '🎉 Correct! Analysis complete.' 
      })
      
      // Delay before solving to show feedback
      setTimeout(() => {
        const clueText = currentQuestion.info || currentQuestion.clue || elementContent?.content?.info || 'Information discovered!'
        onSolved(elementId, clueText)
      }, 2000)
    } else {
      setFeedback({ 
        type: 'error', 
        message: getWrongAnswerFeedback() 
      })
    }
  }

  const checkAnswer = (answer, question) => {
    if (question.type === 'multiple_choice') {
      // For multiple choice, check if the selected answer matches the correct answer index
      const selectedIndex = question.options.findIndex(opt => opt === answer.trim())
      return selectedIndex === question.correctAnswer
    } else {
      // For text questions, check against correctText
      return question.correctText && question.correctText.toLowerCase() === answer.trim().toLowerCase()
    }
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
              disabled={feedback?.type === 'success'}
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            {studentGroup ? `Group ${studentGroup} - ` : ''}
            Element Interaction
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading content...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Element Image */}
              {elementContent?.image && (
                <div className="text-center">
                  <img 
                    src={elementContent.image.processed || elementContent.image.original} 
                    alt={elementContent.name}
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                  />
                </div>
              )}

              {/* Content Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">
                  🔍 Element Examination
                </h3>
                <p className="text-blue-700">
                  You examine the {elementContent?.name || 'element'} and notice interesting details that might be relevant to your investigation.
                </p>
              </div>

              {/* Info-only elements */}
              {showInfoOnly && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-green-800 mb-4">📋 Information Discovered</h3>
                  
                  {/* Text Information */}
                  <div className="mb-4">
                    <p className="text-green-700 mb-4">
                      {elementContent?.content?.info || 'You have discovered important information about this element!'}
                    </p>
                  </div>

                  {/* Info Image */}
                  {elementContent?.content?.infoImage && (
                    <div className="mb-4">
                      <img
                        src={elementContent.content.infoImage.data}
                        alt={`${elementContent.name} information`}
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleInfoOnly}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
                  >
                    ✅ Record Information
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
                        {getDisplayOptions(currentQuestion).map((option, index) => (
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
                        {feedback?.type === 'success' ? '✅ Completed' : '✅ Submit Answer'}
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

                  {/* Success Information Display */}
                  {feedback?.type === 'success' && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-3">📋 Analysis Results</h4>
                      
                      {/* Text Information */}
                      <div className="mb-4">
                        <p className="text-green-700">
                          {currentQuestion.info || currentQuestion.clue || 'Analysis completed successfully!'}
                        </p>
                      </div>

                      {/* Info Image */}
                      {currentQuestion.infoImage && (
                        <div className="mb-4">
                          <img
                            src={currentQuestion.infoImage.data}
                            alt={`${elementId} analysis results`}
                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hint Display */}
              {showHint && currentQuestion?.hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">💡 Hint</h4>
                  <p className="text-yellow-700">{currentQuestion.hint}</p>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`p-4 rounded-lg border-2 ${
                  feedback.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : feedback.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <p className="font-medium">{feedback.message}</p>
                  {feedback.type === 'success' && (
                    <p className="text-sm mt-2 text-green-600">
                      Information has been added to your research findings.
                    </p>
                  )}
                </div>
              )}

              {/* Attempt Counter */}
              {attempts > 0 && (
                <div className="text-center text-sm text-gray-500">
                  Attempts: {attempts}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
