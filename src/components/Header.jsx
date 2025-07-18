import { Link, useLocation } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Header() {
  const location = useLocation()
  const { studentInfo, labCompleted } = useGame()
  
  const isHome = location.pathname === '/'
  const isComplete = location.pathname === '/complete'
  const isStudentInfo = location.pathname === '/student-info'
  const isInstructor = location.pathname === '/instructor'

  // Don't show header on these pages
  if (isHome || isComplete || isStudentInfo || isInstructor) return null

  // Check if student info exists
  const hasStudentInfo = studentInfo || localStorage.getItem('current-student-info')

  return (
    <header className="bg-white shadow-sm border-b-2 border-blue-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link 
            to="/" 
            className="text-xl font-bold text-blue-700 hover:text-blue-800 transition-colors"
          >
            🧪 Microbiology Lab Escape Room
          </Link>
          
          {/* Show navigation if student info exists */}
          {hasStudentInfo && (
            <div className="flex items-center gap-4">
              <Link
                to="/lab"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/lab'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {labCompleted ? '✅ Laboratory' : '🔬 Laboratory'}
              </Link>
            </div>
          )}
          
          {/* Show message if no student info */}
          {!hasStudentInfo && (
            <div className="text-amber-600 font-medium">
              Please complete student information to access the laboratory
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
