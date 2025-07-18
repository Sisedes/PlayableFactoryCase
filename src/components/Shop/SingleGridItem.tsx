"use client";
import React from "react";
import { Product } from "@/types/product";
import ProductItem from "@/components/Common/ProductItem";

const SingleGridItem = ({ item }: { item: Product }) => {
  return <ProductItem item={item} />;
};

export default SingleGridItem;
