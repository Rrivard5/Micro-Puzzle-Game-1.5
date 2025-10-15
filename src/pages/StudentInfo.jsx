import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export default function StudentInfo() {
  const [studentData, setStudentData] = useState({
    name: '',
    semester: '',
    year: new Date().getFullYear(),
    groupNumber: '',
    playingContext: 'class'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setStudentInfo } = useGame();

  const validateForm = () => {
    const newErrors = {};
    
    if (!studentData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!studentData.semester.trim()) {
      newErrors.semester = 'Semester is required';
    }
    
    if (!studentData.year.toString().trim()) {
      newErrors.year = 'Year is required';
    } else if (isNaN(studentData.year) || studentData.year < 2020 || studentData.year > 2030) {
      newErrors.year = 'Please enter a valid year (2020-2030)';
    }
    
    if (!studentData.groupNumber.toString().trim()) {
      newErrors.groupNumber = 'Group number is required';
    } else if (isNaN(studentData.groupNumber) || studentData.groupNumber < 1 || studentData.groupNumber > 50) {
      newErrors.groupNumber = 'Please enter a valid group number (1-50)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = (e) => {
  e.preventDefault();
  
  if (validateForm()) {
    setIsSubmitting(true);
    
    const studentInfo = {
      ...studentData,
      sessionId: Date.now(),
      startTime: new Date().toISOString()
    };
    
    // Save to localStorage FIRST
    localStorage.setItem('current-student-info', JSON.stringify(studentInfo));
    
    // Set in context
    setStudentInfo(studentInfo);
    
    // Clear any previous game data (but NOT current-student-info)
    localStorage.removeItem('microbiology-lab-progress');
    
    // Navigate to PPE Room - reduced timeout for better UX
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/ppe-room');
    }, 100);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-200">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧪</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Microbiology Lab Access
          </h1>
          <p className="text-gray-600">
            Please enter your information before entering the laboratory
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={studentData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <select
                name="semester"
                value={studentData.semester}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.semester ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select semester</option>
                <option value="Spring">Spring</option>
                <option value="Fall">Fall</option>
                <option value="Summer">Summer</option>
              </select>
              {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={studentData.year}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2024"
                min="2020"
                max="2030"
                disabled={isSubmitting}
              />
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Number *
            </label>
            <input
              type="number"
              name="groupNumber"
              value={studentData.groupNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.groupNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your group number"
              min="1"
              max="50"
              disabled={isSubmitting}
            />
            {errors.groupNumber && <p className="mt-1 text-sm text-red-600">{errors.groupNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you playing? *
            </label>
            <div className="space-y-2">
              <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                studentData.playingContext === 'class' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-blue-300'
              }`}>
                <input
                  type="radio"
                  name="playingContext"
                  value="class"
                  checked={studentData.playingContext === 'class'}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-blue-600"
                  disabled={isSubmitting}
                />
                <div>
                  <div className="font-medium text-gray-900">With my class</div>
                  <div className="text-sm text-gray-600">
                    Participate in group word scramble challenge
                  </div>
                </div>
              </label>
              
              <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                studentData.playingContext === 'individual' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-blue-300'
              }`}>
                <input
                  type="radio"
                  name="playingContext"
                  value="individual"
                  checked={studentData.playingContext === 'individual'}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-blue-600"
                  disabled={isSubmitting}
                />
                <div>
                  <div className="font-medium text-gray-900">Individual practice</div>
                  <div className="text-sm text-gray-600">
                    Practice alone without class collaboration
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
            } text-white`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Entering Laboratory...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Enter Laboratory
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By entering the laboratory, you agree to follow all safety protocols 
            and complete the investigation thoroughly.
          </p>
        </div>
      </div>
    </div>
  );
}
