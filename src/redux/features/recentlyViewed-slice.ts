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
    if (!stored) return [];
    
    const products = JSON.parse(stored);
    
    // Duplicate ürünleri temizle (aynı _id'ye sahip olanları)
    const uniqueProducts = products.filter((product: Product, index: number, self: Product[]) => 
      index === self.findIndex((p: Product) => p._id === product._id)
    );
    
    // Eğer temizlenmiş liste farklıysa localStorage'ı güncelle
    if (uniqueProducts.length !== products.length) {
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(uniqueProducts));
    }
    
    return uniqueProducts;
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

// Mevcut localStorage'daki duplicate ürünleri temizle
const cleanupDuplicateProducts = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem('recentlyViewedProducts');
    if (!stored) return;
    
    const products = JSON.parse(stored);
    
    // Duplicate ürünleri temizle (aynı _id'ye sahip olanları)
    const uniqueProducts = products.filter((product: Product, index: number, self: Product[]) => 
      index === self.findIndex((p: Product) => p._id === product._id)
    );
    
    // Eğer temizlenmiş liste farklıysa localStorage'ı güncelle
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
      // Mevcut localStorage'daki duplicate ürünleri temizle
      cleanupDuplicateProducts();
      return loadRecentlyViewed();
    })(),
  },
  reducers: {
    addRecentlyViewed: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      
      // Ürün ID'sinin geçerli olduğundan emin ol
      if (!product || !product._id) {
        console.warn('Geçersiz ürün: _id bulunamadı');
        return;
      }
      
      // Aynı ürün daha önce görüntülenmişse, eski kaydını sil
      // Bu sayede aynı ürün tekrar görüntülendiğinde eski geçmiş silinir
      state.products = state.products.filter(p => p._id !== product._id);
      
      // Yeni ürünü listenin başına ekle (en son görüntülenen)
      state.products.unshift(product);
      
      // Maksimum ürün sayısını aşarsa, en eski ürünleri sil
      if (state.products.length > state.maxItems) {
        state.products = state.products.slice(0, state.maxItems);
      }
      
      // Değişiklikleri localStorage'a kaydet
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