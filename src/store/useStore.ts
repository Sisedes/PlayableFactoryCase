import { create } from 'zustand';
import { 
  getAllProducts, 
  getProductById, 
  getPopularProducts,
  getLatestProducts,
  getAllCategories,
  ProductFilters 
} from '@/services';
import { Product, Category } from '@/types';

// Store State
interface StoreState {
  // Data
  categories: Category[];
  products: Product[];
  popularProducts: Product[];
  latestProducts: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  
  // Loading states
  categoriesLoading: boolean;
  productsLoading: boolean;
  popularLoading: boolean;
  latestLoading: boolean;
  productLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Pagination & filters
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  currentFilters: ProductFilters;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchPopularProducts: (limit?: number) => Promise<void>;
  fetchLatestProducts: (limit?: number) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  updateFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
  resetProducts: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  categories: [],
  products: [],
  popularProducts: [],
  latestProducts: [],
  currentProduct: null,
  relatedProducts: [],
  categoriesLoading: false,
  productsLoading: false,
  popularLoading: false,
  latestLoading: false,
  productLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  currentFilters: {},

  // Actions
  fetchCategories: async () => {
    set({ categoriesLoading: true, error: null });
    try {
      const response = await getAllCategories();
      
      if (response.success) {
        set({ categories: response.data as Category[] });
      } else {
        set({ error: response.message || 'Kategoriler yüklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      set({ error: error instanceof Error ? error.message : 'Bağlantı hatası oluştu' });
    } finally {
      set({ categoriesLoading: false });
    }
  },

  fetchProducts: async (filters = {}) => {
    set({ productsLoading: true, error: null });
    try {
      const currentFilters = { ...get().currentFilters, ...filters };
      const response = await getAllProducts(currentFilters);
      
      if (response.success) {
        set({ 
          products: response.data as Product[],
          currentPage: response.currentPage || 1,
          totalPages: response.pages || 1,
          totalProducts: response.total || 0,
          currentFilters
        });
      } else {
        set({ error: response.message || 'Ürünler yüklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Products fetch error:', error);
      set({ error: error instanceof Error ? error.message : 'Bağlantı hatası oluştu' });
    } finally {
      set({ productsLoading: false });
    }
  },

  fetchPopularProducts: async (limit = 8) => {
    set({ popularLoading: true, error: null });
    try {
      const response = await getPopularProducts(limit);
      
      if (response.success) {
        set({ popularProducts: response.data as Product[] });
      } else {
        set({ error: response.message || 'Popüler ürünler yüklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Popular products fetch error:', error);
      set({ error: error instanceof Error ? error.message : 'Bağlantı hatası oluştu' });
    } finally {
      set({ popularLoading: false });
    }
  },

  fetchLatestProducts: async (limit = 8) => {
    set({ latestLoading: true, error: null });
    try {
      const response = await getLatestProducts(limit);
      
      if (response.success) {
        set({ latestProducts: response.data as Product[] });
      } else {
        set({ error: response.message || 'En yeni ürünler yüklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Latest products fetch error:', error);
      set({ error: error instanceof Error ? error.message : 'Bağlantı hatası oluştu' });
    } finally {
      set({ latestLoading: false });
    }
  },

  fetchProductById: async (id: string) => {
    set({ productLoading: true, error: null, currentProduct: null, relatedProducts: [] });
    try {
      const response = await getProductById(id);
      
      if (response.success) {
        set({ 
          currentProduct: response.data.product as Product,
          relatedProducts: (response.data.relatedProducts as Product[]) || []
        });
      } else {
        set({ error: response.message || 'Ürün bulunamadı' });
      }
    } catch (error) {
      console.error('Product fetch error:', error);
      set({ error: error instanceof Error ? error.message : 'Bağlantı hatası oluştu' });
    } finally {
      set({ productLoading: false });
    }
  },

  updateFilters: (newFilters: Partial<ProductFilters>) => {
    const currentFilters = { ...get().currentFilters, ...newFilters };
    set({ currentFilters });
    
    // Filtreler değiştiğinde ürünleri yeniden getir
    get().fetchProducts(currentFilters);
  },

  clearFilters: () => {
    set({ currentFilters: {}, currentPage: 1 });
    get().fetchProducts({});
  },

  clearError: () => set({ error: null }),

  resetProducts: () => set({ 
    products: [], 
    currentPage: 1, 
    totalPages: 1, 
    totalProducts: 0,
    currentFilters: {}
  }),
}));