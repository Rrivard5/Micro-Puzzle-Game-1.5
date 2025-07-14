import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StudentInfo from './pages/StudentInfo'
import PPERoom from './pages/PPERoom'
import LabRoom from './pages/LabRoom'
import Completion from './pages/Completion'
import WordScramble from './pages/WordScramble'
import InstructorInterface from './components/InstructorInterface'
import { GameProvider } from './context/GameStateContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/student-info" element={<StudentInfo />} />
              
              {/* Protected PPE Room Route */}
              <Route 
                path="/ppe-room" 
                element={
                  <ProtectedRoute>
                    <PPERoom />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Lab Route */}
              <Route 
                path="/lab" 
                element={
                  <ProtectedRoute>
                    <LabRoom />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/complete" 
                element={
                  <ProtectedRoute>
                    <Completion />
                  </ProtectedRoute>
                } 
              />
              
              {/* Word Scramble can be accessed without student info */}
              <Route path="/word-scramble" element={<WordScramble />} />
              
              {/* Instructor Interface */}
              <Route path="/instructor" element={<InstructorInterface />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GameProvider>
  )
}
