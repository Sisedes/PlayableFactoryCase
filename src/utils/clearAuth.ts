// Auth temizleme utility'si

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_token' && !event.newValue) {
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
    
  };

  // DOM yüklendiğinde çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreAuthOnReload);
  } else {
    restoreAuthOnReload();
  }
} 