import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function PPERoom() {
  const [lockerOpen, setLockerOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [selectedItems, setSelectedItems] = useState({
    footwear: null,
    bodyProtection: null,
    eyewear: null,
    handwear: null
  })
  const [allPpeCorrect, setAllPpeCorrect] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState({})
  
  const navigate = useNavigate()
  const { studentInfo, trackAttempt } = useGame()

  // Define clothing options with correct/incorrect choices - removed warning flags
  const clothingOptions = {
    footwear: {
      correct: ['closedShoes', 'labBoots'],
      options: {
        closedShoes: { emoji: '👟', name: 'Closed-toe Shoes', correct: true },
        labBoots: { emoji: '🥾', name: 'Lab Boots', correct: true },
        sandals: { emoji: '👡', name: 'Sandals', correct: false },
        flipFlops: { emoji: '🩴', name: 'Flip Flops', correct: false },
        heels: { emoji: '👠', name: 'High Heels', correct: false }
      }
    },
    bodyProtection: {
      correct: ['labCoat'],
      options: {
        labCoat: { emoji: '🥼', name: 'Lab Coat', correct: true, note: '(worn over regular shirt)' },
        vest: { emoji: '🦺', name: 'Safety Vest', correct: false },
        shawl: { emoji: '🧣', name: 'Shawl', correct: false },
        parka: { emoji: '🧥', name: 'Winter Parka', correct: false },
        noProtection: { emoji: '👕', name: 'Just Regular Shirt', correct: false }
      }
    },
    eyewear: {
      correct: ['safetyGoggles'],
      options: {
        safetyGoggles: { emoji: '🥽', name: 'Safety Goggles', correct: true },
        sunglasses: { emoji: '🕶️', name: 'Sunglasses', correct: false },
        glasses: { emoji: '👓', name: 'Regular Glasses', correct: false },
        none: { emoji: '👁️', name: 'No Eyewear', correct: false }
      }
    },
    handwear: {
      correct: ['latexGloves', 'nitrileGloves'],
      options: {
        latexGloves: { emoji: '🧤', name: 'Latex Gloves', correct: true },
        nitrileGloves: { emoji: '🫱', name: 'Nitrile Gloves', correct: true },
        winterGloves: { emoji: '🧤', name: 'Winter Gloves', correct: false },
        none: { emoji: '✋', name: 'No Gloves', correct: false }
      }
    }
  }

  // Function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Shuffle options when component mounts
  useEffect(() => {
    const shuffled = {}
    Object.keys(clothingOptions).forEach(category => {
      const optionKeys = Object.keys(clothingOptions[category].options)
      shuffled[category] = shuffleArray(optionKeys)
    })
    setShuffledOptions(shuffled)
  }, [])

  useEffect(() => {
    loadPPEQuestion()
  }, [studentInfo])

  useEffect(() => {
    // Check if all PPE selections are correct
    const allCorrect = Object.entries(selectedItems).every(([category, selectedItem]) => {
      if (!selectedItem) return false
      return clothingOptions[category].options[selectedItem].correct
    })
    setAllPpeCorrect(allCorrect && Object.values(selectedItems).every(item => item !== null))
  }, [selectedItems])

  const loadPPEQuestion = () => {
    // Load PPE question from instructor settings or use default
    const savedQuestions = localStorage.getItem('instructor-ppe-questions')
    let question = null
    
    if (savedQuestions) {
      try {
        const questions = JSON.parse(savedQuestions)
        const groupQuestions = questions.groups?.[studentInfo?.groupNumber] || questions.groups?.[1]
        if (groupQuestions && groupQuestions.length > 0) {
          question = groupQuestions[0]
        }
      } catch (error) {
        console.error('Error loading PPE questions:', error)
      }
    }
    
    // Default PPE safety question
    if (!question) {
      question = {
        id: 'ppe1',
        question: 'Which of the following is the MOST important reason for wearing gloves when handling patient samples in a microbiology lab?',
        type: 'multiple_choice',
        options: [
          'To keep your hands warm',
          'To prevent contamination of samples and protect against pathogens',
          'To look professional',
          'To avoid getting your hands dirty'
        ],
        answer: 'To prevent contamination of samples and protect against pathogens',
        hint: 'Think about the dual purpose of gloves in a medical laboratory setting.',
        clue: 'Proper PPE protocols understood - locker access granted'
      }
    }
    
    setCurrentQuestion(question)
  }

  const handleLockerSubmit = (e) => {
    e.preventDefault()
    
    if (!userAnswer.trim()) {
      setFeedback({ type: 'warning', message: 'Please select an answer before submitting.' })
      return
    }

    const isCorrect = checkAnswer(userAnswer, currentQuestion)
    setAttempts(prev => prev + 1)
    
    // Track the attempt
    trackAttempt('ppe-room', currentQuestion.id, userAnswer, isCorrect)
    
    if (isCorrect) {
      setFeedback({ type: 'success', message: '🎉 Correct! Your locker is now open.' })
      setLockerOpen(true)
      setShowQuestion(false)
    } else {
      setFeedback({ type: 'error', message: 'Incorrect. Review laboratory safety protocols and try again.' })
    }
  }

  const checkAnswer = (answer, question) => {
    if (question.type === 'multiple_choice') {
      return question.answer === answer.trim()
    } else {
      return question.answer.toLowerCase() === answer.trim().toLowerCase()
    }
  }

  const selectClothing = (category, itemKey) => {
    if (!lockerOpen) return
    
    setSelectedItems(prev => ({
      ...prev,
      [category]: itemKey
    }))
  }

  const proceedToLab = () => {
    if (allPpeCorrect) {
      navigate('/lab')
    }
  }

  const getIncorrectSelections = () => {
    return Object.entries(selectedItems).filter(([category, selectedItem]) => {
      if (!selectedItem) return false
      return !clothingOptions[category].options[selectedItem].correct
    }).map(([category, selectedItem]) => ({
      category,
      item: clothingOptions[category].options[selectedItem].name
    }))
  }

  const handleLockClick = () => {
    if (!lockerOpen) {
      setShowQuestion(true)
      // Scroll to question after a short delay
      setTimeout(() => {
        const questionElement = document.getElementById('safety-question')
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const getCategoryDisplayName = (category) => {
    const names = {
      footwear: 'Foot Protection',
      bodyProtection: 'Body Protection',
      eyewear: 'Eye Protection',
      handwear: 'Hand Protection'
    }
    return names[category] || category
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-blue-200 relative overflow-hidden">
      {/* Realistic Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-400 via-gray-300 to-transparent opacity-30"></div>
      
      {/* Ceiling Lights */}
      <div className="absolute top-0 left-0 right-0 flex justify-around py-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-16 h-4 bg-gradient-to-b from-yellow-200 to-yellow-100 rounded-lg shadow-lg opacity-80"></div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        
        {/* Room Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-600 to-purple-600">
            🥽 Personal Protective Equipment Room
          </h1>
          <p className="text-blue-700 text-lg">Prepare for laboratory entry - Group {studentInfo?.groupNumber}</p>
        </div>

        {/* Safety Alert */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">⚠️</span>
            <h2 className="text-2xl font-bold text-red-800">LABORATORY SAFETY PROTOCOL</h2>
          </div>
          <p className="text-red-700 text-lg">
            Before entering the microbiology laboratory to analyze the patient sample, you must:
          </p>
          <ol className="text-red-700 mt-4 space-y-2">
            <li>1. Answer the safety question to access your personal locker</li>
            <li>2. Select appropriate Personal Protective Equipment (PPE) from available options</li>
            <li>3. Ensure all PPE selections meet laboratory safety standards</li>
            <li>4. Proceed to the laboratory for urgent sample analysis</li>
          </ol>
        </div>

        {/* Main Room Layout */}
        <div className="relative bg-gradient-to-br from-gray-100 to-blue-50 rounded-3xl p-8 shadow-2xl border-4 border-gray-400 min-h-[700px]">
          
          {/* Realistic Room Background */}
          <div className="absolute inset-4">
            {/* Floor tiles */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-300 to-gray-200 rounded-b-2xl"></div>
            {/* Wall panels */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-gray-100 rounded-2xl opacity-90"></div>
            {/* Wall trim */}
            <div className="absolute top-4 left-4 right-4 h-2 bg-gray-300 rounded"></div>
            <div className="absolute bottom-20 left-4 right-4 h-2 bg-gray-300 rounded"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-12 grid-rows-8 gap-4 h-full min-h-[600px]">
            
            {/* Personal Locker - Center Focus */}
            <div className="col-span-8 row-span-8 col-start-3 flex flex-col items-center justify-center">
              
              {/* Realistic Locker */}
              <div className={`relative w-80 h-96 bg-gradient-to-b from-gray-500 to-gray-700 rounded-lg shadow-2xl border-4 ${
                lockerOpen ? 'border-green-400' : 'border-gray-600'
              }`}>
                
                {/* Locker Door */}
                <div className={`absolute inset-2 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg transition-transform duration-500 ${
                  lockerOpen ? 'transform -translate-x-full opacity-0' : ''
                } overflow-hidden`}>
                  {/* Door Handle */}
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <div className="w-4 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-lg"></div>
                  </div>
                  
                  {/* Clickable Lock */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-8">
                    <div 
                      className={`w-12 h-12 rounded-full ${lockerOpen ? 'bg-green-500' : 'bg-red-500'} shadow-lg border-4 border-gray-300 cursor-pointer transition-all duration-300 hover:scale-110 ${
                        !lockerOpen ? 'hover:bg-red-600' : ''
                      }`}
                      onClick={handleLockClick}
                    >
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {lockerOpen ? '🔓' : '🔒'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Locker Number Plate */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-white to-gray-100 rounded px-4 py-2 shadow-lg border border-gray-300">
                    <span className="font-bold text-gray-800 text-lg">Lab Locker</span>
                  </div>
                  
                  {/* Ventilation slots */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 space-y-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-32 h-1 bg-gray-600 rounded"></div>
                    ))}
                  </div>
                </div>

                {/* Locker Contents (visible when open) */}
                {lockerOpen && (
                  <div className="absolute inset-2 bg-gradient-to-b from-blue-50 to-white rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-center font-bold text-gray-800 mb-2 text-lg">Select Appropriate PPE</h3>
                    
                    {/* Scroll Instruction */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
                      <p className="text-yellow-800 text-xs text-center font-semibold">
                        📜 Scroll down to see all PPE categories
                      </p>
                    </div>
                    
                    {/* Important Note about Lab Coat */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                      <p className="text-blue-800 text-xs text-center">
                        <strong>Note:</strong> Lab coats are worn OVER regular clothing for protection
                      </p>
                    </div>
                    
                    {/* Clothing Categories */}
                    <div className="space-y-6">
                      {Object.entries(clothingOptions).map(([category, categoryData]) => (
                        <div key={category} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            {getCategoryDisplayName(category)}:
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {shuffledOptions[category] && shuffledOptions[category].map((itemKey) => {
                              const item = categoryData.options[itemKey]
                              return (
                                <div
                                  key={itemKey}
                                  onClick={() => selectClothing(category, itemKey)}
                                  className={`cursor-pointer p-2 rounded-lg border-2 transition-all text-left text-xs flex items-center ${
                                    selectedItems[category] === itemKey
                                      ? item.correct 
                                        ? 'border-green-400 bg-green-50' 
                                        : 'border-red-400 bg-red-50'
                                      : 'border-gray-300 bg-white hover:border-blue-400'
                                  }`}
                                >
                                  <div className="text-lg mr-3">{item.emoji}</div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-700">
                                      {item.name}
                                      {item.note && <span className="text-gray-500 text-xs ml-1">{item.note}</span>}
                                    </div>
                                    {selectedItems[category] === itemKey && (
                                      <div className={`text-xs mt-1 ${item.correct ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.correct ? '✓ Appropriate' : '✗ Inappropriate'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Locker Label */}
              <div className="mt-6 text-center">
                <div className="text-lg font-bold text-gray-700">Personal Equipment Locker</div>
                {lockerOpen ? (
                  <div className="text-sm text-green-600">✓ Access Granted</div>
                ) : (
                  <div className="text-sm text-red-600">🔒 Locked - Click lock to answer question</div>
                )}
              </div>
            </div>
          </div>

          {/* Proceed to Lab Button */}
          <div className="absolute bottom-8 right-8">
            <button
              onClick={proceedToLab}
              disabled={!allPpeCorrect}
              className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                allPpeCorrect
                  ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              }`}
            >
              {allPpeCorrect ? (
                '🚪 Enter Laboratory'
              ) : (
                '🚫 Check PPE Selection'
              )}
            </button>
          </div>
        </div>

        {/* Safety Question Panel */}
        {showQuestion && !lockerOpen && currentQuestion && (
          <div id="safety-question" className="mt-8 bg-white rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">🔒 Locker Security Question</h3>
              <button
                onClick={() => setShowQuestion(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-6">Answer this safety question to access your PPE locker:</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-800 mb-4 text-lg">{currentQuestion.question}</h4>
              
              <form onSubmit={handleLockerSubmit} className="space-y-4">
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
                  />
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!userAnswer}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                      !userAnswer 
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    🔓 Unlock Locker
                  </button>
                  
                  {!showHint && attempts > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-all"
                    >
                      💡 Show Hint
                    </button>
                  )}
                </div>
              </form>

              {/* Hint Display */}
              {showHint && currentQuestion?.hint && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">💡 Hint</h4>
                  <p className="text-yellow-700">{currentQuestion.hint}</p>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`mt-4 p-4 rounded-lg border-2 ${
                  feedback.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : feedback.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <p className="font-medium">{feedback.message}</p>
                </div>
              )}

              {attempts > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Attempts: {attempts}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PPE Status Panel */}
        {lockerOpen && (
          <div className="mt-8 bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">👷‍♀️ PPE Selection Status</h3>
            
            {/* Current Selections */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(selectedItems).map(([category, selectedItem]) => {
                const item = selectedItem ? clothingOptions[category].options[selectedItem] : null
                return (
                  <div 
                    key={category}
                    className={`p-4 rounded-lg border-2 text-center ${
                      item ? (item.correct ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50')
                      : 'border-gray-400 bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {item ? item.emoji : '❓'}
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {getCategoryDisplayName(category)}
                    </div>
                    <div className={`text-xs ${
                      item ? (item.correct ? 'text-green-600' : 'text-red-600') : 'text-gray-500'
                    }`}>
                      {item ? (item.correct ? '✓ Appropriate' : '✗ Inappropriate') : 'Not Selected'}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Status Message */}
            {allPpeCorrect ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold text-center">
                  ✅ All PPE selections are appropriate! You may now enter the laboratory safely.
                </p>
              </div>
            ) : Object.values(selectedItems).every(item => item !== null) ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold text-center mb-2">
                  ❌ Some PPE selections are inappropriate for laboratory work:
                </p>
                <ul className="text-red-700 text-sm">
                  {getIncorrectSelections().map(({ category, item }) => (
                    <li key={category}>• {item} is not appropriate for {getCategoryDisplayName(category).toLowerCase()}</li>
                  ))}
                </ul>
                <p className="text-red-600 text-sm mt-2 text-center">
                  Please select appropriate laboratory-grade protective equipment.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold text-center">
                  ⚠️ Please select appropriate protective equipment for each category before entering the lab.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
