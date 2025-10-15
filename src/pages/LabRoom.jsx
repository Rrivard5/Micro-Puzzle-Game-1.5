import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import Modal from '../components/UI/Modal'

export default function LabRoom() {
  const [discoveredClues, setDiscoveredClues] = useState({})
  const [solvedElements, setSolvedElements] = useState({})
  const [revealedElements, setRevealedElements] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [modalContent, setModalContent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentWall, setCurrentWall] = useState(0) // 0=North, 1=East, 2=South, 3=West
  const [roomImages, setRoomImages] = useState({})
  const [roomElements, setRoomElements] = useState({})
  const [gameSettings, setGameSettings] = useState({
    completionMode: 'final_question',
    finalQuestion: null
  })
  const [finalQuestionSettings, setFinalQuestionSettings] = useState({})
  const [elementStates, setElementStates] = useState({})
  const [showFinalQuestion, setShowFinalQuestion] = useState(false)
  const [finalQuestionAnswer, setFinalQuestionAnswer] = useState('')
  const [finalQuestionAttempts, setFinalQuestionAttempts] = useState(0)
  const [finalQuestionFeedback, setFinalQuestionFeedback] = useState(null)
  const [showFinalHint, setShowFinalHint] = useState(false)
  const [finalQuestionSolved, setFinalQuestionSolved] = useState(false)
  
  const navigate = useNavigate()
  const { studentInfo, trackAttempt, startRoomTimer, completeRoom } = useGame()

  const wallNames = ['North Wall', 'East Wall', 'South Wall', 'West Wall']
  const wallKeys = ['north', 'east', 'south', 'west']

  useEffect(() => {
    startRoomTimer('lab')
    loadRoomData()
    loadGameSettings()
    loadFinalQuestionSettings()
    checkFinalQuestionStatus()
  }, [studentInfo])

  const checkFinalQuestionStatus = () => {
    const sessionId = studentInfo?.sessionId || 'default'
    const finalQuestionKey = `${sessionId}_final_question_solved`
    const isSolved = localStorage.getItem(finalQuestionKey) === 'true'
    setFinalQuestionSolved(isSolved)
  }

  const loadRoomData = () => {
    // Load room images
    const savedImages = localStorage.getItem('instructor-room-images')
    if (savedImages) {
      try {
        setRoomImages(JSON.parse(savedImages))
      } catch (error) {
        console.error('Error loading room images:', error)
      }
    }
    
    // Load room elements
    const savedElements = localStorage.getItem('instructor-room-elements')
    if (savedElements) {
      try {
        const elements = JSON.parse(savedElements)
        setRoomElements(elements)
        
        // Initialize element states and check solved status
        const initialStates = {}
        const initialRevealed = {}
        const sessionId = studentInfo?.sessionId || 'default'
        const solvedElementsData = JSON.parse(localStorage.getItem('solved-elements') || '{}')
        
        Object.entries(elements).forEach(([elementId, element]) => {
          const elementKey = `${sessionId}_${elementId}`
          const isSolved = !!solvedElementsData[elementKey]
          
          initialStates[elementId] = {
            discovered: isSolved,
            active: false,
            solved: isSolved
          }
          
          if (isSolved) {
            setSolvedElements(prev => ({ ...prev, [elementId]: true }))
            setDiscoveredClues(prev => ({ ...prev, [elementId]: solvedElementsData[elementKey] }))
          }
          
          // Elements are initially visible unless they have a revealedBy property
          initialRevealed[elementId] = !element.revealedBy
        })
        
        setElementStates(initialStates)
        setRevealedElements(initialRevealed)
      } catch (error) {
        console.error('Error loading room elements:', error)
      }
    }
  }

  const loadGameSettings = () => {
    const savedSettings = localStorage.getItem('instructor-game-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setGameSettings({
          completionMode: 'final_question',
          finalQuestion: settings.finalQuestion || null
        })
      } catch (error) {
        console.error('Error loading game settings:', error)
      }
    }
  }

  const loadFinalQuestionSettings = () => {
    const savedFinalQuestions = localStorage.getItem('instructor-final-questions')
    if (savedFinalQuestions) {
      try {
        const settings = JSON.parse(savedFinalQuestions)
        setFinalQuestionSettings(settings)
      } catch (error) {
        console.error('Error loading final question settings:', error)
      }
    }
  }

  const handleElementClick = (elementId, event) => {
    const element = roomElements[elementId]
    if (!element) return

    // Handle non-interactive elements
    if (element.interactionType === 'none') return

    setElementStates(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], discovered: true, active: true }
    }))

    openElementModal(elementId)
  }

  const openElementModal = (elementId) => {
    const element = roomElements[elementId]
    setActiveModal(elementId)
    setModalContent({
      type: elementId,
      title: `🔍 ${element.name}`,
      description: `Examining ${element.name}...`,
      isEquipment: false
    })
  }

  const handleElementSolved = (elementId, clue) => {
    const element = roomElements[elementId]
    if (!element) return

    // Mark element as solved
    setSolvedElements(prev => ({ ...prev, [elementId]: true }))
    setDiscoveredClues(prev => ({ ...prev, [elementId]: clue }))
    setElementStates(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], solved: true, active: false }
    }))

    setActiveModal(null)
  }

  // NEW: Handle clicking on discovered clue boxes to view details
  const handleClueClick = (elementId) => {
    navigate('/lab-notebook')
  }

  const handleFinalQuestionClick = () => {
    if (finalQuestionSolved) {
      // If already solved, go directly to completion
      handleLabExit()
    } else {
      setShowFinalQuestion(true)
    }
  }

  const handleFinalQuestionSubmit = (e) => {
    e.preventDefault()
    
    if (!finalQuestionAnswer.trim()) {
      setFinalQuestionFeedback({ type: 'warning', message: 'Please provide an answer before submitting.' })
      return
    }

    const finalQuestion = getFinalQuestion()
    if (!finalQuestion) {
      console.error('No final question configured')
      setFinalQuestionFeedback({ type: 'error', message: 'No final question is configured. Please contact your instructor.' })
      return
    }

    const isCorrect = checkFinalAnswer(finalQuestionAnswer, finalQuestion)
    setFinalQuestionAttempts(prev => prev + 1)
    
    // Track the attempt
    trackAttempt('lab', 'final_question', finalQuestionAnswer, isCorrect)
    
    if (isCorrect) {
      setFinalQuestionFeedback({ 
        type: 'success', 
        message: '🎉 Correct! Patient diagnosis complete.' 
      })
      
      // Mark final question as solved
      const sessionId = studentInfo?.sessionId || 'default'
      const finalQuestionKey = `${sessionId}_final_question_solved`
      localStorage.setItem(finalQuestionKey, 'true')
      setFinalQuestionSolved(true)
    } else {
      setFinalQuestionFeedback({ 
        type: 'error', 
        message: 'Incorrect. Review your laboratory findings and try again.' 
      })
    }
  }

  const getFinalQuestion = () => {
    // Get group-specific question or fall back to group 1
    const groupNumber = studentInfo?.groupNumber || 1
    const groupQuestion = finalQuestionSettings.groups?.[groupNumber] || finalQuestionSettings.groups?.[1]
    
    if (groupQuestion && groupQuestion.length > 0) {
      return groupQuestion[0]
    }

    // Default final question if none configured
    return {
      id: 'final_question_default',
      question: 'Based on your laboratory analysis, what is your final diagnosis for the patient?',
      type: 'text',
      correctText: 'bacterial infection',
      hint: 'Consider all the evidence you gathered from the laboratory equipment.',
      info: 'Patient successfully diagnosed and treated!'
    }
  }

  const checkFinalAnswer = (answer, question) => {
    if (question.type === 'multiple_choice') {
      const selectedIndex = question.options.findIndex(opt => opt === answer.trim())
      return selectedIndex === question.correctAnswer
    } else {
      return question.correctText && question.correctText.toLowerCase() === answer.trim().toLowerCase()
    }
  }

  const handleLabExit = async () => {
    if (!finalQuestionSolved) {
      alert('You must complete the final diagnosis question before treating the patient!')
      return
    }
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    completeRoom('lab')
    navigate('/complete')
    setIsSubmitting(false)
  }

  const rotateLeft = () => {
    setCurrentWall((prev) => (prev + 3) % 4)
  }

  const rotateRight = () => {
    setCurrentWall((prev) => (prev + 1) % 4)
  }

  const renderRoomElement = (elementId, element) => {
    const state = elementStates[elementId] || { discovered: false, active: false, solved: false }
    const isRevealed = revealedElements[elementId]
    
    if (!isRevealed) {
      return null
    }

    const isInteractive = ['info', 'question'].includes(element.interactionType)
    
    // Calculate position and size based on region
    const region = element.region
    const style = {
      position: 'absolute',
      left: `${(region.x / 800) * 100}%`,
      top: `${(region.y / 600) * 100}%`,
      width: `${(region.width / 800) * 100}%`,
      height: `${(region.height / 600) * 100}%`,
      zIndex: 10
    }
    
    return (
      <div
        key={elementId}
        className={`transition-all duration-300 ${
          isInteractive ? 'cursor-pointer group' : ''
        }`}
        style={style}
        onClick={isInteractive ? (e) => handleElementClick(elementId, e) : undefined}
      >
        {/* Invisible clickable area - no visual indication */}
        <div className="w-full h-full rounded-lg">
          
          {/* Solved indicator */}
          {state.solved && (
            <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg text-white">
              ✓
            </div>
          )}
          
          {/* Element name tooltip - only shows on hover */}
          {isInteractive && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
              {element.name}
              {state.solved && <span className="ml-1 text-green-400">✓</span>}
              {element.isRequired && <span className="ml-1 text-red-400">*</span>}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderWallContent = () => {
    const wallKey = wallKeys[currentWall]
    const roomImage = roomImages[wallKey]
    
    // Get room elements for this wall
    const wallElements = Object.entries(roomElements).filter(([id, element]) => 
      element.wall === wallKey
    )
    
    return (
      <div className="relative w-full h-[600px] overflow-hidden rounded-xl border-4 border-gray-600 shadow-2xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: roomImage 
              ? `url('${roomImage.data}')`
              : `url('data:image/svg+xml,${encodeURIComponent(`
                <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#f1f5f9"/>
                      <stop offset="100%" stop-color="#e2e8f0"/>
                    </linearGradient>
                    <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#ffffff"/>
                      <stop offset="100%" stop-color="#f8fafc"/>
                    </linearGradient>
                    <pattern id="floorTiles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                      <rect width="50" height="50" fill="#f8fafc"/>
                      <rect width="48" height="48" x="1" y="1" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
                    </pattern>
                  </defs>
                  
                  <polygon points="80,180 720,180 760,550 40,550" fill="url(#floorTiles)" stroke="#cbd5e0" stroke-width="2"/>
                  <polygon points="120,60 680,60 720,180 80,180" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  <polygon points="80,180 120,60 120,400 80,520" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  <polygon points="680,60 720,180 720,520 680,400" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  <polygon points="150,300 650,300 680,340 120,340" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
                  <polygon points="120,340 680,340 680,360 120,360" fill="#d1d5db"/>
                  <polygon points="680,340 720,380 720,400 680,360" fill="#cbd5e0"/>
                  <ellipse cx="250" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
                  <ellipse cx="400" cy="85" rx="70" ry="15" fill="#fef3c7" opacity="0.9"/>
                  <ellipse cx="550" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
                  <text x="400" y="50" text-anchor="middle" fill="#9ca3af" font-size="24" font-family="Arial">
                    ${wallNames[currentWall]}
                  </text>
                </svg>
              `)}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Room Elements Overlay */}
        <div className="absolute inset-0">
          {wallElements.map(([elementId, element]) => {
            const isRevealed = revealedElements[elementId]
            if (!isRevealed) return null
            
            return renderRoomElement(elementId, element)
          })}
        </div>

        {/* Enhanced atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-30"></div>
          <div className="absolute top-12 left-1/4 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute top-16 right-1/4 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-200 via-transparent to-transparent opacity-30"></div>
        </div>
      </div>
    )
  }

  const getCompletionRequirements = () => {
    const requiredElements = Object.entries(roomElements).filter(([id, element]) => 
      element.isRequired !== false && 
      ['info', 'question'].includes(element.interactionType)
    )
    
    const solvedRequiredCount = requiredElements.filter(([id]) => solvedElements[id]).length
    
    return {
      required: requiredElements.length,
      completed: solvedRequiredCount,
      description: 'Required Equipment Analyses'
    }
  }

  const completionReq = getCompletionRequirements()
  const interactiveElements = Object.entries(roomElements).filter(([id, element]) => 
    ['info', 'question'].includes(element.interactionType)
  )
  const solvedElementsCount = Object.values(solvedElements).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-40"></div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-300 via-slate-200 to-transparent"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        
        {/* Lab Title */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-blue-600 to-green-600" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px' }}>
            🚨 EMERGENCY PATHOGEN ANALYSIS
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-red-500 to-blue-500 mb-4 animate-pulse"></div>
          <p className="text-red-700 text-lg font-semibold">Group {studentInfo?.groupNumber} - Patient Sample Investigation</p>
          
          <div className="mt-2 text-sm">
            {Object.keys(roomImages).length > 0 && (
              <span className="text-green-600 mr-4">✓ {Object.keys(roomImages).length} Room Images</span>
            )}
            {Object.keys(roomElements).length > 0 && (
              <span className="text-blue-600 mr-4">🏗️ {Object.keys(roomElements).length} Room Elements</span>
            )}
            {interactiveElements.length > 0 && (
              <span className="text-purple-600 mr-4">🔍 {interactiveElements.length} Interactive Elements</span>
            )}
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-6 bg-white bg-opacity-95 rounded-xl p-4 text-center shadow-xl border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800">🔍 Investigation Progress</h3>
            {/* NEW: Laboratory Notebook Button */}
            <button
              onClick={() => navigate('/lab-notebook')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm transition-all transform hover:scale-105 shadow-lg flex items-center"
            >
              📔 Lab Notebook
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Analyze all required equipment before attempting final diagnosis
          </p>
          
          {/* Interactive Elements Progress */}
          {interactiveElements.length > 0 && (
            <div className="mb-3">
              <div className="flex justify-center gap-2 mb-2 flex-wrap">
                {interactiveElements.map(([elementId, element]) => {
                  const elementState = elementStates[elementId] || { solved: false, discovered: false }
                  const isRevealed = revealedElements[elementId]
                  
                  return (
                    <div
                      key={elementId}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 relative ${
                        elementState.solved 
                          ? 'bg-green-500 text-white border-green-600 shadow-lg scale-110' 
                          : elementState.discovered
                          ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg animate-pulse'
                          : isRevealed
                          ? 'bg-gray-300 text-gray-600 border-gray-400'
                          : 'bg-gray-200 text-gray-400 border-gray-300 opacity-50'
                      }`}
                      title={element.name}
                    >
                      {elementState.solved ? '✓' : elementState.discovered ? '?' : isRevealed ? '○' : '🔒'}
                      {element.isRequired && <div className="absolute -bottom-1 -right-1 text-red-400 text-xs">*</div>}
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-gray-600">
                Interactive Elements: {solvedElementsCount}/{interactiveElements.length} examined
              </p>
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${completionReq.required > 0 ? (completionReq.completed / completionReq.required) * 100 : 0}%` 
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            Required Progress: {completionReq.completed}/{completionReq.required} - Final Question: {finalQuestionSolved ? 'COMPLETED' : 'PENDING'}
          </p>
        </div>

        {/* Enhanced First-Person Lab View */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-2xl border-4 border-gray-400">
          
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{wallNames[currentWall]}</h2>
            <p className="text-gray-600">Explore the room carefully to find interactive equipment</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={rotateLeft}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center"
            >
              <span className="text-xl mr-2">←</span>
              Turn Left
            </button>
            
            <div className="text-center bg-white rounded-xl p-4 shadow-lg border border-gray-300">
              <div className="text-4xl mb-2">🧭</div>
              <div className="text-sm text-gray-600 font-medium">Wall {currentWall + 1} of 4</div>
              <div className="text-xs text-gray-500">{wallNames[currentWall]}</div>
            </div>
            
            <button
              onClick={rotateRight}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center"
            >
              Turn Right
              <span className="text-xl ml-2">→</span>
            </button>
          </div>

          {renderWallContent()}

          <div className="mt-6 text-center">
            <button
              onClick={handleFinalQuestionClick}
              className={`px-10 py-5 rounded-xl font-bold text-xl shadow-xl transition-all duration-300 ${
                finalQuestionSolved
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 shadow-2xl'
                  : isSubmitting
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transform hover:scale-105 shadow-2xl'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Finalizing Treatment...
                </span>
              ) : finalQuestionSolved ? (
                '🚑 Treat Patient - Diagnosis Complete!'
              ) : (
                '🚨 Attempt Final Diagnosis'
              )}
            </button>
          </div>
        </div>

        {/* Discovered Clues Panel - NOW CLICKABLE */}
        {Object.keys(discoveredClues).length > 0 && (
          <div className="mt-8 bg-white bg-opacity-95 rounded-xl p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">📋 Investigation Results</h3>
              <button
                onClick={handleClueClick}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium underline"
              >
                📔 View in Lab Notebook
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(discoveredClues).map(([item, clue]) => {
                const element = roomElements[item]
                return (
                  <div 
                    key={item} 
                    onClick={() => handleClueClick(item)}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                      <span className="mr-2">
                        {element?.defaultIcon || '🔍'}
                      </span>
                      {element?.name || item}
                    </h4>
                    <p className="text-blue-700 text-sm line-clamp-3">{clue}</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      📔 Click to view in notebook
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Final Question Modal */}
        {showFinalQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">🚨 Final Patient Diagnosis</h2>
                  <button
                    onClick={() => setShowFinalQuestion(false)}
                    className="text-white hover:text-gray-300 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-red-100 mt-2">
                  Critical: Patient condition is deteriorating rapidly
                </p>
              </div>

              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-red-800 mb-2">
                    🏥 Emergency Assessment Required
                  </h3>
                  <p className="text-red-700">
                    Based on all your laboratory analyses, you must now provide a final diagnosis to save the patient's life.
                  </p>
                </div>

                {(() => {
                  const finalQuestion = getFinalQuestion()
                  if (!finalQuestion) return <div>No final question configured</div>

                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="font-bold text-gray-800 mb-4 text-lg">{finalQuestion.question}</h3>
                      
                      <form onSubmit={handleFinalQuestionSubmit} className="space-y-4">
                        {finalQuestion.type === 'multiple_choice' ? (
                          <div className="space-y-2">
                            {finalQuestion.options?.map((option, index) => (
                              <label 
                                key={index}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                  finalQuestionAnswer === option 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="finalAnswer"
                                  value={option}
                                  checked={finalQuestionAnswer === option}
                                  onChange={(e) => setFinalQuestionAnswer(e.target.value)}
                                  disabled={finalQuestionFeedback?.type === 'success'}
                                  className="mr-3 h-4 w-4 text-blue-600"
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={finalQuestionAnswer}
                            onChange={(e) => setFinalQuestionAnswer(e.target.value)}
                            placeholder="Enter your final diagnosis..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={finalQuestionFeedback?.type === 'success'}
                          />
                        )}

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={!finalQuestionAnswer || finalQuestionFeedback?.type === 'success'}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                              finalQuestionFeedback?.type === 'success' 
                                ? 'bg-green-600 text-white cursor-not-allowed' 
                                : !finalQuestionAnswer 
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {finalQuestionFeedback?.type === 'success' ? '✅ Diagnosis Complete' : '🚑 Submit Diagnosis'}
                          </button>
                          
                          {!showFinalHint && finalQuestionAttempts > 0 && finalQuestionFeedback?.type !== 'success' && (
                            <button
                              type="button"
                              onClick={() => setShowFinalHint(true)}
                              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-all"
                            >
                              💡 Show Hint
                            </button>
                          )}
                        </div>
                      </form>

                      {/* Hint Display */}
                      {showFinalHint && finalQuestion?.hint && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-bold text-yellow-800 mb-2">💡 Clinical Hint</h4>
                          <p className="text-yellow-700">{finalQuestion.hint}</p>
                        </div>
                      )}

                      {/* Feedback */}
                      {finalQuestionFeedback && (
                        <div className={`mt-4 p-4 rounded-lg border-2 ${
                          finalQuestionFeedback.type === 'success' 
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : finalQuestionFeedback.type === 'error'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        }`}>
                          <p className="font-medium">{finalQuestionFeedback.message}</p>
                          {finalQuestionFeedback.type === 'success' && (
                            <div className="mt-4">
                              {/* Text Information */}
                              {finalQuestion.info && (
                                <p className="text-green-700 mb-4">
                                  {finalQuestion.info}
                                </p>
                              )}
                              
                              {/* Info Image */}
                              {finalQuestion.infoImage && (
                                <div className="mb-4">
                                  <img
                                    src={finalQuestion.infoImage.data}
                                    alt="Final diagnosis results"
                                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                                  />
                                </div>
                              )}
                              
                              <div className="text-center">
                                <button
                                  onClick={() => setShowFinalQuestion(false)}
                                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
                                >
                                  ✅ Continue to Treatment
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {finalQuestionAttempts > 0 && (
                        <div className="mt-4 text-center text-sm text-gray-500">
                          Diagnosis attempts: {finalQuestionAttempts}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
          <h3 className="text-xl font-bold mb-3">🚨 Emergency Protocol</h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Navigate:</strong> Use the turn buttons to look around the laboratory</li>
            <li>• <strong>Explore Carefully:</strong> Click on equipment and areas that look interactable</li>
            <li>• <strong>Solve Puzzles:</strong> Answer diagnostic questions to gather evidence</li>
            <li>• <strong>Review Findings:</strong> Click investigation results or use Lab Notebook to review discoveries</li>
            <li>• <strong>Final Diagnosis:</strong> Click the red button to attempt your final diagnosis</li>
            <li>• <strong>Complete Treatment:</strong> Successfully diagnose the patient to proceed</li>
            <li>• <strong>Time Critical:</strong> The patient's condition is deteriorating - work quickly!</li>
          </ul>
        </div>
      </div>

      {/* Enhanced Modal for Elements */}
      {activeModal && (
        <Modal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          title={modalContent?.title}
          elementId={activeModal}
          studentGroup={studentInfo?.groupNumber}
          onSolved={handleElementSolved}
        />
      )}
    </div>
  )
}
