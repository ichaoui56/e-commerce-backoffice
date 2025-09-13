export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
  
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
  
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
  
        canvas.width = width
        canvas.height = height
  
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
  
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          "image/jpeg",
          quality,
        )
      }
  
      img.src = URL.createObjectURL(file)
    })
  }
  
  export function getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    // If using Next.js Image component, it will handle optimization automatically
    // This is a fallback for manual URL construction if needed
    if (!originalUrl) return originalUrl
  
    // For Pinata, we can add query parameters for optimization if they support it
    // Otherwise, rely on Next.js Image optimization
    return originalUrl
  }
  