"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/store/authStore";
import Image from "next/image";
import {
  getAllProductsForAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  bulkUpdateProducts,
} from "@/services/productService";
import { sortProductImages } from "@/utils/apiUtils";
import { getAllCategoriesForAdmin } from "@/services/categoryService";
import toast from "react-hot-toast";

interface LocalCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

interface LocalProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  salePrice?: number;
  currency?: string;
  sku: string;
  stock: number;
  trackQuantity?: boolean;
  lowStockThreshold?: number;
  images: Array<{
    _id?: string;
    url: string;
    alt: string;
    isMain?: boolean;
    isPrimary?: boolean;
  }>;
  variants?: Array<{
    _id?: string;
    name: string;
    options: Array<{
      name: string;
      value: string;
    }>;
    sku: string;
    price?: number;
    stock: number;
    image?: string;
    isDefault: boolean;
  }>;
  tags?: string[];
  status: "draft" | "active" | "inactive";
  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

const AdminManageProducts = () => {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<LocalProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: "activate" | "deactivate" | "delete";
    productIds: string[];
    isSingle?: boolean;
  } | null>(null);

  const [selectedMainImageIndex, setSelectedMainImageIndex] =
    useState<number>(0);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] =
    useState<LocalProduct | null>(null);
  const [editingVariant, setEditingVariant] = useState<{
    index: number;
    variant: any;
  } | null>(null);
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState<{
    index: number;
    variant: any;
  } | null>(null);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: "",
    options: [{ name: "", value: "" }],
    sku: "",
    price: 0,
    salePrice: 0,
    stock: 0,
    image: "",
    isDefault: false,
  });
  const [variantImage, setVariantImage] = useState<File | null>(null);
  const [variantImagePreview, setVariantImagePreview] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      setLoading(true);
      setError(null);

      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          getAllCategoriesForAdmin(accessToken).catch((error) => {
            console.error("Kategoriler yüklenirken hata:", error);
            return {
              success: false,
              data: [],
              message: "Kategoriler yüklenemedi",
            };
          }),
          getAllProductsForAdmin({}, accessToken).catch((error) => {
            console.error("Ürünler yüklenirken hata:", error);
            return { success: false, data: [], message: "Ürünler yüklenemedi" };
          }),
        ]);

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        } else {
          setCategories([]);
          if (categoriesResponse.message) {
            toast.error(categoriesResponse.message);
          }
        }

        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        } else {
          setProducts([]);
          if (productsResponse.message) {
            toast.error(productsResponse.message);
          }
        }
      } catch (error) {
        const errorMessage = "Veriler yüklenirken beklenmeyen bir hata oluştu";
        setError(errorMessage);
        setCategories([]);
        setProducts([]);
        toast.error(errorMessage);
        console.error("Veri yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter((product) => product.category._id === categoryId)
      .length;
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      return newSelection;
    });
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (!accessToken || selectedProducts.length === 0) {
      toast.error("Lütfen işlem yapmak için ürün seçin");
      return;
    }

    setPendingAction({
      action,
      productIds: [...selectedProducts],
    });
    setShowConfirmModal(true);
  };

  const confirmBulkAction = async () => {
    if (!pendingAction || !accessToken) return;

    setShowConfirmModal(false);

    if (pendingAction.isSingle) {
      setDeleteLoading(pendingAction.productIds[0]);
    } else {
      setBulkActionLoading(true);
    }

    try {
      let response;

      if (pendingAction.isSingle && pendingAction.action === "delete") {
        response = await deleteProductAdmin(
          pendingAction.productIds[0],
          accessToken
        );
      } else {
        response = await bulkUpdateProducts(
          pendingAction.productIds,
          pendingAction.action,
          accessToken
        );
      }

      if (response.success) {
        toast.success(response.message);
        if (!pendingAction.isSingle) {
          setSelectedProducts([]);
        }

        const productsResponse = await getAllProductsForAdmin({}, accessToken);
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
      } else {
        toast.error(response.message || "İşlem başarısız");
      }
    } catch (error) {
      toast.error(
        pendingAction.isSingle
          ? "Ürün silinirken hata oluştu"
          : "Toplu işlem sırasında hata oluştu"
      );
      console.error("İşlem hatası:", error);
    } finally {
      if (pendingAction.isSingle) {
        setDeleteLoading(null);
      } else {
        setBulkActionLoading(false);
      }
      setPendingAction(null);
    }
  };

  const cancelBulkAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} geçerli bir resim dosyası değil`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} çok büyük (maksimum 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setNewImages((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviewUrls((prev) => [...prev, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });

      toast.success(`${validFiles.length} resim yüklendi`);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    toast.success("Resim kaldırıldı");
  };

  const removeExistingImage = (imageId: string, imageName: string) => {
    if (confirm(`"${imageName}" resmini silmek istediğinizden emin misiniz?`)) {
      setDeletedImageIds((prev) => [...prev, imageId]);

      if (editProduct) {
        const availableImages = editProduct.images.filter(
          (img) =>
            !deletedImageIds.includes(img._id || "") && img._id !== imageId
        );
        if (
          availableImages.length > 0 &&
          selectedMainImageIndex >= availableImages.length
        ) {
          setSelectedMainImageIndex(0);
        }
      }

      toast.success("Resim silme listesine eklendi");
    }
  };

  const clearImageStates = () => {
    setNewImages([]);
    setImagePreviewUrls([]);
    setSelectedMainImageIndex(0);
    setDeletedImageIds([]);
    setNewTags([]);
    setNewTagInput("");
  };

  const addNewTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !newTags.includes(trimmedTag)) {
      setNewTags((prev) => [...prev, trimmedTag]);
      setNewTagInput("");
      toast.success("Etiket eklendi");
    } else if (newTags.includes(trimmedTag)) {
      toast.error("Bu etiket zaten mevcut");
    }
  };

  const removeNewTag = (tagToRemove: string) => {
    setNewTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    toast.success("Etiket kaldırıldı");
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewTag();
    }
  };

  const handleOpenVariantModal = (product: LocalProduct) => {
    setSelectedProductForVariant(product);
    setShowVariantModal(true);
  };

  const handleCloseVariantModal = () => {
    setShowVariantModal(false);
    setSelectedProductForVariant(null);
  };

  const handleOpenAddVariantModal = () => {
    setShowAddVariantModal(true);
  };

  const handleCloseAddVariantModal = () => {
    setShowAddVariantModal(false);
    setNewVariant({
      name: "",
      options: [{ name: "", value: "" }],
      sku: "",
      price: 0,
      salePrice: 0,
      stock: 0,
      image: "",
      isDefault: false,
    });
    setVariantImage(null);
    setVariantImagePreview("");
    setEditingVariant(null);
  };

  const handleVariantImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Geçerli bir resim dosyası seçin");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resim dosyası çok büyük (maksimum 5MB)");
      return;
    }

    setVariantImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setVariantImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    toast.success("Varyant resmi yüklendi");
  };

  const removeVariantImage = () => {
    setVariantImage(null);
    setVariantImagePreview("");
    toast.success("Varyant resmi kaldırıldı");
  };

  const handleEditVariant = (index: number, variant: any) => {
    setEditingVariant({ index, variant });
    setNewVariant({
      name: variant.name,
      options: variant.options,
      sku: variant.sku,
      price: variant.price || 0,
      salePrice: variant.salePrice || 0,
      stock: variant.stock || 0,
      image: variant.image || "",
      isDefault: variant.isDefault || false,
    });

    if (variant.image) {
      setVariantImagePreview(getImageUrl(variant.image));
    } else {
      setVariantImagePreview("");
    }
    setVariantImage(null);

    setShowAddVariantModal(true);
  };

  const handleDeleteVariant = (index: number, variant: any) => {
    setDeletingVariant({ index, variant });
    setShowDeleteVariantModal(true);
  };

  const confirmDeleteVariant = async () => {
    if (!selectedProductForVariant || !accessToken || !deletingVariant) return;

    try {
      const currentVariants = selectedProductForVariant.variants || [];
      const updatedVariants = currentVariants.filter(
        (_, i) => i !== deletingVariant.index
      );

      if (
        currentVariants[deletingVariant.index].isDefault &&
        updatedVariants.length > 0
      ) {
        updatedVariants[0].isDefault = true;
      }

      const formData = new FormData();
      formData.append("variants", JSON.stringify(updatedVariants));

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/products/${selectedProductForVariant._id}/variants`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Varyant başarıyla silindi");

        const updatedProduct = {
          ...selectedProductForVariant,
          variants: result.data?.variants || updatedVariants,
        };
        setSelectedProductForVariant(updatedProduct);

        setProducts((prev) =>
          prev.map((product) =>
            product._id === selectedProductForVariant._id
              ? updatedProduct
              : product
          )
        );
      } else {
        toast.error(result.message || "Varyant silinirken hata oluştu");
      }
    } catch (error) {
      toast.error("Varyant silinirken hata oluştu");
      console.error("Varyant silme hatası:", error);
    } finally {
      setShowDeleteVariantModal(false);
      setDeletingVariant(null);
    }
  };

  const cancelDeleteVariant = () => {
    setShowDeleteVariantModal(false);
    setDeletingVariant(null);
  };

  const handleUpdateVariant = async () => {
    if (!selectedProductForVariant || !accessToken || !editingVariant) return;

    if (!newVariant.name.trim()) {
      toast.error("Varyant adı gerekli");
      return;
    }
    if (!newVariant.sku.trim()) {
      toast.error("SKU gerekli");
      return;
    }
    if (
      newVariant.options.some((opt) => !opt.name.trim() || !opt.value.trim())
    ) {
      toast.error("Tüm seçenek alanları doldurulmalı");
      return;
    }

    try {
      const currentVariants = selectedProductForVariant.variants || [];
      const updatedVariants = [...currentVariants];

      updatedVariants[editingVariant.index] = {
        ...updatedVariants[editingVariant.index],
        name: newVariant.name,
        options: newVariant.options,
        sku: newVariant.sku,
        price: newVariant.price,
        stock: newVariant.stock,
        isDefault: newVariant.isDefault,
      };

      if (newVariant.isDefault) {
        updatedVariants.forEach((variant, i) => {
          if (i !== editingVariant.index) {
            variant.isDefault = false;
          }
        });
      }

      const formData = new FormData();
      formData.append("variants", JSON.stringify(updatedVariants));

      if (variantImage) {
        formData.append(`variant-${editingVariant.index}`, variantImage);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/products/${selectedProductForVariant._id}/variants`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Varyant başarıyla güncellendi");
        handleCloseAddVariantModal();
        setEditingVariant(null);

        const updatedProduct = {
          ...selectedProductForVariant,
          variants: result.data?.variants || updatedVariants,
        };
        setSelectedProductForVariant(updatedProduct);

        setProducts((prev) =>
          prev.map((product) =>
            product._id === selectedProductForVariant._id
              ? updatedProduct
              : product
          )
        );
      } else {
        toast.error(result.message || "Varyant güncellenirken hata oluştu");
      }
    } catch (error) {
      toast.error("Varyant güncellenirken hata oluştu");
      console.error("Varyant güncelleme hatası:", error);
    }
  };

  const addVariantOption = () => {
    setNewVariant((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", value: "" }],
    }));
  };

  const removeVariantOption = (index: number) => {
    setNewVariant((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateVariantOption = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    setNewVariant((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      ),
    }));
  };

  const handleSaveVariant = async () => {
    if (!selectedProductForVariant || !accessToken) return;

    if (!newVariant.name.trim()) {
      toast.error("Varyant adı gerekli");
      return;
    }
    if (!newVariant.sku.trim()) {
      toast.error("SKU gerekli");
      return;
    }
    if (
      newVariant.options.some((opt) => !opt.name.trim() || !opt.value.trim())
    ) {
      toast.error("Tüm seçenek alanları doldurulmalı");
      return;
    }

    try {
      const currentVariants = selectedProductForVariant.variants || [];
      const newVariantData = {
        name: newVariant.name,
        options: newVariant.options,
        sku: newVariant.sku,
        price: newVariant.price,
        salePrice: newVariant.salePrice,
        stock: newVariant.stock,
        isDefault: newVariant.isDefault,
      };

      if (currentVariants.length === 0) {
        newVariantData.isDefault = true;
      }

      if (newVariantData.isDefault) {
        currentVariants.forEach((variant) => {
          variant.isDefault = false;
        });
      }

      const updatedVariants = [...currentVariants, newVariantData];

      const formData = new FormData();
      formData.append("variants", JSON.stringify(updatedVariants));

      if (variantImage) {
        formData.append("variant-0", variantImage);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/products/${selectedProductForVariant._id}/variants`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Varyant başarıyla eklendi");
        handleCloseAddVariantModal();

        if (selectedProductForVariant) {
          const updatedProduct = {
            ...selectedProductForVariant,
            variants: result.data?.variants || updatedVariants,
          };
          setSelectedProductForVariant(updatedProduct);

          setProducts((prev) =>
            prev.map((product) =>
              product._id === selectedProductForVariant._id
                ? updatedProduct
                : product
            )
          );
        }
      } else {
        toast.error(result.message || "Varyant eklenirken hata oluştu");
      }
    } catch (error) {
      toast.error("Varyant eklenirken hata oluştu");
      console.error("Varyant ekleme hatası:", error);
    }
  };

  const handleSaveProduct = async () => {
    if (!editProduct || !accessToken) return;

    try {
      const formData = new FormData();

      const form = document.getElementById(
        "edit-product-form"
      ) as HTMLFormElement;
      if (!form) return;

      const formElements = form.elements;

      const updateData: any = {
        name:
          (formElements.namedItem("name") as HTMLInputElement)?.value ||
          editProduct.name,
        description:
          (formElements.namedItem("description") as HTMLTextAreaElement)
            ?.value || editProduct.description,
        shortDescription:
          (
            formElements.namedItem("description") as HTMLTextAreaElement
          )?.value?.substring(0, 160) || editProduct.shortDescription,
        category:
          (formElements.namedItem("category") as HTMLSelectElement)?.value ||
          editProduct.category._id,
        price: parseFloat(
          (formElements.namedItem("price") as HTMLInputElement)?.value ||
            editProduct.price.toString()
        ),
        stock: parseInt(
          (formElements.namedItem("stock") as HTMLInputElement)?.value ||
            editProduct.stock.toString()
        ),
        sku:
          (formElements.namedItem("sku") as HTMLInputElement)?.value ||
          editProduct.sku,
        status:
          (formElements.namedItem("status") as HTMLSelectElement)?.value ||
          editProduct.status,
        tags: [...(editProduct.tags || []), ...newTags],
      };

      const availableImages = editProduct.images.filter(
        (img) => !deletedImageIds.includes(img._id || "")
      );

      if (
        availableImages.length > 0 &&
        selectedMainImageIndex < availableImages.length
      ) {
        availableImages.forEach((img, index) => {
          img.isPrimary = index === selectedMainImageIndex;
          img.isMain = index === selectedMainImageIndex;
        });
      }

      const newImageData = newImages.map((file, index) => ({
        url: `/uploads/products/${file.name}`, 
        alt: `${updateData.name} - Görsel ${
          availableImages.length + index + 1
        }`,
        isPrimary: availableImages.length === 0 && index === 0, 
        isMain: availableImages.length === 0 && index === 0,
        sortOrder: availableImages.length + index,
      }));

      const allImages = [...availableImages, ...newImageData];

      allImages.forEach((img, index) => {
        img.isPrimary = index === selectedMainImageIndex;
        img.isMain = index === selectedMainImageIndex;
      });

      updateData.images = allImages;

      Object.keys(updateData).forEach((key) => {
        if (key === "images") {
          formData.append("images", JSON.stringify(updateData.images));
        } else if (key === "tags") {
          formData.append("tags", JSON.stringify(updateData.tags));
        } else {
          formData.append(key, updateData[key]);
        }
      });

      newImages.forEach((file, index) => {
        formData.append("images", file);
      });

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/products/admin/${editProduct._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Ürün başarıyla güncellendi!");

        const updatedProduct = result.data;
        setProducts((prev) =>
          prev.map((product) =>
            product._id === editProduct._id
              ? {
                  ...product,
                  name: updatedProduct.name,
                  description: updatedProduct.description,
                  shortDescription: updatedProduct.shortDescription,
                  price: updatedProduct.price,
                  salePrice: updatedProduct.salePrice,
                  stock: updatedProduct.stock,
                  sku: updatedProduct.sku,
                  status: updatedProduct.status,
                  category: updatedProduct.category,
                  images: updatedProduct.images,
                  tags: updatedProduct.tags,
                  updatedAt: updatedProduct.updatedAt,
                }
              : product
          )
        );

        setEditProduct(null);
        clearImageStates();
      } else {
        toast.error(result.message || "Ürün güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Ürün güncelleme hatası:", error);
      toast.error("Ürün güncellenirken hata oluştu");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} geçerli bir resim dosyası değil`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} çok büyük (maksimum 5MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setNewImages((prev) => [...prev, ...validFiles]);

        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setImagePreviewUrls((prev) => [
                ...prev,
                e.target.result as string,
              ]);
            }
          };
          reader.readAsDataURL(file);
        });

        toast.success(`${validFiles.length} resim yüklendi`);
      }
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (!accessToken) return;

    setPendingAction({
      action: "delete",
      productIds: [productId],
      isSingle: true,
    });
    setShowConfirmModal(true);
  };

  const formatPrice = (price: number, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/images/products/default.png";
    return imageUrl.startsWith("http")
      ? imageUrl
      : `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }${imageUrl}`;
  };

  const filteredAndSearchedProducts = useMemo(() => {
    let filtered =
      selectedCategory === "all"
        ? products
        : products.filter(
            (product) => product.category._id === selectedCategory
          );

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.category?.name.toLowerCase().includes(searchLower) ||
          (product.tags &&
            product.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
      );
    }

    return filtered;
  }, [products, selectedCategory, searchTerm]);

  const totalPages = Math.ceil(
    filteredAndSearchedProducts.length / itemsPerPage
  );
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSearchedProducts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSearchedProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    setSelectedProducts([]);
  }, [selectedCategory, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredAndSearchedProducts.map((p) => p._id);
    setSelectedProducts(allFilteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Önceki
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              {" - "}
              <span className="font-medium">
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSearchedProducts.length
                )}
              </span>
              {" / "}
              <span className="font-medium">
                {filteredAndSearchedProducts.length}
              </span>{" "}
              sonuç gösteriliyor
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === page
                          ? "z-10 bg-blue text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                          : "text-gray-900"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
            <div className="flex space-x-2">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-12 h-12 text-red-500"
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
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Veri Yükleme Hatası
      </h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue-dark transition-colors duration-200"
      >
        Yeniden Dene
      </button>
    </div>
  );

  const ProductCard = ({ product }: { product: LocalProduct }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={selectedProducts.includes(product._id)}
            onChange={() => handleProductSelect(product._id)}
            className="rounded border-gray-300 text-blue focus:ring-blue"
          />
        </div>

        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={getImageUrl(
                  sortProductImages(product.images)[0]?.url ||
                    product.images[0].url
                )}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {product.category?.name || "N/A"}
              </span>
              <span className="text-gray-500">SKU: {product.sku || "N/A"}</span>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{product.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {product.salePrice ? (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red text-sm">
                      {formatPrice(product.salePrice, product.currency)}
                    </span>
                    <span className="text-gray-500 line-through text-xs">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 text-sm">
                    {formatPrice(product.price, product.currency)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-medium ${
                    product.stock <= 0
                      ? "text-red-600"
                      : product.stock <= 5
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  Stok: {product.stock}
                </span>

                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                    product.status === "active"
                      ? "bg-green-100 text-green-700"
                      : product.status === "inactive"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {product.status === "active"
                    ? "Aktif"
                    : product.status === "inactive"
                    ? "Pasif"
                    : "Taslak"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => handleOpenVariantModal(product)}
                className="inline-flex items-center justify-center p-2 bg-green text-white text-xs rounded hover:bg-green-dark transition-colors duration-200"
                title="Varyant Yönetimi"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h8a2 2 0 002-2V7a2 2 0 00-2-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  setEditProduct(product);
                  const sortedImages = sortProductImages(product.images || []);
                  const mainImageIndex = sortedImages.findIndex(
                    (img) => img.isMain || img.isPrimary
                  );
                  setSelectedMainImageIndex(
                    mainImageIndex >= 0 ? mainImageIndex : 0
                  );
                  setNewImages([]);
                  setImagePreviewUrls([]);
                  setDeletedImageIds([]);
                  setNewTags([]);
                  setNewTagInput("");
                }}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue text-white text-xs rounded hover:bg-blue-dark transition-colors duration-200"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Düzenle
              </button>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                disabled={deleteLoading === product._id}
                className="inline-flex items-center justify-center p-2 bg-red text-white text-xs rounded hover:bg-red-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading === product._id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                ) : (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full max-w-none xl:max-w-[770px] bg-white rounded-xl shadow-1">
        <div className="p-4 sm:p-6 xl:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-none xl:max-w-[770px] bg-white rounded-xl shadow-1">
        <div className="p-4 sm:p-6 xl:p-10">
          <ErrorState />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none xl:max-w-[770px] bg-white rounded-xl shadow-1">
      <div className="p-4 sm:p-6 xl:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="font-medium text-xl sm:text-2xl text-dark">
            Ürün Yönetimi
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-sm text-gray-500">
              Toplam: {filteredAndSearchedProducts.length} ürün
            </span>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Ürün adı, açıklama, SKU veya etiketlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium text-dark whitespace-nowrap">
                Kategori:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto rounded-md border border-gray-300 bg-white py-2 px-3 text-sm outline-none duration-200 focus:border-blue focus:shadow-input focus:ring-2 focus:ring-blue/20"
              >
                <option value="all">Tüm Kategoriler ({products.length})</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} ({getCategoryProductCount(category._id)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredAndSearchedProducts.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-sm">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedProducts.length ===
                        filteredAndSearchedProducts.length &&
                      filteredAndSearchedProducts.length > 0
                    }
                    onChange={(e) =>
                      e.target.checked ? handleSelectAll() : handleDeselectAll()
                    }
                    className="rounded border-gray-300 text-blue focus:ring-blue h-4 w-4"
                  />
                  <span className="text-sm text-dark font-medium">
                    {selectedProducts.length > 0
                      ? `${selectedProducts.length}/${filteredAndSearchedProducts.length} ürün seçili`
                      : "Hepsini seç"}
                  </span>
                </div>

                {selectedProducts.length > 0 && (
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Seçimi Temizle
                  </button>
                )}
              </div>

              <div className="border-t border-blue-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Toplu İşlemler
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    disabled={
                      bulkActionLoading || selectedProducts.length === 0
                    }
                    className="flex items-center px-5 py-2.5 bg-green text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {bulkActionLoading ? "İşleniyor..." : "Aktif Yap"}
                    {selectedProducts.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-green-500 text-xs rounded-full">
                        {selectedProducts.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={
                      bulkActionLoading || selectedProducts.length === 0
                    }
                    className="flex items-center px-5 py-2.5 bg-gray font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {bulkActionLoading ? "İşleniyor..." : "Pasif Yap"}
                    {selectedProducts.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500 text-xs rounded-full">
                        {selectedProducts.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleBulkAction("delete")}
                    disabled={
                      bulkActionLoading || selectedProducts.length === 0
                    }
                    className="flex items-center px-5 py-2.5 bg-red text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {bulkActionLoading ? "İşleniyor..." : "Sil"}
                    {selectedProducts.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">
                        {selectedProducts.length}
                      </span>
                    )}
                  </button>
                </div>

                {selectedProducts.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Toplu işlem yapmak için önce ürün seçin
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {paginatedProducts.length > 0 ? (
          <>
            <div className="lg:hidden space-y-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700 min-w-[1000px]">
                        <div className="col-span-1 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedProducts.length ===
                                filteredAndSearchedProducts.length &&
                              filteredAndSearchedProducts.length > 0
                            }
                            onChange={(e) =>
                              e.target.checked
                                ? handleSelectAll()
                                : handleDeselectAll()
                            }
                            className="rounded border-gray-300 text-blue focus:ring-blue"
                          />
                        </div>
                        <div className="col-span-3">Ürün Bilgileri</div>
                        <div className="col-span-2">Kategori & SKU</div>
                        <div className="col-span-2">Fiyat & Stok</div>
                        <div className="col-span-2">Durum</div>
                        <div className="col-span-2">İşlemler</div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {paginatedProducts.map((product) => (
                        <div
                          key={product._id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="grid grid-cols-12 gap-2 items-center min-w-[1000px]">
                            <div className="col-span-1 flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product._id)}
                                onChange={() =>
                                  handleProductSelect(product._id)
                                }
                                className="rounded border-gray-300 text-blue focus:ring-blue"
                              />
                            </div>

                            <div className="col-span-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                  {product.images &&
                                  product.images.length > 0 ? (
                                    <Image
                                      src={getImageUrl(product.images[0].url)}
                                      alt={product.name}
                                      width={40}
                                      height={40}
                                      className="object-cover w-full h-full"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 flex items-center justify-center">
                                      <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-medium text-dark text-sm truncate"
                                    title={product.name}
                                  >
                                    {product.name}
                                  </p>
                                  <p
                                    className="text-xs text-gray-500 truncate"
                                    title={product.description}
                                  >
                                    {product.description}
                                  </p>
                                  {product.tags && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {product.tags
                                        .slice(0, 1)
                                        .map((tag, index) => (
                                          <span
                                            key={index}
                                            className="px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      {product.tags.length > 1 && (
                                        <span className="text-xs text-gray-500">
                                          +{product.tags.length - 1}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="col-span-2">
                              <div className="text-xs">
                                <p
                                  className="font-medium text-dark truncate"
                                  title={product.category?.name}
                                >
                                  {product.category?.name || "N/A"}
                                </p>
                                <p
                                  className="text-gray-500 truncate"
                                  title={product.sku}
                                >
                                  SKU: {product.sku || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-2">
                              <div className="text-xs">
                                {product.salePrice ? (
                                  <div>
                                    <p className="font-bold text-red">
                                      {formatPrice(
                                        product.salePrice,
                                        product.currency
                                      )}
                                    </p>
                                    <p className="text-gray-500 line-through">
                                      {formatPrice(
                                        product.price,
                                        product.currency
                                      )}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="font-bold text-dark">
                                    {formatPrice(
                                      product.price,
                                      product.currency
                                    )}
                                  </p>
                                )}
                                <p
                                  className={`font-medium ${
                                    product.stock <= 0
                                      ? "text-red-600"
                                      : product.stock <= 5
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  Stok: {product.stock}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-2">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                                  product.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : product.status === "inactive"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {product.status === "active"
                                  ? "Aktif"
                                  : product.status === "inactive"
                                  ? "Pasif"
                                  : "Taslak"}
                              </span>
                            </div>

                            <div className="col-span-2">
                              <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                                <button
                                  onClick={() =>
                                    handleOpenVariantModal(product)
                                  }
                                  className="inline-flex items-center px-1 py-1 bg-green text-white text-xs rounded hover:bg-green-dark transition-colors duration-200"
                                  title="Varyant Yönetimi"
                                >
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h8a2 2 0 002-2V7a2 2 0 00-2-2z"
                                    />
                                  </svg>
                                  Varyant
                                </button>
                                <button
                                  onClick={() => {
                                    setEditProduct(product);
                                    const mainImageIndex =
                                      product.images?.findIndex(
                                        (img) => img.isMain || img.isPrimary
                                      ) || 0;
                                    setSelectedMainImageIndex(
                                      mainImageIndex >= 0 ? mainImageIndex : 0
                                    );
                                    setNewImages([]);
                                    setImagePreviewUrls([]);
                                    setDeletedImageIds([]);
                                    setNewTags([]);
                                    setNewTagInput("");
                                  }}
                                  className="inline-flex items-center px-1 py-1 bg-blue text-white text-xs rounded hover:bg-blue-dark transition-colors duration-200"
                                  title="Ürünü Düzenle"
                                >
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Düzenle
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product._id)
                                  }
                                  disabled={deleteLoading === product._id}
                                  className="inline-flex items-center px-1 py-1 bg-red text-white text-xs rounded hover:bg-red-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Ürünü Sil"
                                >
                                  {deleteLoading === product._id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                  ) : (
                                    <>
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Sil
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Pagination />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {searchTerm ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                )}
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dark mb-2">
              {searchTerm
                ? "Aradığınız kriterlere uygun ürün bulunamadı"
                : selectedCategory === "all"
                ? "Henüz ürün bulunmuyor"
                : "Bu kategoride ürün bulunmuyor"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Farklı anahtar kelimeler deneyebilir veya filtreleri temizleyebilirsiniz."
                : "Yeni ürün ekleyerek başlayın."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue-dark transition-colors duration-200"
              >
                Aramayı Temizle
              </button>
            )}
          </div>
        )}

        {showConfirmModal && pendingAction && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={cancelBulkAction}
            ></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div
                className={`relative w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${
                  showConfirmModal
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0"
                }`}
              >
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        pendingAction.action === "delete"
                          ? "bg-red-100"
                          : pendingAction.action === "activate"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {pendingAction.action === "delete" ? (
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      ) : pendingAction.action === "activate" ? (
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray leading-tight">
                        {pendingAction.action === "delete"
                          ? pendingAction.isSingle
                            ? "Ürünü Sil"
                            : "Ürünleri Sil"
                          : pendingAction.action === "activate"
                          ? pendingAction.isSingle
                            ? "Ürünü Aktif Yap"
                            : "Ürünleri Aktif Yap"
                          : pendingAction.isSingle
                          ? "Ürünü Pasif Yap"
                          : "Ürünleri Pasif Yap"}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {pendingAction.isSingle ? (
                        <>
                          Bu ürünü{" "}
                          <span className="font-medium text-gray-900">
                            {pendingAction.action === "delete"
                              ? "kalıcı olarak silmek"
                              : pendingAction.action === "activate"
                              ? "aktif duruma getirmek"
                              : "pasif duruma getirmek"}
                          </span>{" "}
                          istediğinizden emin misiniz?
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-900">
                            {pendingAction.productIds.length} ürünü
                          </span>{" "}
                          <span className="font-medium text-gray-900">
                            {pendingAction.action === "delete"
                              ? "kalıcı olarak silmek"
                              : pendingAction.action === "activate"
                              ? "aktif duruma getirmek"
                              : "pasif duruma getirmek"}
                          </span>{" "}
                          istediğinizden emin misiniz?
                        </>
                      )}
                    </p>

                    {pendingAction.action === "delete" && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <svg
                          className="w-5 h-5 text-red-600 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <p className="text-sm font-medium text-red-800">
                          Bu işlem geri alınamaz!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={cancelBulkAction}
                      disabled={
                        pendingAction.isSingle
                          ? deleteLoading !== null
                          : bulkActionLoading
                      }
                      className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      İptal
                    </button>

                    <button
                      type="button"
                      onClick={confirmBulkAction}
                      disabled={
                        pendingAction.isSingle
                          ? deleteLoading !== null
                          : bulkActionLoading
                      }
                      className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        pendingAction.action === "delete"
                          ? "bg-red hover:bg-red-600 focus:ring-red-500 text-white"
                          : pendingAction.action === "activate"
                          ? "bg-green hover:bg-green-600 focus:ring-green-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-900"
                      }`}
                    >
                      {(
                        pendingAction.isSingle
                          ? deleteLoading !== null
                          : bulkActionLoading
                      ) ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className={`animate-spin -ml-1 mr-2 h-4 w-4 ${
                              pendingAction.action === "deactivate"
                                ? "text-gray-900"
                                : "text-white"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          İşleniyor...
                        </div>
                      ) : pendingAction.action === "delete" ? (
                        "Sil"
                      ) : pendingAction.action === "activate" ? (
                        "Aktif Yap"
                      ) : (
                        "Pasif Yap"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showVariantModal && selectedProductForVariant && (
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={handleCloseVariantModal}
            ></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Varyant Yönetimi - {selectedProductForVariant.name}
                    </h3>
                    <button
                      onClick={handleCloseVariantModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Mevcut Varyantlar
                      </h4>
                      {selectedProductForVariant.variants &&
                      selectedProductForVariant.variants.length > 0 ? (
                        <div className="space-y-3">
                          {selectedProductForVariant.variants.map(
                            (variant, index) => (
                              <div
                                key={variant._id || index}
                                className="border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 flex-1">
                                    {variant.image && (
                                      <div className="flex-shrink-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                          <Image
                                            src={getImageUrl(variant.image)}
                                            alt={variant.name}
                                            width={64}
                                            height={64}
                                            className="object-cover w-full h-full"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900">
                                        {variant.name}
                                      </h5>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {variant.options.map(
                                          (option, optIndex) => (
                                            <span
                                              key={optIndex}
                                              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                                            >
                                              {option.name}: {option.value}
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <div className="mt-2 text-sm text-gray-600">
                                        <span className="mr-4">
                                          SKU: {variant.sku}
                                        </span>
                                        <span className="mr-4">
                                          Stok: {variant.stock}
                                        </span>
                                        {variant.price && (
                                          <span>
                                            Fiyat: {formatPrice(variant.price)}
                                          </span>
                                        )}
                                        {variant.isDefault && (
                                          <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                            Varsayılan
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <button
                                      onClick={() =>
                                        handleEditVariant(index, variant)
                                      }
                                      className="p-2 text-blue hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                      title="Varyantı Düzenle"
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
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteVariant(index, variant)
                                      }
                                      className="p-2 text-red hover:bg-red-50 rounded-lg transition-colors duration-200"
                                      title="Varyantı Sil"
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
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          <h5 className="text-lg font-medium text-gray-900 mb-2">
                            Henüz varyant yok
                          </h5>
                          <p className="text-gray-500">
                            Bu ürün için henüz varyant eklenmemiş
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Yeni Varyant Ekle
                      </h4>
                      <button
                        onClick={handleOpenAddVariantModal}
                        className="inline-flex items-center px-4 py-2 bg-green text-white text-sm rounded-lg hover:bg-green-dark transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Yeni Varyant Ekle
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={handleCloseVariantModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddVariantModal && selectedProductForVariant && (
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={handleCloseAddVariantModal}
            ></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingVariant ? "Varyant Düzenle" : "Yeni Varyant Ekle"}{" "}
                      - {selectedProductForVariant.name}
                    </h3>
                    <button
                      onClick={handleCloseAddVariantModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Varyant Adı *
                      </label>
                      <input
                        type="text"
                        value={newVariant.name}
                        onChange={(e) =>
                          setNewVariant((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Örn: T-Shirt Kırmızı"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Varyant Seçenekleri *
                      </label>
                      <div className="space-y-3">
                        {newVariant.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="text"
                              value={option.name}
                              onChange={(e) =>
                                updateVariantOption(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Seçenek adı (örn: Renk)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none text-sm"
                            />
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) =>
                                updateVariantOption(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              placeholder="Seçenek değeri (örn: Kırmızı)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none text-sm"
                            />
                            {newVariant.options.length > 1 && (
                              <button
                                onClick={() => removeVariantOption(index)}
                                className="p-2 text-red hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Seçeneği Kaldır"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addVariantOption}
                          className="inline-flex items-center px-3 py-2 text-sm text-blue border border-blue rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Seçenek Ekle
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={newVariant.sku}
                        onChange={(e) =>
                          setNewVariant((prev) => ({
                            ...prev,
                            sku: e.target.value,
                          }))
                        }
                        placeholder="Örn: TSHIRT2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fiyat
                        </label>
                        <input
                          type="number"
                          value={newVariant.price}
                          onChange={(e) =>
                            setNewVariant((prev) => ({
                              ...prev,
                              price: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          İndirimli Fiyat
                        </label>
                        <input
                          type="number"
                          value={newVariant.salePrice}
                          onChange={(e) =>
                            setNewVariant((prev) => ({
                              ...prev,
                              salePrice: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stok
                      </label>
                      <input
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) =>
                          setNewVariant((prev) => ({
                            ...prev,
                            stock: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Varyant Resmi
                      </label>

                      {variantImagePreview ? (
                        <div className="relative">
                          <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-300">
                            <Image
                              src={variantImagePreview}
                              alt="Varyant önizleme"
                              width={128}
                              height={128}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <button
                            onClick={removeVariantImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red text-white rounded-full flex items-center justify-center hover:bg-red-dark transition-colors duration-200"
                            title="Resmi Kaldır"
                          >
                            <span className="text-white font-bold text-xs">
                              ×
                            </span>
                          </button>

                          <div className="mt-2 text-xs text-gray-500">
                            {editingVariant
                              ? "Mevcut resim - Yeni resim yükleyerek değiştirebilirsiniz"
                              : "Yeni yüklenen resim"}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleVariantImageUpload}
                            className="hidden"
                            id="variant-image-upload"
                          />
                          <label
                            htmlFor="variant-image-upload"
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-12 h-12 text-gray-400 mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">
                                {editingVariant
                                  ? "Varyant resmi yüklemek için tıklayın"
                                  : "Varyant resmi yüklemek için tıklayın"}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                PNG, JPG, JPEG (Maksimum 5MB)
                              </span>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCloseAddVariantModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={
                        editingVariant ? handleUpdateVariant : handleSaveVariant
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-green rounded-lg hover:bg-green-dark transition-colors duration-200"
                    >
                      {editingVariant ? "Varyant Güncelle" : "Varyant Ekle"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteVariantModal && deletingVariant && (
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={cancelDeleteVariant}
            ></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all duration-300">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Varyantı Sil
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-900">
                        &ldquo;{deletingVariant.variant.name}&rdquo;
                      </span>{" "}
                      varyantını kalıcı olarak silmek istediğinizden emin
                      misiniz?
                    </p>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-2">
                          Varyant Detayları:
                        </p>
                        <div className="flex items-center space-x-3">
                          {deletingVariant.variant.image && (
                            <div className="flex-shrink-0">
                                                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <Image
                                src={getImageUrl(
                                  deletingVariant.variant.image
                                )}
                                alt={deletingVariant.variant.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            </div>
                          )}

                          <div className="space-y-1 text-gray-600">
                            <p>
                              <span className="font-medium">SKU:</span>{" "}
                              {deletingVariant.variant.sku}
                            </p>
                            <p>
                              <span className="font-medium">Stok:</span>{" "}
                              {deletingVariant.variant.stock}
                            </p>
                            {deletingVariant.variant.price && (
                              <p>
                                <span className="font-medium">Fiyat:</span>{" "}
                                {formatPrice(deletingVariant.variant.price)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-red-800">
                        Bu işlem geri alınamaz!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelDeleteVariant}
                      className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      İptal
                    </button>

                    <button
                      type="button"
                      onClick={confirmDeleteVariant}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-red rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                    >
                      Varyantı Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {editProduct && (
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={() => {
                setEditProduct(null);
                clearImageStates();
              }}
            ></div>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Ürünü Düzenle
                    </h3>
                    <button
                      onClick={() => {
                        setEditProduct(null);
                        clearImageStates();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <form
                  id="edit-product-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProduct();
                  }}
                >
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {editProduct.images && editProduct.images.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Ürün Resimleri
                          </label>

                          <div className="flex justify-center mb-4">
                            <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-500 relative">
                              {(() => {
                                const availableImages =
                                  editProduct.images.filter(
                                    (img) =>
                                      !deletedImageIds.includes(img._id || "")
                                  );
                                const sortedImages =
                                  sortProductImages(availableImages);
                                const currentImage =
                                  sortedImages[selectedMainImageIndex] ||
                                  sortedImages[0];
                                return currentImage ? (
                                  <img
                                    src={getImageUrl(currentImage.url)}
                                    alt={editProduct.name}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/images/products/default.png';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                      <svg
                                        className="w-12 h-12 text-gray-400 mx-auto mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <p className="text-xs text-gray-500">
                                        Resim yok
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}
                              <div className="absolute top-2 left-2">
                                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                  Ana Resim
                                </div>
                              </div>
                            </div>
                          </div>

                          {editProduct.images.filter(
                            (img) => !deletedImageIds.includes(img._id || "")
                          ).length >= 1 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">
                                Ana resim seçmek için resme tıklayın veya silmek
                                için hover yapıp × butonuna tıklayın:
                              </p>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {sortProductImages(
                                  editProduct.images.filter(
                                    (img) =>
                                      !deletedImageIds.includes(img._id || "")
                                  )
                                ).map((image, index) => (
                                  <div
                                    key={image._id || index}
                                    className="relative group"
                                  >
                                    <div
                                      className={`w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                                        selectedMainImageIndex === index
                                          ? "border-blue-500 ring-2 ring-blue-200"
                                          : "border-gray-300 hover:border-blue-400"
                                      }`}
                                      onClick={() => {
                                        setSelectedMainImageIndex(index);
                                        toast.success(
                                          `Ana resim olarak seçildi: Resim ${
                                            index + 1
                                          }`
                                        );
                                      }}
                                      title={`Ana resim olarak seç - Resim ${
                                        index + 1
                                      }`}
                                    >
                                      <Image
                                        src={getImageUrl(image.url)}
                                        alt={`${editProduct.name} - ${
                                          index + 1
                                        }`}
                                        width={64}
                                        height={64}
                                        className="object-cover w-full h-full"
                                      />

                                      {selectedMainImageIndex === index && (
                                        <div className="absolute top-1 right-1">
                                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg
                                              className="w-2.5 h-2.5 text-white"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      )}

                                      <div className="absolute bottom-1 left-1">
                                        <div className="bg-black bg-opacity-60 text-white px-1.5 py-0.5 rounded text-xs">
                                          {index + 1}
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeExistingImage(
                                          image._id || "",
                                          `Resim ${index + 1}`
                                        );
                                      }}
                                      className="absolute -top-1 -right-1 w-5 h-5 bg-red text-white rounded-full flex items-center justify-center hover:bg-red transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg z-10"
                                      title="Resmi Sil"
                                    >
                                      <span className="text-white font-bold text-xs leading-none">
                                        ×
                                      </span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Yeni Resim Ekle
                            </label>

                            <div
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200"
                              onDragOver={handleDragOver}
                              onDragEnter={handleDragEnter}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                              />
                              <label
                                htmlFor="image-upload"
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col items-center">
                                  <svg
                                    className="w-12 h-12 text-gray-400 mb-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">
                                    Resim yüklemek için tıklayın
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    veya resimlerinizi buraya sürükleyin
                                  </span>
                                  <span className="text-xs text-gray-400 mt-2">
                                    PNG, JPG, JPEG (Maksimum 5MB)
                                  </span>
                                </div>
                              </label>
                            </div>

                            {newImages.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Yeni Yüklenen Resimler ({newImages.length})
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                  {imagePreviewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-300">
                                        <Image
                                          src={url}
                                          alt={`Yeni resim ${index + 1}`}
                                          width={64}
                                          height={64}
                                          className="object-cover w-full h-full"
                                        />
                                      </div>

                                      <button
                                        onClick={() => removeNewImage(index)}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red text-white rounded-full flex items-center justify-center hover:bg-red transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg z-10"
                                        title="Resmi Kaldır"
                                      >
                                        <span className="text-white font-bold text-xs leading-none">
                                          ×
                                        </span>
                                      </button>

                                      <div className="absolute bottom-1 left-1">
                                        <div className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                                          YENİ
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {deletedImageIds.length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <svg
                                  className="w-4 h-4 text-red-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-red-800">
                                  Silinecek Resimler ({deletedImageIds.length})
                                </span>
                              </div>
                              <p className="text-xs text-red-700">
                                {deletedImageIds.length} resim kalıcı olarak
                                silinecek. Bu işlem &quot;Kaydet&quot; butonuna
                                bastığınızda gerçekleşecek.
                              </p>
                              <button
                                onClick={() => {
                                  setDeletedImageIds([]);
                                  toast.success("Silme listesi temizlendi");
                                }}
                                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                              >
                                Silme listesini temizle
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ürün Adı
                          </label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={editProduct.name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SKU
                          </label>
                          <input
                            type="text"
                            name="sku"
                            defaultValue={editProduct.sku}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fiyat
                          </label>
                          <input
                            type="number"
                            name="price"
                            defaultValue={editProduct.price}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stok
                          </label>
                          <input
                            type="number"
                            name="stock"
                            defaultValue={editProduct.stock}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategori
                          </label>
                          <select
                            name="category"
                            defaultValue={editProduct.category._id}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                          >
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durum
                          </label>
                          <select
                            name="status"
                            defaultValue={editProduct.status}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                          >
                            <option value="active">Aktif</option>
                            <option value="inactive">Pasif</option>
                            <option value="draft">Taslak</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Açıklama
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={editProduct.description}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiketler
                        </label>

                        {editProduct.tags && editProduct.tags.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">
                              Mevcut Etiketler:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {editProduct.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="group relative px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full cursor-pointer hover:bg-blue-200 transition-colors duration-200"
                                >
                                  {tag}
                                  <button
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `"${tag}" etiketini silmek istediğinizden emin misiniz?`
                                        )
                                      ) {
                                        toast.success("Etiket kaldırıldı");
                                      }
                                    }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg z-10"
                                    title="Etiketi Sil"
                                  >
                                    <span className="text-white font-bold text-xs leading-none">
                                      ×
                                    </span>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {newTags.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">
                              Yeni Etiketler:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {newTags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="group relative px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                                >
                                  {tag}
                                  <button
                                    onClick={() => removeNewTag(tag)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg z-10"
                                    title="Etiketi Kaldır"
                                  >
                                    <span className="text-white font-bold text-xs leading-none">
                                      ×
                                    </span>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyPress={handleTagInputKeyPress}
                            placeholder="Yeni etiket ekle..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none text-sm"
                          />
                          <button
                            onClick={addNewTag}
                            disabled={!newTagInput.trim()}
                            className="px-4 py-2 bg-blue text-white text-sm rounded-lg hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setEditProduct(null);
                        clearImageStates();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      form="edit-product-form"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue rounded-lg hover:bg-blue-dark transition-colors duration-200"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageProducts;
