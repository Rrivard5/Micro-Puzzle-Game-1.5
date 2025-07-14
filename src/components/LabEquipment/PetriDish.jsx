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
