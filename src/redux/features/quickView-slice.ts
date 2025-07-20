import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState = {
  value: {
    _id: "",
    name: "",
    slug: "",
    description: "",
    category: {
      _id: "",
      name: "",
      slug: ""
    },
    price: 0,
    salePrice: 0,
    sku: "",
    stock: 0,
    images: [],
    status: 'active' as const,
    createdAt: "",
    updatedAt: "",
    averageRating: 0,
    reviewCount: 0,
    viewCount: 0
  } as Product,
} as InitialState;

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
