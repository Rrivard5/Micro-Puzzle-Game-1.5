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
      <svg width="130" height="110" viewBox="0 0 130 110" className="drop-shadow-2xl">
        {/* Main chamber body */}
        <rect x="15" y="25" width="100" height="65" fill="url(#autoclaveBody)" rx="8" stroke="#4a5568" strokeWidth="2"/>
        
        {/* Chamber door */}
        <rect x="20" y="30" width="40" height="55" fill="url(#autoclaveDoor)" rx="6" stroke="#2d3748" strokeWidth="1"/>
        
        {/* Door window */}
        <circle cx="40" cy="50" r="12" fill="url(#windowGradient)" stroke="#4a5568" strokeWidth="2"/>
        <circle cx="40" cy="50" r="10" fill="#e6fffa" opacity="0.8"/>
        <circle cx="40" cy="50" r="8" fill="none" stroke="#cbd5e0" strokeWidth="1"/>
        
        {/* Door handle assembly */}
        <rect x="55" y="55" width="15" height="8" fill="url(#handleGradient)" rx="4" stroke="#2d3748" strokeWidth="1"/>
        <circle cx="62" cy="59" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
        
        {/* Locking mechanism */}
        <rect x="58" y="45" width="8" height="6" fill="#4a5568" rx="2"/>
        <circle cx="62" cy="48" r="2" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"}/>
        
        {/* Control panel */}
        <rect x="70" y="35" width="35" height="40" fill="url(#panelGradient)" rx="4" stroke="#2d3748" strokeWidth="1"/>
        
        {/* Digital display */}
        <rect x="74" y="40" width="27" height="12" fill="#000" rx="2" stroke="#4a5568" strokeWidth="1"/>
        <text x="87" y="48" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} fontSize="6" fontFamily="monospace" fontWeight="bold">
          {isSolved ? "121°C 15min" : isActive ? "HEATING..." : "STANDBY"}
        </text>
        
        {/* Pressure display */}
        <rect x="74" y="54" width="27" height="8" fill="#1a202c" rx="1"/>
        <text x="87" y="60" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} fontSize="4" fontFamily="monospace">
          {isSolved ? "15.0 PSI" : isActive ? "12.3 PSI" : "0.0 PSI"}
        </text>
        
        {/* Control buttons */}
        <circle cx="78" cy="67" r="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1"/>
        <circle cx="87" cy="67" r="3" fill="#10b981" stroke="#059669" strokeWidth="1"/>
        <circle cx="96" cy="67" r="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1"/>
        
        {/* Pressure gauge */}
        <g transform="translate(110,20)">
          <circle r="10" fill="url(#gaugeGradient)" stroke="#4a5568" strokeWidth="2"/>
          <circle r="8" fill="#f7fafc"/>
          <text x="0" y="12" textAnchor="middle" fontSize="4" fill="#4a5568" fontWeight="bold">PSI</text>
          
          {/* Gauge needle */}
          <g transform={`rotate(${isSolved ? 45 : isActive ? 20 : -45})`}>
            <line x1="0" y1="0" x2="0" y2="-6" stroke="#ef4444" strokeWidth="1" strokeLinecap="round"/>
          </g>
          
          {/* Gauge markings */}
          <g stroke="#6b7280" strokeWidth="0.5">
            <line x1="0" y1="-8" x2="0" y2="-7" transform="rotate(-45)"/>
            <line x1="0" y1="-8" x2="0" y2="-7" transform="rotate(0)"/>
            <line x1="0" y1="-8" x2="0" y2="-7" transform="rotate(45)"/>
          </g>
        </g>
        
        {/* Temperature gauge */}
        <g transform="translate(110,45)">
          <circle r="8" fill="url(#tempGaugeGradient)" stroke="#4a5568" strokeWidth="1.5"/>
          <circle r="6" fill="#f7fafc"/>
          <text x="0" y="10" textAnchor="middle" fontSize="3" fill="#4a5568" fontWeight="bold">°C</text>
          
          {/* Temperature needle */}
          <g transform={`rotate(${isSolved ? 60 : isActive ? 30 : -60})`}>
            <line x1="0" y1="0" x2="0" y2="-5" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round"/>
          </g>
        </g>
        
        {/* Steam vents on top */}
        <rect x="25" y="15" width="4" height="8" fill="#6b7280" rx="2"/>
        <rect x="35" y="15" width="4" height="8" fill="#6b7280" rx="2"/>
        <rect x="45" y="15" width="4" height="8" fill="#6b7280" rx="2"/>
        
        {/* Steam effects when active */}
        {isActive && (
          <g opacity="0.6">
            <circle cx="27" cy="12" r="2" fill="#e5e7eb">
              <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="37" cy="10" r="1.5" fill="#e5e7eb">
              <animate attributeName="r" values="1.5;3;1.5" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="47" cy="11" r="1.8" fill="#e5e7eb">
              <animate attributeName="r" values="1.8;3.5;1.8" dur="2.2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.2s" repeatCount="indefinite"/>
            </circle>
          </g>
        )}
        
        {/* Warning labels */}
        <rect x="20" y="85" width="20" height="6" fill="#fef2f2" rx="1" stroke="#ef4444" strokeWidth="0.5"/>
        <text x="30" y="89" textAnchor="middle" fontSize="3" fill="#ef4444" fontWeight="bold">HOT</text>
        
        <rect x="45" y="85" width="25" height="6" fill="#fef9e2" rx="1" stroke="#f59e0b" strokeWidth="0.5"/>
        <text x="57" y="89" textAnchor="middle" fontSize="3" fill="#f59e0b" fontWeight="bold">PRESSURE</text>
        
        {/* Brand label */}
        <rect x="75" y="85" width="25" height="6" fill="#f7fafc" rx="1" stroke="#cbd5e0" strokeWidth="0.5"/>
        <text x="87" y="89" textAnchor="middle" fontSize="3" fill="#2d3748" fontWeight="bold">TUTTNAUER</text>
        
        {/* Base/feet */}
        <rect x="10" y="95" width="110" height="12" fill="url(#baseGradient)" rx="6" stroke="#2d3748" strokeWidth="1"/>
        
        {/* Internal rack (visible through window when active) */}
        {(isActive || isSolved) && (
          <g opacity="0.7">
            <rect x="35" y="45" width="10" height="1" fill="#9ca3af"/>
            <rect x="35" y="50" width="10" height="1" fill="#9ca3af"/>
            <rect x="35" y="55" width="10" height="1" fill="#9ca3af"/>
          </g>
        )}
        
        {/* Items being sterilized */}
        {(isActive || isSolved) && (
          <g opacity="0.8">
            <rect x="36" y="46" width="2" height="3" fill="#cbd5e0" rx="0.5"/>
            <rect x="39" y="46" width="2" height="3" fill="#cbd5e0" rx="0.5"/>
            <rect x="42" y="46" width="2" height="3" fill="#cbd5e0" rx="0.5"/>
          </g>
        )}
        
        <defs>
          <linearGradient id="autoclaveBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7fafc"/>
            <stop offset="100%" stopColor="#e2e8f0"/>
          </linearGradient>
          <linearGradient id="autoclaveDoor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#edf2f7"/>
            <stop offset="100%" stopColor="#cbd5e0"/>
          </linearGradient>
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff"/>
            <stop offset="100%" stopColor="#dbeafe"/>
          </linearGradient>
          <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </linearGradient>
          <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568"/>
            <stop offset="100%" stopColor="#2d3748"/>
          </linearGradient>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9fafb"/>
            <stop offset="100%" stopColor="#e5e7eb"/>
          </linearGradient>
          <linearGradient id="tempGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7"/>
            <stop offset="100%" stopColor="#fcd34d"/>
          </linearGradient>
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568"/>
            <stop offset="100%" stopColor="#2d3748"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-md">
          ♨️ STEAM AUTOCLAVE
        </div>
        {isSolved && <div className="text-xs text-green-600 mt-1">✓ Sterilization Complete</div>}
        {isActive && !isSolved && <div className="text-xs text-yellow-600 mt-1">⚡ Sterilizing at 121°C</div>}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-xl">
          {isSolved 
            ? "Equipment successfully sterilized" 
            : isActive 
            ? "Sterilizing instruments at 121°C, 15 PSI..." 
            : "Click to verify sterilization protocols"
          }
        </div>
      )}
    </div>
  )
}
