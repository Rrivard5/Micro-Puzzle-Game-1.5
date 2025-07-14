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
      <svg width="120" height="100" viewBox="0 0 120 100" className="drop-shadow-2xl">
        {/* Main body */}
        <rect x="15" y="30" width="90" height="55" fill="url(#centrifugeBody)" rx="8" stroke="#4a5568" strokeWidth="2"/>
        
        {/* Lid assembly */}
        <ellipse cx="60" cy="35" rx="38" ry="10" fill="url(#centrifugeLid)" stroke="#4a5568" strokeWidth="1"/>
        
        {/* Safety lock indicators */}
        <circle cx="25" cy="35" r="2" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} stroke="#2d3748" strokeWidth="1"/>
        <circle cx="95" cy="35" r="2" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} stroke="#2d3748" strokeWidth="1"/>
        
        {/* Rotor chamber (visible through transparent lid) */}
        <circle cx="60" cy="40" r="25" fill="url(#rotorChamber)" opacity="0.9" stroke="#cbd5e0" strokeWidth="1"/>
        
        {/* Rotor assembly */}
        <g transform="translate(60,40)">
          <circle r="20" fill="url(#rotor)" stroke="#4a5568" strokeWidth="1"/>
          <circle r="15" fill="url(#rotorCenter)" stroke="#2d3748" strokeWidth="0.5"/>
          
          {/* Sample tube holders */}
          <g className={isActive ? "animate-spin" : ""} style={{transformOrigin: "0 0"}}>
            {/* 6 sample positions */}
            <g transform="rotate(0)">
              <rect x="-2" y="-15" width="4" height="10" fill={isSolved ? "#10b981" : "#ef4444"} rx="2" stroke="#2d3748" strokeWidth="0.5"/>
              <circle cx="0" cy="-18" r="1.5" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="0.5"/>
            </g>
            <g transform="rotate(60)">
              <rect x="-2" y="-15" width="4" height="10" fill={isSolved ? "#10b981" : "#f59e0b"} rx="2" stroke="#2d3748" strokeWidth="0.5"/>
              <circle cx="0" cy="-18" r="1.5" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="0.5"/>
            </g>
            <g transform="rotate(120)">
              <rect x="-2" y="-15" width="4" height="10" fill={isSolved ? "#10b981" : "#3b82f6"} rx="2" stroke="#2d3748" strokeWidth="0.5"/>
              <circle cx="0" cy="-18" r="1.5" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="0.5"/>
            </g>
            <g transform="rotate(180)">
              <rect x="-2" y="-15" width="4" height="10" fill={isSolved ? "#10b981" : "#8b5cf6"} rx="2" stroke="#2d3748" strokeWidth="0.5"/>
              <circle cx="0" cy="-18" r="1.5" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="0.5"/>
            </g>
            <g transform="rotate(240)">
              <rect x="-2" y="-15" width="4" height="10" fill={isSolved ? "#10b981" : "#ec4899"} rx="2" stroke="#2d3748" strokeWidth="0.5"/>
              <circle cx="0" cy="-18" r="1.5" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="0.5"/>
            </g>
            <g transform="rotate(300)">
              <rect x="-2" y="-15" width="4" height="10" fill={isSolved ? "#10b981" : "#06b6d4"} rx="2" stroke="#2d3748" strokeWidth="0.5"/>
              <circle cx="0" cy="-18" r="1.5" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="0.5"/>
            </g>
          </g>
          
          {/* Central spindle */}
          <circle r="3" fill="url(#spindleGradient)" stroke="#2d3748" strokeWidth="1"/>
        </g>
        
        {/* Control panel */}
        <rect x="80" y="45" width="25" height="30" fill="url(#panelGradient)" rx="3" stroke="#2d3748" strokeWidth="1"/>
        
        {/* Speed display */}
        <rect x="82" y="48" width="21" height="8" fill="#000" rx="2"/>
        <text x="92" y="54" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} fontSize="5" fontFamily="monospace" fontWeight="bold">
          {isSolved ? "3000" : isActive ? "2750" : "0000"}
        </text>
        <text x="92" y="59" textAnchor="middle" fontSize="3" fill="#9ca3af" fontWeight="bold">RPM</text>
        
        {/* Timer display */}
        <rect x="82" y="62" width="21" height="6" fill="#1a202c" rx="1"/>
        <text x="92" y="67" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} fontSize="3" fontFamily="monospace">
          {isSolved ? "10:00" : isActive ? "08:32" : "00:00"}
        </text>
        
        {/* Control buttons */}
        <circle cx="85" cy="72" r="2.5" fill="#10b981" stroke="#059669" strokeWidth="1"/>
        <text x="85" y="74" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">▶</text>
        
        <circle cx="92" cy="72" r="2.5" fill="#ef4444" stroke="#dc2626" strokeWidth="1"/>
        <text x="92" y="74" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">■</text>
        
        <circle cx="99" cy="72" r="2.5" fill="#3b82f6" stroke="#2563eb" strokeWidth="1"/>
        <text x="99" y="74" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">⚙</text>
        
        {/* Emergency brake button */}
        <circle cx="20" cy="50" r="6" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
        <circle cx="20" cy="50" r="4" fill="#ef4444"/>
        <text x="20" y="52" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">E</text>
        
        {/* Status indicator */}
        <circle cx="30" cy="50" r="3" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} stroke="#2d3748" strokeWidth="1">
          {isActive && <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>}
        </circle>
        
        {/* Vibration dampeners (feet) */}
        <ellipse cx="25" cy="85" rx="8" ry="3" fill="url(#footGradient)"/>
        <ellipse cx="60" cx="85" rx="8" ry="3" fill="url(#footGradient)"/>
        <ellipse cx="95" cy="85" rx="8" ry="3" fill="url(#footGradient)"/>
        
        {/* Base */}
        <rect x="10" y="80" width="100" height="8" fill="url(#baseGradient)" rx="4" stroke="#2d3748" strokeWidth="1"/>
        
        {/* Brand and model labels */}
        <rect x="20" y="65" width="35" height="8" fill="#f7fafc" rx="2" stroke="#cbd5e0" strokeWidth="0.5"/>
        <text x="37" y="70" textAnchor="middle" fontSize="4" fill="#2d3748" fontWeight="bold">EPPENDORF</text>
        <text x="37" y="74" textAnchor="middle" fontSize="3" fill="#4a5568">5424 R</text>
        
        {/* Temperature display (for refrigerated model) */}
        <rect x="60" y="65" width="15" height="8" fill="#000" rx="1"/>
        <text x="67" y="70" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#3b82f6" : "#6b7280"} fontSize="3" fontFamily="monospace">
          {isSolved ? "4°C" : isActive ? "6°C" : "--°C"}
        </text>
        
        {/* Separation layers visualization in tubes when solved */}
        {isSolved && (
          <g transform="translate(60,40)">
            <g transform="rotate(0)">
              <rect x="-1.5" y="-14" width="3" height="3" fill="#fef3c7" opacity="0.8"/>
              <rect x="-1.5" y="-11" width="3" height="3" fill="#fecaca" opacity="0.8"/>
              <rect x="-1.5" y="-8" width="3" height="3" fill="#dc2626" opacity="0.8"/>
            </g>
            <g transform="rotate(120)">
              <rect x="-1.5" y="-14" width="3" height="3" fill="#fef3c7" opacity="0.8"/>
              <rect x="-1.5" y="-11" width="3" height="3" fill="#fecaca" opacity="0.8"/>
              <rect x="-1.5" y="-8" width="3" height="3" fill="#dc2626" opacity="0.8"/>
            </g>
            <g transform="rotate(240)">
              <rect x="-1.5" y="-14" width="3" height="3" fill="#fef3c7" opacity="0.8"/>
              <rect x="-1.5" y="-11" width="3" height="3" fill="#fecaca" opacity="0.8"/>
              <rect x="-1.5" y="-8" width="3" height="3" fill="#dc2626" opacity="0.8"/>
            </g>
          </g>
        )}
        
        <defs>
          <linearGradient id="centrifugeBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7fafc"/>
            <stop offset="100%" stopColor="#e2e8f0"/>
          </linearGradient>
          <linearGradient id="centrifugeLid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#edf2f7"/>
            <stop offset="100%" stopColor="#cbd5e0"/>
          </linearGradient>
          <radialGradient id="rotorChamber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f9fafb"/>
            <stop offset="100%" stopColor="#e5e7eb"/>
          </radialGradient>
          <radialGradient id="rotor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e2e8f0"/>
            <stop offset="100%" stopColor="#a0aec0"/>
          </radialGradient>
          <radialGradient id="rotorCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#cbd5e0"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </radialGradient>
          <linearGradient id="spindleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af"/>
            <stop offset="100%" stopColor="#6b7280"/>
          </linearGradient>
          <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568"/>
            <stop offset="100%" stopColor="#2d3748"/>
          </linearGradient>
          <linearGradient id="footGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568"/>
            <stop offset="100%" stopColor="#2d3748"/>
          </linearGradient>
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568"/>
            <stop offset="100%" stopColor="#2d3748"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-md">
          🌪️ REFRIGERATED CENTRIFUGE
        </div>
        {isSolved && <div className="text-xs text-green-600 mt-1">✓ Sample Separated</div>}
        {isActive && !isSolved && <div className="text-xs text-yellow-600 mt-1">⚡ Spinning at 2750 RPM</div>}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-xl">
          {isSolved 
            ? "Blood components successfully separated" 
            : isActive 
            ? "Separating blood cells by density at 3000 RPM..." 
            : "Click to centrifuge blood samples"
          }
        </div>
      )}
    </div>
  )
}
