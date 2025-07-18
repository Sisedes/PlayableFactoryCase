import { IProductVariant } from '@/components/ProductVariations/VariationModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface VariationResponse {
  success: boolean;
  message: string;
  data?: {
    productName: string;
    variants: IProductVariant[];
  };
}

export const getProductVariants = async (
  productId: string, 
  accessToken: string
): Promise<VariationResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/products/${productId}/variants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get product variants error:', error);
    return {
      success: false,
      message: 'Varyasyonlar getirilirken hata oluştu'
    };
  }
};

export const updateProductVariants = async (
  productId: string,
  variants: IProductVariant[],
  accessToken: string,
  variantImages?: { [key: string]: File }
): Promise<VariationResponse> => {
  try {
    console.log('=== FRONTEND VARIANT UPDATE DEBUG ===');
    console.log('Product ID:', productId);
    console.log('Variants count:', variants.length);
    console.log('Variant images:', variantImages);
    
    const formData = new FormData();
    
    formData.append('variants', JSON.stringify(variants));
    
    if (variantImages) {
      console.log('Adding variant images to FormData...');
      Object.entries(variantImages).forEach(([variantIndex, file]) => {
        const fieldName = `variant-${variantIndex}`;
        console.log(`Adding ${fieldName}:`, file.name, file.size, file.type);
        formData.append(fieldName, file);
      });
    } else {
      console.log('No variant images to add');
    }

    console.log('FormData entries:');
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      console.log(`${key}:`, typeof value === 'string' ? value.substring(0, 100) + '...' : value);
    });

    const response = await fetch(`${API_URL}/api/products/${productId}/variants`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log('Response:', data);
    console.log('=== END FRONTEND VARIANT UPDATE DEBUG ===');
    return data;
  } catch (error) {
    console.error('Update product variants error:', error);
    return {
      success: false,
      message: 'Varyasyonlar güncellenirken hata oluştu'
    };
  }
};

export const updateVariantStock = async (
  productId: string,
  variantId: string,
  data: { newStock: number; reason?: string; notes?: string },
  accessToken: string
): Promise<VariationResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/products/${productId}/variants/${variantId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Update variant stock error:', error);
    return {
      success: false,
      message: 'Varyasyon stoku güncellenirken hata oluştu'
    };
  }
}; 