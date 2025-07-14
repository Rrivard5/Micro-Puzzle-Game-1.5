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
      {/* Realistic Incubator SVG based on the image provided */}
      <svg width="140" height="160" viewBox="0 0 140 160" className="drop-shadow-2xl">
        {/* Main body - stainless steel appearance */}
        <rect x="15" y="25" width="110" height="120" fill="url(#incubatorBody)" rx="8" stroke="#6b7280" strokeWidth="2"/>
        
        {/* Door frame */}
        <rect x="20" y="30" width="100" height="110" fill="url(#doorFrame)" rx="6" stroke="#4b5563" strokeWidth="1"/>
        
        {/* Inner door */}
        <rect x="25" y="35" width="90" height="100" fill="url(#innerDoor)" rx="4" stroke="#374151" strokeWidth="1"/>
        
        {/* Window - large viewing panel */}
        <rect x="35" y="45" width="70" height="50" fill="url(#windowGradient)" rx="4" stroke="#6b7280" strokeWidth="2"/>
        <rect x="37" y="47" width="66" height="46" fill="#e6fffa" rx="3" opacity="0.8"/>
        
        {/* Window frame cross-bars */}
        <rect x="67" y="45" width="2" height="50" fill="#6b7280"/>
        <rect x="35" y="69" width="70" height="2" fill="#6b7280"/>
        
        {/* Digital control panel */}
        <rect x="30" y="105" width="80" height="25" fill="url(#controlPanelGradient)" rx="4" stroke="#374151" strokeWidth="1"/>
        
        {/* Main display */}
        <rect x="35" y="110" width="35" height="15" fill="#000000" rx="2" stroke="#4b5563" strokeWidth="1"/>
        
        {/* Temperature display */}
        <text x="52" y="120" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} 
              fontSize="8" fontFamily="monospace" fontWeight="bold">
          {isSolved ? "37.0°C" : isActive ? "36.8°C" : "OFF"}
        </text>
        
        {/* CO2 display */}
        <rect x="75" y="110" width="30" height="8" fill="#1a1a1a" rx="1"/>
        <text x="90" y="116" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} 
              fontSize="5" fontFamily="monospace">
          {isSolved ? "CO2: 5.0%" : isActive ? "CO2: 4.8%" : "CO2: 0.0%"}
        </text>
        
        {/* Humidity display */}
        <rect x="75" y="120" width="30" height="8" fill="#1a1a1a" rx="1"/>
        <text x="90" y="126" textAnchor="middle" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} 
              fontSize="5" fontFamily="monospace">
          {isSolved ? "RH: 95%" : isActive ? "RH: 93%" : "RH: --"}
        </text>
        
        {/* Control buttons */}
        <circle cx="40" cy="125" r="3" fill="#10b981" stroke="#059669" strokeWidth="1"/>
        <circle cx="50" cy="125" r="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1"/>
        <circle cx="60" cy="125" r="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1"/>
        
        {/* Door handle assembly */}
        <rect x="115" y="85" width="8" height="25" fill="url(#handleGradient)" rx="4" stroke="#374151" strokeWidth="1"/>
        <circle cx="119" cy="97" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
        
        {/* Safety lock indicator */}
        <rect x="118" y="75" width="6" height="6" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#ef4444"} rx="1"/>
        <text x="121" y="79" textAnchor="middle" fontSize="3" fill="white">🔒</text>
        
        {/* Ventilation grilles - top */}
        <g fill="#9ca3af" opacity="0.8">
          <rect x="25" y="20" width="80" height="2" rx="1"/>
          <rect x="30" y="15" width="70" height="2" rx="1"/>
          <rect x="35" y="10" width="60" height="2" rx="1"/>
        </g>
        
        {/* Side ventilation */}
        <g fill="#9ca3af" opacity="0.6">
          <rect x="12" y="40" width="2" height="80" rx="1"/>
          <rect x="8" y="50" width="2" height="60" rx="1"/>
          <rect x="126" y="40" width="2" height="80" rx="1"/>
          <rect x="130" y="50" width="2" height="60" rx="1"/>
        </g>
        
        {/* Power/status indicators */}
        <circle cx="115" cy="35" r="4" fill={isSolved ? "#10b981" : isActive ? "#f59e0b" : "#6b7280"} stroke="#374151" strokeWidth="1">
          {isActive && <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>}
        </circle>
        
        {/* Alarm indicator */}
        <circle cx="105" cy="35" r="3" fill="#ef4444" opacity={isActive ? "1" : "0.3"}>
          {isActive && <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>}
        </circle>
        
        {/* Brand and model labels */}
        <rect x="25" y="145" width="50" height="12" fill="#f7fafc" rx="2" opacity="0.95" stroke="#cbd5e0" strokeWidth="0.5"/>
        <text x="50" y="153" textAnchor="middle" fontSize="6" fill="#374151" fontWeight="bold">THERMO SCIENTIFIC</text>
        <text x="50" y="158" textAnchor="middle" fontSize="4" fill="#6b7280">HERACELL VIOS</text>
        
        {/* Certification labels */}
        <rect x="80" y="145" width="25" height="6" fill="#10b981" rx="1"/>
        <text x="92" y="149" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">CE</text>
        
        <rect x="80" y="153" width="25" height="6" fill="#3b82f6" rx="1"/>
        <text x="92" y="157" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">ISO</text>
        
        {/* Feet/leveling adjusters */}
        <circle cx="25" cy="155" r="4" fill="url(#footGradient)"/>
        <circle cx="45" cy="155" r="4" fill="url(#footGradient)"/>
        <circle cx="95" cy="155" r="4" fill="url(#footGradient)"/>
        <circle cx="115" cy="155" r="4" fill="url(#footGradient)"/>
        
        {/* Internal shelves visible through window */}
        {(isActive || isSolved) && (
          <g opacity="0.7">
            <rect x="40" y="55" width="60" height="2" fill="#e5e7eb"/>
            <rect x="40" y="70" width="60" height="2" fill="#e5e7eb"/>
            <rect x="40" y="85" width="60" height="2" fill="#e5e7eb"/>
            
            {/* Shelf supports */}
            <rect x="38" y="53" width="2" height="6" fill="#9ca3af"/>
            <rect x="100" y="53" width="2" height="6" fill="#9ca3af"/>
            <rect x="38" y="68" width="2" height="6" fill="#9ca3af"/>
            <rect x="100" y="68" width="2" height="6" fill="#9ca3af"/>
          </g>
        )}
        
        {/* Petri dishes and cultures on shelves */}
        {(isActive || isSolved) && (
          <g opacity="0.8">
            {/* Top shelf */}
            <circle cx="50" cy="56" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.5"/>
            <circle cx="60" cy="56" r="3" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="0.5"/>
            <circle cx="70" cy="56" r="3" fill="#fecaca" stroke="#ef4444" strokeWidth="0.5"/>
            <circle cx="80" cy="56" r="3" fill="#dcfce7" stroke="#22c55e" strokeWidth="0.5"/>
            
            {/* Middle shelf */}
            <circle cx="45" cy="71" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.5"/>
            <circle cx="55" cy="71" r="3" fill="#fecaca" stroke="#ef4444" strokeWidth="0.5"/>
            <circle cx="75" cy="71" r="3" fill="#dcfce7" stroke="#22c55e" strokeWidth="0.5"/>
            <circle cx="85" cy="71" r="3" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="0.5"/>
            
            {/* Growth patterns visible when solved */}
            {isSolved && (
              <g>
                <circle cx="50" cy="56" r="1" fill="#f59e0b" opacity="0.8"/>
                <circle cx="70" cy="56" r="1.5" fill="#ef4444" opacity="0.8"/>
                <circle cx="80" cy="56" r="2" fill="#22c55e" opacity="0.8"/>
              </g>
            )}
          </g>
        )}
        
        {/* CO2 inlet/outlet ports */}
        <circle cx="20" cy="60" r="2" fill="#6b7280"/>
        <circle cx="120" cy="60" r="2" fill="#6b7280"/>
        <text x="20" y="55" textAnchor="middle" fontSize="3" fill="#6b7280">CO2</text>
        
        {/* Temperature sensor probe port */}
        <rect x="22" y="80" width="8" height="3" fill="#9ca3af" rx="1"/>
        
        <defs>
          <linearGradient id="incubatorBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc"/>
            <stop offset="50%" stopColor="#e2e8f0"/>
            <stop offset="100%" stopColor="#cbd5e0"/>
          </linearGradient>
          <linearGradient id="doorFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </linearGradient>
          <linearGradient id="innerDoor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0fff4"/>
            <stop offset="100%" stopColor="#d1fae5"/>
          </linearGradient>
          <linearGradient id="controlPanelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7280"/>
            <stop offset="100%" stopColor="#374151"/>
          </linearGradient>
          <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </linearGradient>
          <linearGradient id="footGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7280"/>
            <stop offset="100%" stopColor="#374151"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-md">
          🌡️ CO₂ INCUBATOR
        </div>
        {isSolved && <div className="text-xs text-green-600 mt-1">✓ Optimal Growth Conditions</div>}
        {isActive && !isSolved && <div className="text-xs text-yellow-600 mt-1">⚡ Stabilizing Environment</div>}
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-xl">
          {isSolved 
            ? "Mesophilic conditions achieved - optimal for human pathogens" 
            : isActive 
            ? "Maintaining 37°C, 5% CO₂, 95% humidity..." 
            : "Click to examine bacterial growth conditions"
          }
        </div>
      )}
    </div>
  )
}
