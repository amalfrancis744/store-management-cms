import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserDeatilesApi } from '@/api/customer/getUser-api';

// Define types for user profile and address
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

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  globalError: string | null; // Added globalError property
}
const initialState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  globalError: null, // Initialize globalError
};

// Async thunk to fetch user profile details
export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserDeatilesApi.getUserProfile(); // Assumes authAPI.getCurrentUser() maps to /api/v1/auth/userDetails
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk(
  'userProfile/updateUserProfile',
  async (
    {
      userId,
      profileData,
    }: { userId: string; profileData: Partial<UserProfile> },
    { rejectWithValue }: { rejectWithValue: (value: any) => void }
  ) => {
    try {
      const response = await UserDeatilesApi.updateUserProfileData(
        userId,
        profileData
      ); // Assumes API endpoint for updating profile
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user profile'
      );
    }
  }
);

export const updateUserProfileImage = createAsyncThunk(
  'userProfile/updateUserProfileImage',
  async (imageData: string, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await delay(1200);

      // In a real app, you would upload to a server
      const state = getState() as { userProfile: UserProfileState };

      if (!state.userProfile.profile) {
        return rejectWithValue('Profile not found');
      }

      return {
        ...state.userProfile.profile,
        profileImageUrl: imageData,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue('Failed to update profile image');
    }
  }
);

// Async thunk to add a new address
export const updateUserAddress = createAsyncThunk(
  'userProfile/updateUserAddress',
  async (
    {
      addressId,
      addressData,
    }: { addressId: string; addressData: Partial<UserProfile> },
    { rejectWithValue }
  ) => {
    try {
      const response = await UserDeatilesApi.updateUserAddress(
        addressId,
        addressData
      );
      return response.data.user; // or response.data.address depending on API structure
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update address'
      );
    }
  }
);
export const addUserAddress = createAsyncThunk(
  'userProfile/addUserAddress',
  async (address: Omit<Address, 'id'>, { rejectWithValue }) => {
    try {
      const response = await UserDeatilesApi.addAddress(address); // Assumes API endpoint for adding address
      return response.data.address; // Expecting the new address with ID
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add address'
      );
    }
  }
);

// Async thunk to delete an address
export const deleteUserAddress = createAsyncThunk(
  'userProfile/deleteUserAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      await UserDeatilesApi.deleteAddress(addressId); // Assumes API endpoint for deleting address
      return addressId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete address'
      );
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearProfileErrors: (state) => {
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Profile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload.user;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update User Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = {
        ...state.profile,
        ...action.payload?.user,
      } as UserProfile;
      state.error = null;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add User Address
    builder.addCase(addUserAddress.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addUserAddress.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.profile) {
        state.profile.Address = [...state.profile.Address, action.payload];
      }
      state.error = null;
    });
    builder.addCase(addUserAddress.rejected, (state, action) => {
      state.isLoading = false;
      state.globalError = action.payload as string;
    });

    // Delete User Address
    builder.addCase(deleteUserAddress.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteUserAddress.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.profile) {
        state.profile.Address = state.profile.Address.filter(
          (address) => address.id !== action.payload
        );
      }
      state.error = null;
    });
    builder.addCase(deleteUserAddress.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProfileErrors, setProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;

function delay(arg0: number) {
  throw new Error('Function not implemented.');
}
