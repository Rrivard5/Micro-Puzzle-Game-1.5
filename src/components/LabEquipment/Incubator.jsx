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
      <svg width="110" height="130" viewBox="0 0 110 130" className="drop-shadow-2xl">
        {/* Main body - more realistic proportions */}
        <rect x="10" y="25" width="90" height="95" fill="url(#incubatorBody)" rx="8" stroke="#4a5568" strokeWidth="2"/>
        
        {/* Door with realistic details */}
        <rect x="15" y="30" width="80" height="85" fill="url(#incubatorDoor)" rx="6" stroke="#2d3748" strokeWidth="1"/>
        
        {/* Door window */}
        <rect x="25" y="40" width="35" height="25" fill="url(#windowGradient)" rx="3" stroke="#4a5568" strokeWidth="1"/>
        <rect x="27" y="42" width="31" height="21" fill="#e6fffa" rx="2" opacity="0.8"/>
        
        {/* Door handle - more realistic */}
        <rect x="85" y="70" width="12" height="20" fill="url(#handleGradient)" rx="6" stroke="#2d3748" strokeWidth="1"/>
        <circle cx="91" cy="80" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
        
        {/* Digital display panel */}
        <rect x="65" y="45" width="32" height="22" fill="url(#panelGradient)" rx="3" stroke="#2d3748" strokeWidth="1"/>
        <rect x="67" y="47" width="28" height="8" fill="#000" rx="2"/>
        
        {/* Temperature display */}
        <text x="81" y="54" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} fontSize="6" fontFamily="monospace" fontWeight="bold">
          {isSolved ? "37.0°C" : isActive ? "36.8°C" : "OFF"}
        </text>
        
        {/* CO2 display */}
        <rect x="67" y="57" width="28" height="6" fill="#1a202c" rx="1"/>
        <text x="81" y="62" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} fontSize="4" fontFamily="monospace">
          {isSolved ? "CO2: 5.0%" : isActive ? "CO2: 4.8%" : "CO2: 0.0%"}
        </text>
        
        {/* Control buttons */}
        <circle cx="70" cy="72" r="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1"/>
        <circle cx="78" cy="72" r="3" fill="#10b981" stroke="#059669" strokeWidth="1"/>
        <circle cx="86" cy="72" r="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1"/>
        <circle cx="94" cy="72" r="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
        
        {/* Ventilation grilles */}
        <g fill="#6b7280" opacity="0.8">
          <rect x="20" y="82" width="25" height="1.5" rx="0.5"/>
          <rect x="20" y="85" width="25" height="1.5" rx="0.5"/>
          <rect x="20" y="88" width="25" height="1.5" rx="0.5"/>
          <rect x="20" y="91" width="25" height="1.5" rx="0.5"/>
          <rect x="20" y="94" width="25" height="1.5" rx="0.5"/>
        </g>
        
        {/* Power indicator LED */}
        <circle cx="90" cy="35" r="3" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} stroke="#2d3748" strokeWidth="1">
          {isActive && <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>}
        </circle>
        
        {/* Alarm indicator */}
        {(isActive || isSolved) && (
          <circle cx="75" cy="35" r="2" fill="#ef4444">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
          </circle>
        )}
        
        {/* Brand label */}
        <rect x="20" y="105" width="40" height="8" fill="#f7fafc" rx="2" opacity="0.9" stroke="#cbd5e0" strokeWidth="0.5"/>
        <text x="40" y="111" textAnchor="middle" fontSize="5" fill="#2d3748" fontFamily="sans-serif" fontWeight="bold">
          THERMO SCIENTIFIC
        </text>
        
        {/* Model label */}
        <text x="40" y="116" textAnchor="middle" fontSize="3" fill="#4a5568" fontFamily="sans-serif">
          HERACELL VIOS 160i
        </text>
        
        {/* Feet/base */}
        <rect x="15" y="120" width="8" height="8" fill="url(#footGradient)" rx="2"/>
        <rect x="87" y="120" width="8" height="8" fill="url(#footGradient)" rx="2"/>
        <rect x="8" y="125" width="94" height="4" fill="url(#baseGradient)" rx="2"/>
        
        {/* Internal shelves visible through window */}
        {(isActive || isSolved) && (
          <g opacity="0.6">
            <rect x="28" y="48" width="29" height="1" fill="#cbd5e0"/>
            <rect x="28" y="55" width="29" height="1" fill="#cbd5e0"/>
            <rect x="28" y="62" width="29" height="1" fill="#cbd5e0"/>
          </g>
        )}
        
        {/* Petri dishes on shelves */}
        {(isActive || isSolved) && (
          <g opacity="0.7">
            <circle cx="32" cy="50" r="2" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.5"/>
            <circle cx="38" cy="50" r="2" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="0.5"/>
            <circle cx="44" cy="50" r="2" fill="#fecaca" stroke="#ef4444" strokeWidth="0.5"/>
            <circle cx="50" cy="50" r="2" fill="#dcfce7" stroke="#22c55e" strokeWidth="0.5"/>
          </g>
        )}
        
        <defs>
          <linearGradient id="incubatorBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7fafc"/>
            <stop offset="100%" stopColor="#e2e8f0"/>
          </linearGradient>
          <linearGradient id="incubatorDoor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#edf2f7"/>
            <stop offset="100%" stopColor="#cbd5e0"/>
          </linearGradient>
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0fff4"/>
            <stop offset="100%" stopColor="#d1fae5"/>
          </linearGradient>
          <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa"/>
            <stop offset="100%" stopColor="#f59e0b"/>
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
          🌡️ CO₂ INCUBATOR
        </div>
        {isSolved && <div className="text-xs text-green-600 mt-1">✓ Optimal Conditions Set</div>}
        {isActive && !isSolved && <div className="text-xs text-yellow-600 mt-1">⚡ Stabilizing Environment</div>}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-xl">
          {isSolved 
            ? "Optimal growth conditions achieved" 
            : isActive 
            ? "Maintaining 37°C and 5% CO₂..." 
            : "Click to check bacterial growth conditions"
          }
        </div>
      )}
    </div>
  )
}
