import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Home() {
  const { resetGame } = useGame()
  const navigate = useNavigate()
  
  const handleStartNewGame = () => {
    resetGame()
    navigate('/student-info')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            🧪 Microbiology Research Lab
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mb-6"></div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-6xl mb-4 animate-pulse-soft">🚨</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">URGENT: Patient Sample Analysis Required</h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            A patient has arrived at the hospital with an <span className="font-semibold text-red-600">unknown infection</span> and 
            their condition is rapidly deteriorating. Time is running out!
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            You must analyze the <span className="font-semibold text-blue-600">patient sample</span> using laboratory equipment 
            to identify the pathogen and determine the <span className="font-semibold text-green-600">correct treatment</span> before 
            it's too late. Every minute counts in saving this patient's life!
          </p>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 mt-6">
            <h3 className="text-xl font-bold text-red-800 mb-3">⏰ CRITICAL TIMELINE</h3>
            <p className="text-red-700 text-lg">
              Investigate laboratory equipment, analyze specimens, and solve diagnostic puzzles 
              to identify the pathogen and save the patient!
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={handleStartNewGame}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🚨</span>
            Begin Emergency Analysis
          </button>
          
          <div className="mt-4">
            <Link
              to="/instructor"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Instructor Portal
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">🔬 Emergency Protocol</h2>
          <ul className="text-blue-700 space-y-2 text-left max-w-2xl mx-auto">
            <li>• Enter your student information to access the laboratory</li>
            <li>• Investigate laboratory equipment to analyze the patient sample</li>
            <li>• Solve diagnostic questions to identify the pathogen</li>
            <li>• Gather evidence from all equipment to determine treatment</li>
            <li>• Work with your team to save the patient's life</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
