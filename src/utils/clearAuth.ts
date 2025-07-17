// Auth temizleme utility'si
// Bu dosya sadece import edildiğinde çalışan kod içerir

// Storage event listener'ı ekle
if (typeof window !== 'undefined') {
  // Sayfa yenilendiğinde auth durumunu kontrol et
  window.addEventListener('beforeunload', () => {
    console.log('Sayfa yenileniyor, auth durumu korunuyor...');
  });

  // Storage değişikliklerini dinle
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_token' && !event.newValue) {
      console.log('Auth token silindi, kullanıcı çıkış yapıyor...');
      // Auth store'u temizle
      if (window.localStorage.getItem('auth_user')) {
        window.localStorage.removeItem('auth_user');
      }
    }
  });

  // Sayfa yüklendiğinde auth durumunu geri yükle
  const restoreAuthOnReload = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    if (token && user) {
      console.log('Auth durumu geri yüklendi');
    }
  };

  // DOM yüklendiğinde çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreAuthOnReload);
  } else {
    restoreAuthOnReload();
  }
} 