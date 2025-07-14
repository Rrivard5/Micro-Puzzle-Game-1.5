import { Navigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function ProtectedRoute({ children }) {
  const { studentInfo } = useGame()
  
  // Check if student info exists in context or localStorage
  const hasStudentInfo = studentInfo || localStorage.getItem('current-student-info')
  
  // If no student info, redirect to student info page
  if (!hasStudentInfo) {
    return <Navigate to="/student-info" replace />
  }
  
  // If student info exists, render the protected component
  return children
}
