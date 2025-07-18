import { useState, useEffect } from 'react'
import { useGame } from '../context/GameStateContext'

export default function WordScramble() {
  const [completedGroups, setCompletedGroups] = useState([])
  const [targetWord, setTargetWord] = useState('MICROBIOLOGY')
  const [userGuess, setUserGuess] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [availableLetters, setAvailableLetters] = useState('')
  const { studentInfo } = useGame()

  useEffect(() => {
    loadClassProgress()
    loadInstructorSettings()
    
    // Check if word was already solved
    const solved = localStorage.getItem('word-scramble-success')
    if (solved) {
      setIsCorrect(true)
    }
  }, [])

  const loadClassProgress = () => {
    const progress = localStorage.getItem('class-letters-progress')
    if (progress) {
      try {
        const parsed = JSON.parse(progress)
        setCompletedGroups(parsed)
        
        // Set available letters for the scramble
        const letters = parsed.map(group => group.letter).join('')
        setAvailableLetters(letters)
      } catch (error) {
        console.error('Error loading class progress:', error)
      }
    }
  }

  const loadInstructorSettings = () => {
    const settings = localStorage.getItem('instructor-word-settings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        if (parsed.targetWord) {
          setTargetWord(parsed.targetWord.toUpperCase())
        }
      } catch (error) {
        console.error('Error loading instructor settings:', error)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setAttempts(prev => prev + 1)
    
    if (userGuess.toUpperCase() === targetWord) {
      setIsCorrect(true)
      localStorage.setItem('word-scramble-success', 'true')
      
      // Confetti effect
      setTimeout(() => {
        alert('🎉 Congratulations! You solved the word scramble!')
      }, 500)
    } else {
      alert('Not quite right. Keep trying!')
    }
  }

  const getHint = () => {
    const hints = {
      'MICROBIOLOGY': 'The study of microscopic life forms and their effects on humans, animals, and the environment.',
      'BACTERIA': 'Single-celled microorganisms that can be beneficial or harmful.',
      'VIRUS': 'Infectious agents that require a host cell to reproduce.',
      'FUNGI': 'Organisms that include yeasts, molds, and mushrooms.',
      'PATHOGEN': 'A microorganism that causes disease.'
    }
    return hints[targetWord] || 'A term related to microbiology and laboratory science.'
  }

  const scrambleLetters = (letters) => {
    return letters.split('').sort(() => Math.random() - 0.5).join('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🧩 Class Word Scramble Challenge
          </h1>
          <p className="text-lg text-gray-600">
            Use your group's letters to solve the microbiology mystery word!
          </p>
        </div>

        {/* Progress Display */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔬 Laboratory Groups Progress
          </h2>
          
          {completedGroups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-600 text-lg">
                Waiting for groups to complete their laboratory investigations...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Letters will appear here as groups finish analyzing their equipment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4 mb-6">
              {completedGroups.map((group) => (
                <div
                  key={group.group}
                  className="bg-gradient-to-br from-green-100 to-blue-100 p-4 rounded-xl text-center border-2 border-green-200 shadow-lg"
                >
                  <div className="text-sm font-bold text-green-800">Group {group.group}</div>
                  <div className="text-4xl font-bold text-blue-600 my-2">{group.letter}</div>
                  <div className="text-xs text-green-600">✓ Complete</div>
                </div>
              ))}
            </div>
          )}
          
          {completedGroups.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">Available Letters for Scramble:</h3>
              <div className="text-3xl font-mono font-bold text-blue-600 tracking-wider mb-4">
                {scrambleLetters(availableLetters)}
              </div>
              <p className="text-blue-600 text-sm">
                {completedGroups.length} of your class groups have completed their investigations
              </p>
              <p className="text-blue-500 text-xs mt-1">
                Letters are scrambled - rearrange them to form the mystery word!
              </p>
            </div>
          )}
        </div>

        {/* Word Scramble Section */}
        {completedGroups.length > 0 && !isCorrect && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎯 Solve the Mystery Word
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-yellow-800 mb-2">📝 Instructions:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Use the scrambled letters above to form a word</li>
                <li>• The word is related to microbiology and laboratory science</li>
                <li>• You may use each letter as many times as it appears</li>
                <li>• Try different combinations until you find the correct answer</li>
              </ul>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-mono text-center"
                  placeholder="Enter your guess using the available letters..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available letters: {scrambleLetters(availableLetters)}
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!userGuess.trim()}
                  className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                    !userGuess.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                  } text-white`}
                >
                  🔍 Check Answer
                </button>
                
                {attempts > 1 && !showHint && (
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
            
            {showHint && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">💡 Hint:</h4>
                <p className="text-yellow-700">{getHint()}</p>
              </div>
            )}
            
            {attempts > 0 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Attempts: {attempts}
              </div>
            )}
          </div>
        )}

        {/* Success Display */}
        {isCorrect && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8 mb-8 text-center shadow-xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
            <p className="text-xl mb-4">
              Your class successfully solved the word scramble!
            </p>
            <div className="bg-white bg-opacity-20 rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">{targetWord}</div>
              <p className="text-lg">
                The mystery word was "{targetWord}"!
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">🧬 How the Challenge Works</h3>
          <ul className="space-y-2 text-sm">
            <li>• Each group completes their laboratory investigation to earn a letter</li>
            <li>• Letters are revealed here as groups finish their analysis</li>
            <li>• Letters are scrambled - you must unscramble them to find the target word</li>
            <li>• Work together with your classmates to solve the puzzle</li>
            <li>• The word is related to microbiology and laboratory science</li>
            <li>• Use hints if you get stuck after multiple attempts</li>
          </ul>
        </div>

        {/* Current Student Info */}
        {studentInfo && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Playing as: {studentInfo.name} (Group {studentInfo.groupNumber})
          </div>
        )}
      </div>
    </div>
  )
}
