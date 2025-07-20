import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/index";

type InitialState = {
  products: Product[];
  maxItems: number;
};

const initialState: InitialState = {
  products: [],
  maxItems: 20,
};

const loadRecentlyViewed = (): Product[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('recentlyViewedProducts');
    if (!stored) return [];
    
    const products = JSON.parse(stored);
    
    const uniqueProducts = products.filter((product: Product, index: number, self: Product[]) => 
      index === self.findIndex((p: Product) => p._id === product._id)
    );
    
    if (uniqueProducts.length !== products.length) {
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(uniqueProducts));
    }
    
    return uniqueProducts;
  } catch (error) {
    console.error('Recently viewed products yüklenirken hata:', error);
    return [];
  }
};

const saveRecentlyViewed = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('recentlyViewedProducts', JSON.stringify(products));
  } catch (error) {
    console.error('Recently viewed products kaydedilirken hata:', error);
  }
};

const cleanupDuplicateProducts = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem('recentlyViewedProducts');
    if (!stored) return;
    
    const products = JSON.parse(stored);
    
    const uniqueProducts = products.filter((product: Product, index: number, self: Product[]) => 
      index === self.findIndex((p: Product) => p._id === product._id)
    );
    
    if (uniqueProducts.length !== products.length) {
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(uniqueProducts));
      console.log(`Recently viewed products temizlendi: ${products.length} -> ${uniqueProducts.length} ürün`);
    }
  } catch (error) {
    console.error('Recently viewed products temizlenirken hata:', error);
  }
};

export const recentlyViewed = createSlice({
  name: "recentlyViewed",
  initialState: {
    ...initialState,
    products: (() => {
      cleanupDuplicateProducts();
      return loadRecentlyViewed();
    })(),
  },
  reducers: {
    addRecentlyViewed: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      
      if (!product || !product._id) {
        console.warn('Geçersiz ürün: _id bulunamadı');
        return;
      }
      
      state.products = state.products.filter(p => p._id !== product._id);
      
      state.products.unshift(product);
      
      if (state.products.length > state.maxItems) {
        state.products = state.products.slice(0, state.maxItems);
      }
      
      saveRecentlyViewed(state.products);
    },

    removeRecentlyViewed: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.products = state.products.filter(p => p._id !== productId);
      saveRecentlyViewed(state.products);
    },

    clearRecentlyViewed: (state) => {
      state.products = [];
      saveRecentlyViewed([]);
    },

    setMaxItems: (state, action: PayloadAction<number>) => {
      state.maxItems = action.payload;
      if (state.products.length > state.maxItems) {
        state.products = state.products.slice(0, state.maxItems);
        saveRecentlyViewed(state.products);
      }
    },
  },
});

export const { 
  addRecentlyViewed, 
  removeRecentlyViewed, 
  clearRecentlyViewed, 
  setMaxItems 
} = recentlyViewed.actions;

export default recentlyViewed.reducer; 