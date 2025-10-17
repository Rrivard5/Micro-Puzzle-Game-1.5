import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import { getImage } from '../utils/imageStorage'

export default function LabNotebook() {
  const [notebookEntries, setNotebookEntries] = useState([])
  const [roomElements, setRoomElements] = useState({})
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [loadedImage, setLoadedImage] = useState(null)
  
  const navigate = useNavigate()
  const { studentInfo } = useGame()

  useEffect(() => {
    loadNotebookEntries()
    loadRoomElements()
  }, [studentInfo])

  const loadRoomElements = () => {
    const savedElements = localStorage.getItem('instructor-room-elements')
    if (savedElements) {
      try {
        setRoomElements(JSON.parse(savedElements))
      } catch (error) {
        console.error('Error loading room elements:', error)
      }
    }
  }

  const loadNotebookEntries = () => {
    if (!studentInfo?.sessionId) return

    const solvedElements = JSON.parse(localStorage.getItem('solved-elements') || '{}')
    const sessionId = studentInfo.sessionId
    
    // Filter entries for this student's session and create notebook entries
    const entries = Object.entries(solvedElements)
      .filter(([key]) => key.startsWith(`${sessionId}_`))
      .map(([key, info]) => {
        const elementId = key.replace(`${sessionId}_`, '')
        return {
          elementId,
          info,
          timestamp: new Date().toISOString(),
          type: 'equipment_analysis'
        }
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    setNotebookEntries(entries)
  }

  const getElementDetails = (elementId) => {
    return roomElements[elementId] || {
      name: elementId,
      type: 'equipment',
      defaultIcon: '🔬',
      wall: 'unknown'
    }
  }

  const handleEntryClick = async (entry) => {
    setSelectedEntry(entry)
    setLoadedImage(null) // Reset image
    
    // Load the image for this entry
    const element = roomElements[entry.elementId]
    if (element) {
      try {
        let imageData = null
        
        if (element.interactionType === 'question') {
          const groupNumber = studentInfo?.groupNumber || 1
          const question = element.content?.question?.groups?.[groupNumber]?.[0] 
            || element.content?.question?.groups?.[1]?.[0]
          
          if (question?.infoImage) {
            if (question.infoImage.imageKey) {
              imageData = await getImage(question.infoImage.imageKey)
            } else if (question.infoImage.data) {
              imageData = question.infoImage.data
            }
          }
        } else if (element.interactionType === 'info') {
          if (element.content?.infoImage) {
            if (element.content.infoImage.imageKey) {
              imageData = await getImage(element.content.infoImage.imageKey)
            } else if (element.content.infoImage.data) {
              imageData = element.content.infoImage.data
            }
          }
        }
        
        setLoadedImage(imageData)
      } catch (error) {
        console.error('Error loading entry image:', error)
      }
    }
    
    setShowEntryModal(true)
  }

  const getEntryIcon = (elementId) => {
    const element = getElementDetails(elementId)
    return element.defaultIcon || '🔬'
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getWallDisplayName = (wall) => {
    const wallNames = {
      north: 'North Wall',
      east: 'East Wall', 
      south: 'South Wall',
      west: 'West Wall'
    }
    return wallNames[wall] || 'Unknown Location'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-4xl mr-4">📔</div>
              <div>
                <h1 className="text-3xl font-bold text-amber-800 mb-2">
                  Laboratory Investigation Notebook
                </h1>
                <p className="text-amber-600">
                  {studentInfo?.name} - Group {studentInfo?.groupNumber}
                </p>
                <p className="text-sm text-amber-500">
                  {studentInfo?.semester} {studentInfo?.year}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/lab')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              🔬 Return to Laboratory
            </button>
          </div>
        </div>

        {/* Investigation Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Investigation Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{notebookEntries.length}</div>
              <div className="text-sm text-blue-800">Equipment Analyzed</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(notebookEntries.map(entry => getElementDetails(entry.elementId).wall)).size}
              </div>
              <div className="text-sm text-green-800">Laboratory Areas Investigated</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {studentInfo?.groupNumber || 'N/A'}
              </div>
              <div className="text-sm text-purple-800">Research Group Number</div>
            </div>
          </div>
        </div>

        {/* Notebook Entries */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">🔍 Investigation Log</h2>
            <p className="text-gray-600 text-sm mt-1">
              Click on any entry to view detailed findings and images
            </p>
          </div>
          
          {notebookEntries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📝</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No Investigations Recorded Yet</h3>
              <p className="text-gray-500 mb-4">
                Return to the laboratory and interact with equipment to begin recording your findings.
              </p>
              <button
                onClick={() => navigate('/lab')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
              >
                🔬 Start Investigation
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {notebookEntries.map((entry, index) => {
                  const element = getElementDetails(entry.elementId)
                  return (
                    <div
                      key={`${entry.elementId}_${index}`}
                      onClick={() => handleEntryClick(entry)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getEntryIcon(entry.elementId)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800 text-lg">
                              {element.name}
                            </h3>
                            <div className="text-xs text-gray-500">
                              {getWallDisplayName(element.wall)}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                            {entry.info}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Equipment Analysis #{index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              Click to view details
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Entry Modal */}
        {showEntryModal && selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{getEntryIcon(selectedEntry.elementId)}</div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {getElementDetails(selectedEntry.elementId).name}
                      </h2>
                      <p className="text-amber-100">
                        Laboratory Investigation Results
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEntryModal(false)
                      setLoadedImage(null)
                    }}
                    className="text-white hover:text-gray-300 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">📋 Investigation Findings</h3>
                    <div className="text-sm text-gray-500">
                      Location: {getWallDisplayName(getElementDetails(selectedEntry.elementId).wall)}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 leading-relaxed">
                      {selectedEntry.info}
                    </p>
                  </div>
                </div>

                {/* Show image if loaded */}
                {loadedImage && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">🖼️ Investigation Evidence</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <img
                        src={loadedImage}
                        alt={`${selectedEntry.elementId} investigation results`}
                        className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg border-2 border-gray-300"
                      />
                    </div>
                  </div>
                )}

                {/* Equipment Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">🔧 Equipment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Equipment Type:</span>
                      <div className="text-gray-600">{getElementDetails(selectedEntry.elementId).type || 'Laboratory Equipment'}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Location:</span>
                      <div className="text-gray-600">{getWallDisplayName(getElementDetails(selectedEntry.elementId).wall)}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Investigation Type:</span>
                      <div className="text-gray-600">Equipment Analysis</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Group:</span>
                      <div className="text-gray-600">Group {studentInfo?.groupNumber}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setShowEntryModal(false)
                      setLoadedImage(null)
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all"
                  >
                    Close Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {notebookEntries.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-3">📚 Laboratory Notebook Usage</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Review Findings:</strong> Click on any entry to view detailed results and images</li>
              <li>• <strong>Track Progress:</strong> All solved equipment analyses are automatically recorded here</li>
              <li>• <strong>Reference Data:</strong> Use this notebook to review evidence before making final diagnosis</li>
              <li>• <strong>Continue Investigation:</strong> Return to the laboratory to analyze more equipment</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
