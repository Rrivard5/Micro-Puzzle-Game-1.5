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
  const [ppeItems, setPpeItems] = useState({
    gloves: false,
    labCoat: false,
    safetyGoggles: false,
    closedShoes: false
  })
  const [allPpeEquipped, setAllPpeEquipped] = useState(false)
  
  const navigate = useNavigate()
  const { studentInfo, trackAttempt } = useGame()

  useEffect(() => {
    loadPPEQuestion()
  }, [studentInfo])

  useEffect(() => {
    // Check if all PPE is equipped
    const allEquipped = Object.values(ppeItems).every(equipped => equipped)
    setAllPpeEquipped(allEquipped)
  }, [ppeItems])

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

  const togglePPE = (item) => {
    if (!lockerOpen) return
    
    setPpeItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }))
  }

  const proceedToLab = () => {
    if (allPpeEquipped) {
      navigate('/lab')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-100 relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        
        {/* Room Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-600 to-purple-600">
            🥽 PPE Safety Room
          </h1>
          <p className="text-blue-700 text-lg">Prepare for laboratory entry - Group {studentInfo?.groupNumber}</p>
        </div>

        {/* Safety Alert */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">⚠️</span>
            <h2 className="text-2xl font-bold text-red-800">LABORATORY SAFETY PROTOCOL</h2>
          </div>
          <p className="text-red-700 text-lg">
            Before entering the microbiology laboratory to analyze the patient sample, you must:
          </p>
          <ol className="text-red-700 mt-4 space-y-2">
            <li>1. Answer the safety question to access your personal locker</li>
            <li>2. Equip all required Personal Protective Equipment (PPE)</li>
            <li>3. Proceed to the laboratory for urgent sample analysis</li>
          </ol>
        </div>

        {/* Main Room Layout */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-2xl border-4 border-gray-300 min-h-[600px]">
          
          {/* Room Background */}
          <div className="absolute inset-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl opacity-20"></div>
          
          <div className="relative z-10 grid grid-cols-12 grid-rows-8 gap-4 h-full min-h-[500px]">
            
            {/* Personal Locker - Center Focus */}
            <div className="col-span-6 row-span-6 col-start-4 row-start-2 flex flex-col items-center justify-center">
              
              {/* Locker */}
              <div className={`relative w-48 h-64 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg shadow-2xl border-4 ${
                lockerOpen ? 'border-green-400' : 'border-gray-500'
              }`}>
                
                {/* Locker Door */}
                <div className={`absolute inset-2 bg-gradient-to-b from-gray-300 to-gray-500 rounded-lg transition-transform duration-500 ${
                  lockerOpen ? 'rotate-y-90 opacity-0' : ''
                }`}>
                  {/* Lock */}
                  <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
                    <div className={`w-8 h-8 rounded-full ${lockerOpen ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {lockerOpen ? '🔓' : '🔒'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Locker Number */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded px-3 py-1">
                    <span className="font-bold text-gray-800">#{studentInfo?.groupNumber || '1'}</span>
                  </div>
                </div>

                {/* Locker Contents (visible when open) */}
                {lockerOpen && (
                  <div className="absolute inset-2 bg-gradient-to-b from-blue-50 to-white rounded-lg p-4">
                    <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">PPE Equipment</h3>
                    
                    {/* PPE Items Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* Safety Gloves */}
                      <div 
                        onClick={() => togglePPE('gloves')}
                        className={`cursor-pointer p-2 rounded-lg border-2 transition-all text-center ${
                          ppeItems.gloves 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">🧤</div>
                        <div className="text-xs font-semibold">Gloves</div>
                        {ppeItems.gloves && <div className="text-xs text-green-600">✓ On</div>}
                      </div>

                      {/* Lab Coat */}
                      <div 
                        onClick={() => togglePPE('labCoat')}
                        className={`cursor-pointer p-2 rounded-lg border-2 transition-all text-center ${
                          ppeItems.labCoat 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">🥼</div>
                        <div className="text-xs font-semibold">Lab Coat</div>
                        {ppeItems.labCoat && <div className="text-xs text-green-600">✓ On</div>}
                      </div>

                      {/* Safety Goggles */}
                      <div 
                        onClick={() => togglePPE('safetyGoggles')}
                        className={`cursor-pointer p-2 rounded-lg border-2 transition-all text-center ${
                          ppeItems.safetyGoggles 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">🥽</div>
                        <div className="text-xs font-semibold">Goggles</div>
                        {ppeItems.safetyGoggles && <div className="text-xs text-green-600">✓ On</div>}
                      </div>

                      {/* Closed Shoes */}
                      <div 
                        onClick={() => togglePPE('closedShoes')}
                        className={`cursor-pointer p-2 rounded-lg border-2 transition-all text-center ${
                          ppeItems.closedShoes 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">👟</div>
                        <div className="text-xs font-semibold">Shoes</div>
                        {ppeItems.closedShoes && <div className="text-xs text-green-600">✓ On</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Locker Label */}
              <div className="mt-4 text-center">
                <div className="text-sm font-bold text-gray-700">Personal Equipment Locker</div>
                {lockerOpen ? (
                  <div className="text-sm text-green-600">✓ Access Granted</div>
                ) : (
                  <div className="text-sm text-red-600">🔒 Locked - Answer Required</div>
                )}
              </div>
            </div>

            {/* Benches and Room Elements */}
            <div className="col-span-2 row-span-2 flex items-center justify-center">
              <div className="w-16 h-12 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg shadow-md">
                <div className="text-xs text-center mt-3 text-gray-200">Bench</div>
              </div>
            </div>

            <div className="col-span-2 row-span-2 col-start-11 flex items-center justify-center">
              <div className="w-16 h-12 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg shadow-md">
                <div className="text-xs text-center mt-3 text-gray-200">Bench</div>
              </div>
            </div>
          </div>

          {/* Proceed to Lab Button */}
          <div className="absolute bottom-8 right-8">
            <button
              onClick={proceedToLab}
              disabled={!allPpeEquipped}
              className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                allPpeEquipped
                  ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              }`}
            >
              {allPpeEquipped ? (
                '🚪 Enter Laboratory'
              ) : (
                '🚫 PPE Required'
              )}
            </button>
          </div>
        </div>

        {/* Safety Question Panel */}
        {!lockerOpen && currentQuestion && (
          <div className="mt-8 bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔒 Locker Security Question</h3>
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">👷‍♀️ PPE Status Check</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(ppeItems).map(([item, equipped]) => (
                <div 
                  key={item}
                  className={`p-4 rounded-lg border-2 text-center ${
                    equipped 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-red-400 bg-red-50'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {item === 'gloves' && '🧤'}
                    {item === 'labCoat' && '🥼'}
                    {item === 'safetyGoggles' && '🥽'}
                    {item === 'closedShoes' && '👟'}
                  </div>
                  <div className="font-semibold text-gray-800 capitalize">
                    {item.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className={`text-sm ${equipped ? 'text-green-600' : 'text-red-600'}`}>
                    {equipped ? '✓ Equipped' : '✗ Required'}
                  </div>
                </div>
              ))}
            </div>
            
            {allPpeEquipped ? (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold text-center">
                  ✅ All PPE equipped! You may now enter the laboratory safely.
                </p>
              </div>
            ) : (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold text-center">
                  ⚠️ Click on PPE items in your locker to equip them before entering the lab.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
