// src/components/LabEquipment/Incubator.jsx
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

// src/components/LabEquipment/Centrifuge.jsx
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
}" y="110" width="90" height="8" fill="url(#incubatorBase)" rx="4"/>
        
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

// src/components/LabEquipment/PetriDish.jsx
import { useState } from 'react'

export default function PetriDish({ isDiscovered, isActive, isSolved, onClick, studentGroup }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${
        isHovered ? 'transform scale-110' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width="100" height="80" viewBox="0 0 100 80" className="drop-shadow-lg">
        {/* Petri dish 1 */}
        <circle cx="30" cy="35" r="25" fill="url(#petriDish)" stroke="#9ca3af" strokeWidth="2"/>
        <circle cx="30" cy="35" r="22" fill="#fef3c7"/>
        
        {/* Bacterial colonies on dish 1 */}
        <circle cx="25" cy="30" r="3" fill={isSolved ? "#10b981" : "#ef4444"}/>
        <circle cx="35" cy="25" r="2" fill={isSolved ? "#10b981" : "#f59e0b"}/>
        <circle cx="32" cy="40" r="4" fill={isSolved ? "#10b981" : "#ef4444"}/>
        
        {/* Petri dish 2 */}
        <circle cx="70" cy="35" r="20" fill="url(#petriDish)" stroke="#9ca3af" strokeWidth="2"/>
        <circle cx="70" cy="35" r="17" fill="#ddd6fe"/>
        
        {/* Bacterial colonies on dish 2 */}
        <circle cx="65" cy="30" r="2" fill={isSolved ? "#10b981" : "#8b5cf6"}/>
        <circle cx="75" cy="32" r="3" fill={isSolved ? "#10b981" : "#8b5cf6"}/>
        <circle cx="70" cy="42" r="2" fill={isSolved ? "#10b981" : "#8b5cf6"}/>
        
        {/* Labels */}
        <text x="30" y="65" textAnchor="middle" fontSize="8" fill="#374151">Blood Agar</text>
        <text x="70" y="65" textAnchor="middle" fontSize="8" fill="#374151">MacConkey</text>
        
        <defs>
          <linearGradient id="petriDish">
            <stop offset="0%" stopColor="#f9fafb"/>
            <stop offset="100%" stopColor="#e5e7eb"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs font-bold text-gray-700">🧫 CULTURES</div>
        {isSolved && <div className="text-xs text-green-600">✓ Analyzed</div>}
      </div>
    </div>
  )
}

// src/components/LabEquipment/Autoclave.jsx
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
        <rect x="5
