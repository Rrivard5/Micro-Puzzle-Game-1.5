// src/utils/sessionInitializer.js
// Ensures each student starts with a clean slate

import imageLifecycle from './imageLifecycleManager';

/**
 * Initialize a fresh session for a new student
 * This clears all cached images and ensures clean memory
 */
export const initializeFreshSession = () => {
  console.log('🆕 Initializing fresh student session...');
  
  // Clear all images from memory
  imageLifecycle.initFreshSession();
  
  // Clear any temporary session data (but keep instructor settings)
  const keysToPreserve = [
    'instructor-room-images',
    'instructor-room-elements',
    'instructor-word-settings',
    'instructor-game-settings',
    'instructor-ppe-questions',
    'instructor-final-questions',
    'instructor-feedback-settings',
    'instructor-student-data',
    'instructor-content-categories',
    'instructor-authenticated',
    'data-migration-v2-complete'
  ];
  
  // Clear student-specific session data
  localStorage.removeItem('microbiology-lab-progress');
  localStorage.removeItem('solved-elements');
  
  console.log('✅ Fresh session initialized - memory cleared');
  console.log('📊 Image Status:', imageLifecycle.getStatus());
};

/**
 * Check if this is a new session and initialize if needed
 */
export const checkAndInitializeSession = (studentInfo) => {
  const lastSessionId = localStorage.getItem('last-session-id');
  const currentSessionId = studentInfo?.sessionId;
  
  if (!currentSessionId) {
    console.warn('⚠️ No session ID found');
    return;
  }
  
  // If this is a different session, initialize fresh
  if (lastSessionId !== currentSessionId.toString()) {
    console.log('🔄 New session detected - initializing fresh');
    initializeFreshSession();
    localStorage.setItem('last-session-id', currentSessionId.toString());
  } else {
    console.log('📝 Continuing existing session');
  }
};

/**
 * Clean up session on exit
 */
export const cleanupSession = () => {
  console.log('🧹 Cleaning up session...');
  imageLifecycle.clearAllActive();
  console.log('✅ Session cleanup complete');
};

export default {
  initializeFreshSession,
  checkAndInitializeSession,
  cleanupSession
};
