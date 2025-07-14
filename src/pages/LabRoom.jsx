import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import Modal from '../components/UI/Modal'

export default function LabRoom() {
  const [discoveredClues, setDiscoveredClues] = useState({})
  const [solvedEquipment, setSolvedEquipment] = useState({})
  const [solvedElements, setSolvedElements] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [modalContent, setModalContent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [labLocked, setLabLocked] = useState(true)
  const [currentWall, setCurrentWall] = useState(0) // 0=North, 1=East, 2=South, 3=West
  const [equipmentImages, setEquipmentImages] = useState({})
  const [backgroundImages, setBackgroundImages] = useState({})
  const [roomElements, setRoomElements] = useState({})
  
  const navigate = useNavigate()
  const { studentInfo, trackAttempt, startRoomTimer, completeRoom } = useGame()

  // Equipment state
  const [equipmentStates, setEquipmentStates] = useState({
    microscope: { discovered: false, active: false, solved: false },
    incubator: { discovered: false, active: false, solved: false },
    petriDish: { discovered: false, active: false, solved: false },
    autoclave: { discovered: false, active: false, solved: false },
    centrifuge: { discovered: false, active: false, solved: false }
  })

  // Element states for room elements
  const [elementStates, setElementStates] = useState({})

  // Define equipment positions by wall
  const wallEquipment = {
    0: ['microscope'], // North wall
    1: ['incubator', 'autoclave'], // East wall  
    2: ['centrifuge'], // South wall
    3: ['petriDish'] // West wall
  }

  const wallNames = ['North Wall', 'East Wall', 'South Wall', 'West Wall']

  useEffect(() => {
    startRoomTimer('lab')
    loadGroupContent()
    loadEquipmentImages()
    loadBackgroundImages()
    loadRoomElements()
  }, [studentInfo])

  const loadGroupContent = () => {
    if (!studentInfo?.groupNumber) return
    
    // Load group-specific content from instructor settings
    const savedContent = localStorage.getItem('instructor-lab-content')
    if (savedContent) {
      const content = JSON.parse(savedContent)
      const groupContent = content.groups?.[studentInfo.groupNumber] || content.groups?.[1] || {}
      // Apply group-specific settings
    }
  }

  const loadEquipmentImages = () => {
    const savedImages = localStorage.getItem('instructor-equipment-images')
    if (savedImages) {
      try {
        setEquipmentImages(JSON.parse(savedImages))
      } catch (error) {
        console.error('Error loading equipment images:', error)
      }
    }
  }

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
        Object.keys(elements).forEach(elementId => {
          initialStates[elementId] = {
            discovered: false,
            active: false,
            solved: false
          }
        })
        setElementStates(initialStates)
      } catch (error) {
        console.error('Error loading room elements:', error)
      }
    }
  }

  const getEquipmentImage = (equipmentType, groupNumber) => {
    const imageKey = `${equipmentType}_group${groupNumber}`
    return equipmentImages[imageKey]?.processed || null
  }

  const getBackgroundImage = (wall) => {
    return backgroundImages[wall]?.data || null
  }

  const handleEquipmentClick = (equipmentType) => {
    // Mark equipment as discovered and active
    setEquipmentStates(prev => ({
      ...prev,
      [equipmentType]: { ...prev[equipmentType], discovered: true, active: true }
    }))

    // Open equipment modal
    openEquipmentModal(equipmentType)
  }

  const handleElementClick = (elementId) => {
    const element = roomElements[elementId]
    if (!element || !element.hasQuestion) return

    // Mark element as discovered and active
    setElementStates(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], discovered: true, active: true }
    }))

    // Open element modal
    openElementModal(elementId)
  }

  const openEquipmentModal = (equipmentType) => {
    setActiveModal(equipmentType)
    setModalContent({
      type: equipmentType,
      title: getEquipmentTitle(equipmentType),
      description: getEquipmentDescription(equipmentType),
      isEquipment: true
    })
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

  const getEquipmentTitle = (type) => {
    const titles = {
      microscope: '🔬 Research Microscope',
      incubator: '🌡️ Bacterial Incubator',
      petriDish: '🧫 Culture Samples',
      autoclave: '♨️ Sterilization Unit',
      centrifuge: '🌪️ High-Speed Centrifuge'
    }
    return titles[type] || 'Laboratory Equipment'
  }

  const getEquipmentDescription = (type) => {
    const descriptions = {
      microscope: 'A high-powered research microscope with the patient sample already mounted on the stage...',
      incubator: 'Temperature-controlled environment for bacterial growth. The patient culture is developing inside...',
      petriDish: 'Patient sample cultures on different growth media. The bacterial colonies show distinct patterns...',
      autoclave: 'Steam sterilization equipment. Used to sterilize tools before patient sample analysis...',
      centrifuge: 'High-speed centrifuge for separating patient blood components and isolating pathogens...'
    }
    return descriptions[type] || 'Examine this equipment for clues about the patient\'s condition.'
  }

  const handleEquipmentSolved = (equipmentType, clue) => {
    setSolvedEquipment(prev => ({ ...prev, [equipmentType]: true }))
    setDiscoveredClues(prev => ({ ...prev, [equipmentType]: clue }))
    setEquipmentStates(prev => ({
      ...prev,
      [equipmentType]: { ...prev[equipmentType], solved: true, active: false }
    }))
    setActiveModal(null)
    
    checkLabCompletion()
  }

  const handleElementSolved = (elementId, clue) => {
    setSolvedElements(prev => ({ ...prev, [elementId]: true }))
    setDiscoveredClues(prev => ({ ...prev, [elementId]: clue }))
    setElementStates(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], solved: true, active: false }
    }))
    setActiveModal(null)
    
    checkLabCompletion()
  }

  const checkLabCompletion = () => {
    // Check if all required equipment is solved
    const totalEquipment = Object.keys(equipmentStates).length
    const solvedEquipmentCount = Object.values(solvedEquipment).filter(Boolean).length
    
    // Check if all interactive elements are solved
    const interactiveElements = Object.values(roomElements).filter(el => el.hasQuestion)
    const solvedElementsCount = Object.values(solvedElements).filter(Boolean).length
    
    if (solvedEquipmentCount >= totalEquipment && solvedElementsCount >= interactiveElements.length) {
      setTimeout(() => {
        setLabLocked(false)
      }, 1000)
    }
  }

  const handleLabExit = async () => {
    const totalEquipment = Object.keys(equipmentStates).length
    const interactiveElements = Object.values(roomElements).filter(el => el.hasQuestion)
    
    if (Object.values(solvedEquipment).length < totalEquipment || 
        Object.values(solvedElements).length < interactiveElements.length) {
      alert('You must analyze all equipment and interactive elements to identify the pathogen before treating the patient!')
      return
    }
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    completeRoom('lab')
    navigate('/complete')
    setIsSubmitting(false)
  }

  const rotateLeft = () => {
    setCurrentWall((prev) => (prev + 3) % 4) // Rotate counter-clockwise
  }

  const rotateRight = () => {
    setCurrentWall((prev) => (prev + 1) % 4) // Rotate clockwise
  }

  const renderEquipmentComponent = (equipmentType, state) => {
    const equipmentImage = getEquipmentImage(equipmentType, studentInfo?.groupNumber)
    
    if (equipmentImage) {
      return (
        <div 
          className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
          onClick={() => handleEquipmentClick(equipmentType)}
        >
          <img
            src={equipmentImage}
            alt={equipmentType}
            className={`object-contain transition-all duration-300 w-full h-full ${
              state.solved 
                ? 'filter drop-shadow-lg brightness-110 saturate-110' 
                : state.active 
                ? 'filter drop-shadow-md brightness-105 animate-pulse' 
                : 'filter drop-shadow-sm hover:drop-shadow-lg'
            }`}
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              filter: `drop-shadow(3px 6px 12px rgba(0,0,0,0.4)) ${
                state.solved ? 'hue-rotate(90deg) saturate(1.3)' : 
                state.active ? 'hue-rotate(45deg) saturate(1.1)' : ''
              }`
            }}
          />
          
          {/* Enhanced status indicator overlay */}
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold shadow-lg ${
              state.solved 
                ? 'bg-green-500 text-white' 
                : state.active 
                ? 'bg-yellow-500 text-white animate-pulse' 
                : state.discovered
                ? 'bg-blue-500 text-white'
                : 'bg-gray-400 text-gray-600'
            }`}>
              {state.solved ? '✓' : state.active ? '⚡' : state.discovered ? '?' : '○'}
            </div>
          </div>
          
          {/* Equipment label */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center" style={{ bottom: '-48px' }}>
            <div className="bg-white bg-opacity-95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm font-bold text-gray-700 border border-gray-200">
              {getEquipmentTitle(equipmentType).replace(/🔬|🌡️|🧫|♨️|🌪️/, '').trim()}
            </div>
            {state.solved && <div className="text-xs text-green-600 mt-1 font-semibold">✓ Analysis Complete</div>}
            {state.active && !state.solved && <div className="text-xs text-yellow-600 mt-1 font-semibold">⚡ Analyzing...</div>}
          </div>
          
          {/* Enhanced hover tooltip */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
               style={{ top: '-80px', maxWidth: '250px', whiteSpace: 'normal' }}>
            {state.solved 
              ? "Equipment analysis complete - data recorded" 
              : state.active 
              ? "Currently analyzing patient sample..." 
              : `Click to analyze ${equipmentType} for pathogen identification`
            }
          </div>
        </div>
      )
    }
    
    // Fallback to default icon if no image
    return (
      <div 
        className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={() => handleEquipmentClick(equipmentType)}
      >
        <div 
          className={`w-24 h-24 rounded-lg flex items-center justify-center transition-all duration-300 ${
            state.solved 
              ? 'bg-green-100 border-2 border-green-400 shadow-lg' 
              : state.active 
              ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md animate-pulse' 
              : state.discovered
              ? 'bg-blue-100 border-2 border-blue-400 shadow-sm'
              : 'bg-gray-100 border-2 border-gray-300'
          }`}
        >
          <div className="text-4xl">
            {equipmentType === 'microscope' && '🔬'}
            {equipmentType === 'incubator' && '🌡️'}
            {equipmentType === 'petriDish' && '🧫'}
            {equipmentType === 'autoclave' && '♨️'}
            {equipmentType === 'centrifuge' && '🌪️'}
          </div>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center" style={{ bottom: '-48px' }}>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded shadow-md text-xs font-bold text-gray-700 border border-gray-200">
            {getEquipmentTitle(equipmentType).replace(/🔬|🌡️|🧫|♨️|🌪️/, '').trim()}
          </div>
        </div>
      </div>
    )
  }

  const renderRoomElement = (elementId, element) => {
    const state = elementStates[elementId] || { discovered: false, active: false, solved: false }
    
    return (
      <div
        key={elementId}
        className={`relative group transition-all duration-300 ${element.hasQuestion ? 'cursor-pointer hover:scale-105' : ''}`}
        style={{
          transform: `translate(${element.settings.xOffset}px, ${element.settings.yOffset}px)`,
          zIndex: element.settings.zIndex
        }}
        onClick={() => element.hasQuestion && handleElementClick(elementId)}
      >
        {element.image ? (
          <img
            src={element.image.processed}
            alt={element.name}
            className={`object-contain transition-all duration-300 ${
              state.solved 
                ? 'filter drop-shadow-lg brightness-110 saturate-110' 
                : state.active 
                ? 'filter drop-shadow-md brightness-105 animate-pulse' 
                : 'filter drop-shadow-sm hover:drop-shadow-lg'
            }`}
            style={{
              maxWidth: `${200 * (element.settings.size / 100)}px`,
              maxHeight: `${200 * (element.settings.size / 100)}px`,
              filter: `drop-shadow(3px 6px 12px rgba(0,0,0,0.4)) ${
                state.solved ? 'hue-rotate(90deg) saturate(1.3)' : 
                state.active ? 'hue-rotate(45deg) saturate(1.1)' : ''
              }`
            }}
          />
        ) : (
          <div
            className={`rounded-lg flex items-center justify-center transition-all duration-300 ${
              state.solved 
                ? 'bg-green-100 border-2 border-green-400 shadow-lg' 
                : state.active 
                ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md animate-pulse' 
                : state.discovered
                ? 'bg-blue-100 border-2 border-blue-400 shadow-sm'
                : 'bg-gray-100 border-2 border-gray-300'
            }`}
            style={{
              width: `${100 * (element.settings.size / 100)}px`,
              height: `${100 * (element.settings.size / 100)}px`
            }}
          >
            <div className="text-gray-600 text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-xs">{element.name}</div>
            </div>
          </div>
        )}
        
        {/* Status indicator for interactive elements */}
        {element.hasQuestion && (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-lg ${
              state.solved 
                ? 'bg-green-500 text-white' 
                : state.active 
                ? 'bg-yellow-500 text-white animate-pulse' 
                : state.discovered
                ? 'bg-blue-500 text-white'
                : 'bg-purple-400 text-white'
            }`}>
              {state.solved ? '✓' : state.active ? '⚡' : state.discovered ? '?' : '◉'}
            </div>
          </div>
        )}
        
        {/* Element label */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center" style={{ bottom: '-40px' }}>
          <div className="bg-white bg-opacity-95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg text-xs font-bold text-gray-700 border border-gray-200">
            {element.name}
          </div>
          {state.solved && <div className="text-xs text-green-600 mt-1 font-semibold">✓ Complete</div>}
          {state.active && !state.solved && <div className="text-xs text-yellow-600 mt-1 font-semibold">⚡ Active</div>}
          {element.hasQuestion && !state.discovered && <div className="text-xs text-purple-600 mt-1 font-semibold">◉ Interactive</div>}
        </div>
        
        {/* Hover tooltip for interactive elements */}
        {element.hasQuestion && (
          <div className="absolute left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
               style={{ top: '-60px', maxWidth: '250px', whiteSpace: 'normal' }}>
            {state.solved 
              ? "Element analysis complete - data recorded" 
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
    const equipment = wallEquipment[currentWall] || []
    const wallNames = ['north', 'east', 'south', 'west']
    const backgroundImage = getBackgroundImage(wallNames[currentWall])
    
    // Get room elements for this wall
    const wallElements = Object.entries(roomElements).filter(([id, element]) => 
      element.wall === wallNames[currentWall]
    )
    
    return (
      <div className="relative w-full h-[600px] overflow-hidden rounded-xl border-4 border-gray-600 shadow-2xl">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: backgroundImage 
              ? `linear-gradient(rgba(248,250,252,0.1), rgba(241,245,249,0.1)), url('${backgroundImage}')`
              : `linear-gradient(rgba(248,250,252,0.95), rgba(241,245,249,0.95)), url('data:image/svg+xml,${encodeURIComponent(`
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
                    <pattern id="wallTiles" x="0" y="0" width="60" height="40" patternUnits="userSpaceOnUse">
                      <rect width="60" height="40" fill="#ffffff"/>
                      <rect width="58" height="38" x="1" y="1" fill="#fefefe" stroke="#f1f5f9" stroke-width="0.5"/>
                    </pattern>
                    <radialGradient id="lightGrad" cx="50%" cy="0%" r="80%">
                      <stop offset="0%" stop-color="#fef7cd" stop-opacity="0.4"/>
                      <stop offset="100%" stop-color="#fef7cd" stop-opacity="0"/>
                    </radialGradient>
                  </defs>
                  
                  <!-- Enhanced perspective floor -->
                  <polygon points="80,180 720,180 760,550 40,550" fill="url(#floorTiles)" stroke="#cbd5e0" stroke-width="2"/>
                  
                  <!-- Back wall with better perspective -->
                  <polygon points="120,60 680,60 720,180 80,180" fill="url(#wallTiles)" stroke="#e2e8f0"/>
                  
                  <!-- Left wall -->
                  <polygon points="80,180 120,60 120,400 80,520" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  
                  <!-- Right wall -->
                  <polygon points="680,60 720,180 720,520 680,400" fill="url(#wallGrad)" stroke="#e2e8f0"/>
                  
                  <!-- Ceiling with lighting -->
                  <polygon points="80,180 120,60 680,60 720,180" fill="url(#lightGrad)" stroke="#f1f5f9"/>
                  
                  <!-- Enhanced ceiling lights -->
                  <ellipse cx="250" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
                  <ellipse cx="400" cy="85" rx="70" ry="15" fill="#fef3c7" opacity="0.9"/>
                  <ellipse cx="550" cy="80" rx="60" ry="12" fill="#fef3c7" opacity="0.9"/>
                  
                  <!-- Light rays -->
                  <polygon points="220,90 280,90 320,180 180,180" fill="url(#lightGrad)" opacity="0.3"/>
                  <polygon points="370,95 430,95 470,180 330,180" fill="url(#lightGrad)" opacity="0.3"/>
                  <polygon points="520,90 580,90 620,180 480,180" fill="url(#lightGrad)" opacity="0.3"/>
                  
                  <!-- Lab benches with enhanced 3D perspective -->
                  <polygon points="150,300 650,300 680,340 120,340" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
                  <polygon points="120,340 680,340 680,360 120,360" fill="#d1d5db"/>
                  <polygon points="680,340 720,380 720,400 680,360" fill="#cbd5e0"/>
                  
                  <!-- Bench details -->
                  <rect x="160" y="320" width="15" height="8" fill="#ffffff" stroke="#9ca3af" rx="2"/>
                  <rect x="300" y="320" width="15" height="8" fill="#ffffff" stroke="#9ca3af" rx="2"/>
                  <rect x="500" y="320" width="15" height="8" fill="#ffffff" stroke="#9ca3af" rx="2"/>
                  
                  <!-- Wall-specific features -->
                  ${currentWall === 0 ? `
                    <!-- Large window on north wall -->
                    <rect x="280" y="80" width="160" height="100" fill="#dbeafe" stroke="#3b82f6" stroke-width="3" rx="8"/>
                    <rect x="285" y="85" width="150" height="90" fill="#f0f9ff" opacity="0.8"/>
                    <line x1="360" y1="80" x2="360" y2="180" stroke="#3b82f6" stroke-width="2"/>
                    <line x1="280" y1="130" x2="440" y2="130" stroke="#3b82f6" stroke-width="2"/>
                    <!-- Window blinds -->
                    <g stroke="#94a3b8" stroke-width="1" opacity="0.6">
                      <line x1="285" y1="90" x2="435" y2="90"/>
                      <line x1="285" y1="100" x2="435" y2="100"/>
                      <line x1="285" y1="110" x2="435" y2="110"/>
                      <line x1="285" y1="120" x2="435" y2="120"/>
                      <line x1="285" y1="140" x2="435" y2="140"/>
                      <line x1="285" y1="150" x2="435" y2="150"/>
                      <line x1="285" y1="160" x2="435" y2="160"/>
                      <line x1="285" y1="170" x2="435" y2="170"/>
                    </g>
                  ` : ''}
                  
                  ${currentWall === 1 ? `
                    <!-- Emergency shower on east wall -->
                    <rect x="650" y="100" width="50" height="100" fill="#fbbf24" stroke="#d97706" stroke-width="3" rx="5"/>
                    <circle cx="675" cy="110" r="12" fill="#9ca3af"/>
                    <rect x="670" y="125" width="10" height="40" fill="#dc2626"/>
                    <circle cx="675" cy="175" r="8" fill="#ef4444"/>
                    <text x="675" y="210" text-anchor="middle" font-size="12" fill="#dc2626" font-weight="bold">EMERGENCY</text>
                    <!-- Eyewash station -->
                    <rect x="620" y="160" width="25" height="30" fill="#22c55e" stroke="#16a34a" stroke-width="2" rx="3"/>
                    <circle cx="632" cy="170" r="4" fill="#ffffff"/>
                    <text x="632" y="195" text-anchor="middle" font-size="8" fill="#16a34a">EYEWASH</text>
                  ` : ''}
                  
                  ${currentWall === 2 ? `
                    <!-- Exit door with better detail -->
                    <rect x="350" y="480" width="100" height="70" fill="#92400e" stroke="#451a03" stroke-width="3" rx="5"/>
                    <rect x="360" y="490" width="35" height="50" fill="#a16207" stroke="#451a03" stroke-width="1"/>
                    <rect x="405" y="490" width="35" height="50" fill="#a16207" stroke="#451a03" stroke-width="1"/>
                    <circle cx="430" cy="515" r="4" fill="#fbbf24"/>
                    <rect x="380" y="350" width="40" height="20" fill="#22c55e" rx="5"/>
                    <text x="400" y="365" text-anchor="middle" font-size="12" fill="white" font-weight="bold">EXIT</text>
                  ` : ''}
                  
                  ${currentWall === 3 ? `
                    <!-- Lab sink with faucet -->
                    <rect x="100" y="400" width="80" height="50" fill="#9ca3af" stroke="#6b7280" stroke-width="3" rx="8"/>
                    <rect x="110" y="410" width="60" height="30" fill="#e5e7eb" rx="5"/>
                    <ellipse cx="140" cy="380" rx="12" ry="8" fill="#6b7280"/>
                    <rect x="135" y="370" width="10" height="15" fill="#6b7280" rx="2"/>
                    <circle cx="125" cy="365" r="4" fill="#3b82f6"/>
                    <circle cx="155" cy="365" r="4" fill="#ef4444"/>
                    <circle cx="140" cy="425" r="3" fill="#374151"/>
                  ` : ''}
                  
                  <!-- Enhanced lighting effects -->
                  <ellipse cx="200" cy="500" rx="100" ry="20" fill="#fef7cd" opacity="0.2"/>
                  <ellipse cx="400" cy="500" rx="120" ry="25" fill="#fef7cd" opacity="0.2"/>
                  <ellipse cx="600" cy="500" rx="100" ry="20" fill="#fef7cd" opacity="0.2"/>
                </svg>
              `)}')`,
            backgroundSize: backgroundImage ? 'cover' : 'contain',
            backgroundPosition: 'center'
          }}
        />

        {/* Room Elements Positioning */}
        <div className="absolute inset-0 flex items-end justify-around px-12 pb-48">
          {wallElements.map(([elementId, element]) => (
            <div 
              key={elementId}
              className="absolute"
              style={{
                left: '50%',
                bottom: `${200 + element.settings.yOffset}px`,
                transform: `translateX(-50%) translateX(${element.settings.xOffset}px)`,
                zIndex: element.settings.zIndex
              }}
            >
              {renderRoomElement(elementId, element)}
            </div>
          ))}
        </div>

        {/* Equipment Positioning */}
        <div className="absolute inset-0 flex items-end justify-around px-12 pb-48">
          {equipment.map((equipmentType, index) => {
            // Dynamic positioning based on equipment count
            const positions = equipment.length === 1 
              ? [{ left: '50%', transform: 'translateX(-50%)', bottom: '200px' }]
              : equipment.length === 2
              ? [
                  { left: '30%', transform: 'translateX(-50%)', bottom: '200px' },
                  { left: '70%', transform: 'translateX(-50%)', bottom: '200px' }
                ]
              : [
                  { left: '20%', transform: 'translateX(-50%)', bottom: '200px' },
                  { left: '50%', transform: 'translateX(-50%)', bottom: '200px' },
                  { left: '80%', transform: 'translateX(-50%)', bottom: '200px' }
                ]
            
            const position = positions[index] || positions[0]
            
            return (
              <div 
                key={equipmentType} 
                className="absolute"
                style={{
                  ...position,
                  zIndex: 10 // Equipment always on top
                }}
              >
                {renderEquipmentComponent(equipmentType, equipmentStates[equipmentType])}
              </div>
            )
          })}
        </div>

        {/* Enhanced atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Volumetric lighting */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-30"></div>
          
          {/* Light beams */}
          <div className="absolute top-12 left-1/4 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute top-16 right-1/4 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute top-10 left-1/2 w-36 h-36 bg-yellow-150 rounded-full blur-3xl opacity-12"></div>
          
          {/* Floor reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-200 via-transparent to-transparent opacity-30"></div>
        </div>
      </div>
    )
  }

  const solvedCount = Object.values(solvedEquipment).filter(Boolean).length
  const totalEquipment = Object.keys(equipmentStates).length
  const interactiveElements = Object.values(roomElements).filter(el => el.hasQuestion)
  const solvedElementsCount = Object.values(solvedElements).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-100 relative overflow-hidden">
      {/* Enhanced room lighting */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-40"></div>
      
      {/* Floor with realistic material */}
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
          
          {/* Enhanced status indicator */}
          <div className="mt-2 text-sm">
            {Object.keys(equipmentImages).length > 0 && (
              <span className="text-green-600 mr-4">✓ {Object.keys(equipmentImages).length} Custom Equipment Images</span>
            )}
            {Object.keys(backgroundImages).length > 0 && (
              <span className="text-green-600 mr-4">✓ {Object.keys(backgroundImages).length} Custom Backgrounds</span>
            )}
            {Object.keys(roomElements).length > 0 && (
              <span className="text-blue-600 mr-4">🏗️ {Object.keys(roomElements).length} Room Elements</span>
            )}
            {interactiveElements.length > 0 && (
              <span className="text-purple-600 mr-4">◉ {interactiveElements.length} Interactive Elements</span>
            )}
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-6 bg-white bg-opacity-95 rounded-xl p-4 text-center shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Investigation Progress</h3>
          
          {/* Equipment Progress */}
          <div className="mb-3">
            <div className="flex justify-center gap-2 mb-2">
              {Object.entries(equipmentStates).map(([type, state]) => (
                <div
                  key={type}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    state.solved 
                      ? 'bg-green-500 text-white border-green-600 shadow-lg scale-110' 
                      : state.discovered
                      ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg animate-pulse'
                      : 'bg-gray-300 text-gray-600 border-gray-400'
                  }`}
                >
                  {state.solved ? '✓' : state.discovered ? '?' : '○'}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Equipment: {solvedCount}/{totalEquipment} analyzed
            </p>
          </div>

          {/* Interactive Elements Progress */}
          {interactiveElements.length > 0 && (
            <div className="mb-3">
              <div className="flex justify-center gap-2 mb-2">
                {interactiveElements.map((element, index) => {
                  const elementState = elementStates[element.id] || { solved: false, discovered: false }
                  return (
                    <div
                      key={element.id}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                        elementState.solved 
                          ? 'bg-purple-500 text-white border-purple-600 shadow-lg scale-110' 
                          : elementState.discovered
                          ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg animate-pulse'
                          : 'bg-gray-300 text-gray-600 border-gray-400'
                      }`}
                    >
                      {elementState.solved ? '✓' : elementState.discovered ? '?' : '◉'}
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-gray-600">
                Interactive Elements: {solvedElementsCount}/{interactiveElements.length} examined
              </p>
            </div>
          )}

          {/* Overall Progress */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${((solvedCount + solvedElementsCount) / (totalEquipment + interactiveElements.length)) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            Overall Progress: {solvedCount + solvedElementsCount}/{totalEquipment + interactiveElements.length} - Patient diagnosis: {labLocked ? 'PENDING' : 'READY'}
          </p>
        </div>

        {/* Enhanced First-Person Lab View */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-2xl border-4 border-gray-400">
          
          {/* Current Wall Display */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{wallNames[currentWall]}</h2>
            <p className="text-gray-600">Click on equipment and interactive elements to analyze them</p>
          </div>

          {/* Enhanced Navigation Controls */}
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

          {/* Wall Content */}
          {renderWallContent()}

          {/* Lab Exit */}
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
                '🔒 Complete All Analyses First'
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
              {Object.entries(discoveredClues).map(([item, clue]) => (
                <div key={item} className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 shadow-md">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                    <span className="mr-2">
                      {item === 'microscope' && '🔬'}
                      {item === 'incubator' && '🌡️'}
                      {item === 'petriDish' && '🧫'}
                      {item === 'autoclave' && '♨️'}
                      {item === 'centrifuge' && '🌪️'}
                      {!['microscope', 'incubator', 'petriDish', 'autoclave', 'centrifuge'].includes(item) && '🔍'}
                    </span>
                    {roomElements[item] ? roomElements[item].name : getEquipmentTitle(item).replace(/🔬|🌡️|🧫|♨️|🌪️/, '').trim()}
                  </h4>
                  <p className="text-blue-700 text-sm">{clue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
          <h3 className="text-xl font-bold mb-3">🚨 Emergency Protocol</h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Navigate:</strong> Use the turn buttons to look around the laboratory</li>
            <li>• <strong>Click Equipment:</strong> Click directly on any equipment or interactive element to analyze it</li>
            <li>• <strong>Solve Puzzles:</strong> Answer diagnostic questions to gather evidence</li>
            <li>• <strong>Complete Investigation:</strong> Analyze all equipment and interactive elements</li>
            <li>• <strong>Save Patient:</strong> Submit your diagnosis when all analyses are complete</li>
            <li>• <strong>Time Critical:</strong> The patient's condition is deteriorating - work quickly!</li>
          </ul>
        </div>
      </div>

      {/* Enhanced Modal for both Equipment and Elements */}
      {activeModal && (
        <Modal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          title={modalContent?.title}
          equipmentType={modalContent?.isEquipment ? activeModal : null}
          elementId={modalContent?.isEquipment ? null : activeModal}
          studentGroup={studentInfo?.groupNumber}
          onSolved={modalContent?.isEquipment ? handleEquipmentSolved : handleElementSolved}
        />
      )}
    </div>
  )
}
