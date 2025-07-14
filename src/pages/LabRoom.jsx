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
  const [backgroundMusic, setBackgroundMusic] = useState(true)
  
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
      microscope: 'A high-powered research microscope with multiple objectives. Something is already mounted on the stage...',
      incubator: 'Temperature-controlled environment for bacterial growth. The digital display is blinking with a message...',
      petriDish: 'Several petri dishes with bacterial cultures. One plate shows unusual growth patterns...',
      autoclave: 'Steam sterilization equipment. A protocol sheet is taped to the front...',
      centrifuge: 'High-speed centrifuge for sample separation. The rotor contains numbered tubes...'
    }
    return descriptions[type] || 'Examine this equipment for clues.'
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
      alert('You must solve all equipment puzzles before exiting the lab!')
      return
    }
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    completeRoom('lab')
    navigate('/complete')
    setIsSubmitting(false)
  }

  const solvedCount = Object.values(solvedEquipment).filter(Boolean).length
  const totalEquipment = Object.keys(equipmentStates).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-100 relative overflow-hidden">
      {/* Lab Background Ambiance */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-16 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-24 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-24 left-40 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Lab Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-600 to-purple-600" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px' }}>
            🧪 MICROBIOLOGY RESEARCH LAB
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-blue-500 to-green-500 mb-4 animate-pulse"></div>
          <p className="text-blue-700 text-lg">Group {studentInfo?.groupNumber} - Advanced Research Division</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 bg-white bg-opacity-80 rounded-xl p-4 text-center shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Equipment Analysis Progress</h3>
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
            {solvedCount}/{totalEquipment} equipment analyzed
          </p>
        </div>

        {/* Interactive Laboratory Layout */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-2xl border-4 border-gray-300 min-h-[600px]">
          
          {/* Lab Bench Background */}
          <div className="absolute inset-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl opacity-30"></div>
          
          {/* Laboratory Equipment Layout */}
          <div className="relative z-10 grid grid-cols-12 grid-rows-8 gap-4 h-full min-h-[500px]">
            
            {/* Microscope - Top Left */}
            <div className="col-span-3 row-span-3 flex items-center justify-center">
              <Microscope
                isDiscovered={equipmentStates.microscope.discovered}
                isActive={equipmentStates.microscope.active}
                isSolved={equipmentStates.microscope.solved}
                onClick={() => handleEquipmentClick('microscope')}
                studentGroup={studentInfo?.groupNumber}
              />
            </div>

            {/* Incubator - Top Center */}
            <div className="col-span-3 row-span-4 flex items-center justify-center">
              <Incubator
                isDiscovered={equipmentStates.incubator.discovered}
                isActive={equipmentStates.incubator.active}
                isSolved={equipmentStates.incubator.solved}
                onClick={() => handleEquipmentClick('incubator')}
                studentGroup={studentInfo?.groupNumber}
              />
            </div>

            {/* Petri Dishes - Top Right */}
            <div className="col-span-3 row-span-2 flex items-center justify-center">
              <PetriDish
                isDiscovered={equipmentStates.petriDish.discovered}
                isActive={equipmentStates.petriDish.active}
                isSolved={equipmentStates.petriDish.solved}
                onClick={() => handleEquipmentClick('petriDish')}
                studentGroup={studentInfo?.groupNumber}
              />
            </div>

            {/* Lab Sink - Top Right Corner */}
            <div className="col-span-3 row-span-2 flex items-center justify-center">
              <div className="w-20 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg shadow-md border-2 border-gray-500 relative">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-500 rounded"></div>
                <div className="text-xs text-center mt-4 text-gray-600">💧 SINK</div>
              </div>
            </div>

            {/* Autoclave - Bottom Left */}
            <div className="col-span-4 row-span-3 flex items-center justify-center">
              <Autoclave
                isDiscovered={equipmentStates.autoclave.discovered}
                isActive={equipmentStates.autoclave.active}
                isSolved={equipmentStates.autoclave.solved}
                onClick={() => handleEquipmentClick('autoclave')}
                studentGroup={studentInfo?.groupNumber}
              />
            </div>

            {/* Centrifuge - Bottom Right */}
            <div className="col-span-4 row-span-3 flex items-center justify-center">
              <Centrifuge
                isDiscovered={equipmentStates.centrifuge.discovered}
                isActive={equipmentStates.centrifuge.active}
                isSolved={equipmentStates.centrifuge.solved}
                onClick={() => handleEquipmentClick('centrifuge')}
                studentGroup={studentInfo?.groupNumber}
              />
            </div>

            {/* Lab Storage Cabinets */}
            <div className="col-span-4 row-span-2 flex items-center justify-center">
              <div className="w-32 h-20 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg shadow-lg border-2 border-gray-600 relative">
                <div className="grid grid-cols-2 gap-1 p-2 h-full">
                  <div className="bg-gray-300 rounded border border-gray-500"></div>
                  <div className="bg-gray-300 rounded border border-gray-500"></div>
                  <div className="bg-gray-300 rounded border border-gray-500"></div>
                  <div className="bg-gray-300 rounded border border-gray-500"></div>
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">🗄️ STORAGE</div>
              </div>
            </div>
          </div>

          {/* Lab Exit Door */}
          <div className="absolute top-8 right-8">
            <button
              onClick={handleLabExit}
              disabled={labLocked || isSubmitting}
              className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
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
                  Exiting Lab...
                </span>
              ) : labLocked ? (
                '🔒 Lab Exit (Locked)'
              ) : (
                '🚪 Exit Laboratory'
              )}
            </button>
          </div>
        </div>

        {/* Discovered Clues Panel */}
        {Object.keys(discoveredClues).length > 0 && (
          <div className="mt-8 bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Research Findings</h3>
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
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">🧬 Laboratory Investigation Protocol</h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Examine Equipment:</strong> Click on laboratory instruments to investigate</li>
            <li>• <strong>Analyze Samples:</strong> Solve microbiology questions to gather clues</li>
            <li>• <strong>Document Findings:</strong> Each solved puzzle provides crucial research data</li>
            <li>• <strong>Complete Investigation:</strong> Analyze all equipment to unlock the lab exit</li>
            <li>• <strong>Lab Safety:</strong> Follow proper protocols throughout your investigation</li>
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
