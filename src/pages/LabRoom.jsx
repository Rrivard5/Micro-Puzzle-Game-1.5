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
      <div className="relative w-full h-96 bg-gradient-to-b from-slate-100 to-gray-300 rounded-xl border-4 border-gray-500 overflow-hidden shadow-2xl">
        {/* Realistic Wall Background */}
        <div className="absolute inset-0">
          {/* Base wall color */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-gray-200"></div>
          
          {/* Wall texture */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          {/* Wall panels/tiles */}
          <div className="absolute inset-4 grid grid-cols-6 grid-rows-4 gap-1">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="bg-slate-100 border border-gray-200 rounded-sm shadow-sm"></div>
            ))}
          </div>
        </div>
        
        {/* Ceiling fixtures */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-16 h-3 bg-gradient-to-b from-yellow-200 to-yellow-100 rounded-lg shadow-md opacity-90"></div>
          ))}
        </div>
        
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-400 via-gray-300 to-transparent"></div>
        
        {/* Equipment on this wall */}
        <div className="relative z-10 h-full flex items-center justify-around px-8">
          {equipment.map((equipmentType, index) => (
            <div key={equipmentType} className="flex flex-col items-center">
              
              {/* Realistic Lab Table/Counter for equipment */}
              <div className="relative">
                {/* Table Surface */}
                <div className="w-40 h-20 bg-gradient-to-b from-gray-200 to-gray-400 rounded-lg shadow-2xl border-2 border-gray-500 mb-4">
                  {/* Table surface detail */}
                  <div className="absolute inset-2 bg-gradient-to-b from-gray-100 to-gray-300 rounded-md"></div>
                  {/* Table edge */}
                  <div className="absolute inset-x-2 bottom-0 h-2 bg-gray-500 rounded-b-md"></div>
                  
                  {/* Electrical outlet */}
                  <div className="absolute top-2 right-2 w-4 h-3 bg-white border border-gray-400 rounded-sm">
                    <div className="flex justify-center items-center h-full">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Table legs */}
                <div className="absolute -bottom-12 left-4 w-3 h-12 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-lg shadow-lg"></div>
                <div className="absolute -bottom-12 right-4 w-3 h-12 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-lg shadow-lg"></div>
                
                {/* Equipment on table */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
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

        {/* Wall-specific realistic features */}
        {currentWall === 0 && ( // North wall - window with blinds
          <div className="absolute top-8 right-8 w-32 h-20 bg-blue-100 border-4 border-gray-500 rounded shadow-2xl">
            {/* Window frame */}
            <div className="absolute inset-1 bg-gradient-to-b from-blue-50 to-blue-200 rounded">
              {/* Window panes */}
              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-1">
                <div className="bg-blue-50 border border-gray-300 rounded-sm"></div>
                <div className="bg-blue-50 border border-gray-300 rounded-sm"></div>
                <div className="bg-blue-50 border border-gray-300 rounded-sm"></div>
                <div className="bg-blue-50 border border-gray-300 rounded-sm"></div>
              </div>
              {/* Window frame cross */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 transform -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400 transform -translate-x-1/2"></div>
            </div>
            {/* Window sill */}
            <div className="absolute -bottom-2 -left-1 -right-1 h-2 bg-gray-400 rounded-b-lg shadow-lg"></div>
          </div>
        )}

        {currentWall === 1 && ( // East wall - emergency shower
          <div className="absolute top-4 left-8 w-12 h-24 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded border-2 border-yellow-700 shadow-lg">
            {/* Shower head */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-400 rounded-full border border-gray-600"></div>
            {/* Pull chain */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-600 rounded"></div>
            <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-red-500 rounded"></div>
            {/* Emergency sign */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-700">EMERGENCY</div>
          </div>
        )}

        {currentWall === 2 && ( // South wall - exit door
          <div className="absolute bottom-4 right-12 w-20 h-40 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t border-4 border-amber-900 shadow-2xl">
            {/* Door panels */}
            <div className="absolute inset-2 bg-gradient-to-b from-amber-500 to-amber-700 rounded-t">
              <div className="absolute top-4 left-2 right-2 h-12 border-2 border-amber-800 rounded"></div>
              <div className="absolute bottom-16 left-2 right-2 h-12 border-2 border-amber-800 rounded"></div>
            </div>
            {/* Door handle */}
            <div className="absolute top-20 right-1 w-3 h-4 bg-yellow-400 rounded border border-yellow-600 shadow-lg"></div>
            {/* Exit sign */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">
              EXIT
            </div>
          </div>
        )}

        {currentWall === 3 && ( // West wall - lab sink
          <div className="absolute bottom-8 left-8 w-24 h-16 bg-gradient-to-b from-gray-100 to-gray-300 rounded border-2 border-gray-400 shadow-lg">
            {/* Sink basin */}
            <div className="absolute inset-2 bg-gradient-to-b from-gray-200 to-gray-400 rounded"></div>
            {/* Faucet */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-gray-500 rounded-b-lg border border-gray-600"></div>
            {/* Handles */}
            <div className="absolute -top-2 left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
            {/* Drain */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-700 rounded-full"></div>
          </div>
        )}
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
