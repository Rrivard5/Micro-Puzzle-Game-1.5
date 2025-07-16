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
  const [labLocked, setLabLocked] = useState(true)
  const [currentWall, setCurrentWall] = useState(0) // 0=North, 1=East, 2=South, 3=West
  const [backgroundImages, setBackgroundImages] = useState({})
  const [roomElements, setRoomElements] = useState({})
  const [expandedElements, setExpandedElements] = useState({})
  const [gameSettings, setGameSettings] = useState({
    completionMode: 'all',
    finalElementId: ''
  })
  
  const navigate = useNavigate()
  const { studentInfo, trackAttempt, startRoomTimer, completeRoom } = useGame()

  const [elementStates, setElementStates] = useState({})

  const wallNames = ['North Wall', 'East Wall', 'South Wall', 'West Wall']
  const wallKeys = ['north', 'east', 'south', 'west']

  useEffect(() => {
    startRoomTimer('lab')
    loadBackgroundImages()
    loadRoomElements()
    loadGameSettings()
  }, [studentInfo])

  const loadBackgroundImages = () => {
    const savedBgImages = localStorage.getItem('instructor-background-images')
    if (savedBgImages) {
      try {
        setBackgroundImages(JSON.parse(savedBgImages))
      } catch (error) {
        console.error('Error loading background images:', error)
      }
    }
  }

  const loadRoomElements = () => {
    const savedElements = localStorage.getItem('instructor-room-elements')
    if (savedElements) {
      try {
        const elements = JSON.parse(savedElements)
        setRoomElements(elements)
        
        // Initialize element states
        const initialStates = {}
        const initialRevealed = {}
        
        Object.entries(elements).forEach(([elementId, element]) => {
          initialStates[elementId] = {
            discovered: false,
            active: false,
            solved: false
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
          completionMode: settings.completionMode || 'all',
          finalElementId: settings.finalElementId || ''
        })
      } catch (error) {
        console.error('Error loading game settings:', error)
      }
    }
  }

  const getBackgroundImage = (wall) => {
    return backgroundImages[wall]?.data || null
  }

  const handleElementClick = (elementId) => {
    const element = roomElements[elementId]
    if (!element) return

    // Check if element has zoom interaction
    if (element.interactionType === 'zoom') {
      setExpandedElements(prev => ({
        ...prev,
        [elementId]: !prev[elementId]
      }))
      return
    }

    // Handle other interaction types
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

    // Handle element revelation
    if (['element', 'question_element'].includes(element.interactionType) && element.revealedElementId) {
      setRevealedElements(prev => ({
        ...prev,
        [element.revealedElementId]: true
      }))
    }

    setActiveModal(null)
    
    // Check if this was the final element
    if (gameSettings.completionMode === 'final' && gameSettings.finalElementId === elementId) {
      setTimeout(() => {
        setLabLocked(false)
      }, 1000)
    } else {
      checkLabCompletion()
    }
  }

  const checkLabCompletion = () => {
    // Check completion based on game settings
    if (gameSettings.completionMode === 'final') {
      // Only check if final element is solved
      if (gameSettings.finalElementId && solvedElements[gameSettings.finalElementId]) {
        setTimeout(() => {
          setLabLocked(false)
        }, 1000)
      }
      return
    }

    // Default: all required elements mode
    const requiredElements = Object.entries(roomElements).filter(([id, element]) => 
      element.isRequired !== false && 
      ['info', 'question', 'element', 'question_element'].includes(element.interactionType)
    )
    
    const solvedRequiredCount = requiredElements.filter(([id]) => solvedElements[id]).length
    
    if (requiredElements.length > 0 && solvedRequiredCount >= requiredElements.length) {
      setTimeout(() => {
        setLabLocked(false)
      }, 1000)
    }
  }

  const handleLabExit = async () => {
    // Check completion requirements based on game settings
    if (gameSettings.completionMode === 'final') {
      if (!gameSettings.finalElementId) {
        alert('Final element not configured. Please contact your instructor.')
        return
      }
      
      const isFinalSolved = solvedElements[gameSettings.finalElementId]
      
      if (!isFinalSolved) {
        alert('You must complete the required final investigation element before treating the patient!')
        return
      }
    } else {
      // Default: all required elements mode
      const requiredElements = Object.entries(roomElements).filter(([id, element]) => 
        element.isRequired !== false && 
        ['info', 'question', 'element', 'question_element'].includes(element.interactionType)
      )
      
      const unsolvedRequired = requiredElements.filter(([id]) => !solvedElements[id])
      
      if (unsolvedRequired.length > 0) {
        alert(`You must complete all required investigations! ${unsolvedRequired.length} item(s) remaining.`)
        return
      }
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
    const isExpanded = expandedElements[elementId]
    const isFinalElement = gameSettings.finalElementId === elementId
    
    if (!isRevealed) {
      return null
    }

    const isInteractive = ['info', 'question', 'element', 'question_element', 'zoom'].includes(element.interactionType)
    const isDecorative = element.interactionType === 'none'
    
    return (
      <div
        key={elementId}
        className={`absolute transition-all duration-300 ${
          isInteractive ? 'cursor-pointer hover:scale-105 group' : ''
        } ${isExpanded ? 'z-50' : ''} ${
          isFinalElement ? 'ring-4 ring-yellow-400 ring-opacity-50 rounded-lg' : ''
        }`}
        style={{
          left: `${element.settings.x}%`,
          top: `${element.settings.y}%`,
          transform: `translate(-50%, -50%) ${isExpanded ? 'scale(2)' : 'scale(1)'}`,
          zIndex: isExpanded ? 9999 : element.settings.zIndex
        }}
        onClick={() => isInteractive && handleElementClick(elementId)}
      >
        {element.image ? (
          <img
            src={element.image.processed || element.image.original}
            alt={element.name}
            className="object-contain transition-all duration-300 filter drop-shadow-lg"
            style={{
              width: `${element.settings.size}px`,
              height: `${element.settings.size}px`,
              filter: 'drop-shadow(3px 6px 12px rgba(0,0,0,0.4))'
            }}
          />
        ) : (
          <div
            className="rounded-lg flex items-center justify-center transition-all duration-300 bg-gray-100 border-2 border-gray-300"
            style={{
              width: `${element.settings.size}px`,
              height: `${element.settings.size}px`
            }}
          >
            <div className="text-gray-600 text-center">
              <div className="text-2xl mb-1">
                {element.defaultIcon || '📦'}
              </div>
              <div className="text-xs">{element.name}</div>
            </div>
          </div>
        )}
        
        {/* Label for interactive elements */}
        {isInteractive && (
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm px-2 py-1 rounded shadow-md text-xs font-bold text-gray-700 whitespace-nowrap">
              {element.name}
              {isFinalElement && <span className="text-yellow-600 ml-1">⭐</span>}
              {element.isRequired && <span className="text-red-600 ml-1">*</span>}
            </div>
            {state.solved && <div className="text-xs text-green-600 mt-1">✓ Examined</div>}
          </div>
        )}
        
        {/* Only show tooltips for non-decorative elements */}
        {isInteractive && !isDecorative && (
          <div className="absolute left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
               style={{ top: '-60px', maxWidth: '250px', whiteSpace: 'normal' }}>
            {element.interactionType === 'zoom' 
              ? (isExpanded ? "Click to return to normal size" : "Click to examine closely")
              : state.solved 
              ? "Analysis complete - data recorded" 
              : state.active 
              ? "Currently examining..." 
              : `Click to examine ${element.name}`
            }
          </div>
        )}
      </div>
    )
  }

  const renderWallContent = () => {
    const wallKey = wallKeys[currentWall]
    const backgroundImage = getBackgroundImage(wallKey)
    
    // Get room elements for this wall
    const wallElements = Object.entries(roomElements).filter(([id, element]) => 
      element.wall === wallKey
    )
    
    return (
      <div className="relative w-full h-[600px] overflow-hidden rounded-xl border-4 border-gray-600 shadow-2xl">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: backgroundImage 
              ? `url('${backgroundImage}')`
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
                </svg>
              `)}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Room Elements Positioning */}
        <div className="absolute inset-0">
          {wallElements.map(([elementId, element]) => {
            const isRevealed = revealedElements[elementId]
            if (!isRevealed) return null
            
            return renderRoomElement(elementId, element)
          })}
        </div>

        {/* Message when no elements are visible */}
        {wallElements.filter(([id]) => revealedElements[id]).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center shadow-lg">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                No items available on this wall
              </h3>
              <p className="text-gray-600 text-sm">
                Try rotating to other walls or check for hidden elements
              </p>
            </div>
          </div>
        )}

        {/* Enhanced atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-30"></div>
          <div className="absolute top-12 left-1/4 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute top-16 right-1/4 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute top-10 left-1/2 w-36 h-36 bg-yellow-150 rounded-full blur-3xl opacity-12"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-200 via-transparent to-transparent opacity-30"></div>
        </div>
      </div>
    )
  }

  const getCompletionRequirements = () => {
    if (gameSettings.completionMode === 'final') {
      const finalItem = gameSettings.finalElementId
      let isCompleted = false
      let itemName = 'Not configured'
      
      if (finalItem && roomElements[finalItem]) {
        isCompleted = solvedElements[finalItem] || false
        itemName = roomElements[finalItem].name
      }
      
      return {
        required: 1,
        completed: isCompleted ? 1 : 0,
        description: `Final Element: ${itemName}`
      }
    } else {
      // Default: all required elements mode
      const requiredElements = Object.entries(roomElements).filter(([id, element]) => 
        element.isRequired !== false && 
        ['info', 'question', 'element', 'question_element'].includes(element.interactionType)
      )
      
      const solvedRequiredCount = requiredElements.filter(([id]) => solvedElements[id]).length
      
      return {
        required: requiredElements.length,
        completed: solvedRequiredCount,
        description: 'All Required Elements'
      }
    }
  }

  const completionReq = getCompletionRequirements()
  const interactiveElements = Object.entries(roomElements).filter(([id, element]) => 
    ['info', 'question', 'element', 'question_element'].includes(element.interactionType)
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
            {Object.keys(backgroundImages).length > 0 && (
              <span className="text-green-600 mr-4">✓ {Object.keys(backgroundImages).length} Custom Backgrounds</span>
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
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Investigation Progress</h3>
          <p className="text-sm text-gray-600 mb-3">
            Completion Mode: {completionReq.description}
          </p>
          
          {/* Interactive Elements Progress */}
          {interactiveElements.length > 0 && (
            <div className="mb-3">
              <div className="flex justify-center gap-2 mb-2 flex-wrap">
                {interactiveElements.map(([elementId, element]) => {
                  const elementState = elementStates[elementId] || { solved: false, discovered: false }
                  const isFinalElement = gameSettings.finalElementId === elementId
                  const isRevealed = revealedElements[elementId]
                  
                  return (
                    <div
                      key={elementId}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                        elementState.solved 
                          ? 'bg-green-500 text-white border-green-600 shadow-lg scale-110' 
                          : elementState.discovered
                          ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg animate-pulse'
                          : isRevealed
                          ? 'bg-gray-300 text-gray-600 border-gray-400'
                          : 'bg-gray-200 text-gray-400 border-gray-300 opacity-50'
                      } ${isFinalElement ? 'ring-2 ring-yellow-400' : ''}`}
                      title={element.name}
                    >
                      {elementState.solved ? '✓' : elementState.discovered ? '?' : isRevealed ? '○' : '🔒'}
                      {isFinalElement && <div className="absolute -top-1 -right-1 text-yellow-400">⭐</div>}
                      {element.isRequired && !isFinalElement && <div className="absolute -bottom-1 -right-1 text-red-400 text-xs">*</div>}
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
            Progress: {completionReq.completed}/{completionReq.required} - Patient diagnosis: {labLocked ? 'PENDING' : 'READY'}
          </p>
        </div>

        {/* Enhanced First-Person Lab View */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-2xl border-4 border-gray-400">
          
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{wallNames[currentWall]}</h2>
            <p className="text-gray-600">Click on interactive elements to analyze them</p>
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
              onClick={handleLabExit}
              disabled={labLocked || isSubmitting}
              className={`px-10 py-5 rounded-xl font-bold text-xl shadow-xl transition-all duration-300 ${
                labLocked 
                  ? 'bg-red-500 text-white cursor-not-allowed opacity-50'
                  : isSubmitting
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 shadow-2xl'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Finalizing Diagnosis...
                </span>
              ) : labLocked ? (
                '🔒 Complete Required Analyses First'
              ) : (
                '🚑 Submit Patient Diagnosis'
              )}
            </button>
          </div>
        </div>

        {/* Discovered Clues Panel */}
        {Object.keys(discoveredClues).length > 0 && (
          <div className="mt-8 bg-white bg-opacity-95 rounded-xl p-6 shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Investigation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(discoveredClues).map(([item, clue]) => {
                const element = roomElements[item]
                return (
                  <div key={item} className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 shadow-md">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                      <span className="mr-2">
                        {element?.defaultIcon || '🔍'}
                      </span>
                      {element?.name || item}
                    </h4>
                    <p className="text-blue-700 text-sm">{clue}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
          <h3 className="text-xl font-bold mb-3">🚨 Emergency Protocol</h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Navigate:</strong> Use the turn buttons to look around the laboratory</li>
            <li>• <strong>Click Elements:</strong> Click directly on any interactive element to analyze it</li>
            <li>• <strong>Solve Puzzles:</strong> Answer diagnostic questions to gather evidence</li>
            <li>• <strong>Complete Investigation:</strong> Complete the required analyses based on the completion mode</li>
            <li>• <strong>Save Patient:</strong> Submit your diagnosis when all analyses are complete</li>
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
