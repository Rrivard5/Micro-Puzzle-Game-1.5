// src/utils/dataMigration.js
// This file helps migrate existing localStorage data to IndexedDB

import { saveImage } from './imageStorage';

export const migrateExistingData = async () => {
  try {
    console.log('Starting data migration...');
    
    // Check if migration already done
    const migrationDone = localStorage.getItem('data-migration-v2-complete');
    if (migrationDone) {
      console.log('Migration already completed');
      return true;
    }
    
    // Migrate room images
    const savedImages = localStorage.getItem('instructor-room-images');
    if (savedImages) {
      console.log('Found room images to migrate');
      const images = JSON.parse(savedImages);
      const newMetadata = {};
      
      for (const [wall, imageData] of Object.entries(images)) {
        if (imageData.data) {
          console.log(`Migrating image for ${wall} wall...`);
          // Store in IndexedDB
          const imageKey = `room-image-${wall}-migrated`;
          await saveImage(imageKey, imageData.data);
          
          // Update metadata
          newMetadata[wall] = {
            imageKey: imageKey,
            name: imageData.name,
            hasImage: true,
            lastModified: imageData.lastModified || new Date().toISOString()
          };
        } else if (imageData.imageKey) {
          // Already migrated
          newMetadata[wall] = imageData;
        }
      }
      
      // Save new metadata
      localStorage.setItem('instructor-room-images', JSON.stringify(newMetadata));
      console.log('Room images migrated successfully');
    }
    
    // Migrate element questions with images
    const savedElements = localStorage.getItem('instructor-room-elements');
    if (savedElements) {
      console.log('Checking elements for images to migrate...');
      const elements = JSON.parse(savedElements);
      let elementsMigrated = false;
      
      for (const [elementId, element] of Object.entries(elements)) {
        if (element.content?.question?.groups) {
          for (const [groupNum, questions] of Object.entries(element.content.question.groups)) {
            if (questions && questions[0]) {
              const question = questions[0];
              
              // Migrate info image
              if (question.infoImage?.data) {
                console.log(`Migrating info image for element ${elementId} group ${groupNum}`);
                const imageKey = `element-${elementId}-g${groupNum}-info-migrated`;
                await saveImage(imageKey, question.infoImage.data);
                question.infoImage = {
                  imageKey: imageKey,
                  name: question.infoImage.name,
                  hasImage: true
                };
                elementsMigrated = true;
              }
              
              // Migrate question image
              if (question.questionImage?.data) {
                console.log(`Migrating question image for element ${elementId} group ${groupNum}`);
                const imageKey = `element-${elementId}-g${groupNum}-question-migrated`;
                await saveImage(imageKey, question.questionImage.data);
                question.questionImage = {
                  imageKey: imageKey,
                  name: question.questionImage.name,
                  hasImage: true
                };
                elementsMigrated = true;
              }
            }
          }
        }
        
        // Migrate info-only element images
        if (element.content?.infoImage?.data) {
          console.log(`Migrating info image for element ${elementId}`);
          const imageKey = `element-${elementId}-info-migrated`;
          await saveImage(imageKey, element.content.infoImage.data);
          element.content.infoImage = {
            imageKey: imageKey,
            name: element.content.infoImage.name,
            hasImage: true
          };
          elementsMigrated = true;
        }
      }
      
      if (elementsMigrated) {
        localStorage.setItem('instructor-room-elements', JSON.stringify(elements));
        console.log('Element images migrated successfully');
      }
    }
    
    // Migrate final questions
    const savedFinalQuestions = localStorage.getItem('instructor-final-questions');
    if (savedFinalQuestions) {
      console.log('Checking final questions for images to migrate...');
      const finalQuestions = JSON.parse(savedFinalQuestions);
      let finalQuestionsMigrated = false;
      
      if (finalQuestions.groups) {
        for (const [groupNum, questions] of Object.entries(finalQuestions.groups)) {
          if (questions && questions[0] && questions[0].infoImage?.data) {
            console.log(`Migrating final question image for group ${groupNum}`);
            const imageKey = `final-q-g${groupNum}-info-migrated`;
            await saveImage(imageKey, questions[0].infoImage.data);
            questions[0].infoImage = {
              imageKey: imageKey,
              name: questions[0].infoImage.name,
              hasImage: true
            };
            finalQuestionsMigrated = true;
          }
        }
      }
      
      if (finalQuestionsMigrated) {
        localStorage.setItem('instructor-final-questions', JSON.stringify(finalQuestions));
        console.log('Final question images migrated successfully');
      }
    }
    
    // Mark migration as complete
    localStorage.setItem('data-migration-v2-complete', 'true');
    console.log('✅ Data migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
};

// Function to clear old data if needed
export const clearOldImageData = () => {
  const keysToCheck = Object.keys(localStorage);
  let clearedSize = 0;
  
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && value.includes('data:image')) {
      clearedSize += value.length;
      console.log(`Found image data in ${key}, clearing...`);
      
      // Don't delete, just mark as needing migration
      if (!key.includes('-backup')) {
        localStorage.setItem(key + '-backup', 'needs-migration');
      }
    }
  });
  
  console.log(`Identified ${(clearedSize / 1024 / 1024).toFixed(2)}MB of image data to migrate`);
};
