import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import Modal from '../components/UI/Modal'

export default function LabRoom() {
  const [discoveredClues, setDiscoveredClues] = useState({})
  const [solvedEquipment, setSolvedEquipment] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [modalContent, setModalContent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [labLocked, setLabLocked] = useState(true)
  const [currentWall, setCurrentWall] = useState(0) // 0=North, 1=East, 2=South, 3=West
  const [equipmentImages, setEquipmentImages] = useState({})
  
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

  const getEquipmentImage = (equipmentType, groupNumber) => {
    const imageKey = `${equipmentType}_group${groupNumber}`
    return equipmentImages[imageKey]?.processed || null
  }

  const handleEquipmentClick = (equipmentType, position) => {
    // Mark equipment as discovered
    setEquipmentStates(prev => ({
      ...prev,
      [equipmentType]: { ...prev[equipmentType], discovered: true, active: true }
    }))

    // Load equipment-specific content
    openEquipmentModal(equipmentType)
  }

  const openEquipmentModal = (equipmentType) => {
    setActiveModal(equipmentType)
    setModalContent({
      type: equipmentType,
      title: getEquipmentTitle(equipmentType),
      description: getEquipmentDescription(equipmentType)
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
    
    // Check if all equipment is solved
    const newSolved = { ...solvedEquipment, [equipmentType]: true }
    const totalEquipment = Object.keys(equipmentStates).length
    const solvedCount = Object.values(newSolved).filter(Boolean).length
    
    if (solvedCount >= totalEquipment) {
      setTimeout(() => {
        setLabLocked(false)
      }, 1000)
    }
  }

  const handleLabExit = async () => {
    if (Object.values(solvedEquipment).length < Object.keys(equipmentStates).length) {
      alert('You must analyze all equipment to identify the pathogen before treating the patient!')
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
      // Use uploaded image
      return (
        <div className="relative group cursor-pointer transition-all duration-300 hover:scale-105">
          <img
            src={equipmentImage}
            alt={equipmentType}
            className={`max-w-[120px] max-h-[120px] object-contain transition-all duration-300 ${
              state.solved 
                ? 'filter drop-shadow-lg brightness-110 saturate-110' 
                : state.active 
                ? 'filter drop-shadow-md brightness-105 animate-pulse' 
                : 'filter drop-shadow-sm hover:drop-shadow-lg'
            }`}
            style={{
              filter: `drop-shadow(3px 6px 12px rgba(0,0,0,0.4)) ${
                state.solved ? 'hue-rotate(90deg) saturate(1.3)' : 
                state.active ? 'hue-rotate(45deg) saturate(1.1)' : ''
              }`
            }}
            onClick={() => handleEquipmentClick(equipmentType)}
          />
          
          {/* Status indicator overlay */}
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
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
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded shadow-md text-xs font-bold text-gray-700 border border-gray-200">
              {getEquipmentTitle(equipmentType).replace(/🔬|🌡️|🧫|♨️|🌪️/, '').trim()}
            </div>
            {state.solved && <div className="text-xs text-green-600 mt-1 font-semibold">✓ Analysis Complete</div>}
            {state.active && !state.solved && <div className="text-xs text-yellow-600 mt-1 font-semibold">⚡ Analyzing...</div>}
          </div>
          
          {/* Hover tooltip */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
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
      <div className="relative group cursor-pointer transition-all duration-300 hover:scale-105">
        <div 
          className={`w-20 h-20 rounded-lg flex items-center justify-center text-4xl transition-all duration-300 ${
            state.solved 
              ? 'bg-green-100 border-2 border-green-400 shadow-lg' 
              : state.active 
              ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md animate-pulse' 
              : state.discovered
              ? 'bg-blue-100 border-2 border-blue-400 shadow-sm'
              : 'bg-gray-100 border-2 border-gray-300'
          }`}
          onClick={() => handleEquipmentClick(equipmentType)}
        >
          {equipmentType === 'microscope' && '🔬'}
          {equipmentType === 'incubator' && '🌡️'}
          {equipmentType === 'petriDish' && '🧫'}
          {equipmentType === 'autoclave' && '♨️'}
          {equipmentType === 'centrifuge' && '🌪️'}
        </div>
        
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded shadow-md text-xs font-bold text-gray-700 border border-gray-200">
            {getEquipmentTitle(equipmentType).replace(/🔬|🌡️|🧫|♨️|🌪️/, '').trim()}
          </div>
        </div>
      </div>
    )
  }

  const renderWallContent = () => {
    const equipment = wallEquipment[currentWall] || []
    
    return (
      <div className="relative w-full h-[600px] overflow-hidden rounded-xl border-4 border-gray-600 shadow-2xl">
        {/* Enhanced 3D Perspective Lab Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(248,250,252,0.95), rgba(241,245,249,0.95)), url('data:image/svg+xml,${encodeURIComponent(`
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
                <polygon points="150,240 650,240 680,280 120,280" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
                <polygon points="120,280 680,280 680,300 120,300" fill="#d1d5db"/>
                <polygon points="680,280 720,320 720,340 680,300" fill="#cbd5e0"/>
                
                <!-- Bench details -->
                <rect x="160" y="260" width="15" height="8" fill="#ffffff" stroke="#9ca3af" rx="2"/>
                <rect x="300" y="260" width="15" height="8" fill="#ffffff" stroke="#9ca3af" rx="2"/>
                <rect x="500" y="260" width="15" height="8" fill="#ffffff" stroke="#9ca3af" rx="2"/>
                
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
            `)}')`
          }}
        />

        {/* Equipment Positioning with enhanced 3D perspective */}
        <div className="absolute inset-0 flex items-end justify-around px-12 pb-48">
          {equipment.map((equipmentType, index) => {
            const basePositions = [
              { left: '12%', transform: 'perspective(800px) rotateX(5deg) scale(0.85)', zIndex: 8 },
              { left: '32%', transform: 'perspective(800px) rotateX(3deg) scale(0.95)', zIndex: 10 },
              { left: '52%', transform: 'perspective(800px) rotateX(2deg) scale(1.0)', zIndex: 12 },
              { right: '12%', transform: 'perspective(800px) rotateX(5deg) scale(0.85)', zIndex: 8 }
            ]
            
            const position = basePositions[index] || basePositions[0]
            
            return (
              <div 
                key={equipmentType} 
                className="absolute"
                style={{
                  ...position,
                  bottom: '180px'
                }}
              >
                {/* Enhanced Lab Counter/Table Base with realistic materials */}
                <div className="relative mb-6">
                  <div 
                    className="w-36 h-20 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-500 rounded-lg shadow-2xl border-2 border-slate-600"
                    style={{
                      boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 3px 6px rgba(255,255,255,0.3), 0 0 0 1px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Stainless steel surface */}
                    <div className="absolute inset-2 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-md opacity-90"></div>
                    
                    {/* Surface reflection */}
                    <div className="absolute inset-2 bg-gradient-to-br from-white via-transparent to-transparent rounded-md opacity-30"></div>
                    
                    {/* Table edge detail */}
                    <div className="absolute inset-x-2 bottom-0 h-3 bg-slate-600 rounded-b-md shadow-inner"></div>
                    
                    {/* Power outlets and equipment details */}
                    <div className="absolute top-2 right-2 w-5 h-4 bg-white border border-slate-500 rounded-sm shadow-inner">
                      <div className="flex justify-center items-center h-full">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Equipment power indicator */}
                    <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full shadow-sm opacity-80"></div>
                  </div>
                  
                  {/* Table legs with enhanced perspective and materials */}
                  <div className="absolute -bottom-12 left-4 w-3 h-12 bg-gradient-to-b from-slate-400 to-slate-700 rounded-b-lg shadow-xl transform rotate-1"></div>
                  <div className="absolute -bottom-12 right-4 w-3 h-12 bg-gradient-to-b from-slate-400 to-slate-700 rounded-b-lg shadow-xl transform -rotate-1"></div>
                  
                  {/* Adjustable feet */}
                  <div className="absolute -bottom-14 left-4 w-3 h-2 bg-slate-800 rounded-full"></div>
                  <div className="absolute -bottom-14 right-4 w-3 h-2 bg-slate-800 rounded-full"></div>
                </div>

                {/* Equipment Component - positioned on table */}
                <div className="absolute -top-28 left-1/2 transform -translate-x-1/2" style={{ zIndex: 20 }}>
                  {renderEquipmentComponent(equipmentType, equipmentStates[equipmentType])}
                </div>
              </div>
            )
          })}
        </div>

        {/* Enhanced atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Volumetric lighting */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-25"></div>
          
          {/* Light beams */}
          <div className="absolute top-12 left-1/4 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-8"></div>
          <div className="absolute top-16 right-1/4 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-12"></div>
          <div className="absolute top-10 left-1/2 w-36 h-36 bg-yellow-150 rounded-full blur-3xl opacity-10"></div>
          
          {/* Floor reflection and ambient lighting */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-200 via-transparent to-transparent opacity-25"></div>
          
          {/* Subtle particle effects */}
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    )
  }

  const solvedCount = Object.values(solvedEquipment).filter(Boolean).length
  const totalEquipment = Object.keys(equipmentStates).length

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
          
          {/* Image status indicator */}
          <div className="mt-2 text-sm text-gray-600">
            {Object.keys(equipmentImages).length > 0 ? (
              <span className="text-green-600">✓ Using custom equipment images</span>
            ) : (
              <span className="text-amber-600">⚠ Using default equipment icons - upload images in instructor portal for realistic view</span>
            )}
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-6 bg-white bg-opacity-95 rounded-xl p-4 text-center shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Patient Sample Analysis Progress</h3>
          <div className="flex justify-center gap-2 mb-2">
            {Object.entries(equipmentStates).map(([type, state]) => (
              <div
                key={type}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
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
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(solvedCount / totalEquipment) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {solvedCount}/{totalEquipment} analyses complete - Patient diagnosis: {labLocked ? 'PENDING' : 'READY'}
          </p>
        </div>

        {/* Enhanced First-Person Lab View */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-2xl border-4 border-gray-400">
          
          {/* Current Wall Display */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{wallNames[currentWall]}</h2>
            <p className="text-gray-600">Look around the laboratory to find and analyze equipment</p>
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

        {/* Rest of the component remains the same... */}
        {/* Discovered Clues Panel, Instructions, etc. */}
        
      </div>

      {/* Equipment Modal */}
      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={modalContent?.title}
        equipmentType={activeModal}
        studentGroup={studentInfo?.groupNumber}
        onSolved={handleEquipmentSolved}
      />
    </div>
  )
}
