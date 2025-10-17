// src/utils/imageLifecycleManager.js
// Comprehensive image lifecycle management for optimal memory usage
// This runs automatically in the background and manages memory efficiently

import { getImage } from './imageStorage';

class ImageLifecycleManager {
  constructor() {
    // Track currently loaded images in memory
    this.activeImages = new Map();
    
    // Track image usage timestamps
    this.imageTimestamps = new Map();
    
    // Maximum images to keep in memory at once
    this.MAX_ACTIVE_IMAGES = 3;
    
    // Auto-cleanup interval (5 seconds)
    this.CLEANUP_INTERVAL = 5000;
    
    // Start automatic cleanup
    this.startAutoCleanup();
  }

  /**
   * Load an image only when needed
   * @param {string} imageKey - The IndexedDB key for the image
   * @param {string} context - Where the image is being used (e.g., 'modal', 'notebook')
   * @returns {Promise<string>} - The image data URL
   */
  async loadImage(imageKey, context = 'unknown') {
    if (!imageKey) {
      console.warn('No image key provided');
      return null;
    }

    try {
      // Check if already in memory
      if (this.activeImages.has(imageKey)) {
        console.log(`📸 Reusing cached image: ${imageKey}`);
        this.imageTimestamps.set(imageKey, Date.now());
        return this.activeImages.get(imageKey);
      }

      // Clean up old images before loading new one
      await this.enforceMemoryLimit();

      // Load from IndexedDB
      console.log(`📥 Loading image from storage: ${imageKey} (${context})`);
      const imageData = await getImage(imageKey);
      
      if (!imageData) {
        console.warn(`❌ Image not found: ${imageKey}`);
        return null;
      }

      // Store in memory with timestamp
      this.activeImages.set(imageKey, imageData);
      this.imageTimestamps.set(imageKey, Date.now());

      console.log(`✅ Image loaded: ${imageKey} (Active: ${this.activeImages.size})`);
      return imageData;
    } catch (error) {
      console.error(`Error loading image ${imageKey}:`, error);
      return null;
    }
  }

  /**
   * Explicitly unload an image from memory
   * @param {string} imageKey - The image key to unload
   */
  unloadImage(imageKey) {
    if (this.activeImages.has(imageKey)) {
      this.activeImages.delete(imageKey);
      this.imageTimestamps.delete(imageKey);
      console.log(`🗑️ Image unloaded: ${imageKey} (Active: ${this.activeImages.size})`);
    }
  }

  /**
   * Unload multiple images at once
   * @param {string[]} imageKeys - Array of image keys to unload
   */
  unloadImages(imageKeys) {
    imageKeys.forEach(key => this.unloadImage(key));
  }

  /**
   * Clear all images from memory
   */
  clearAllActive() {
    const count = this.activeImages.size;
    this.activeImages.clear();
    this.imageTimestamps.clear();
    console.log(`🧹 Cleared ${count} images from memory`);
  }

  /**
   * Enforce memory limit by removing oldest images
   */
  async enforceMemoryLimit() {
    if (this.activeImages.size < this.MAX_ACTIVE_IMAGES) {
      return;
    }

    // Sort by timestamp (oldest first)
    const sortedImages = Array.from(this.imageTimestamps.entries())
      .sort((a, b) => a[1] - b[1]);

    // Remove oldest images until under limit
    const toRemove = sortedImages.slice(0, this.activeImages.size - this.MAX_ACTIVE_IMAGES + 1);
    
    toRemove.forEach(([key]) => {
      this.unloadImage(key);
    });
  }

  /**
   * Start automatic cleanup of old images
   */
  startAutoCleanup() {
    setInterval(() => {
      this.cleanupOldImages();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Remove images that haven't been accessed recently
   */
  cleanupOldImages() {
    const now = Date.now();
    const MAX_AGE = 30000; // 30 seconds

    const toRemove = [];
    
    this.imageTimestamps.forEach((timestamp, key) => {
      if (now - timestamp > MAX_AGE) {
        toRemove.push(key);
      }
    });

    if (toRemove.length > 0) {
      console.log(`🧹 Auto-cleanup: Removing ${toRemove.length} old images`);
      this.unloadImages(toRemove);
    }
  }

  /**
   * Get current memory status
   */
  getStatus() {
    return {
      activeImages: this.activeImages.size,
      maxImages: this.MAX_ACTIVE_IMAGES,
      imageKeys: Array.from(this.activeImages.keys())
    };
  }

  /**
   * Initialize fresh session - clear all active images
   */
  initFreshSession() {
    console.log('🆕 Initializing fresh session...');
    this.clearAllActive();
    console.log('✅ Session initialized - memory cleared');
  }
}

// Create singleton instance
const imageLifecycle = new ImageLifecycleManager();

export default imageLifecycle;

// Export helper functions
export const loadImage = (key, context) => imageLifecycle.loadImage(key, context);
export const unloadImage = (key) => imageLifecycle.unloadImage(key);
export const unloadImages = (keys) => imageLifecycle.unloadImages(keys);
export const clearAllImages = () => imageLifecycle.clearAllActive();
export const initFreshSession = () => imageLifecycle.initFreshSession();
export const getImageStatus = () => imageLifecycle.getStatus();
