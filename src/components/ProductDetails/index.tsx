"use client";
import React, { useState, useEffect } from "react";
import { Product, ProductVariant } from "@/types";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { getImageUrl } from "@/utils/apiUtils";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addRecentlyViewed } from "@/redux/features/recentlyViewed-slice";
import { AppDispatch } from "@/redux/store";
import { cartService } from "@/services/cartService";
import StarRating from "../Common/StarRating";
import { getProductReviews } from "@/services/reviewService";
import {
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
} from "@/services/favoriteService";
import { incrementProductView } from "@/services/productService";
import { useAuth } from "@/store/authStore";
import { sortProductImages } from "@/utils/apiUtils";
import ProductRecommendations from "./ProductRecommendations";
import toast from "react-hot-toast";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [showVariantImage, setShowVariantImage] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [viewCount, setViewCount] = useState(product.viewCount || 0);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, accessToken } = useAuth();

  const tabs = [
    { id: "description", title: "Açıklama" },
    { id: "specifications", title: "Özellikler" },
    { id: "reviews", title: "Yorumlar" },
  ];

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant =
        product.variants.find((v) => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVariant);

      const defaultOptions: Record<string, string> = {};
      if (defaultVariant.options && defaultVariant.options.length > 0) {
        defaultVariant.options.forEach((option) => {
          defaultOptions[option.name] = option.value;
        });
      }
      setSelectedOptions(defaultOptions);

      if (defaultVariant.image) {
        setShowVariantImage(true);
      }
    }
  }, [product.variants]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      checkFavoriteStatus(product._id, accessToken)
        .then((response) => {
          if (response.success) {
            setIsFavorite(response.data?.isFavorite || false);
          }
        })
        .catch((error) => {
          console.error("Favori durumu kontrol edilirken hata:", error);
        });
    }
  }, [isAuthenticated, accessToken, product._id]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        setViewCount((prev) => prev + 1);

        incrementProductView(product._id).catch((error) => {
          console.error("View count artırılırken hata:", error);
          setViewCount((prev) => prev - 1);
        });
      } catch (error) {
        console.error("View count artırılırken hata:", error);
      }
    };

    incrementView();

    dispatch(addRecentlyViewed(product));
  }, [product._id, dispatch]);

  const findVariantByOptions = (
    options: Record<string, string>
  ): ProductVariant | null => {
    if (!product.variants) return null;

    return (
      product.variants.find(
        (variant) =>
          variant.options &&
          variant.options.every(
            (option) => options[option.name] === option.value
          )
      ) || null
    );
  };

  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newOptions);

    const matchingVariant = findVariantByOptions(newOptions);
    setSelectedVariant(matchingVariant);

    if (matchingVariant && matchingVariant.image) {
      setShowVariantImage(true);
    } else {
      setShowVariantImage(false);
    }
  };

  const handleSelectOriginal = () => {
    setSelectedVariant(null);
    setSelectedOptions({});
    setShowVariantImage(false);
  };

  const handleShowProductImage = () => {
    setShowVariantImage(false);
    setSelectedImage(0);
  };

  const handleShowVariantImage = () => {
    if (selectedVariant && selectedVariant.image) {
      setShowVariantImage(true);
    }
  };

  const getVariantOptions = () => {
    if (!product.variants || product.variants.length === 0) return {};

    const options: Record<string, string[]> = {};
    product.variants.forEach((variant) => {
      if (variant.options && variant.options.length > 0) {
        variant.options.forEach((option) => {
          if (!options[option.name]) {
            options[option.name] = [];
          }
          if (!options[option.name].includes(option.value)) {
            options[option.name].push(option.value);
          }
        });
      }
    });

    return options;
  };

  const getCurrentStock = () => {
    if (selectedVariant && typeof selectedVariant.stock === "number") {
      return selectedVariant.stock;
    }
    return product.stock || 0;
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.salePrice && selectedVariant.salePrice > 0
        ? selectedVariant.salePrice
        : selectedVariant.price || product.price || 0;
    }
    return product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.price || 0;
  };

  const getCurrentOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price || product.price || 0;
    }
    return product.price || 0;
  };

  const getCurrentImage = () => {
    if (showVariantImage && selectedVariant && selectedVariant.image) {
      return {
        url: selectedVariant.image,
        alt: `${product.name} - ${selectedVariant.name}`,
      };
    }

    const sortedImages = sortProductImages(product.images);
    return sortedImages[selectedImage] || sortedImages[0];
  };

  const hasVariantImage = selectedVariant && selectedVariant.image;

  const getActiveOptionName = () => {
    if (!selectedVariant) return "Orijinal";
    return (
      selectedVariant.options?.[0]?.value || selectedVariant.name || "Varyasyon"
    );
  };

  const handleAddToCart = async () => {
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      toast.error("Bu ürün stokta bulunmamaktadır!");
      return;
    }

    if (quantity > currentStock) {
      toast.error(
        `Bu üründen maksimum ${currentStock} adet sipariş verebilirsiniz. Stok yetersiz!`
      );
      return;
    }

    try {
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: quantity,
        variantId: selectedVariant?._id,
      });

      if (response.success) {
        const productTitle = selectedVariant
          ? `${product.name} - ${selectedVariant.name}`
          : product.name;

        dispatch(
          addItemToCart({
            id: product._id,
            title: productTitle,
            price: getCurrentPrice(),
            discountedPrice: getCurrentPrice(),
            quantity: quantity,
            imgs: {
              thumbnails:
                product.images?.map((img) => getImageUrl(img.url)) || [],
              previews:
                product.images?.map((img) => getImageUrl(img.url)) || [],
            },
            variant: selectedVariant
              ? {
                  id: selectedVariant._id || "",
                  name: selectedVariant.name,
                  sku: selectedVariant.sku,
                  options: selectedVariant.options,
                }
              : undefined,
          })
        );

        toast.success("Ürün sepete eklendi!");
      } else {
        toast.error("Ürün sepete eklenirken hata oluştu!");
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      if (error.message && error.message.includes("Yetersiz stok")) {
        toast.error("Stok yetersiz! Bu üründen daha fazla sipariş veremezsiniz.");
      } else {
        toast.error("Ürün sepete eklenirken hata oluştu!");
      }
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= getCurrentStock()) {
      setQuantity(newQuantity);
    }
  };

  const handleToggleFavorite = async () => {
    if (!accessToken) {
      toast.error("Favori eklemek için giriş yapmanız gerekiyor");
      return;
    }

    if (!product._id) return;

    setFavoriteLoading(true);
    try {
      let response;
      if (isFavorite) {
        response = await removeFromFavorites(product._id, accessToken);
      } else {
        response = await addToFavorites(product._id, accessToken);
      }

      if (response.success) {
        setIsFavorite(!isFavorite);
        window.dispatchEvent(new Event("favoriteUpdated"));
      } else {
        toast.error(response.message || "İşlem başarısız");
      }
    } catch (error) {
      console.error("Favori işlemi hatası:", error);
      toast.error("İşlem sırasında hata oluştu");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await getProductReviews(product._id, 1, 20);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error: any) {
      setReviewsError(error.message || "Yorumlar yüklenirken hata oluştu");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, product._id]);

  const currentPrice = getCurrentPrice();
  const currentOriginalPrice = getCurrentOriginalPrice();
  const currentStock = getCurrentStock();
  const currentImage = getCurrentImage();

  const discountPercentage =
    currentPrice && currentOriginalPrice && currentPrice < currentOriginalPrice
      ? Math.round(
          ((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100
        )
      : 0;

  const variantOptions = getVariantOptions();
  const hasVariants = product.variants && product.variants.length > 0;
  const isInStock = currentStock > 0;

  return (
    <>
      <Breadcrumb
        title={product.name}
        pages={[
          { name: "Ürünler", href: "/products" },
          {
            name: product.category.name,
            href: `/category/${product.category.slug}`,
          },
          { name: product.name },
        ]}
      />

      <section className="overflow-hidden relative pb-12 lg:pb-20 pt-8 lg:pt-16 xl:pt-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 relative">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50">
                  <Image
                    src={getImageUrl(currentImage?.url || "")}
                    alt={currentImage?.alt || product.name}
                    fill
                    className="object-contain transition-all duration-300 ease-in-out hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    priority
                    quality={90}
                  />
                </div>

                {!showVariantImage &&
                  product.images &&
                  product.images.length > 1 && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      {sortProductImages(product.images).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg border-2 transition-all duration-200 hover:border-blue-500 ${
                            index === selectedImage
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        >
                          <Image
                            fill
                            src={getImageUrl(image.url)}
                            alt={image.alt || product.name}
                            className="object-cover"
                            sizes="64px"
                            quality={80}
                          />
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  {discountPercentage > 0 && (
                    <div className="inline-flex items-center px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-full shadow-sm">
                      %{discountPercentage} İNDİRİM
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <StarRating
                    rating={product.averageRating || 0}
                    reviewCount={product.reviewCount || 0}
                    size="md"
                  />
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount || 0} değerlendirme)
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(currentPrice)}
                  </span>
                  {currentPrice < currentOriginalPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(currentOriginalPrice)}
                    </span>
                  )}
                </div>

                {hasVariants && (
                  <div className="mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Varyasyon Seçenekleri
                    </h3>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Seçenek:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleSelectOriginal}
                          className={`px-4 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-200 ${
                            !selectedVariant
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                          }`}
                        >
                          Orijinal
                        </button>
                        {Object.entries(variantOptions).map(
                          ([optionName, optionValues]) =>
                            optionValues.map((value) => (
                              <button
                                key={`${optionName}-${value}`}
                                onClick={() =>
                                  handleOptionChange(optionName, value)
                                }
                                className={`px-4 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-200 ${
                                  selectedOptions[optionName] === value
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                                }`}
                              >
                                {value}
                              </button>
                            ))
                        )}
                      </div>
                    </div>

                    {selectedVariant && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-800">
                          <span className="font-semibold">Seçilen:</span>{" "}
                          {selectedVariant.name || "Varyasyon"}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          SKU: {selectedVariant.sku || "N/A"}
                        </div>
                      </div>
                    )}

                    {!selectedVariant && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm text-green-800">
                          <span className="font-semibold">Seçilen:</span>{" "}
                          Orijinal Ürün
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          SKU: {product.sku}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-6 flex items-center gap-4 flex-wrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isInStock
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {isInStock ? `Stokta ${currentStock} adet` : "Stokta yok"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="white"
                      stroke="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {viewCount} görüntüleme
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-700">
                    Miktar:
                  </span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300 min-w-[80px] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= currentStock}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 mb-4 flex items-center justify-center gap-2 ${
                    isInStock
                      ? "bg-blue text-white hover:bg-blue- shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      : "bg-gray text-gray cursor-not-allowed"
                  }`}
                >
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="16.5" cy="18.5" r="1.5" />
                    <circle cx="9.5" cy="18.5" r="1.5" />
                    <path d="M18 16H8a1 1 0 0 1-.958-.713L4.256 6H3a1 1 0 0 1 0-2h2a1 1 0 0 1 .958.713L6.344 6H21a1 1 0 0 1 .937 1.352l-3 8A1 1 0 0 1 18 16zm-9.256-2h8.563l2.25-6H6.944z" />
                  </svg>
                  {isInStock ? "Sepete Ekle" : "Stokta Yok"}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 mb-6 flex items-center justify-center gap-2 border-2 ${
                    isFavorite
                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      : "bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600"
                  } ${favoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {favoriteLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isFavorite ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
                      />
                    </svg>
                  )}
                  {isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                </button>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    Ürün Açıklaması
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.shortDescription || product.description}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Kategori:</span>
                    <span className="font-medium text-gray-900">
                      {product.category.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium text-gray-900">
                      {selectedVariant?.sku || product.sku}
                    </span>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Etiketler:</span>
                      <span className="font-medium text-gray-900">
                        {product.tags.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">
                          Kategori
                        </span>
                        <span className="text-gray-900">
                          {product.category.name}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">SKU</span>
                        <span className="text-gray-900">
                          {selectedVariant?.sku || product.sku}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Stok</span>
                        <span className="text-gray-900">
                          {currentStock} adet
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">
                          Görüntüleme
                        </span>
                        <span className="text-gray-900">{viewCount} kez</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Fiyat</span>
                        <span className="text-gray-900">
                          {formatPrice(currentOriginalPrice)}
                        </span>
                      </div>
                      {currentPrice < currentOriginalPrice && (
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-700">
                            İndirimli Fiyat
                          </span>
                          <span className="text-red-600 font-semibold">
                            {formatPrice(currentPrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Durum</span>
                        <span
                          className={`capitalize ${
                            product.status === "active"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {product.status === "active" ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-3">
                          Yorumlar yükleniyor...
                        </p>
                      </div>
                    ) : reviewsError ? (
                      <div className="text-center py-12">
                        <div className="text-red-500 mb-4">
                          <svg
                            className="w-12 h-12 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <p className="text-gray-600">{reviewsError}</p>
                        </div>
                        <button
                          onClick={fetchReviews}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Tekrar Dene
                        </button>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Müşteri Yorumları ({reviews.length})
                          </h3>
                        </div>

                        {reviews.map((review) => (
                          <div
                            key={review._id}
                            className="border-b border-gray-200 pb-6 last:border-b-0"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {review.user?.profile?.firstName?.charAt(
                                      0
                                    ) || "K"}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {review.user?.profile?.firstName ||
                                      "İsimsiz"}{" "}
                                    {review.user?.profile?.lastName ||
                                      "Kullanıcı"}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {review.user?.email}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className="w-5 h-5"
                                  style={{
                                    fill:
                                      star <= review.rating
                                        ? "#fbbf24"
                                        : "#d1d5db",
                                    color:
                                      star <= review.rating
                                        ? "#fbbf24"
                                        : "#d1d5db",
                                  }}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-sm text-gray-600 ml-2 font-medium">
                                {review.rating}/5
                              </span>
                            </div>

                            {review.title && (
                              <h5 className="font-semibold text-gray-900 mb-2">
                                {review.title}
                              </h5>
                            )}

                            <p className="text-gray-600 leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg
                            className="w-16 h-16 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <p className="text-lg text-gray-500">
                            Bu ürün için henüz onaylanmış yorum bulunmuyor.
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            İlk yorumu siz yapın!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductRecommendations productId={product._id} />
    </>
  );
};

export default ProductDetails;
