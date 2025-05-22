import axiosInstance from '../axios-config';

// Define types for clarity
interface Address {
  id: string;
  address: string;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  profileImageUrl: string | null;
  locationId: string | null;
  location: string | null;
  Address: Address[];
  updatedAt: string;
}

export const UserDeatilesApi = {
  // Get user's saved addresses
  getUserAddress: async () => {
    try {
      const response = await axiosInstance.get(`/orders/ordersAddress`);
      return { data: { stores: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Get user profile details
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get(`/auth/userDetails`);
      console.log('User profile response:===>', response.data);
      return { data: { user: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateUserProfileData: async (
    userId: string,
    profileData: Partial<UserProfile>
  ) => {
    try {
      const response = await axiosInstance.put(
        `/auth/user/${userId}`,
        profileData
      );
      return { data: { user: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Add a new address
  addAddress: async (address: Omit<Address, 'id'>) => {
    try {
      const response = await axiosInstance.post(`/auth/address`, address);
      return { data: { address: response.data.data } };
    } catch (error) {
      throw error;
    }
  },
  updateUserAddress: async (
    addressId: string,
    profileData: Partial<UserProfile>
  ) => {
    try {
      const response = await axiosInstance.put(
        `/auth/address/${addressId}`,
        profileData
      );
      return { data: { user: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Delete an address
  deleteAddress: async (addressId: string) => {
    try {
      const response = await axiosInstance.delete(`/auth/address/${addressId}`);
      console.log('Delete address response:===>', response.data);
      return { data: { success: true, response } };
    } catch (error) {
      throw error;
    }
  },
};
