import { useState } from 'react'

export default function Incubator({ isDiscovered, isActive, isSolved, onClick, studentGroup }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${
        isHovered ? 'transform scale-105' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width="100" height="120" viewBox="0 0 100 120" className="drop-shadow-lg">
        {/* Main body */}
        <rect x="10" y="20" width="80" height="90" fill="url(#incubatorBody)" rx="8"/>
        
        {/* Door */}
        <rect x="15" y="25" width="70" height="80" fill="url(#incubatorDoor)" rx="4"/>
        
        {/* Door handle */}
        <rect x="75" y="60" width="8" height="15" fill="#fbbf24" rx="4"/>
        
        {/* Display panel */}
        <rect x="20" y="30" width="30" height="20" fill="#1f2937" rx="2"/>
        <text x="35" y="43" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} fontSize="8" fontFamily="monospace">
          {isSolved ? "37°C" : isActive ? "??°C" : "OFF"}
        </text>
        
        {/* Vents */}
        <g fill="#6b7280">
          <rect x="55" y="35" width="25" height="2" rx="1"/>
          <rect x="55" y="40" width="25" height="2" rx="1"/>
          <rect x="55" y="45" width="25" height="2" rx="1"/>
        </g>
        
        {/* Status light */}
        <circle cx="75" cy="40" r="3" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"}>
          {isActive && <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>}
        </circle>
        
        {/* Base */}
        <rect x="5" y="110" width="90" height="8" fill="url(#incubatorBase)" rx="4"/>
        
        <defs>
          <linearGradient id="incubatorBody">
            <stop offset="0%" stopColor="#f3f4f6"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </linearGradient>
          <linearGradient id="incubatorDoor">
            <stop offset="0%" stopColor="#e5e7eb"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="incubatorBase">
            <stop offset="0%" stopColor="#374151"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs font-bold text-gray-700">🌡️ INCUBATOR</div>
        {isSolved && <div className="text-xs text-green-600">✓ Configured</div>}
      </div>
    </div>
  )
}
