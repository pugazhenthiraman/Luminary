// Utility functions for handling course thumbnails

export const validateThumbnailUrl = (url: string): boolean => {
  if (!url || url.trim() === '') {
    return false;
  }
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path or data URL
    return url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:');
  }
};

export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!validateThumbnailUrl(url)) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

export const getThumbnailWithFallback = async (thumbnail: string, courseTitle: string): Promise<string> => {
  if (!thumbnail || thumbnail.trim() === '') {
    console.log(`[Thumbnail] No thumbnail provided for course: ${courseTitle}`);
    return '';
  }
  
  const isValid = await preloadImage(thumbnail);
  if (!isValid) {
    console.warn(`[Thumbnail] Failed to load thumbnail for course: ${courseTitle}, URL: ${thumbnail}`);
    return '';
  }
  
  console.log(`[Thumbnail] Successfully validated thumbnail for course: ${courseTitle}`);
  return thumbnail;
};

// Test function to check all thumbnails
export const testAllThumbnails = async (courses: any[]) => {
  console.log('[Thumbnail Test] Starting thumbnail validation for all courses...');
  
  for (const course of courses) {
    if (course.thumbnail) {
      console.log(`[Thumbnail Test] Testing ${course.title}: ${course.thumbnail}`);
      const isValid = await preloadImage(course.thumbnail);
      console.log(`[Thumbnail Test] ${course.title}: ${isValid ? 'VALID' : 'INVALID'}`);
    } else {
      console.log(`[Thumbnail Test] ${course.title}: NO THUMBNAIL`);
    }
  }
  
  console.log('[Thumbnail Test] Completed thumbnail validation');
};
