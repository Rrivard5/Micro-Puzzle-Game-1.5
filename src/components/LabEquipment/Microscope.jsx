import { useState } from 'react'

export default function Microscope({ isDiscovered, isActive, isSolved, onClick, studentGroup }) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = () => {
    if (isSolved) return 'from-green-400 to-green-600'
    if (isActive) return 'from-yellow-400 to-orange-500'
    if (isDiscovered) return 'from-blue-400 to-blue-600'
    return 'from-gray-400 to-gray-600'
  }

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${
        isHovered ? 'transform scale-110' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Microscope SVG */}
      <svg width="120" height="140" viewBox="0 0 120 140" className="drop-shadow-lg">
        {/* Base */}
        <ellipse cx="60" cy="130" rx="50" ry="8" fill="url(#baseGradient)"/>
        
        {/* Arm */}
        <rect x="55" y="30" width="10" height="100" fill="url(#armGradient)" rx="5"/>
        
        {/* Body */}
        <rect x="40" y="40" width="40" height="60" fill="url(#bodyGradient)" rx="8"/>
        
        {/* Objectives */}
        <circle cx="60" cy="100" r="8" fill="url(#objectiveGradient)"/>
        <circle cx="60" cy="85" r="6" fill="url(#objectiveGradient)"/>
        <circle cx="60" cy="72" r="4" fill="url(#objectiveGradient)"/>
        
        {/* Stage */}
        <rect x="45" y="95" width="30" height="8" fill="url(#stageGradient)" rx="4"/>
        
        {/* Eyepiece */}
        <circle cx="60" cy="25" r="12" fill="url(#eyepieceGradient)"/>
        <circle cx="60" cy="25" r="8" fill="#1a1a1a"/>
        
        {/* Focus knobs */}
        <circle cx="25" cy="60" r="6" fill="url(#knobGradient)"/>
        <circle cx="25" cy="75" r="4" fill="url(#knobGradient)"/>
        
        {/* Light source */}
        <circle cx="60" cy="115" r="6" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"}/>
        
        {/* Status indicator */}
        {(isDiscovered || isActive || isSolved) && (
          <circle cx="95" cy="35" r="6" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#3b82f6"}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
          </circle>
        )}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
          <linearGradient id="armGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7280"/>
            <stop offset="100%" stopColor="#374151"/>
          </linearGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af"/>
            <stop offset="100%" stopColor="#6b7280"/>
          </linearGradient>
          <linearGradient id="objectiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="stageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f4f6"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </linearGradient>
          <linearGradient id="eyepieceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4b5563"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
          <linearGradient id="knobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#d97706"/>
          </linearGradient>
        </defs>
      </svg>
      
      {/* Status glow effect */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${getStatusColor()} opacity-30 blur-xl ${
        isActive ? 'animate-pulse' : ''
      }`}></div>
      
      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs font-bold text-gray-700">🔬 MICROSCOPE</div>
        {isSolved && <div className="text-xs text-green-600">✓ Analyzed</div>}
        {isActive && !isSolved && <div className="text-xs text-yellow-600">⚡ Active</div>}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20">
          {isSolved 
            ? "Sample analysis complete" 
            : isActive 
            ? "Examining specimen..." 
            : "Click to examine specimens"
          }
        </div>
      )}
    </div>
  )
}
