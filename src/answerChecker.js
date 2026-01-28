import { pipeline, env } from '@huggingface/transformers';

// Configure Transformers.js to always download fresh (no cache)
env.allowLocalModels = false;
env.useBrowserCache = false; // DISABLED - always download fresh
env.remoteHost = 'https://huggingface.co';
env.remotePathTemplate = '{model}/resolve/{revision}/';

// Add logging for debugging
console.log('Transformers.js environment:', {
  allowLocalModels: env.allowLocalModels,
  useBrowserCache: env.useBrowserCache,
  remoteHost: env.remoteHost,
  remotePathTemplate: env.remotePathTemplate
});

// Singleton pattern for the embedding model
let embeddingPipeline = null;
let isLoading = false;
let loadingPromise = null;
let loadingFailed = false; // Track if loading has failed

/**
 * Initialize the embedding model (lazy loading)
 */
async function initializeModel() {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }
  
  // Don't retry if loading has already failed
  if (loadingFailed) {
    throw new Error('Model loading previously failed. Please refresh the page to retry.');
  }
  
  if (isLoading) {
    return loadingPromise;
  }
  
  isLoading = true;
  loadingPromise = (async () => {
    try {
      console.log('Starting to load model: Xenova/all-MiniLM-L6-v2');
      
      // Use a small, efficient model for embeddings
      // all-MiniLM-L6-v2 is ~23MB and works well for semantic similarity
      embeddingPipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        {
          quantized: true,
          revision: 'main',
          progress_callback: (progress) => {
            console.log('Model loading progress:', progress);
          }
        }
      );
      console.log('Answer checker model loaded successfully');
      isLoading = false;
      return embeddingPipeline;
    } catch (error) {
      console.error('Failed to load answer checker model:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      isLoading = false;
      loadingFailed = true; // Mark as failed, don't retry
      loadingPromise = null;
      embeddingPipeline = null;
      throw error;
    }
  })();
  
  return loadingPromise;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Get embedding for a text string
 */
async function getEmbedding(text) {
  const model = await initializeModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Normalize text for comparison
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if the user's answer is semantically similar to the correct answer
 * @param {string} userAnswer - The user's submitted answer
 * @param {string} correctAnswer - The correct answer
 * @param {number} threshold - Similarity threshold (0-1), default 0.75
 * @returns {Promise<{isCorrect: boolean, similarity: number, confidence: string}>}
 */
export async function checkAnswer(userAnswer, correctAnswer, threshold = 0.75) {
  try {
    // Normalize both answers
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);
    
    // Exact match check (after normalization)
    if (normalizedUser === normalizedCorrect) {
      return {
        isCorrect: true,
        similarity: 1.0,
        confidence: 'high',
        method: 'exact'
      };
    }
    
    // If answers are very short, use string similarity instead of embeddings
    if (normalizedUser.length < 5 || normalizedCorrect.length < 5) {
      const similarity = calculateStringsimilarity(normalizedUser, normalizedCorrect);
      return {
        isCorrect: similarity > 0.8,
        similarity,
        confidence: similarity > 0.9 ? 'high' : similarity > 0.8 ? 'medium' : 'low',
        method: 'string'
      };
    }
    
    // Get embeddings for both answers
    const [userEmbedding, correctEmbedding] = await Promise.all([
      getEmbedding(normalizedUser),
      getEmbedding(normalizedCorrect)
    ]);
    
    // Calculate similarity
    const similarity = cosineSimilarity(userEmbedding, correctEmbedding);
    
    // Determine confidence level
    let confidence;
    if (similarity > 0.9) {
      confidence = 'high';
    } else if (similarity > threshold) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
    
    return {
      isCorrect: similarity >= threshold,
      similarity,
      confidence,
      method: 'embedding'
    };
  } catch (error) {
    console.error('Error checking answer:', error);
    // Fallback to simple string comparison
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);
    const similarity = calculateStringsimilarity(normalizedUser, normalizedCorrect);
    
    return {
      isCorrect: similarity > 0.8,
      similarity,
      confidence: 'low',
      method: 'fallback',
      error: error.message
    };
  }
}

/**
 * Simple string similarity using Levenshtein distance
 */
function calculateStringsimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Preload the model (call this when the app starts)
 */
export async function preloadModel() {
  try {
    await initializeModel();
    return true;
  } catch (error) {
    console.error('Failed to preload model:', error);
    return false;
  }
}

/**
 * Check if the model is ready
 */
export function isModelReady() {
  return embeddingPipeline !== null;
}

/**
 * Reset the loading state (useful if you want to retry after failure)
 */
export function resetLoadingState() {
  loadingFailed = false;
  isLoading = false;
  loadingPromise = null;
  embeddingPipeline = null;
  console.log('Model loading state reset');
}
