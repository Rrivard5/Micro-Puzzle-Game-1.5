import { useState, useEffect } from 'react'
import { useGame } from '../../context/GameStateContext'

export default function Modal({ isOpen, onClose, title, equipmentType, studentGroup, onSolved }) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [equipmentImage, setEquipmentImage] = useState(null)
  
  const { trackAttempt, studentInfo } = useGame()

  useEffect(() => {
    if (isOpen && equipmentType) {
      loadEquipmentContent()
    }
  }, [isOpen, equipmentType, studentGroup])

  const loadEquipmentContent = async () => {
    setIsLoading(true)
    
    // Load question for this equipment and group
    const question = await getEquipmentQuestion(equipmentType, studentGroup)
    setCurrentQuestion(question)
    
    // Load equipment image if available
    const image = await getEquipmentImage(equipmentType, studentGroup)
    setEquipmentImage(image)
    
    setIsLoading(false)
  }

  const getEquipmentQuestion = async (equipment, group) => {
    // Load from instructor settings or use defaults
    const savedQuestions = localStorage.getItem('instructor-lab-questions')
    
    if (savedQuestions) {
      const questions = JSON.parse(savedQuestions)
      const groupQuestions = questions[equipment]?.groups?.[group] || questions[equipment]?.groups?.[1]
      if (groupQuestions && groupQuestions.length > 0) {
        return groupQuestions[0] // For now, use first question
      }
    }
    
    // Default questions for each equipment type
    return getDefaultQuestion(equipment)
  }

  const getDefaultQuestion = (equipment) => {
    const defaultQuestions = {
      microscope: {
        id: 'mic1',
        question: 'Looking at the bacterial specimen under 1000x magnification, what is the most likely shape classification of these cells?',
        type: 'multiple_choice',
        options: ['Cocci (spherical)', 'Bacilli (rod-shaped)', 'Spirilla (spiral)', 'Pleomorphic (variable)'],
        answer: 'Bacilli (rod-shaped)',
        hint: 'Look carefully at the elongated shape of the individual cells.',
        clue: 'Rod-shaped bacteria detected - likely Escherichia coli'
      },
      incubator: {
        id: 'inc1',
        question: 'The incubator display shows 37°C and 5% CO2. This environment is optimal for growing which type of microorganisms?',
        type: 'multiple_choice',
        options: ['Psychrophiles', 'Mesophiles', 'Thermophiles', 'Hyperthermophiles'],
        answer: 'Mesophiles',
        hint: 'Consider the temperature range and CO2 requirements for human pathogens.',
        clue: 'Mesophilic conditions set - optimal for human pathogens'
      },
      petriDish: {
        id: 'pet1',
        question: 'On the blood agar plate, you observe clear zones around some bacterial colonies. This indicates:',
        type: 'multiple_choice',
        options: ['Alpha hemolysis', 'Beta hemolysis', 'Gamma hemolysis', 'No hemolysis'],
        answer: 'Beta hemolysis',
        hint: 'Clear zones indicate complete breakdown of red blood cells.',
        clue: 'Beta-hemolytic bacteria identified - Streptococcus pyogenes likely'
      },
      autoclave: {
        id: 'auto1',
        question: 'For proper sterilization, the autoclave must reach what temperature and pressure for how long?',
        type: 'multiple_choice',
        options: ['121°C, 15 psi, 15 minutes', '100°C, 10 psi, 10 minutes', '134°C, 20 psi, 20 minutes', '80°C, 5 psi, 30 minutes'],
        answer: '121°C, 15 psi, 15 minutes',
        hint: 'Standard sterilization parameters for most laboratory equipment.',
        clue: 'Sterilization protocol confirmed - equipment properly decontaminated'
      },
      centrifuge: {
        id: 'cent1',
        question: 'When centrifuging blood samples, the heavier red blood cells settle at the bottom while the lighter plasma rises to the top. This separation is based on:',
        type: 'multiple_choice',
        options: ['Molecular weight', 'Density differences', 'Electrical charge', 'Surface tension'],
        answer: 'Density differences',
        hint: 'Think about what causes particles to separate when spun at high speed.',
        clue: 'Density separation principle confirmed - sample fractionation successful'
      }
    }
    
    return defaultQuestions[equipment] || {
      id: 'default',
      question: 'What is the primary function of this laboratory equipment?',
      type: 'text',
      answer: 'analysis',
      hint: 'Think about how this equipment is used in microbiology research.',
      clue: 'Equipment function understood'
    }
  }

  const getEquipmentImage = async (equipment, group) => {
    const savedImages = localStorage.getItem('instructor-lab-images')
    if (savedImages) {
      const images = JSON.parse(savedImages)
      const imageKey = `${equipment}_group${group}`
      return images[imageKey] || null
    }
    return null
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
    trackAttempt('lab', `${equipmentType}_${currentQuestion.id}`, userAnswer, isCorrect)
    
    if (isCorrect) {
      setFeedback({ 
        type: 'success', 
        message: '🎉 Correct! Equipment analysis complete.' 
      })
      
      // Delay before solving to show feedback
      setTimeout(() => {
        onSolved(equipmentType, currentQuestion.clue)
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
      return question.answer === answer.trim()
    } else {
      // Text questions - case insensitive
      return question.answer.toLowerCase() === answer.trim().toLowerCase()
    }
  }

  const getWrongAnswerFeedback = () => {
    const feedbackMessages = [
      "Not quite right. Review the specimen carefully and try again.",
      "Incorrect. Consider the laboratory conditions and protocols.",
      "That's not the answer. Think about the microbiology principles involved.",
      "Try again. Look for visual clues in the equipment setup."
    ]
    return feedbackMessages[attempts % feedbackMessages.length]
  }

  const handleHint = () => {
    setShowHint(true)
    // Track hint usage
    trackAttempt('lab', `${equipmentType}_hint`, 'hint_requested', false)
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
          <p className="text-blue-100 mt-2">Group {studentGroup} - Equipment Analysis</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading equipment data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Equipment Image */}
              {equipmentImage && (
                <div className="text-center">
                  <img 
                    src={equipmentImage.data} 
                    alt={`${equipmentType} analysis`}
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                  />
                </div>
              )}

              {/* Equipment Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">🔬 Equipment Analysis</h3>
                <p className="text-blue-700">{getEquipmentDescription(equipmentType)}</p>
              </div>

              {/* Question */}
              {currentQuestion && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">{currentQuestion.question}</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {currentQuestion.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
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
                        {feedback?.type === 'success' ? '✅ Completed' : '🔍 Analyze'}
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
                      Equipment data has been added to your research findings.
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

function getEquipmentDescription(type) {
  const descriptions = {
    microscope: 'You approach the research microscope and notice a prepared slide is already mounted. The specimen appears to be a bacterial culture stained with methylene blue. Adjust the focus and examine the cellular morphology.',
    incubator: 'The incubator door is slightly ajar, revealing several culture plates inside. The digital display shows current temperature and atmospheric conditions. A research protocol is posted on the front panel.',
    petriDish: 'Several petri dishes are arranged on the lab bench. One contains blood agar with distinct bacterial colonies showing different hemolytic patterns. The colonies vary in size, color, and transparency.',
    autoclave: 'The autoclave chamber contains various lab equipment that needs sterilization. A temperature log sheet is attached to the front, showing the sterilization cycle parameters.',
    centrifuge: 'The centrifuge contains several test tubes with what appears to be blood samples. The rotor is balanced and ready for operation. Safety protocols are posted on the nearby wall.'
  }
  return descriptions[type] || 'Examine this equipment carefully for clues to your research.'
}
