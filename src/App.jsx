import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StudentInfo from './pages/StudentInfo'
import PPERoom from './pages/PPERoom'
import LabRoom from './pages/LabRoom'
import LabNotebook from './pages/LabNotebook'
import Completion from './pages/Completion'
import WordScramble from './pages/WordScramble'

// Instructor Portal Pages
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorRoomEditor from './pages/InstructorRoomEditor'
import InstructorProgress from './pages/InstructorProgress'
import InstructorSettings from './pages/InstructorSettings'

import { GameProvider } from './context/GameStateContext'
import { InstructorAuthProvider } from './context/InstructorAuthContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import InstructorDebug from './components/InstructorDebug'

export default function App() {
  return (
    <GameProvider>
      <InstructorAuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Student Routes */}
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
                
                {/* Instructor Portal Routes - Now wrapped with auth provider */}
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/instructor/rooms" element={<InstructorRoomEditor />} />
                <Route path="/instructor/progress" element={<InstructorProgress />} />
                <Route path="/instructor/settings" element={<InstructorSettings />} />
                
                {/* Debug Routes */}
                <Route path="/debug" element={<InstructorDebug />} />
                
                {/* Catch-all route for 404s */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🧪</div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                      <div className="space-x-4">
                        <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all">
                          🏠 Student Home
                        </a>
                        <a href="/instructor" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all">
                          🧑‍🏫 Instructor Portal
                        </a>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </InstructorAuthProvider>
    </GameProvider>
  )
}
