import { useState } from 'react'

export default function Autoclave({ isDiscovered, isActive, isSolved, onClick, studentGroup }) {
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
      <svg width="120" height="100" viewBox="0 0 120 100" className="drop-shadow-lg">
        {/* Main chamber */}
        <rect x="10" y="20" width="100" height="60" fill="url(#autoclaveBody)" rx="8"/>
        
        {/* Door */}
        <rect x="15" y="25" width="35" height="50" fill="url(#autoclaveDoor)" rx="4"/>
        
        {/* Door seal */}
        <rect x="16" y="26" width="33" height="48" fill="none" stroke="#6b7280" strokeWidth="2" rx="3"/>
        
        {/* Handle */}
        <circle cx="45" cy="50" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/>
        
        {/* Control panel */}
        <rect x="60" y="30" width="40" height="30" fill="#1f2937" rx="4"/>
        
        {/* Display */}
        <rect x="65" y="35" width="30" height="8" fill="#000" rx="2"/>
        <text x="80" y="41" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} fontSize="6" fontFamily="monospace">
          {isSolved ? "121°C 15min" : isActive ? "HEATING..." : "STANDBY"}
        </text>
        
        {/* Buttons */}
        <circle cx="70" cy="50" r="3" fill="#ef4444"/>
        <circle cx="80" cy="50" r="3" fill="#10b981"/>
        <circle cx="90" cy="50" r="3" fill="#3b82f6"/>
        
        {/* Pressure gauge */}
        <circle cx="95" cy="15" r="8" fill="url(#gauge)" stroke="#374151" strokeWidth="2"/>
        <text x="95" y="18" textAnchor="middle" fontSize="6" fill="#374151">PSI</text>
        
        {/* Steam vents */}
        {isActive && (
          <g opacity="0.6">
            <circle cx="25" cy="15" r="2" fill="#e5e7eb">
              <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="35" cy="12" r="1.5" fill="#e5e7eb">
              <animate attributeName="r" values="1.5;3;1.5" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </g>
        )}
        
        {/* Base */}
        <rect x="5" y="85" width="110" height="12" fill="url(#autoclaveBase)" rx="6"/>
        
        <defs>
          <linearGradient id="autoclaveBody">
            <stop offset="0%" stopColor="#f3f4f6"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </linearGradient>
          <linearGradient id="autoclaveDoor">
            <stop offset="0%" stopColor="#e5e7eb"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="autoclaveBase">
            <stop offset="0%" stopColor="#374151"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
          <radialGradient id="gauge">
            <stop offset="0%" stopColor="#f9fafb"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </radialGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs font-bold text-gray-700">♨️ AUTOCLAVE</div>
        {isSolved && <div className="text-xs text-green-600">✓ Sterilized</div>}
      </div>
    </div>
  )
}
