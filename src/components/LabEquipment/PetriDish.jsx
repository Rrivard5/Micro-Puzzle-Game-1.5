import { useState } from 'react'

export default function PetriDish({ isDiscovered, isActive, isSolved, onClick, studentGroup }) {
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
      <svg width="120" height="90" viewBox="0 0 120 90" className="drop-shadow-2xl">
        {/* Lab tray/holder */}
        <rect x="5" y="65" width="110" height="8" fill="url(#trayGradient)" rx="4" stroke="#4a5568" strokeWidth="1"/>
        
        {/* Petri dish 1 - Blood Agar */}
        <g transform="translate(30,35)">
          {/* Dish bottom */}
          <circle r="25" fill="url(#dishBottom)" stroke="#9ca3af" strokeWidth="2"/>
          {/* Agar medium */}
          <circle r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.5"/>
          
          {/* Bacterial colonies with hemolysis patterns */}
          <circle cx="-8" cy="-5" r="4" fill={isSolved ? "#10b981" : "#ef4444"} opacity="0.8"/>
          {/* Clear zone (beta hemolysis) */}
          <circle cx="-8" cy="-5" r="6" fill="none" stroke={isSolved ? "#10b981" : "#fbbf24"} strokeWidth="1" opacity="0.6"/>
          
          <circle cx="5" cy="-8" r="3" fill={isSolved ? "#10b981" : "#f59e0b"} opacity="0.8"/>
          <circle cx="5" cy="-8" r="5" fill="none" stroke={isSolved ? "#10b981" : "#fbbf24"} strokeWidth="0.8" opacity="0.6"/>
          
          <circle cx="8" cy="6" r="5" fill={isSolved ? "#10b981" : "#ef4444"} opacity="0.8"/>
          <circle cx="8" cy="6" r="7" fill="none" stroke={isSolved ? "#10b981" : "#fbbf24"} strokeWidth="1" opacity="0.6"/>
          
          <circle cx="-5" cy="8" r="2" fill={isSolved ? "#10b981" : "#dc2626"} opacity="0.8"/>
          
          {/* Dish lid */}
          <circle r="25" fill="url(#dishLid)" opacity="0.3" stroke="#cbd5e0" strokeWidth="1"/>
        </g>
        
        {/* Petri dish 2 - MacConkey Agar */}
        <g transform="translate(85,35)">
          {/* Dish bottom */}
          <circle r="20" fill="url(#dishBottom)" stroke="#9ca3af" strokeWidth="2"/>
          {/* MacConkey agar (pink/red) */}
          <circle r="17" fill="#fce7f3" stroke="#ec4899" strokeWidth="0.5"/>
          
          {/* Lactose-fermenting colonies (pink) */}
          <circle cx="-6" cy="-3" r="2.5" fill={isSolved ? "#10b981" : "#ec4899"} opacity="0.8"/>
          <circle cx="4" cy="-2" r="3" fill={isSolved ? "#10b981" : "#ec4899"} opacity="0.8"/>
          
          {/* Non-lactose fermenting colonies (colorless) */}
          <circle cx="2" cy="6" r="2" fill={isSolved ? "#10b981" : "#f3f4f6"} opacity="0.8" stroke="#9ca3af" strokeWidth="0.5"/>
          <circle cx="-4" cy="5" r="1.5" fill={isSolved ? "#10b981" : "#f3f4f6"} opacity="0.8" stroke="#9ca3af" strokeWidth="0.5"/>
          
          {/* Dish lid */}
          <circle r="20" fill="url(#dishLid)" opacity="0.3" stroke="#cbd5e0" strokeWidth="1"/>
        </g>
        
        {/* Labels with more detail */}
        <rect x="10" y="75" width="40" height="12" fill="#f7fafc" rx="2" stroke="#cbd5e0" strokeWidth="0.5"/>
        <text x="30" y="82" textAnchor="middle" fontSize="7" fill="#2d3748" fontWeight="bold">Blood Agar</text>
        <text x="30" y="86" textAnchor="middle" fontSize="4" fill="#4a5568">Hemolysis Test</text>
        
        <rect x="70" y="75" width="40" height="12" fill="#f7fafc" rx="2" stroke="#cbd5e0" strokeWidth="0.5"/>
        <text x="90" y="82" textAnchor="middle" fontSize="7" fill="#2d3748" fontWeight="bold">MacConkey</text>
        <text x="90" y="86" textAnchor="middle" fontSize="4" fill="#4a5568">Lactose Test</text>
        
        {/* Magnifying glass for examination */}
        {(isActive || isSolved) && (
          <g transform="translate(60,20)" opacity="0.8">
            <circle r="8" fill="none" stroke="#4a5568" strokeWidth="2"/>
            <circle r="6" fill="#f0f9ff" opacity="0.5"/>
            <line x1="6" y1="6" x2="12" y2="12" stroke="#4a5568" strokeWidth="2" strokeLinecap="round"/>
          </g>
        )}
        
        {/* Contamination warning (if active but not solved) */}
        {isActive && !isSolved && (
          <g transform="translate(10,10)">
            <circle r="6" fill="#fef2f2" stroke="#ef4444" strokeWidth="1"/>
            <text x="0" y="2" textAnchor="middle" fontSize="8" fill="#ef4444">!</text>
          </g>
        )}
        
        {/* Success indicator */}
        {isSolved && (
          <g transform="translate(10,10)">
            <circle r="6" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1"/>
            <text x="0" y="2" textAnchor="middle" fontSize="6" fill="#22c55e">✓</text>
          </g>
        )}
        
        <defs>
          <linearGradient id="dishBottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9fafb"/>
            <stop offset="100%" stopColor="#e5e7eb"/>
          </linearGradient>
          <linearGradient id="dishLid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="100%" stopColor="#f3f4f6"/>
          </linearGradient>
          <linearGradient id="trayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-md">
          🧫 BACTERIAL CULTURES
        </div>
        {isSolved && <div className="text-xs text-green-600 mt-1">✓ Hemolysis Pattern Identified</div>}
        {isActive && !isSolved && <div className="text-xs text-yellow-600 mt-1">⚡ Examining Colony Morphology</div>}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-xl">
          {isSolved 
            ? "Beta-hemolytic Streptococcus identified" 
            : isActive 
            ? "Analyzing hemolysis patterns and colony characteristics..." 
            : "Click to examine bacterial cultures"
          }
        </div>
      )}
    </div>
  )
}
