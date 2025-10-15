import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StudentInfo from './pages/StudentInfo'
import PPERoom from './pages/PPERoom'
import LabRoom from './pages/LabRoom'
import LabNotebook from './pages/LabNotebook'
import Completion from './pages/Completion'
import WordScramble from './pages/WordScramble'
import InstructorInterface from './components/InstructorInterface'
import { GameProvider } from './context/GameStateContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import InstructorDebug from './components/InstructorDebug'
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorRoomEditor from './pages/InstructorRoomEditor'
import InstructorProgress from './pages/InstructorProgress'
import InstructorSettings from './pages/InstructorSettings'

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

              {/* Protected Lab Notebook Route */}
              <Route 
                path="/lab-notebook" 
                element={
                  <ProtectedRoute>
                    <LabNotebook />
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
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/instructor/rooms" element={<InstructorRoomEditor />} />
              <Route path="/instructor/progress" element={<InstructorProgress />} />
              <Route path="/instructor/settings" element={<InstructorSettings />} />
              <Route path="/debug" element={<InstructorDebug />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GameProvider>
  )
}
