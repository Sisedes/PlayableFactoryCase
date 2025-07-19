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

// localStorage'dan verileri getir
const loadRecentlyViewed = (): Product[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('recentlyViewedProducts');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Recently viewed products yüklenirken hata:', error);
    return [];
  }
};

// localStorage'a verileri kaydet
const saveRecentlyViewed = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('recentlyViewedProducts', JSON.stringify(products));
  } catch (error) {
    console.error('Recently viewed products kaydedilirken hata:', error);
  }
};

export const recentlyViewed = createSlice({
  name: "recentlyViewed",
  initialState: {
    ...initialState,
    products: loadRecentlyViewed(),
  },
  reducers: {
    addRecentlyViewed: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      
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