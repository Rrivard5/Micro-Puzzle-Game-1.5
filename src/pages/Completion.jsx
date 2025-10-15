import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Completion() {
  const { finalLetter, resetGame, attemptTracking, studentInfo, discoveredClues } = useGame()
  const [showConfetti, setShowConfetti] = useState(false)
  const [groupLetter, setGroupLetter] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    
    // Record completion for class tracking
    if (studentInfo?.playingContext === 'class' && studentInfo?.groupNumber) {
      recordClassCompletion()
    }
    
    return () => clearTimeout(timer)
  }, [studentInfo])

  const recordClassCompletion = () => {
    if (!studentInfo?.groupNumber || !studentInfo?.name) {
      console.warn('Missing student info for completion recording')
      return
    }
    
    // Get the group's assigned letter from instructor settings
    const instructorSettings = localStorage.getItem('instructor-word-settings')
    let assignedLetter = null
    
    if (instructorSettings) {
      try {
        const settings = JSON.parse(instructorSettings)
        const groupLetters = settings.groupLetters || {}
        assignedLetter = groupLetters[studentInfo.groupNumber]
        
        console.log('Word Settings:', settings)
        console.log('Group Letters:', groupLetters)
        console.log('Assigned letter for group', studentInfo.groupNumber, ':', assignedLetter)
      } catch (error) {
        console.error('Error parsing instructor settings:', error)
      }
    }
    
    if (!assignedLetter) {
      console.error(`No letter assigned for group ${studentInfo.groupNumber}. Instructor must configure word settings.`)
      assignedLetter = '?' 
    }
    
    setGroupLetter(assignedLetter)
    
    // Only save if we have a valid letter (not ?)
    if (assignedLetter && assignedLetter !== '?') {
      // Load existing class progress
      let classProgress = []
      const existingProgress = localStorage.getItem('class-letters-progress')
      
      if (existingProgress) {
        try {
          classProgress = JSON.parse(existingProgress)
        } catch (error) {
          console.error('Error parsing existing class progress:', error)
          classProgress = []
        }
      }
      
      // Check if this group has already been recorded
      const existingGroupIndex = classProgress.findIndex(
        item => item.group === studentInfo.groupNumber
      )
      
      if (existingGroupIndex === -1) {
        // Add this group's completion
        const completionRecord = {
          group: studentInfo.groupNumber,
          letter: assignedLetter,
          completedAt: new Date().toISOString(),
          studentName: studentInfo.name,
          sessionId: studentInfo.sessionId
        }
        
        classProgress.push(completionRecord)
        classProgress.sort((a, b) => a.group - b.group)
        
        localStorage.setItem('class-letters-progress', JSON.stringify(classProgress))
        console.log(`✅ Group ${studentInfo.groupNumber} completion recorded with letter "${assignedLetter}"`)
        console.log('Updated class progress:', classProgress)
      } else {
        console.log(`Group ${studentInfo.groupNumber} already recorded`)
        setGroupLetter(classProgress[existingGroupIndex].letter)
      }
    } else {
      console.error(`❌ Cannot record completion for group ${studentInfo.groupNumber} - no letter assigned by instructor`)
    }
  }

  const getDisplayLetter = () => {
    return groupLetter || finalLetter || 'M'
  }

  const isPlayingInClass = studentInfo?.playingContext === 'class'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '⭐', '🌟', '✨', '🧪', '🔬', '🧫'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="text-6xl mb-4 animate-bounce-soft">🧪</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Laboratory Investigation Complete!
          </h1>
          <p className="text-xl md:text-2xl text-green-100">
            You've successfully analyzed all laboratory equipment and solved the contamination mystery!
          </p>
        </div>

        {/* Final Letter Reveal */}
        {isPlayingInClass ? (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <h2 className="text-4xl font-bold mb-4">🔓 RESEARCH DATA UNLOCKED!</h2>
            <p className="text-xl mb-6">
              🏆 Congratulations! You've unlocked your group's genetic code letter:
            </p>
            <div className="bg-white bg-opacity-20 rounded-xl p-8 mb-6">
              <div className="text-9xl font-bold text-white mb-4 animate-pulse-soft drop-shadow-2xl">
                {getDisplayLetter()}
              </div>
              <p className="text-2xl font-bold text-yellow-100 mb-2">
                🎯 GROUP {studentInfo?.groupNumber}'S CONTRIBUTION!
              </p>
              <p className="text-lg text-yellow-100">
                This letter is your team's piece of the final research puzzle!
              </p>
            </div>
            <div className="bg-yellow-600 bg-opacity-50 rounded-lg p-4 mb-4">
              <p className="text-yellow-100 font-semibold">
                🎓 Work with your class to solve the word scramble using all groups' letters!
              </p>
            </div>
            
            {/* Word Scramble Button */}
            <div className="mt-4">
              <Link
                to="/word-scramble"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="mr-2">🧩</span>
                Join Word Scramble Challenge
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <h2 className="text-4xl font-bold mb-4">🎯 Individual Investigation Complete!</h2>
            <p className="text-xl mb-6">
              🏆 Congratulations! You've completed the microbiology lab investigation on your own!
            </p>
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-4">
              <div className="text-6xl mb-4">🔬</div>
              <p className="text-2xl font-bold text-blue-100 mb-2">
                Practice Session Complete!
              </p>
              <p className="text-lg text-blue-100">
                You've mastered all laboratory equipment analyses!
              </p>
            </div>
          </div>
        )}

        {/* Research Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🔬 Your Laboratory Investigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {['Microscope', 'Incubator', 'Petri Dishes', 'Autoclave', 'Centrifuge'].map((equipment, index) => (
              <div key={equipment} className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="text-3xl mb-2">
                  {['🔬', '🌡️', '🧫', '♨️', '🌪️'][index]}
                </div>
                <div className="font-semibold text-blue-800">{equipment}</div>
                <div className="text-sm text-blue-600">✅ Analyzed</div>
              </div>
            ))}
          </div>
          
          {/* Research Findings */}
          {Object.keys(discoveredClues).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-800 mb-4">🔍 Research Findings Summary</h3>
              <div className="space-y-2 text-left">
                {Object.entries(discoveredClues).map(([equipment, clue]) => (
                  <div key={equipment} className="text-blue-700">
                    <span className="font-semibold">{equipment.charAt(0).toUpperCase() + equipment.slice(1)}:</span> {clue}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Story Conclusion */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="text-4xl mb-4">🧬</div>
          <h2 className="text-2xl font-bold mb-4">Investigation Concluded</h2>
          <p className="text-lg leading-relaxed">
            Through your systematic analysis of laboratory equipment and microbial specimens, you've 
            successfully identified the source of contamination and implemented proper protocols. 
            Your understanding of microbiology principles, laboratory techniques, and safety procedures 
            has proven essential in solving this research challenge!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🏠</span>
            Return Home
          </Link>
          
          <button
            onClick={resetGame}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🔄</span>
            New Investigation
          </button>
        </div>

        {/* Educational Note */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">👩‍🏫</span>
            <h3 className="text-xl font-bold text-amber-800">For Educators</h3>
          </div>
          <p className="text-amber-700 text-left">
            This laboratory escape room reinforces key microbiology concepts including bacterial morphology, 
            growth conditions, hemolysis patterns, sterilization protocols, and laboratory safety procedures. 
            Students demonstrate understanding of microscopy, culture techniques, and analytical methods 
            through interactive problem-solving.
            {isPlayingInClass && (
              <span className="block mt-2">
                <strong>Class Progress:</strong> Group {studentInfo?.groupNumber} has contributed letter "{getDisplayLetter()}" to the collaborative challenge.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
