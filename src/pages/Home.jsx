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
            🧪 Microbiology Lab Escape Room
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mb-6"></div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-6xl mb-4 animate-pulse-soft">🔬</div>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            Welcome to the <span className="font-semibold text-blue-600">Advanced Microbiology Research Laboratory</span>! 
            A mysterious contamination has occurred and the lab has been sealed. You must investigate the 
            <span className="font-semibold text-green-600"> laboratory equipment</span>, analyze 
            <span className="font-semibold text-purple-600"> microbial specimens</span>, and solve 
            <span className="font-semibold text-red-600"> research puzzles</span> to unlock the lab's security system and escape!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🔬</div>
              <h3 className="font-semibold text-blue-800">Microscope</h3>
              <p className="text-sm text-blue-600">Specimen Analysis</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🌡️</div>
              <h3 className="font-semibold text-green-800">Incubator</h3>
              <p className="text-sm text-green-600">Growth Conditions</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🧫</div>
              <h3 className="font-semibold text-purple-800">Cultures</h3>
              <p className="text-sm text-purple-600">Bacterial Analysis</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">♨️</div>
              <h3 className="font-semibold text-red-800">Autoclave</h3>
              <p className="text-sm text-red-600">Sterilization</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🌪️</div>
              <h3 className="font-semibold text-indigo-800">Centrifuge</h3>
              <p className="text-sm text-indigo-600">Sample Separation</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={handleStartNewGame}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🚀</span>
            Enter Laboratory
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
          <h2 className="text-xl font-semibold text-blue-800 mb-3">🧬 How to Investigate</h2>
          <ul className="text-blue-700 space-y-2 text-left max-w-2xl mx-auto">
            <li>• Enter your student information to access the laboratory</li>
            <li>• Click on laboratory equipment to investigate and gather clues</li>
            <li>• Solve microbiology questions to analyze each piece of equipment</li>
            <li>• Collect research findings from all equipment to unlock the lab exit</li>
            <li>• Contribute your group's letter to the class word scramble challenge</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
