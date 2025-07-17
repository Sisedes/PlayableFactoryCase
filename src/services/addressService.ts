import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  title: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressFormData {
  type: 'home' | 'work' | 'other';
  title: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}


export const getUserAddresses = async (token: string): Promise<ApiResponse<Address[]>> => {
  try {
    const response = await axios.get(`${API_URL}/api/users/addresses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Get addresses error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Adresler getirilemedi'
    };
  }
};


export const addAddress = async (addressData: AddressFormData, token: string): Promise<ApiResponse<Address>> => {
  try {
    const response = await axios.post(`${API_URL}/api/users/addresses`, addressData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Add address error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Adres eklenirken hata oluştu'
    };
  }
};


export const updateAddress = async (
  addressId: string, 
  addressData: Partial<AddressFormData>, 
  token: string
): Promise<ApiResponse<Address>> => {
  try {
    const response = await axios.put(`${API_URL}/api/users/addresses/${addressId}`, addressData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Update address error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Adres güncellenirken hata oluştu'
    };
  }
};


export const deleteAddress = async (addressId: string, token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.delete(`${API_URL}/api/users/addresses/${addressId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Delete address error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Adres silinirken hata oluştu'
    };
  }
};


export const setDefaultAddress = async (addressId: string, token: string): Promise<ApiResponse<Address>> => {
  try {
    const response = await axios.put(`${API_URL}/api/users/addresses/${addressId}/default`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Set default address error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Varsayılan adres güncellenirken hata oluştu'
    };
  }
}; 