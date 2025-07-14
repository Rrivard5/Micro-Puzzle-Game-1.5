import { useState, useEffect } from 'react'
import { useGame } from '../../context/GameStateContext'

export default function Modal({ isOpen, onClose, title, equipmentType, studentGroup, onSolved }) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [equipmentImage, setEquipmentImage] = useState(null)
  
  const { trackAttempt, studentInfo } = useGame()

  useEffect(() => {
    if (isOpen && equipmentType) {
      loadEquipmentContent()
    }
  }, [isOpen, equipmentType, studentGroup])

  const loadEquipmentContent = async () => {
    setIsLoading(true)
    
    // Load question for this equipment and group
    const question = await getEquipmentQuestion(equipmentType, studentGroup)
    setCurrentQuestion(question)
    
    // Load equipment image if available
    const image = await getEquipmentImage(equipmentType, studentGroup)
    setEquipmentImage(image)
    
    setIsLoading(false)
  }

  const getEquipmentQuestion = async (equipment, group) => {
    // Load from instructor settings or use defaults
    const savedQuestions = localStorage.getItem('instructor-lab-questions')
    
    if (savedQuestions) {
      const questions = JSON.parse(savedQuestions)
      const groupQuestions = questions[equipment]?.groups?.[group] || questions[equipment]?.groups?.[1]
      if (groupQuestions && groupQuestions.length > 0) {
        return groupQuestions[0] // For now, use first question
      }
    }
    
    // Default questions for each equipment type
    return getDefaultQuestion(equipment)
  }

  const getDefaultQuestion = (equipment) => {
    const defaultQuestions = {
      microscope: {
        id: 'mic1',
        question: 'Looking at the bacterial specimen under 1000x magnification, what is the most likely shape classification of these cells?',
        type: 'multiple_choice',
        options: ['Cocci (spherical)', 'Bacilli (rod-shaped)', 'Spirilla (spiral)', 'Pleomorphic (variable)'],
        answer: 'Bacilli (rod-shaped)',
        hint: 'Look carefully at the elongated shape of the individual cells.',
        clue: 'Rod-shaped bacteria detected - likely Escherichia coli'
      },
      incubator: {
        id: 'inc1',
        question: 'The incubator display shows 37°C and 5% CO2. This environment is optimal for growing which type of microorganisms?',
        type: 'multiple_choice',
        options: ['Psychrophiles', 'Mesophiles', 'Thermophiles', 'Hyperthermophiles'],
        answer: 'Mesophiles',
        hint: 'Consider the temperature range and CO2 requirements for human pathogens.',
        clue: 'Mesophilic conditions set - optimal for human pathogens'
      },
      petriDish: {
        id: 'pet1',
        question: 'On the blood agar plate, you observe clear zones around some bacterial colonies. This indicates:',
        type: 'multiple_choice',
        options: ['Alpha hemolysis', 'Beta hemolysis', 'Gamma hemolysis', 'No hemolysis'],
        answer: 'Beta hemolysis',
        hint: 'Clear zones indicate complete breakdown of red blood cells.',
        clue: 'Beta-hemolytic bacteria identified - Streptococcus pyogenes likely'
      },
      autoclave: {
        id: 'auto1',
        question: 'For proper sterilization, the autoclave must reach what temperature and pressure for how long?',
        type: 'multiple_choice',
        options: ['121°C, 15 psi, 15 minutes', '100°C, 10 psi, 10 minutes', '134°C, 20 psi, 20 minutes', '80°C, 5 psi, 30 minutes'],
        answer: '121°C, 15 psi, 15 minutes',
        hint: 'Standard sterilization parameters for most laboratory equipment.',
        clue: 'Sterilization protocol confirmed - equipment properly decontaminated'
      },
      centrifuge: {
        id: 'cent1',
        question: 'When centrifuging blood samples, the heavier red blood cells settle at the bottom while the lighter plasma rises to the top. This separation is based on:',
        type: 'multiple_choice',
        options: ['Molecular weight', 'Density differences', 'Electrical charge', 'Surface tension'],
        answer: 'Density differences',
        hint: 'Think about what causes particles to separate when spun at high speed.',
        clue: 'Density separation principle confirmed - sample fractionation successful'
      }
    }
    
    return defaultQuestions[equipment] || {
      id: 'default',
      question
