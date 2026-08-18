/**
 * Utility for handling AI OCR interactions with retry logic.
 */

/**
 * Attempts to parse a receipt image using the AI OCR endpoint.
 * Implements exponential backoff retry logic.
 * 
 * @param {File|Blob} imageFile - The receipt image
 * @param {Object} options - Options including crop coordinates if the user manually cropped
 * @param {number} retries - Number of remaining retries
 * @returns {Promise<Object>} Parsed receipt data
 */
export async function parseReceiptOCR(imageFile, options = { cropped: false }, retries = 2) {
  try {
    console.log(`Sending image to OCR API... (Cropped: ${options.cropped})`)
    
    // Simulate API call
    const response = await simulateOcrApiCall(imageFile, options)
    
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return await response.json()
  } catch (error) {
    console.error(`OCR Failed: ${error.message}. Retries left: ${retries}`)
    
    if (retries > 0) {
      const backoffTime = (3 - retries) * 1000 // 1s, 2s...
      console.log(`Retrying in ${backoffTime}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, backoffTime))
      return parseReceiptOCR(imageFile, options, retries - 1)
    } else {
      // Out of retries. We suggest the user to crop the image manually.
      throw new Error('OCR_FAILED_SUGGEST_CROP')
    }
  }
}

/**
 * Helper to simulate an unstable AI OCR API call.
 */
function simulateOcrApiCall(file, options) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // If the user cropped the image, accuracy is 100%
      if (options.cropped) {
        resolve({
          ok: true,
          json: async () => ({ total: 1250.50, items: [] })
        })
        return
      }

      // If uncropped, simulate a 60% failure rate
      if (Math.random() < 0.6) {
        resolve({ ok: false, statusText: 'AI Parsing Error (Image too noisy)' })
      } else {
        resolve({
          ok: true,
          json: async () => ({ total: 1250.50, items: [] })
        })
      }
    }, 1000)
  })
}
