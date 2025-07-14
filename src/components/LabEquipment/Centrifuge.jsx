import { useState } from 'react'

export default function Centrifuge({ isDiscovered, isActive, isSolved, onClick, studentGroup }) {
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
      <svg width="110" height="90" viewBox="0 0 110 90" className="drop-shadow-lg">
        {/* Main body */}
        <rect x="10" y="25" width="90" height="50" fill="url(#centrifugeBody)" rx="8"/>
        
        {/* Lid */}
        <ellipse cx="55" cy="30" rx="35" ry="8" fill="url(#centrifugeLid)"/>
        
        {/* Rotor chamber (visible through transparent lid) */}
        <circle cx="55" cy="35" r="20" fill="url(#rotorChamber)" opacity="0.8"/>
        
        {/* Rotor */}
        <g transform="translate(55,35)">
          <circle r="15" fill="url(#rotor)" stroke="#374151" strokeWidth="1"/>
          
          {/* Sample tubes */}
          <g className={isActive ? "animate-spin" : ""} style={{transformOrigin: "0 0"}}>
            <rect x="-2" y="-12" width="4" height="8" fill={isSolved ? "#10b981" : "#ef4444"} rx="2"/>
            <rect x="8" y="-6" width="4" height="8" fill={isSolved ? "#10b981" : "#f59e0b"} rx="2"/>
            <rect x="8" y="2" width="4" height="8" fill={isSolved ? "#10b981" : "#3b82f6"} rx="2"/>
            <rect x="-2" y="8" width="4" height="8" fill={isSolved ? "#10b981" : "#8b5cf6"} rx="2"/>
            <rect x="-12" y="2" width="4" height="8" fill={isSolved ? "#10b981" : "#ec4899"} rx="2"/>
            <rect x="-12" y="-6" width="4" height="8" fill={isSolved ? "#10b981" : "#06b6d4"} rx="2"/>
          </g>
        </g>
        
        {/* Control panel */}
        <rect x="75" y="40" width="20" height="25" fill="#1f2937" rx="3"/>
        
        {/* Speed display */}
        <rect x="77" y="42" width="16" height="6" fill="#000" rx="1"/>
        <text x="85" y="46" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} fontSize="4" fontFamily="monospace">
          {isSolved ? "3000" : isActive ? "SPIN" : "0000"}
        </text>
        <text x="85" y="51" textAnchor="middle" fontSize="3" fill="#9ca3af">RPM</text>
        
        {/* Control buttons */}
        <circle cx="80" cy="57" r="2" fill="#10b981"/>
        <circle cx="87" cy="57" r="2" fill="#ef4444"/>
        <circle cx="90" cy="60" r="1.5" fill="#3b82f6"/>
        
        {/* Timer display */}
        <rect x="77" y="52" width="16" height="4" fill="#000" rx="1"/>
        <text x="85" y="55" textAnchor="middle" fill={isSolved ? "#10b981" : "#6b7280"} fontSize="3" fontFamily="monospace">
          {isSolved ? "10:00" : "00:00"}
        </text>
        
        {/* Base */}
        <rect x="5" y="75" width="100" height="10" fill="url(#centrifugeBase)" rx="5"/>
        
        {/* Status indicator */}
        <circle cx="25" cy="45" r="3" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"}>
          {isActive && <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite"/>}
        </circle>
        
        <defs>
          <linearGradient id="centrifugeBody">
            <stop offset="0%" stopColor="#f3f4f6"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </linearGradient>
          <linearGradient id="centrifugeLid">
            <stop offset="0%" stopColor="#e5e7eb"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <radialGradient id="rotorChamber">
            <stop offset="0%" stopColor="#f9fafb"/>
            <stop offset="100%" stopColor="#e5e7eb"/>
          </radialGradient>
          <radialGradient id="rotor">
            <stop offset="0%" stopColor="#d1d5db"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </radialGradient>
          <linearGradient id="centrifugeBase">
            <stop offset="0%" stopColor="#374151"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs font-bold text-gray-700">🌪️ CENTRIFUGE</div>
        {isSolved && <div className="text-xs text-green-600">✓ Separated</div>}
      </div>
    </div>
  )
}
