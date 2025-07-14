import { useState } from 'react'

export default function Microscope({ isDiscovered, isActive, isSolved, onClick, studentGroup }) {
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
      {/* Realistic Microscope SVG based on the image provided */}
      <svg width="120" height="160" viewBox="0 0 120 160" className="drop-shadow-2xl">
        {/* Base */}
        <ellipse cx="60" cy="150" rx="55" ry="8" fill="url(#baseGradient)"/>
        
        {/* Main body/frame */}
        <rect x="50" y="45" width="20" height="105" fill="url(#frameGradient)" rx="3"/>
        
        {/* Arm - curved design */}
        <path d="M 60 45 Q 45 35 45 25 Q 45 15 55 15 L 85 15 Q 95 15 95 25 L 95 35" 
              fill="url(#armGradient)" stroke="#2d3748" strokeWidth="1"/>
        
        {/* Head/eyepiece assembly */}
        <rect x="40" y="15" width="50" height="35" fill="url(#headGradient)" rx="8"/>
        
        {/* Binocular eyepieces */}
        <circle cx="55" cy="25" r="8" fill="url(#eyepieceGradient)"/>
        <circle cx="75" cy="25" r="8" fill="url(#eyepieceGradient)"/>
        <circle cx="55" cy="25" r="6" fill="#1a1a1a"/>
        <circle cx="75" cy="25" r="6" fill="#1a1a1a"/>
        
        {/* Interpupillary adjustment */}
        <rect x="62" y="20" width="6" height="10" fill="url(#knobGradient)" rx="2"/>
        
        {/* Nosepiece (objective turret) */}
        <circle cx="60" cy="75" r="12" fill="url(#nosepieceGradient)"/>
        <circle cx="60" cy="75" r="10" fill="url(#objectiveGradient)"/>
        
        {/* Objectives */}
        <g transform="translate(60,75)">
          <rect x="-3" y="-12" width="6" height="8" fill="url(#objectiveGradient)" rx="1"/>
          <rect x="8" y="-6" width="6" height="8" fill="url(#objectiveGradient)" rx="1" transform="rotate(72)"/>
          <rect x="5" y="8" width="6" height="8" fill="url(#objectiveGradient)" rx="1" transform="rotate(144)"/>
          <rect x="-11" y="5" width="6" height="8" fill="url(#objectiveGradient)" rx="1" transform="rotate(216)"/>
          <rect x="-14" y="-3" width="6" height="8" fill="url(#objectiveGradient)" rx="1" transform="rotate(288)"/>
        </g>
        
        {/* Stage */}
        <rect x="35" y="90" width="50" height="8" fill="url(#stageGradient)" rx="4"/>
        <rect x="40" y="92" width="40" height="4" fill="url(#stageSurfaceGradient)" rx="2"/>
        
        {/* Stage clips */}
        <rect x="32" y="90" width="6" height="3" fill="#6b7280" rx="1"/>
        <rect x="82" y="90" width="6" height="3" fill="#6b7280" rx="1"/>
        
        {/* Specimen slide (when active) */}
        {(isActive || isSolved) && (
          <rect x="50" y="88" width="20" height="12" fill="#e5e7eb" rx="1" opacity="0.9"/>
        )}
        
        {/* Condenser assembly */}
        <rect x="55" y="105" width="10" height="15" fill="url(#condenserGradient)" rx="2"/>
        <circle cx="60" cy="120" r="4" fill="url(#condenserLensGradient)"/>
        
        {/* Illumination base */}
        <rect x="45" y="125" width="30" height="20" fill="url(#illuminationGradient)" rx="6"/>
        
        {/* Light indicator */}
        <circle cx="60" cy="135" r="3" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"}>
          {isActive && <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>}
        </circle>
        
        {/* Fine/coarse focus knobs */}
        <circle cx="25" cy="70" r="8" fill="url(#knobGradient)"/>
        <circle cx="25" cy="70" r="6" fill="url(#knobInnerGradient)"/>
        <circle cx="25" cy="85" r="6" fill="url(#knobGradient)"/>
        <circle cx="25" cy="85" r="4" fill="url(#knobInnerGradient)"/>
        
        {/* Knob details */}
        <g transform="translate(25,70)">
          <line x1="-4" y1="0" x2="4" y2="0" stroke="#374151" strokeWidth="1"/>
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#374151" strokeWidth="1"/>
        </g>
        
        {/* Control panel */}
        <rect x="15" y="110" width="25" height="15" fill="url(#panelGradient)" rx="3"/>
        <circle cx="20" cy="117" r="2" fill={isActive ? "#10b981" : "#6b7280"}/>
        <circle cx="27" cy="117" r="2" fill="#ef4444"/>
        <circle cx="34" cy="117" r="2" fill="#3b82f6"/>
        
        {/* Brand/model label */}
        <rect x="85" y="140" width="30" height="8" fill="#f7fafc" rx="2" stroke="#cbd5e0" strokeWidth="0.5"/>
        <text x="100" y="146" textAnchor="middle" fontSize="4" fill="#2d3748" fontWeight="bold">OLYMPUS</text>
        
        {/* Status indicator */}
        {(isDiscovered || isActive || isSolved) && (
          <circle cx="100" cy="35" r="4" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#3b82f6"}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
          </circle>
        )}
        
        {/* Specimen view (when solved) */}
        {isSolved && (
          <g transform="translate(60,94)">
            <circle r="8" fill="#1a1a1a" opacity="0.8"/>
            <circle r="6" fill="#fef3c7"/>
            {/* Bacterial cells */}
            <ellipse cx="-2" cy="-1" rx="1.5" ry="0.8" fill="#8b5cf6" opacity="0.7"/>
            <ellipse cx="1" cy="0" rx="1.5" ry="0.8" fill="#8b5cf6" opacity="0.7"/>
            <ellipse cx="-1" cy="2" rx="1.5" ry="0.8" fill="#8b5cf6" opacity="0.7"/>
            <ellipse cx="2" cy="-2" rx="1.5" ry="0.8" fill="#8b5cf6" opacity="0.7"/>
          </g>
        )}
        
        <defs>
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7280"/>
            <stop offset="100%" stopColor="#374151"/>
          </linearGradient>
          <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af"/>
            <stop offset="100%" stopColor="#6b7280"/>
          </linearGradient>
          <linearGradient id="armGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="eyepieceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4b5563"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
          <linearGradient id="nosepieceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db"/>
            <stop offset="100%" stopColor="#6b7280"/>
          </linearGradient>
          <linearGradient id="objectiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f4f6"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="stageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="stageSurfaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9fafb"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </linearGradient>
          <linearGradient id="condenserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af"/>
            <stop offset="100%" stopColor="#6b7280"/>
          </linearGradient>
          <linearGradient id="condenserLensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f4f6"/>
            <stop offset="100%" stopColor="#e5e7eb"/>
          </linearGradient>
          <linearGradient id="illuminationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4b5563"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
          <linearGradient id="knobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#d97706"/>
          </linearGradient>
          <linearGradient id="knobInnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </linearGradient>
          <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
        </defs>
      </svg>
      
      {/* Label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-md">
          🔬 RESEARCH MICROSCOPE
        </div>
        {isSolved && <div className="text-xs text-green-600 mt-1">✓ Bacterial Analysis Complete</div>}
        {isActive && !isSolved && <div className="text-xs text-yellow-600 mt-1">⚡ Examining Specimen</div>}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20">
          {isSolved 
            ? "Rod-shaped bacteria identified - E. coli confirmed" 
            : isActive 
            ? "Examining bacterial morphology at 1000x magnification..." 
            : "Click to examine patient specimen under microscope"
          }
        </div>
      )}
    </div>
  )
}
