import { createContext, useContext, useState, useEffect } from 'react'

const GameContext = createContext()

export const GameProvider = ({ children }) => {
  const [labCompleted, setLabCompleted] = useState(false)
  const [discoveredClues, setDiscoveredClues] = useState({})
  const [finalLetter, setFinalLetter] = useState(null)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [studentInfo, setStudentInfo] = useState(null)
  const [attemptTracking, setAttemptTracking] = useState({})
  const [roomTimers, setRoomTimers] = useState({})

  // Load saved progress from localStorage on mount
  useEffect(() => {
  const savedProgress = localStorage.getItem('microbiology-lab-progress')
  if (savedProgress) {
    try {
      const parsed = JSON.parse(savedProgress)
      setLabCompleted(parsed.labCompleted || false)
      setDiscoveredClues(parsed.discoveredClues || {})
      setFinalLetter(parsed.finalLetter || null)
      setCurrentProgress(parsed.currentProgress || 0)
      setAttemptTracking(parsed.attemptTracking || {})
      setRoomTimers(parsed.roomTimers || {})
    } catch (e) {
      console.error('Could not load saved progress:', e)
    }
  }

  // Load student info if not already set
  const savedStudentInfo = localStorage.getItem('current-student-info')
  if (savedStudentInfo && !studentInfo) {
    try {
      setStudentInfo(JSON.parse(savedStudentInfo))
    } catch (e) {
      console.error('Could not load student info:', e)
    }
  }
}, []) // Only run once on mount

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (studentInfo) {
      const progressData = {
        labCompleted,
        discoveredClues,
        finalLetter,
        currentProgress,
        attemptTracking,
        roomTimers
      }
      localStorage.setItem('microbiology-lab-progress', JSON.stringify(progressData))
    }
  }, [labCompleted, discoveredClues, finalLetter, currentProgress, attemptTracking, roomTimers, studentInfo])

  // Track question attempts
  const trackAttempt = (roomId, questionId, answer, isCorrect) => {
    if (!studentInfo) return

    const timestamp = new Date().toISOString()
    const attemptKey = `${roomId}-${questionId}`
    
    setAttemptTracking(prev => ({
      ...prev,
      [attemptKey]: [
        ...(prev[attemptKey] || []),
        {
          answer,
          isCorrect,
          timestamp,
          attemptNumber: (prev[attemptKey] || []).length + 1
        }
      ]
    }))

    // Save to instructor data
    saveStudentDataToInstructor(roomId, questionId, answer, isCorrect, timestamp)
  }

  // Track room completion times
  const startRoomTimer = (roomId) => {
    setRoomTimers(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        startTime: new Date().toISOString()
      }
    }))
  }

  const completeRoom = (roomId) => {
    const completionTime = new Date().toISOString()
    setRoomTimers(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        endTime: completionTime,
        duration: prev[roomId]?.startTime ? 
          new Date(completionTime) - new Date(prev[roomId].startTime) : 0
      }
    }))

    if (roomId === 'lab') {
      setLabCompleted(true)
      setCurrentProgress(100)
    }
  }

  // Save student data to instructor storage
  const saveStudentDataToInstructor = (roomId, questionId, answer, isCorrect, timestamp) => {
    if (!studentInfo) return

    const instructorData = JSON.parse(localStorage.getItem('instructor-student-data') || '[]')
    
    const studentRecord = {
      sessionId: studentInfo.sessionId,
      name: studentInfo.name,
      semester: studentInfo.semester,
      year: studentInfo.year,
      groupNumber: studentInfo.groupNumber,
      roomId,
      questionId,
      answer,
      isCorrect,
      timestamp,
      attemptNumber: (attemptTracking[`${roomId}-${questionId}`] || []).length + 1
    }

    instructorData.push(studentRecord)
    localStorage.setItem('instructor-student-data', JSON.stringify(instructorData))
  }

  const resetGame = () => {
    setLabCompleted(false)
    setDiscoveredClues({})
    setFinalLetter(null)
    setCurrentProgress(0)
    setAttemptTracking({})
    setRoomTimers({})
    setStudentInfo(null)
    localStorage.removeItem('microbiology-lab-progress')
    localStorage.removeItem('current-student-info')
  }

  return (
    <GameContext.Provider
      value={{
        labCompleted,
        setLabCompleted,
        discoveredClues,
        setDiscoveredClues,
        finalLetter,
        setFinalLetter,
        currentProgress,
        setCurrentProgress,
        studentInfo,
        setStudentInfo,
        attemptTracking,
        roomTimers,
        trackAttempt,
        startRoomTimer,
        completeRoom,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
