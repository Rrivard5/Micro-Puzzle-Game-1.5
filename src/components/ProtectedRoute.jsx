import { Navigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { studentInfo, setStudentInfo } = useGame()
  
  // Check localStorage for student info
  const storedInfo = localStorage.getItem('current-student-info')
  
  // If we have stored info but not in context, load it
  useEffect(() => {
    if (storedInfo && !studentInfo) {
      try {
        setStudentInfo(JSON.parse(storedInfo))
      } catch (error) {
        console.error('Error loading student info:', error)
      }
    }
  }, [storedInfo, studentInfo, setStudentInfo])
  
  // Check if student info exists in either location
  const hasStudentInfo = studentInfo || storedInfo
  
  // If no student info, redirect to student info page
  if (!hasStudentInfo) {
    return <Navigate to="/student-info" replace />
  }
  
  // If student info exists, render the protected component
  return children
}
