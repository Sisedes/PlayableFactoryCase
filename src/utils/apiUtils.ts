export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/uploads/')) {
    return `${getApiBaseUrl()}${imagePath}`;
  }
  
  return imagePath;
}; 