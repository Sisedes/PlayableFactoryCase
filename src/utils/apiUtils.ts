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

export const handleApiError = (error: any, defaultMessage: string = 'Bir hata oluştu') => {
  console.error('API Error:', error);
  
  if (error.message?.includes('429')) {
    return 'Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin.';
  }
  
  if (error.message?.includes('404')) {
    return 'İstenen kaynak bulunamadı.';
  }
  
  if (error.message?.includes('500')) {
    return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
  }
  
  if (error.message?.includes('401')) {
    return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
  }
  
  if (error.message?.includes('403')) {
    return 'Bu işlem için yetkiniz bulunmuyor.';
  }
  
  return error.message || defaultMessage;
};

export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      if (error.message?.includes('429')) {
        const delay = baseDelay * Math.pow(2, attempt - 1); 
        console.warn(`Rate limit hit, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}; 