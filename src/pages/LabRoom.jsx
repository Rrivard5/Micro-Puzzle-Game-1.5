import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import Microscope from '../components/LabEquipment/Microscope'
import Incubator from '../components/LabEquipment/Incubator'
import PetriDish from '../components/LabEquipment/PetriDish'
import Autoclave from '../components/LabEquipment/Autoclave'
import Centrifuge from '../components/LabEquipment/Centrifuge'
import Modal from '../components/UI/Modal'

export default function LabRoom() {
  const [discoveredClues, setDiscoveredClues] = useState({})
  const [solvedEquipment, setSolvedEquipment] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [modalContent, setModalContent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [labLocked, setLabLocked] = useState(true)
  const [currentWall, setCurrentWall] = useState(0) // 0=North, 1=East, 2=South, 3=West
  
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

  const renderWallContent = () => {
    const equipment = wallEquipment[currentWall] || []
    
    return (
      <div className="relative w-full h-[500px] overflow-hidden rounded-xl border-4 border-gray-600 shadow-2xl">
        {/* 3D Perspective Lab Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(240,242,247,0.85), rgba(240,242,247,0.85)), url('data:image/svg+xml,${encodeURIComponent(`
              <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                <!-- Floor with perspective -->
                <defs>
                  <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#e8eaed"/>
                    <stop offset="100%" stop-color="#d1d5db"/>
                  </linearGradient>
                  <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f8fafc"/>
                    <stop offset="100%" stop-color="#e2e8f0"/>
                  </linearGradient>
                  <pattern id="floorTiles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect width="40" height="40" fill="#f1f5f9"/>
                    <rect width="38" height="38" x="1" y="1" fill="#e2e8f0" stroke="#cbd5e0" stroke-width="0.5"/>
                  </pattern>
                  <pattern id="wallTiles" x="0" y="0" width="50" height="30" patternUnits="userSpaceOnUse">
                    <rect width="50" height="30" fill="#f8fafc"/>
                    <rect width="48" height="28" x="1" y="1" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="0.5"/>
                  </pattern>
                </defs>
                
                <!-- Back wall -->
                <polygon points="100,50 700,50 750,150 50,150" fill="url(#wallTiles)" stroke="#cbd5e0"/>
                
                <!-- Left wall -->
                <polygon points="50,150 100,50 100,350 50,450" fill="url(#wallGrad)" stroke="#cbd5e0"/>
                
                <!-- Right wall -->
                <polygon points="700,50 750,150 750,450 700,350" fill="url(#wallGrad)" stroke="#cbd5e0"/>
                
                <!-- Floor -->
                <polygon points="50,150 750,150 750,450 50,450" fill="url(#floorTiles)" stroke="#9ca3af"/>
                
                <!-- Ceiling -->
                <polygon points="50,150 100,50 700,50 750,150" fill="#f1f5f9" stroke="#d1d5db"/>
                
                <!-- Ceiling lights -->
                <rect x="200" y="60" width="80" height="15" fill="#fbbf24" opacity="0.8" rx="7"/>
                <rect x="350" y="70" width="80" height="15" fill="#fbbf24" opacity="0.8" rx="7"/>
                <rect x="500" y="65" width="80" height="15" fill="#fbbf24" opacity="0.8" rx="7"/>
                
                <!-- Wall features based on current wall -->
                ${currentWall === 0 ? `
                  <!-- Window on north wall -->
                  <rect x="300" y="80" width="120" height="80" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2" rx="5"/>
                  <line x1="360" y1="80" x2="360" y2="160" stroke="#3b82f6" stroke-width="2"/>
                  <line x1="300" y1="120" x2="420" y2="120" stroke="#3b82f6" stroke-width="2"/>
                ` : ''}
                
                ${currentWall === 1 ? `
                  <!-- Emergency shower on east wall -->
                  <rect x="650" y="90" width="40" height="80" fill="#fbbf24" stroke="#d97706" stroke-width="2" rx="3"/>
                  <circle cx="670" cy="95" r="8" fill="#9ca3af"/>
                  <rect x="665" y="105" width="10" height="30" fill="#dc2626"/>
                  <text x="670" y="175" text-anchor="middle" font-size="8" fill="#dc2626">EMERGENCY</text>
                ` : ''}
                
                ${currentWall === 2 ? `
                  <!-- Exit door on south wall -->
                  <rect x="350" y="400" width="80" height="50" fill="#92400e" stroke="#451a03" stroke-width="2" rx="3"/>
                  <circle cx="415" cy="425" r="3" fill="#fbbf24"/>
                  <rect x="370" y="320" width="40" height="15" fill="#22c55e" rx="3"/>
                  <text x="390" y="332" text-anchor="middle" font-size="8" fill="white">EXIT</text>
                ` : ''}
                
                ${currentWall === 3 ? `
                  <!-- Lab sink on west wall -->
                  <rect x="80" y="300" width="60" height="40" fill="#9ca3af" stroke="#6b7280" stroke-width="2" rx="5"/>
                  <circle cx="110" cy="290" r="8" fill="#6b7280"/>
                  <circle cx="100" cy="285" r="3" fill="#3b82f6"/>
                  <circle cx="120" cy="285" r="3" fill="#ef4444"/>
                ` : ''}
                
                <!-- Lab benches/counters perspective -->
                <polygon points="150,200 650,200 680,240 120,240" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
                <polygon points="120,240 680,240 680,260 120,260" fill="#d1d5db" stroke="#9ca3af"/>
                
                <!-- Electrical outlets -->
                <rect x="200" y="220" width="12" height="8" fill="white" stroke="#6b7280" rx="1"/>
                <rect x="400" y="220" width="12" height="8" fill="white" stroke="#6b7280" rx="1"/>
                <rect x="600" y="220" width="12" height="8" fill="white" stroke="#6b7280" rx="1"/>
              </svg>
            `)}')`
          }}
        />

        {/* Equipment Positioning with 3D perspective */}
        <div className="absolute inset-0 flex items-end justify-around px-16 pb-32">
          {equipment.map((equipmentType, index) => {
            const basePositions = [
              { left: '15%', transform: 'scale(0.8)' },
              { left: '35%', transform: 'scale(0.9)' },
              { left: '55%', transform: 'scale(1.0)' },
              { right: '15%', transform: 'scale(0.8)' }
            ]
            
            const position = basePositions[index] || basePositions[0]
            
            return (
              <div 
                key={equipmentType} 
                className="absolute"
                style={{
                  ...position,
                  bottom: '120px',
                  zIndex: 10 + index
                }}
              >
                {/* Lab Counter/Table Base with 3D effect */}
                <div className="relative mb-4">
                  <div 
                    className="w-32 h-16 bg-gradient-to-b from-gray-300 to-gray-500 rounded-lg shadow-xl border-2 border-gray-600"
                    style={{
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                  >
                    {/* Table surface detail */}
                    <div className="absolute inset-2 bg-gradient-to-b from-gray-200 to-gray-400 rounded-md"></div>
                    {/* Table edge highlight */}
                    <div className="absolute inset-x-2 bottom-0 h-2 bg-gray-600 rounded-b-md"></div>
                    
                    {/* Power outlet */}
                    <div className="absolute top-2 right-2 w-4 h-3 bg-white border border-gray-500 rounded-sm">
                      <div className="flex justify-center items-center h-full">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Table legs with perspective */}
                  <div className="absolute -bottom-8 left-3 w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-700 rounded-b-lg shadow-lg transform rotate-1"></div>
                  <div className="absolute -bottom-8 right-3 w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-700 rounded-b-lg shadow-lg transform -rotate-1"></div>
                </div>

                {/* Equipment Component on table */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                  {equipmentType === 'microscope' && (
                    <Microscope
                      isDiscovered={equipmentStates.microscope.discovered}
                      isActive={equipmentStates.microscope.active}
                      isSolved={equipmentStates.microscope.solved}
                      onClick={() => handleEquipmentClick('microscope')}
                      studentGroup={studentInfo?.groupNumber}
                    />
                  )}
                  {equipmentType === 'incubator' && (
                    <Incubator
                      isDiscovered={equipmentStates.incubator.discovered}
                      isActive={equipmentStates.incubator.active}
                      isSolved={equipmentStates.incubator.solved}
                      onClick={() => handleEquipmentClick('incubator')}
                      studentGroup={studentInfo?.groupNumber}
                    />
                  )}
                  {equipmentType === 'petriDish' && (
                    <PetriDish
                      isDiscovered={equipmentStates.petriDish.discovered}
                      isActive={equipmentStates.petriDish.active}
                      isSolved={equipmentStates.petriDish.solved}
                      onClick={() => handleEquipmentClick('petriDish')}
                      studentGroup={studentInfo?.groupNumber}
                    />
                  )}
                  {equipmentType === 'autoclave' && (
                    <Autoclave
                      isDiscovered={equipmentStates.autoclave.discovered}
                      isActive={equipmentStates.autoclave.active}
                      isSolved={equipmentStates.autoclave.solved}
                      onClick={() => handleEquipmentClick('autoclave')}
                      studentGroup={studentInfo?.groupNumber}
                    />
                  )}
                  {equipmentType === 'centrifuge' && (
                    <Centrifuge
                      isDiscovered={equipmentStates.centrifuge.discovered}
                      isActive={equipmentStates.centrifuge.active}
                      isSolved={equipmentStates.centrifuge.solved}
                      onClick={() => handleEquipmentClick('centrifuge')}
                      studentGroup={studentInfo?.groupNumber}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Lab atmosphere effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Soft lighting gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-20"></div>
          
          {/* Ambient lighting spots */}
          <div className="absolute top-8 left-1/4 w-24 h-24 bg-yellow-200 rounded-full blur-xl opacity-10"></div>
          <div className="absolute top-12 right-1/4 w-32 h-32 bg-yellow-100 rounded-full blur-xl opacity-15"></div>
          
          {/* Floor reflection effect */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-300 via-transparent to-transparent opacity-20"></div>
        </div>
      </div>
    )
  }

  const solvedCount = Object.values(solvedEquipment).filter(Boolean).length
  const totalEquipment = Object.keys(equipmentStates).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-100 relative overflow-hidden">
      {/* Realistic Room Lighting */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-100 via-transparent to-transparent opacity-30"></div>
      
      {/* Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-300 via-gray-200 to-transparent"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        
        {/* Lab Title */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-blue-600 to-green-600" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px' }}>
            🚨 EMERGENCY PATHOGEN ANALYSIS
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-red-500 to-blue-500 mb-4 animate-pulse"></div>
          <p className="text-red-700 text-lg font-semibold">Group {studentInfo?.groupNumber} - Patient Sample Investigation</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 bg-white bg-opacity-95 rounded-xl p-4 text-center shadow-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Patient Sample Analysis Progress</h3>
          <div className="flex justify-center gap-2 mb-2">
            {Object.entries(equipmentStates).map(([type, state]) => (
              <div
                key={type}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  state.solved 
                    ? 'bg-green-500 text-white border-green-600 shadow-lg' 
                    : state.discovered
                    ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg'
                    : 'bg-gray-300 text-gray-600 border-gray-400'
                }`}
              >
                {state.solved ? '✓' : state.discovered ? '?' : '○'}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(solvedCount / totalEquipment) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {solvedCount}/{totalEquipment} analyses complete - Patient diagnosis: {labLocked ? 'PENDING' : 'READY'}
          </p>
        </div>

        {/* First-Person Lab View */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-2xl border-4 border-gray-400">
          
          {/* Current Wall Display */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{wallNames[currentWall]}</h2>
            <p className="text-gray-600">Look around the laboratory to find and analyze equipment</p>
          </div>

          {/* Navigation Controls */}
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Patient Analysis Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(discoveredClues).map(([equipment, clue]) => (
                <div key={equipment} className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 shadow-md">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                    <span className="mr-2">
                      {equipment === 'microscope' && '🔬'}
                      {equipment === 'incubator' && '🌡️'}
                      {equipment === 'petriDish' && '🧫'}
                      {equipment === 'autoclave' && '♨️'}
                      {equipment === 'centrifuge' && '🌪️'}
                    </span>
                    {getEquipmentTitle(equipment).replace(/🔬|🌡️|🧫|♨️|🌪️/, '').trim()}
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
            <li>• <strong>Investigate:</strong> Click on equipment to analyze the patient sample</li>
            <li>• <strong>Solve Puzzles:</strong> Answer diagnostic questions to gather evidence</li>
            <li>• <strong>Save Patient:</strong> Complete all analyses to determine treatment</li>
            <li>• <strong>Time Critical:</strong> The patient's condition is deteriorating - work quickly!</li>
          </ul>
        </div>
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
