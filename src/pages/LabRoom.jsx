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
      <div className="relative w-full h-96 bg-gradient-to-b from-blue-100 to-gray-200 rounded-xl border-4 border-gray-400 overflow-hidden">
        {/* Wall Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-200"></div>
        
        {/* Wall Panels */}
        <div className="absolute inset-4 grid grid-cols-3 gap-2">
          <div className="bg-gray-100 border border-gray-300 rounded"></div>
          <div className="bg-gray-100 border border-gray-300 rounded"></div>
          <div className="bg-gray-100 border border-gray-300 rounded"></div>
        </div>
        
        {/* Equipment on this wall */}
        <div className="relative z-10 h-full flex items-center justify-around px-8">
          {equipment.map((equipmentType, index) => (
            <div key={equipmentType} className="flex flex-col items-center">
              
              {/* Lab Table/Counter for equipment */}
              <div className="relative">
                {/* Table */}
                <div className="w-32 h-16 bg-gradient-to-b from-gray-300 to-gray-500 rounded-lg shadow-lg border-2 border-gray-400 mb-4">
                  <div className="absolute inset-2 bg-gradient-to-b from-gray-200 to-gray-400 rounded"></div>
                  {/* Table legs */}
                  <div className="absolute -bottom-8 left-2 w-2 h-8 bg-gray-500"></div>
                  <div className="absolute -bottom-8 right-2 w-2 h-8 bg-gray-500"></div>
                </div>
                
                {/* Equipment on table */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
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
            </div>
          ))}
        </div>

        {/* Wall-specific features */}
        {currentWall === 0 && ( // North wall - window
          <div className="absolute top-8 right-8 w-24 h-16 bg-blue-200 border-4 border-gray-400 rounded">
            <div className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-300 rounded grid grid-cols-2 gap-1 p-1">
              <div className="bg-blue-50 border border-gray-300"></div>
              <div className="bg-blue-50 border border-gray-300"></div>
              <div className="bg-blue-50 border border-gray-300"></div>
              <div className="bg-blue-50 border border-gray-300"></div>
            </div>
          </div>
        )}

        {currentWall === 2 && ( // South wall - door
          <div className="absolute bottom-4 right-8 w-16 h-32 bg-gradient-to-b from-amber-700 to-amber-900 rounded border-2 border-amber-800">
            <div className="absolute top-16 right-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        )}
      </div>
    )
  }

  const solvedCount = Object.values(solvedEquipment).filter(Boolean).length
  const totalEquipment = Object.keys(equipmentStates).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-100 relative overflow-hidden">
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
        <div className="mb-6 bg-white bg-opacity-90 rounded-xl p-4 text-center shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Patient Sample Analysis Progress</h3>
          <div className="flex justify-center gap-2 mb-2">
            {Object.entries(equipmentStates).map(([type, state]) => (
              <div
                key={type}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  state.solved 
                    ? 'bg-green-500 text-white' 
                    : state.discovered
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-400 text-gray-600'
                }`}
              >
                {state.solved ? '✓' : state.discovered ? '?' : '○'}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {solvedCount}/{totalEquipment} analyses complete - Patient diagnosis: {labLocked ? 'PENDING' : 'READY'}
          </p>
        </div>

        {/* First-Person Lab View */}
        <div className="relative bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl p-6 shadow-2xl border-4 border-gray-300">
          
          {/* Current Wall Display */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{wallNames[currentWall]}</h2>
            <p className="text-gray-600">Look around the laboratory to find and analyze equipment</p>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={rotateLeft}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center"
            >
              ← Turn Left
            </button>
            
            <div className="text-center">
              <div className="text-4xl mb-2">🧭</div>
              <div className="text-sm text-gray-600">Wall {currentWall + 1} of 4</div>
            </div>
            
            <button
              onClick={rotateRight}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center"
            >
              Turn Right →
            </button>
          </div>

          {/* Wall Content */}
          {renderWallContent()}

          {/* Lab Exit */}
          <div className="mt-6 text-center">
            <button
              onClick={handleLabExit}
              disabled={labLocked || isSubmitting}
              className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                labLocked 
                  ? 'bg-red-500 text-white cursor-not-allowed opacity-50'
                  : isSubmitting
                  ? 'bg-yellow-500 text-black'
                  : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
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
          <div className="mt-8 bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Patient Analysis Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(discoveredClues).map(([equipment, clue]) => (
                <div key={equipment} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">
                    {getEquipmentTitle(equipment)}
                  </h4>
                  <p className="text-blue-700 text-sm">{clue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-xl p-6 text-white">
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
