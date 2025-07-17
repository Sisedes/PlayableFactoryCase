"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  preserveAuth?: boolean; // Auth durumunu korumak için
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Error Boundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Otomatik retry mekanizması
    if (this.state.hasError && !prevState.hasError && this.state.retryCount < 3) {
      this.retryTimeout = setTimeout(() => {
        console.log(`Error boundary retry attempt ${this.state.retryCount + 1}`);
        this.setState({ 
          hasError: false, 
          error: undefined, 
          errorInfo: undefined,
          retryCount: this.state.retryCount + 1 
        });
      }, 2000);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1 
    });
  };

  handleReload = () => {
    // Auth durumunu korumak için localStorage'ı kontrol et
    if (this.props.preserveAuth) {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('authUser');
      
      if (token && user) {
        console.log('Auth korunarak sayfa yenileniyor...');
      }
    }
    
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Oops! Bir şeyler ters gitti
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
              </p>
              {this.state.retryCount > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Otomatik yeniden deneme: {this.state.retryCount}/3
                </p>
              )}
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={this.handleRetry}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
              >
                Tekrar Dene
              </button>
              
              <button
                onClick={this.handleReload}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-dark hover:bg-dark-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark"
              >
                Sayfayı Yenile
              </button>
              
              <Link
                href="/"
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark"
              >
                Ana Sayfaya Dön
              </Link>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-500">
                  Hata Detayları (Geliştirici Modu)
                </summary>
                <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-200">
                  <p className="text-sm text-red-800 font-medium">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 text-xs text-red-600 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 