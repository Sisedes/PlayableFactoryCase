import { createSlice } from "@reduxjs/toolkit";
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
  },
} as InitialState;

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;
